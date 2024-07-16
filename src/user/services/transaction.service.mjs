import { UserRoles } from "../enums/role.enums.mjs";
import { Transaction } from "../models/transactions.model.mjs";

async function getMyTransaction(userID, role) {
    if (role === UserRoles.RENTER) {

        const data = await Transaction.find({ renterID: userID })

        return {
            data: data,
            message: "successfully fetched my transactions",
            status: true,
            statusCode: 200,
        };

    } else if (role === UserRoles.LANDLORD) {

        const data = await Transaction.find({ landlord: userID });

        return {
            data: data,
            message: "successfully fetched my transactions",
            status: true,
            statusCode: 200,
        };


    }


}


export {
    getMyTransaction
}