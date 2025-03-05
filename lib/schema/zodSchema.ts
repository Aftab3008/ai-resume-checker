import { MAX_FILE_SIZE, ACCEPTED_FILE_TYPES } from "@/constants";
import exp from "constants";
import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  linkedin: z.string().url("Invalid LinkedIn URL"),
  resume: z
    .instanceof(File)
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      "File size must be less than 5MB"
    )
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      "Invalid file type"
    ),
  skills: z.optional(
    z.string().min(10, "Skills must be at least 10 characters")
  ),
  experience: z.optional(
    z.string().min(10, "Experience must be at least 10 characters")
  ),
});
