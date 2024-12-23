import { prisma } from "../../../../prisma/prisma";
import {
  authenticateJWT,
  generateRefreshToken,
  generateWebToken,
} from "../../../../utils/auth";

const ADMIN_PASSWORD = "admin";

export default async function handler(req, res) {
  /*
    Sets the current user to admin status, given an admin password.
    */

  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  authenticateJWT(req);
  if (!req.user) {
    return res.status(401).json({ error: "Unable to verify login" });
  }

  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Authorization Failed" });
  }

  try {
    const user = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        isAdmin: true,
      },
    });
    const webToken = generateWebToken(user.username, user.isAdmin, user.id);
    const refreshToken = generateRefreshToken(
      user.username,
      user.isAdmin,
      user.id,
    );
    return res
      .status(200)
      .json({ accessToken: webToken, refreshToken: refreshToken });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Failed to escalate privileges" });
  }
}
