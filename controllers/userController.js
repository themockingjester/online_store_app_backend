const { createUser, getUserDetailsFromDb, addNewAddressForUserInDb, makeAddressDefaultInDb, getUserDeliveriesFromDb, cancelDeliveryFromDb } = require('../models/userModel')
const { generateResponse, validateEmail, validatePassword, validateForStringInSize, validateNumber } = require('../utils/commonUtils')

const addNewAccount = (req, res) => {
    let { userName } = req.body
    if (!userName) {
        // means userName was not provided
        userName = ""
    }
    const { email, password } = req.headers
    return new Promise((resolve, reject) => {
        try {
            if (validateEmail(email) && validatePassword(password)) {
                createUser(userName, email, password).then((data) => {
                    if (data.success == true && data.code == 200) {
                        return resolve(res.status(200).send(generateResponse(true, data.message, data.data)))
                    } else if (data.code == 500) {
                        // this case will be handled by catch block (because this is sensitive case where we can't show the actual error to user)
                        throw data
                    } else {
                        return resolve(res.status(200).send(generateResponse(data.success, data.message, {})))
                    }
                }).catch((data) => {
                    console.log(data)
                    return resolve(res.status(500).send(generateResponse(data.success, `Something went wrong on server`, data.data)))

                })
            } else {
                return resolve(res.status(200).send(generateResponse(false, `Invalid parameters we only accept valid email and strong password`, {})))
            }

        } catch (error) {
            console.log(error)
            return resolve(res.status(500).send(generateResponse(false, `Internal Server Error`, {})))
        }
    })
}
const addNewAddress = (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            const { uId: userId } = req.session
            const { address, city, country } = req.body
            if (validateForStringInSize(address, 10, 200)) {
                if (validateForStringInSize(city, 3, 50)) {
                    if (validateForStringInSize(country, 5, 50)) {
                        addNewAddressForUserInDb(userId, address, city, country).then((data) => {
                            if (data.success == true && data.code == 200) {
                                return resolve(res.status(200).send(generateResponse(true, data.message, data.data)))
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
                    } else {
                        return resolve(res.status(200).send(generateResponse(false, `Invalid parameters characters in country must be in range 5 to 50`, {})))
                    }
                } else {
                    return resolve(res.status(200).send(generateResponse(false, `Invalid parameters characters in city must be in range 5 to 50`, {})))
                }
            } else {
                return resolve(res.status(200).send(generateResponse(false, `Invalid parameters characters in address must be in range 10 to 200`, {})))
            }

        } catch (error) {
            console.log(error)
            return resolve(res.status(500).send(generateResponse(false, `Internal Server Error`, {})))
        }
    })
}
const fetchUserDetails = (req, res) => {
    const { uId: userId } = req.session
    if (!userId) {
        return res.status(200).send(generateResponse(false, `You have to login first`, {}))
    } else {
        return new Promise((resolve, reject) => {
            try {
                getUserDetailsFromDb(undefined, userId).then((data) => {
                    if (data.success == true && data.code == 302) {
                        if (data.data.data.status == 1) {
                            data.data.data.status = `Account Active`
                        } else if (data.data.data.status == 0) {
                            data.data.data.status = `Account suspended`
                        } else if (data.data.data.status == -1) {
                            data.data.data.status = `Account Deleted`
                        } else {
                            data.data.data.status = "Unknown"
                        }
                        return resolve(res.status(200).send(generateResponse(true, data.message, data.data)))
                    } else if (data.code == 500) {
                        // this case will be handled by catch block (because this is sensitive case where we can't show the actual error to user)
                        throw data
                    } else {
                        return resolve(res.status(200).send(generateResponse(data.success, data.message, data.data)))
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

}

const setDefaultAddress = (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            const { uId: userId } = req.session
            const { addressId } = req.body
            if (validateNumber(addressId)) {
                makeAddressDefaultInDb(addressId, userId).then((data) => {
                    if (data.success == true && data.code == 200) {
                        return resolve(res.status(200).send(generateResponse(true, data.message, data.data)))
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
            } else {
                return resolve(res.status(500).send(generateResponse(data.success, `Please Provide a valid address id`, {})))
            }
        } catch (error) {
            console.log(error)
            return resolve(res.status(500).send(generateResponse(false, `Internal Server Error`, {})))
        }
    })
}

const getUserSuccessfullDeliveries = (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            const { uId: userId } = req.session
            getUserDeliveriesFromDb(userId, 2).then((data) => {
                if (data.success == true && data.code == 302) {
                    return resolve(res.status(200).send(generateResponse(true, data.message, data.data)))
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

const canceldelivery = (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            const { trackingId } = req.body
            const { uId: userId } = req.session
            cancelDeliveryFromDb(userId, trackingId).then((data) => {
                if (data.success == true && data.code == 200) {
                    return resolve(res.status(200).send(generateResponse(true, data.message, data.data)))
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

const getUserActiveDeliveries = (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            const { uId: userId } = req.session
            getUserDeliveriesFromDb(userId, 1).then((data) => {
                if (data.success == true && data.code == 302) {
                    return resolve(res.status(200).send(generateResponse(true, data.message, data.data)))
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
const getUserCancelledDeliveries = (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            const { uId: userId } = req.session
            getUserDeliveriesFromDb(userId, -1).then((data) => {
                if (data.success == true && data.code == 302) {
                    return resolve(res.status(200).send(generateResponse(true, data.message, data.data)))
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
    addNewAccount, fetchUserDetails, addNewAddress, setDefaultAddress, getUserSuccessfullDeliveries, getUserActiveDeliveries, canceldelivery, getUserCancelledDeliveries
}