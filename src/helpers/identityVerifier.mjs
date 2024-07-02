import axios from "axios"
import { IdentificationType } from "../enums/indentificationTypes.enums.mjs";
async function identityVerifier(identificationType, kinDetails) {

    let token = "1QAexV2tTU1eU9CXOyAlHzQdKfQ8o09hrMV4MoL2wKBIqhP2/3lmByPLT5MTnbLD"

    let apiUrl;

    if (identificationType === IdentificationType.DL) {

        const { first_name, last_name, dob, drivers_license } = kinDetails;

        apiUrl = `https://api.creditchek.africa/v1/identity/verifyData?drivers_license=${drivers_license}&dob=${dob}&first_name=${first_name}&last_name=${last_name}`;


        const response = await axios.post(apiUrl, {}, {
            headers: {
                'token': token
            }
        }).then((res) => res).catch((err) => err.response.data)

        return response;



    } else if (identificationType === IdentificationType.BVN) {


        const { bvn } = kinDetails;

        apiUrl = `https://api.creditchek.africa/v1/identity/verifyData?bvn=${bvn}`;


        const response = await axios.post(apiUrl, {}, {
            headers: {
                'token': token
            }
        }).then((res) => res& console.log(res,"=====dahsjhsa")).catch((err) => err.response.data)

        return response;

    }

}

export {
    identityVerifier
}