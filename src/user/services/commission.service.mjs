import { Property } from "../models/property.model.mjs"
import { RentBreakDownPer } from "../enums/property.enums.mjs";
import { ECommissionType } from "../enums/commission.enum.mjs"
import Commissions from "../models/commissions.model.mjs"

/**
 * @description Performs calculations and update in db for property manager commission
 * @param {object} property Property details object
 * @param {number} rent Rent Amount, commission will be based on rent
 * @returns {void}
 */
export const rentCommissionToPM = async (propertyObj = null, property_id = null, rent = 0) => {
    try {
        console.log("Inside Rent Commission Function")
        // console.log(propertyDetails, '====propertyDetails')

        if ((!propertyObj || propertyObj._id) && property_id) {     // IF proprty details not comming then fetching it from id
            propertyObj = await Property.findById(property_id);
        }

        if (propertyObj && Number(rent) > 0) {
            rent = Number(rent);
            if (propertyObj.property_manager_id && propertyObj.landlord_id) {
                const commission = (rent * RentBreakDownPer.AGENT_FEE_PERCENT) / 100;
                const pm_commission = {
                    type: ECommissionType.rent,
                    from: propertyObj.landlord_id,
                    to: propertyObj.property_manager_id,
                    property_id: propertyObj._id,
                    property_name: propertyObj?.propertyName ?? "",
                    property_address: propertyObj?.address?.addressText ?? "",
                    property_images: propertyObj?.images ?? [],
                    rent: rent,
                    commission: commission,
                    commission_per: RentBreakDownPer.AGENT_FEE_PERCENT
                };

                if (propertyObj?.address?.coordinates?.length > 1) {
                    pm_commission.property_location = {
                        type: propertyObj?.address?.type ?? "Point",
                        coordinates: propertyObj?.address?.coordinates ?? []
                    }
                }

                await Commissions.create(pm_commission)
            }
        }
    } catch (error) {
        console.log(error, '===Error in rent Commission');
    }
}