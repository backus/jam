require("babel-register");

module.exports = {
  development: {
    username: null,
    password: null,
    database: "jam-dev",
    host: "localhost",
    dialect: "postgres",
    // Make sure tables and columns are underscored in DB and not camel
    // @see https://git.io/Jvvj6
    // Also, for models @see https://sequelize.org/master/manual/models-definition.html#configuration
    define: {
      underscored: true,
      underscoredAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  test: {
    username: null,
    password: null,
    database: "jam-test",
    host: "localhost",
    dialect: "postgres",
    // Make sure tables and columns are underscored in DB and not camel
    // @see https://git.io/Jvvj6
    // Also, for models @see https://sequelize.org/master/manual/models-definition.html#configuration
    define: {
      underscored: true,
      underscoredAll: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
};
