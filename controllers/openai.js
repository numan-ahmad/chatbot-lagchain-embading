const { OpenAI } = require("langchain/llms/openai");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { HNSWLib } = require("langchain/vectorstores/hnswlib");
const { RetrievalQAChain } = require("langchain/chains");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const fs = require("fs");

exports.chatbot = async (req, res) => {
  const { text } = req.body;
  const VECTOR_STORE_PATH = `greetinganddata.index`;

  const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    model: "gpt-3.5-turbo",
    temperature: 0.1,
  });

  let vectorStore;
  if (fs.existsSync(VECTOR_STORE_PATH)) {
    console.log("Vector Exists..");
    vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, new OpenAIEmbeddings());
  }

  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

  const resp = await chain.call({
    query: text,
  });

  return res.status(200).json(resp.text);
};
