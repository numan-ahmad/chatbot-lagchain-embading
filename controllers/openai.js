const { OpenAI } = require("langchain/llms/openai");
const { Configuration, OpenAIApi } = require("openai");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { HNSWLib } = require("langchain/vectorstores/hnswlib");
const { RetrievalQAChain } = require("langchain/chains");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const fs = require("fs");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function transcribe(file) {
  const transcript = await openai.createTranscription(
    fs.createReadStream(file),
    "whisper-1"
  );
  return transcript.data.text;
}

async function GetAnswer(text) {
  const lowerText = text.toString().toLowerCase();
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
    query: lowerText,
  });
  return resp;
}

async function CheckDntKnow(resp) {
  if (
    resp.text.includes("I don't know") ||
    resp.text.includes("not mentioned in the context")
  ) {
    console.log(resp.text);
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
    return answers[rndInt];
  } else {
    return resp.text;
  }
}

exports.chatbot = async (req, res) => {
  const { text } = req.body;

  const resp = await GetAnswer(text);
  const refinedAnswerText = await CheckDntKnow(resp);

  return res.status(200).json({ reply: refinedAnswerText });
};

exports.audiochat = async (req, res) => {
  const data = await transcribe(req.file.path);
  const resp = await GetAnswer(data);
  const refinedAnswerText = await CheckDntKnow(resp);

  return res.status(200).json({ question: data, reply: refinedAnswerText });
};
