export const countFollowersPipeline = (pageId) => {
  return [
    {
      $match: { page: pageId },
    },
    {
      $count: "followersCount",
    },
  ];
};
