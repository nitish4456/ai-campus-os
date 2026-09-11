import { z } from "zod";

// Assistant AI Chat Request Schema
export const aiChatSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(4000, "Message is too long (maximum 4000 characters)")
    .trim(),
  conversationId: z.string().optional(),
});

// Lost & Found Report Schema
export const lostItemSchema = z.object({
  type: z.enum(["lost", "found"]).optional().default("lost"),
  itemName: z
    .string()
    .min(1, "Item name is required")
    .max(120, "Item name cannot exceed 120 characters")
    .trim(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description cannot exceed 2000 characters")
    .trim(),
  category: z.string().min(1, "Category is required"),
  location: z
    .string()
    .min(1, "Location is required")
    .max(150, "Location cannot exceed 150 characters")
    .trim(),
  date: z.string().or(z.date()).optional(),
  imageUrl: z.string().max(2000).optional().default(""),
  contactPreference: z.string().max(50).optional().default("email"),
});

// Student Profile Form Schema
export const profileUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters").trim().optional(),
  bio: z.string().max(1000, "Bio cannot exceed 1000 characters").trim().optional(),
  skills: z.array(z.string().max(50, "Skill length cannot exceed 50 characters").trim()).max(25, "Maximum 25 skills allowed").optional(),
  interests: z.array(z.string().max(50, "Interest length cannot exceed 50 characters").trim()).max(25, "Maximum 25 interests allowed").optional(),
  projects: z.array(z.string().max(100).trim()).max(20).optional(),
});
