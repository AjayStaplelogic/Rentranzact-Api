import jwt from "jsonwebtoken";

async function accessTokenGenerator(user) {

    const secret = process.env.JWT_ACCESS_TOKEN_SECRET;

 return jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      data: user,
    },
    secret
  );
}

export { accessTokenGenerator };
