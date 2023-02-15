const router = require('express').Router();
const { addNewProduct, buyProduct, getProductDetailsFromInventory, getProductsInBulk } = require("../controllers/productController");
const { checkSession } = require('../middlewares/securityMiddleware');
router.put('/addNewProduct', [checkSession], addNewProduct);
router.post('/purchase', [checkSession], buyProduct)
router.get('/getDetailsFromInventory', getProductDetailsFromInventory)
router.get('/getProducts',getProductsInBulk)
module.exports = router