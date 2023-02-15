const { generateResponse } = require("../utils/commonUtils")
const router = require("express").Router();
const user = require('./user')
const auth = require('./auth')
const products = require("./products")
router.use("/auth", auth)
router.use("/user", user)
router.use("/product", products)
module.exports = router