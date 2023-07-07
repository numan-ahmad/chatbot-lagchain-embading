//connect our config.env
require("dotenv").config({ path: "./config.env" });
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const errorHandler = require("./middleware/error");
const path = require("path");
const cookieParser = require("cookie-parser");

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

var rawBodySaver = function (req, res, buf, encoding) {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || "utf8");
  }
};
app.use(bodyParser.json({ verify: rawBodySaver, extended: true }));

const port = process.env.WEBSITES_PORT || 8080;
//const port =4242;
app.use(express.json());

//connect our routes
app.use("/api/openai", require("./routes/openai"));
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const node_env = process.env.APPSETTING_NODE_ENV;

if (node_env === "production") {
  app.use(express.static("./client/build"));
  app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}
