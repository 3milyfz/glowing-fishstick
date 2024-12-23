// @ts-nocheck
import { prisma } from "../../../../../prisma/prisma";
import { authenticateJWT } from "../../../../../utils/auth";

export default async function hander(req, res) {
  const { contentID } = req.query;
  const { title, description, tags } = req.body;

  // only allow PUT requests for updating posts
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Check if user is logged in
  await authenticateJWT(req, res);
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      error: "Unauthorized: You must be logged in to perform this action",
    });
  }

  // Ensure id is provided
  if (!contentID) {
    return res
      .status(400)
      .json({ message: "Bad Request: Post ID is required" });
  }

  // Ensure title or description are provided
  if (!title && !description) {
    return res.status(400).json({
      error: "Bad Request: Title and Description cannot both be empty",
    });
  }

  try {
    if (contentID && req.method === "PUT") {
      // Get post
      const post = await prisma.post.findUnique({
        where: {
          contentID: parseInt(contentID),
        },
        include: {
          content: {
            select: {
              text: true,
              creationTime: true,
              authorID: true,
            },
          },
        },
      });

      // Check if post exists
      if (!post) {
        return res
          .status(404)
          .json({ message: `Could not find post to edit.` });
      }
      // console.log(post);
      // Check if logged-in user is the author of the post
      if (req.user.id !== post.content.authorID) {
        return res.status(403).json({
          error:
            "Unauthorized: You do not have permission to modify this template",
        });
      }

      // Check if user is the author of the post (if post exists)

      const updatePost = {};
      if (title) updatePost.title = title;
      if (description) updatePost.content = { update: { text: description } };
      // TODO need to delete unused tags

      // If there are tags, handle the tag relation
      if (tags && tags.length > 0) {
        await prisma.post.update({
          where: { contentID: parseInt(contentID) },
          data: {
            tags: {
              deleteMany: {}, // Clear all existing tags
            },
          },
        });
      }
      const non_Dup_tags = new Set(tags); // Remove duplicates

      // Now connect or create new tags
      const connectedTags = await Promise.all(
        [...non_Dup_tags].map(async (tag) => {
          const foundOrCreatedTag = await prisma.tag.upsert({
            where: { name: tag }, // check if the tag exists by name
            update: {}, // if it exists, do nothing
            create: { name: tag }, // if it doesn't exist, create a new tag
          });
          return { id: foundOrCreatedTag.id }; // return tagID for connecting
        }),
      );

      // console.log(connectedTags);
      // Connect new tags to the post
      updatePost.tags = {
        create: connectedTags.map((tag) => ({
          tag: {
            connect: { id: tag.id }, // Connect by tag ID
          },
        })),
      };

      const updatedPost = await prisma.post.update({
        where: { contentID: parseInt(contentID) },
        data: updatePost,
        include: {
          content: {
            select: {
              text: true,
              creationTime: true,
            },
          },
          tags: {
            select: {
              tag: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
      console.log(updatedPost);
      const returnPost = flattenSave(updatedPost);
      return res.status(200).json(returnPost);
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "An error occurred while saving the post" });
  }
}

const flattenSave = (post) => {
  const { contentID, title, content, id } = post;
  const ret = { contentID, title };
  ret.description = content.text;
  ret.tags = post.tags.map((tag) => tag.tag.name);
  return ret;
};
