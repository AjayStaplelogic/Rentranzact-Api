import { newsletter } from "../models/newsletter.model.mjs";
import { Property } from "../models/property.model.mjs";

async function createInspection(body) {
  const { propertyID } = body;
  const { _id } = req.user.data;

  const property = await Property.findById(propertyID);

  body.renterID = _id;

  body.landlordID = property.landlord_id;

  body.property_manager_id = property.property_manager_id;

  const data = new Property(body);

  return {
    data: data,
    message: "initialised inspection successfully",
    status: true,
    statusCode: 201,
  };
}

export { createInspection };
