import { subscribeNewsletter } from "../services/newsletter.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import {
  addPropertyService,
  searchInProperty,
  filterProperies,
  nearbyProperies,
  getPropertyByID,
  addFavoriteProperties,
  searchPropertyByString,
  getMyProperties
} from "../services/property.service.mjs";

async function addProperty(req, res) {
  const { body } = req;

  console.log(body , "body in add propertyyyyyy")


  const id = req.user.data._id;

  
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).send("No files uploaded.");
  }

  const images = files.filter((file) => file.mimetype.startsWith("image/"));
  const documents = files.filter((file) => file.mimetype === "application/pdf");

  

  if (images.length > 0) {
    console.log("Images uploaded:");

    images.forEach((image) => {
  
    });
  }

  if (documents.length > 0) {
    console.log("Documents uploaded:");
    documents.forEach((document) => {
     
    });
  }

  const data = await addPropertyService(
    req.PropertyID,
    req.images,
    req.documents,
    req.videos,
    body,
    id
  );



  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function searchProperty(req, res) {
  const { body } = req;

  const data = await searchInProperty(body);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function propertiesList(req, res) {
  const { body } = req;

  const id = req.user.data._id;

  const { nearByProperty } = body;

  if (nearByProperty) {
   
    const data = await nearbyProperies(body);
   

    sendResponse(res, data.data, data.message, data.status, data.statusCode);
  } else {
    const data = await filterProperies(body , id);

    sendResponse(res, data.data, data.message, data.status, data.statusCode);
  }
}

async function propertyByID(req, res) {
  const { id } = req.params;



  const data = await getPropertyByID(id);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function addFavorite(req, res) {
  const { id } = req.params;

  console.log(id, "this is property which liked or dislikeddddd")
  const { _id } = req.user.data;

  const data = await addFavoriteProperties(id, _id);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

async function searchPropertyByKeywords(req, res) {
  const { search } = req.query;


  const data = await searchPropertyByString(search);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);

}


async function myProperties (req, res) {
  const {role , _id} = req.user.data;


  const data = await getMyProperties(role, _id);

  sendResponse(res, data.data, data.message, data.status, data.statusCode); 

}

export {
  addProperty,
  searchProperty,
  propertiesList,
  propertyByID,
  addFavorite,
  searchPropertyByKeywords,
  myProperties
};
