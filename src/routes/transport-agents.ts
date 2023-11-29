import { Router } from 'express';
import TACtrl from '../controllers/transport-agents';

const router = Router();

/**
 * @api {get} /api/transport-agents List transport agents
 * @apiName List transport agents
 * @apiGroup Transport agents
 * @apiDescription Returns a list of Transport agents.
 *
 * @apiParamExample {json} Request-Example:
 *     GET /api/transport-agents
 *
 * @apiSuccessExample Success-Response:
 *    [{
 *      id: 1,
 *      name: "Transport agent 1",
 *      alias: "TA",
 *      street: "Street",
 *      street_number: "12312",
 *      city: "City",
 *      country: "AR",
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
router.get('/', TACtrl.list);

export default router;
