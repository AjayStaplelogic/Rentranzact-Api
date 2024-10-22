// const CC = require('currency-converter-lt')
import CurrencyConverter from "currency-converter-lt"

export const convert_currency = async (from, to, amount) => {
    const CC = new CurrencyConverter({
        from: from,
        to: to,
        amount: amount
    });
    console.log()
    // return await CC.convert(6300000);
    return {
        amount: await CC.convert(6300000),
        rate: await CC.rates()
    }
}

// console.log(await convert_currency("NGN", "USD", 6300000))

/**
 * @description This function is used to convert str to object, we need this because from react native we are unable to send meta data
 * @param {string} str, String to convert into object 
 * @returns {object} object formed from string
 */
export const makePaystackMetaDataObjForNative = (str) => {
    const obj = {};
    for (let item of str.split("-")) {
        const [key, value] = item.split("_");
        if (key === "amount") {
            obj[key] = Number(value);
        }
        obj[key] = value;
    }
    return obj;
}

// console.log(makePaystackMetaDataObjForNative("amount_50000-propertyID_prop123-userID_user456-notificationID_notif789-wallet_false"), '====file')