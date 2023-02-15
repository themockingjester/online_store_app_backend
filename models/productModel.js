const { get_connection_from_pool, rollback, commit_transaction, do_query, sqlQuery, begin_transaction } = require("./dbModel")
const { checkSession } = require("../middlewares/securityMiddleware")
const { resultObject } = require("../utils/commonUtils")
const addProductInDb = (name, qty, contributor, pricePerUnit, isSpecialItem) => {
    return new Promise(async (resolve, reject) => {
        try {
            let sqlQ = `INSERT INTO product_store.products (name,qty_added,qty_left,contributor,status,price_per_unit,is_special_item) VALUES (?,?,?,?,?,?,?)`
            let q1Out = await sqlQuery(sqlQ, [name, qty, qty, contributor, 1, pricePerUnit, isSpecialItem])
            if (q1Out.insertId > 0) {
                // successfully added product
                return resolve(resultObject(true, `Successfully added product`, { productId: q1Out.insertId }, 200))

            } else {
                return resolve(resultObject(false, `Failed to add product`, { error: q1Out.message }, 500))

            }
        } catch (error) {
            return reject(resultObject(false, `Failed to add product`, { error: error.message }, 500))

        }
    })
}

const purchaseProduct = (productId, qty, userId, addressId) => {
    return new Promise(async (resolve, reject) => {
        const connection = await get_connection_from_pool()
        await begin_transaction(connection)
        try {
            const deliveryCharge = 100.50
            let isGiftIncluded = 0
            let sqlQ = `SELECT * FROM product_store.products WHERE id=? FOR UPDATE` // appying lock to avaoid conflicts
            let q1Out = await do_query(connection, sqlQ, [productId])
            if (q1Out.length > 0) {
                // product found
                if (parseInt(q1Out[0].is_special_item == 1)) {
                    isGiftIncluded = 1
                }
                const itemPrice = parseFloat(q1Out[0].price_per_unit)
                if (parseInt(q1Out[0].qty_left) >= qty) {
                    // means can provide products
                    if (!addressId) {
                        // means address not provided
                        const q2Out = await do_query(connection, `SELECT * FROM product_store.user_addresses WHERE uid=? AND address_type=1 AND status=1 LIMIT 1`, [userId])
                        if (q2Out.length > 0) {
                            // means default address found for user
                            addressId = parseInt(q2Out[0].id)
                        } else {
                            await rollback(connection)
                            return resolve(resultObject(true, `Please provide a valid address because we are unable to find default address for you`, {}, 400))
                        }
                    } else {
                        // should check for provided address
                        const q3Out = await do_query(connection, `SELECT * FROM product_store.user_addresses WHERE id=? AND uid=? AND status=1 LIMIT 1`, [addressId, userId])
                        if (q3Out.length > 0) {
                            // means default address found for user
                            addressId = parseInt(q3Out[0].id)
                        } else {
                            await rollback(connection)

                            return resolve(resultObject(true, `Address you passed dont seems your address`, {}, 400))
                        }
                    }
                    const totalPrice = itemPrice * qty
                    const q4Out = await do_query(connection, `UPDATE product_store.products SET qty_left=qty_left - ? WHERE id=?`, [qty, productId])
                    if (q4Out.affectedRows > 0) {
                        // successfully updated product
                        const q5Out = await do_query(connection, `INSERT INTO product_store.user_deliveries (uid,item_id,delivery_charge,item_charge,qty,address_id,is_gift_included) VALUES (?,?,?,?,?,?,?)`, [userId, productId, deliveryCharge, totalPrice, qty, addressId, isGiftIncluded])
                        if (q5Out.insertId > 0) {
                            await commit_transaction(connection)
                            return resolve(resultObject(true, `Successfully purchased product`, { trackingId: q5Out.insertId }, 200))
                        } else {
                            await rollback(connection)

                            return resolve(resultObject(false, `Failed to purchase product`, { error: q5Out.message }, 500))
                        }
                    } else {
                        await rollback(connection)

                        return resolve(resultObject(false, `Failed to purchase product`, { error: q4Out.message }, 500))
                    }

                } else {
                    await rollback(connection)

                    return resolve(resultObject(false, `Sorry we left with ${q1Out[0].qty_left} stocks`, { productId: q1Out.insertId }, 200))
                }
            } else {
                await rollback(connection)

                return resolve(resultObject(false, `Product not found`, { error: q1Out.message }, 404))

            }
        } catch (error) {
            await rollback(connection)
            return reject(resultObject(false, `Failed to purchase product`, { error: error.message }, 500))

        }
    })
}

const getProductDataFromDb = (productId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let sqlQ = `SELECT * FROM product_store.products WHERE id=? AND status != -1`
            let q1Out = await sqlQuery(sqlQ, [productId])
            if (q1Out.length > 0) {
                return resolve(resultObject(true, `Product details fetched`, { result: q1Out[0] }, 302))
            } else {
                return resolve(resultObject(false, `Product not found`, {}, 404))
            }
        } catch (error) {
            return reject(resultObject(false, `Failed to get product details`, { error: error.message }, 500))
        }
    })
}

const getProductsInBulkfromDB = (pageNo) => {
    return new Promise(async (resolve, reject) => {
        try {
            const totalRows = 1000
            const offset = (pageNo - 1) * totalRows
            let sqlQ = `SELECT * FROM product_store.products WHERE status != -1 LIMIT ${offset},${totalRows}`
            let q1Out = await sqlQuery(sqlQ, [])
            if (q1Out.length > 0) {
                return resolve(resultObject(true, `Products fetched`, { result: q1Out }, 302))
            } else {
                return resolve(resultObject(false, `Products not found`, {}, 404))
            }
        } catch (error) {
            return reject(resultObject(false, `Failed to get products`, { error: error.message }, 500))
        }
    })
}

module.exports = {
    addProductInDb, purchaseProduct, getProductDataFromDb, getProductsInBulkfromDB
}