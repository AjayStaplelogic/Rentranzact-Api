function sendResponse(res, data, message, status, code) {
  const responseObject = { data, message, status };

  res.status(code).json(responseObject);
}
export { sendResponse };

