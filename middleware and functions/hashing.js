const bcrypt = require('bcrypt');

async function hashedPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

async function checkPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword)
}

module.exports.hashedPassword = hashedPassword;
module.exports.checkPassword = checkPassword;