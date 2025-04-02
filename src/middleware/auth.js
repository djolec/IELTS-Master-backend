import { auth } from "express-oauth2-jwt-bearer";
import User from "../model/User.js";
import jwt from "jsonwebtoken";

export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});

export const jwtParse = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.sendStatus(401);
    return;
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.decode(token);
    const auth0Id = decoded.sub;

    const user = await User.findOne({ auth0Id });

    if (!user) {
      res.sendStatus(401);
      return;
    }

    req.auth0Id = auth0Id;
    req.userId = user._id.toString();
    next();
  } catch (err) {
    res.sendStatus(401);
  }
};
