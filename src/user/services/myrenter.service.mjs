import { newsletter } from "../models/newsletter.model.mjs";
import { RentingHistory } from "../models/rentingHistory.model.mjs";

async function myRentersService(id) {

    const data = await RentingHistory.aggregate([{
        $match: {
            landlordID: id
        }
    }])


    return {
        data: data,
        message: "you already subscribed to newsletter",
        status: false,
        statusCode: 401,
    };
}



export { myRentersService };
