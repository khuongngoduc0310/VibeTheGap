import { nanoid } from "nanoid";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a short, URL-safe share ID for public form links.
 */
export function generateShareId(length = 10): string {
  return nanoid(length);
}

/**
 * Standard JSON error response helper.
 */
export function errorResponse(message: string, status = 400): Response {
  return Response.json({ success: false, error: message }, { status });
}

/**
 * Standard JSON success response helper.
 */
export function successResponse<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data }, { status });
}
