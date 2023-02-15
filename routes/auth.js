const router = require('express').Router();
const { simpleLogin } = require("../controllers/authController")
router.post('/viaEmailAndPassword', simpleLogin);
module.exports = router