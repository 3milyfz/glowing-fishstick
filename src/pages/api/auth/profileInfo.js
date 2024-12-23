import { prisma } from "../../../../prisma/prisma";
import { authenticateJWT } from "../../../../utils/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  authenticateJWT(req);
  if (!req.user) {
    return res.status(401).json({ error: "Unable to verify login" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { username: req.user.username },
      select: {
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        password: false,
        id: true,
        isAdmin: true,
      },
    });
    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "An Error Occurred" });
  }
}
