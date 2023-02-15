const router = require('express').Router();
const { checkSession } = require("../middlewares/securityMiddleware")
const { addNewAccount, fetchUserDetails, addNewAddress, setDefaultAddress, getUserSuccessfullDeliveries, getUserActiveDeliveries, canceldelivery, getUserCancelledDeliveries } = require("../controllers/userController")
router.put('/createAccount', addNewAccount);
router.put('/addNewAddress', [checkSession], addNewAddress)
router.post('/makeAddressDefault', [checkSession], setDefaultAddress)
router.get('/fetchUserAccount', [checkSession], fetchUserDetails)
router.get("/getSuccessfullDelivers", [checkSession], getUserSuccessfullDeliveries)
router.get('/getUserActiveDeliveries', [checkSession], getUserActiveDeliveries)
router.get("/getCancelledDeliveries", [checkSession], getUserCancelledDeliveries)
router.delete(`/cancelDelivery`, [checkSession], canceldelivery)

module.exports = router