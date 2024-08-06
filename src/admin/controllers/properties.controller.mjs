import { sendResponse } from "../helpers/sendResponse.mjs";
import { getPropertiesList , getPropertyByID , deletePropertyByID , leaseAggrementsList} from "../services/properties.service.mjs";
import {Property} from "../../user/models/property.model.mjs"

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

async function updateProperty (req, res){
  try {
      let { id } = req.body;
      if (!id) {
          return sendResponse(res, {}, "Id required", false, 400);
      }

      let update_property = await Property.findByIdAndUpdate(id, req.body, {new : true});
      if(update_property){
        return sendResponse(res, update_property, "success", true, 200);
      }
      return sendResponse(res, {}, "Invalid Id", false, 400);
  } catch (error) {
      return sendResponse(res, {}, `${error}`, false, 500);
  }
}


export {
  properties,
  property,
  deleteProperty,
  leaseAggrements,
  updateProperty
}