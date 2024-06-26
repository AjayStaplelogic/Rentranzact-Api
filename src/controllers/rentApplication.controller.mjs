import { sendResponse } from "../helpers/sendResponse.mjs";
import { addRentApplicationService, rentApplicationsList } from "../services/rentapplication.service.mjs"

async function addRentApplication(body, fileUrl, res, renterID) {
  console.log(body)

  console.log(fileUrl, "------file url")

  const data = await addRentApplicationService(body, fileUrl, renterID);

  console.log(data, "====daataaaaa ");


}


async function rentApplications(req, res) {

  console.log(req.user.data._id, "=============================================00")

  const userData = req.user.data;
  const data = await rentApplicationsList(userData);
  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

export { addRentApplication, rentApplications };
