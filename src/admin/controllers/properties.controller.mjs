import { sendResponse } from "../helpers/sendResponse.mjs";
import { getPropertiesList , getPropertyByID , deletePropertyByID , leaseAggrementsList} from "../services/properties.service.mjs";

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

async function leaseAggrements(req, res) {

  const {filters} = req.query;

  const data = await leaseAggrementsList(filters);

  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode,
    data.accessToken
  );
}





async function property(req, res) {

  const {id} = req.params;

  console.log(id, "-----did")

  const data = await getPropertyByID(id);

  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode,
    data.accessToken
  );
}

async function deleteProperty(req, res) {
  const {id} = req.params;

  const data = await deletePropertyByID(id);

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
  properties,
  property,
  deleteProperty,
  leaseAggrements
}