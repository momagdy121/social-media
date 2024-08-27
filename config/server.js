const Listen = (app) => {
  let port = process.env.PORT || 4000;

  return app.listen(port, () => {
    console.log(`listening at ${port}`);
  });
};

export default Listen;
