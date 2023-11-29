import { Router } from 'express';
import CustomersCtrl from '../controllers/customers';
import userHasSupplier from '../middlewares/userHasSupplier';

const router = Router();

/**
 * @api {get} /api/customers/:id Get single customer
 * @apiName Get single customer
 * @apiGroup Customers
 * @apiDescription Returns a single customer
 *
 * @apiParamExample {json} Request-Example:
 *    GET /api/customers/1
 *
 * @apiSuccessExample Success-Response:
 *    {
 *      id: 4,
 *      supplier_id: 1,
 *      tour_id: 1,
 *      tour_position: 1,
 *      name: 'Brekke Inc',
 *      number: '123123',
 *      alias: 'Rutherford and Sons',
 *      street: 'st',
 *      street_number: '123123',
 *      city: 'City 2',
 *      zipcode: '123',
 *      country: 'BR',
 *      contact_salutation: 'MR',
 *      contact_name: 'John',
 *      contact_surname: 'Doe',
 *      email: 'payton54@gmail.com',
 *      phone: '123321312312',
 *      sms_notifications: false,
 *      email_notifications: true,
 *      latitude: 10.00002,
 *      longitude: 11.00004,
 *      active: true,
 *      deposit_agreement: 'BRING_KEY',
 *      keybox_code: null,
 *      updated_at: '2021-06-08T17:14:07.000Z',
 *      created_at: '2021-06-08T17:14:07.000Z',
 *      Tour: { id: 1, name: 'Tour: Schultz, Feeney and Robel' }
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
router.get('/:id', userHasSupplier, CustomersCtrl.get);

/**
 * @api {get} /api/customers List customers
 * @apiName List customers
 * @apiGroup Customers
 * @apiDescription Returns a list of customers where the supplier_id is the same
 * as the currently logged in user
 *
 * @apiParamExample {json} Request-Example:
 *    GET /api/customers?limit=10&offset=0
 *
 *    Returns a header `x-total-count` with the total number of records for pagination
 *
 * @apiSuccessExample Success-Response:
 *     [{
 *       id: 3,
 *       supplier_id: 1,
 *       tour_id: 1,
 *       tour_position: 1,
 *       name: 'Olson Inc',
 *       number: '123123',
 *       alias: 'Bayer LLC',
 *       street: 'st',
 *       street_number: '123123',
 *       city: 'City 2',
 *       zipcode: '123',
 *       country: 'BR',
 *       email: 'kelli_luettgen@yahoo.com',
 *       phone: '123321312312',
 *       sms_notifications: 0,
 *       email_notifications: 1,
 *       active: 1,
 *       deposit_agreement: 'BRING_KEY',
 *       keybox_code: null,
 *       updated_at: '2021-06-08T17:09:28.000Z',
 *       created_at: '2021-06-08T17:09:28.000Z',
 *       Tour: { id: 1, name: 'Tour: Schultz, Feeney and Robel' }
 *     }]
 *
 * @apiErrorExample Unauthenticated:
 *     HTTP/1.1 401
 *
 * @apiErrorExample Forbidden:
 *     HTTP/1.1 403
 */
router.get('/', userHasSupplier, CustomersCtrl.list);

/**
 * @api {post} /api/customers Create customer
 * @apiName Create customer
 * @apiGroup Customers
 * @apiDescription Creates a new customer for the currently logged in user,
 * linked to the user supplier
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *        tour_id: 2, // required
 *        tour_position: 1, // required
 *        name: 'Customer one', // required
 *        number: '123123',
 *        alias: 'Customer one', // required
 *        street: 'st', // required
 *        street_number: '123123', // required
 *        city: 'city', // required
 *        zipcode: 'zip', // required
 *        country: 'AR', // required
 *        contact_salutation: 'MR', // required
 *        contact_name: 'John', // required
 *        contact_surname: 'Doe', // required
 *        email: 'bla@bla.com', // required
 *        phone: '123123123', // required
 *        latitude: 10.00002, // required
 *        longitude: 11.00004, // required
 *        deposit_agreement: 'BRING_KEY', // Options: 'KEY_BOX', 'NONE', 'BRING_KEY'
 *        keybox_code: null, // required when deposit_agreement = 'KEY_BOX'
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       id: 3,
 *       supplier_id: 1,
 *       tour_id: 1,
 *       tour_position: 1,
 *       name: 'Olson Inc',
 *       number: '123123',
 *       alias: 'Bayer LLC',
 *       street: 'st',
 *       street_number: '123123',
 *       city: 'City 2',
 *       zipcode: '123',
 *       country: 'BR',
 *       contact_salutation: 'MR',
 *       contact_name: 'John',
 *       contact_surname: 'Doe',
 *       email: 'kelli_luettgen@yahoo.com',
 *       phone: '123321312312',
 *       sms_notifications: 0,
 *       email_notifications: 1,
 *       active: 1,
 *       latitude: 10.00002,
 *       longitude: 11.00004,
 *       deposit_agreement: 'BRING_KEY',
 *       keybox_code: null,
 *       updated_at: '2021-06-08T17:09:28.000Z',
 *       created_at: '2021-06-08T17:09:28.000Z'
 *     }
 *
 * @apiErrorExample Unauthenticated:
 *     HTTP/1.1 401
 *
 * @apiErrorExample Forbidden:
 *     HTTP/1.1 403
 *
 * @apiErrorExample Error validation:
 *     HTTP/1.1 400
 *     {
 *       "error": "VALIDATION_ERROR",
 *       "errors": {
 *         tour_id: '"tour_id" is required',
 *         tour_position: '"tour_position" is required',
 *         name: '"name" is required',
 *         alias: '"alias" is required',
 *         street: '"street" is required',
 *         street_number: '"street_number" is required',
 *         city: '"city" is required',
 *         zipcode: '"zipcode" is required',
 *         country: '"country" is required',
 *         email: '"email" is required',
 *         phone: '"phone" is required',
 *         latitude: '"latitude" is required',
 *         longitude: '"longitude" is required',
 *       }
 *     }
 */
router.post('/', userHasSupplier, CustomersCtrl.create);

/**
 * @api {put} /api/customers/:id Update customer
 * @apiName Update customer
 * @apiGroup Customers
 * @apiDescription Updates a customer for the currently logged in user. The Customer
 * needs to have the same supplier_id as the user
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *        tour_id: 2, // required
 *        tour_position: 1, // required
 *        name: 'Customer one', // required
 *        number: '123123',
 *        alias: 'Customer one', // required
 *        street: 'st', // required
 *        street_number: '123123', // required
 *        city: 'city', // required
 *        zipcode: 'zip', // required
 *        country: 'AR', // required
 *        contact_salutation: 'MR', // required
 *        contact_name: 'John', // required
 *        contact_surname: 'Doe', // required
 *        email: 'bla@bla.com', // required
 *        phone: '123123123', // required
 *        latitude: 10.0002, // required
 *        longitude: 11.00004, // required
 *        deposit_agreement: 'BRING_KEY', // Options: 'KEY_BOX', 'NONE', 'BRING_KEY'
 *        keybox_code: null, // required when deposit_agreement = 'KEY_BOX'
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       id: 3,
 *       supplier_id: 1,
 *       tour_id: 1,
 *       tour_position: 1,
 *       name: 'Olson Inc',
 *       number: '123123',
 *       alias: 'Bayer LLC',
 *       street: 'st',
 *       street_number: '123123',
 *       city: 'City 2',
 *       zipcode: '123',
 *       country: 'BR',
 *       contact_salutation: 'MR',
 *       contact_name: 'John',
 *       contact_surname: 'Doe',
 *       email: 'kelli_luettgen@yahoo.com',
 *       phone: '123321312312',
 *       sms_notifications: 0,
 *       email_notifications: 1,
 *       active: 1,
 *       latitude: 10.0002,
 *       longitude: 11.00004,
 *       updated_at: '2021-06-08T17:09:28.000Z',
 *       created_at: '2021-06-08T17:09:28.000Z',
 *       deposit_agreement: 'BRING_KEY',
 *       keybox_code: null,
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
 * @apiErrorExample Error validation:
 *     HTTP/1.1 400
 *     {
 *       "error": "VALIDATION_ERROR",
 *       "errors": {
 *         tour_id: '"tour_id" is required',
 *         tour_position: '"tour_position" is required',
 *         name: '"name" is required',
 *         alias: '"alias" is required',
 *         street: '"street" is required',
 *         street_number: '"street_number" is required',
 *         city: '"city" is required',
 *         zipcode: '"zipcode" is required',
 *         country: '"country" is required',
 *         email: '"email" is required',
 *         phone: '"phone" is required',
 *         latitude: '"latitude" is required',
 *         longitude: '"longitude" is required',
 *       }
 *     }
 */
router.put('/:id', userHasSupplier, CustomersCtrl.update);

/**
 * @api {delete} /api/customers/:id Delete customer
 * @apiName Delete customer
 * @apiGroup Customers
 * @apiDescription Deletes a customer if there are no order associated to it.
 *
 * @apiParamExample {json} Request-Example:
 *    DELETE /api/customers/1
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
 * @apiErrorExample Customer has orders:
 *     HTTP/1.1 400
 *     { error: 'CUSTOMER_CONTAINS_ORDERS' }
 */
router.delete('/:id', userHasSupplier, CustomersCtrl.destroy);


export default router;
