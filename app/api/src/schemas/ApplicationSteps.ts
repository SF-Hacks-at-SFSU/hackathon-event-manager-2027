import { z } from 'zod';

export const Step1Schema = z.object({
  ageGroup: z.enum(['Under 18', '18–22', '23–26', '27+']).optional().or(z.literal('')),
  phoneNumber: z.string().min(7).optional().or(z.literal('')),
  countryOfResidence: z.string().min(2),
  levelOfStudy: z.string().min(2)
});

export const Step2Schema = z.object({
  school: z.string().min(2),
  graduationYear: z.number().int().min(1900).max(2100),
  majorFieldOfStudy: z.string().min(2),
  schoolId: z.string().uuid().optional().nullable()
});

export const Step3Schema = z.object({
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  referralSource: z.string().optional(),
  experienceLevel: z.string().min(2),
  tshirtSize: z.enum([
    'US_XS',
    'US_S',
    'US_M',
    'US_L',
    'US_XL',
    'US_XXL',
    'UK_6',
    'UK_8',
    'UK_10',
    'UK_12',
    'UK_14',
    'UK_16'
  ])
});

// Optional (non-blocking) – allow all fields but do not require them.
export const Step4Schema = z.object({
  gender: z.string().optional().nullable(),
  pronouns: z.string().optional().nullable(),
  raceEthnicity: z.string().optional().nullable(),
  sexualOrientation: z.string().optional().nullable(),
  educationLevel: z.string().optional().nullable()
});

export const Step5Schema = z.object({
  dietaryVegetarian: z.boolean().optional(),
  dietaryVegan: z.boolean().optional(),
  dietaryCeliacDisease: z.boolean().optional(),
  dietaryKosher: z.boolean().optional(),
  dietaryHalal: z.boolean().optional()
});

// Required final acknowledgements
export const Step6Schema = z.object({
  mlhAuthorizedPromoEmail: z.boolean(),
  mlhAuthorizedDataShare: z.boolean(),
  mlhCodeOfConductAgreement: z.boolean()
});

// Map for handlers
export const StepSchemas: Record<number, z.ZodTypeAny> = {
  1: Step1Schema,
  2: Step2Schema,
  3: Step3Schema,
  4: Step4Schema,
  5: Step5Schema,
  6: Step6Schema
};
