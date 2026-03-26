import OpenAI from "openai";
import { z } from "zod";
import type { GeneratedQuestion, AnalysisResult } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY?.replace(/^["']|["']$/g, '').trim(),
});

// ─── Schemas for Validation ───

const questionSchema = z.object({
  text: z.string(),
  type: z.enum(["RATING", "MULTIPLE_CHOICE", "OPEN_ENDED"]),
  options: z.array(z.string()),
  order: z.number(),
});

const generatedQuestionsSchema = z.object({
  questions: z.array(questionSchema).min(1),
});

const analysisSchema = z.object({
  sentiment: z.object({
    positive: z.number(),
    neutral: z.number(),
    negative: z.number(),
  }),
  pain_points: z.array(z.string()),
  suggestions: z.array(z.string()),
  summary: z.string(),
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

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
content: `
You are a world-class survey architect specializing in student analytics. 
Your mission is to design highly effective, engaging, and contextually precise feedback questions that extract actionable insights from participants.

STRICT REQUIREMENTS:
1. NO GENERIC QUESTIONS under any circumstances (e.g., "Did you like the event?", "Rate 1-10").
2. CONTEXT-AWARE: Each question must reference only the specific event details, organization, and stated objectives provided. 
   - DO NOT invent or add any additional information, people, sessions, or events not explicitly given.
3. QUESTION TYPES:
   - RATING: Minimum 2 questions using a 1-5 scale, targeting specific metrics such as clarity, relevance, pace, or usefulness.
   - MULTIPLE_CHOICE: Minimum 2 questions, each with 3-5 highly contextual options tailored to the event (e.g., "Which session provided the most value?").
   - OPEN_ENDED: Minimum 2 questions to capture deep qualitative feedback, insights, or suggestions.
4. TOTAL QUESTIONS: 6-8, arranged logically (start with ratings, follow with multiple-choice, end with open-ended).
5. FORMAT: Output must be a JSON object ONLY, strictly adhering to this structure. Use empty arrays for "options" if not applicable.

Output Example:
{
  "questions": [
    {
      "text": "Contextually specific question here...",
      "type": "RATING" | "MULTIPLE_CHOICE" | "OPEN_ENDED",
      "options": ["Option 1", "Option 2"], 
      "order": 1
    }
  ]
}`,
        },
        {
          role: "user",
          content: `Organization: ${organizationName}\nEvent: ${eventName}\nDescription: ${description}\nGoal: ${goal}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from AI");

    // Parse and strictly validate
    const rawData = JSON.parse(content);
    const parsed = generatedQuestionsSchema.parse(rawData);

    return parsed.questions as GeneratedQuestion[];
  } catch (error) {
    console.error("AI Question Generation Error:", error);
    
    // Fallback handling to ensure the app doesn't break
    return [
      {
        text: `How would you rate your overall experience at ${eventName}?`,
        type: "RATING",
        options: [],
        order: 1,
      },
      {
        text: `Based on the goal to "${goal}", what is one thing we could improve?`,
        type: "OPEN_ENDED",
        options: [],
        order: 2,
      },
      {
        text: `Would you attend another event hosted by ${organizationName}?`,
        type: "MULTIPLE_CHOICE",
        options: ["Yes, definitely", "Maybe", "No"],
        order: 3,
      }
    ];
  }
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

  // Short-circuit if no responses
  if (!responses || responses.length === 0) {
    return {
      summary: "Not enough data to analyze.",
      sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
      painPoints: [],
      suggestions: [],
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a sophisticated data analyst tasked with evaluating student feedback.
Analyze the provided responses and identify actionable insights, prevailing sentiments, and critical pain points.

Strict JSON Output Requirement:
{
  "sentiment": { "positive": 60, "neutral": 30, "negative": 10 }, // Percentages MUST sum to 100
  "pain_points": [
    "Specific issue mentioned by respondents #1",
    "Specific issue mentioned by respondents #2"
  ],
  "suggestions": [
    "Actionable, data-driven suggestion #1",
    "Actionable, data-driven suggestion #2"
  ],
  "summary": "A concise, executive 2-3 sentence summary evaluating if the goal was met based on the data."
}

Rules:
- Base EVERYTHING on the actual response data provided. Do not hallucinate.
- Avoid generic advice.
- Ensure the JSON strictly matches the keys: sentiment (with positive/neutral/negative), pain_points, suggestions, and summary.`,
        },
        {
          role: "user",
          content: `Event: ${eventName}\nGoal: ${goal}\n\nQuestions:\n${JSON.stringify(questions)}\n\nResponses:\n${JSON.stringify(responses.map(r => r.answers))}`,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent, analytical output
      max_tokens: 2500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from AI");

    const rawData = JSON.parse(content);
    
    // Validate output format
    const parsed = analysisSchema.parse(rawData);

    // Map the snake_case JSON response from AI to our camelCase internal types
    return {
      summary: parsed.summary,
      sentimentDistribution: parsed.sentiment,
      painPoints: parsed.pain_points,
      suggestions: parsed.suggestions,
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    
    // Fallback returning a safe structure
    return {
      summary: "Our AI ran into an issue processing the data. Please review the responses manually.",
      sentimentDistribution: { positive: 0, neutral: 100, negative: 0 },
      painPoints: ["Failed to process data automatically"],
      suggestions: ["Check raw responses in the database"],
    };
  }
}
