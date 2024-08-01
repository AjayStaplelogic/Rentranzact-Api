import axios from "axios"
import smileIdentityCore from "smile-identity-core"
import { IdentificationType } from "../enums/indentificationTypes.enums.mjs";
import { v4 as uuidv4 } from 'uuid';
import moment from "moment";
let api_key = "b2e5c184-22eb-43f1-af0e-10c511545587";

const IDApi = smileIdentityCore.IDApi;
let partner_id = "7023";
let sid_server = "1";
const connection = new IDApi(partner_id, api_key, sid_server);

let partner_params = {
    job_id: uuidv4(),
    user_id: uuidv4(),
    job_type: 5,
};

async function identityVerifier(identificationType, kinDetails) {

    if (identificationType === IdentificationType.BVN) {

        const { first_name, last_name, middle_name, dob, bvn } = kinDetails;

        let id_info = {
            first_name: "<first name>",
            last_name: "<surname>",
            country: "NG",
            id_type: IdentificationType.BVN,
            id_number: bvn,
            dob: "1994-02-33",
            phone_number: "9988666666",
        };

        let options = {
            signature: true,
        };

        const response = await connection.submit_job(partner_params, id_info, options).then((res) => res).catch((err) => false)

        if (response?.FullData?.FirstName.trim().toLowerCase() === first_name.toLowerCase() && response?.FullData?.MiddleName.trim().toLowerCase() === middle_name.toLowerCase() && response?.FullData?.LastName.trim().toLowerCase() === last_name.toLowerCase() && response?.FullData?.DateOfBirth === dob) {

            return true
        } else {
            return false
        }


    } else if (identificationType === IdentificationType.NIN_V2) {

        const { first_name, last_name, middle_name, dob, nin } = kinDetails;

        let id_info = {
            first_name: "<first name>",
            last_name: "<surname>",
            country: "NG",
            id_type: IdentificationType.NIN_V2,
            id_number: nin,
            dob: "1994-02-33",
            phone_number: "9988666666",
        };

        let options = {
            signature: true,
        };

        const response = await connection.submit_job(partner_params, id_info, options).then((res) => res).catch((err) => err)

        console.log(response.FullData , "full data")

        console.log(response?.FullData?.FirstName ,"response?.FullData?.FirstNameresponse?.FullData?.FirstName")

        if (response?.FullData?.firstname.toLowerCase() === first_name.toLowerCase() && response?.FullData?.middlename.toLowerCase() === middle_name.toLowerCase() && response?.FullData?.surname.toLowerCase() === last_name.toLowerCase() && response?.FullData?.dateOfBirth === dob) {

            return true
        } else {
            return false
        }

    } else if (identificationType === IdentificationType.VOTER_ID) {

        const { first_name, last_name, middle_name, dob, voter_id } = kinDetails;

        console.log(first_name, last_name, middle_name, dob, voter_id, "======params coming")

        let id_info = {
            first_name: "<first name>",
            last_name: "<surname>",
            country: "NG",
            id_type: IdentificationType.VOTER_ID,
            id_number: voter_id,
            dob: "1994-02-33",
            phone_number: "9988666666",
        };

        let options = {
            signature: true,
        };


        const response = await connection.submit_job(partner_params, id_info, options).then((res) => res).catch((err) => false);

        console.log(response ,"==-=-=-=-=-=-=respone in voter id card ")

        const year = moment(dob, "YYYY-MM-DD").format("YYYY");

        if (response?.FullData?.FirstName.trim().toLowerCase() === first_name.toLowerCase() && response?.FullData?.LastName.trim().toLowerCase() === last_name.toLowerCase() && response?.FullData?.DOB_Y === Number(year)) {

            return true
        } else {
            return false
        }

    }
}

export {
    identityVerifier
}