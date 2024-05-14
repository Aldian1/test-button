import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Index from "./pages/Index.jsx";
import EditableEdges from "./pages/EditableEdges.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/editable-edges" element={<EditableEdges />} />
      </Routes>
    </Router>
  );
}

export default App;
