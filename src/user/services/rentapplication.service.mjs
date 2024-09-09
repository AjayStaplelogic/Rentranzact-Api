import mongoose from "mongoose";
import { rentApplication } from "../models/rentApplication.model.mjs";
import { RentApplicationStatus } from "../enums/rentApplication.enums.mjs";
import { Property } from "../models/property.model.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import { identityVerifier } from "../helpers/identityVerifier.mjs";
import moment from "moment";
import { Notification } from "../models/notification.model.mjs";
import { User } from "../models/user.model.mjs";
import sendNotification from "../helpers/sendNotification.mjs";
import notificationType from "../constants/index.mjs";
import assert from "assert";

async function addRentApplicationService(body, user) {
  try {

    const renterID = user._id;

    const {
      propertyID,
      employmentStatus,
      occupation,
      kinFirstName,
      kinLastName,
      kinMiddleName,
      kinDOB,
      kinContactNumber,
      kinEmail,
      relationshipKin,
      name,
      no_of_occupant,
      emailID,
      contactNumber,
      maritialStatus,
      age,
      rentNowPayLater,
      permanentAddress,
      permanentCity,
      permanentState,
      permanentZipcode,
      permanentContactNumber,
      identificationType,
      bvn,
      nin,
      voter_id,
      checkinDate,
      checkoutDate,
      previousLandlordAddress,
      previousLandlordName,
      employerName,
      employerAddress
    } = body;


    const landlord = await Property.findById(propertyID);


    const payload = {
      propertyID: propertyID,
      employmentStatus,
      occupation,
      kinFirstName,
      kinLastName,
      kinMiddleName,
      kinDOB,
      nin,
      voter_id,
      bvn,
      kinContactNumber,
      kinEmail,
      relationshipKin,
      name,
      no_of_occupant: no_of_occupant,
      checkinDate,
      emailID,
      contactNumber,
      maritialStatus,
      age: age,
      rentNowPayLater: rentNowPayLater,
      renterID: renterID,
      permanentAddress,
      permanentCity,
      permanentState,
      permanentZipcode,
      permanentContactNumber,
      landlordID: landlord.landlord_id,
      pmID: landlord.property_manager_id,
      propertyName: landlord.propertyName,
      verifcationType: identificationType,
      previousLandlordAddress: previousLandlordAddress,
      previousLandlordName: previousLandlordName,
      employmentStatus: employmentStatus,
      employerName: employerName,
      employerAddress: employerAddress,
      occupation: occupation,

      firstName: body.firstName || "",
      middleName: body.middleName || "",
      lastName: body.lastName || "",
      gender: body.gender || "",
      alternativeContactNumber: body.alternativeContactNumber || "",
      kinMiddleName: body.kinMiddleName || "",
      expectedCoOccupents: Number(body.expectedCoOccupents) || 0,
      coOccupentName: body.coOccupentName || "",
      coOccupentContact: body.coOccupentContact || "",
      relationWithCoOccupent: body.relationWithCoOccupent || "",
      previouLandloadContact: body.previouLandloadContact || "",
      previouReasonForLeaving: body.previouReasonForLeaving || "",
      businessName: body.businessName || "",
      businessType: body.businessType || "",
      totalEmployees: Number(body.totalEmployees) || 0,
      identitiy_doc: body.identitiy_doc || "",
      preferredFloor: Number(body.preferredFloor) || 0
    };



    if (employmentStatus !== "unemployed") {

      payload["employerName"] = body.employerName

      payload["employerAddress"] = body.employerAddress
    }


    if (checkinDate && checkoutDate) {
      payload["checkinDate"] = checkinDate
      payload["checkoutDate"] = checkoutDate
    }


    const kinDetails = {
      first_name: kinFirstName,
      last_name: kinLastName,
      middle_name: kinMiddleName,
      bvn: bvn,
      dob: kinDOB,
      nin: nin,
      voter_id: voter_id,
      kinContactNumber: kinContactNumber,
      kinEmail: kinEmail,
      relationshipKin: relationshipKin
    }

    const renterDetails = await User.findById(renterID);

    function kinDetailsSame(kinDetails1, kinDetails2) {
      try {
        // Use deepEqual to compare the objects
        assert.deepStrictEqual(kinDetails1, kinDetails2);
        return true;
      } catch (error) {
        return false;
      }
    }

    let isKinSame = kinDetailsSame(kinDetails, renterDetails.kinDetails)

    let verifyStatus;

    if (isKinSame) {

      verifyStatus = true
    } else {

      console.log("hitting smile api")
      verifyStatus = await identityVerifier(identificationType, kinDetails);
    }




    // console.log(verifyStatus, "-ajdssajlksajdlksajdlkj")
    let data;







    if (verifyStatus) {

      //add kin details to the user

      kinDetails["identificationType"] = identificationType;

      const permanentAddress_ = {
        permanentAddress,
        permanentCity,
        permanentState,
        permanentZipcode,
        permanentContactNumber,
      }

      const employmentDetails = {
        employmentStatus,
        employerName,
        employerAddress,
        occupation
      }

      await User.findByIdAndUpdate(renterID, { kinDetails: kinDetails, age: age, maritialStatus: maritialStatus, permanentAddress: permanentAddress_, employmentDetails: employmentDetails })



      payload["kinIdentityCheck"] = true;

      data = new rentApplication(payload);

      data.save();


      // const metadata = {
      //   redirectTo: "rentApplication"
      // }

      // let notificationTitle = "Rent Application Update"

      const renterDetails = await User.findById(renterID);

      const landlordDetails = await User.findById(landlord.landlord_id)

      // let notificationBody = `${renterDetails.fullName} applied rent application for ${landlord.propertyName}`

      // const data_ = await sendNotification(landlordDetails, "single", notificationTitle, notificationBody, metadata, UserRoles.LANDLORD)

      let notification_payload = {};
      notification_payload.notificationHeading = "Rent Application Update";
      notification_payload.notificationBody = `${renterDetails.fullName} applied rent application for ${landlord.propertyName}`;
      notification_payload.renterID = renterID;
      notification_payload.landlordID = landlord.landlord_id;
      notification_payload.renterApplicationID = data._id;
      notification_payload.propertyID = landlord._id;
      let create_notification = await Notification.create(notification_payload);
      if (create_notification) {
        if (landlordDetails && landlordDetails.fcmToken) {
          const metadata = {
            "propertyID": landlord._id.toString(),
            "redirectTo": "rentApplication",
            "rentApplication": create_notification.renterApplicationID
          }
          await sendNotification(landlordDetails, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, UserRoles.LANDLORD)
        }
      }

      return {
        data: data,
        message: "rent application successfully created",
        status: true,
        statusCode: 200,
      };
    } else {
      return {
        data: data,
        message: "Kin details is incorrect",
        status: false,
        statusCode: 400,
      };



    }

  } catch (error) {
    console.log(error);
    // res.status(500).send("Error searching for properties: " + error.message);
  }
}

async function rentApplicationsList(user, req) {

  let { search, applicationStatus, sortBy, propertyID, kinIdentityCheck } = req.query;
  let page = Number(req.query.page || 1);
  let count = Number(req.query.count || 20);
  let skip = Number(page - 1) * count;
  let query = {};
  let query2 = {};
  if (req?.user?.data?.role == UserRoles.RENTER) {
    query.renterID = req?.user?.data?._id;
  } else if (req?.user?.data?.role == UserRoles.LANDLORD) {
    query.landlordID = req?.user?.data?._id;
  } else if (req?.user?.data?.role == UserRoles.PROPERTY_MANAGER) {

    query.pmID = req?.user?.data?._id;
  }

  if (applicationStatus) {
    query.applicationStatus = { $in: applicationStatus.split(',') };
  }

  if (propertyID) {
    query.propertyID = propertyID;
  }

  if (kinIdentityCheck) {
    if (kinIdentityCheck === "true") {
      query.kinIdentityCheck = true;
    } else if (kinIdentityCheck === "false") {
      query.kinIdentityCheck = false;
    }
  }

  let field = "createdAt";
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

  // console.log(query, "====query")
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
  // console.log(data, '===data')
  return {
    data: data[0]?.data,
    message: "rent application fetched successfully",
    status: true,
    statusCode: 200,
    pagination: data[0]?.pagination
  };

  if (user?.role === UserRoles.RENTER) {

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
                phone: 1,
                picture: 1

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
                propertyName: 1,
                address: 1,
                images: 1
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

  else if (user?.role === UserRoles.LANDLORD) {


    // console.log(user, "==============useerrrrrr")

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
                phone: 1,
                picture: 1

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

    // console.log(data, "==============data")

    return {
      data: data,
      message: "rent application fetched successfully",
      status: true,
      statusCode: 200,
    };

    // console.log(data, "-------sajksjaksj")

  } else {
    // console.log('Else Part')
  }


}


async function updateRentApplications(body, id) {
  const { status, rentApplicationID, reason } = body;

  if (RentApplicationStatus.ACCEPTED === status) {
    const data = await rentApplication.findByIdAndUpdate(rentApplicationID, {
      applicationStatus: status
    },
      { new: true });


    const propertyDetails = await Property.findById(data.propertyID);

    const landlordDetails = await User.findById(data.landlordID);

    let currentDate = moment().format('Do MMM YYYY');

    // console.log("propertyID", data.propertyID, "renterid", id, "landlord details ", landlordDetails, "property details", propertyDetails, "timestamp", currentDate)

    let title = `Your rent is due to ${landlordDetails.fullName}`;
    let notificationBody = `Your monthly rent of ₦ ${propertyDetails.rent} on ${currentDate}`


    const newNotification = new Notification({ amount: propertyDetails.rent, propertyID: data.propertyID, renterID: data.renterID, notificationHeading: title, notificationBody: notificationBody, renterApplicationID: rentApplicationID, landlordID: landlordDetails._id })

    const metadata = { "amount": propertyDetails.rent.toString(), "propertyID": data.propertyID.toString(), "redirectTo": "payRent", "rentApplication": rentApplicationID }

    const renterDetails = await User.findById(data.renterID);
    if (renterDetails && renterDetails.fcmToken) {
      const data_ = await sendNotification(renterDetails, "single", title, notificationBody, metadata, UserRoles.RENTER)

    }

    await newNotification.save()

    return {
      data: data,
      message: "rent application updated successfully",
      status: true,
      statusCode: 200,
    };
  } else if (RentApplicationStatus.CANCELED === status) {
    const data = await rentApplication.findByIdAndUpdate(rentApplicationID, {
      applicationStatus: status,
      cancelReason: reason
    });

    if (data) {
      const renterDetails = await User.findById(data.renterID);
      let notification_payload = {};
      notification_payload.notificationHeading = "Rent Application Cancelled";
      notification_payload.notificationBody = `Your rent application has beed cancelled by landlord`;
      notification_payload.renterID = data.renterID;
      notification_payload.landlordID = data.landlordID;
      notification_payload.renterApplicationID = data._id;
      notification_payload.propertyID = data.propertyID;
      let create_notification = await Notification.create(notification_payload);
      if (create_notification) {
        if (renterDetails && renterDetails.fcmToken) {
          const metadata = { "propertyID": data.propertyID.toString(), "redirectTo": "rentApplication", "rentApplication": create_notification.renterApplicationID }
          await sendNotification(renterDetails, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, UserRoles.RENTER)
        }
      }
    }
    // console.log(data)

    return {
      data: data,
      message: "rent application canceled successfully",
      status: true,
      statusCode: 200,
    };
  } else if (RentApplicationStatus.WITHDRAW === status) {
    const data = await rentApplication.findByIdAndUpdate(rentApplicationID, {
      applicationStatus: status,
    });

    if (data) {
      const landlordDetails = await User.findById(data.landlordID);

      let notification_payload = {};
      notification_payload.notificationHeading = "Rent Application Withdrawn";
      notification_payload.notificationBody = `Renter withdraw his rent application`;
      notification_payload.renterID = data.renterID;
      notification_payload.landlordID = data.landlordID;
      notification_payload.renterApplicationID = data._id;
      notification_payload.propertyID = data.propertyID;
      let create_notification = await Notification.create(notification_payload);
      if (create_notification) {
        if (landlordDetails && landlordDetails.fcmToken) {
          const metadata = { "propertyID": data.propertyID.toString(), "redirectTo": "rentApplication", "rentApplication": create_notification.renterApplicationID }
          await sendNotification(landlordDetails, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, UserRoles.LANDLORD)
        }
      }
    }
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
    data = await rentApplication.aggregate([{
      $match: {
        landlordID: `${id}`,
        propertyID: PropertyID
        // applicationStatus: RentApplicationStatus.PENDING
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
              phone: 1,
              picture: 1

            }
          }
        ],
        as: "renter_info",
      },

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
    ])
  }
  return {
    data: data,
    message: "Rent application completed successfully",
    status: true,
    statusCode: 200,
  };
}


async function getRentApplicationByID(id) {
  try {
    console.log(`[Rent Application By Id]`)
    const data = await rentApplication.findById(id).lean().exec();
    if (data) {
      if (data.renterID) {
        data.renter_info = await User.findById(data.renterID, {
          fullName: 1,
          phone: 1,
          countryCode: 1,
          picture: 1,
        });
      }

      if (data.landlordID) {
        data.landlord_info = await User.findById(data.landlordID, {
          fullName: 1,
          phone: 1,
          countryCode: 1,
          picture: 1,
        });
      }

      if (data.propertyID) {
        data.property_info = await Property.findById(data.propertyID, {
          propertyName: 1,
          images: 1,
          address: 1,
        });
      }
    }

    console.log(data)
    return {
      data: data,
      message: "rent application completed successfully",
      status: true,
      statusCode: 200,
    };
  } catch (error) {
    return {
      data: {},
      message: `${error}`,
      status: false,
      statusCode: 500,
    };
  }
}



export { addRentApplicationService, rentApplicationsList, updateRentApplications, getRentApplicationsByUserID, getRentApplicationByID };
