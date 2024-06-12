import { Property } from "../models/property.model.mjs";

async function addPropertyService(PropertyID, images, documents, videos, body) {
  const Property_ = {
    propertyID: PropertyID,
    images: images,
    documents: documents,
    videos: videos,
    category: body.category,
    address: body.address,
    rent: parseInt(body.rent),
    name: body.name,
    bedrooms: body.bedrooms,
    rentedType: body.rentedType,
    city: body.city,
    number_of_floors: parseInt(body.number_of_floors),
    number_of_bathrooms: parseInt(body.number_of_bathrooms),
    carpetArea: parseInt(body.carpetArea),
    age_of_construction: parseInt(body.age_of_construction),
    aboutProperty: body.aboutProperty,
    type: body.type,
    furnishingType: body.furnishingType,
    landmark: body.landmark,
    superArea: body.superArea,
    availability: body.availability,
    communityType: body.communityType,
    landlord_id: body.landlord_id,
    cautionDeposite: parseInt(body.cautionDeposite),
    servicesCharges: parseInt(body.servicesCharges),
    amenities: parseInt(body.amenities),
    projectManagerID: body.projectManagerID,
  };

  const property = new Property(Property_);
  property.save();

  return {
    data: property,
    message: "property created successfully",
    status: true,
    statusCode: 201,
  };
}

export { addPropertyService };
