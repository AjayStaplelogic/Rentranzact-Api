import { sendResponse } from "../helpers/sendResponse.mjs";
import { addAdmin, loginAdmin } from "../services/admin.service.mjs";
import { Admin } from "../models/admin.model.mjs";
import * as authValidations from "../validations/auth.validation.mjs"
import { validator } from "../../user/helpers/schema-validator.mjs";

async function login(req, res) {
  const { body } = req;

  //   const { isError, errors } = validator(body, userLogin);

  //   if (isError) {
  //     sendResponse(res, [], errors, false, 403);
  //   } else {
  const data = await loginAdmin(body);

  sendResponse(
    res,
    data.data,
    data.message,
    data.status,
    data.statusCode,
    data.accessToken
  );
}

async function signup(req, res) {
  const { body } = req;


  const data = await addAdmin(body);

  sendResponse(
    res,
    { id: data?.data?._id, otp: data?.data?.otp },
    data.message,
    data.status,
    data.statusCode
  );


}

const getProfile = async (req, res) => {
  try {
    let { id } = req.query;
    if (!id) {
      return sendResponse(res, {}, "Id required", false, 400);
    }

    let data = await Admin.findOne({
      _id: id,
      isDeleted: false,
    }, {
      password: 0,
      fcmToken: 0
    }).lean();


    if (data) {
      return sendResponse(res, data, "success", true, 200);
    }

    return sendResponse(res, {}, "Invalid Id", false, 400);

  } catch (error) {
    return sendResponse(res, {}, error?.message, false, 400);
  }
}

const editProfile = async (req, res) => {
  try {
    const { isError, errors } = validator(req.body, authValidations.editProfile);
    if (isError) {
      let errorMessage = errors[0].replace(/['"]/g, "")
      return sendResponse(res, [], errorMessage, false, 403);
    }

    let data = await Admin.findOneAndUpdate({
      _id: req.body.id,
      isDeleted: false,
    },
      req.body
    );

    if (data) {
      return sendResponse(res, null, "success", true, 200);
    }

    return sendResponse(res, {}, "Invalid Id", false, 400);

  } catch (error) {
    return sendResponse(res, {}, error?.message, false, 400);
  }
}

export { login, signup, getProfile, editProfile };
