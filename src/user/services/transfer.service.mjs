import Transfers from "../models/transfers.model.mjs";
import { ETRANSFER_TYPE } from "../enums/transfer.enums.mjs";
import { Property } from "../models/property.model.mjs";

export const makeTransferForPropertyRent = async (property_data = null, property_id = null, amount = 0) => {
    if (!property_data) {       // If property data is not provided then fetching it will property_id
        if (!property_id) {     // If property id is also not provided then returned false
            return false;
        }

        property_data = await Property.findById(property_id);
        if (!property_data) {       // If property not found in db then returning false
            return false;
        }
    }

    if (amount > 0) {
        const transfer_payload = {
            is_from_admin: true,
            to: property_data?.landlord_id,
            property_id: property_data._id,
            amount: amount,
            from_currency: "USD",
            to_currency: "NGN",
            property_name: property_data?.propertyName ?? "",
            property_address: property_data?.address?.addressText ?? "",
            property_images: property_data?.images ?? []
        }

        return await createTransferInDB(transfer_payload);
    }

    return false;
}

export const createTransferInDB = async (payload) => {
    return await Transfers.create(payload);
}

