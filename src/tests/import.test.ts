import 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import CustomersLogic from '../logic/customers';
import Helper from './_helper';
import models from '../models';

const { request } = Helper;

describe('Import tests', () => {
  let supplier: Supplier;
  let transportAgent: TransportAgent;

  before(async () => {
    supplier = await Helper.createSupplier(true, {
      number: '199',
    });
    transportAgent = await Helper.createTransportAgent();
  });

  it('Should import and do the neccesary actions with the received data', async () => {
    const spy = sinon.stub(CustomersLogic, 'geocode').callsFake(() => Promise.resolve({
      coordinates: {
        type: 'Point',
        coordinates: [1, 0],
      },
    }));

    let res = await request
      .post('/api/import')
      .send({
        "Lieferanten_ID": "199",
        "ID_Tour": "11",
        "Tour_Name": "Tour 01 Gelb",
        "LieferDatum": "06.12.2021",
        "Abfahrt": "Morgens",
        "erstelltAm": "06.12.2021 08:54:52",
        "Kontakte": [
          {
            "ID_Kontakte": "2314",
            "Firma": "Ley Automobile",
            "PLZ": "79618",
            "Ort": "Rheinfelden",
            "Strasse": "Schaffmatt 1",
            "Hausnummer": "",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00",
          },
          {
            "ID_Kontakte": "2321",
            "Firma": "Amthor",
            "PLZ": "79664",
            "Ort": "Wehr",
            "Strasse": "Öflingerstr. 123",
            "Hausnummer": "",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00"
          }
        ],
        "Versender": [
          {
            "ID_Versender": "2",
            "Name_Versender": "Kestenholz"
          },
          {
            "ID_Versender": "3",
            "Name_Versender": "Maertin GmbH"
          },
          {
            "ID_Versender": "1",
            "Name_Versender": "Schmolck"
          },
          {
            "ID_Versender": "17",
            "Name_Versender": "Schmolck02"
          },
          {
            "ID_Versender": "18",
            "Name_Versender": "Schmolck03"
          },
          {
            "ID_Versender": "19",
            "Name_Versender": "Schmolck04"
          }
        ],
        "Lieferungen": [
          {
            "tbl_Lieferung.ID_Lieferung": "94799",
            "Lieferscheinnummer": "466738",
            "Packstuecke": "1",
            "FRD_ID_Versender": "3",
            "FRD_ID_Kontakte": "2314",
            "erstelltAm": "05.12.2021 18:00:00",
          },
          {
            "tbl_Lieferung.ID_Lieferung": "94807",
            "Lieferscheinnummer": "P-354085",
            "Packstuecke": "1",
            "FRD_ID_Versender": "1",
            "FRD_ID_Kontakte": "2321",
            "erstelltAm": "05.12.2021 18:00:00"
          }
        ]
      });

    expect(res.status).equal(200);
    expect(res.body.pathway.length).equal(2);
    expect(res.body.pathway[0].Orders.length).equal(1);
    expect(res.body.pathway[1].Orders.length).equal(1);

    const tour = await models.Tours.findOne({
      where: {
        id: res.body.tour_id,
      },
      raw: true,
    });
    expect(tour.number).equal('11');

    const customerOne = await models.Customers.findOne({
      where: { number: '2314' },
      raw: true,
    });
    expect([
      res.body.pathway[1].id, res.body.pathway[0].id
    ].includes(customerOne.id)).equal(true);
    expect(customerOne.coordinates).eql({
      type: 'Point',
      coordinates: [1, 0],
    });

    const customerTwo = await models.Customers.findOne({
      where: { number: '2321' },
      raw: true,
    });
    expect([
      res.body.pathway[1].id, res.body.pathway[0].id
    ].includes(customerTwo.id)).equal(true);
    expect(customerTwo.coordinates).eql({
      type: 'Point',
      coordinates: [1, 0],
    });

    res = await request
      .post('/api/import')
      .send({
        "Lieferanten_ID": "199",
        "ID_Tour": "11",
        "Tour_Name": "Tour 01 Gelb",
        "LieferDatum": "06.12.2021",
        "Abfahrt": "Morgens",
        "erstelltAm": "06.12.2021 08:54:52",
        "Kontakte": [
          {
            "ID_Kontakte": "2314",
            "Firma": "Ley Automobile",
            "PLZ": "79618",
            "Ort": "Rheinfelden",
            "Strasse": "Schaffmatt 1",
            "Hausnummer": "",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00",
          },
          {
            "ID_Kontakte": "2321",
            "Firma": "Amthor",
            "PLZ": "79664",
            "Ort": "Wehr",
            "Strasse": "Öflingerstr. 123",
            "Hausnummer": "",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00"
          }
        ],
        "Versender": [
          {
            "ID_Versender": "2",
            "Name_Versender": "Kestenholz"
          },
          {
            "ID_Versender": "3",
            "Name_Versender": "Maertin GmbH"
          },
          {
            "ID_Versender": "1",
            "Name_Versender": "Schmolck"
          },
          {
            "ID_Versender": "17",
            "Name_Versender": "Schmolck02"
          },
          {
            "ID_Versender": "18",
            "Name_Versender": "Schmolck03"
          },
          {
            "ID_Versender": "19",
            "Name_Versender": "Schmolck04"
          }
        ],
        "Lieferungen": [
          {
            "tbl_Lieferung.ID_Lieferung": "94799",
            "Lieferscheinnummer": "466738",
            "Packstuecke": "1",
            "FRD_ID_Versender": "3",
            "FRD_ID_Kontakte": "2314",
            "erstelltAm": "05.12.2021 18:00:00",
          },
          {
            "tbl_Lieferung.ID_Lieferung": "94807",
            "Lieferscheinnummer": "P-354085",
            "Packstuecke": "1",
            "FRD_ID_Versender": "1",
            "FRD_ID_Kontakte": "2321",
            "erstelltAm": "05.12.2021 18:00:00"
          }
        ]
      });

    expect(res.status).equal(200);
    expect(res.body.tour_id).equal(tour.id);
    expect([
      res.body.pathway[1].id, res.body.pathway[0].id
    ].includes(customerOne.id)).equal(true);
    expect([
      res.body.pathway[1].id, res.body.pathway[0].id
    ].includes(customerTwo.id)).equal(true);

    expect(spy.callCount).equal(2);
    spy.restore();
  });

  it('Import Tour_12_Morgens bug 12-01-2022', async () => {
    const spy = sinon.stub(CustomersLogic, 'geocode').callsFake(() => Promise.resolve({
      coordinates: {
        type: 'Point',
        coordinates: [1, 0],
      },
    }));

    let res = await request
      .post('/api/import')
      .send({
        "Lieferanten_ID": "199",
        "ID_Tour": " 12",
        "Tour_Name": "Tour 02 Rot",
        "LieferDatum": "12.01.2022",
        "Abfahrt": "Morgens",
        "erstelltAm": "12.01.2022 08:48:20",
        "Kontakte": [
          {
            "ID_Kontakte": "1858",
            "Firma": "Wursthorn Autohaus GmbH",
            "PLZ": "79199",
            "Ort": "Kirchzarten",
            "Strasse": "Wilhelm-Schauenberg-Str.",
            "Hausnummer": "1",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00"
          },
          {
            "ID_Kontakte": "2325",
            "Firma": "Bach KFZ-Landmaschinen",
            "PLZ": "79822",
            "Ort": "Titisee-Neustadt",
            "Strasse": "Jostalstr. 26",
            "Hausnummer": "",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00"
          },
          {
            "ID_Kontakte": "2343",
            "Firma": "Henkel Autohaus GmbH",
            "PLZ": "78199",
            "Ort": "Bräunlingen",
            "Strasse": "Kirnbergstr. 2",
            "Hausnummer": "",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00"
          },
          {
            "ID_Kontakte": "2399",
            "Firma": "Roth Nutzfahrzeuge",
            "PLZ": "79848",
            "Ort": "Bonndorf",
            "Strasse": "Eisenbahnstr. 3",
            "Hausnummer": "",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00"
          },
          {
            "ID_Kontakte": "2415",
            "Firma": "Reich Bosch Car Service",
            "PLZ": "79271",
            "Ort": "St. Peter",
            "Strasse": "Jörgleweg 19",
            "Hausnummer": "",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00"
          },
          {
            "ID_Kontakte": "2418",
            "Firma": "Kult GmbH & Co. KG",
            "PLZ": "79254",
            "Ort": "Oberried",
            "Strasse": "Obertalstr. 13",
            "Hausnummer": "",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00"
          },
          {
            "ID_Kontakte": "2487",
            "Firma": "Krissler Autohaus",
            "PLZ": "79848",
            "Ort": "Bonndorf",
            "Strasse": "Lenzkircherstr. 3",
            "Hausnummer": "",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00"
          },
          {
            "ID_Kontakte": "2671",
            "Firma": "Anselm Winterhalter  Spedition & Omnibusverk.",
            "PLZ": "79254",
            "Ort": "Oberried",
            "Strasse": "Im Bühl",
            "Hausnummer": "25",
            "Prioritaet": "999999",
            "erstelltAm": "05.12.2021 18:00:00",
            "geaendertAm": "05.12.2021 18:00:00"
          }
        ],
        "Versender": [
          {
            "ID_Versender": "2",
            "Name_Versender": "Kestenholz"
          },
          {
            "ID_Versender": "3",
            "Name_Versender": "Maertin GmbH"
          },
          {
            "ID_Versender": "1",
            "Name_Versender": "Schmolck"
          },
          {
            "ID_Versender": "17",
            "Name_Versender": "Schmolck02"
          },
          {
            "ID_Versender": "18",
            "Name_Versender": "Schmolck03"
          },
          {
            "ID_Versender": "19",
            "Name_Versender": "Schmolck04"
          }
        ],
        "Lieferungen": [
          {
            "tbl_Lieferung.ID_Lieferung": "97425",
            "Lieferscheinnummer": "471870",
            "Packstuecke": "1",
            "FRD_ID_Versender": "3",
            "FRD_ID_Kontakte": "1858",
            "erstelltAm": "11.01.2022 08:53:54"
          },
          {
            "tbl_Lieferung.ID_Lieferung": "97427",
            "Lieferscheinnummer": "S-314655-314634-314645",
            "Packstuecke": "2",
            "FRD_ID_Versender": "18",
            "FRD_ID_Kontakte": "2415",
            "erstelltAm": "11.01.2022 09:10:37"
          },
          {
            "tbl_Lieferung.ID_Lieferung": "97440",
            "Lieferscheinnummer": "471942",
            "Packstuecke": "1",
            "FRD_ID_Versender": "3",
            "FRD_ID_Kontakte": "2487",
            "erstelltAm": "11.01.2022 10:37:56"
          },
          {
            "tbl_Lieferung.ID_Lieferung": "97444",
            "Lieferscheinnummer": "471934",
            "Packstuecke": "1",
            "FRD_ID_Versender": "3",
            "FRD_ID_Kontakte": "2325",
            "erstelltAm": "11.01.2022 10:44:56"
          },
          {
            "tbl_Lieferung.ID_Lieferung": "97445",
            "Lieferscheinnummer": "P-355161",
            "Packstuecke": "1",
            "FRD_ID_Versender": "1",
            "FRD_ID_Kontakte": "2415",
            "erstelltAm": "11.01.2022 10:53:01"
          },
          {
            "tbl_Lieferung.ID_Lieferung": "97468",
            "Lieferscheinnummer": "6805884/33146",
            "Packstuecke": "1",
            "FRD_ID_Versender": "2",
            "FRD_ID_Kontakte": "2418",
            "erstelltAm": "11.01.2022 13:08:01"
          },
          {
            "tbl_Lieferung.ID_Lieferung": "97479",
            "Lieferscheinnummer": "6805907/33356",
            "Packstuecke": "1",
            "FRD_ID_Versender": "2",
            "FRD_ID_Kontakte": "2671",
            "erstelltAm": "11.01.2022 14:07:04"
          },
          {
            "tbl_Lieferung.ID_Lieferung": "97483",
            "Lieferscheinnummer": "6805918/33146",
            "Packstuecke": "0",
            "FRD_ID_Versender": "2",
            "FRD_ID_Kontakte": "2418",
            "erstelltAm": "11.01.2022 14:13:32"
          },
          {
            "tbl_Lieferung.ID_Lieferung": "97507",
            "Lieferscheinnummer": "472019-472023,472002",
            "Packstuecke": "4",
            "FRD_ID_Versender": "3",
            "FRD_ID_Kontakte": "2343",
            "erstelltAm": "11.01.2022 15:21:40"
          },
          {
            "tbl_Lieferung.ID_Lieferung": "97580",
            "Lieferscheinnummer": "6805984/33534",
            "Packstuecke": "1",
            "FRD_ID_Versender": "2",
            "FRD_ID_Kontakte": "2399",
            "erstelltAm": "12.01.2022 08:25:57"
          }
        ],
      });

    expect(res.status).equal(200);

    expect(res.body.pathway.map((p) => p.number).sort()).eql([
      '1858',
      '2325',
      '2343',
      '2399',
      '2415',
      '2418',
      '2487',
      '2671',
    ].sort());

    const orders = await models.Orders.findAll({
      where: { route_id: res.body.id },
      attributes: ['id', 'number'],
      raw: true,
    });
    expect(orders.length).equal(10);
    expect(orders.map((o) => o.number).sort()).eql([
      '97425',
      '97427',
      '97440',
      '97444',
      '97445',
      '97468',
      '97479',
      '97483',
      '97507',
      '97580',
    ].sort());

    spy.restore();
  });

  it.skip('Import Tour_12_Morgens bug 21-10-2022', async () => {
    /*const spy = sinon.stub(CustomersLogic, 'geocode').callsFake(() => Promise.resolve({
      coordinates: {
        type: 'Point',
        coordinates: [1, 0],
      },
    }));*/

    const data = {
      "Lieferanten_ID": "1",
      "ID_Tour": " 12",
      "Tour_Name": "Tour 02 Rot",
      "LieferDatum": "18.10.2022",
      "Abfahrt": "Morgens",
      "erstelltAm": "20.10.2022 20:19:27",
      "Kontakte": [
        {
          "ID_Kontakte": "1792",
          "Firma": "Stalf GmbH",
          "PLZ": "79117",
          "Ort": "Freiburg",
          "Strasse": "Kapplerstr. 52",
          "Hausnummer": "",
          "Prioritaet": "5029",
          "erstelltAm": "05.12.2021 18:00:00",
          "geaendertAm": "20.05.2022 11:40:09"
        },
        {
          "ID_Kontakte": "1975",
          "Firma": "Rieder 1a Autoservice",
          "PLZ": "79254",
          "Ort": "Oberried",
          "Strasse": "Hauptstr. 72",
          "Hausnummer": "",
          "Prioritaet": "2070",
          "erstelltAm": "05.12.2021 18:00:00",
          "geaendertAm": "07.02.2022 13:54:12"
        },
        {
          "ID_Kontakte": "2325",
          "Firma": "Bach KFZ-Landmaschinen",
          "PLZ": "79822",
          "Ort": "Titisee-Neustadt",
          "Strasse": "Jostalstr. 26",
          "Hausnummer": "",
          "Prioritaet": "2054",
          "erstelltAm": "05.12.2021 18:00:00",
          "geaendertAm": "07.02.2022 13:50:40"
        },
        {
          "ID_Kontakte": "2415",
          "Firma": "Reich Bosch Car Service",
          "PLZ": "79271",
          "Ort": "St. Peter",
          "Strasse": "Jörgleweg 19",
          "Hausnummer": "",
          "Prioritaet": "2060",
          "erstelltAm": "05.12.2021 18:00:00",
          "geaendertAm": "07.02.2022 13:51:58"
        },
        {
          "ID_Kontakte": "3009",
          "Firma": "Thomas Ruf Karosserie- u. Lackierinstand.",
          "PLZ": "79271",
          "Ort": "St. Peter",
          "Strasse": "Jörgleweg",
          "Hausnummer": "17",
          "Prioritaet": "3261",
          "erstelltAm": "05.12.2021 18:00:00",
          "geaendertAm": "07.02.2022 16:27:57"
        }
      ],
      "Versender": [
        { "ID_Versender": "2", "Name_Versender": "Kestenholz" },
        { "ID_Versender": "3", "Name_Versender": "Maertin GmbH" },
        { "ID_Versender": "1", "Name_Versender": "Schmolck" },
        { "ID_Versender": "17", "Name_Versender": "Schmolck02" },
        { "ID_Versender": "18", "Name_Versender": "Schmolck03" },
        { "ID_Versender": "19", "Name_Versender": "Schmolck04" }
      ],
      "Lieferungen": [
        {
          "tbl_Lieferung.ID_Lieferung": "121726",
          "Lieferscheinnummer": "519801",
          "Packstuecke": "1",
          "FRD_ID_Versender": "3",
          "FRD_ID_Kontakte": "1975",
          "erstelltAm": "17.10.2022 10:40:13"
        },
        {
          "tbl_Lieferung.ID_Lieferung": "121737",
          "Lieferscheinnummer": "S-321774-00",
          "Packstuecke": "1",
          "FRD_ID_Versender": "18",
          "FRD_ID_Kontakte": "3009",
          "erstelltAm": "17.10.2022 11:37:27"
        },
        {
          "tbl_Lieferung.ID_Lieferung": "121750",
          "Lieferscheinnummer": "519949",
          "Packstuecke": "1",
          "FRD_ID_Versender": "3",
          "FRD_ID_Kontakte": "2325",
          "erstelltAm": "17.10.2022 12:44:26"
        },
        {
          "tbl_Lieferung.ID_Lieferung": "121782",
          "Lieferscheinnummer": "S-321821-00",
          "Packstuecke": "1",
          "FRD_ID_Versender": "18",
          "FRD_ID_Kontakte": "2415",
          "erstelltAm": "17.10.2022 15:18:54"
        },
        {
          "tbl_Lieferung.ID_Lieferung": "121824",
          "Lieferscheinnummer": "6823425/14441",
          "Packstuecke": "1",
          "FRD_ID_Versender": "2",
          "FRD_ID_Kontakte": "1792",
          "erstelltAm": "18.10.2022 07:30:05"
        }
      ]
    };

    let res = await request
      .post('/api/import')
      .send(data);

    expect(res.status).equal(200);
    expect(res.body.pathway.length).equal(5);
    // spy.restore();
  });

  it('POST /api/import/complete should import the complete stuff', async () => {
    const stub = sinon.stub(CustomersLogic, 'geocode').callsFake(() => Promise.resolve({
      coordinates: {
        type: 'Point',
        coordinates: [10, 11],
      },
    }));

    let res = await request
      .post('/api/import/complete')
      .send({})

    expect(res.status).equal(400);
    expect(res.body.errors).eql({
      supplier_id: '"supplier_id" is required',
      secret: '"secret" is required',
      Tour: '"Tour" is required',
      Customers: '"Customers" is required',
      Orders: '"Orders" is required'
    });

    res = await request
      .post('/api/import/complete')
      .send({
        supplier_id: supplier.number,
        secret: supplier.secret,
        Tour: {
          id: '15123-22',
          name: 'Test tour for import complete',
        },
        Customers: [{
          id: '10-22',
          name: 'Customer I',
          alias: 'Customer I alias',
          street: 'Street Gdo',
          street_number: '1312',
          city: 'BERLIN',
          zipcode: '2930',
          country: 'DE',
          deposit_agreement: 'NONE',
          keybox_code: null,
          latitude: 10.12312,
          longitude: 8.123,
          contact_name: 'Jesus',
          contact_surname: 'Cristo',
          email: 'bla@bla.com',
          phone: '1231231232'
        }, {
          id: '11-22',
          name: 'Customer II',
          alias: 'Customer II alias',
          street: 'Street Gdo',
          street_number: '1312',
          city: 'BERLIN',
          zipcode: '2930',
          country: 'DE',
          deposit_agreement: 'NONE',
          keybox_code: null,
          latitude: 10.12312,
          longitude: 8.123,
          contact_name: 'Jesus',
          contact_surname: 'Cristo',
          email: 'bla@bla.com',
          phone: '1231231232'
        }],
        Orders: [{
          customer_id: '11-22',
          number: '1',
          description: 'order 1',
        }, {
          customer_id: '11-22',
          number: '2',
          description: 'order 2',
        }, {
          customer_id: '10-22',
          number: '3',
          description: 'order 3',
        }],
      });

    expect(res.status).equal(200);
    expect(res.body.pathway.length).equal(2);

    const first = res.body.pathway.find((p) => p.number === '10-22');
    expect(first.Orders.length).equal(1);
    expect(first.Orders[0].description).equal('order 3');

    const second = res.body.pathway.find((p) => p.number === '11-22');
    expect(second.Orders.length).equal(2);
    expect(second.Orders.map((o) => o.number).sort()).eql(['1', '2']);

    const one = await models.Customers.findOne({
      where: { number: '11-22' },
      raw: true,
    });
    expect(one.name).equal('Customer II');
    expect(one.alias).equal('Customer II alias');
    expect(one.street).equal('Street Gdo');
    expect(one.street_number).equal('1312');
    expect(one.city).equal('BERLIN');
    expect(one.zipcode).equal('2930');
    expect(one.country).equal('DE');
    expect(one.deposit_agreement).equal('NONE');
    expect(one.keybox_code).equal(null);
    expect(one.coordinates).eql({
      type: 'Point',
      coordinates: [8.123, 10.12312],
    });
    expect(one.contact_name).equal('Jesus');
    expect(one.contact_surname).equal('Cristo');
    expect(one.email).equal('bla@bla.com');
    expect(one.phone).equal('1231231232');

    const two = await models.Customers.findOne({
      where: { number: '10-22' },
      raw: true,
    });
    expect(two.name).equal('Customer I');
    expect(two.alias).equal('Customer I alias');
    expect(two.street).equal('Street Gdo');
    expect(two.street_number).equal('1312');
    expect(two.city).equal('BERLIN');
    expect(two.zipcode).equal('2930');
    expect(two.country).equal('DE');
    expect(two.deposit_agreement).equal('NONE');
    expect(two.keybox_code).equal(null);
    expect(two.coordinates).eql({
      type: 'Point',
      coordinates: [8.123, 10.12312],
    });
    expect(two.contact_name).equal('Jesus');
    expect(two.contact_surname).equal('Cristo');
    expect(two.email).equal('bla@bla.com');
    expect(two.phone).equal('1231231232');

    let tour = await models.Tours.findOne({
      where: { number: '15123-22' },
      raw: true,
    });
    expect(tour.name).equal('Test tour for import complete');

    expect(stub.callCount).equal(0);

    // sending again should not re-create two times the crap
    res = await request
      .post('/api/import/complete')
      .send({
        supplier_id: supplier.number,
        secret: supplier.secret,
        Tour: {
          id: '15123-22',
          name: 'Test tour for import complete',
        },
        Customers: [{
          id: '10-22',
          name: 'Customer I',
          alias: 'Customer I alias alias',
          street: 'Street Gdo',
          street_number: '1312',
          city: 'BERLIN',
          zipcode: '2930',
          country: 'DE',
          deposit_agreement: 'NONE',
          keybox_code: null,
          contact_name: 'Jesus',
          contact_surname: 'Cristo',
          email: 'bla@bla.com.ar',
          phone: '1231231232'
        }, {
          id: '10-23',
          name: 'Customer II',
          alias: 'Customer II alias alias',
          street: 'Customer 2 street',
          street_number: '666',
          city: 'San Pedro',
          zipcode: '2930',
          country: 'DE',
          deposit_agreement: 'NONE',
          keybox_code: null,
          contact_name: 'Jesus',
          contact_surname: 'Cristo',
          email: 'bla@bla.com.ar',
          phone: '1231231232'
        }],
        Orders: [{
          customer_id: '10-22',
          number: '3',
          description: 'order 3',
          Packages: [{
            package_id: 1,
            description: "something",
            dangerous_goods: 5,
            weight: 500,
            length: 10,
            width: 10,
            height: 10,
            size: "XS"
          }],
        }],
      });console.log(res.body)

    expect(res.status).equal(200);
    expect(res.body.pathway.length).equal(1);

    const sum = await models.Customers.findAll({
      where: { number: '10-22' },
      raw: true,
    });
    expect(sum.length).equal(1);
    expect(sum[0].alias).equal('Customer I alias alias');
    expect(sum[0].email).equal('bla@bla.com.ar');

    let tours = await models.Tours.findAll({
      where: { number: '15123-22' },
      raw: true,
    });
    expect(tours.length).equal(1);

    expect(stub.callCount).equal(1);
    expect(stub.args[0][0]).equal(`Customer 2 street 666, San Pedro, Germany`);

    const newCustomer = await models.Customers.findAll({
      where: { number: '10-23' },
      raw: true,
    });
    expect(newCustomer.length).equal(1);
    expect(newCustomer[0].coordinates).eql({
      type: 'Point',
      coordinates: [10, 11],
    });

    stub.restore();
  });
});
