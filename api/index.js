const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { createApp } = require("./src/app");

// Secret from Secret Manager in production; read from .env.local locally
const databaseUrl = defineSecret("DATABASE_URL");

// Region close to the Railway database to reduce latency
const REGION = "us-central1";

// Single HTTP function that hosts the whole Express API
exports.api = onRequest(
  {
    region: REGION,
    secrets: [databaseUrl],
    maxInstances: 5, // Caps simultaneous connections to Postgres
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  createApp(),
);
