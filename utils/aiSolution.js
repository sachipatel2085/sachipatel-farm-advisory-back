import express from "express";
import fs from "fs";
import FormData from "form-data";
import axios from "axios"; // ✅ MUST be here

const models = ["google/gemma-7b-it:free", "meta-llama/llama-3-8b-instruct"];

export const analyzeImage = async (disease) => {
  for (const model of models) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [
            {
              role: "user",
              content: `
You are an expert agriculture advisor in India.

Disease: ${disease}

Give:
1. Cause
2. Treatment (dose per 15L pump)
3. Organic solution
4. Prevention
`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          },
        },
      );

      return response.data.choices[0].message.content;
    } catch (err) {
      console.log(`Model failed: ${model}`);
    }
  }

  return "AI service unavailable";
};
