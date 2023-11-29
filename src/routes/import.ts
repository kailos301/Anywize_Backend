import { Router } from 'express';
import ImportCtrl from '../controllers/import';

const router = Router();

router.post('/', ImportCtrl.import);

/**
 * @api {post} /api/import/complete Import full set of data
 * @apiName Import full set of data
 * @apiGroup Import
 * @apiDescription Imports a set of data starting by the Tour under which the Customers are grouped, including the Orders that need to be created and the
 * Customers related to those orders. For each data model, information is required in order to create the records if they do not exist in the
 * anywize system as well as to find them in case they were already imported.
 *
 * @apiParam {Object} Tour
 * @apiParam {String} Tour.id Unique identifier in the third party system for a Tour
 * @apiParam {String} Tour.name Tour's name
 * @apiParam {Object} Customers Array of Customers that are relevant for the current orders to be created
 * @apiParam {String} Customers.n.id Unique identifier in the third party system for a Customer
 * @apiParam {String} Customers.n.name Customer's name
 * @apiParam {String} [Customers.n.alias] Customer's alias
 * @apiParam {String} Customers.n.street Customer's address street
 * @apiParam {String} Customers.n.street_number Customer's address number
 * @apiParam {String} Customers.n.city Customer's city
 * @apiParam {String} Customers.n.zipcode Customer's zipcode
 * @apiParam {String} [Customers.n.country] 2 letter country ISO code. Defaults to "DE"
 * @apiParam {String="'NONE', 'BRING_KEY', 'KEY_BOX'"} Customers.n.deposit_agreement Rule by which packages are deposited, if applied
 * @apiParam {String} [Customers.n.keybox_code] When "deposit_agreement = 'KEY_BOX'", the code which is required to access said box.
 * @apiParam {String} [Customers.n.latitude] Customer's location latitude
 * @apiParam {String} [Customers.n.longitude] Customer's location longitude
 * @apiParam {String} [Customers.n.contact_name] Contact person's name inside the Customer's organization
 * @apiParam {String} [Customers.n.contact_surname] Contact person's name inside the Customer's organization
 * @apiParam {String} Customers.n.email Customer's email
 * @apiParam {String} Customers.n.phone Customer's phone number
 * @apiParam {Object} Orders Array of Orders to be created. Must have a reference to a Customer inside the "Customers" array
 * @apiParam {String} [Orders.n.number] Identification for the Order
 * @apiParam {String} Orders.n.customer_id Reference to one of the Customers inside the "Customers" array
 * @apiParam {String} Orders.n.description Description of the Order or any relevant information
 * @apiParam {Object} Orders.n.Packages
 * @apiParam {Number} Orders.n.Packages.n.package_id
 * @apiParam {String} Orders.n.Packages.n.description
 * @apiParam {Number} [Orders.n.Packages.n.dangerous_goods]
 * @apiParam {Number} [Orders.n.Packages.n.weight] in grams
 * @apiParam {Number} [Orders.n.Packages.n.length] in cm
 * @apiParam {Number} [Orders.n.Packages.n.width] in cm
 * @apiParam {Number} [Orders.n.Packages.n.height] in cm
 * @apiParam {String="'XS','S','M','L','XL'"} [Orders.n.Packages.n.size]
 * @apiParam {String} supplier_id Unique identifier provided by us to be used in every request
 * @apiParam {String} secret Secret hash provided by us
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *        supplier_id: "155-DO-2022",
 *        secret: "50799ff97556ab5d9355bd0aa5375805",
 *        Tour: {
 *          id: "15123-22",
 *          name: "Test tour for import complete",
 *        },
 *        Customers: [{
 *          id: "10-22",
 *          name: "Customer I",
 *          alias: "Customer I alias alias",
 *          street: "Street Gdo",
 *          street_number: "1312",
 *          city: "BERLIN",
 *          zipcode: "2930",
 *          country: "DE",
 *          deposit_agreement: "NONE",
 *          keybox_code: null,
 *          latitude: 10.12312,
 *          longitude: 8.123,
 *          contact_name: "John",
 *          contact_surname: "Doe",
 *          email: "test@test.com.ar",
 *          phone: "1231231232"
 *        }],
 *        Orders: [{
 *          customer_id: "10-22",
 *          number: "3",
 *          description: "order 3",
 *          Packages: [{
 *            package_id: 1,
 *            description: "something",
 *            dangerous_goods: 5
 *            weight: 500
 *            length: 10,
 *            width: 10,
 *            height: 10,
 *            size: "XS"
 *          }]
 *        }],
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     {
 *       uuid: "1123.11"
 *     }
 *
 * @apiErrorExample Invalid supplier_id:
 *     HTTP/1.1 400
 *     { error: "SUPPLIER_NOT_FOUND" }
 *
 * @apiErrorExample Order doesn't have corresponding Customer:
 *     HTTP/1.1 400
 *     { error: "ORDER_MISSING_CUSTOMER" }
 *
 * @apiErrorExample Error validation:
 *     HTTP/1.1 400
 *     {
 *       "error": "VALIDATION_ERROR",
 *       "errors": {
 *         "supplier_id": '"supplier_id" is required',
 *         "Tour": '"Tour" is required',
 *         "Customers": '"Customers" is required',
 *         "Orders": '"Orders" is required'
 *       }
 *     }
 */
router.post('/complete', ImportCtrl.complete);

export default router;
