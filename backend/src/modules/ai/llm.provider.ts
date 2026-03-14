import OpenAI from "openai";
import { env } from "../../config/env.js";

type LLMProvider = "openai" | "mock" | "huggingface";

interface GenerateOptions {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
}

const provider: LLMProvider =
  env.mockLlm === "true" ? "mock" : "huggingface";

const openai = new OpenAI({
  apiKey: env.openaiApiKey,
});

export async function generateCompletion({
  systemPrompt,
  userPrompt,
  model = "gpt-4o-mini",
  temperature = 0.2,
}: GenerateOptions): Promise<string> {
  if (process.env.FORCE_LLM_ERROR === "true") {
    throw new Error("Simulated LLM failure");
  }
  switch (provider) {
    case "mock":
      return generateWithMock({
        systemPrompt,
        userPrompt,
      });

    case "openai":
      return generateWithOpenAI({
        systemPrompt,
        userPrompt,
        model,
        temperature,
      });
    case "huggingface":
      return generateWithHuggingFace({
        systemPrompt,
        userPrompt,
      });

    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

async function generateWithOpenAI({
  systemPrompt,
  userPrompt,
  model,
  temperature,
}: Required<GenerateOptions>): Promise<string> {
  const response = await openai.chat.completions.create({
    model,
    temperature,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from LLM");
  }

  return content;
}

async function generateWithMock({
  systemPrompt,
  userPrompt,
}: Pick<GenerateOptions, "systemPrompt" | "userPrompt">): Promise<string> {
  const mockedResponse = {
    summary: `
      [MOCKED LLM RESPONSE]
      
      Summary:
      - This is a mocked AI response.
      - Used for local development and testing.
      - The LLM provider can be swapped without affecting the rest of the system.
      `,
    keyPoints: [],
    insights: []
  }

  return JSON.stringify(mockedResponse);
}


async function generateWithHuggingFace({
  systemPrompt,
  userPrompt,
}: Pick<GenerateOptions, "systemPrompt" | "userPrompt">): Promise<string> {

const response = await fetch(
  "https://router.huggingface.co/v1/chat/completions",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.huggingfaceApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b:fastest",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  }
);

const content = await response.json();

if (!content.choices[0]?.message?.content) {
  throw new Error("Empty response from LLM");
}

return content.choices[0]?.message?.content;
}