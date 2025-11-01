import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeDatabases } from "./db";
import { AIService } from "./services/aiService";

// Initialize databases
initializeDatabases();

// Initialize AI service for automated tasks
AIService.initialize();

createRoot(document.getElementById("root")!).render(<App />);
