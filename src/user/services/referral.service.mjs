import { User } from "../models/user.model.mjs";

/**
 * @description Returns the random string of requested strLength, by default it will return code of length 8
 * @param {number} strLength, Length of the code to be returned
 * @returns {string} Returns the string representation of the code length in characters
 */
export const generateRandomString = (strLength = 8) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < strLength; i++) {
        code += characters[Math.floor(Math.random() * characters.length)];
    }
    return code;
}

/**
 * @description Checks whether the given code already assigned to any user or not
 * @param {string} referralCode Code to check for myCode in users model
 * @returns {boolean} True if the code is in the user model and false otherwise
 */
export const isMyCodeExistsInUsers = async (referralCode) => {
    const isExists = await User.findOne({ myCode: referralCode });
    return isExists ? true : false;
}

/**
 * @description Returns unqiue mycode after checking if it exists in the users model.
 * @param {number} codeLength The length of the code to retrieve
 * @returns {string} Returns the string representation of the code length
 */
export const generateMyCode = async (codeLength = 8) => {
    let myCode = generateRandomString(codeLength);
    while (await isMyCodeExistsInUsers(myCode)) {
        myCode = generateRandomString(codeLength);
    }
    return myCode;
}