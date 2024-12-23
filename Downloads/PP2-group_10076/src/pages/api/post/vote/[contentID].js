import { prisma } from "../../../../../prisma/prisma";
import { authenticateJWT } from "../../../../../utils/auth";

export default async function handler(req, res) {
  // Can allow POST
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Method Not Allowed: Only POST requests are allowed" });
  }
  const { contentID } = req.query;
  const { state } = req.body;

  // check if user is logged in
  authenticateJWT(req, res);
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      error: "Unauthorized: You must be logged in to perform this action",
    });
  }

  // Ensure id is provided
  // if (!contentID) {
  //     return res.status(400).json({ error: "Bad Request: Comment ID is required" });
  // }
  const contentIDInt = parseInt(contentID);
  if (contentIDInt === NaN) {
    return res.status(400).json({ error: "contentID must be an integer" });
  }

  try {
    // Don't think we need this
    // const voted = await prisma.voted.findUnique({
    //     where: {
    //         contentId: parseInt(contentID),
    //     },
    // }).catch((err) => {
    //     // Would this be a 500, bcz I think if this errors that means the server is broken
    //     return res.status(400).json({ error: `Error finding voted information on content ${contentID}` });
    // });

    // Check if content exists
    // Update the voted status
    // if state is 1, then upvote = True, if 0, then remove voted, if -1, then upvote = False
    let upvote = null;
    let stateInt = parseInt(state);
    if (stateInt === 1) {
      upvote = true;
    } else if (stateInt === 0) {
      upvote = null;
    } else if (stateInt === -1) {
      upvote = false;
    } else {
      return res.status(400).json({ error: "Bad Request: Invalid vote state" });
    }

    // Delete the old vote
    const existingVote = await prisma.voted.findFirst({
      where: {
        userID: req.user.id,
        contentID: contentIDInt,
      },
      include: {
        upvote: true,
        downvote: true,
      },
    });

    if (existingVote) {
      await prisma.voted.delete({
        where: {
          id: existingVote.id,
        },
      });
      if (
        !!existingVote?.downvote === !upvote ||
        !!existingVote?.upvote === upvote
      ) {
        return res.status(200).json({ message: "Vote removed" });
      }
    }

    // We just manually ensure here that we cannot create an upvote AND downvote, seems like we can't
    // enforce this in the DB schema(or rather, if we try to then we can't aggregate BOTH upvotes/downvotes when searching posts due to prisma limitations)
    if (upvote === true) {
      // upvote
      const upvote = await prisma.voted.create({
        data: {
          userID: req.user.id,
          contentID: contentIDInt,
          upvote: {
            create: {
              content: {
                connect: {
                  id: contentIDInt,
                },
              },
              user: {
                connect: {
                  id: req.user.id,
                },
              },
            },
          },
        },
        include: {
          upvote: true,
        },
      });
      return res.status(200).json(upvote);
    } else if (upvote === false) {
      // downvote
      const downvote = await prisma.voted.create({
        data: {
          userID: req.user.id,
          contentID: contentIDInt,
          downvote: {
            create: {
              content: {
                connect: {
                  id: contentIDInt,
                },
              },
              user: {
                connect: {
                  id: req.user.id,
                },
              },
            },
          },
        },
      });
      return res.status(200).json(downvote);
    } else {
      // Just return message if upvote = 0
      return res.status(200).json({ message: "Vote removed" });
    }
    // if (upvote === null) {
    //     const deletedVote = await prisma.voted.delete({
    //         where: {
    //             contentID: parseInt(contentID),
    //             userID: req.user.id,
    //         },
    //     }).catch((err) => {
    //         return res.status(400).json({ error: `Error deleting vote on content ${id}` });
    //     });
    //     return res.status(200).json(deletedVote);
    // } else {
    //     const updatedVote = await prisma.voted.upsert({
    //         where: {
    //             contentId: parseInt(contentID),
    //             userID: req.user.id
    //         },
    //         update: {
    //             upvote: upvote,
    //         },
    //         create: {
    //             contentId: parseInt(contentID),
    //             userID: req.user.id,
    //             upvote: upvote,
    //         },
    //     })
    //     return res.status(200).json(updatedVote);
    // }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating/creating the vote." });
  }
}
