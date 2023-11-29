import { Router } from 'express';
import AuthCtrl from '../controllers/auth';

const router = Router();

/**
 * @api {post} /api/auth/login Login
 * @apiName Login
 * @apiGroup Auth
 * @apiDescription Logs in the user into the system.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "email": "email@test.com",
 *       "password": "password",
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       "token": "asd1231mw1w12wn1o2i312311d1123ef12fwdfd",
 *       "user": {
 *         "name": "test",
 *         "surname": "tests",
 *         "email": "test@test.com",
 *         "Supplier": {
 *            name: "Sup",
 *            alias: "lier",
 *            street: "St",
 *            street_number: "123",
 *            city: "Cty",
 *            zipcode: "12312",
 *            country: "BR",
 *            email: "sup@plier.com",
 *            phone: "123123123",
 *         }
 *       }
 *     }
 *
 * @apiErrorExample Error incorrect data:
 *     HTTP/1.1 401
 *     {
 *       "error": "INVALID_AUTH"
 *     }
 *
 * @apiErrorExample Error validation:
 *     HTTP/1.1 400
 *     {
 *       "error": "VALIDATION_ERROR",
 *       "errors": {
 *         "username": "'username' is required",
 *         "password": "'password' is required",
 *       }
 *     }
 */
router.post('/login', AuthCtrl.login);
router.post('/', AuthCtrl.create);

export default router;
