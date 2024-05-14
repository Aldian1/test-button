import React, { useState, useEffect } from "react";
import { Box } from "@chakra-ui/react";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;

function VoiceTranscription({ onCreateNode }) {
  const [transcript, setTranscript] = useState("");
  const [isRecognitionStarted, setIsRecognitionStarted] = useState(false);
  const [nodeCreated, setNodeCreated] = useState(false);

  useEffect(() => {
    if (!isRecognitionStarted) {
      try {
        recognition.start();
        setIsRecognitionStarted(true);
      } catch (error) {
        console.error("Speech recognition error:", error);
      }
    }

    recognition.onend = () => {
      setIsRecognitionStarted(false);
      setNodeCreated(false);
      recognition.start();
    };

    return () => {
      recognition.stop();
    };
  }, [isRecognitionStarted]);

  useEffect(() => {
    recognition.onresult = (event) => {
      const transcriptText = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");
      const highlightedText = transcriptText.replace(/(create node|delete)/gi, (match) => `<span style="background-color: yellow;">${match}</span>`);
      if (/create node/i.test(transcriptText) && !nodeCreated) {
        onCreateNode();
        setNodeCreated(true);
        setTranscript("");
        setTimeout(() => setNodeCreated(false), 1000);
      } else {
        setTranscript(highlightedText);
      }
    };
  }, [onCreateNode]);

  return <Box position="absolute" bottom="10px" left="10px" background="white" padding="10px" borderRadius="5px" zIndex="10" dangerouslySetInnerHTML={{ __html: transcript }} />;
}

export default VoiceTranscription;
