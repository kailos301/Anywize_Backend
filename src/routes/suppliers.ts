import { Router } from 'express';
import SuppliersCtrl from '../controllers/suppliers';

const router = Router();

/**
 * @api {get} /api/admin/suppliers List suppliers
 * @apiName List suppliers
 * @apiGroup Suppliers
 * @apiDescription Returns a list of suppliers. The user making the request
 * has to be an admin
 *
 * @apiParamExample {json} Request-Example:
 *     GET /api/admin/suppliers?limit=10&offset=20
 *
 *    Returns a header `x-total-count` with the total number of records for pagination
 *
 * @apiSuccessExample Success-Response:
 *    [{
 *      id: 1,
 *      name: "Supplier",
 *      alias: "Supplier alias",
 *      active: true,
 *      created_at: "2021-01-01T12:00:00"
 *    }]
 *
 * @apiErrorExample Error unauthenticated:
 *     HTTP/1.1 401
 *
 * @apiErrorExample Forbidden:
 *     HTTP/1.1 403
 *     {
 *       "error": "FORBIDDEN",
 *     }
 */
router.get('/', SuppliersCtrl.list);

export default router;
