import { Telegraf } from "telegraf";
import { GoogleGenAI } from "@google/genai";
import { AssemblyAI } from "assemblyai";
import dotenv from "dotenv";
import express from "express";
const app = express();
dotenv.config();

const port = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEN_AI_API_KEY,
});

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_AI_API_KEY,
});

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => ctx.reply("Welcome"));
bot.on("voice", async (context) => {
  const url = await context.telegram.getFileLink(context.message.voice.file_id);
  console.log(url.href);
  // const audioFile = "./local_file.mp3";
  const audioFile = url.href;

  const params = {
    audio: audioFile,
    speech_model: "universal",
  };

  const transcript = await client.transcripts.transcribe(params);

  console.log(transcript.text);

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `${transcript.text}`,
  });

  context.reply(response.text);
  console.log(response.text);
});

bot.launch();

app.get("/", (req, res) => {
  res.send("Your Bot is Live!");
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
