import { Transaction } from "../models/transactions.model.mjs";

async function addFlutterwaveTransaction(body) {

    const { status, amount, createdAt } = body;

    const changePayload = {
        status: status,
        amount: amount,
        date: createdAt
    }

    const data = new Transaction(changePayload)

    data.save()

    return {
        data: data,
        message: "dashboard stats",
        status: true,
        statusCode: 201,
    };

}

export { addFlutterwaveTransaction };
