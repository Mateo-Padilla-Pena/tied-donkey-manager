const express = require("express");
const apiRouter = require("./routes");
const { errorHandler, notFound } = require("./middlewares/errorHandler");

function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));

  // Strips the /api prefix: Hosting sends it in the path, direct function URLs do not
  app.use((req, _res, next) => {
    req.url = req.url.replace(/^\/api(?=\/|\?|$)/, "");
    if (!req.url.startsWith("/")) req.url = `/${req.url}`;
    next();
  });

  app.use("/", apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
