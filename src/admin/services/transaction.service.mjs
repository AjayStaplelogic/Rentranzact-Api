import { Transaction } from "../../user/models/transactions.model.mjs";

async function getTransactionService() {

    const data = await Transaction.find()

    return {
        data: data,
        message: `successfully transaction list`,
        status: true,
        statusCode: 200,
    };

}

export {getTransactionService}