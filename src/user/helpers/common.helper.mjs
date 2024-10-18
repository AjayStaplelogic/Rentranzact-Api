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
        amount :  await CC.convert(6300000),
        rate : await CC.rates()
    }
}

// console.log(await convert_currency("NGN", "USD", 6300000))