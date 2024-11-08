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
import assert from "assert";
import { ENOTIFICATION_REDIRECT_PATHS } from "../../user/enums/notification.enum.mjs";
import * as PropertyServices from "../services/property.service.mjs";

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
      employerAddress,
      expectedStaysDurationType
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
      no_of_occupant: Number(no_of_occupant) || 0,
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
      preferredFloor: Number(body.preferredFloor) || 0,
      expectedStays: Number(body.expectedStays) || 0,
    };

    if (employmentStatus !== "unemployed") {
      payload["employerName"] = body.employerName
      payload["employerAddress"] = body.employerAddress
    }

    if (checkinDate && checkoutDate) {
      payload["checkinDate"] = checkinDate
      payload["checkoutDate"] = checkoutDate
    }

    if (expectedStaysDurationType) {
      payload.expectedStaysDurationType = expectedStaysDurationType;
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

    // let verifyStatus = true;

    // if (isKinSame) {             // Commented because client says no need to verify kin details
    //   verifyStatus = true
    // } else {
    //   console.log("hitting smile api")
    //   verifyStatus = await identityVerifier(identificationType, kinDetails);
    // }

    // verifying personal details
    let smile_identification_payload = {
      first_name: body.firstName,
      last_name: body.lastName,
      middle_name: body.middleName,
      bvn: bvn,
      dob: kinDOB,
      nin: nin,
      voter_id: voter_id,
      kinContactNumber: contactNumber,
      kinEmail: emailID,
    }
    const verifyStatus = await identityVerifier(identificationType, smile_identification_payload);     // uncomment this code after client recharge for smile identity verification
    // const verifyStatus = true;  // Remove this code after client recharge for smile identity verification
    if (verifyStatus) {
      //add kin details to the user
      kinDetails["identificationType"] = identificationType;
      // payload["kinIdentityCheck"] = true;
      payload["isPersonalDetailsVerified"] = true;

      const renterDetails = await User.findById(renterID);

      let data = await rentApplication.create(payload);
      if (data) {
        let user_update_payload = {
          maritialStatus: data.maritialStatus,
          phone: data.contactNumber,
          age: data.age,
          permanentAddress: {
            permanentAddress: data.permanentAddress,
            permanentCity: data.permanentCity,
            permanentState: data.permanentState,
            permanentZipcode: data.permanentZipcode,
            permanentContactNumber: data.permanentContactNumber,
          },
          employmentDetails: {
            employmentStatus: data.employmentStatus,
            employerName: data.employerName,
            employerAddress: data.employerAddress,
            employmentStatus: data.employmentStatus,
            occupation : data.occupation
          }
        };
        user_update_payload.fullName = data.firstName;
        if (data.middleName) {
          user_update_payload.fullName.concat(' ', data.middleName)
        }

        if (data.lastName) {
          user_update_payload.fullName.concat(' ', data.lastName)
        }

        if (!isKinSame) {
          user_update_payload.kinDetails = {
            first_name: data.kinFirstName,
            last_name: data.kinLastName,
            middle_name: data.kinMiddleName,
            bvn: data.bvn,
            dob: data.kinDOB,
            nin: data.nin,
            voter_id: data.voter_id,
            kinContactNumber: data.kinContactNumber,
            kinEmail: data.kinEmail,
            relationshipKin: data.relationshipKin,
            identificationType: data.verifcationType,
          }
        }

        User.findByIdAndUpdate(renterID, user_update_payload, { new: true });
        User.findById(landlord.landlord_id).then(async (landlordDetails) => {
          if (landlordDetails) {
            let notification_payload = {};
            notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.rent_application_view;
            notification_payload.notificationHeading = "Rent Application Update";
            notification_payload.notificationBody = `${renterDetails.fullName} applied rent application for ${landlord.propertyName}`;
            notification_payload.renterID = renterID;
            notification_payload.landlordID = landlord.landlord_id;
            notification_payload.renterApplicationID = data._id;
            notification_payload.propertyID = landlord._id;
            notification_payload.send_to = landlordDetails._id;
            notification_payload.amount = landlord.rent;
            let create_notification = await Notification.create(notification_payload);
            if (create_notification) {
              if (landlordDetails && landlordDetails.fcmToken) {
                const metadata = {
                  "propertyID": landlord._id.toString(),
                  "redirectTo": "rentApplication",
                  "rentApplication": create_notification.renterApplicationID
                }
                sendNotification(landlordDetails, "single", create_notification.notificationHeading, create_notification.notificationBody, JSON.stringify(metadata), UserRoles.LANDLORD)
              }
            }
          }
        })

        await User.findById(landlord.property_manager_id).then(async (propertyManagerDetails) => {
          if (propertyManagerDetails) {
            let notification_payload = {};
            notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.rent_application_view;
            notification_payload.notificationHeading = "Rent Application Update";
            notification_payload.notificationBody = `${renterDetails.fullName} applied rent application for ${landlord.propertyName}`;
            notification_payload.renterID = renterID;
            notification_payload.landlordID = landlord?.landlord_id;
            notification_payload.renterApplicationID = data._id;
            notification_payload.propertyID = landlord._id;
            notification_payload.send_to = propertyManagerDetails._id;
            notification_payload.property_manager_id = propertyManagerDetails._id;
            notification_payload.amount = landlord.rent;
            let create_notification = await Notification.create(notification_payload);
            if (create_notification) {
              if (propertyManagerDetails && propertyManagerDetails.fcmToken) {
                const metadata = {
                  "propertyID": landlord._id.toString(),
                  "redirectTo": "rentApplication",
                  "rentApplication": create_notification.renterApplicationID
                }
                await sendNotification(propertyManagerDetails, "single", create_notification.notificationHeading, create_notification.notificationBody, JSON.stringify(metadata), UserRoles.PROPERTY_MANAGER)
              }
            }
          }
        })
        console.log('=======Rent Application End ========');

        return {
          data: data,
          message: "rent application successfully created",
          status: true,
          statusCode: 200,
        };
      }
      return {
        data: [],
        message: "Something went wrong",
        status: false,
        statusCode: 400,
      };
    } else {
      return {
        data: [],
        message: "Personal information is incorrect",
        status: false,
        statusCode: 400,
      };
    }

  } catch (error) {
    console.log(error);
    return {
      data: [],
      message: `${error}`,
      status: false,
      statusCode: 400,
    };
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

  // if (kinIdentityCheck) {
  //   if (kinIdentityCheck === "true") {
  //     query.kinIdentityCheck = true;
  //   } else if (kinIdentityCheck === "false") {
  //     query.kinIdentityCheck = false;
  //   }
  // }

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
              picture: 1,
              renter_avg_rating: 1,
              renter_total_reviews: 1,
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
              address: "$address",
              category: "$category",
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

}

async function updateRentApplications(body, id) {
  const { status, rentApplicationID, reason } = body;

  const rent_application_detail = await rentApplication.findById(rentApplicationID);
  if (rent_application_detail) {
    if (rent_application_detail.applicationStatus === status) {
      return {
        data: {},
        message: "Cannot update same status again.",
        status: false,
        statusCode: 400,
      };
    }

    if (rent_application_detail.propertyID) {
      const propertyDetails = await Property.findById(rent_application_detail.propertyID);
      if (propertyDetails) {
        if (propertyDetails.rented) {
          return {
            data: {},
            message: "Rent application cannot be updated as the property is already rented.",
            status: false,
            statusCode: 400,
          };
        }
        if (RentApplicationStatus.ACCEPTED === status) {
          const breakdown = PropertyServices.getRentalBreakUp(propertyDetails);
          const data = await rentApplication.findByIdAndUpdate(rentApplicationID, {
            applicationStatus: status,
            rent: breakdown?.rent ?? 0,
            insurance: breakdown?.insurance ?? 0,
            legal_Fee: breakdown?.legal_Fee ?? 0,
            caution_deposite: breakdown?.caution_deposite ?? 0,
            total_amount: breakdown?.total_amount ?? 0,
            agency_fee: breakdown?.agency_fee ?? 0,
            agent_fee: breakdown?.agent_fee ?? 0,
            rtz_fee: breakdown?.rtz_fee ?? 0,
            landlord_earning: breakdown?.landlord_earning ?? 0,
          },
            { new: true });

          // const propertyDetails = await Property.findById(data.propertyID);
          if (data) {
            if (breakdown?.total_amount > 0) {
              User.findById(data.renterID).then(async (renterDetails) => {
                let notification_payload = {};
                notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.rent_payment_screen;
                // notification_payload.notificationHeading = `Your rent is due to ${landlordDetails?.fullName || propertyManagerDetails?.fullName}`;
                // notification_payload.notificationBody = `Your monthly rent of ₦ ${propertyDetails.rent} on ${currentDate}`
                notification_payload.notificationHeading = "Congratulations, your rent application have been approved";
                notification_payload.notificationBody = "You can now proceed to make payment";
                notification_payload.renterID = data.renterID;
                notification_payload.landlordID = data.landlordID;
                notification_payload.renterApplicationID = data._id;
                notification_payload.propertyID = data.propertyID;
                notification_payload.send_to = renterDetails._id;
                notification_payload.property_manager_id = data.pmID;
                // notification_payload.amount = propertyDetails.rent;
                notification_payload.amount = breakdown.total_amount;
                notification_payload.show_pay_now = true;
                let create_notification = await Notification.create(notification_payload);
                if (create_notification) {
                  if (renterDetails && renterDetails.fcmToken) {
                    const metadata = {
                      "amount": propertyDetails.rent.toString(),
                      "propertyID": data.propertyID.toString(),
                      "redirectTo": "payRent",
                      "rentApplication": create_notification.renterApplicationID.toString(),
                    }
                    sendNotification(renterDetails, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, UserRoles.RENTER)
                  }
                }
              });
            }
          }

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
          }, {
            new: true
          });

          if (data) {
            const renterDetails = await User.findById(data.renterID);
            let notification_payload = {};
            notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.rent_application_view;
            notification_payload.notificationHeading = "Rent Application Cancelled";
            notification_payload.notificationBody = `Your rent application has been cancelled by landlord, Reason : ${data?.cancelReason ?? "N/A"}`;
            notification_payload.renterID = data.renterID;
            notification_payload.landlordID = data.landlordID;
            notification_payload.renterApplicationID = data._id;
            notification_payload.propertyID = data.propertyID;
            notification_payload.send_to = renterDetails._id;
            let create_notification = await Notification.create(notification_payload);
            if (create_notification) {
              if (renterDetails && renterDetails.fcmToken) {
                const metadata = { "propertyID": data.propertyID.toString(), "redirectTo": "rentApplication", "rentApplication": create_notification.renterApplicationID.toString(), }
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
            if (landlordDetails) {
              let notification_payload = {};
              // notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.rent_application_view;
              notification_payload.notificationHeading = "Rent Application Withdrawn";
              notification_payload.notificationBody = `Renter withdraw his rent application`;
              notification_payload.renterID = data.renterID;
              notification_payload.landlordID = data.landlordID;
              notification_payload.renterApplicationID = data._id;
              notification_payload.propertyID = data.propertyID;
              notification_payload.send_to = landlordDetails._id;
              let create_notification = await Notification.create(notification_payload);
              if (create_notification) {
                if (landlordDetails && landlordDetails.fcmToken) {
                  const metadata = { "propertyID": data.propertyID.toString(), "redirectTo": "rentApplication", "rentApplication": create_notification.renterApplicationID.toString() }
                  await sendNotification(landlordDetails, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, UserRoles.LANDLORD)
                }
              }
            }

            const propertyManagerDetails = await User.findById(data.pmID);
            if (propertyManagerDetails) {
              let notification_payload = {};
              // notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.rent_application_view;
              notification_payload.notificationHeading = "Rent Application Withdrawn";
              notification_payload.notificationBody = `Renter withdraw his rent application`;
              notification_payload.renterID = data.renterID;
              notification_payload.landlordID = data.landlordID;
              notification_payload.renterApplicationID = data._id;
              notification_payload.propertyID = data.propertyID;
              notification_payload.send_to = propertyManagerDetails._id;
              notification_payload.property_manager_id = propertyManagerDetails._id;
              let create_notification = await Notification.create(notification_payload);
              if (create_notification) {
                if (propertyManagerDetails && propertyManagerDetails.fcmToken) {
                  const metadata = { "propertyID": data.propertyID.toString(), "redirectTo": "rentApplication", "rentApplication": create_notification.renterApplicationID.toString() }
                  await sendNotification(propertyManagerDetails, "single", create_notification.notificationHeading, create_notification.notificationBody, metadata, UserRoles.PROPERTY_MANAGER)
                }
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
      return {
        data: {},
        message: "Property Not found",
        status: false,
        statusCode: 400,
      };
    }
  }

  return {
    data: {},
    message: "Application not found",
    status: false,
    statusCode: 400,
  };
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
          type: 1,
          category: 1
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
