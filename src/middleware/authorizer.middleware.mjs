import jwt from "jsonwebtoken";

const secret = process.env.JWT_ACCESS_TOKEN_SECRET;

function authorizer(req, res, next) {
  // Get the access token from the request headers, query string, or cookies
  const accessToken = req.headers.authorization?.split(" ")[1]; // Assuming token is passed in the Authorization header

  if (!accessToken) {
    return res.status(401).json({ message: "Access token not found" });
  }

  try {
    // Decode the access token
    const decoded = jwt.verify(accessToken, secret);
    req.user = decoded; // Attach the decoded data to the request object
    next(); // Call the next middleware
  } catch (error) {
    console.error("Error decoding access token:", error);
    return res.status(401).json({ message: "Invalid access token" });
  }
}

export default authorizer;
