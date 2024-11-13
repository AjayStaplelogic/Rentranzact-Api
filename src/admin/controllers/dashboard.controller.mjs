// import { getDashboardStats } from "../services/dashboard.service.mjs";
import moment from "moment";
import { getDashboardStats } from "../services/dashboard.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { User } from "../../user/models/user.model.mjs";
import { UserRoles } from "../../user/enums/role.enums.mjs";


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

export {
  dashboard,
  getUserOnboardingStats,
  getUserOnboardingStatsPercentage

};
