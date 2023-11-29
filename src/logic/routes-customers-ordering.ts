import axios from 'axios';
import getenv from 'getenv';
import debug from 'debug';
import Salesman from './salesman';

const Debug = debug('anywize:routes-ordering');
const MAPBOX_API_ACCESS_TOKEN = getenv('ANYWIZE_MAPBOX_API_ACCESS_TOKEN');

type SolutionPoint = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

const matrix = async (customers) => {
  try {
    const coordinates = customers.reduce((acc, cur) => {
      return `${acc ? `${acc};` : ""}${cur.longitude},${cur.latitude}`;
    }, '');
    Debug(coordinates);
    const { data } = await axios.get(
      `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coordinates}`,
      {
        params: {
          access_token: MAPBOX_API_ACCESS_TOKEN,
          annotations: 'distance'
        },
        headers: {
          Accept: 'application/json'
        }
      }
    );

    Debug(data?.distances);

    return data;
  } catch (err) {
    Debug('Failed to get matrix from mapbox');
    Debug(err.message);

    throw err;
  }
};

const orderBySalesman = (start: SolutionPoint, customers: SolutionPoint[]): SolutionPoint[] => {
  const points = [
    new Salesman.Point(start.longitude, start.latitude, 0, "Start"),
    ...customers.map(
      (customer) =>
        new Salesman.Point(
          customer.longitude,
          customer.latitude,
          customer.id,
          customer.name
        )
    )
  ];

  const solution = Salesman.solve(points);
  const ordered_points = solution.map((i) => points[i]);

  return ordered_points.map((p) => p.toJSON());
};

const solveWithMatrixSimple = async (start: SolutionPoint, customers: SolutionPoint[]): Promise<SolutionPoint[]> => {
  const res = await matrix([start].concat(customers));

  const points = [
    new Salesman.Point(start.longitude, start.latitude, 0, "Start"),
    ...customers.map(
      (customer) =>
        new Salesman.Point(
          customer.longitude,
          customer.latitude,
          customer.id,
          customer.name
        )
    )
  ];
  const solution = Salesman.solveWithManualDistances(points, res.distances);

  const ordered_points = solution.map((i) => points[i]);

  return ordered_points.map((p) => p.toJSON());
};

const solveWithMatrixMultiple = async (start: SolutionPoint, customers: SolutionPoint[]): Promise<SolutionPoint[]> => {
  const salesmanOrdered = orderBySalesman(start, customers);
  const sets = [];

  for (let i = 0; i < salesmanOrdered.length; i += 24) {
    const points = salesmanOrdered.slice(i, i + 24);

    sets.push(points);
  }

  const results = await Promise.all(
    sets.map((set, i) => {
      return matrix(set).then((res) => res.distances);
    })
  );

  return results.reduce((acc, distances, i) => {
    const points = [
      ...sets[i].map(
        (customer) =>
          new Salesman.Point(
            customer.longitude,
            customer.latitude,
            customer.id || 0,
            customer.name || "Start"
          )
      )
    ];
    const solution = Salesman.solveWithManualDistances(points, distances);

    const ordered_points = solution.map((i) => points[i]);

    return acc.concat(ordered_points.map((p) => p.toJSON()));
  }, []);
};

const solveWithMatrix = async (start: SolutionPoint, customers: SolutionPoint[]): Promise<SolutionPoint[]> => {
  if (customers.length < 2) {
    return customers;
  }

  if (process.env.NODE_ENV === 'test' ||process.env.NODE_ENV === 'development') {
    return orderBySalesman(start, customers);
  }

  if (customers.length < 25) {
    return solveWithMatrixSimple(start, customers);
  }

  return solveWithMatrixMultiple(start, customers);
};

export default {
  orderBySalesman,
  solveWithMatrixMultiple,
  solveWithMatrixSimple,
  solveWithMatrix,
};
