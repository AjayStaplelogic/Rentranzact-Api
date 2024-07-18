// function sendResponse(res, data, message, status, code , accessToken, additionalData) {
//   console.log(additionalData)
// let responseObject;
//   if (accessToken) {
//     let additionalResponse;
//     if(additionalData) {
//       additionalResponse = additionalData
//     } else {additionalResponse = []}
//     responseObject = { data, message, status, accessToken, additionalData : additionalResponse  };

//   } else {
//      responseObject = { data, message, status };

//   }


//   res.status(code).json(responseObject);
// }
// export { sendResponse };

function sendResponse(res, data, message, status, code, accessToken, additionalData) {
  console.log(additionalData, "===additionl")
  let responseObject;
  let additionalResponse;
  if (accessToken) {


    if (additionalData) {

      additionalResponse = additionalData
    } else { additionalResponse = [] }
    responseObject = { data, message, status, accessToken, additionalData: additionalResponse };

  } else {
    if (additionalData) {

      additionalResponse = additionalData
    } else { additionalResponse = [] }
    responseObject = { data, message, status, accessToken, additionalData: additionalResponse };

  }
}
export { sendResponse };