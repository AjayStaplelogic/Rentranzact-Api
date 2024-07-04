import { sendResponse } from "../helpers/sendResponse.mjs";
import { getPropertiesList } from "../services/properties.service.mjs";

async function properties(req, res) {
 
  const data = await getPropertiesList();

  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode,
    data.accessToken
  );
}

export {
    properties
}