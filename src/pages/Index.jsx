import { Button, Box, Input, Flex, Spacer } from "@chakra-ui/react";
import NodeName from "../components/NodeName";
import { FaPlus, FaMicrophone, FaStop, FaTrash } from "react-icons/fa";
import React, { useCallback, useState, useEffect } from "react";
import VoiceTranscription from "../components/VoiceTranscription";
import ReactFlow, { MiniMap, Controls, useNodesState, useEdgesState, addEdge, ReactFlowProvider, Handle } from "reactflow";
import "reactflow/dist/style.css";

// Custom node component
const CustomNode = ({ data }) => {
  return (
    <div style={{ padding: 10, border: "1px solid #ddd", borderRadius: 5, background: "#fff" }}>
      <div>{data.label}</div>
      <div style={{ position: "absolute", top: 10, right: 10 }}>
        <Handle type="source" position="right" />
        <Handle type="target" position="left" />
      </div>
      <NodeName name={data.name} />
    </div>
  );
};

// Define the custom node types
const nodeTypes = {
  custom: CustomNode,
};

const Index = () => {
  const initialNodes = JSON.parse(localStorage.getItem("nodes")) || [{ id: "1", type: "custom", position: { x: 250, y: 5 }, data: { label: "Hello World", name: "item-1" } }];
  initialNodes.forEach((node, index) => {
    node.data.name = `item-${index + 1}`;
  });

  const initialEdges = JSON.parse(localStorage.getItem("edges")) || [];
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeName, setNodeName] = useState("");
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) => {
        const newEdges = addEdge(params, eds);
        localStorage.setItem("edges", JSON.stringify(newEdges));
        return newEdges;
      }),
    [setEdges],
  );
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState(localStorage.getItem("audioURL") || "");
  const [editingNode, setEditingNode] = useState(null);

  const handleDoubleClick = (event, node) => {
    setEditingNode(node);
    setNodeName(node.data.label);
  };

  //note

  const handleNameChange = (event) => {
    setNodeName(event.target.value);
  };

  const handleNameSubmit = (event) => {
    event.preventDefault();
    if (editingNode) {
      setNodes((nds) => {
        const updatedNodes = nds.map((n, index) => (n.id === editingNode.id ? { ...n, data: { ...n.data, label: nodeName, name: `item-${index + 1}` } } : n));
        localStorage.setItem("nodes", JSON.stringify(updatedNodes));
        return updatedNodes;
      });
      setEditingNode(null);
    }
    setNodeName("");
  };

  const clearData = () => {
    localStorage.removeItem("nodes");
    localStorage.removeItem("edges");
    localStorage.removeItem("audioURL");
    setNodes([]);
    setEdges([]);
    setAudioURL("");
  };

  const handleVoiceRecord = () => {
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    } else {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const recorder = new MediaRecorder(stream);
          recorder.ondataavailable = (event) => {
            const audioBlob = new Blob([event.data], { type: "audio/wav" });
            const audioURL = URL.createObjectURL(audioBlob);
            setAudioURL(audioURL);
            localStorage.setItem("audioURL", audioURL);
          };
          recorder.onstop = () => {
            setIsRecording(false);
          };
          recorder.start();
          setMediaRecorder(recorder);
          setIsRecording(true);
        })
        .catch((error) => {
          console.error("Error accessing microphone:", error);
        });
    }
  };

  const handleDeleteAudio = () => {
    setAudioURL("");
    localStorage.removeItem("audioURL");
  };

  const addNode = useCallback(() => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: "custom",
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: `Node ${nodes.length + 1}`, name: `item-${nodes.length + 1}` },
    };
    setNodes((nds) => {
      const newNodes = nds.concat(newNode);
      localStorage.setItem("nodes", JSON.stringify(newNodes));
      return newNodes;
    });
  }, [nodes, setNodes]);

  return (
    <Box width="100vw" height="100vh">
      <ReactFlowProvider>
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeDoubleClick={handleDoubleClick} onConnect={onConnect} fitView nodeTypes={nodeTypes} style={{ width: "100%", height: "100%" }} />
        {editingNode && (
          <form
            onSubmit={handleNameSubmit}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: "10",
              background: "white",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
            }}
          >
            <Input value={nodeName} onChange={handleNameChange} onBlur={handleNameSubmit} autoFocus />
          </form>
        )}
        <Flex position="absolute" top="10px" left="10px" right="10px" zIndex="10" justifyContent="space-between" alignItems="center">
          <Button onClick={addNode} colorScheme="blue" leftIcon={<FaPlus />}>
            Add Node
          </Button>
          <Spacer />
          <Button onClick={clearData} colorScheme="red" leftIcon={<FaTrash />}>
            Clear Data
          </Button>
          {isRecording ? (
            <Button onClick={handleVoiceRecord} colorScheme="red" leftIcon={<FaStop />}>
              Stop Recording
            </Button>
          ) : (
            <Button onClick={handleVoiceRecord} colorScheme="blue" leftIcon={<FaMicrophone />}>
              Record Voice
            </Button>
          )}
          {audioURL && (
            <>
              <audio controls src={audioURL} style={{ marginLeft: "10px" }} />
              <Button onClick={handleDeleteAudio} colorScheme="red" leftIcon={<FaTrash />} style={{ marginLeft: "10px" }}>
                Delete Recording
              </Button>
            </>
          )}
        </Flex>
        <Controls />
        {isRecording && <VoiceTranscription onCreateNode={addNode} />}
      </ReactFlowProvider>
    </Box>
  );
};

export default Index;
