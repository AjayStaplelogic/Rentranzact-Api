import { rentApplication } from "../models/rentApplication.model.mjs";
import { RentApplicationStatus } from "../enums/rentApplication.enums.mjs";
import { Property } from "../models/property.model.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import { identityVerifier } from "../helpers/identityVerifier.mjs";
import { User } from "../models/user.model.mjs";
import assert from "assert";
import { ENOTIFICATION_REDIRECT_PATHS } from "../../user/enums/notification.enum.mjs";
import * as PropertyServices from "../services/property.service.mjs";
import * as NotificationService from "./notification.service.mjs";
import Invites from "../models/invites.model.mjs";
import { EInviteStatus } from "../enums/invite.enum.mjs";
import moment from "moment";
import * as RentApplicationEmails from "../emails/rentapplication.emails.mjs";

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

    // let isKinSame = kinDetailsSame(kinDetails, renterDetails.kinDetails)

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
    if (verifyStatus) {
      //add kin details to the user
      kinDetails["identificationType"] = identificationType;
      // payload["kinIdentityCheck"] = true;
      payload["isPersonalDetailsVerified"] = true;

      const renterDetails = await User.findById(renterID);

      // ********* If renter submit application with invite *************//
      if (body.invitation_token) {
        const get_invitaton = await Invites.findOne({
          invitation_token: body.invitation_token,
        });

        if (get_invitaton) {
          if ([EInviteStatus.accepted, EInviteStatus.rejected].includes(get_invitaton.invite_status)) {
            return {
              data: null,
              message: "Invitation already used",
              status: false,
              statusCode: 400,
            };
          }

          if (get_invitaton.invited_by.toString() != payload.pmID && get_invitaton.invited_by.toString() != payload.landlordID) {
            return {
              data: null,
              message: "You can't use inviation of other who is not your property manager or landlord",
              status: false,
              statusCode: 400,
            };
          }

          payload.invite_id = get_invitaton._id;
          payload.invitation_token = get_invitaton.invitation_token;
        } else {
          return {
            data: null,
            message: "Invalid Invitation code",
            status: false,
            statusCode: 400,
          };
        }
      }
      // ********* If renter submit application with invite *************//

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
            occupation: data.occupation
          }
        };
        user_update_payload.fullName = data.firstName;
        if (data.middleName) {
          user_update_payload.fullName.concat(' ', data.middleName)
        }

        if (data.lastName) {
          user_update_payload.fullName.concat(' ', data.lastName)
        }

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

        const updatedRenter = await User.findByIdAndUpdate(renterID, user_update_payload, { new: true });
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

            const metadata = {
              "propertyID": landlord._id.toString(),
              "redirectTo": "rentApplication",
              "rentApplication": data._id.toString()
            }
            NotificationService.createNotification(notification_payload, metadata, landlordDetails)
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

            const metadata = {
              "propertyID": landlord._id.toString(),
              "redirectTo": "rentApplication",
              "rentApplication": data._id.toString()
            }
            NotificationService.createNotification(notification_payload, metadata, propertyManagerDetails)
          }
        })

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
          if (data) {
            if (breakdown?.total_amount > 0 && !data.invite_id) {
              User.findById(data.renterID).then(async (renterDetails) => {
                let notification_payload = {};
                notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.rent_payment_screen;
                notification_payload.notificationHeading = "Congratulations, your rent application have been approved";
                notification_payload.notificationBody = "You can now proceed to make payment";
                notification_payload.renterID = data.renterID;
                notification_payload.landlordID = data.landlordID;
                notification_payload.renterApplicationID = data._id;
                notification_payload.propertyID = data.propertyID;
                notification_payload.send_to = renterDetails._id;
                notification_payload.property_manager_id = data.pmID;
                notification_payload.amount = breakdown.total_amount;
                notification_payload.show_pay_now = true;
                const metadata = {
                  "amount": propertyDetails.rent.toString(),
                  "propertyID": data.propertyID.toString(),
                  "redirectTo": "payRent",
                  "rentApplication": data._id.toString()
                }
                NotificationService.createNotification(notification_payload, metadata, renterDetails)
              });
            }

            // ********************** If Rent application is submitted view invitation ****************//
            if (data.invite_id) {
              const get_invitaton = await Invites.findById(data.invite_id);
              let lease_end_timestamp = "";
              if (["commercial", "residential"].includes(propertyDetails.category)) {
                lease_end_timestamp = moment().add(1, "years").unix();
              } else if (propertyDetails.category === "short stay") {
                lease_end_timestamp = moment().add(1, "months").unix();
              }

              const updateProperty = await Property.findByIdAndUpdate(data.propertyID, {
                rented: true,
                renterID: data.renterID,
                rent_period_start: moment().unix().toString(),
                rent_period_end: moment.unix(get_invitaton.rent_expiration_date),
                rent_period_due: moment.unix(get_invitaton.rent_expiration_date),
                payment_count: 1,
                lease_end_timestamp: lease_end_timestamp,
                inDemand: false,        // setting this to false because when property is rented then should remove from in demand
                next_payment_at : new Date(get_invitaton.rent_expiration_date)
              });

              if (updateProperty) {
                await Invites.findByIdAndUpdate(data.invite_id, {
                  invite_status: EInviteStatus.accepted
                })
                User.findById(data.renterID).then(async (renterDetails) => {
                  RentApplicationEmails.applicationAcceptedViaInviteRenter({
                    email: renterDetails.email,
                    property_name: propertyDetails.propertyName,
                    renter_name: renterDetails.fullName,
                    property_id: propertyDetails._id
                  })

                  let notification_payload = {};
                  notification_payload.redirect_to = ENOTIFICATION_REDIRECT_PATHS.property_view;
                  notification_payload.notificationHeading = `Congratulations, your rent application have been approved and you are not linked with property ${propertyDetails?.propertyName ?? ""}`;
                  notification_payload.notificationBody = `Congratulations, your rent application have been approved and you are not linked with property ${propertyDetails?.propertyName ?? ""}`;
                  notification_payload.renterID = data.renterID;
                  notification_payload.landlordID = data.landlordID;
                  notification_payload.renterApplicationID = data._id;
                  notification_payload.propertyID = data.propertyID;
                  notification_payload.send_to = renterDetails._id;
                  notification_payload.property_manager_id = data.pmID;
                  const metadata = {
                    "amount": propertyDetails.rent.toString(),
                    "propertyID": data.propertyID.toString(),
                    "redirectTo": "property_view",
                    "rentApplication": data._id.toString()
                  }
                  NotificationService.createNotification(notification_payload, metadata, renterDetails)
                });
              }
            }

            // ********************** If Rent application is submitted view invitation ****************//
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

            const metadata = {
              "propertyID": data.propertyID.toString(),
              "redirectTo": "rentApplication",
              "rentApplication": data._id.toString()
            }
            NotificationService.createNotification(notification_payload, metadata, renterDetails)
          }
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
              notification_payload.notificationHeading = "Rent Application Withdrawn";
              notification_payload.notificationBody = `Renter withdraw his rent application`;
              notification_payload.renterID = data.renterID;
              notification_payload.landlordID = data.landlordID;
              notification_payload.renterApplicationID = data._id;
              notification_payload.propertyID = data.propertyID;
              notification_payload.send_to = landlordDetails._id;

              const metadata = {
                "propertyID": data.propertyID.toString(),
                "redirectTo": "rentApplication",
                "rentApplication": data._id.toString()
              }
              NotificationService.createNotification(notification_payload, metadata, landlordDetails)
            }

            const propertyManagerDetails = await User.findById(data.pmID);
            if (propertyManagerDetails) {
              let notification_payload = {};
              notification_payload.notificationHeading = "Rent Application Withdrawn";
              notification_payload.notificationBody = `Renter withdraw his rent application`;
              notification_payload.renterID = data.renterID;
              notification_payload.landlordID = data.landlordID;
              notification_payload.renterApplicationID = data._id;
              notification_payload.propertyID = data.propertyID;
              notification_payload.send_to = propertyManagerDetails._id;
              notification_payload.property_manager_id = propertyManagerDetails._id;

              const metadata = {
                "propertyID": data.propertyID.toString(),
                "redirectTo": "rentApplication",
                "rentApplication": data._id.toString()
              }
              NotificationService.createNotification(notification_payload, metadata, propertyManagerDetails)
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
