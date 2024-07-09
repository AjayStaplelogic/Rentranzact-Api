import express from "express";
const router = express.Router();
import { newsletter } from "../controllers/newsletter.controller.mjs";
import authorizer from "../middleware/authorizer.middleware.mjs";
import { UserRoles } from "../enums/role.enums.mjs";
import { generateRandomFileName } from "../helpers/randomNameGenerator.mjs";
import {
  addProperty,
  searchProperty,
  propertiesList,
  propertyByID,
  addFavorite,
  searchPropertyByKeywords,
  myProperties
} from "../controllers/property.controller.mjs";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const PropertyID = uuidv4();

// Middleware to generate and attach PropertyID
router.use((req, res, next) => {
  req.PropertyID = PropertyID;
  req.images = [];
  req.documents = [];
  req.videos = [];
  next();
});

const baseUploadPath = "uploads/";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//       // Destination logic remains the same
//       // ...
//   },
//   filename: function (req, file, cb) {
//       const randomFileName = generateRandomFileName(file);
//       cb(null, randomFileName);
//   },
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const propertyFolder = path.join(baseUploadPath, PropertyID);
    const imagesFolder = path.join(propertyFolder, "images");
    const documentsFolder = path.join(propertyFolder, "documents");
    const videosFolder = path.join(propertyFolder, "videos");

    // Create the directories if they don't exist
    if (!fs.existsSync(propertyFolder)) {
      fs.mkdirSync(propertyFolder, { recursive: true });
    }
    if (!fs.existsSync(imagesFolder)) {
      fs.mkdirSync(imagesFolder);
    }
    if (!fs.existsSync(documentsFolder)) {
      fs.mkdirSync(documentsFolder);
    }
    if (!fs.existsSync(videosFolder)) {
      fs.mkdirSync(videosFolder);
    }

    // Determine subfolder based on file type
    let destinationFolder = propertyFolder;
    if (file.mimetype.startsWith("image/")) {
      destinationFolder = imagesFolder;
    } else if (
      file.mimetype === "application/pdf" ||
      file.mimetype.startsWith("application/")
    ) {
      destinationFolder = documentsFolder;
    } else if (file.mimetype.startsWith("video/")) {
      destinationFolder = videosFolder;
    }

    cb(null, destinationFolder);
  },
  // filename: function (req, file, cb) {
  //   // Ensure the filename includes the original file extension
  //   cb(null, file.originalname);
  // },

  filename: function (req, file, cb) {
    const randomFileName = generateRandomFileName(file);
    cb(null, randomFileName);
  },
});

const upload = multer({ storage: storage });
const hostUrl = process.env.HOST_URL;

router.post("/property/search", searchProperty);

router.post("/property/list", propertiesList);
router.get("/property/:id", propertyByID);
router.get(
  "/property/favorite/:id",
  authorizer([UserRoles.RENTER]),
  addFavorite
);











/** 
  @api {post} /property add property
  @apiName property
  @apiGroup Property

@apiParam {Files} images images of property
@apiParam {Files} documents documents of property
@apiParam {Files} videos videos of property
@apiParam {String} category category of property (residential , commercial , etc)
@apiParam {Object} address address of property ({
"type": "Point",
"coordinates": [76.688688,30.709525],
"addressText": "isbt sector 43 chandigarh"
})
@apiParam {String} propertyName name of property.
@apiParam {Number} bedrooms number of bedrooms in property (3)
@apiParam {String} rentType type of rent of property (monthly , yearly)
@apiParam {String} city city of property (chandigarh)
@apiParam {Number} number_of_floors no. of floor in property (4)
@apiParam {Number} number_of_bathrooms no. of bathrooms in property (2)
@apiParam {Number} carpetArea carpet area of property (3400)
@apiParam {Number} age_of_construction age of construction of property (20)
@apiParam {String} aboutProperty note about property. (very good property. build since 1972. etc)
@apiParam {String} type type of property. (detached duplexes , etc)
@apiParam {String} furnishingType type of property. (fully furnished , etc)
@apiParam {String} landmark landmark nearby property. (school , hospital , etc)
@apiParam {Number} superArea super area of property. (2003)
@apiParam {Number} availabilty availabilty of property. (4)
@apiParam {String} communityType type of community. (colony)
@apiParam {Number} cautionDeposite deposite to property. (2200)
@apiParam {Number} serviceCharges service charges of property. (900)
@apiParam {Array} array of amenities. (['parking','swimming pool'])
@apiParam {String} email of landlord or property manager
@apiParam {String} name of landlord or property manager
@apiParam {Number} number_of_rooms no. of rooms in property
@apiParam {String} role role of person who posting the property. (landlord, property , manager)
@apiParam {String} rentFrequency rent frequency of the property. (monthly)
 
@apiParamExample {multipart/form-data} Request Example:
       images=files
       documents=files
       videos=files
       category="residence"
       address={
        "type": "Point",
        "coordinates": [76.688688,30.709525],
        "addressText": "isbt sector 43 chandigarh"
      }
      propertyName="taj hotel"
      bedrooms=3
      rentType="monthly"
      city="pathankot"
      number_of_floors=2
      number_of_bathrooms=1
      carpetArea=1000
      age_of_construction=12
      aboutProperty="good property. visit anytime"
      type="detached duplexed"
      furnishingType="fully furnished"
      landmark="railway station"
      superArea=1204
      availabilty=12
      communityType="colony"
      cautionDeposite=2000
      serviceCharges=12355
      amenities=['parking','swimming pool']
      email="landlord@gmail.com"
      name="rahul"
      number_of_rooms=12
      role="landlord"
      rentFrequency="quaterly"
       
@apiSuccess {Object} data data which have information of property
@apiSuccess {Boolean} status status of api true or false
@apiSuccess {String} message property created successfully

 
@apiSuccessExample Success-Response:
      HTTP/1.1 200 OK
   {
    "data": {
        "propertyID": "8af7f1a9-a752-43fd-a64a-177b5f93d5b0",
        "category": "residential",
        "address": {
            "type": "Point",
            "coordinates": [
                76.688688,
                30.709525
            ],
            "addressText": "isbt sector 43 chandigarh"
        },
        "rent": 1200,
        "propertyName": "staplelogic",
        "name": "test",
        "email": "test@gmail.com",
        "rentType": "monthly",
        "status": true,
        "city": "Mohali",
        "number_of_floors": 3,
        "number_of_bathrooms": 1,
        "carpetArea": 3222,
        "age_of_construction": 10,
        "aboutProperty": "very good property",
        "type": "detached duplexes",
        "furnishingType": "fully furnished",
        "landmark": "tank chownk",
        "bedrooms": 2,
        "superArea": "xyz",
        "availability": 12,
        "communityType": "colony",
        "cautionDeposite": 2000,
        "servicesCharges": 455,
        "amenities": [
            "parking",
            "lift"
        ],
        "images": [
            {
                "id": "5061d525-9bb3-4243-9470-863f362febff",
                "url": "https:/api.rentranzact.com/property/8af7f1a9-a752-43fd-a64a-177b5f93d5b0/images/ff5aa1247df42fc9e0139bd7f467bbdbe6f028e5.jpg"
            }
        ],
        "documents": [],
        "videos": [],
        "verified": false,
        "rented": false,
        "number_of_rooms": 4,
        "property_manager_id": "666bdca8b63d81f4a3cee665",
        "landlord_id": "666bdca8b63d81f4a3cee665",
        "rentFrequency": "monthly",
        "inDemand": false,
        "postedByAdmin": false,
        "_id": "668ceb155c0d020162eada3e"
    },
    "message": "property created successfully",
    "status": true
}
*/

router.post(
  "/property",
  authorizer([
    UserRoles.LANDLORD,
    UserRoles.PROPERTY_MANAGER,
    UserRoles.RENTER,
  ]),
  upload.any(),
  (req, res) => {
    req.files.forEach((file) => {
      const randomFileName = file.filename; // Use the random filename generated by Multer

      const relativePath = path.join(
        hostUrl,
        "property",
        req.PropertyID.toString(),
        file.mimetype.startsWith("image/")
          ? "images"
          : file.mimetype.startsWith("video/")
            ? "videos"
            : "documents",
        randomFileName // Use random filename instead of file.originalname
      );

      if (file.mimetype.startsWith("image/")) {
        req.images.push({ id: uuidv4(), url: relativePath });
      } else if (file.mimetype.startsWith("video/")) {
        req.videos.push({ id: uuidv4(), url: relativePath });
      } else if (file.mimetype.startsWith("application/")) {
        req.documents.push({ id: uuidv4(), url: relativePath });
      }
    });

    addProperty(req, res);
  }
);

router.get(
  "/property",
  authorizer([UserRoles.RENTER]),
  searchPropertyByKeywords
);


router.get("/my-properties", authorizer([UserRoles.RENTER, UserRoles.LANDLORD, UserRoles.PROPERTY_MANAGER]), myProperties)

// router.post("/property", upload.any(), addProperty);

// router.post('/property' , authorizer([UserRoles.LANDLORD]) , upload.any(), addProperty);

export default router;














