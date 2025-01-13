import { ENOTIFICATION_REDIRECT_PATHS } from "../../user/enums/notification.enum.mjs";
import { ETRANSFER_STATUS } from "../../user/enums/transfer.enums.mjs"
import { Admin } from "../models/admin.model.mjs";
import { EADMINROLES } from "../enums/permissions.enums.mjs";
import * as NotificationService from "../../user/services/notification.service.mjs";
import activityLog from "../helpers/activityLog.mjs";

/**
 * To send notifications to the admin users when transfer data updated
 * 
 * @param {object} transferData object containing the transfer data
 * @param {string} updatedBy id of the admin user who updated the transfer data
 * @returns {void} nothing
 */
export const sendTransferNotifications = async (transferData, updatedBy) => {
    Admin.findById(updatedBy).then(async get_updated_by_details => {
        const notification_payload = {};

        // Send notification to landlord
        notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.transfer_view;
        notification_payload.notificationHeading = "";
        notification_payload.notificationBody = ``;
        notification_payload.transfer_id = transferData?._id ?? null;
        notification_payload.is_send_to_admin = true;

        const query = {
            isDeleted: false
        };

        switch (transferData.status) {
            case ETRANSFER_STATUS.initiated:
                notification_payload.notificationHeading = `Transfer initiated by ${get_updated_by_details?.fullName ?? ""}. Please review and approve the transfer`;
                notification_payload.notificationBody = `Transfer initiated by ${get_updated_by_details?.fullName ?? ""}. Please review and approve the transfer`;
                query.role = EADMINROLES.FINANCIAL_ADMIN;
                activityLog(updatedBy, `initiates the transfer for property '${transferData?.property_name ?? ""}'`);
                break;

            case ETRANSFER_STATUS.initiateRejected:
                activityLog(updatedBy, `rejected the transfer initiation for property '${transferData?.property_name ?? ""}'`);
                break;

            case ETRANSFER_STATUS.approvedByEmp:
                notification_payload.notificationHeading = `Transfer approved by ${get_updated_by_details?.fullName ?? ""}. Please review and transfer`;
                notification_payload.notificationBody = `Transfer approved by ${get_updated_by_details?.fullName ?? ""}. Please review and transfer`;
                query.role = EADMINROLES.SUPER_ADMIN;
                activityLog(updatedBy, `approved the transfers for property '${transferData?.property_name ?? ""}'`);
                break;

            case ETRANSFER_STATUS.rejectedByEmp:
                activityLog(updatedBy, `rejected the transfers for property '${transferData?.property_name ?? ""}'`);
                break;

            case ETRANSFER_STATUS.transferred:
                activityLog(updatedBy, `completed the transfer successfully for property '${transferData?.property_name ?? ""}'`);
                break;

            case ETRANSFER_STATUS.rejected:
                activityLog(updatedBy, `rejected the final transfers for property '${transferData?.property_name ?? ""}'`);
                break;
        }

        if (query.role) {
            Admin.find(query).then((adminUsers) => {
                for (let admin of adminUsers) {
                    notification_payload.send_to = admin._id;
                    const metadata = {
                        "transfer_id": notification_payload.transfer_id.toString(),
                        "redirectTo": notification_payload.redirect_to
                    };

                    NotificationService.createNotification(notification_payload, metadata, admin);
                }
            });
        }
    });
}