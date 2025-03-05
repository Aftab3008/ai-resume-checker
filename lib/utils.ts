import { CompanyTitle } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

export const generateUUID = (): string => crypto.randomUUID();

export function ParseResponse(response: string): string[] {
  try {
    const data = JSON.parse(response);
    if (!Array.isArray(data)) {
      throw new Error("Parsed response is not an array.");
    }
    return data;
  } catch (error) {
    console.error("Error parsing API response:", error);
    return [];
  }
}

export function parseCompanyTitle(response: string): CompanyTitle[] {
  try {
    const data = JSON.parse(response);
    if (!Array.isArray(data)) {
      throw new Error("Parsed response is not an array.");
    }
    return data;
  } catch (error) {
    console.error("Error parsing API response:", error);
    return [];
  }
}
