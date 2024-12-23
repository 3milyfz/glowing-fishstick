import { prisma } from "../../../../../prisma/prisma";
import { authenticateJWT } from "../../../../../utils/auth";

export default async function handler(req, res) {
  /*
    Fetches a list of Posts

    POST body can include:
    - [TESTED] title: string contained in title
    - [TESTED] content: string contained in content
    - [TESTED] tags: list of string tags for the post
    - [TESTED] templates: list of string templateIDs that the post must mention
    - [TESTED] fromUser: bool, whether to only show posts from user, or all posts
    - [TESTED]showHidden: bool, whether to show hidden posts(must be admin)
    - pageNumber: page number, starts at 1
    - pageSize: number of items per page, >0, default to 10
    - sortMode: mostUpvoted, mostDownvoted, title, mostReported, default "title"
    */
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Get user info if we have it
  authenticateJWT(req);
  const userExists = "user" in req;
  const userID = userExists ? req.user.id : null;
  const isAdmin = userExists ? req.user.isAdmin : false;

  // TODO check if fromUser, showHidden are boolean
  const {
    title,
    content,
    tags,
    templates,
    fromUser,
    showHidden,
    pageNumber,
    pageSize,
    sortMode,
  } = req.body;
  if (
    (typeof fromUser !== "boolean" && fromUser !== undefined) ||
    (typeof showHidden !== "boolean" && showHidden !== undefined)
  ) {
    console.log("WARNING: NON-BOOLEANS FOUND");
  }

  const pageNumberInt = parseInt(pageNumber) || 1;
  const pageSizeInt = parseInt(pageSize) || 10;
  const MAX_PAGE_SIZE = 50;

  if (pageSizeInt > MAX_PAGE_SIZE) {
    return res
      .status(400)
      .json({ error: `Page size must be less than ${MAX_PAGE_SIZE}` });
  }

  // Filter for posts only
  const whereObj = {};
  const contentObj = {}; // separate so nothing can rewrite it

  // APPLY FILTERS ==================================
  // Title filter
  if (!!title) {
    whereObj.title = { contains: title };
  }

  // Post must contain filtered content, and "@templateID" for each template in templates
  const contentIncludeList = !!content ? [content] : [];
  if (Array.isArray(templates)) {
    templates.forEach((template) => {
      contentIncludeList.push(`@{${template}}`);
    });
  }
  // NOTE: this will reset AND, but we should be ok to do that here.
  if (contentIncludeList.length > 0) {
    contentObj.AND = contentIncludeList.map((c) => {
      return { text: { contains: c } };
    });
  }

  // Filter to posts by the user ONLY, if specified
  if (userExists && fromUser) {
    contentObj.authorID = userID;
  }

  // Hide hidden posts unless otherwise specified
  if ((!isAdmin && !fromUser) || (isAdmin && !showHidden)) {
    contentObj.isHidden = false;
  }

  // Contain tags
  if (Array.isArray(tags) && tags.length > 0) {
    // May need to use JSON.parse if tags is a string representing a list of tags
    const tagFilters = tags.map((tagName) => {
      return { tags: { some: { tag: { name: tagName } } } };
    });
    whereObj.AND =
      "AND" in whereObj ? whereObj.AND.concat(tagFilters) : tagFilters;
  }

  // Add contentObj back to whereObj
  if ("content" in whereObj) {
    console.error("CONTENT IN WHEREOBJ");
  }
  whereObj.content = contentObj;

  // APPLY ORDERBY ===============================================
  // sortMode is "mostUpvoted, mostDownvoted, mostReported", or none for order by creation time
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
          _count: "asc",
        },
      },
    };
  } else {
    // by default, sort by title.
    orderBy = { content: { creationTime: "desc" } };
  }
  const [posts, count] = await prisma.$transaction([
    prisma.post.findMany({
      where: whereObj,
      include: {
        content: {
          select: {
            text: true,
            creationTime: true,
            isHidden: true,
            author: { select: { username: true, id: true } },
            _count: {
              select: { upvotes: true, downvotes: true, reports: isAdmin },
            },
          },
        },
        tags: { select: { tag: { select: { name: true } } } },
        _count: { select: { comments: true } },
      },
      orderBy: orderBy,
      skip: (pageNumberInt - 1) * pageSizeInt,
      take: pageSizeInt,
    }),
    prisma.post.count({ where: whereObj }),
  ]);
  // const posts = await

  // TODO sort out this table into a better format
  const returnObject = posts.map((p, idx) => flattenPost(p, idx));
  return res.status(200).json({ posts: returnObject, count });
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
  ret.reports = content["_count"].reports;
  ret.tags = tags.map((x) => x.tag.name);
  ret.comment_counts = post["_count"].comments;
  ret.idx = idx;
  return ret;
};
