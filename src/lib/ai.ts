import OpenAI from "openai";
import type { GeneratedQuestion, AnalysisResult } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ─── Generate Feedback Questions ───

interface GenerateQuestionsParams {
  organizationName: string;
  eventName: string;
  description: string;
  goal: string;
}

export async function generateQuestions(
  params: GenerateQuestionsParams
): Promise<GeneratedQuestion[]> {
  const { organizationName, eventName, description, goal } = params;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert survey designer for student organizations. 
Generate feedback questions that are specific, actionable, and relevant to the event described.

Return a JSON object with a "questions" array. Each question must have:
- "text": the question text
- "type": one of "RATING", "MULTIPLE_CHOICE", or "OPEN_ENDED"
- "options": array of strings (only for MULTIPLE_CHOICE, empty array for others)
- "order": integer starting from 1

Rules:
- Generate 6 to 10 questions
- Include at least 2 RATING questions (1-5 scale)
- Include at least 2 MULTIPLE_CHOICE questions (3-5 options each)
- Include at least 2 OPEN_ENDED questions
- Questions should align with the stated goal
- Make questions specific to the event, not generic
- Start with easier questions (rating) and end with open-ended ones`,
      },
      {
        role: "user",
        content: `Organization: ${organizationName}
Event: ${eventName}
Description: ${description}
Goal: ${goal}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  const parsed = JSON.parse(content) as { questions: GeneratedQuestion[] };
  return parsed.questions;
}

// ─── Analyze Feedback Responses ───

interface AnalyzeFeedbackParams {
  organizationName: string;
  eventName: string;
  goal: string;
  questions: { text: string; type: string }[];
  responses: { answers: unknown }[];
}

export async function analyzeFeedback(
  params: AnalyzeFeedbackParams
): Promise<AnalysisResult> {
  const { organizationName, eventName, goal, questions, responses } = params;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert data analyst specializing in student organization feedback.
Analyze the feedback responses and provide actionable insights.

Return a JSON object with:
- "summary": a 2-3 sentence paragraph summarizing the overall feedback
- "sentimentDistribution": { "positive": number, "neutral": number, "negative": number } (percentages that sum to 100)
- "painPoints": array of exactly 3 strings describing the top pain points
- "suggestions": array of 3-5 strings with actionable improvement suggestions

Be specific and reference actual data from the responses. Avoid generic platitudes.`,
      },
      {
        role: "user",
        content: `Organization: ${organizationName}
Event: ${eventName}
Goal: ${goal}

Questions:
${questions.map((q, i) => `${i + 1}. [${q.type}] ${q.text}`).join("\n")}

Responses (${responses.length} total):
${JSON.stringify(responses.map((r) => r.answers), null, 2)}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  return JSON.parse(content) as AnalysisResult;
}
