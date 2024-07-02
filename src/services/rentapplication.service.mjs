import mongoose from "mongoose";
import { rentApplication } from "../models/rentApplication.model.mjs";
import { RentApplicationStatus } from "../enums/rentApplication.enums.mjs";
import { Property } from "../models/property.model.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import { identityVerifier } from "../helpers/identityVerifier.mjs";
import moment from "moment";

async function addRentApplicationService(body, user) {
  try {

    console.log(body, "=========bodyyyyyyyyyyyyyyyy==========")

    const renterID = user._id;

    const {
      propertyID,
      employmentStatus,
      employerName,
      employerAddress,
      occupation,
      kinFirstName,
      kinLastName,
      kinDOB,
      kinDriverLicence,
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
      permanentContactNumber,
      identificationType
    } = body;

    const landlord = await Property.findById(propertyID);

    const payload = {
      propertyID: propertyID,
      employmentStatus,
      employerName,
      employerAddress,
      occupation,
      kinFirstName,
      kinLastName,
      kinDOB,
      kinDriverLicence,
      kinContactNumber,
      kinEmail,
      relationshipKin,
      name,
      no_of_occupant: no_of_occupant,
      checkinDate,
      emailID,
      contactNumber,
      martialStatus,
      age: age,
      rentNowPayLater: rentNowPayLater,
      renterID: renterID,
      permanentAddress,
      permanentCity,
      permanentState,
      permanentZipcode,
      permanentContactNumber,
      landlordID: landlord.landlord_id
    };


    const kinDetails = {
      first_name: kinFirstName,
      last_name: kinLastName,
      drivers_license: kinDriverLicence,
      dob: kinDOB
    }

    const verifyStatus = await identityVerifier(identificationType, body);

    console.log(verifyStatus.data.status, "=====verifyStatus")

    let data;

    if (verifyStatus.data.error) {

      return {
        data: [],
        message: verifyStatus.message,
        status: false,
        statusCode: 400,
      };


    } else {

      if (verifyStatus.data.status) {

        const formattedDate = moment(kinDOB, "DD-MM-YYYY").format("DD-MMM-YYYY");

        console.log(verifyStatus.data.data.firstName, "-----lowercase")

        const firstName = verifyStatus.data.data.firstName.toLowerCase();

        const lastName = verifyStatus.data.data.lastName.toLowerCase();

        if (verifyStatus.data.data.dateOfBirth === formattedDate && firstName === kinFirstName.toLowerCase() && lastName === kinLastName.toLowerCase()) {

          payload.kinIdentityCheck = verifyStatus.data.data.status;
          payload.verifcationType = identificationType;

          data = new rentApplication(payload);

          data.save();

          return {
            data: data,
            message: "rent application successfully created",
            status: true,
            statusCode: 200,
          };
        }

      } else {

        data = new rentApplication(payload);

        data.save();

        return {
          data: data,
          message: "rent application successfully created",
          status: true,
          statusCode: 200,
        };

      }
    }


  } catch (error) {
    console.log(error);
    // res.status(500).send("Error searching for properties: " + error.message);
  }
}

async function rentApplicationsList(user) {


  let data;

  if (user?.role === "Renter") {

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

    return {
      data: data,
      message: "rent application fetched successfully",
      status: true,
      statusCode: 200,
    };


  }

  else if (user?.role === "Landlord") {


    data = await rentApplication.aggregate([
      {
        $match: {
          landlordID: user?._id // Match documents where renterID matches user._id
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


    return {
      data: data,
      message: "rent application fetched successfully",
      status: true,
      statusCode: 200,
    };

    console.log(data, "-------sajksjaksj")

  } else {

  }


}


async function updateRentApplications(body, id) {
  const { status, rentApplicationID, reason } = body;

  console.log(body, "----")

  if (RentApplicationStatus.ACCEPTED === status) {
    const data = await rentApplication.findByIdAndUpdate(rentApplicationID, {
      applicationStatus: status
    },
      { new: true });

    console.log(data, "===data ====")

    const data2 = await Property.findByIdAndUpdate(data.propertyID, {
      rented: true,
      renterID: data.renterID
    })



    return {
      data: data,
      message: "rent application completed successfully",
      status: true,
      statusCode: 200,
    };
  } else if (RentApplicationStatus.CANCELED === status) {
    const data = await rentApplication.findByIdAndUpdate(rentApplicationID, {
      applicationStatus: status,
      cancelReason: reason
    });

    console.log(data)

    return {
      data: data,
      message: "rent application canceled successfully",
      status: true,
      statusCode: 200,
    };
  }
}

async function getRentApplicationsByUserID(id, role, PropertyID) {

  let data;
  if (role === UserRoles.LANDLORD) {
    data = await rentApplication.find({
      landlordID: id,
      propertyID: PropertyID,
      applicationStatus: RentApplicationStatus.PENDING
    })
  }
  return {
    data: data,
    message: "rent application completed successfully",
    status: true,
    statusCode: 200,
  };
}

export { addRentApplicationService, rentApplicationsList, updateRentApplications, getRentApplicationsByUserID };
