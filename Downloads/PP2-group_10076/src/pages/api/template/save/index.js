import { prisma } from "../../../../../prisma/prisma";
import { authenticateJWT } from "../../../../../utils/auth";

export default async function handler(req, res) {
  // only allow POST requests for creating
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Method Not Allowed: Only POST requests are allowed" });
  }

  // check if user is logged in
  await authenticateJWT(req);
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      error: "Unauthorized: You must be logged in to perform this action",
    });
  }

  const { code, title, explanation, language, tags, forkID } = req.body;

  try {
    // handle Tags - find or create them in the Tag table first
    let connectedTags = [];
    if (tags && tags.length > 0) {
      connectedTags = await Promise.all(
        tags.map(async (tag) => {
          const foundOrCreatedTag = await prisma.tag.upsert({
            where: { name: tag }, // check if the tag exists by name
            update: {}, // if it exists, do nothing
            create: { name: tag }, // if it doesn't exist, create a new tag
          });
          return { tagID: foundOrCreatedTag.id }; // return tagID for connecting
        }),
      );
    }

    let newTemplateData = {
      authorID: req.user.id, // infer userID from the logged-in user
      tags:
        connectedTags.length > 0
          ? {
              create: connectedTags.map((tag) => ({
                tag: {
                  connect: { id: tag.tagID }, // connect by tagID
                },
              })),
            }
          : undefined,
    };

    // handle fork if forkID is provided
    if (forkID) {
      const forkedTemplate = await prisma.codeTemplate.findUnique({
        where: { id: parseInt(forkID) },
      });

      if (!forkedTemplate) {
        return res.status(404).json({ error: "Template to fork not found" });
      }

      // copy code, title, and explanation from the forked template if not provided
      newTemplateData = {
        ...newTemplateData,
        code: code || forkedTemplate.code,
        title: title || `Fork of ${forkedTemplate.title}`,
        explanation: explanation || forkedTemplate.explanation,
        language: language || forkedTemplate.language,
        forkID: forkedTemplate.id,
      };
    } else {
      // title, code, and language are mandatory if creating a template from scratch
      // TODO we should probably check the language is within the few languages we support. Probably make a function in util.js
      if (!code || !title || !language) {
        return res
          .status(400)
          .json({ error: "Bad Request: Title and code cannot be empty" });
      }

      newTemplateData = {
        ...newTemplateData,
        explanation: explanation || "",
        language,
        code,
        title,
      };
    }

    // create the new template (either normal creation or forked)
    const newTemplate = await prisma.codeTemplate.create({
      data: newTemplateData,
    });

    return res.status(201).json(newTemplate);
  } catch (error) {
    console.error("Error creating template:", error); // log the error for debugging
    return res
      .status(500)
      .json({ error: "An error occurred while creating the template." });
  }
}
