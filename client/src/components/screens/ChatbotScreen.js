import React from "react";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Collapse,
  Alert,
  TextField,
  Button,
  Card,
  Stack,
} from "@mui/material";
import { useState } from "react";
import axios from "axios";
import Reactreco from "../Reactreco";
import "./bubble.css";
import LoadingSpinner from "../loadingspinner";
const ChatbotScreen = () => {
  const theme = useTheme();
  const isNotMobile = useMediaQuery("(min-width: 1000px)");

  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [questionArray, setQuestionArray] = useState([]);
  const [answerArray, setAnswerArray] = useState([]);
  const [Audio, setAudio] = useState(null);
  const [AudioQ, setAudioQ] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const responseAudioHandler = async (e) => {
    e.preventDefault();

    let formData = new FormData();
    formData.append("Audio", Audio);
    setIsLoading(true);
    try {
      const ResponseData = await axios.post(
        "/api/openai/AudioQuestion",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(ResponseData);

      setQuestionArray((prevItems) => [
        ...prevItems,
        ResponseData.data.question,
      ]);
      setAnswerArray((prevItems) => [...prevItems, ResponseData.data.reply]);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.log(err);
      if (err.response.data.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      }
    }
  };

  const responseHandler = async (e) => {
    e.preventDefault();
    setQuestionArray((prevItems) => [...prevItems, text]);
    setText("");
    setIsLoading(true);
    try {
      const { data } = await axios.post("/api/openai/chatbot", { text });
      setAnswerArray((prevItems) => [...prevItems, data.reply]);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      if (err.response.data.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      }
    }
  };

  return (
    <Box
      width={isNotMobile ? "50%" : "90%"}
      p="2rem"
      m="2rem auto"
      borderRadius={5}
      backgroundColor={theme.palette.background.alt}
      sx={{ boxShadow: 5 }}
    >
      <Collapse>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Collapse>
      <Typography variant="h3" mb={2}>
        Chat Bot
      </Typography>
      <div style={{ margin: "20px auto" }}>
        {!AudioQ ? (
          <Button
            style={{ width: "100%" }}
            variant="contained"
            color="success"
            onClick={() => setAudioQ(true)}
          >
            Audio Question
          </Button>
        ) : (
          <Button
            style={{ width: "100%" }}
            variant="contained"
            color="success"
            onClick={() => setAudioQ(false)}
          >
            Text Question
          </Button>
        )}
      </div>
      {!AudioQ ? (
        <form onSubmit={responseHandler}>
          <Stack direction="row" spacing={1}>
            <Box width="93%">
              <TextField
                placeholder="Enter question topic here"
                fullWidth
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </Box>
            <Button
              disableElevation
              variant="contained"
              type="submit"
              sx={{ color: "white", backgroundColor: "blue" }}
            >
              Ask
            </Button>
          </Stack>
        </form>
      ) : (
        <form onSubmit={responseAudioHandler}>
          <Stack>
            <Box width="100%">
              <Reactreco Audio={Audio} setAudio={setAudio} />
              {Audio && (
                <Button
                  disableElevation
                  variant="contained"
                  type="submit"
                  style={{
                    padding: "10px auto",
                    margin: "10px auto",
                    width: "100%",
                  }}
                >
                  Send Audio
                </Button>
              )}
            </Box>
          </Stack>
        </form>
      )}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Card
          sx={{
            mt: 4,
            p: 2,
            border: 1,
            boxShadow: 0,
            borderColor: "neutral.medium",
            borderRadius: 2,
            height: "900px",
            bgcolor: "background.default",
          }}
          style={{ overflow: "scroll" }}
        >
          <div>
            {questionArray.length > 0 &&
              questionArray.map((EachQ, index) => (
                <div key={index}>
                  <p className="bubble right">{EachQ}</p>

                  <p className="bubble left">
                    {!!answerArray[index] && answerArray[index]}
                  </p>
                </div>
              ))}
          </div>
        </Card>
      )}
    </Box>
  );
};

export default ChatbotScreen;
