import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { exec } from "child_process";
import path from "path";

const app = express();
app.use(bodyParser.json());
app.use(cors());

const modelPath = path.join(__dirname, "models/llama-2-7b-chat.gguf");

app.post("/api/llama", (req, res) => {
  const { prompt } = req.body;

  // Call Python llama.cpp script
  exec(`python3 run_llama.py "${prompt}" "${modelPath}"`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ text: "Error running LLaMA" });
    }
    res.json({ text: stdout.trim() });
  });
});

app.listen(5000, () => console.log("Backend running on port 5000"));
