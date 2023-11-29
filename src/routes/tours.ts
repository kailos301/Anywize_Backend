import { Router } from 'express';
import ToursCtrl from '../controllers/tours';
import userHasSupplier from '../middlewares/userHasSupplier';

const router = Router();

/**
 * @api {get} /api/tours/:id/next-position Get tour next position
 * @apiName Get tour next position
 * @apiGroup Tours
 * @apiDescription Returns the next position, so when adding a Customer the field
 * `tour_position` can be filled automatically
 *
 * @apiParamExample {json} Request-Example:
 *    GET /api/tours/1/next-position
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "tour_position": 1,
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
 */
router.get('/:id/next-position', userHasSupplier, ToursCtrl.nextPosition);

/**
 * @api {get} /api/tours/:id Get single tour
 * @apiName Get single tour
 * @apiGroup Tours
 * @apiDescription Returns a single tour matching by id, but also the supplier_id
 * has to be the same as the logged in user
 *
 * @apiParamExample {json} Request-Example:
 *    GET /api/tours/1
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "id": 1,
 *       "transport_agent_id": 10, // required
 *       "name": "Tour one", // required
 *       "description": "This is a description",
 *       "active": true,
 *       "created_at": "2021-06-01T10:00:00",
 *       "updated_at": "2021-06-01T10:00:00",
 *       "TransportAgent": {
 *         "id": 1,
 *         "name": "TA",
 *         "alias": "TA Alias",
 *       },
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
 */
router.get('/:id', userHasSupplier, ToursCtrl.get);

/**
 * @api {get} /api/tours List tours
 * @apiName List tours
 * @apiGroup Tours
 * @apiDescription Returns a list of tours where the supplier_id is the same
 * as the currently logged in user
 *
 * @apiParamExample {json} Request-Example:
 *    GET /api/tours?limit=10&offset=0
 *
 *    Returns a header `x-total-count` with the total number of records for pagination
 *
 * @apiSuccessExample Success-Response:
 *     [{
 *       "id": 1,
 *       "transport_agent_id": 10, // required
 *       "name": "Tour one", // required
 *       "description": "This is a description",
 *       "active": true,
 *       "created_at": "2021-06-01T10:00:00",
 *       "updated_at": "2021-06-01T10:00:00",
 *     }]
 *
 * @apiErrorExample Unauthenticated:
 *     HTTP/1.1 401
 *
 * @apiErrorExample Forbidden:
 *     HTTP/1.1 403
 */
router.get('/', userHasSupplier, ToursCtrl.list);

/**
 * @api {post} /api/tours Create tour
 * @apiName Create tour
 * @apiGroup Tours
 * @apiDescription Creates a new tour for the currently logged in user,
 * linked to the user supplier
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "transport_agent_id": 10, // required
 *       "name": "Tour one", // required
 *       "description": "This is a description",
 *       "active": true,
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "id": 1,
 *       "transport_agent_id": 10, // required
 *       "name": "Tour one", // required
 *       "description": "This is a description",
 *       "active": true,
 *       "created_at": "2021-06-01T10:00:00",
 *       "updated_at": "2021-06-01T10:00:00",
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
 *         "name": "'name' is required",
 *         "transport_agent_id": "'transport_agent_id' is required",
 *       }
 *     }
 */
router.post('/', userHasSupplier, ToursCtrl.create);

/**
 * @api {put} /api/tours/:id Update tour
 * @apiName Update tour
 * @apiGroup Tours
 * @apiDescription Updates a new tour for the currently logged in user. The tour
 * needs to have the same supplier_id as the user
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "transport_agent_id": 10, // required
 *       "name": "Tour one", // required
 *       "description": "This is a description",
 *       "active": true,
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "id": 1,
 *       "transport_agent_id": 10, // required
 *       "name": "Tour one", // required
 *       "description": "This is a description",
 *       "active": true,
 *       "created_at": "2021-06-01T10:00:00",
 *       "updated_at": "2021-06-01T10:00:00",
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
 *         "name": "'name' is required",
 *         "transport_agent_id": "'transport_agent_id' is required",
 *       }
 *     }
 */
router.put('/:id', userHasSupplier, ToursCtrl.update);

/**
 * @api {delete} /api/tours/:id Delete tour
 * @apiName Delete tour
 * @apiGroup Tours
 * @apiDescription Deletes a tour only if there are no customers associated to it.
 *
 * @apiParamExample {json} Request-Example:
 *    DELETE /api/tours/1
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
 * @apiErrorExample Tour has customers:
 *     HTTP/1.1 400
 *     { error: 'TOUR_CONTAINS_CUSTOMERS' }
 */
router.delete('/:id', userHasSupplier, ToursCtrl.destroy);


export default router;
