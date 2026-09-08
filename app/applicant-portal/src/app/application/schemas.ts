import z from 'zod';
export const OTHER_OPTION = 'Other';

export const StepBasics = z
  .object({
    school: z.string().nonempty('Please select or enter your school.'),
    levelOfStudy: z.string().nonempty('Please select your current level of study.'),
    countryOfResidence: z.string().nonempty('Please select your country of residence.'),
    linkedinUrl: z
      .string()
      .url('Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/yourprofile).')
      .nonempty('Please provide your LinkedIn profile URL.'),
    githubUrl: z
      .string()
      .url('Please enter a valid GitHub URL (e.g., https://github.com/yourname).')
      .nonempty('Please provide your GitHub profile URL.'),
    discordUsername: z.string().trim().min(2, 'Please provide your Discord username.')
  })
  .loose();

export const StepPreferences = z
  .object({
    dietaryNone: z.boolean().optional().default(false),
    dietaryVegetarian: z.boolean().optional().default(false),
    dietaryVegan: z.boolean().optional().default(false),
    dietaryCeliacDisease: z.boolean().optional().default(false),
    dietaryKosher: z.boolean().optional().default(false),
    dietaryHalal: z.boolean().optional().default(false),
    dietaryNutAllergy: z.boolean().optional().default(false),
    dietaryOther: z.boolean().optional().default(false),
    tshirtSize: z.string().nonempty('Please select your t-shirt size so we can prepare your swag.')
  })
  .refine(
    (values) =>
      values.dietaryNone ||
      values.dietaryVegetarian ||
      values.dietaryVegan ||
      values.dietaryCeliacDisease ||
      values.dietaryKosher ||
      values.dietaryHalal ||
      values.dietaryNutAllergy ||
      values.dietaryOther,
    {
      message: 'Please select at least one dietary option, including None.',
      path: ['dietaryGroup']
    }
  )
  .loose();

export const StepInsights = z
  .object({
    majorFieldOfStudy: z.string().optional(),
    gender: z.string().optional(),
    pronouns: z.string().optional(),
    raceEthnicity: z.string().optional(),
    sexualOrientation: z.string().optional(),
    experienceLevel: z.string().nonempty('Please select your experience level.'),
    teamPreference: z.string().nonempty('Please select your team preference.')
  })
  .loose();

export const StepAgreements = z
  .object({
    sfHacksPromoEmail: z.boolean().optional(),
    photoReleaseConsent: z.boolean().refine((val) => val === true, {
      message: 'Please agree to the event photo and video release.'
    }),
    resumeShareConsent: z.boolean().refine((val) => val === true, {
      message: 'Please agree to the resume-sharing consent.'
    }),
    mlhAuthorizedDataShare: z.boolean().refine((val) => val === true, {
      message:
        'Please check the box to authorize sharing your application data with Major League Hacking.'
    }),
    mlhCodeOfConductAgreement: z.boolean().refine((val) => val === true, {
      message: 'Please agree to the MLH Code of Conduct by checking the box above.'
    })
  })
  .loose();
