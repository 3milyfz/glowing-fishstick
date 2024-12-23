import { prisma } from "../../../../../../prisma/prisma";
import { authenticateJWT } from "../../../../../../utils/auth";

// get content Information by contentID
export default async function handler(req, res) {
  // only allow GET requests
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ error: "Method Not Allowed: Only GET requests are allowed" });
  }

  const { contentID } = req.query;
  const isAdmin = req.user ? req.user.isAdmin : false;

  // check if id is provided
  if (!contentID) {
    return res
      .status(400)
      .json({ error: "Bad Request: Content ID is required" });
  }
  try {
    // find content by id including author
    const content = await prisma.content.findUnique({
      where: { id: parseInt(contentID) }, // convert id to integer
      select: {
        id: false,
        text: true,
        authorID: true,
        author: { select: { username: true } },
        creationTime: true,
        isHidden: true,
        comments: true,
        reports: {
          select: {
            userID: true,
            reason: true,
            contentID: true,
            reporter: {
              select: {
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            votes: true,
            upvotes: true,
            downvotes: true,
            reports: true,
          },
        },
      },
    });
    // console.log(contentID)
    // console.log('im still alive here')
    // console.log("Content: ", content.comments.id);
    // If the content is a comment, get the replies
    if (content.comments) {
      const replies = await prisma.reply.findMany({
        where: { commentID: parseInt(content.comments.id) },
        select: {
          content: {
            select: {
              id: true,
              text: true,
              author: { select: { username: true } },
              creationTime: true,
              isHidden: true,
              reports: {
                select: {
                  userID: true,
                  reason: true,
                  contentID: true,
                  reporter: {
                    select: { username: true },
                  },
                },
              },
              _count: {
                select: {
                  votes: true,
                  upvotes: true,
                  downvotes: true,
                  reports: isAdmin,
                },
              },
            },
          },
        },
      });
      content.replies = replies;
    }

    // console.log("Content after replies: ", content);
    if (!content) {
      // console.log('Content not found');
      return res.status(404).json({ error: `Content ${contentID} not found` });
    }

    // check if content is hidden
    if (content.isHidden && !isAdmin) {
      return res.status(404).json({ error: `Content ${contentID} is hidden` });
    }

    const returnObject = flattenContent(content);
    // console.log(returnObject)
    return res.status(200).json(returnObject);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: `Error finding content ${contentID}` });
  }
}

const flattenContent = (content, idx) => {
  const { id, text, author, isHidden, creationTime, reports, _count } = content;
  const { upvotes, downvotes } = _count;
  const ret = {
    id,
    text,
    authorUsername: author.username,
    isHidden,
    upvotes,
    downvotes,
  };
  ret.creationTime = new Date(creationTime).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
  });
  ret.report_counts = content["_count"].reports;
  ret.reports = reports.map((r) => {
    return {
      userID: r.userID,
      reason: r.reason,
      contentID: r.contentID,
      reporterUsername: r.reporter.username,
    };
  });
  ret.reply_counts = content.replies?.length;
  ret.replies = content.replies?.map((c) => {
    // console.log("C: ", c)
    return {
      text: c.content.text,
      creationTime: new Date(c.content.creationTime).toLocaleDateString(
        "en-US",
        {
          weekday: "short",
          month: "short",
          day: "2-digit",
        },
      ),
      authorUsername: c.content.author.username,
      contentID: c.content.id,
      upvotes: c.content["_count"].upvotes,
      downvotes: c.content["_count"].downvotes,
      report_counts: c.content["_count"].reports,
      reports: c.content.reports.map((r) => {
        return {
          userID: r.userID,
          reason: r.reason,
          contentID: r.contentID,
          reporterUsername: r.reporter.username,
        };
      }),
    };
  });
  ret.idx = idx;
  return ret;
};
