import { TEMPLATE_IDS } from "../config/templates.js";
﻿import { z } from "zod";
export const profileSchema = z
  .object({
    profile: z
      .object({
        category: z.enum(["student", "professional", "other"]).optional(),
        profession: z.string().trim().max(120).optional(),
        customProfession: z.string().trim().max(120).optional(),
        institution: z.string().trim().max(280).optional(),
        course: z.string().trim().max(280).optional(),
        graduationYear: z.string().trim().max(280).optional(),
        goal: z.string().trim().max(280).optional(),
        company: z.string().trim().max(280).optional(),
        yearsExperience: z.string().trim().max(280).optional(),
        specialization: z.string().trim().max(280).optional(),
        services: z.string().trim().max(280).optional(),
        serviceArea: z.string().trim().max(280).optional(),
        availability: z.string().trim().max(280).optional(),
        fullName: z.string().trim().min(1).max(100).optional(),
        contactNumber: z.string().trim().max(30).optional(),
        showContact: z.boolean().optional(),
        title: z.string().trim().max(120).optional(),
        intro: z.string().trim().max(280).optional(),
        bio: z.string().trim().max(4000).optional(),
        location: z.string().max(120).optional(),
        email: z.string().email().max(254).or(z.literal("")).optional(),
        profileImage: z.string().max(1000).optional(),
        coverImage: z.string().max(1000).optional(),
      })
      .optional(),
    skills: z.array(z.string().trim().max(50)).max(40).optional(),
    education: z.array(z.record(z.string(), z.unknown())).max(30).optional(),
    experience: z.array(z.record(z.string(), z.unknown())).max(30).optional(),
    certifications: z
      .array(z.record(z.string(), z.unknown()))
      .max(30)
      .optional(),
    achievements: z.array(z.record(z.string(), z.unknown())).max(30).optional(),
    projects: z.array(z.record(z.string(), z.unknown())).max(40).optional(),
    socials: z.record(z.string(), z.string().max(500)).optional(),
    templateId: z
      .enum(TEMPLATE_IDS)
      .optional(),
    onboardingStep: z.number().int().min(0).max(9).optional(),
  })
  .strict();
