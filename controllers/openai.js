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
  // const vectorStoreRetriever = vectorStore.asRetriever();

  const SYSTEM_TEMPLATE = `If the user sends a greeting text then greet in return. As an AI with expertise in Gas regulations CFR 49 192-199 and Part 40 regulations, your task is to elaborate the incomming response, explain it in detail and Answer in a concise and informative way, using bullet points to highlight the key points. Output should always be a complete sentence. ---------------- {context}`;

  const messages = [
    SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
    HumanMessagePromptTemplate.fromTemplate("{question}"),
  ];
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

  const chain = RetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(),
    {
      prompt: prompt,
    }
  );

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

  return res.status(200).json({
    question: text,
    reply: resp.text,
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
