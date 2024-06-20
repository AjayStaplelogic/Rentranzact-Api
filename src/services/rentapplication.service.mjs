import mongoose from "mongoose";
import { rentApplication } from "../models/rentApplication.model.mjs";

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

  console.log(payload, "=====payload");

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

export { addRentApplicationService };
