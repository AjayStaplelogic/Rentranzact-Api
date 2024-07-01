import axios from "axios"
async function identityVerifier(kinDetails) {

    const { first_name, last_name, dob, drivers_license } = kinDetails;

    const url = `https://api.creditchek.africa/v1/identity/verifyData?drivers_license=${drivers_license}&dob=${dob}&first_name=${first_name}&last_name=${last_name}`;

    const response = await axios.post(url, {}, {
        headers: {
            'token': "1QAexV2tTU1eU9CXOyAlHzQdKfQ8o09hrMV4MoL2wKBIqhP2/3lmByPLT5MTnbLD"
        }
    }).then((res) => res).catch((err) =>  err.response.data)

    return response;
}

export {
    identityVerifier
}