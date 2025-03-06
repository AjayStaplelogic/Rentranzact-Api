import { sendResponse } from "../helpers/sendResponse.mjs";
import { addAdmin, loginAdmin } from "../services/admin.service.mjs";
import { Admin } from "../models/admin.model.mjs";
import * as authValidations from "../validations/auth.validation.mjs"
import { validator } from "../../user/helpers/schema-validator.mjs";
import bcrypt from "bcrypt";
import * as s3Service from "../../user/services/s3.service.mjs";

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

    const get_user = await Admin.findOne({
      _id: req.body.id,
      isDeleted: false,
    });
    if(get_user){
      let data = await Admin.findByIdAndUpdate(req.body.id,
        req.body,
        {
          new : true
        }
      );
  
      if (data) {
        if (get_user.picture != data.picture) {
          // Delete old picture
          if (get_user?.picture) {
            const keyToDelete = await s3Service.getKeyNameForFileUploaded(get_user?.picture);
            await s3Service.deleteFileFromAws(keyToDelete)
          }
        }
  
        return sendResponse(res, null, "success", true, 200);
      }
    }


    return sendResponse(res, {}, "Invalid Id", false, 400);

  } catch (error) {
    return sendResponse(res, {}, error?.message, false, 400);
  }
}

const changePassword = async (req, res) => {
  try {

    const { isError, errors } = validator(req.body, authValidations.changePassword);
    if (isError) {
      let errorMessage = errors[0].replace(/['"]/g, "")
      return sendResponse(res, [], errorMessage, false, 403);
    }

    const get_admin = await Admin.findOne({
      _id: req.body.id,
      isDeleted: false
    });

    if (get_admin) {
      const isMatch = bcrypt.compareSync(req.body.old_password, get_admin.password);
      if (isMatch) {
        const salt = parseInt(process.env.SALT);
        const encrypted_pass = bcrypt.hashSync(req.body.new_password, salt);
        if (encrypted_pass) {
          let update_pass = await Admin.findByIdAndUpdate(get_admin._id, {
            password: encrypted_pass
          });
          if (update_pass) {
            return sendResponse(res, null, "Password changes successfully", true, 200);
          }
          return sendResponse(res, null, "User Not Found", false, 404);
        }
      }
      return sendResponse(res, null, "Old password not matched", false, 400)
    }
    return sendResponse(res, null, "User Not Found", false, 404);
  } catch (error) {
    return sendResponse(res, null, error?.message, false, 400);
  }
}


export { login, signup, getProfile, editProfile, changePassword };
