import { sendResponse } from "../helpers/sendResponse.mjs";
import verifyMeter from "../helpers/verifyMeter.mjs";
import * as ElectricityService from "../services/electricity.service.mjs";
import * as ElectricityValidations from "../validations/electricity.validation.mjs"
import { validator } from "../../user/helpers/schema-validator.mjs";

export const payBill = async (req, res) => {
    try {

        const sandboxUrl = "https://sandbox.vtpass.com/api/pay";

        const { meterID, meterType, serviceID } = req.body;

        const isMeterValid = await verifyMeter(meterID, meterType, serviceID);

        if (!isMeterValid) {
            return sendResponse(res, {}, "your meter is not valid", false, 400);
        }

        const payload = {
            "billersCode": meterID,
            "type": meterType,
            "serviceID": serviceID
        }

        const headers = {
            "api-key": sandboxApiKey,
            "secret-key": sandboxSecretKey
        }

        const data = await axios.post(sandboxUrl, payload, { headers });

        consolel


        //  return sendResponse(res, {}, "Invalid Id", false, 400);
    } catch (error) {
        return sendResponse(res, {}, `${error}`, false, 500);
    }
}

export const getAllBillers = async (req, res) => {
    try {
        let { category_code, country_code } = req.query;
        const get_billers = await ElectricityService.getBillers(category_code, country_code);
        return sendResponse(res, get_billers, "Billers fetched successfully", true, 200);
    } catch (error) {
        return sendResponse(res, null, error.message, false, 400);
    }
}

export const getAllBillerBills = async (req, res) => {
    try {
        let { biller_code } = req.query;
        const get_bills = await ElectricityService.getBillerBills(biller_code);
        return sendResponse(res, get_bills, "Bills fetched successfully", true, 200);
    } catch (error) {
        return sendResponse(res, null, error.message, false, 400);
    }
}

export const payElectricityBill = async (req, res) => {
    try {
        const { isError, errors } = validator(req.body, ElectricityValidations.payElectricityBill);
        if (isError) {
            let errorMessage = errors[0].replace(/['"]/g, "")
            return sendResponse(res, [], errorMessage, false, 403);
        }

        const validate_bill = await ElectricityService.validateBill(req.body.item_code, req.body.biller_code, req.body.meter_number);
        if (validate_bill) {
            const platform_fee_percentage = 10;
            const platform_fee = (req.body.amount * platform_fee_percentage) / 100;
            const createCharge = await ElectricityService.createCharge({
                amount: Number(req.body.amount) + Number(platform_fee),
                customer_email: req?.user?.data?.email,
                customer_phone_number: req?.user?.data?.phone ?? "",
                customer_name: req?.user?.data?.fullname,
                meta_data: {
                    type: "initiated-bill-payment",
                    user_id: `${req?.user?.data?._id}`,
                    meter_number: validate_bill?.data?.customer,
                    amount: req.body.amount,
                    biller_code: validate_bill?.data?.biller_code,
                    item_code: validate_bill?.data?.product_code,
                }
            });

            console.log(createCharge, '====createCharge')
            if (createCharge) {
                const resData = {
                    url: createCharge?.data?.link
                }
                return sendResponse(res, resData, "Payment initiated successfully", true, 200);
            }
            throw "Unable to create payment request. Please try again later.";
        }
        throw "Invalid bill information";
    } catch (error) {
        console.log(error, '======error')
        return sendResponse(res, null, error.message, false, 400);
    }
}