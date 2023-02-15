const { addProductInDb, purchaseProduct, getProductDataFromDb, getProductsInBulkfromDB } = require('../models/productModel')
const { createUser, getUserDetailsFromDb } = require('../models/userModel')
const { generateResponse, validateEmail, validatePassword, validateNumber, validatePricePerUnit, validateItemName, validateQty, checkForSpecialItemValue } = require('../utils/commonUtils')

const addNewProduct = (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            const { uId: userId } = req.session
            const { itemName, qty, pricePerUnit, isSpecialItem } = req.body
            if (validateItemName(itemName)) {
                if (validateQty(qty)) {
                    if (validatePricePerUnit(pricePerUnit)) {
                        if (checkForSpecialItemValue(isSpecialItem)) {
                            addProductInDb(itemName, qty, userId, pricePerUnit, isSpecialItem).then((data) => {
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
                            return resolve(res.status(200).send(generateResponse(false, `Invalid special Item value passed only 1,0 are supported`, {})))
                        }
                    } else {
                        return resolve(res.status(200).send(generateResponse(false, `Invalid value for price per unit provided value within 1 to 999999 is allowed`, {})))
                    }
                } else {
                    return resolve(res.status(200).send(generateResponse(false, `Quantity value must be in range 1 to 20 only`, {})))
                }
            } else {
                return resolve(res.status(200).send(generateResponse(false, `characters in item name must be in length between 3 to 100`, {})))
            }

        } catch (error) {
            console.log(error)
            return resolve(res.status(500).send(generateResponse(false, `Internal Server Error`, {})))
        }
    })
}

const buyProduct = (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            const { uId: userId } = req.session
            const { productId, qty, addressId } = req.body
            if (validateNumber(productId)) {
                if (validateNumber(qty)) {
                    purchaseProduct(productId, qty, userId, addressId).then((data) => {
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
                    return resolve(res.status(200).send(generateResponse(false, `Quantity value must be in integer form`, {})))
                }
            } else {
                return resolve(res.status(200).send(generateResponse(false, `Product id must be in integer form`, {})))
            }
        } catch (error) {
            console.log(error)
            return resolve(res.status(500).send(generateResponse(false, `Internal Server Error`, {})))
        }
    })
}

const getProductDetailsFromInventory = (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            const { productId } = req.query
            if (validateNumber(productId)) {
                getProductDataFromDb(productId).then((data) => {
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

            } else {
                return resolve(res.status(200).send(generateResponse(false, `Product id must be in integer form`, {})))
            }
        } catch (error) {
            console.log(error)
            return resolve(res.status(500).send(generateResponse(false, `Internal Server Error`, {})))
        }
    })
}

const getProductsInBulk = (req, res) => {
    return new Promise((resolve, reject) => {
        try {
            const { pageNo } = req.query
            if (validateNumber(pageNo) && pageNo >= 1) {
                getProductsInBulkfromDB(pageNo).then((data) => {
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

            } else {
                return resolve(res.status(200).send(generateResponse(false, `PageNo must be in integer form and should be greater than or equal to 1`, {})))
            }
        } catch (error) {
            console.log(error)
            return resolve(res.status(500).send(generateResponse(false, `Internal Server Error`, {})))
        }
    })
}
module.exports = {
    addNewProduct, buyProduct, getProductDetailsFromInventory, getProductsInBulk
}