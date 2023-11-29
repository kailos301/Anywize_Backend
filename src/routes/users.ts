import { Router } from 'express';
import UsersCtrl from '../controllers/users';

const router = Router();

/**
 * @api {get} /api/users/me Get logged in user
 * @apiName Get logged in user
 * @apiGroup Users
 * @apiDescription Returns the currently logged in user
 *
 * @apiParamExample {json} Request-Example:
 *     GET /api/users/me
 *
 * @apiSuccessExample Success-Response:
 *    {
 *      id: 1,
 *      name: "Name",
 *      surname: "Surname",
 *      email: "bla@bla.com",
 *      active: true,
 *      created_at: "2021-01-01T12:00:00"
 *      Supplier: {
 *         name: "Sup",
 *         alias: "lier",
 *         street: "St",
 *         street_number: "123",
 *         city: "Cty",
 *         zipcode: "12312",
 *         country: "BR",
 *         email: "sup@plier.com",
 *         phone: "123123123",
 *      }
 *    }
 *
 * @apiErrorExample Error unauthenticated:
 *     HTTP/1.1 401
 *
 */
router.get('/me', UsersCtrl.me);

export default router;
