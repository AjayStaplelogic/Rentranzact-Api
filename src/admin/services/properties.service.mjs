import { Property } from "../../user/models/property.model.mjs";

async function getPropertiesList() {
     const data = await Property.find();
  
    return {
      data: data,
      message: `successfully fetched  list`,
      status: true,
      statusCode: 201,
    };
  }


export {
    getPropertiesList
}