import Transfers from "../../user/models/transfers.model.mjs"
import { sendResponse } from "../helpers/sendResponse.mjs";
import * as TransferValidations from "../validations/transfer.validation.mjs"
import { validator } from "../../user/helpers/schema-validator.mjs";
import { ETRANSFER_STATUS } from "../../user/enums/transfer.enums.mjs"
import * as StripeCommonServices from "../../user/services/stripecommon.service.mjs";
import * as AccountServices from "../../user/services/account.service.mjs";
import * as CommonHelpers from "../../user/helpers/common.helper.mjs";
import { User } from "../../user/models/user.model.mjs";

export const getAllTransfers = async (req, res) => {
    try {
        let { search, status, transfer_type } = req.query;
        const sort_key = req.query.sort_key || "createdAt";
        const sort_order = req.query.sort_order || "desc";
        let page = Number(req.query.page || 1);
        let count = Number(req.query.count || 20);
        let query = {
            isDeleted: false
        };
        if (status) { query.status = status; };

        let skip = Number(page - 1) * count;
        if (search) {
            query.$or = [
                { property_name: { $regex: search, $options: 'i' } },
                { to_name: { $regex: search, $options: 'i' } },
            ]
        }

        let sort_query = {};
        sort_query[sort_key] = sort_order == "desc" ? -1 : 1;

        if (transfer_type) { query.transfer_type = transfer_type };

        let pipeline = [
            {
                $match: query
            },
            {
                $lookup: {
                    from: "users",
                    localField: "to",
                    foreignField: "_id",
                    as: "to_detail"
                }
            },
            {
                $unwind : {
                    path : "$to_detail",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    id: "$_id",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                    status: "$status",
                    transfer_type: "$transfer_type",
                    description: "$description",
                    from: "$from",
                    is_from_admin: "$is_from_admin",
                    property_id: "$property_id",
                    amount: "$amount",
                    property_name: "$property_name",
                    property_images: "$property_images",
                    to_name : "$to_detail.fullName"
                }
            },
            {
                $facet: {
                    pagination: [
                        {
                            $count: "total"
                        },
                        {
                            $addFields: {
                                page: Number(page)
                            }
                        }
                    ],
                    data: [
                        {
                            $sort: sort_query
                        },
                        {
                            $skip: Number(skip)
                        },
                        {
                            $limit: Number(count)
                        },
                    ],
                }
            }
        ];

        let data = await Transfers.aggregate(pipeline);
        return sendResponse(res, data, "success", true, 200);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const getTransferById = async (req, res) => {
    try {
        let { id } = req.query;
        if (!id) {
            return sendResponse(res, {}, "Id required", false, 400);
        }

        let data = await Transfers.findOne({
            _id: id,
            isDeleted: false
        });
        if (data) {
            return sendResponse(res, data, "success", true, 200);
        }

        return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const updateTransferStatus = async (req, res) => {
    try {
        const { isError, errors } = validator(req.body, TransferValidations.updateTransferStatus);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        const { id, status } = req.body;

        const get_transfer = await Transfers.findOne({
            _id: id,
            isDeleted: false
        });

        if (get_transfer) {

            const get_recipient = await User.findOne({
                _id: get_transfer.to
            });
            if (get_recipient) {

                if (get_transfer.status === ETRANSFER_STATUS.rejected) {
                    return sendResponse(res, null, "Transfer already rejected", false, 403);
                }

                if (get_transfer.status === status) {
                    return sendResponse(res, null, "Transfer status already in requested status", false, 403);
                }

                const payload = {};
                switch (status) {
                    case ETRANSFER_STATUS.transferred:
                        payload.transferredAt = new Date();
                        break;
                    case ETRANSFER_STATUS.rejected:
                        payload.rejectedAt = new Date();
                        break;
                    default:
                        return sendResponse(res, null, "Invalid status", false, 400);
                }

                const get_connected_account = await AccountServices.getUserConnectedAccount(get_recipient._id);
                if (get_connected_account) {
                    const converted_currency = await CommonHelpers.convert_currency(
                        get_transfer.to_currency,
                        get_transfer.from_currency,
                        Number(get_transfer.amount)
                    )

                    console.log(converted_currency, '=====converted_currency');
                    if (converted_currency && converted_currency.amount > 0) {
                        const initiate_transfer = await StripeCommonServices.transferFunds(
                            get_connected_account.connect_acc_id,
                            Number(converted_currency.amount),
                            get_transfer?.from_currency
                        );

                        if (initiate_transfer?.id) {
                            payload.destination = initiate_transfer.destination;
                            payload.connect_acc_id = get_connected_account._id;
                            payload.transfer_id = initiate_transfer.id;
                            payload.conversion_rate = converted_currency.rate;
                            payload.status = ETRANSFER_STATUS.transferred;
                            let update_transfer = await Transfers.findByIdAndUpdate(id, payload, { new: true });
                            if (update_transfer) {
                                return sendResponse(res, null, "Transfered successfully", true, 200);
                            }
                        }

                    }
                    return sendResponse(res, null, "Unable to intitated transfer", false, 400);
                }

                return sendResponse(res, null, "Recipient Account Not Found", false, 400);
            }
            return sendResponse(res, null, "Invalid recipient", false, 400);

        }

        return sendResponse(res, null, "Data not found", false, 404);
    } catch (error) {
        return sendResponse(res, null, `${error}`, false, 400)
    }
};
