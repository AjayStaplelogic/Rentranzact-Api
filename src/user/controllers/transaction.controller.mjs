import { subscribeNewsletter } from "../services/newsletter.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { getMyTransaction, transactionByIdService, getRentTransactionHtml } from "../services/transaction.service.mjs";
import { UserRoles } from '../enums/role.enums.mjs';
import { Transaction } from "../models/transactions.model.mjs";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
import { ConvertHtmlToPdf } from "../services/pdf.service.mjs";
import { Property } from "../models/property.model.mjs";
import { User } from "../models/user.model.mjs";
import { ETRANSACTION_LANDLORD_PAYMENT_STATUS, ETRANSACTION_PM_PAYMENT_STATUS } from "../enums/common.mjs";


async function myTransaction(req, res) {
  const { body } = req;


  const userID = req.user.data._id;

  const role = req.user.data.role;



  const data = await getMyTransaction(userID, role, req);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function transactionById(req, res) {

  const { id } = req.params;

  const data = await transactionByIdService(id);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);

}

async function getAllRentTransactions(req, res) {
  try {
    let { search, sortBy } = req.query;
    let page = Number(req.query.page || 1);
    let count = Number(req.query.count || 20);
    let query = {};
    let query2 = {};

    let skip = Number(page - 1) * count;
    if (search) {
      query2.$or = [
        { renter: { $regex: search, $options: 'i' } },
      ]
    }
    let field = "createdAt";
    let order = "desc";
    let sort_query = {};
    if (sortBy) {
      field = sortBy.split(' ')[0];
      order = sortBy.split(' ')[1];
    }
    sort_query[field] = order == "desc" ? -1 : 1;

    if (req?.user?.data?.role == UserRoles.LANDLORD) {
      query.landlordID = req.user.data._id;
      query.landlord_payment_status = ETRANSACTION_LANDLORD_PAYMENT_STATUS.paid;
    } else if (req?.user?.data?.role == UserRoles.PROPERTY_MANAGER) {
      query.pmID = req.user.data._id;
      query.pm_payment_status = ETRANSACTION_PM_PAYMENT_STATUS.paid;
    }

    query.propertyID = { $exists: true };

    let pipeline = [
      {
        $match: query
      },
      {
        $addFields: {
          property_manager_id: { $toObjectId: "$pmID" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "property_manager_id",
          foreignField: "_id",
          as: "property_mananger_details"
        }
      },
      {
        $unwind: {
          path: "$property_mananger_details",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          wallet: "$wallet",
          type: "$type",
          intentID: "$intentID",
          propertyID: "$propertyID",
          renterID: "$renterID",
          landlordID: "$landlordID",
          status: "$status",
          amount: "$amount",
          date: "$date",
          renter: "$renter",
          property: "$property",
          landlord: "$landlord",
          payment_mode: "$payment_mode",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          property_manager_name: "$property_mananger_details.fullName",
          property_manager_image: "$property_mananger_details.picture",
          allCharges: "$allCharges",
          landlord_transfer_date: "$landlord_transfer_date",
        }
      },
      {
        $match: query2
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

    let get_transactions = await Transaction.aggregate(pipeline);
    return sendResponse(res, get_transactions, "success", true, 200)
  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 500)
  }
}

async function downloadTransactionPdf(req, res) {
  try {
    const role = req?.user?.data?.role;
    const get_transaction = await Transaction.findById(req.query.id)
    if (get_transaction) {
      // let get_property = await Property.findById(get_transaction.propertyID);
      let get_renter = await User.findById(get_transaction.renterID);

      let payload = {
        transaction_date: get_transaction?.landlord_transfer_date,
        amount: role === UserRoles.RENTER ? get_transaction?.amount : get_transaction?.allCharges?.landlord_earning,
        property_name: get_transaction?.property ?? "",
        description: `Rent for ${get_transaction?.property ?? ""}`,
        renter_name: get_renter?.fullName ?? "",
        payment_method: get_transaction?.payment_mode ?? "",
        property_address: get_transaction?.property_address ?? "",
      }
      // Convert HTML content to PDF (returns PDF as buffer)
      const htmlContent = getRentTransactionHtml(payload)
      const pdfBuffer = await ConvertHtmlToPdf(htmlContent);
      const newBuffer = Buffer.from(pdfBuffer)
      res.set('Content-Type', 'application/octet-stream');
      res.set('Content-Disposition', 'attachment; filename=transaction.pdf');
      res.set('Content-Length', newBuffer.length);
      return res.send(newBuffer);
    }

    return sendResponse(res, null, "Invalid Id", false, 400)

  } catch (error) {
    return sendResponse(res, null, `${error}`, false, 500)
  }
}

async function adminDownloadTransactionPdf(req, res) {
  try {
    if (req.query.id) {
      const get_transaction = await Transaction.findById(req.query.id)
      if (get_transaction) {
        // let get_property = await Property.findById(get_transaction.propertyID);
        let get_renter = await User.findById(get_transaction.renterID);

        let payload = {
          transaction_date: get_transaction?.landlord_transfer_date,
          amount: get_transaction?.amount,
          property_name: get_transaction?.property ?? "",
          description: `Rent for ${get_transaction?.property ?? ""}`,
          renter_name: get_renter?.fullName ?? "",
          payment_method: get_transaction?.payment_mode ?? "",
          property_address: get_transaction?.property_address ?? "",
        }
        // Convert HTML content to PDF (returns PDF as buffer)
        const htmlContent = getRentTransactionHtml(payload)
        const pdfBuffer = await ConvertHtmlToPdf(htmlContent);
        const newBuffer = Buffer.from(pdfBuffer)
        res.set('Content-Type', 'application/octet-stream');
        res.set('Content-Disposition', 'attachment; filename=transaction.pdf');
        res.set('Content-Length', newBuffer.length);
        return res.send(newBuffer);
      }
      return sendResponse(res, null, "Invalid Id", false, 400)
    }

    return sendResponse(res, null, "Id required", false, 400)

  } catch (error) {
    return sendResponse(res, null, `${error}`, false, 500)
  }
}

export { myTransaction, transactionById, getAllRentTransactions, downloadTransactionPdf, adminDownloadTransactionPdf };
