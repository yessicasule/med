import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeDatabases } from "./db";
import { AIService } from "./services/aiService";
import { seedExampleData } from "./db/seedData";

// Initialize databases
initializeDatabases();

// Seed example patient history data (only if database is empty)
seedExampleData();

// Initialize AI service for automated tasks
AIService.initialize();

createRoot(document.getElementById("root")!).render(<App />);
