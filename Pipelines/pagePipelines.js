export const includeOwnerPipeline = [
  {
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "owner",
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

  {
    $unwind: "$owner",
  },
];

export const excludeAdminsPipeline = [
  {
    $project: {
      admins: 0,
      pendingAdminRequests: 0,
      __v: 0,
    },
  },
];
