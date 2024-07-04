import { sendResponse } from "../helpers/sendResponse.mjs";
import { resendOtpService } from "../services/resendOtp.service.mjs";

async function resendOTP(req, res) {
  const { body } = req;

  const data = await resendOtpService(body);

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

export { resendOTP };
