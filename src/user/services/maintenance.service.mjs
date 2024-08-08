import { Maintenance } from "../models/maintenance.model.mjs";
import { Property } from "../models/property.model.mjs";
import { User } from "../models/user.model.mjs";
import * as ManinenanceEnums from "../enums/maintenance.enums.mjs"

async function addMaintenanceRequests(body) {

    const { landlord_id } = await Property.findById(body.propertyID).select("landlord_id")


    body.landlordID = landlord_id;


    // console.log(body, "===body")


    const data = new Maintenance(body);

    data.save()
    return {
        data: data,
        message: "created maintenance successfully",
        status: true,
        statusCode: 201,
    };
}

async function getMaintenanceRequestsRenter(id, req) {

    let { status } = req.query;
    let query = {
        renterID: id
    }
    if (status) {
        query.status = status;
    }
    const data = await Maintenance.aggregate([
        {
            $match: query
        },
    ])

    return {
        data: data,
        message: "maintenance list fetched successfully",
        status: true,
        statusCode: 201,
    };
}

async function getMaintenanceRequestsLandlord(id, req) {

    let { status } = req.query;
    let query = {
        landlordID: id
    }

    if (status) {
        query.status = status;
    }
    const data = await Maintenance.aggregate([
        {
            $match: query
        },
        {
            $lookup: {
                from: "users",
                let: { userID: { $toObjectId: "$renterID" } }, // Convert propertyID to ObjectId
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$userID"] }, // Match ObjectId type
                        },
                    },
                    { $project: { picture: 1, fullName: 1, phone: 1, email: 1, } }, // Project only the images array from properties
                ],
                as: "renterDetails",
            }
        }


    ])

    return {
        data: data,
        message: "maintenance list fetched successfully",
        status: true,
        statusCode: 201,
    };
}

async function resolveMaintenanceRequests(id) {

    const data = await Maintenance.findByIdAndUpdate(id, { status: ManinenanceEnums.STATUS.RESOLVED, resolvedOn: Date.now() })

    const renterDetails = await User.findById(data.renterID);

    return {
        data: data,
        message: `Maintenance request from ${renterDetails.fullName} has been marked resolved, and a notification has been sent to  ${renterDetails.fullName}.`,
        status: true,
        statusCode: 201,
    };

}


async function addRemarkToRequest(landlordRemark, maintenanceID) {

    const data = await Maintenance.findByIdAndUpdate(maintenanceID, { landlordRemark: landlordRemark, status: ManinenanceEnums.STATUS.REMARKED })

    return {
        data: data,
        message: "remark has been added successfully",
        status: true,
        statusCode: 201,
    };
}

export { addRemarkToRequest, addMaintenanceRequests, getMaintenanceRequestsRenter, getMaintenanceRequestsLandlord, resolveMaintenanceRequests };
