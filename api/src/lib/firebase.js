const { initializeApp, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

// Initializes the Admin SDK once, using default credentials from the Functions environment
if (getApps().length === 0) {
  initializeApp();
}

module.exports = { auth: () => getAuth() };
