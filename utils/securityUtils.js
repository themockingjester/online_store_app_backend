const config = require("../config/default.json");
const crypto = require("crypto");
const { resultObject } = require("./commonUtils");

const hashData = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      var hash = crypto
        .createHash(config.application.hashing.algorithm)
        .update(data)
        .digest(config.application.hashing.outputEncoding);
      return resolve(resultObject(true, "Success: Successfully hashed", { hashedValue: hash }, 200))
    } catch (error) {
      return reject(resultObject(false, error.message, {}, 500))
    }
  })
};

module.exports = {
  hashData
}

