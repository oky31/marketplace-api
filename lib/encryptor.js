
var bcrypt = require('bcrypt');

const saltRound = 10;
const encrypt = async (str) => {
    let result = await bcrypt.hash(str, saltRound);
    return result;
};

const compare = async (text, encryptedText) => {
    let result = await bcrypt.compare(text, encryptedText);
    return result;
}

module.exports = {
    'encrypt': encrypt,
    'compare': compare,
}

