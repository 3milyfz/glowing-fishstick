import { prisma } from "../../../../../prisma/prisma";
import { authenticateJWT } from "../../../../../utils/auth";

export default async function handler(req, res) {
  // Report post for reason
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  authenticateJWT(req);
  if (!req.user) {
    return res.status(401).json({ error: "Unable to verify login" });
  }

  const userID = req.user.id;
  const { contentID } = req.query;
  const { reason } = req.body;
  const reasonStr = reason || "";

  const contentIDInt = parseInt(contentID);
  if (contentIDInt === NaN) {
    return res.status(400).json({ error: "Bad Content ID" });
  }

  // Check that content is valid
  try {
    const post = await prisma.content.findUnique({
      where: {
        id: contentIDInt,
      },
    });
    if (!post) {
      return res.status(400).json({ error: "Bad Content ID" });
    }

    // Check if user has already reported this post
    const existingReport = await prisma.reported.findFirst({
      where: {
        userID: userID,
        contentID: contentIDInt,
      },
    });

    if (existingReport) {
      await prisma.reported.update({
        where: {
          id: existingReport.id,
        },
        data: {
          reason: reasonStr,
        },
      });
    } else {
      await prisma.reported.create({
        data: {
          userID: userID,
          contentID: contentIDInt,
          reason: reasonStr,
        },
      });
    }

    return res.status(201).json({ message: "Successfully reported the post" });
  } catch (error) {
    console.error(error);
    // eg. duplicate reports
    return res.status(400).json({ error: "Report unsuccessful" });
  }
}
