import { Property } from "../models/property.model.mjs";

async function addPropertyService(body) {
  const property = new Property(body);
  property.save();

  return {
    data: property,
    message: "property created successfully",
    status: true,
    statusCode: 201,
  };
}

export { addPropertyService };
