import { prisma } from "../../../../../prisma/prisma";
import { authenticateJWT } from "../../../../../utils/auth";

// get post by id, with comment data and tags
export default async function handler(req, res) {
  // only allow GET requests
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Method Not Allowed: Only POST requests are allowed" });
  }

  const { postID } = req.query;
  const { sortMode } = req.body;
  authenticateJWT(req);
  const userExists = "user" in req;
  const userID = userExists ? req.user.id : null;
  const isAdmin = userExists ? req.user.isAdmin : false;
  // sortBy True = sort by valued, false = sort by controversial
  // check if id is provided
  if (!postID) {
    return res.status(400).json({ error: "Bad Request: Post ID is required" });
  }

  try {
    // find post by id
    let orderBy;
    if (sortMode === "mostUpvoted") {
      orderBy = {
        content: {
          upvotes: {
            _count: "desc",
          },
        },
      };
    } else if (sortMode === "mostDownvoted") {
      orderBy = {
        content: {
          downvotes: {
            _count: "desc",
          },
        },
      };
    } else if (sortMode === "mostReported" && isAdmin) {
      orderBy = {
        content: {
          reports: {
            _count: "desc",
          },
        },
      };
    }

    // console.log(orderBy)
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postID) }, // convert id to integer
      include: {
        id: false,
        content: {
          select: {
            text: true,
            creationTime: true,
            author: { select: { username: true, id: true } },
            _count: {
              select: { upvotes: true, downvotes: true, reports: isAdmin },
            },
            reports: {
              select: {
                userID: true,
                reason: true,
                contentID: true,
                reporter: { select: { username: true } },
              },
            },
            isHidden: true,
          },
        },
        tags: { select: { tag: { select: { name: true } } } },
        _count: { select: { comments: true } },
        comments: {
          include: {
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
                    reports: isAdmin,
                  },
                },
              },
            },
            replies: {
              include: {
                content: {
                  select: {
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
                        reports: isAdmin,
                      },
                    },
                  },
                },
              },
              orderBy: { content: orderBy.content },
            },
            _count: {
              select: { replies: true },
            },
          },
          orderBy: { content: orderBy.content },
        },
      },
    });
    // console.log(orderBy)

    // check if post exists
    if (!post) {
      // console.log('Post not found')
      return res.status(404).json({ error: "Post not found" });
    }

    // If post is hidden and user is not an admin, return 404
    if (
      post.content?.isHidden &&
      !isAdmin &&
      post.content?.author.id !== userID
    ) {
      // console.log('Post is hidden')
      return res.status(404).json({ error: "Post not found" });
    }

    // Sort out table into a better format
    const returnObject = flattenPost(post, 0);
    // return the post
    return res.status(200).json(returnObject);
  } catch (error) {
    // TODO I think here, maybe we could return a 404, eg. if the user puts in a string ID and parseInt fails, that's their fault, not server error
    // TODO maybe check explicitly for the parseInt error, and we can return something else here? your call.
    console.log(error);
    return res
      .status(404)
      .json({ error: "An error occurred while fetching the post" });
  }
}

const flattenPost = (post, idx) => {
  const { contentID, title, content, tags, id } = post;
  const ret = { contentID, title };
  ret.description = content.text;
  ret.creationTime = new Date(content.creationTime).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "2-digit",
    },
  );
  ret.postID = id;
  ret.isHidden = content.isHidden;
  ret.authorUsername = content.author.username;
  ret.authorID = content.author.id;
  ret.upvotes = content["_count"].upvotes;
  ret.downvotes = content["_count"].downvotes;
  ret.report_counts = content["_count"].reports;
  ret.reports = content.reports.map((r) => {
    return {
      userID: r.userID,
      reason: r.reason,
      contentID: r.contentID,
      reporterUsername: r.reporter.username,
    };
  });
  ret.tags = tags.map((x) => x.tag.name);
  ret.comment_counts = post["_count"].comments;
  // console.log(post.comments)
  ret.comments = post.comments.map((c) => {
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
      contentID: c.contentID,
      upvotes: c.content["_count"].upvotes,
      downvotes: c.content["_count"].downvotes,
      reply_counts: c.reply_counts,
      isHidden: c.content.isHidden,
      replies: c.replies.map((r) => {
        return {
          text: r.content.text,
          contentID: r.contentID,
          creationTime: new Date(r.content.creationTime).toLocaleDateString(
            "en-US",
            {
              weekday: "short",
              month: "short",
              day: "2-digit",
            },
          ),
          authorUsername: r.content.author.username,
          upvotes: r.content["_count"].upvotes,
          downvotes: r.content["_count"].downvotes,
          report_counts: r.content["_count"].reports,
          reports: r.content.reports.map((r) => {
            return {
              userID: r.userID,
              reason: r.reason,
              contentID: r.contentID,
              reporterUsername: r.reporter.username,
            };
          }),
          isHidden: r.content.isHidden,
        };
      }),
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
