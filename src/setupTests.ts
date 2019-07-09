jest.setTimeout(60000);

process.env["CONFIG_ENV"] = "ci";
process.env["DB_TYPE"] = "memory";
process.env["SQL_SERVER_ADMIN"] = "none";
process.env["SQL_SERVER_PASSWORD"] = "none";
process.env["LOG_LEVEL"] = "error";
