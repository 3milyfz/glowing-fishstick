import { prisma } from "../../../../../prisma/prisma";

// get template by id
export default async function handler(req, res) {
  // only allow GET requests
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ error: "Method Not Allowed: Only GET requests are allowed" });
  }

  const { templateID } = req.query;

  // check if id is provided
  if (!templateID) {
    return res
      .status(400)
      .json({ error: "Bad Request: Template ID is required" });
  }

  try {
    // find template by id including tags, author, and language
    const template = await prisma.codeTemplate.findUnique({
      where: { id: parseInt(templateID) }, // convert id to integer
      include: {
        author: {
          select: {
            username: true, // include the username of the author
          },
        },
        tags: {
          select: {
            tag: {
              select: { name: true }, // include the tag names
            },
          },
        },
      },
    });

    // check if template exists
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    // Extract tag names and prepare the response
    const tagNames = template.tags.map((tagRelation) => tagRelation.tag.name);

    // return the template including username, tags, and language
    return res.status(200).json({
      id: template.id,
      code: template.code,
      title: template.title,
      explanation: template.explanation,
      language: template.language, // Return language of the template
      authorUsername: template.author.username, // Return username
      tags: tagNames, // Return tag names as an array of strings
      forkID: template.forkID, // Return forkID
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the template" });
  }
}
