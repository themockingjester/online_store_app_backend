const { checkForUserViaCredentials } = require("../models/userModel")
const { generateResponse } = require("../utils/commonUtils")
const simpleLogin = (req, res) => {
    return new Promise((resolve, reject) => {
        const { email, password } = req.headers
        try {
            checkForUserViaCredentials(email, password).then((data) => {
                if (data.success == true && data.code == 302) {
                    if (data.data.accountId) {
                        req.session.uId = data.data.accountId
                        req.session.isAuthenticated = true
                        return resolve(res.status(200).send(generateResponse(true, `Successfully signed you in`, data.data)))

                    } else {
                        return resolve(res.status(200).send(generateResponse(false, `Something unexpected happend on server`, {})))

                    }

                } else if (data.code == 500) {
                    // this case will be handled by catch block (because this is sensitive case where we can't show the actual error to user)
                    throw data
                } else {
                    return resolve(res.status(200).send(generateResponse(data.success, data.message, {})))
                }
            }).catch((data) => {
                console.log(data)
                return resolve(res.status(500).send(generateResponse(data.success, `Something went wrong on server`, {})))
            })
        } catch (error) {
            console.log(error)
            return resolve(res.status(500).send(generateResponse(false, `Internal Server Error`, {})))
        }
    })
}

module.exports = {
    simpleLogin
}