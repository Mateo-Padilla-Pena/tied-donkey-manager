const Joi = require("joi");

// Personal data the user can edit; identity fields (firebaseUid, email) come from the token
const updateProfile = Joi.object({
  fullName: Joi.string().trim().max(120).allow("", null),
}).min(1);

module.exports = { updateProfile };
