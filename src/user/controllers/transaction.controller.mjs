import { subscribeNewsletter } from "../services/newsletter.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { getMyTransaction, transactionByIdService } from "../services/transaction.service.mjs";
import { UserRoles } from '../enums/role.enums.mjs';
import { Transaction } from "../models/transactions.model.mjs";

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

    if(req?.user?.data?.role == UserRoles.LANDLORD ){
      query.landlordID = req.user.data._id;
    }

    query.propertyID = {$exists : true};

    console.log(query, '=======query')
    let pipeline = [
      {
        $match: query
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


export { myTransaction, transactionById, getAllRentTransactions };
