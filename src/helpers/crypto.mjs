import crypto from "crypto";

// const key = process.env.ENCRYPTION_CRYPTO_KEY;
const key = crypto.createHash('sha256').update(process.env.ENCRYPTION_CRYPTO_KEY).digest(); // 32-byte key
const encoding = process.env.ENCRYPTION_CRYPTO_ENCODING;
const algorithm = process.env.ENCRYPTION_CRYPTO_ALGORITHM;

/**
 * @description Use to split iv and encrypted data from encrypted string
 * @param {string} encryptedText - String to encrypt, if need object to encrypt use JSON.stringify()
 * @returns {object} Containing iv string for decryption and encrypted data string to decrypt
 */
const splitEncryptedText = (encryptedText) => {
    return {
        ivString: encryptedText.slice(0, 32),
        encryptedDataString: encryptedText.slice(32),

        // The below will work when we use : at the time of returning encrypted data
        // ivString: encryptedText.split(":")[0],
        // encryptedDataString: encryptedText.split(":")[1],
    };
};




/**
 * @description Encrypts a string. If you want to encrypt data other than string, use JSON.stringify(data)
 * @param {string} plaintext - String you want to encrypt
 * @returns {string} Encrypted data with IV prepended
 */
export const encrypt = (plaintext) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', encoding);
    encrypted += cipher.final(encoding);
    return iv.toString(encoding) + encrypted;

    // const cipher = crypto.createCipheriv(algorithm, key, iv);
    // const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    // return {
    //     iv: iv.toString('hex'),
    //     encryptedData: encrypted.toString('base64')  // base64 to be compatible with frontend
    // };

    return iv.toString(encoding) + encrypted.toString('base64');

};

/**
 * @description Decrypts the data encrypted using crypto
 * @param {string} encryptedText - Encrypted data which you want to decrypt
 * @returns {string} Decrypted string in human-readable form
 */
export const decrypt = (encryptedText) => {
    const { encryptedDataString, ivString } = splitEncryptedText(encryptedText);
    const encryptedData = Buffer.from(encryptedDataString, encoding);
    const iv = Buffer.from(ivString, encoding);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedData, encoding, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

/**
 * @description Generates a random 32-byte string in hex
 * @returns {string} A random hex string
 */
export const createRandomString = () => {
    return crypto.randomBytes(32).toString("hex");
};

/**
 * @description Encrypts a string. If you want to encrypt data other than string, use JSON.stringify(data)
 * @param {string} plaintext - String you want to encrypt
 * @returns {string} Encrypted data with IV prepended
 */
export const encryptionForFrontend = (plaintext) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    return iv.toString(encoding) + encrypted.toString('base64');

};