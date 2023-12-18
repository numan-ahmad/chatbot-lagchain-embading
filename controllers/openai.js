const { OpenAI } = require("langchain/llms/openai");
const { Configuration, OpenAIApi } = require("openai");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { HNSWLib } = require("langchain/vectorstores/hnswlib");
const { RetrievalQAChain, loadQARefineChain } = require("langchain/chains");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const {
  RunnablePassthrough,
  RunnableSequence,
} = require("langchain/schema/runnable");
const {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  PromptTemplate,
} = require("langchain/prompts");
const { StringOutputParser } = require("langchain/schema/output_parser");

const fs = require("fs");
const { Transcribe } = require("./Gpt4Response.js");

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
  const vectorStoreRetriever = vectorStore.asRetriever();

  const SYSTEM_TEMPLATE = `As an AI with chatbot you have to decide if customer is greeting or not, if the customer is sending greeting text reply to greetback the customer. If you don't know then reply : My training is specific to CFR 49 192-199 and Part 40 regulations, so I'm unable to provide the information you're looking for. Answer in a concise and informative way, using bullet points to highlight the key points if needed. Output should always be a complete sentence. ...... ${lowerText}`;

  // const messages = [SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE)];

  const messages = [HumanMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE)];
  const prompt = ChatPromptTemplate.fromMessages(messages);

  // const chain = RunnableSequence.from([
  //   {
  //     context: vectorStoreRetriever,
  //     question: new RunnablePassthrough(),
  //   },
  //   prompt,
  //   model,
  //   new StringOutputParser(),
  // ]);

  // const answer = await chain.invoke(lowerText);

  // console.log(answer, "8888888888888888888888");

  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
    prompt: prompt,
  });

  // const chain = new RetrievalQAChain({
  //   combineDocumentsChain: loadQARefineChain(model),
  //   retriever: vectorStore.asRetriever(),
  // });

  const resp = await chain.call({
    query: lowerText,
  });

  return resp;
}

exports.chatbot = async (req, res) => {
  const { text } = req.body;
  const resp = await GetAnswer(text);
  console.log(resp, "387917823729137921378912");
  const outputString = resp.text.replace(/^[^:]*:\s*/, "");
  return res.status(200).json({
    question: text,
    reply: outputString,
  });

  // const classify = await GPTClassify(text);
  // if (classify === "1") {
  //   const resp = await GetAnswer(text);

  //   if (
  //     resp.text.includes("I don't know") ||
  //     resp.text.includes("not mentioned in the context")
  //   ) {
  //     refinedAnswerText = await GPTResponseDontKnow(
  //       `Q:${text}\nAnswer:${resp.text}`
  //     );
  //   } else {
  //     refinedAnswerText = resp.text;
  //   }

  //   return res.status(200).json({
  //     question: text,
  //     reply: refinedAnswerText,
  //   });
  // }
  // if (classify === "0") {
  //   const resp = await GPTGreet(`${text}`);
  //   return res.status(200).json({
  //     question: text,
  //     reply: resp,
  //   });
  // }
};

exports.audiochat = async (req, res) => {
  const text = await Transcribe(req.file.path);
  const resp = await GetAnswer(text);
  const outputString = resp.text.replace(/^[^:]*:\s*/, "");
  return res.status(200).json({
    question: text,
    reply: outputString,
  });

  // let refinedAnswerText = "";

  // const classify = await GPTClassify(text);
  // if (classify === "1") {
  //   const resp = await GetAnswer(text);

  //   if (
  //     resp.text.includes("I don't know") ||
  //     resp.text.includes("not mentioned in the context")
  //   ) {
  //     refinedAnswerText = await GPTResponseDontKnow(
  //       `Q:${text}\nAnswer:${resp.text}`
  //     );
  //   } else {
  //     refinedAnswerText = await GPTResponse(`Q:${text}\nAnswer:${resp.text}`);
  //   }

  //   return res.status(200).json({
  //     question: text,
  //     reply: refinedAnswerText,
  //   });
  // }
  // if (classify === "0") {
  //   const resp = await GPTGreet(`${text}`);
  //   return res.status(200).json({
  //     question: text,
  //     reply: resp,
  //   });
  // }
};
