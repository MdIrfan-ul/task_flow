require('dotenv').config();

const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_DIALECT } = process.env;

if (!DB_DIALECT) {
    console.error("dialect is missing");
}
if (!DB_USERNAME) {
    console.error("username is missing");
}
if (!DB_PASSWORD) {
    console.error("password is missing");
}
if (!DB_HOST) {
    console.error("host is missing");
}
if (!DB_NAME) {
    console.error("database is missing");
}

module.exports = {
    development: {
        username: DB_USERNAME,
        password: DB_PASSWORD,
        database: DB_NAME,
        host: DB_HOST,
        dialect: DB_DIALECT,
    },
};
