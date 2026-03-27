import axios from "axios";

export const payViaGlobalPayService = async (payload, userData) => {
    try {
        const url = 'https://paygw.globalpay.com.ng/globalpay-paymentgateway/api/paymentgateway/generate-payment-link';

        const meta_data_arr = Object.entries(payload.meta_data).map(([key, value]) => ({
            name: key,
            value: value
        }));

        const data = {
            amount: payload.amount,
            merchantTransactionReference: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            redirectUrl: payload.is_mobile === true ? `` : `${FRONTEND_URL}/payment-method`,
            customer: {
                lastName: "string",
                firstName: userData?.fullName,
                currency: "NGN",
                phoneNumber: userData?.phone ?? "",
                address: "customer address",
                emailAddress: userData?.email,
                paymentFormCustomFields: meta_data_arr
            }
        };

        try {
            const response = await axios.post(url, data, {
                headers: {
                    apiKey: process.env.GLOBAL_PAY_API_KEY,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response:', response.data);
            return response.data;

        } catch (error) {
            console.error(
                'Error:',
                error.response ? error.response.data : error.message
            );
            throw error;
        }

    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}