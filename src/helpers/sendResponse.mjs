function sendResponse(res, data, message, status, code , accessToken) {
let responseObject;
  if (accessToken) {
    responseObject = { data, message, status, accessToken };

  } else {
     responseObject = { data, message, status };

  }


  res.status(code).json(responseObject);
}
export { sendResponse };

