const { hashData } = require("../utils/securityUtils")
const { resultObject } = require("../utils/commonUtils")
const { commit_transaction, rollback, do_query, sqlQuery, get_connection_from_pool, begin_transaction } = require("./dbModel")
const createUser = (name, email, password) => {
    return new Promise(async (resolve, reject) => {
        const connection = await get_connection_from_pool()
        await begin_transaction(connection)
        try {
            let q1Out = await do_query(connection, `SELECT * FROM product_store.users WHERE email=? LIMIT 1 FOR UPDATE`, [email])
            if (q1Out.length > 0) {
                await rollback(connection)
                // means account already exists
                return resolve(resultObject(false, `Account already exists`, {}, 302))
            } else {
                // means no account exists for this email
                hashData(password).then(async (response) => {
                    if (response.success == true && response.code == 200) {
                        const hashedPass = response.data.hashedValue
                        let q2Out = await do_query(connection, `INSERT INTO product_store.users(name,email,password) VALUES(?,?,?)`, [name, email, hashedPass])
                        if (q2Out.insertId > 0) {
                            // means data successfully inserted
                            await commit_transaction(connection)
                            return resolve(resultObject(true, `Successfully created account`, { accountId: q2Out.insertId }, 200))
                        } else {
                            await rollback(connection)
                            return resolve(resultObject(false, `Failed to create account`, { error: q2Out.message }, 500))
                        }
                    }
                }).catch(async (response) => {
                    await rollback(connection)
                    return resolve(resultObject(false, `Failed to hash password`, { error: response.message }, 500))
                })

            }

        } catch (error) {
            await rollback(connection)

            return reject(resultObject(false, `Failed to create account`, { error: error.message }, 500))
        }
    })
}

const checkForUserViaCredentials = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            hashData(password).then(async (response) => {
                if (response.success == true && response.code == 200) {
                    const hashedPass = response.data.hashedValue
                    let q2Out = await sqlQuery(`SELECT uid from product_store.users WHERE email=? AND password=?`, [email, hashedPass])
                    if (q2Out.length > 0) {
                        // means credentials are correct
                        return resolve(resultObject(true, `Credentials were correct`, { accountId: q2Out[0].uid }, 302))
                    } else {
                        return resolve(resultObject(false, `Either account don't exists or credentials were incorrect`, {}, 404))
                    }
                }
            }).catch(async (response) => {
                return resolve(resultObject(false, `Failed to hash password`, { error: response.message }, 500))
            })

        } catch (error) {
            return reject(resultObject(false, `Failed to check credentails`, { error: error.message }, 500))
        }
    })
}
/**
 * This function returns user details and as input parameters for this function you either have to provide user email or user id
 * @param {string} email 
 * @param {number} userId 
 * @returns JSON object
 */
const getUserDetailsFromDb = (email, userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let sqlQ = `SELECT uid,name,email,date_of_join,status FROM product_store.users WHERE `
            let q1Out
            if (email) {
                // means email provided
                sqlQ += `email=? LIMIT 1`
                q1Out = await sqlQuery(sqlQ, [email])
            } else if (userId) {
                // means userId Provided
                sqlQ += `uid=? LIMIT 1`
                q1Out = await sqlQuery(sqlQ, [userId])
            } else {
                // parameter not provided
                return resolve(resultObject(false, `Either provide userId or email`, {}, 500))

            }
            if (q1Out.length > 0) {
                // means account exists
                return resolve(resultObject(true, `Account found`, { data: q1Out[0] }, 302))
            } else {
                // means no account exists for this email
                return resolve(resultObject(false, `Account not found`, {}, 404))
            }

        } catch (error) {

            return reject(resultObject(false, `Failed to get account details`, { error: error.message }, 500))
        }
    })
}

const addNewAddressForUserInDb = (userId, addressLine, city, country) => {
    return new Promise(async (resolve, reject) => {
        try {
            const addressType = 0 //means not default if 1 then default
            let sqlQ = `INSERT INTO product_store.user_addresses (uid,status,address_type,address_line,city,country) VALUES(?,?,?,?,?,?) `
            let q1Out = await sqlQuery(sqlQ, [userId, 1, addressType, addressLine, city, country])
            if (q1Out.insertId > 0) {
                // means account exists
                return resolve(resultObject(true, `Address Created`, { addressId: q1Out.insertId }, 200))
            } else {
                // means no account exists for this email
                return resolve(resultObject(false, `Failed to add address`, { error: q1Out.message }, 500))
            }

        } catch (error) {

            return reject(resultObject(false, `Failed to add address`, { error: error.message }, 500))
        }
    })
}

const makeAddressDefaultInDb = (addressId, userId) => {
    return new Promise(async (resolve, reject) => {
        let connection = await get_connection_from_pool()
        await begin_transaction(connection)
        try {
            const q1Out = await do_query(connection, `SELECT * FROM product_store.user_addresses WHERE id=? AND uid=? LIMIT 1`, [addressId, userId])
            if (q1Out.length > 0) {
                if (q1Out[0].address_type == 1) {
                    return resolve(resultObject(true, `Address is already set to default`, {}, 200))
                } else {
                    const q2Out = await do_query(connection, `UPDATE product_store.user_addresses SET address_type = 0 WHERE uid=?`, [userId])
                    if (q2Out.affectedRows > 0) {
                        const q3Out = await do_query(connection, `UPDATE product_store.user_addresses SET address_type = 1 WHERE id=? AND uid=?`, [addressId, userId])
                        if (q3Out.affectedRows > 0) {
                            await commit_transaction(connection)
                            return resolve(resultObject(true, `Successfully update default address`, {}, 200))
                        } else {
                            await rollback(connection)
                            return resolve(resultObject(false, `Failed to make address as default for user`, { error: q3Out.message }, 500))
                        }
                    } else {
                        await rollback(connection)
                        return resolve(resultObject(false, `Failed to update addresses for user`, { error: q2Out.message }, 500))
                    }
                }
            } else {
                await rollback(connection)
                return resolve(resultObject(false, `Address not found for user`, {}, 404))
            }
        } catch (error) {
            await rollback(connection)
            return reject(resultObject(false, `Failed to set default address`, { error: error.message }, 500))
        }
    })
}

const getUserDeliveriesFromDb = (userId, statusValue) => {
    return new Promise(async (resolve, reject) => {
        try {
            let sqlQ = `SELECT t1.id as trackingId,t1.item_id,t1.reason,t1.delivery_charge,t1.item_charge,t1.qty,t1.is_gift_included,t1.date_created,t2.address_line,t2.country,t2.city FROM product_store.user_deliveries as t1 INNER JOIN product_store.user_addresses as t2 ON t2.id=t1.address_id WHERE t1.uid=? AND t1.status =?`
            let q1Out = await sqlQuery(sqlQ, [userId, statusValue])

            if (q1Out.length > 0) {
                return resolve(resultObject(true, `Successfully collected data`, { data: q1Out }, 302))
            } else {
                return resolve(resultObject(false, `No data found`, {}, 404))
            }

        } catch (error) {

            return reject(resultObject(false, `Failed to collect data`, { error: error.message }, 500))
        }
    })
}

const cancelDeliveryFromDb = (userId, trackingId) => {
    return new Promise(async (resolve, reject) => {
        const connection = await get_connection_from_pool()
        await begin_transaction(connection)
        try {
            let sqlQ = `SELECT * FROM product_store.user_deliveries WHERE id=? AND uid=? FOR UPDATE`    // Applying lock for avoiding conflicts
            let q1Out = await do_query(connection, sqlQ, [trackingId, userId])
            if (q1Out.length > 0) {
                let itemId = q1Out[0].item_id
                if (q1Out[0].status == 1) {
                    let qty = parseInt(q1Out[0].qty)
                    const q2Out = await do_query(connection, `UPDATE product_store.products SET qty_left = qty_left + ? WHERE id=?`, [qty, itemId])
                    if (q2Out.affectedRows > 0) {
                        const q3Out = await do_query(connection, `UPDATE product_store.user_deliveries SET status=-1 WHERE id=?`, [trackingId])
                        if (q3Out.affectedRows > 0) {
                            await commit_transaction(connection)
                            return resolve(resultObject(true, `Successfully Cancelled delivery`, {}, 200))
                        } else {
                            await rollback(connection)
                            return resolve(resultObject(false, `Failed to cancel delivery`, { error: q3Out.message }, 500))
                        }
                    } else {
                        await rollback(connection)

                        return resolve(resultObject(false, `Failed to cancel delivery`, { error: q2Out.message }, 500))
                    }
                } else {
                    await rollback(connection)

                    return resolve(resultObject(false, `Unable to cancel delivery at this stage`, {}, 400))

                }
            } else {
                await rollback(connection)

                return resolve(resultObject(false, `Delivery details not found for user`, {}, 404))
            }

        } catch (error) {
            await rollback(connection)
            console.log(error)
            return reject(resultObject(false, `Failed to cancel delivery`, { error: error.message }, 500))
        }
    })
}
module.exports = {
    createUser, getUserDetailsFromDb, checkForUserViaCredentials, addNewAddressForUserInDb, makeAddressDefaultInDb, getUserDeliveriesFromDb, cancelDeliveryFromDb
}