import mongoose from "mongoose";
import { rentApplication } from "../models/rentApplication.model.mjs";
import { RentApplicationStatus } from "../enums/rentApplication.enums.mjs";



async function addRentApplicationService(body, fileUrl, renterID) {
  const {
    propertyID,
    employmentStatus,
    employerName,
    employerAddress,
    occupation,
    kinName,
    kinContactNumber,
    kinEmail,
    relationshipKin,
    name,
    no_of_occupant,
    checkinDate,
    emailID,
    contactNumber,
    martialStatus,
    age,
    rentNowPayLater,
    permanentAddress,
    permanentCity,
    permanentState,
    permanentZipcode,
    permanentContactNumber
  } = body;

  const payload = {
    propertyID: propertyID,
    employmentStatus,
    employerName,
    employerAddress,
    occupation,
    kinName,
    kinContactNumber,
    kinEmail,
    relationshipKin,
    name,
    no_of_occupant: parseInt(no_of_occupant),
    checkinDate,
    emailID,
    contactNumber,
    martialStatus,
    age: parseInt(age),
    rentNowPayLater: Boolean(rentNowPayLater),
    idImage: fileUrl,
    renterID: renterID,
    permanentAddress,
    permanentCity,
    permanentState,
    permanentZipcode,
    permanentContactNumber
  };


  try {
    const data = new rentApplication(payload);
    data.save();

    return {
      data: data,
      message: "rent application successfully created",
      status: true,
      statusCode: 200,
    };
  } catch (error) {
    console.log(error);
    // res.status(500).send("Error searching for properties: " + error.message);
  }
}

async function rentApplicationsList(user) {


  let data;

  if (user?.role === "Renter") {

    console.log(user, "====userrrrr")











    data = await rentApplication.aggregate([
      {
        $match: {
          renterID: user?._id // Match documents where renterID matches user._id
        }
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
                phone: 1
              }
            }
          ],
          as: "renter_info",

        }
      }, {
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
                propertyName: 1
              }
            }
          ],
          as: "property_info"
        }
      }

    ]);
    console.log(data);




    return {
      data: data,
      message: "rent application fetched successfully",
      status: true,
      statusCode: 200,
    };


  }

  else if (user?.role === "Landlord") {


    console.log(user, "======================userid")

    const data = await rentApplication.aggregate([
      // Match stage to filter based on Renter role and token ID
      {
        $match: {
          renterID: user?._id // Assuming user._id is an ObjectId
        }
      },
      // Lookup stage to join with users collection to get renter's name, mobile, and profilepic
      {
        $lookup: {
          from: "users",
          localField: "renterID",
          foreignField: "_id",
          as: "renter_info"
        }
      },
      // Unwind the renter_info array since lookup returns an array
      {
        $unwind: "$renter_info"
      },
      // Lookup stage to join with properties collection to get property name
      {
        $lookup: {
          from: "properties",
          localField: "propertyID",
          foreignField: "_id",
          as: "property_info"
        }
      },
      // Unwind the property_info array since lookup returns an array
      {
        $unwind: "$property_info"
      },
      // Project to shape the final output
      {
        $project: {
          _id: 0,
          renter_name: "$renter_info.fullName",
          renter_mobile: "$renter_info.phone",
          renter_profilepic: "$renter_info.picture",
          property_name: "$property_info.propertyName"
          // Add more fields if needed
        }
      }
    ]);




    console.log(data, "-------sajksjaksj")

  } else {

  }


}


async function updateRentApplications(body, id) {
  const { status, rentApplicationID, reason } = body;

  if (RentApplicationStatus.ACCEPTED === status) {
    const data = await rentApplication.findByIdAndUpdate(rentApplicationID, {
      status: status
    });

    return {
      data: data,
      message: "rent application completed successfully",
      status: true,
      statusCode: 200,
    };
  } else if (RentApplicationStatus.CANCELED === status) {
    const data = await rentApplication.findByIdAndUpdate(rentApplicationID, {
      status: status,
      statusUpdateBy: id,
      cancelReason: reason
    });

    return {
      data: data,
      message: "rent application canceled successfully",
      status: true,
      statusCode: 200,
    };
  }
}

export { addRentApplicationService, rentApplicationsList, updateRentApplications };
