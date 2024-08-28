export const includeUserPipeline = [
  {
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "user",
      pipeline: [
        {
          $project: {
            _id: 1,
            name: 1,
            avatar: 1,
            username: 1,
          },
        },
      ],
    },
  },
  { $unwind: "$user" },
  {
    $project: {
      __v: 0,
      page: 0,
    },
  },
];

export const isLiked = (userId) => {
  return [
    {
      $lookup: {
        from: "likes", // Assuming your likes collection is called "likes"
        let: { postId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$post", "$$postId"] },
                  { $eq: ["$user", userId] },
                ],
              },
            },
          },
          { $count: "isLikedCount" }, // Count if the current user liked the post
        ],
        as: "isLiked",
      },
    },
    {
      $addFields: {
        isLiked: { $gt: [{ $arrayElemAt: ["$isLiked.isLikedCount", 0] }, 0] }, // Check if count > 0
      },
    },
  ];
};

export const includePagePipeline = [
  {
    $lookup: {
      from: "pages",
      localField: "page",
      foreignField: "_id",
      as: "page",
      pipeline: [
        {
          $project: {
            _id: 1,
            name: 1,
            image: 1,
          },
        },
      ],
    },
  },
  { $unwind: "$page" },
  {
    $project: {
      __v: 0,
      user: 0,
    },
  },
];

export const includeUserAndPagePipeline = [
  // Lookup for page
  {
    $lookup: {
      from: "pages",
      localField: "page",
      foreignField: "_id",
      as: "page",
      pipeline: [
        {
          $project: {
            _id: 1,
            name: 1,
            image: 1,
          },
        },
      ],
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "user",
      pipeline: [
        {
          $project: {
            _id: 1,
            name: 1,
            avatar: 1,
            username: 1,
          },
        },
      ],
    },
  },
  { $unwind: { path: "$page", preserveNullAndEmptyArrays: true } }, // Preserve if page is null
  { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } }, // Unwind user as well

  {
    $project: {
      _id: 1,
      updatedAt: 1,
      createdAt: 1,
      image: 1,
      description: 1,
      isEdited: 1,
      likesCount: 1,
      commentsCount: 1,

      page: {
        $cond: {
          if: { $not: ["$page"] }, // If page is null
          then: "$$REMOVE", // Remove page field
          else: "$page", // Otherwise, include page
        },
      },
      user: {
        $cond: {
          if: { $not: ["$page"] }, // If page is null
          then: "$user", // Include user
          else: "$$REMOVE", // Otherwise, remove user field
        },
      },
    },
  },
];

export const removePageAndUserPipeline = [
  {
    $project: {
      page: 0,
      user: 0,
      __v: 0,
    },
  },
];
