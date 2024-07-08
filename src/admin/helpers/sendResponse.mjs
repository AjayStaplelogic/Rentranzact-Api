function sendResponse(res, data, message, status, code , accessToken, additionalData) {
  console.log(additionalData)
let responseObject;
  if (accessToken) {
    let additionalResponse;
    additionalData
    if(additionalData,"-additional data--") {
      additionalResponse = additionalData
    } else {additionalResponse = []}
    responseObject = { data, message, status, accessToken, additionalData : additionalResponse  };

  } else {
     responseObject = { data, message, status };

  }


  res.status(code).json(responseObject);
}
export { sendResponse };

