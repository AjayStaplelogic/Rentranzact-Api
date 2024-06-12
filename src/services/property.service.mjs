import { UserRoles } from "../enums/role.enums.mjs";
import { Property } from "../models/property.model.mjs";
import { User } from "../models/user.model.mjs";

async function addPropertyService(PropertyID, images, documents, videos, body , id) {
  const { email, role } = body;

  

  const propertyPostedBy = await User.findOne({ email: email, role: role });

  console.log(propertyPostedBy,"-=2343", id)


  console.log(role === UserRoles.PROJECT_MANAGER ? propertyPostedBy._id : id)

  if (propertyPostedBy) {
    const Property_ = {
      propertyID: PropertyID,
      images: images,
      documents: documents,
      videos: videos,
      category: body.category,
      address: body.address,
      rent: parseInt(body.rent),
      propertyName: body.propertyName,
      email: propertyPostedBy.email,
      name: propertyPostedBy.fullName,
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
      landlord_id: role === UserRoles.LANDLORD ? propertyPostedBy.id : id,
      property_manager_id : role === UserRoles.PROJECT_MANAGER ? propertyPostedBy._id : id,
      cautionDeposite: parseInt(body.cautionDeposite),
      servicesCharges: parseInt(body.servicesCharges),
      amenities: parseInt(body.amenities),
      number_of_rooms: body.number_of_rooms,
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


}

export { addPropertyService };
