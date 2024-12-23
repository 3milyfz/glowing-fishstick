// @ts-nocheck
import { prisma } from "../../../../../prisma/prisma";
import { authenticateJWT } from "../../../../../utils/auth";

export default async function handler(req, res) {
  // only allow POST requests for creating
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Check if user is logged in
  await authenticateJWT(req, res);
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      error: "Unauthorized: You must be logged in to perform this action",
    });
  }

  const { title, description, tags } = req.body;
  if (!title || !description) {
    return res
      .status(400)
      .json({ error: "Bad Request: Title and Description cannot be empty" });
  }

  try {
    // Find of create tags
    let connectedTags = [];
    if (tags && tags.length > 0) {
      connectedTags = await Promise.all(
        tags.map(async (tag) => {
          const foundOrCreatedTag = await prisma.tag.upsert({
            where: { name: tag },
            update: {},
            create: { name: tag },
          });
          return { tagID: foundOrCreatedTag.id };
        }),
      );
    }

    let newPostData = {
      title,
      content: {
        create: {
          // Setting this to title instead of "BlogPost" for now
          text: description,
          authorID: req.user.id,
        },
      },
      tags:
        connectedTags.length > 0
          ? {
              create: connectedTags.map((tag) => ({
                tag: {
                  connect: { id: tag.tagID },
                },
              })),
            }
          : undefined,
    };

    const newPost = await prisma.post.create({
      data: newPostData,
    });

    return res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating the Blog Post." });
  }
}
