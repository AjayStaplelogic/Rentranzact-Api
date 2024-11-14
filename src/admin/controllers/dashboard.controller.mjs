// import { getDashboardStats } from "../services/dashboard.service.mjs";
import moment from "moment";
import { getDashboardStats } from "../services/dashboard.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { User } from "../../user/models/user.model.mjs";
import { UserRoles } from "../../user/enums/role.enums.mjs";
import { Transaction } from "../../user/models/transactions.model.mjs";
import { ETRANSACTION_TYPE } from "../../user/enums/common.mjs";


async function dashboard(req, res) {
  const data = await getDashboardStats();

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

const getUserOnboardingStats = async (req, res) => {
  try {
    let { year } = req.query;
    if (!year) {
      year = moment().format('YYYY');
    }

    const query = {
      deleted: false
    };

    const query2 = {
      year: Number(year),
    };

    const pipeline = [
      {
        $match: query
      },
      {
        $project: {
          _id: "$_id",
          role: "$role",
          createdAt: "$createdAt",
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          landlord_count: {
            $cond: {
              if: { $eq: ["$role", UserRoles.LANDLORD] },
              then: 1,
              else: 0
            }
          },
          renter_count: {
            $cond: {
              if: { $eq: ["$role", UserRoles.RENTER] },
              then: 1,
              else: 0
            }
          },
          pm_count: {
            $cond: {
              if: { $eq: ["$role", UserRoles.PROPERTY_MANAGER] },
              then: 1,
              else: 0
            }
          }
        }
      },
      {
        $match: query2
      },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
          },
          year: { $first: "$year" },
          month: { $first: "$month" },
          landlord_count: { $sum: "$landlord_count" },
          renter_count: { $sum: "$renter_count" },
          pm_count: { $sum: "$pm_count" },
          count: { $sum: 1 },
        }
      },
      {
        $unset: ["_id"]
      },
      {
        $sort: {
          year: 1,
          month: 1
        }
      }
    ];

    const data = await User.aggregate(pipeline);
    sendResponse(res, data, "success", true, 200);

  } catch (error) {
    sendResponse(res, null, error.message, false, 400);

  }
}
const getUserOnboardingStatsPercentage = async (req, res) => {
  try {
    const query = {
      deleted: false
    };

    const pipeline = [
      {
        $match: query
      },
      {
        $project: {
          _id: "$_id",
          landlord_count: {
            $cond: {
              if: { $eq: ["$role", UserRoles.LANDLORD] },
              then: 1,
              else: 0
            }
          },
          renter_count: {
            $cond: {
              if: { $eq: ["$role", UserRoles.RENTER] },
              then: 1,
              else: 0
            }
          },
          pm_count: {
            $cond: {
              if: { $eq: ["$role", UserRoles.PROPERTY_MANAGER] },
              then: 1,
              else: 0
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          landlord_count: { $sum: "$landlord_count" },
          renter_count: { $sum: "$renter_count" },
          pm_count: { $sum: "$pm_count" },
          total_count: { $sum: 1 },
        }
      },
      {
        $project: {
          landlord_per: {
            $multiply: [100, { $divide: ["$landlord_count", "$total_count"] }]
          },
          renter_per: {
            $multiply: [100, { $divide: ["$renter_count", "$total_count"] }]
          },
          pm_per: {
            $multiply: [100, { $divide: ["$pm_count", "$total_count"] }]
          },
        }
      },
      {
        $unset: ["_id"]
      },
    ];

    const data = await User.aggregate(pipeline);
    sendResponse(res, data, "success", true, 200);

  } catch (error) {
    sendResponse(res, null, error.message, false, 400);

  }
}
const getRevenueStats = async (req, res) => {
  try {
    let { year } = req.query;
    if (!year) {
      year = moment().format('YYYY');
    }

    const query = {
      transaction_type: ETRANSACTION_TYPE.rentPayment
    };

    const query2 = {
      year: Number(year),
    };

    const pipeline = [
      {
        $match: query
      },
      {
        $project: {
          _id: "$_id",
          amount: "$amount",
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        }
      },
      {
        $match: query2
      },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
          },
          year: { $first: "$year" },
          month: { $first: "$month" },
          total_revenue: { $sum: "$amount" },
        }
      },
      {
        $unset: ["_id"]
      },
    ];

    const data = await Transaction.aggregate(pipeline);
    sendResponse(res, data, "success", true, 200);

  } catch (error) {
    sendResponse(res, null, error.message, false, 400);

  }
}
const getFinancialPerformanceStats = async (req, res) => {
  try {
    let { start_date, end_date } = req.query;
    const query = {
      transaction_type: ETRANSACTION_TYPE.rentPayment
    };

    if (start_date && end_date) {
      query.createdAt = {
        $gte: new Date(Number(start_date) * 1000),
        $lt: new Date(Number(end_date) * 1000)
      };
    }

    const pipeline = [
      {
        $match: query
      },
      {
        $project: {
          _id: "$_id",
          caution_fee: {
            $cond: {
              if: { $gt: ["$allCharges.caution_deposite", 0] },
              then: "$allCharges.caution_deposite",
              else: 0
            }
          },
          rent_fee: {
            $cond: {
              if: { $gt: ["$allCharges.rent", 0] },
              then: "$allCharges.rent",
              else: 0
            }
          },
          legal_fee: {
            $cond: {
              if: { $gt: ["$allCharges.legal_Fee", 0] },
              then: "$allCharges.legal_Fee",
              else: 0
            }
          },
          service_charge: {
            $cond: {
              if: { $gt: ["$allCharges.service_charge", 0] },
              then: "$allCharges.service_charge",
              else: 0
            }
          },
          agency_fee: {
            $cond: {
              if: { $gt: ["$allCharges.agency_fee", 0] },
              then: "$allCharges.agency_fee",
              else: 0
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          caution_fee: { $sum: "$caution_fee" },
          rent_fee: { $sum: "$rent_fee" },
          legal_fee: { $sum: "$legal_fee" },
          service_charge: { $sum: "$service_charge" },
          agency_fee: { $sum: "$agency_fee" },
        }
      },
      {
        $unset: ["_id"]
      },
    ];

    const data = await Transaction.aggregate(pipeline);
    sendResponse(res, data, "success", true, 200);

  } catch (error) {
    sendResponse(res, null, error.message, false, 400);

  }
}
export {
  dashboard,
  getUserOnboardingStats,
  getUserOnboardingStatsPercentage,
  getRevenueStats,
  getFinancialPerformanceStats
};
