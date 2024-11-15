// import { Inspection } from "../models/inspection.model.mjs";
// import { Property } from "../models/property.model.mjs";
// import { User } from "../models/user.model.mjs";
import { Property } from "../../user/models/property.model.mjs";

import { UserRoles } from "../../user/enums/role.enums.mjs";
import { User } from "../../user/models/user.model.mjs";

async function getDashboardStats() {

    const [
        propertiesOnRentedCount, 
        propertiesVacantCount,
        rentersCount,
        landlordCount,
        propertyManagerCount,
        topListedPropertiesCount,
    ] = await Promise.all([
        Property.find({ rented: true }).countDocuments(),
        Property.find({ rented: false }).countDocuments(),
        User.find({role : UserRoles.RENTER}).countDocuments(),
        User.find({role : UserRoles.LANDLORD}).countDocuments(),
        User.find({role : UserRoles.PROPERTY_MANAGER  }).countDocuments(),
        Property.find().countDocuments()  // Top 10 listed properties, not implemented in this example. Implement this query in your model or controller.
    ])

    // const propertiesOnRentedCount = await Property.find({ rented: true }).countDocuments();

    // const propertiesVacantCount = await Property.find({ rented: false }).countDocuments();

    // const rentersCount = await User.find({role : UserRoles.RENTER}).countDocuments();

    // const landlordCount = await User.find({role : UserRoles.LANDLORD}).countDocuments();

    // const propertyManagerCount = await User.find({role : UserRoles.PROPERTY_MANAGER  }).countDocuments()

    // const topListedPropertiesCount = await Property.find().countDocuments()

    return {
        data: {
            count: {
                propertiesOnRentedCount, propertiesVacantCount , rentersCount , landlordCount , propertyManagerCount , topListedPropertiesCount
            }
        },
        message: "dashboard stats",
        status: true,
        statusCode: 201,
    };

}

export { getDashboardStats };
