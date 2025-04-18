// import CurrencyConverter from "currency-converter-lt"
import CurrencyConverter from "currency-converter-lt"
import { Convert, Converter } from "easy-currencies";

export const convert_currency = async (from, to, amount) => {
    const CC = new CurrencyConverter({  // working with currency-converter-lt npm
        from: from,
        to: to,
        amount: amount
    });

    console.log(await CC.convert(amount), '===========await CC.convert(amount)f')

    // return {             // Working with currency-converter-lt npm
    //     amount: await CC.convert(amount),
    //     rate: await CC.rates()
    // }
    const cc = new Converter();
    const rates = await cc.getRates(from, to, false);
    return {
        amount: await Convert(amount).from(from).to(to),
        rate: rates[to]
    }
}


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


export const numberToWords = (num) => {
    if (num === 0) return "zero";

    const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
        "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
    const thousands = ["", "thousand", "million", "billion"];

    let result = '';
    let i = 0;

    function convertChunk(num) {
        let chunk = '';
        if (num >= 100) {
            chunk += ones[Math.floor(num / 100)] + ' hundred ';
            num %= 100;
        }
        if (num >= 20) {
            chunk += tens[Math.floor(num / 10)] + ' ';
            num %= 10;
        }
        if (num > 0) {
            chunk += ones[num] + ' ';
        }
        return chunk.trim();
    }

    while (num > 0) {
        let chunk = num % 1000;
        if (chunk !== 0) {
            result = convertChunk(chunk) + ' ' + thousands[i] + ' ' + result;
        }
        num = Math.floor(num / 1000);
        i++;
    }

    return result.trim();
}

