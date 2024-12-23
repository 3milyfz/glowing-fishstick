import { prisma } from "../../../../../prisma/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ error: "Method Not Allowed: Only GET requests are allowed" });
  }
  const MAX_PAGE_SIZE = 50;

  const {
    titleContains,
    explanationContains,
    tags,
    username,
    pageNumber,
    pageSize,
  } = req.query;

  const pageNumberInt = parseInt(pageNumber) || 1;
  const pageSizeInt = parseInt(pageSize) || 10;

  if (pageSizeInt > MAX_PAGE_SIZE) {
    return res
      .status(400)
      .json({ error: `Page size must be less than ${MAX_PAGE_SIZE}` });
  }

  try {
    // build the Prisma query object dynamically
    const query = {
      where: {},
      include: {
        tags: {
          select: {
            tag: true, // only return tag details
          },
        },
        author: {
          select: {
            username: true, // only return username, avoiding exposure of other fields
          },
        },
      },
      skip: (pageNumberInt - 1) * pageSizeInt,
      take: pageSizeInt,
      orderBy: { id: "desc" },
    };

    // filter by username (author)
    if (username) {
      query.where.author = {
        username: {
          equals: username,
        },
      };
    }

    // filter by title if provided
    if (titleContains) {
      query.where.title = {
        contains: titleContains,
      };
    }

    // filter by explanation if provided
    if (explanationContains) {
      query.where.explanation = {
        contains: explanationContains,
      };
    }

    // filter by tags if provided (split comma-separated string into an array)
    if (tags) {
      const tagArray = tags.split(",");
      query.where.tags = {
        some: {
          tag: {
            name: {
              in: tagArray,
            },
          },
        },
      };
    }

    // Fetch matching templates for the current page
    const templates = await prisma.codeTemplate.findMany(query);

    // Fetch total count of templates for pagination
    const totalCount = await prisma.codeTemplate.count({ where: query.where });

    // Transform the tags to return only the string names
    const formattedTemplates = templates.map((template) => ({
      ...template,
      tags: template.tags.map((t) => t.tag.name), // return string tag names
    }));

    // Include pagination metadata in the response
    return res.status(200).json({
      templates: formattedTemplates,
      totalCount,
      pageNumber: pageNumberInt,
      pageSize: pageSizeInt,
      hasNextPage: totalCount > pageNumberInt * pageSizeInt,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while searching for templates" });
  }
}
