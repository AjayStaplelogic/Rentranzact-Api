import { sendResponse } from "../helpers/sendResponse.mjs";
import { addRentApplicationService, rentApplicationsList, updateRentApplications, getRentApplicationsByUserID, getRentApplicationByID } from "../services/rentapplication.service.mjs"
import { rentApplication } from "../models/rentApplication.model.mjs";
import { identityVerifier } from "../helpers/identityVerifier.mjs";
import { UserRoles } from "../enums/role.enums.mjs";

async function addRentApplication(req, res) {

  const body = req.body;
  const user = req.user.data;

  const data = await addRentApplicationService(body, user);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);

}

async function rentApplications(req, res) {

  const userData = req.user.data;
  const data = await rentApplicationsList(userData, req);
  sendResponse(res, data.data, data.message, data.status, data.statusCode, [], data.pagination);
}


async function rentApplicationsByID(req, res) {

  const id = req.params.id;
  const data = await getRentApplicationByID(id);
  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}


async function rentApplicationUpdate(req, res) {

  const id = req.user.data._id;
  const { body } = req;

  const data = await updateRentApplications(body, id);


  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function getRentApplications(req, res) {
  // console.log("[Rent Application API]")
  const id = req.user.data._id;
  const role = req.user.data.role;
  const PropertyID = req.params.id;
  const data = await getRentApplicationsByUserID(id, role, PropertyID)
  sendResponse(res, data.data, data.message, data.status, data.statusCode);

}

async function editRentApplication(req, res) {
  try {
    let { id } = req.body;
    if (!id) {
      return sendResponse(res, {}, "Id required", false, 400);
    }

    let get_application = await rentApplication.findById(id).lean().exec();
    if (get_application) {
      let kin_modified = false;
      if (get_application.kinFirstName != req.body.kinFirstName) {
        kin_modified = true;
      } else if (get_application.kinLastName != req.body.kinLastName) {
        kin_modified = true;
      } else if (get_application.kinMiddleName != req.body.kinMiddleName) {
        kin_modified = true;
      } else if (get_application.bvn != req.body.bvn) {
        kin_modified = true;
      } else if (get_application.kinDOB != req.body.kinDOB) {
        kin_modified = true;
      } else if (get_application.nin != req.body.nin) {
        kin_modified = true;
      } else if (get_application.voter_id != req.body.voter_id) {
        kin_modified = true;
      }

      if (kin_modified) {
        const kinDetails = {
          first_name: req.body.kinFirstName,
          last_name: req.body.kinLastName,
          middle_name: req.body.kinMiddleName,
          bvn: req.body.bvn,
          dob: req.body.kinDOB,
          nin: req.body.nin,
          voter_id: req.body.voter_id
        }

        const verifyStatus = await identityVerifier(req.body.identificationType, kinDetails);
        // console.log(verifyStatus, '=====verifyStatus')
        if (!verifyStatus) {
          return sendResponse(res, {}, "Kin details is incorrect", false, 400);
        }
      }

      let update_application = await rentApplication.findByIdAndUpdate(id, req.body, { new: true })
      if (update_application) {
        return sendResponse(res, update_application, "rent application updated successfully", true, 200);
      }
      throw "Server Error"
    }
    return sendResponse(res, {}, "Invalid Id", false, 400);

  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 500);
  }

}

async function getAllRentApplications(req, res) {
  try {
    let { search, applicationStatus, sortBy, propertyID } = req.query;
    let page = Number(req.query.page || 1);
    let count = Number(req.query.count || 20);
    let skip = Number(page - 1) * count;
    let query = {};
    let query2 = {};
    if (req?.user?.data?.role == UserRoles.RENTER) {
      query.renterID = req?.user?.data?._id;
    } else if (req?.user?.data?.role == UserRoles.LANDLORD) {
      query.landlordID = req?.user?.data?._id;
    }

    if (applicationStatus) {
      query.applicationStatus = { $in: applicationStatus.split(',') };
    }

    if (propertyID) { query.propertyID = propertyID; };

    let field = "updatedAt";
    let order = "desc";
    let sort_query = {};
    if (sortBy) {
      field = sortBy.split(' ')[0];
      order = sortBy.split(' ')[1];
    }
    sort_query[field] = order == "desc" ? -1 : 1;

    if (search) {
      query2.$or = [
        { "property_info.propertyName": { "$regex": search, "$options": "i" } },
        { "renter_info.fullName": { "$regex": search, "$options": "i" } },
        { name: { "$regex": search, "$options": "i" } },
        { employerName: { "$regex": search, "$options": "i" } },
      ]
    }

    let pipeline = [
      {
        $match: query
      },
      {
        $lookup: {
          from: "users",
          let: { renter_ID: { $toObjectId: "$renterID" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$renter_ID"] }
              }
            },
            {
              $project: {
                _id: 1,
                fullName: 1, // Include fullName field from users collection
                countryCode: 1,
                phone: 1,
                picture: 1

              }
            }
          ],
          as: "renter_info",
        }
      },
      {
        $unwind : {
          path : "$renter_info",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "properties",
          let: { propertyID: { $toObjectId: "$propertyID" } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$propertyID"]
                }
              }
            },
            {
              $project: {
                _id: 1,
                propertyName: 1,
                images: "$images",
                address: "$address"
              }
            }
          ],
          as: "property_info"
        }
      },
      {
        $unwind : {
          path : "$property_info",
          preserveNullAndEmptyArrays: true
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
          ]
        }
      }
    ]
    let data = await rentApplication.aggregate(pipeline);
    return sendResponse(res, data, "Success", true, 200);

  } catch (error) {
    return sendResponse(res, {}, `${error}`, false, 500);
  }

}
export { addRentApplication, rentApplications, rentApplicationUpdate, getRentApplications, rentApplicationsByID, editRentApplication, getAllRentApplications };
