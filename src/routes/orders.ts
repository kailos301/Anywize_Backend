import { Router } from 'express';
import OrdersCtrl from '../controllers/orders';
import userHasSupplier from '../middlewares/userHasSupplier';

const router = Router();

/**
 * @api {get} /api/orders/delivered/:from/:to List delivered orders
 * @apiName List delivered orders
 * @apiGroup Orders
 * @apiDescription Returns a list of orders that were delivered, grouped by Customer, where the supplier_id is the same
 * as the currently logged in user. Requires two params specifying the dates range in which it
 * was delivered
 *
 * @apiParamExample {json} Request-Example:
 *    GET /api/orders/delivered/2021-01-01/2021-02-01
 *
 * @apiSuccessExample Success-Response:
 *   [
 *     {
 *       "id": 1,
 *       "name": "Kuvalis Group",
 *       "alias": "Schoen, Emmerich and Rohan",
 *       "Tour": {
 *         "id": 1,
 *         "name": "Tour: Goyette - Ebert"
 *       },
 *       "Orders": [{
 *         "id": 1,
 *         "supplier_id": 1,
 *         "customer_id": 1,
 *         "route_id": null,
 *         "description": "This is the order description for Kuvalis Group",
 *         "delivered_at": null,
 *         "number": "number",
 *       }]
 *     }
 *   ]
 *
 * @apiErrorExample Unauthenticated:
 *     HTTP/1.1 401
 *
 * @apiErrorExample Forbidden:
 *     HTTP/1.1 403
 */
 router.get('/delivered/:from/:to', userHasSupplier, OrdersCtrl.delivered);

/**
 * @api {get} /api/orders/:id Get single order
 * @apiName Get single order
 * @apiGroup Orders
 * @apiDescription Returns a single order that contains information about the customer
 *
 * @apiParamExample {json} Request-Example:
 *    GET /api/orders/1
 *
 * @apiSuccessExample Success-Response:
 *    {
 *      "id": 1,
 *      "supplier_id": 1,
 *      "customer_id": 1,
 *      "route_id": null,
 *      "description": "This is the order description for Kilback Inc",
 *      "delivered_at": null,
 *      "number": "number",
 *      "Customer": {
 *        "id": 1,
 *        "tour_id": 1,
 *        "tour_position": 1,
 *        "name": "Kilback Inc",
 *        "alias": "Rohan - Koch",
 *        "street": "st",
 *        "street_number": "123123",
 *        "city": "City 2",
 *        "zipcode": "123",
 *        "country": "BR",
 *        "email": "kellie76@hotmail.com",
 *        "phone": "123321312312"
 *      }
 *    }
 *
 * @apiErrorExample Unauthenticated:
 *     HTTP/1.1 401
 *
 * @apiErrorExample Forbidden:
 *     HTTP/1.1 403
 *
 * @apiErrorExample Not found:
 *     HTTP/1.1 404
 */
router.get('/:id', userHasSupplier, OrdersCtrl.get);

/**
 * @api {get} /api/orders List orders
 * @apiName List orders
 * @apiGroup Orders
 * @apiDescription Returns a list of orders where the supplier_id is the same
 * as the currently logged in user. Accepts query parameters to filter orders
 * that are not yet assigned to a Route: `?assigned_to_route=1` => returns only orders
 * that have a Route assigned. `?assigned_to_route=0` => returns only orders
 * that don't have a Route assigned. To return every order omit the param.
 * Accepts query parameter to filter orders by Customer: `customer_id=1` returns only
 * orders that belong to the Customer with ID 1
 *
 * @apiParamExample {json} Request-Example:
 *    GET /api/orders?limit=10&offset=0&assigned_to_route=1&customer_id=1
 *
 *    Returns a header `x-total-count` with the total number of records for pagination
 *
 * @apiSuccessExample Success-Response:
 *   [
 *     {
 *       "id": 1,
 *       "supplier_id": 1,
 *       "customer_id": 1,
 *       "route_id": null,
 *       "description": "This is the order description for Kuvalis Group",
 *       "delivered_at": null,
 *       "number": "number",
 *       "Customer": {
 *         "id": 1,
 *         "name": "Kuvalis Group",
 *         "alias": "Schoen, Emmerich and Rohan",
 *         "Tour": {
 *           "id": 1,
 *           "name": "Tour: Goyette - Ebert"
 *         }
 *       }
 *     }
 *   ]
 *
 * @apiErrorExample Unauthenticated:
 *     HTTP/1.1 401
 *
 * @apiErrorExample Forbidden:
 *     HTTP/1.1 403
 */
router.get('/', userHasSupplier, OrdersCtrl.list);

/**
 * @api {post} /api/orders Create order
 * @apiName Create order
 * @apiGroup Orders
 * @apiDescription Creates a new order for the currently logged in user,
 * linked to the user supplier
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *        customer_id: 55,
 *        description: 'blabla',
 *        number: '22222222222',
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "id": 1,
 *       "supplier_id": 1,
 *       "customer_id": 55,
 *       "route_id": null,
 *       "description": "blabla",
 *       "delivered_at": null,
 *       "number": "222222222",
 *     }
 *
 * @apiErrorExample Unauthenticated:
 *     HTTP/1.1 401
 *
 * @apiErrorExample Forbidden:
 *     HTTP/1.1 403
 *
 * @apiErrorExample Order already in route:
 *     HTTP/1.1 400
 *     { error: 'ORDER_ALREADY_IN_ROUTE' }
 *
 * @apiErrorExample Error validation:
 *     HTTP/1.1 400
 *     {
 *       "error": "VALIDATION_ERROR",
 *       "errors": {
 *         customer_id: '"customer_id" is required',
 *         description: '"description" is required',
 *       }
 *     }
 */
router.post('/', userHasSupplier, OrdersCtrl.create);

/**
 * @api {put} /api/orders/:id Update order
 * @apiName Update order
 * @apiGroup Orders
 * @apiDescription Updates an order for the currently logged in user,
 * linked to the user supplier
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *        customer_id: 55,
 *        description: 'blabla',
 *        number: '22222222222',
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "id": 1,
 *       "supplier_id": 1,
 *       "customer_id": 55,
 *       "route_id": null,
 *       "description": "blabla",
 *       "delivered_at": null,
 *       "number": "222222222",
 *     }
 *
 * @apiErrorExample Unauthenticated:
 *     HTTP/1.1 401
 *
 * @apiErrorExample Forbidden:
 *     HTTP/1.1 403
 *
 * @apiErrorExample Not found:
 *     HTTP/1.1 404
 *
 * @apiErrorExample Order already in route:
 *     HTTP/1.1 400
 *     { error: 'ORDER_ALREADY_IN_ROUTE' }
 *
 * @apiErrorExample Error validation:
 *     HTTP/1.1 400
 *     {
 *       "error": "VALIDATION_ERROR",
 *       "errors": {
 *         customer_id: '"customer_id" is required',
 *         description: '"description" is required',
 *       }
 *     }
 */
router.put('/:id', userHasSupplier, OrdersCtrl.update);

/**
 * @api {delete} /api/orders/:id Delete order
 * @apiName Delete order
 * @apiGroup Orders
 * @apiDescription Deletes an order only if its not already inside a route
 *
 * @apiParamExample {json} Request-Example:
 *    DELETE /api/orders/1
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "status": 1
 *     }
 *
 * @apiErrorExample Unauthenticated:
 *     HTTP/1.1 401
 *
 * @apiErrorExample Forbidden:
 *     HTTP/1.1 403
 *
 * @apiErrorExample Order inside route:
 *     HTTP/1.1 400
 *     { error: 'ORDER_ALREADY_IN_ROUTE' }
 */
router.delete('/:id', userHasSupplier, OrdersCtrl.destroy);

export default router;
