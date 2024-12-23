import { prisma } from "../../../../../../prisma/prisma";
import { authenticateJWT } from "../../../../../../utils/auth";

// get content Information by contentID
export default async function handler(req, res) {
  // only allow GET requests
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Method Not Allowed: Only POST requests are allowed" });
  }

  authenticateJWT(req);
  // console.log(req.headers);
  if (!req.user) {
    return res.status(401).json({ error: "auth error" });
  }

  const { contentID } = req.query;
  const contentIDInt = parseInt(contentID);
  const { user } = req; // if authenticated

  // check if id is provided
  if (!contentID) {
    return res
      .status(400)
      .json({ error: "Bad Request: Content ID is required" });
  }
  try {
    if (contentIDInt === NaN) {
      return res.status(400).json({ error: "Invalid Content ID" });
    }
    const content = await prisma.voted.findFirst({
      where: { userID: user.id, contentID: contentIDInt },
      include: { upvote: true, downvote: true },
    });

    if (!content) {
      return res.status(200).json({ status: "none" });
    }

    return res
      .status(200)
      .json({ status: content.upvote ? "upvote" : "downvote" });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ error: `Error finding content ${contentID}` });
  }
}
