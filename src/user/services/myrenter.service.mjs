import { newsletter } from "../models/newsletter.model.mjs";
import { RentingHistory } from "../models/rentingHistory.model.mjs";

async function myRentersService(id) {


    console.log(id, "----")

    const data2 = await RentingHistory.find({landlordID : id})


    console.log(data2 , "====data2 ")



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
