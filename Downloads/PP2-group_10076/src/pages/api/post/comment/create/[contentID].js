import { prisma } from "../../../../../../prisma/prisma";
import { authenticateJWT } from "../../../../../../utils/auth";

export default async function handler(req, res) {
  // only allow POST requests for creating
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Method Not Allowed: Only POST requests are allowed" });
  }
  const { contentID } = req.query;
  const { content } = req.body;

  // check if user is logged in
  authenticateJWT(req, res);
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      error: "Unauthorized: You must be logged in to perform this action",
    });
  }

  // Ensure id is provided
  if (!contentID) {
    return res
      .status(400)
      .json({ error: "Bad Request: Content ID is required" });
  }

  if (!content) {
    return res
      .status(400)
      .json({ error: "Bad Request: Comment content cannot be empty" });
  }

  // We get the instance from matching contentID to id and then check if it is a post or a comment
  // From here, we can create a comment for a post or a comment
  try {
    const cont = await prisma.content.findUnique({
      where: {
        id: parseInt(contentID),
      },
      include: {
        post: true,
        comments: true,
        reply: true,
      },
    });
    // Check if content exists
    if (!cont) {
      return res.status(404).json({ error: `Content ${contentID} not found` });
    }
    // If contentID is a post, add a comment on the post
    if (!!cont.post) {
      const comment = await prisma.comment.create({
        data: {
          content: {
            create: {
              text: content,
              author: {
                connect: {
                  id: req.user.id,
                },
              },
            },
          },
          parentPost: { connect: { id: cont.post.id } },
        },
        include: {
          content: {
            include: {
              author: {
                select: {
                  username: true,
                  id: true,
                },
              },
              _count: {
                select: {
                  upvotes: true,
                  downvotes: true,
                },
              },
            },
          },
        },
      });
      const commentData = flattenComment(comment);
      return res.status(201).json(commentData);
    } else if (!!cont.comments) {
      // if cont is a comment, then create a reply to it
      const reply = await prisma.reply.create({
        data: {
          content: {
            create: {
              text: content,
              author: {
                connect: {
                  id: req.user.id,
                },
              },
            },
          },
          parentComment: { connect: { id: cont.comments.id } },
        },
        include: {
          content: {
            include: {
              author: {
                select: {
                  username: true,
                  id: true,
                },
              },
              _count: {
                select: {
                  upvotes: true,
                  downvotes: true,
                },
              },
            },
          },
        },
      });
      const replyData = flattenComment(reply);
      return res.status(201).json(replyData);
    } else if (!!cont.reply) {
      // if cont is a reply, create a reply to the parent comment
      const reply = await prisma.reply.create({
        data: {
          content: {
            create: {
              text: content,
              author: {
                connect: {
                  id: req.user.id,
                },
              },
            },
          },
          parentComment: { connect: { id: cont.reply.commentID } },
        },
        include: {
          content: {
            include: {
              author: {
                select: {
                  username: true,
                  id: true,
                },
              },
              _count: {
                select: {
                  upvotes: true,
                  downvotes: true,
                },
              },
            },
          },
        },
      });
      const replyData = flattenComment(reply);
      return res.status(201).json(replyData);
    } else {
      return res
        .status(404)
        .json({ error: "Could not find content to reply to" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating the comment/reply" });
  }
}
const flattenComment = (comment) => {
  const { contentID, content, replies, id } = comment;
  const ret = { contentID };
  ret.commentID = id;
  ret.text = content.text;
  ret.creationTime = new Date(content.creationTime).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "2-digit",
    },
  );
  ret.authorUsername = content.author.username;
  ret.authorID = content.authorID;
  ret.upvotes = content["_count"].upvotes;
  ret.downvotes = content["_count"].downvotes;
  ret.reply_counts = content["_count"].replies;

  return ret;
};
