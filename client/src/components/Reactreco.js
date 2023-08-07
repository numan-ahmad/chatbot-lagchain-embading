import React, { useState } from "react";
import { ReactMic } from "react-mic";

export default function Reactreco(props) {
  const { Audio, setAudio } = props;
  // const [sound, setSound] = useState(null);
  const [record, setRecord] = useState(false);
  const [blobURL, setBlobURL] = useState();
  const [IsRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState();

  const startRecording = () => {
    setRecord(true);
    setIsRecording(true);
  };

  const stopRecording = () => {
    setRecord(false);
    setIsRecording(false);
  };
  function blobToFile(theBlob) {
    var filename = Math.random().toString(36).substring(6) + "_name.wav"; //e.g ueq6ge1j_name.wav

    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    theBlob.lastModifiedDate = new Date();
    theBlob.name = filename;

    return theBlob;
  }

  const onStop = async (recordedBlob) => {
    console.log(recordedBlob);
    stopRecording();

    setBlobURL(recordedBlob.blobURL);

    setRecordedBlob(recordedBlob);

    setAudio(blobToFile(recordedBlob.blob));
  };

  const DeleteRecording = () => {
    setAudio(null);
    setRecord(false);
    setBlobURL(null);
    setRecordedBlob(null);
  };

  const onData = () => {
    //    console.log("recording");
  };
  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "20px",
        border: "green 1px solid",
      }}
    >
      <center>
        <h3>
          <u>Audio Query</u>
        </h3>
      </center>
      <center>
        <div style={{ width: "100%" }}>
          <center style={{ overflow: "hidden" }}>
            {!blobURL && (
              <ReactMic
                record={record} // defaults -> false.  Set to true to begin recording
                visualSetting="frequencyBars" // defaults -> "sinewave".  Other option is "frequencyBars"
                onStop={onStop}
                onData={onData}
                strokeColor="#111"
                backgroundColor="#fcfcfc"
                mimeType="audio/wav"
                echoCancellation={false} // defaults -> false
                autoGainControl={false} // defaults -> false
                noiseSuppression={false} // defaults -> false
              />
            )}
          </center>
          <div
            className="center"
            style={{
              backgroundColor: "white",
              padding: "15px",
              width: "100%",
              minWidth: "300px",
              zIndex: "50",
            }}
          >
            <button
              className="RecBtn"
              onClick={startRecording}
              disabled={Audio !== null || record}
            >
              <i className="fa fa-microphone fa-2x" aria-hidden="true"></i>
              <br />
              Start
            </button>
            <button
              className="RecBtn"
              onClick={stopRecording}
              disabled={!record}
            >
              <i className="fa fa-stop-circle fa-2x" aria-hidden="true"></i>
              <br />
              Stop
            </button>
            <button
              className="RecBtn"
              onClick={DeleteRecording}
              disabled={Audio === null}
            >
              <i className="fa fa-trash fa-2x" aria-hidden="true"></i>
              <br />
              Delete
            </button>
          </div>
          <div
            style={{
              backgroundColor: "white",
            }}
          >
            <center>
              {!!blobURL && (
                <audio
                  src={blobURL}
                  controls
                  style={{ minWidth: "300px", width: "90%" }}
                />
              )}
            </center>
          </div>
        </div>
      </center>
    </div>
  );
}
