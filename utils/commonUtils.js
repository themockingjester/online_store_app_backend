const validator = require('validator')

/**
 * 
 * @param {boolean} success 
 * @param {string} message 
 * @param {JSON} data 
 * @param {number} code 
 * @returns JSON
 */
const resultObject = function (success, message, data, code) {
    return {
        success,
        message,
        data,
        code,
    };
};

/**
 * 
 * @param {boolean} success 
 * @param {string} message 
 * @param {JSON} data 
 * @returns JSON
 */
const generateResponse = function (success, message, data) {
    return {
        success,
        message,
        data,
    };
};
/**
 * 
 * @param {string} password 
 * @returns boolean
 */
const validatePassword = (password) => {
    try {
        return validator.default.isStrongPassword(`${password}`)
    } catch (error) {
        return false
    }
}

/**
 * 
 * @param {string} email 
 * @returns boolean
 */
const validateEmail = (email) => {
    try {
        if (validator.default.isEmail(email) && email.length <= 50) {
            return true
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}

/**
 * 
 * @param {number} num 
 * @returns boolean
 */
const validateNumber = (num) => {
    try {
        return validator.default.isNumeric(`${num}`)
    } catch (error) {
        return false
    }
}

const validateItemName = (itemName) => {
    try {
        if (itemName.length >= 3 && itemName.length <= 100) {
            return true
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}
const validateQty = (num) => {
    try {
        if (num > 0 && num <= 20) {
            return true
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}
const checkForSpecialItemValue = (value) => {
    try {
        if ([0, 1].includes(value)) {
            return true
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}
const validatePricePerUnit = (price) => {
    try {
        if (price > 0 && price <= 999999) {
            return true
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}

const validateForStringInSize = (data, minLen, maxLen) => {
    try {
        if (data.length >= minLen && data.length <= maxLen) {
            return true
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}
module.exports = {
    resultObject, validateItemName, validateQty, checkForSpecialItemValue, validatePricePerUnit,
    generateResponse,
    validateEmail,
    validateNumber,
    validatePassword,
    validateForStringInSize
}