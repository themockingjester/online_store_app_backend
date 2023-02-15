const { generateResponse } = require("../utils/commonUtils")

function checkSession(req, res, next) {
    if (req.session.isAuthenticated && req.session.uId) {
        next()
    } else {
        return res.status(200).send(generateResponse(false, 'Failed: you are not authorized!', {}))
    }

};

module.exports = {
    checkSession
}