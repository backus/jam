// tiny wrapper with default env vars
module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 4000,
  ENABLE_SOURCE_MAPS:
    process.env.ENABLE_SOURCE_MAPS === "true" ||
    process.env.NODE_ENV !== "production",
};
