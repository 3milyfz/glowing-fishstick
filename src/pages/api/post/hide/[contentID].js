import { prisma } from "../../../../../prisma/prisma";
import { authenticateJWT } from "../../../../../utils/auth";

export default async function handler(req, res) {
  // Report post for reason
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  authenticateJWT(req);
  if (!req.user || !req.user.isAdmin) {
    return res.status(401).json({ error: "Not Authorized" });
  }

  const { contentID } = req.query;
  const contentIDInt = parseInt(contentID); // NaN if not an int
  if (contentIDInt === NaN) {
    return res
      .status(400)
      .json({ error: "Please provide a valid content ID to hide" });
  }

  const hide = "hide" in req.body ? Boolean(req.body.hide) : true; // if hide is undefined. If hide is false, this will be false.

  // try to hide the post
  try {
    await prisma.content.update({
      where: {
        id: contentIDInt,
      },
      data: {
        isHidden: hide,
      },
    });
    if (!hide) {
      return res.status(201).json({ message: "Successfully unhid the post" });
    }

    return res.status(201).json({ message: "Successfully hid the post" });
  } catch (error) {
    // eg. post DNE
    console.error(error);
    return res.status(400).json({ error: "Could not hide the post" });
  }
}
