const { OpenAI } = require("langchain/llms/openai");
const { Configuration, OpenAIApi } = require("openai");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { HNSWLib } = require("langchain/vectorstores/hnswlib");
const { RetrievalQAChain } = require("langchain/chains");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const fs = require("fs");
const {
  GPTResponse,
  GPTResponseDontKnow,
  GPTClassify,
  GPTGreet,
  Transcribe,
} = require("./Gpt4Response.js");

const openai = new OpenAI(process.env.OPENAI_API_KEY);

async function GetAnswer(text) {
  const lowerText = text.toString().toLowerCase();
  const VECTOR_STORE_PATH = `greetinganddata8-7-2023.index`;
  const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4",
    temperature: 0.1,
  });

  let vectorStore;
  if (fs.existsSync(VECTOR_STORE_PATH)) {
    console.log("Vector Exists..");
    vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, new OpenAIEmbeddings());
  }

  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

  const resp = await chain.call({
    query: lowerText,
  });
  return resp;
}

exports.chatbot = async (req, res) => {
  const { text } = req.body;
    const classify = await GPTClassify(text);
    if (classify === "1") {
      const resp = await GetAnswer(text);

      if (
        resp.text.includes("I don't know") ||
        resp.text.includes("not mentioned in the context")
      ) {
        refinedAnswerText = await GPTResponseDontKnow(
          `Q:${text}\nAnswer:${resp.text}`
        );
      } else {
        refinedAnswerText = await GPTResponse(`Q:${text}\nAnswer:${resp.text}`);
      }

      return res.status(200).json({
        question: text,
        reply: refinedAnswerText,
      });
    }
    if (classify === "0") {
      const resp = await GPTGreet(`${text}`);
      return res.status(200).json({
        question: text,
        reply: resp,
      });
    }
};

exports.audiochat = async (req, res) => {
  const text = await Transcribe(req.file.path);

  let refinedAnswerText = "";

  const classify = await GPTClassify(text);
  if (classify === "1") {
    const resp = await GetAnswer(text);

    if (
      resp.text.includes("I don't know") ||
      resp.text.includes("not mentioned in the context")
    ) {
      refinedAnswerText = await GPTResponseDontKnow(
        `Q:${text}\nAnswer:${resp.text}`
      );
    } else {
      refinedAnswerText = await GPTResponse(`Q:${text}\nAnswer:${resp.text}`);
    }

    return res.status(200).json({
      question: text,
      reply: refinedAnswerText,
    });
  }
  if (classify === "0") {
    const resp = await GPTGreet(`${text}`);
    return res.status(200).json({
      question: text,
      reply: resp,
    });
  }
};
