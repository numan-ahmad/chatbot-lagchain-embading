const OpenAI = require("openai");
const fs = require("fs");
const axios = require("axios");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

async function GPTClassify(text) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "As an AI with chatbot you have to decide if  customer is greeting or not, if the customer is sending greeting text reply 0 if text is not greeting than reply with 1",
      },
      {
        role: "user",
        content: text,
      },
    ],
  });
  return completion.choices[0].message.content;
}
async function GPTGreet(text) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "As an AI with chatbot have to greetback the customer",
      },
      {
        role: "user",
        content: text,
      },
    ],
  });
  return completion.choices[0].message.content;
}

async function GPTResponse(text) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "If the user sends a greeting text then greet in return. As an AI with expertise in Gas regulations  CFR 49 192-199 and Part 40 regulations, your task is to elaborate the incomming response, explain it in detail",
      },
      {
        role: "user",
        content: text,
      },
    ],
  });
  return completion.choices[0].message.content;
}
async function GPTResponseDontKnow(text) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "if the incoming text says i dnt know reply: ***My training is specific to CFR 49 192-199 and Part 40 regulations, so I'm unable to provide the information you're looking for*** or tell them ***Regrettably, I can't assist with that. My capabilities are focused on CFR 49 192-199 and Part 40 regulations***",
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  return completion.choices[0].message.content;
}
async function Transcribe(filepath) {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filepath),
    model: "whisper-1",
  });

  return transcription.text;
}

exports.GPTResponse = GPTResponse;
exports.GPTResponseDontKnow = GPTResponseDontKnow;
exports.GPTClassify = GPTClassify;
exports.GPTGreet = GPTGreet;
exports.Transcribe = Transcribe;
