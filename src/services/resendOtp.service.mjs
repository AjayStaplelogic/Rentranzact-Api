import { html } from "../helpers/emailTemplate.mjs";
import { generateOTP } from "../helpers/otpGenerator.mjs";
import { sendMail } from "../helpers/sendMail.mjs";
import { User } from "../models/user.model.mjs";

async function resendOtpService(body) {
  const userId = body._id;

  const newOtp = generateOTP();

  const user = await User.findByIdAndUpdate(userId, {
    otp: newOtp,
  });

  const htmlTemplate = html(user.otp);

  const resendOTP = sendMail(user.email, "OTP Verification", htmlTemplate);

  if (resendOTP) {
    return {
      data: [],
      message: "otp sent successfully",
      status: true,
      statusCode: 200,
    };
  } else {
    return {
      data: [],
      message: "unable to send otp",
      status: false,
      statusCode: 401,
    };
  }
}

export { resendOtpService };
