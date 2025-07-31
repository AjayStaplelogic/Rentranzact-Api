import { UserRoles } from "../enums/role.enums.mjs";
import { Transaction } from "../models/transactions.model.mjs";
import mongoose from 'mongoose';
import { User } from "../models/user.model.mjs";
import { rentPaidEmail } from "../emails/rent.emails.mjs";
import { ENOTIFICATION_REDIRECT_PATHS } from "../enums/notification.enum.mjs";
import * as NotificationService from "./notification.service.mjs";
import moment from "moment";
import { numberToWords } from "../helpers/common.helper.mjs";
import { ETRANSACTION_LANDLORD_PAYMENT_STATUS, ETRANSACTION_PM_PAYMENT_STATUS } from "../enums/common.mjs";

async function getMyTransaction(userID, role, req) {
  let { search, type, status } = req.query;
  let query = {};
  if (search) {
    query.$or = [
      { landlord: { $regex: search, $options: "i" } },
    ]
  }

  if (role === UserRoles.RENTER) {
    query.renterID = userID;
  } else if (role === UserRoles.LANDLORD) {
    query.landlordID = userID;
    query.landlord_payment_status = ETRANSACTION_LANDLORD_PAYMENT_STATUS.paid;
  } else if (role === UserRoles.PROPERTY_MANAGER) {
    query.pmID = userID;
    query.pm_payment_status = ETRANSACTION_PM_PAYMENT_STATUS.paid;
  }

  if (type) { query.type = type };

  if (status) {
    query.status = status;
  }

  if (role === UserRoles.RENTER) {
    const data = await Transaction.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: "users",
          let: { userID: { $toObjectId: "$landlordID" } }, // Convert propertyID to ObjectId
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$userID"] }, // Match ObjectId type
              },
            },
            { $project: { picture: 1 } }, // Project only the images array from properties
          ],
          as: "landlordDetails",
        }
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
        $addFields: {
          property_manager_name: "$property_mananger_details.fullName",
          property_manager_image: "$property_mananger_details.picture"
        },
      },
      {

        $unset: ["property_mananger_details"]
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ])

    return {
      data: data,
      message: "successfully fetched my transactions",
      status: true,
      statusCode: 200,
    };

  } else if (role === UserRoles.LANDLORD) {

    const data = await Transaction.aggregate([
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
            { $project: { picture: 1 } }, // Project only the images array from properties
          ],
          as: "RenterDetails",
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ])

    return {
      data: data,
      message: "successfully fetched my transactions",
      status: true,
      statusCode: 200,
    };



  } else if (role === UserRoles.PROPERTY_MANAGER) {
    const data = await Transaction.aggregate([
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
            { $project: { picture: 1 } }, // Project only the images array from properties
          ],
          as: "RenterDetails",
        }
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
        $addFields: {
          property_manager_name: "$property_mananger_details.fullName",
          property_manager_image: "$property_mananger_details.picture"
        },
      },
      {

        $unset: ["property_mananger_details"]
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ])

    return {
      data: data,
      message: "successfully fetched my transactions",
      status: true,
      statusCode: 200,
    };
  }
}
async function transactionByIdService(id) {
  let data = await Transaction.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id)
      }
    },
    {
      $set: {
        renterID: {
          $toObjectId: "$renterID"
        },
        propertyID: {
          $toObjectId: "$propertyID"
        },
        landlordID: {
          $toObjectId: "$landlordID"
        }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "renterID",
        foreignField: "_id",
        as: "renter_details"
      }
    },
    {
      $unwind: {
        path: "$renter_details",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "properties",
        localField: "propertyID",
        foreignField: "_id",
        as: "property_details"
      }
    },
    {
      $unwind: {
        path: "$property_details",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "landlordID",
        foreignField: "_id",
        as: "landlord_details"
      }
    },
    {
      $unwind: {
        path: "$landlord_details",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        type: "$type",
        propertyID: "$propertyID",
        renterID: "$renterID",
        landlordID: "$landlordID",
        status: "$status",
        amount: "$amount",
        date: "$date",
        createdAt: "$createdAt",
        updatedAt: "$updatedAt",
        renter_details: {
          _id: "$renter_details._id",
          fullName: "$renter_details.fullName",
          picture: "$renter_details.picture"
        },
        property_details: {
          _id: "$property_details._id",
          propertyName: "$property_details.propertyName",
          images: "$property_details.images"
        },
        landlord_details: {
          _id: "$landlord_details._id",
          fullName: "$landlord_details.fullName",
          picture: "$landlord_details.picture"
        },
        payment_mode: "$payment_mode",
        intentID: "$intentID",
        wallet: "$wallet",
        allCharges: "$allCharges",
        landlord_transfer_date: "$landlord_transfer_date",
      }
    }
  ])

  return {
    data: data[0],
    message: "successfully fetched my transactions",
    status: true,
    statusCode: 200,
  };
}

/**
 * 
 * When rent payment succeeds then sending system and email notification
 * 
 * @param {object} options
 * @param {object} options.property property details object for related payment
 * @param {object} options.renter_details renter details object who is responsible for the payment
 * @param {object} options.send_to id of the landlord or property manager to send the payment
 * @param {object} options.amount amount of the payment
 * @returns {void} nothing
 */
const sendRentPaymentNotificationAndEmail = (options) => {
  try {
    let { property, renter_details, send_to, amount } = options;    // landlord id can be of property manager
    User.findById(send_to).then(receiver_details => {

      // Sending email notification to landlord
      rentPaidEmail({
        email: receiver_details.email,
        fullName: receiver_details.fullName,
        amount: amount,
        property_name: property.propertyName,
        renter_name: renter_details.fullName,
      })

      // Sending system notification to landlord
      const notification_payload = {};
      notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.property_view;
      notification_payload.notificationHeading = "Rent Paid";
      notification_payload.notificationBody = `${renter_details.fullName ?? ""} paid rent successfully for ${property.propertyName}`;
      notification_payload.landlordID = property.landlord_id;
      notification_payload.propertyID = property._id;
      notification_payload.send_to = receiver_details._id;
      notification_payload.property_manager_id = property.property_manager_id;
      const metadata = {
        "propertyID": property._id.toString(),
        "redirectTo": "property",
      }
      NotificationService.createNotification(notification_payload, metadata, receiver_details)
    })
  } catch (error) {

  }
}

/**
 * 
 * To get rent transaction invoice html
 * 
 * @param {object} options 
 * @param {date} options.transaction_date transaction date
 * @param {number} options.amount amount
 * @param {string} options.property_name name of property
 * @param {string} options.description description of transaction
 * @param {string} options.renter_name name of renter (Paid by)
 * @param {string} options.payment_method payment method
 * @returns {string} contains html in string format
 */
const getRentTransactionHtml = (options) => {
  const { transaction_date, amount, property_name, description, renter_name, payment_method, property_address } = options;
  let html = `
<!DOCTYPE html>
<html>
<head>
  <title>Transaction Receipt</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #F8F9FA; color: #333;">
  <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #FFFFFF; ">
    <!-- Header Section -->
    <div style="text-align: right; margin-bottom: 30px;">
      <img src="${process.env.BACKEND_URL}/images/logo.png" alt="Rentranzact Logo" style="max-width: 150px;" />
    </div>
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="margin: 10px 0; color: #13556d;">Transaction Receipt</h2>
      <hr/>
      <p style="color: #555;">Generated from Rentranzact on ${moment().format("DD/MM/YYYY HH:MM")}</p>
    </div>
    <!-- Content Section -->
    <div style="line-height: 1.6;">
      <p>
        <strong style="display: inline-block; width: 200px;">
          <span style="color:#cee83a">Transaction Date:</span>
        </strong>
        <span style="color:#54bdc3"> 
          ${moment(transaction_date).format("DD/MM/YYYY HH:MM")}
        </span>
      </p>
      <p><strong style="display: inline-block; width: 200px;"><span style="color:#cee83a">Transaction Amount:</span></strong><span style="color:#54bdc3"> ₦${amount ?? ""}</span></p>
      <p><strong style="display: inline-block; width: 200px;"><span style="color:#cee83a">Amount in Words:</span></strong><span style="color:#54bdc3"> ${numberToWords(amount) ?? ""} Naira</span></p>
      <p><strong style="display: inline-block; width: 200px;"><span style="color:#cee83a">Property Name:</span></strong><span style="color:#54bdc3"> ${property_name ?? ""}</span></p>
      <p><strong style="display: inline-block; width: 200px;"><span style="color:#cee83a">Property Address:</span></strong><span style="color:#54bdc3"> ${property_address ?? ""}</span></p>
      <p><strong style="display: inline-block; width: 200px;"><span style="color:#cee83a">Payment Description:</span></strong><span style="color:#54bdc3"> ${description ?? ""}</span></p>
      <p><strong style="display: inline-block; width: 200px;"><span style="color:#cee83a">Paid by:</span></strong><span style="color:#54bdc3"> ${renter_name ?? ""}</span></p>
      <p><strong style="display: inline-block; width: 200px;"><span style="color:#cee83a">Received by:</span></strong><span style="color:#54bdc3"> Rentranzact Ltd</span></p>
      <p><strong style="display: inline-block; width: 200px;"><span style="color:#cee83a">Payment Method:</span></strong><span style="color:#54bdc3">${payment_method ?? ""}</span></p>
    </div>
    <hr/>
    
    <!-- Disclaimer Section -->
    <div style="margin-top: 20px; font-size: 0.9em; color: #666;">
      <p style="color: #555;  text-align: center;  margin-bottom: 20px;">DISCLAIMER</p>
      <p style="font-size: 6px margin: 10px 0;">Your payment has been successful and the beneficiary's account will be credited. However, this does not serve as confirmation of payment into the beneficiary's account. Please allow a minimum of 24 hours for confirmation of payment except for public holidays and weekends which could take longer.</p>
      <p style="font-size: 6px margin: 10px 0;">Due to the nature of the internet, transactions may be subject to interruption, transmission blackout, delayed transmission, and incorrect data transmission from your bank. Rentranzact will not be liable in these circumstances.</p>
      <p style="font-size: 6px margin: 10px 0;">For further questions or inquiries, please call <strong style="color: #333;">0123456789</strong> or send an email to <a href="mailto:support@rentranzact.com" style="color: #007BFF;">support@rentranzact.com</a>.</p>
      <p style="margin: 10px 0; text-align: center;  margin-top: 20px; font-weight: bold">Thank you for choosing Rentranzact.</p>
    </div>
  </div>
</body>
</html>   
  `

  return html;
}

export {
  getMyTransaction,
  transactionByIdService,
  sendRentPaymentNotificationAndEmail,
  getRentTransactionHtml
}