const { OpenAI } = require("langchain/llms/openai");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { HNSWLib } = require("langchain/vectorstores/hnswlib");
const { RetrievalQAChain } = require("langchain/chains");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const fs = require("fs");

exports.chatbot = async (req, res) => {
  const { text } = req.body;
  const VECTOR_STORE_PATH = `greetinganddata8-7-2023.index`;
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

  if (
    resp.text.includes("I don't know") ||
    resp.text.includes("not mentioned in the context")
  ) {

    function randomIntFromInterval() {
      return Math.floor(Math.random() * (4 - 0 + 1) + 0);
    }

    const rndInt = randomIntFromInterval();
    const answers = [
      "I apologize, but as an AI trained in CFR 49 192-199 and Part 40 regulations, I'm currently unable to provide the information you're asking for.",
      "I'm sorry, but your request falls outside my training in CFR 49 192-199 and Part 40 regulations. I'm here to assist with matters pertaining to these regulations.",
      "Regrettably, I can't assist with that. My capabilities are focused on CFR 49 192-199 and Part 40 regulations.",
      "My training is specific to CFR 49 192-199 and Part 40 regulations, so I'm unable to provide the information you're looking for.",
      "As an AI developed with a focus on CFR 49 192-199 and Part 40 regulations, I'm unable to fulfill your request. I'm here to provide assistance within these specific domains.",
    ];
    return res.status(200).json(answers[rndInt]);

    console.log("found");
  }

  return res.status(200).json(resp.text);
};
