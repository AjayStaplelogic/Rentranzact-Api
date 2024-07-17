import { Maintenance } from "../models/maintenance.model.mjs";
import { Property } from "../models/property.model.mjs";

async function addMaintenanceRequests(body) {

    const { landlord_id } = await Property.findById(body.propertyID).select("landlord_id")


    body.landlordID = landlord_id;


    console.log(body,"===body")


    const data = new Maintenance(body);

    data.save()
    return {
        data: data,
        message: "created maintenance successfully",
        status: true,
        statusCode: 201,
    };
}

export { addMaintenanceRequests };
