import { prisma } from "../prisma/prisma";
import jwt from "jsonwebtoken";

const bcrypt = require("bcrypt");

// TODO: test if .env is working
const SALT_ROUNDS = parseInt(process.env.PASSWORD_HASH_SALT_ROUNDS || "10");
const USER_TOKEN_SECRET = process.env.USER_TOKEN_SECRET || "USER_SECRET";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "REFRESH_SECRET";

const USER_TOKEN_EXPIRE_TIME = "1h";
const REFRESH_TOKEN_EXPIRE_TIME = "1d";

export const hashPassword = (pwd) => {
  return bcrypt.hashSync(pwd, SALT_ROUNDS);
};

export const generateWebToken = (username, isAdmin, id) => {
  // Assumes username/role are valid
  return jwt.sign(
    { username: username, isAdmin: isAdmin, id: id },
    USER_TOKEN_SECRET,
    { expiresIn: USER_TOKEN_EXPIRE_TIME },
  );
};

export const generateRefreshToken = (username, isAdmin, id) => {
  // Assumes username/role are valid
  return jwt.sign(
    { username: username, isAdmin: isAdmin, id: id },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRE_TIME },
  );
};

export const verifyLogin = async (username, pwd) => {
  // Return corresponding user if password is valid
  // TODO[CRITICAL]: this find could fail if username/pwd are undefined
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (!!user && bcrypt.compareSync(pwd, user.password)) {
      return user;
    } else {
      return null;
    }
  } catch {
    // Fields not given, etc.
    return null;
  }
};

export const checkBearerToken = (req) => {
  // Return token if valid bearer token, else null
  // token is given in headers > Authorization: Bearer <token>
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer")) {
    return null;
  }

  const token = header.split(" ")[1];
  if (!token) {
    return null;
  }

  return decodeToken(token, USER_TOKEN_SECRET);
};

export const refreshUserToken = (req) => {
  // Return new user token if refresh token is valid, else null
  // token is given in post body, key refreshToken
  const token = req.body.refreshToken;

  if (!token) {
    return null;
  }

  const user = decodeToken(token, REFRESH_TOKEN_SECRET);
  if (user !== null) {
    return generateWebToken(user.username, user.isAdmin, user.id);
  } else {
    return null;
  }
};

const decodeToken = (token, secret) => {
  // return object if valid token, else null
  // token string must be taken from request headers
  try {
    const user = jwt.verify(token, secret);
    return user;
  } catch (error) {
    return null;
  }
};

// checks that user is logged in
export const authenticateJWT = (req) => {
  // validate JWT
  const user = checkBearerToken(req);

  if (!user) {
    // if token is invalid or not present
    return null;
  }

  // if the token is valid, attach the decoded user info to req.user
  req.user = user;
};
