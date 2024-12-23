import { prisma } from "../../../../prisma/prisma";
import { hashPassword } from "../../../../utils/auth";

const PROFILE_PHOTOS = [0, 1, 2];

export default async function handler(req, res) {
  /*
    Creates a user
    */
  if (req.method !== "POST") {
    return res.status(405).message({ error: "Method Not Allowed" });
  }

  // TODO handle file uploads for avatar
  const { username, password, firstName, lastName, email, phone, avatar } =
    req.body;

  if (!username || !password || !firstName || !lastName || !email) {
    return res.status(400).json({ error: "Missing Required Field" });
  }

  const avatarInt = getAvatar(avatar);

  // We can explain invalid phone number/email errors to the client
  if (!!phone && !isValidPhoneNumber(phone)) {
    return res
      .status(400)
      .json({ error: "Phone number must be 10 digits, no spaces" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid Email Format" });
  }

  try {
    const hashedPassword = hashPassword(password);
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        firstName,
        lastName,
        email,
        phone,
        avatar: avatarInt,
      },
    });
    return res.status(201).json({ message: "Success" });
  } catch {
    // If duplicate user or something went wrong in the backend
    return res.status(400).json({
      error: "Could not create user. Username or email may be duplicated",
    });
  }
}

const isValidPhoneNumber = (phoneNumberString) => {
  const phoneRegex = /^\d{10}$/; // 10 digits, no space
  return phoneRegex.test(phoneNumberString);
};

const isValidEmail = (emailString) => {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\.\w-]+$/g; // https://regexr.com/3e48o
  return emailRegex.test(emailString);
};

export const getAvatar = (x) => {
  const parsedX = parseInt(x);
  if (!PROFILE_PHOTOS.includes(parsedX)) {
    return 0;
  } else {
    return x;
  }
};
