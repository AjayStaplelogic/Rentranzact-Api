import { subscribeNewsletter } from "../services/newsletter.service.mjs";
import { sendResponse } from "../helpers/sendResponse.mjs";
import { addRentApplicationService } from "../services/rentapplication.service.mjs"

async function addRentApplication(body, fileUrl, res , renterID) {
  console.log(body)

console.log(fileUrl , "------file url")

  const data = await addRentApplicationService(body , fileUrl , renterID);

  console.log(data, "====daataaaaa ");

  sendResponse(res, data.data, data.message, data.status, data.statusCode);
}

export { addRentApplication };
