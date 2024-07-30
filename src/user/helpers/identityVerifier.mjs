import axios from "axios"
import smileIdentityCore from "smile-identity-core"
import { IdentificationType } from "../enums/indentificationTypes.enums.mjs";
import { v4 as uuidv4 } from 'uuid';

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

        const { first_name, last_name, dob, bvn } = kinDetails;

        let id_info = {
            first_name: "<first name>",
            last_name: "<surname>",
            country: "NG",
            id_type: "NIN_V2",
            id_number: "80621738457",
            dob: "1994-02-33", // yyyy-mm-dd
            phone_number: "9988666666",
          };
          
          // Set the options for the job
          let options = {
            signature: true,
          };
          
          // Submit the job
          // This method returns a promise
          
          
          
       const response = connection.submit_job(partner_params, id_info, options).then((res) => res).catch((catch) => return 200)

       



    } else if (identificationType === IdentificationType.BVN) {

        const { bvn } = kinDetails;

        apiUrl = `https://api.creditchek.africa/v1/identity/verifyData?bvn=${bvn}`;

        const response = await axios.post(apiUrl, {}, {
            headers: {
                'token': token
            }
        }).then((res) => res).catch((err) => err.response.data);

        return response;


    } else if (identificationType === IdentificationType.NIN) {

        const { nin } = kinDetails;

        apiUrl = `https://api.creditchek.africa/v1/identity/verifyData?nin=${nin}`;

        const response = await axios.post(apiUrl, {}, {
            headers: {
                'token': token
            }
        }).then((res) => res).catch((err) => err.response.data);

        console.log(response, "====response ===")

        return response;

    }

}

export {
    identityVerifier
}