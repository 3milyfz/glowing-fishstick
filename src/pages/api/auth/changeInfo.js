import { authenticateJWT } from "../../../../utils/auth";
import { prisma } from "../../../../prisma/prisma";
import { hashPassword } from "../../../../utils/auth";
import { getAvatar } from "./signup";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  authenticateJWT(req);
  if (!req.user) {
    return res.status(401).json({ error: "Unable to verify login" });
  }

  const { password, firstName, lastName, phone, avatar } = req.body;

  const avatarInt = getAvatar(avatar);

  // We can explain invalid phone number/email errors to the client
  if (!!phone && !isValidPhoneNumber(phone)) {
    return res
      .status(400)
      .json({ error: "Phone number must be 10 digits, no spaces" });
  }

  try {
    const hashedPassword = !password ? undefined : hashPassword(password);
    const newUser = await prisma.user.update({
      where: { username: req.user.username },
      data: {
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        avatar: avatarInt,
      },
      select: {
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        password: false,
        id: false,
        isAdmin: true,
      },
    });
    return res.status(201).json(newUser);
  } catch {
    // If duplicate user or something went wrong in the backend
    return res.status(400).json({
      error: "Could not update user.",
    });
  }
}

const isValidPhoneNumber = (phoneNumberString) => {
  const phoneRegex = /^\d{10}$/; // 10 digits, no space
  return phoneRegex.test(phoneNumberString);
};
