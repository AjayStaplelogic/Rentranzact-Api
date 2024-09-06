import { Maintenance } from "../models/maintenance.model.mjs";
import { Property } from "../models/property.model.mjs";
import { User } from "../models/user.model.mjs";
import * as ManinenanceEnums from "../enums/maintenance.enums.mjs"
import { Notification } from "../models/notification.model.mjs";
import sendNotification from "../helpers/sendNotification.mjs";
import { UserRoles } from "../enums/role.enums.mjs";

async function addMaintenanceRequests(body) {

    console.log(body, "------------bodyyy")

    const { landlord_id, propertyName } = await Property.findById(body.propertyID);


    body.landlordID = landlord_id;


    // console.log(body, "===body")


    const data = new Maintenance(body);

    data.save()

    let landlordDetails = await User.findById(landlord_id)
    let renterDetails = await User.findById(data.renterID)

    let notification_payload = {};
    notification_payload.notificationHeading = "Maintainance Requested";
    notification_payload.notificationBody = `${renterDetails?.fullName ?? ""} applied maintanence requests for ${propertyName ?? ""}`;
    notification_payload.renterID = renterDetails._id;
    notification_payload.landlordID = landlordDetails._id;
    notification_payload.maintanence_id = data._id;
    notification_payload.propertyID = data.propertyID;
    let create_notification = await Notification.create(notification_payload);
    if (create_notification) {
        if (landlordDetails && landlordDetails.fcmToken) {
            const metadata = {
                "propertyID": data.propertyID.toString(),
                "redirectTo": "maintanence",
                "maintanence_id": create_notification.maintanence_id,
            }
            sendNotification(landlordDetails, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, UserRoles.LANDLORD)
        }
    }

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
    let landlordDetails = await User.findById(data.landlordID)
    const propertyDetails = await Property.findById(data.propertyID);

    let notification_payload = {};
    notification_payload.notificationHeading = "Maintenance Resolved";
    notification_payload.notificationBody = `Your maintenance has been resolved for ${propertyDetails?.propertyName ?? ""}`;
    notification_payload.renterID = renterDetails._id;
    notification_payload.landlordID = landlordDetails._id;
    notification_payload.maintanence_id = data._id;
    notification_payload.propertyID = data.propertyID;
    let create_notification = await Notification.create(notification_payload);
    if (create_notification) {
        if (renterDetails && renterDetails.fcmToken) {
            const metadata = {
                "propertyID": data.propertyID.toString(),
                "redirectTo": "maintanence",
                "maintanence_id": create_notification.maintanence_id,
            }
            sendNotification(renterDetails, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, UserRoles.RENTER)
        }
    }

    return {
        data: data,
        message: `Maintenance request from ${renterDetails.fullName} has been marked resolved, and a notification has been sent to  ${renterDetails.fullName}.`,
        status: true,
        statusCode: 201,
    };

}


async function addRemarkToRequest(landlordRemark, maintenanceID) {

    const data = await Maintenance.findByIdAndUpdate(maintenanceID, { landlordRemark: landlordRemark, status: ManinenanceEnums.STATUS.REMARKED })
    const renterDetails = await User.findById(data.renterID);
    let landlordDetails = await User.findById(data.landlordID)
    const propertyDetails = await Property.findById(data.propertyID);

    let notification_payload = {};
    notification_payload.notificationHeading = "Maintenance Remarks";
    notification_payload.notificationBody = `${landlordDetails?.fullName ?? ""} added remarks on your maintenance request for ${propertyDetails?.propertyName ?? ""}`;
    notification_payload.renterID = renterDetails._id;
    notification_payload.landlordID = landlordDetails._id;
    notification_payload.maintanence_id = data._id;
    notification_payload.propertyID = data.propertyID;
    let create_notification = await Notification.create(notification_payload);
    if (create_notification) {
        if (renterDetails && renterDetails.fcmToken) {
            const metadata = {
                "propertyID": data.propertyID.toString(),
                "redirectTo": "maintanence",
                "maintanence_id": create_notification.maintanence_id,
            }
            sendNotification(renterDetails, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, UserRoles.RENTER)
        }
    }

    return {
        data: data,
        message: "remark has been added successfully",
        status: true,
        statusCode: 201,
    };
}


async function cancelMaintenanceRequests(id) {

    const data = await Maintenance.findByIdAndUpdate(id, { status: ManinenanceEnums.STATUS.CANCEL, canceledOn: Date.now() })

    const propertyDetails = await Property.findById(data.propertyID);
    const renterDetails = await User.findById(data.renterID);
    let landlordDetails = await User.findById(data.landlordID)
    let notification_payload = {};
    notification_payload.notificationHeading = "Maintenance Request Cancelled";
    notification_payload.notificationBody = `${renterDetails?.fullName ?? ""} cancelled the maintenance request for ${propertyDetails?.propertyName ?? ""}`;
    notification_payload.renterID = renterDetails._id;
    notification_payload.landlordID = landlordDetails._id;
    notification_payload.maintanence_id = data._id;
    notification_payload.propertyID = data.propertyID;
    let create_notification = await Notification.create(notification_payload);
    if (create_notification) {
        if (landlordDetails && landlordDetails.fcmToken) {
            const metadata = {
                "propertyID": data.propertyID.toString(),
                "redirectTo": "maintanence",
                "maintanence_id": create_notification.maintanence_id,
            }
            sendNotification(landlordDetails, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, UserRoles.LANDLORD)
        }
    }


    return {
        data: data,
        message: `Maintenance request for ${propertyDetails.propertyName} is canceled.`,
        status: true,
        statusCode: 200,
    };

}

export { cancelMaintenanceRequests, addRemarkToRequest, addMaintenanceRequests, getMaintenanceRequestsRenter, getMaintenanceRequestsLandlord, resolveMaintenanceRequests, };
