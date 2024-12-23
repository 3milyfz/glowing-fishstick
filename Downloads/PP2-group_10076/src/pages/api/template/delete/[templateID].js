import { prisma } from "../../../../../prisma/prisma";
import { authenticateJWT } from "../../../../../utils/auth";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  authenticateJWT(req);
  if (!req.user) {
    return res.status(401).json({ error: "Unable to verify login" });
  }

  const userID = req.user.id;
  const { templateID } = req.query;

  const templateIDInt = parseInt(templateID);
  if (templateIDInt === NaN) {
    return res.status(400).json({ error: "Bad Template ID" });
  }

  // Check that template is valid
  try {
    await prisma.codeTemplate.delete({
      where: {
        id: templateIDInt,
        authorID: userID,
      },
    });
    return res
      .status(200)
      .json({ message: "Successfully deleted the template" });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Deletion unsuccessful" });
  }
}
