import { z } from "zod";

// ─── Project ───

export const createProjectSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
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

// ─── API Response Wrapper ───

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
