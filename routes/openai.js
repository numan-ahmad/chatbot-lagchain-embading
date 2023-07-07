const express = require("express");
const router = express.Router();

const { chatbot } = require("../controllers/openai");

router.route("/chatbot").post(chatbot);

module.exports = router;
