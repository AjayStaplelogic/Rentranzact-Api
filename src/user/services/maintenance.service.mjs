import { Maintenance } from "../models/maintenance.model.mjs";
import { Property } from "../models/property.model.mjs";
import { User } from "../models/user.model.mjs";
import * as ManinenanceEnums from "../enums/maintenance.enums.mjs"
import { Notification } from "../models/notification.model.mjs";
import sendNotification from "../helpers/sendNotification.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
import { ENOTIFICATION_REDIRECT_PATHS } from "../../user/enums/notification.enum.mjs";
import * as NotificationService from "./notification.service.mjs";
import MaintenanceRemarks from "../models/maintenanceRemarks.model.mjs"
import { validator } from "../helpers/schema-validator.mjs";
import * as MaintenanceValidations from "../validations/maintenance.validation.mjs";
async function addMaintenanceRequests(body, req) {
    try {
        const { isError, errors } = validator(req.body, MaintenanceValidations.addMaintenanceRequests);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return {
                data: null, message: errorMessage, status: false, statusCode: 422,
            };
        }
        const get_property = await Property.findOne({
            _id: body.propertyID,
            renterID: req.user.data._id
        });
        if (get_property) {
            const { landlord_id, propertyName, property_manager_id } = get_property
            body.landlordID = landlord_id || null;
            body.property_manager_id = property_manager_id || null;
            body.renterID = req.user.data._id;
            const data = new Maintenance(body);
            data.save()
            if (data) {
                // await MaintenanceRemarks.create({
                //     maintenance_request_id: data._id,
                //     user_id: req.user.data._id,
                //     remark: req.body.renterRemark
                // });

                if (data.landlordID) {
                    User.findById(data.landlordID).then(landlordDetails => {
                        let notification_payload = {};
                        notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.maintenance_view;
                        notification_payload.notificationHeading = "Maintainance Requested";
                        notification_payload.notificationBody = `${req.user.data?.fullName ?? ""} applied maintanence requests for ${propertyName ?? ""}`;
                        notification_payload.renterID = req.user.data._id;
                        notification_payload.landlordID = landlordDetails._id;
                        notification_payload.maintanence_id = data._id;
                        notification_payload.propertyID = data.propertyID;
                        notification_payload.send_to = landlordDetails._id;

                        const metadata = {
                            "propertyID": data.propertyID.toString(),
                            "redirectTo": "maintanence",
                            "maintanence_id": data._id.toString(),
                        }
                        NotificationService.createNotification(notification_payload, metadata, landlordDetails)
                    })
                }

                if (data.property_manager_id) {
                    User.findById(data.property_manager_id).then(propertyManagerDetails => {
                        let notification_payload = {};
                        notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.maintenance_view;
                        notification_payload.notificationHeading = "Maintainance Requested";
                        notification_payload.notificationBody = `${req.user.data?.fullName ?? ""} applied maintanence requests for ${propertyName ?? ""}`;
                        notification_payload.renterID = req.user.data._id;
                        notification_payload.landlordID = landlord_id;
                        notification_payload.maintanence_id = data._id;
                        notification_payload.propertyID = data.propertyID;
                        notification_payload.send_to = propertyManagerDetails._id;
                        notification_payload.property_manager_id = propertyManagerDetails._id;

                        const metadata = {
                            "propertyID": data.propertyID.toString(),
                            "redirectTo": "maintanence",
                            "maintanence_id": data._id.toString(),
                        }
                        NotificationService.createNotification(notification_payload, metadata, propertyManagerDetails)
                    })
                }

                return {
                    data: data,
                    message: "created maintenance successfully",
                    status: true,
                    statusCode: 201,
                };
            }

            throw "Something went wrong";
        }
        throw "You can request maintenance for your own currently rented property";
    } catch (error) {
        return {
            data: null,
            message: error?.message,
            status: false,
            statusCode: 400,
        };
    }
}

async function getMaintenanceRequestsRenter(id, req) {

    let { status } = req.query;
    let query = {
        renterID: id
    }
    if (status) {
        query.status = status;
    }
    const data = await Maintenance.find(query).sort({ createdAt: -1 })
        .populate("propertyID", "propertyName images");

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
        landlordID: new ObjectId(id)
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
                let: { userID: "$renterID" }, // Convert propertyID to ObjectId
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
        },
        {
            $lookup: {
                from: "properties",
                localField: "propertyID",
                foreignField: "_id",
                as: "propertyData"
            }
        },
        {
            $unwind: {
                path: "$propertyData",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $set: {
                propertyDetails: {
                    propertyName: "$propertyData.propertyName",
                    images: "$propertyData.images",
                }
            }
        },
        {
            $unset: ["propertyData"]
        }
    ])

    return {
        data: data,
        message: "maintenance list fetched successfully",
        status: true,
        statusCode: 201,
    };
}

async function resolveMaintenanceRequests(id, req) {
    const data = await Maintenance.findOneAndUpdate({
        _id: id,
        $or: [
            { landlordID: req.user.data._id },
            { property_manager_id: req.user.data._id }
        ]
    }, { status: ManinenanceEnums.STATUS.RESOLVED, resolvedOn: Date.now() })

    if (data) {
        const renterDetails = await User.findById(data.renterID);
        const propertyDetails = await Property.findById(data.propertyID);

        let notification_payload = {};
        notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.maintenance_view;
        notification_payload.notificationHeading = "Maintenance Resolved";
        notification_payload.notificationBody = `Your maintenance has been resolved for ${propertyDetails?.propertyName ?? ""}`;
        notification_payload.renterID = renterDetails._id;
        notification_payload.landlordID = data.landlordID;
        notification_payload.maintanence_id = data._id;
        notification_payload.propertyID = data.propertyID;
        notification_payload.send_to = renterDetails._id;
        notification_payload.property_manager_id = data.property_manager_id;

        const metadata = {
            "propertyID": data.propertyID.toString(),
            "redirectTo": "maintanence",
            "maintanence_id": data._id.toString(),
        }
        NotificationService.createNotification(notification_payload, metadata, renterDetails)
        return {
            data: data,
            message: `Maintenance request from ${renterDetails.fullName} has been marked resolved, and a notification has been sent to  ${renterDetails.fullName}.`,
            status: true,
            statusCode: 201,
        };
    }
    return {
        data: null,
        message: "You are unauthorized to perform this action",
        status: false,
        statusCode: 400
    }
}

async function addRemarkToRequest(req) {
    const { isError, errors } = validator(req.body, MaintenanceValidations.addRemarkToRequest);
    if (isError) {
        let errorMessage = errors[0].replace(/['"]/g, "")
        return {
            data: null, message: errorMessage, status: false, statusCode: 422,
        };
    }

    const query = {
        _id: req.body.maintenanceID,
        status: { $in: ["pending", "remarked"] }
    }
    switch (req.user.data.role) {
        case UserRoles.RENTER:
            query.renterID = req.user.data._id;
            break;

        case UserRoles.LANDLORD:
            query.landlordID = req.user.data._id;
            break;

        case UserRoles.PROPERTY_MANAGER:
            query.property_manager_id = req.user.data._id;
            break;
    }
    try {
        const get_maintenance = await Maintenance.findOne(query);
        if (get_maintenance) {
            const payload = {
                maintenance_request_id: get_maintenance._id,
                user_id: req.user.data._id,
                remark: req.body.landlordRemark
            }
            const addRemark = await MaintenanceRemarks.create(payload);
            if (addRemark) {
                const data = await Maintenance.findByIdAndUpdate(get_maintenance._id, { status: ManinenanceEnums.STATUS.REMARKED });
                const renterDetails = await User.findById(data.renterID);
                const landlordDetails = await User.findById(data.landlordID)
                const propertyDetails = await Property.findById(data.propertyID);

                let notification_payload = {};
                notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.maintenance_view;
                notification_payload.notificationHeading = "Maintenance Remarks";
                notification_payload.notificationBody = `${landlordDetails?.fullName ?? ""} added remarks on your maintenance request for ${propertyDetails?.propertyName ?? ""}`;
                notification_payload.renterID = renterDetails._id;
                notification_payload.landlordID = data.landlordID;
                notification_payload.maintanence_id = data._id;
                notification_payload.propertyID = data.propertyID;
                notification_payload.send_to = renterDetails._id;
                notification_payload.property_manager_id = data.property_manager_id;

                const metadata = {
                    "propertyID": data.propertyID.toString(),
                    "redirectTo": "maintanence",
                    "maintanence_id": data._id.toString(),
                }
                NotificationService.createNotification(notification_payload, metadata, renterDetails)
                return {
                    data: data,
                    message: "Remark has been added successfully",
                    status: true,
                    statusCode: 201,
                };

            }

            return {
                data: null,
                message: "Something went wrong",
                status: false,
                statusCode: 400,
            };
        }
        return {
            data: null,
            message: "This request either doesn't exist or has already been completed",
            status: false,
            statusCode: 400,
        };
    } catch (error) {
        return {
            data: null,
            message: error?.message,
            status: false,
            statusCode: 400,
        };
    }
}

async function cancelMaintenanceRequests(id, req) {

    const data = await Maintenance.findByIdAndUpdate({
        _id: id,
        renterID: req.user.data._id
    }, { status: ManinenanceEnums.STATUS.CANCEL, canceledOn: Date.now() })

    if (data) {
        const propertyDetails = await Property.findById(data.propertyID);
        const renterDetails = await User.findById(data.renterID);
        const landlordDetails = await User.findById(data.landlordID)
        if (landlordDetails) {
            let notification_payload = {};
            notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.maintenance_view;
            notification_payload.notificationHeading = "Maintenance Request Cancelled";
            notification_payload.notificationBody = `${renterDetails?.fullName ?? ""} cancelled the maintenance request for ${propertyDetails?.propertyName ?? ""}`;
            notification_payload.renterID = renterDetails._id;
            notification_payload.landlordID = landlordDetails._id;
            notification_payload.maintanence_id = data._id;
            notification_payload.propertyID = data.propertyID;
            notification_payload.send_to = landlordDetails._id;

            const metadata = {
                "propertyID": data.propertyID.toString(),
                "redirectTo": "maintanence",
                "maintanence_id": data._id.toString(),
            }
            NotificationService.createNotification(notification_payload, metadata, landlordDetails)
        }

        const propertyManagerDetails = await User.findById(data.property_manager_id);
        if (propertyManagerDetails) {
            let notification_payload = {};
            notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.maintenance_view;
            notification_payload.notificationHeading = "Maintenance Request Cancelled";
            notification_payload.notificationBody = `${renterDetails?.fullName ?? ""} cancelled the maintenance request for ${propertyDetails?.propertyName ?? ""}`;
            notification_payload.renterID = renterDetails._id;
            notification_payload.landlordID = data.landlordID;
            notification_payload.maintanence_id = data._id;
            notification_payload.propertyID = data.propertyID;
            notification_payload.send_to = propertyManagerDetails._id;
            notification_payload.property_manager_id = propertyManagerDetails._id;

            const metadata = {
                "propertyID": data.propertyID.toString(),
                "redirectTo": "maintanence",
                "maintanence_id": data._id.toString(),
            }
            NotificationService.createNotification(notification_payload, metadata, propertyManagerDetails)
        }
        return {
            data: data,
            message: `Maintenance request for ${propertyDetails.propertyName} is canceled.`,
            status: true,
            statusCode: 200,
        };
    }
    return {
        data: null,
        message: "You cancel your own requests",
        status: false,
        statusCode: 400
    }
}

async function getMaintenanceRequestsPropertyManager(id, req) {

    let { status } = req.query;
    let query = {
        property_manager_id: new ObjectId(id)
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
                let: { userID: "$renterID" }, // Convert propertyID to ObjectId
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
        },
        {
            $lookup: {
                from: "properties",
                localField: "propertyID",
                foreignField: "_id",
                as: "propertyData"
            }
        },
        {
            $unwind: {
                path: "$propertyData",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $set: {
                propertyDetails: {
                    propertyName: "$propertyData.propertyName",
                    images: "$propertyData.images",
                }
            }
        },
        {
            $unset: ["propertyData"]
        }
    ])

    return {
        data: data,
        message: "maintenance list fetched successfully",
        status: true,
        statusCode: 201,
    };
}

export { cancelMaintenanceRequests, addRemarkToRequest, addMaintenanceRequests, getMaintenanceRequestsRenter, getMaintenanceRequestsLandlord, resolveMaintenanceRequests, getMaintenanceRequestsPropertyManager };
