import { z } from "zod";

// ─── Project ───

export const createProjectSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  eventName: z.string().min(1, "Event name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  goal: z.string().min(1, "Goal is required"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

// ─── AI Form Generation ───

export const generateFormSchema = z.object({
  projectId: z.string().cuid(),
});

export type GenerateFormInput = z.infer<typeof generateFormSchema>;

export interface GeneratedQuestion {
  text: string;
  type: "RATING" | "MULTIPLE_CHOICE" | "OPEN_ENDED";
  options: string[];
  order: number;
}

// ─── Response Submission ───

export const submitResponseSchema = z.object({
  formId: z.string().cuid(),
  answers: z.array(
    z.object({
      questionId: z.string().cuid(),
      value: z.union([z.string(), z.number()]),
    })
  ),
});

export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;

// ─── AI Analysis ───

export const analyzeSchema = z.object({
  projectId: z.string().cuid(),
});

export type AnalyzeInput = z.infer<typeof analyzeSchema>;

export interface AnalysisResult {
  summary: string;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  painPoints: string[];
  suggestions: string[];
}

// ─── Edit Questions ───

export const questionTypeEnum = z.enum(["RATING", "MULTIPLE_CHOICE", "OPEN_ENDED"]);

export const addQuestionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  type: questionTypeEnum,
  options: z.array(z.string()),
  order: z.number().int().min(1),
});

export type AddQuestionInput = z.infer<typeof addQuestionSchema>;

export const updateQuestionsBatchSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string().cuid(),
      text: z.string().min(1, "Question text is required"),
      type: questionTypeEnum,
      options: z.array(z.string()),
      order: z.number().int().min(1),
    })
  ),
});

export type UpdateQuestionsBatchInput = z.infer<typeof updateQuestionsBatchSchema>;

// ─── API Response Wrapper ───

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
