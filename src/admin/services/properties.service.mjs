import { LeaseAggrements } from "../../user/models/leaseAggrements.model.mjs";
import { Property } from "../../user/models/property.model.mjs";
import { ObjectId } from 'bson';


async function leaseAggrementsList(filters) {
  if(filters) {
    const data = await LeaseAggrements.find({uploadedBy : filters})
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
  const data = await Property.findByIdAndDelete(id)
  return {
    data: data,
    message: `deleted property successfully`,
    status: true,
    statusCode: 201,
  };

}

export {
  getPropertiesList,
  getPropertyByID,
  deletePropertyByID,
  leaseAggrementsList
}