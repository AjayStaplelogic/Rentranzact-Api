import { subscribeNewsletter } from "../services/newsletter.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import {
  createInspection,
  fetchInspections,
  updateInspectionStatus,
  inspectionEditService,
  getAvailableDatesService,
  getInspectionsByUserID,
  searchInspectionService
} from "../services/inspection.service.mjs";
import { Inspection } from "../models/inspection.model.mjs";
import { UserRoles } from "../enums/role.enums.mjs";


async function getAvailableDates(req, res) {
  const { id } = req.params;

  const data = await getAvailableDatesService(id);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function addInspection(req, res) {
  const { body } = req;

  const renterID = req.user.data._id;

  const data = await createInspection(body, renterID);
  

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function getInsepction(req, res) {
  const userData = req.user.data;

  const data = await fetchInspections(userData, req);
  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function inspectionUpdate(req, res) {
  const id = req.user.data._id;
  const { body } = req;

  const data = await updateInspectionStatus(body, id);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function inspectionEdit(req, res) {
  const { body } = req;

  const data = await inspectionEditService(body);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function getInspectionRequests(req, res) {
 
  const id = req.user.data._id;
  const role = req.user.data.role;
  const PropertyID = req.params.id;

  const data = await getInspectionsByUserID(id, role, PropertyID)
  sendResponse(res, data.data, data.message, data.status, data.statusCode);


}

async function searchInspection(req, res) {
 
  const id = req.user.data._id;
  const role = req.user.data.role;
  const {search} = req.query;
  const {status} = req.query;


  // console.log(id , role , search , status , "==parammmmsss")

  const data = await searchInspectionService(id, role, search ,status);
  sendResponse(res, data.data, data.message, data.status, data.statusCode);

}

async function getAllInspections (req, res){
  try {
      const role = req.user.data.role;
      let { propertyID, search, inspectionStatus, sortBy } = req.query;
      let page = Number(req.query.page || 1);
      let count = Number(req.query.count || 20);
      let query = {};
      let query2 = {};
      if (propertyID) { query.propertyID = propertyID };
      if (role == UserRoles.LANDLORD) { query.landlordID = req.user.data._id };
      if (role == UserRoles.RENTER) { query["RenterDetails.id"] = req.user.data._id };
      if(inspectionStatus){query.inspectionStatus = {$in : inspectionStatus.split(",")}}

      let skip = Number(page - 1) * count;
      if (search) {
          query2.$or = [
              { message: { $regex: search, $options: 'i' } },
              { "RenterDetails.fullName": { $regex: search, $options: 'i' } },
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
      let pipeline = [
          {
              $match: query
          },
          {
            $set : {
              propertyID : {$toObjectId : "$propertyID"},
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
              $project: {
                  RenterDetails : "$RenterDetails",
                  inspectionTime : "$inspectionTime",
                  inspectionDate : "$inspectionDate",
                  message : "$message",
                  inspectionApproved : "$inspectionApproved",
                  inspectionStatus : "$inspectionStatus",
                  propertyID : "$propertyID",
                  landlordID : "$landlordID",
                  id : "$id",
                  fullDay : "$fullDay",
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

      ]
      let get_inspections = await Inspection.aggregate(pipeline);
      return sendResponse(res, get_inspections, "success", true, 200);
  } catch (error) {
      return sendResponse(res, {}, `${error}`, false, 500);
  }
}

export {
  addInspection,
  getInsepction,
  inspectionUpdate,
  inspectionEdit,
  getAvailableDates,
  getInspectionRequests,
  searchInspection,
  getAllInspections
};
