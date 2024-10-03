import { LeaseAggrements } from "../../user/models/leaseAggrements.model.mjs";
import { Property } from "../../user/models/property.model.mjs";
import { ObjectId } from 'bson';
import { Inspection } from "../../user/models/inspection.model.mjs";
import { InspectionStatus } from "../../user/enums/inspection.enums.mjs";

async function leaseAggrementsList(filters) {
  if (filters) {
    const data = await LeaseAggrements.find({ uploadedBy: filters })
    return {
      data: data,
      message: `successfully fetched  list`,
      status: true,
      statusCode: 201,
    };
  } else {
    const data = await LeaseAggrements.find()
    return {
      data: data,
      message: `successfully fetched  list`,
      status: true,
      statusCode: 201,
    };
  }

}

async function getPropertiesList() {
  const data = await Property.aggregate([{
    $lookup: {
      from: "users",
      let: { renter_ID: { $toObjectId: "$landlord_id" } },
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
            phone: 1

          }
        }
      ],
      as: "landlord_info",

    }
  }, {

    $lookup: {
      from: "users",
      let: { renter_ID: { $toObjectId: "$property_manager_id" } },
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
      as: "propertyManager_info",

    }

  }
  ])

  return {
    data: data,
    message: `successfully fetched  list`,
    status: true,
    statusCode: 201,
  };
}

async function getPropertyByID(id) {
  const id1 = new ObjectId(id)
  const data = await Property.aggregate([

    {

      $match: {
        "_id": id1
      }
    },

    {
      $lookup: {
        from: "users",
        let: { renter_ID: { $toObjectId: "$landlord_id" } },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$renter_ID"] }
            }
          }
        ],
        as: "landlord_info",

      }
    }
  ])


  // console.log(data,"=====data by id")
  return {
    data: data,
    message: `successfully fetched  list`,
    status: true,
    statusCode: 201,
  };

}

async function deletePropertyByID(id) {
  try {
    const data = await Inspection.find({
      inspectionStatus: InspectionStatus.ACCEPTED,
      propertyID: id
    });

    if (data.length > 0) {
      return {
        data: [],
        message: "Unable To Delete Property",
        status: false,
        statusCode: 400,
      };
    }

    const property = await Property.findByIdAndDelete(id);
    if (property) {
      return {
        data: data,
        message: "Property Deleted Successfully",
        status: true,
        statusCode: 200,
      };
    }
    return {
      data: [],
      message: "Invalid Id",
      status: false,
      statusCode: 400,
    };
  } catch (error) {
    return {
      data: [],
      message: error.message,
      status: false,
      statusCode: 400,
    };
  }
}

export {
  getPropertiesList,
  getPropertyByID,
  deletePropertyByID,
  leaseAggrementsList
}