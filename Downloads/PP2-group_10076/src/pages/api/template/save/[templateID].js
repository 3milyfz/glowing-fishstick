import { prisma } from "../../../../../prisma/prisma";
import { authenticateJWT } from "../../../../../utils/auth";

export default async function handler(req, res) {
  // only allow PUT requests for updating
  if (req.method !== "PUT") {
    return res
      .status(405)
      .json({ error: "Method Not Allowed: Only PUT requests are allowed" });
  }

  // check if user is logged in
  await authenticateJWT(req);
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      error: "Unauthorized: You must be logged in to perform this action",
    });
  }

  const { templateID } = req.query;
  const { code, title, explanation, language, tags } = req.body;

  // ensure the id is provided
  if (!templateID) {
    return res
      .status(400)
      .json({ error: "Bad Request: Template ID is required for updating." });
  }

  try {
    // find the template to update
    const template = await prisma.codeTemplate.findUnique({
      where: { id: parseInt(templateID) },
    });

    // check if template exists
    if (!template) {
      return res
        .status(404)
        .json({ error: `Template ${templateID} not found` });
    }

    // check if logged-in user is the owner of the template
    if (req.user.id !== template.authorID) {
      return res.status(403).json({
        error:
          "Unauthorized: You do not have permission to modify this template",
      });
    }

    const templateChanges = {};
    // only add fields if they are provided (handles empty filter fields)
    if (code) templateChanges.code = code;
    if (title) templateChanges.title = title;
    if (explanation) templateChanges.explanation = explanation;
    if (language) templateChanges.language = language; // TODO is this correct? wouldn't it be .language = language?

    // If there are tags, handle the tag relation
    if (tags && tags.length > 0) {
      // First, clear existing tags from the template
      await prisma.codeTemplate.update({
        where: { id: parseInt(templateID) },
        data: {
          tags: {
            deleteMany: {}, // Clear all existing tags
          },
        },
      });

      // Now connect or create new tags
      const connectedTags = await Promise.all(
        tags.map(async (tag) => {
          const foundOrCreatedTag = await prisma.tag.upsert({
            where: { name: tag }, // check if the tag exists by name
            update: {}, // if it exists, do nothing
            create: { name: tag }, // if it doesn't exist, create a new tag
          });
          return { id: foundOrCreatedTag.id }; // return tagID for connecting
        }),
      );

      // Connect new tags to the template
      templateChanges.tags = {
        create: connectedTags.map((tag) => ({
          tag: {
            connect: { id: tag.id }, // Connect by tag ID
          },
        })),
      };
    }

    // update the template with the new or updated fields
    const updatedTemplate = await prisma.codeTemplate.update({
      where: { id: parseInt(templateID) },
      data: templateChanges,
    });

    return res.status(200).json(updatedTemplate);
  } catch (error) {
    console.error("Error updating template:", error); // log the error for debugging
    return res
      .status(500)
      .json({ error: "An error occurred while updating the template." });
  }
}
