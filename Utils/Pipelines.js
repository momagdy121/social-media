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
