import { prisma } from "../../../../../prisma/prisma";
import { authenticateJWT } from "../../../../../utils/auth";

export default async function handler(req, res) {
  // Report post for reason
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  authenticateJWT(req);
  if (!req.user) {
    return res.status(401).json({ error: "Unable to verify login" });
  }

  const userID = req.user.id;
  const { contentID } = req.query;

  const contentIDInt = parseInt(contentID);
  if (contentIDInt === NaN) {
    return res.status(400).json({ error: "Bad Content ID" });
  }

  // Check that content is valid
  try {
    await prisma.content.delete({
      where: {
        id: contentIDInt,
        authorID: userID,
      },
    });
    return res.status(200).json({ message: "Successfully deleted the post" });
  } catch (error) {
    console.error(error);
    // eg. duplicate reports
    return res.status(400).json({ error: "Deletion unsuccessful" });
  }
}
