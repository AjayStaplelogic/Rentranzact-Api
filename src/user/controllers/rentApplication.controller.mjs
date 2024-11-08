import { sendResponse } from "../helpers/sendResponse.mjs";
import { addRentApplicationService, rentApplicationsList, updateRentApplications, getRentApplicationsByUserID, getRentApplicationByID } from "../services/rentapplication.service.mjs"
import { rentApplication } from "../models/rentApplication.model.mjs";
import { identityVerifier } from "../helpers/identityVerifier.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import { User } from "../models/user.model.mjs";
import { RentApplicationStatus } from "../enums/rentApplication.enums.mjs";
import { Property } from "../models/property.model.mjs";

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
  console.log(`[Rent Application By Id API]`)
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
      let personal_info_modified = false;
      if (get_application.firstName != req.body.firstName) {
        personal_info_modified = true;
      } else if (get_application.lastName != req.body.lastName) {
        personal_info_modified = true;
      } else if (get_application.middleName != req.body.middleName) {
        personal_info_modified = true;
      } else if (get_application.bvn != req.body.bvn) {
        personal_info_modified = true;
      } else if (get_application.kinDOB != req.body.kinDOB) {
        personal_info_modified = true;
      } else if (get_application.nin != req.body.nin) {
        personal_info_modified = true;
      } else if (get_application.voter_id != req.body.voter_id) {
        personal_info_modified = true;
      }

      if (personal_info_modified) {
        const smile_identification_payload = {
          first_name: req.body.firstName,
          last_name: req.body.lastName,
          middle_name: req.body.middleName,
          bvn: req.body.bvn,
          dob: req.body.kinDOB,
          nin: req.body.nin,
          voter_id: req.body.voter_id
        }

        const verifyStatus = await identityVerifier(req.body.identificationType, smile_identification_payload);
        // console.log(verifyStatus, '=====verifyStatus')
        if (!verifyStatus) {
          return sendResponse(res, {}, "Personal information is incorrect", false, 400);
        }
        req.body["isPersonalDetailsVerified"] = true;

      }

      let update_application = await rentApplication.findByIdAndUpdate(id, req.body, { new: true })
      if (update_application) {
        let user_update_payload = {
          maritialStatus: update_application.maritialStatus,
          phone: update_application.contactNumber,
          age: update_application.age,
          permanentAddress: {
            permanentAddress: update_application.permanentAddress,
            permanentCity: update_application.permanentCity,
            permanentState: update_application.permanentState,
            permanentZipcode: update_application.permanentZipcode,
            permanentContactNumber: update_application.permanentContactNumber,
          },
          employmentDetails: {
            employmentStatus: update_application.employmentStatus,
            employerName: update_application.employerName,
            employerAddress: update_application.employerAddress,
            employmentStatus: update_application.employmentStatus,
            occupation: update_application.occupation
          }
        };
        user_update_payload.fullName = update_application.firstName;
        if (update_application.middleName) {
          user_update_payload.fullName.concat(' ', update_application.middleName)
        }

        if (update_application.lastName) {
          user_update_payload.fullName.concat(' ', update_application.lastName)
        }

        user_update_payload.kinDetails = {
          first_name: update_application.kinFirstName,
          last_name: update_application.kinLastName,
          middle_name: update_application.kinMiddleName,
          bvn: update_application.bvn,
          dob: update_application.kinDOB,
          nin: update_application.nin,
          voter_id: update_application.voter_id,
          kinContactNumber: update_application.kinContactNumber,
          kinEmail: update_application.kinEmail,
          relationshipKin: update_application.relationshipKin,
          identificationType: update_application.verifcationType,
        }

        await User.findByIdAndUpdate(update_application.renterID, user_update_payload, { new: true })

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
        $unwind: {
          path: "$renter_info",
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
        $unwind: {
          path: "$property_info",
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

async function getLastApplication(req, res) {
  try {
    const data = await rentApplication.findOne({
      renterID: req.user.data._id,
      applicationStatus: { $nin: [RentApplicationStatus.CANCELED, RentApplicationStatus.WITHDRAW] }
    }).sort({ createdAt: -1 }).lean().exec();
    const renter = req.user.data;

    if (data) {
      data.renter_info = {
        _id: renter._id,
        countryCode: renter.countryCode,
        fullName: renter.fullName,
        phone: renter.phone,
        picture: renter.picture
      }

      if (data.landlordID) {
        data.landlord_info = await User.findById(data.landlordID, {
          _id: 1,
          fullName: 1,
          countryCode: 1,
          phone: 1,
          picture: 1
        })
      }

      if (data.propertyID) {
        data.property_info = await Property.findById(data.propertyID, {
          _id: 1,
          propertyName: 1,
          images: 1,
          address: 1,
          type: 1,
          category: 1,
        })
      }
    }

    return sendResponse(res, data, "success", true, 200);
  } catch (error) {
    return sendResponse(res, null, error?.message, false, 400);
  }
}

export {
  addRentApplication,
  rentApplications,
  rentApplicationUpdate,
  getRentApplications,
  rentApplicationsByID,
  editRentApplication,
  getAllRentApplications,
  getLastApplication
};
