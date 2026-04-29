// utils/aiSolution.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
//
export const getSolution = async (disease) => {
  const prompt = `
You are an expert agriculture advisor in India.

Disease: ${disease}

Give:
1. Cause
2. Treatment (dose per 15L pump)
3. Organic solution
4. Prevention
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [{ role: "user", content: prompt }],
  });

  return res.choices[0].message.content;
};
