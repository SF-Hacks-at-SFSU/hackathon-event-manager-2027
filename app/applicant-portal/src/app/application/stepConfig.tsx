/** Step Definitions */

import { StepAgreements, StepBasics, StepInsights, StepPreferences } from './schemas';
import { StepConfig } from './types';

// Due to the large union created from combining typeof step schemas,
// its neccessary to use any here to avoid excessive processing.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const steps: StepConfig<any>[] = [
  {
    key: 'basics',
    label: 'Registration Basics',
    description:
      'These questions help us make sure you’re eligible to participate and ensure everything runs smoothly.',
    schema: StepBasics,
    fields: {
      school: {
        type: 'school-combobox',
        label: 'What school do you attend?',
        fillerText: 'Search for your university',
        helperText: 'Start typing to search for your school',
        hasOtherOption: true,
        otherLabel: 'Other'
      },
      levelOfStudy: {
        type: 'dropdown',
        label: 'What is the highest level of formal education that you have completed?',
        fillerText: 'Select your level of study',
        options: [
          { value: 'Secondary / High School', label: 'Secondary / High School' },
          {
            value: '2 year - community college or similar',
            label: '2 year - community college or similar'
          },
          {
            value: 'Undergraduate University (3+ year)',
            label: 'Undergraduate University (3+ year)'
          },
          {
            value: 'Graduate University',
            label: 'Graduate University'
          },
          { value: 'Code School / Bootcamp', label: 'Code School / Bootcamp' },
          { value: 'I’m not currently a student', label: 'I’m not currently a student' }
        ],
        hasOtherOption: true,
        otherLabel: 'Other'
      },
      countryOfResidence: {
        type: 'country-dropdown',
        label: 'Country of Residence'
      },
      linkedinUrl: {
        type: 'text',
        label: 'LinkedIn URL',
        fillerText: 'https://linkedin.com/in/yourprofile',
        helperText: 'Add the full URL to your LinkedIn profile.'
      },
      githubUrl: {
        type: 'text',
        label: 'GitHub URL',
        fillerText: 'https://github.com/yourname',
        helperText: 'Add the full URL to your GitHub profile.'
      },
      discordUsername: {
        type: 'text',
        label: 'Discord Username',
        fillerText: 'yourname',
        helperText: 'Enter the username organizers can use to reach you on Discord.'
      }
    }
  },
  {
    key: 'preferences',
    label: 'Day-Of Preferences',
    description: 'Help us make your experience comfortable and enjoyable.',
    schema: StepPreferences,
    fields: {
      tshirtSize: {
        type: 'dropdown',
        label: 'T-Shirt Size',
        fillerText: 'Select your preferred T-shirt size',
        options: [
          { value: 'US_XS', label: 'XS' },
          { value: 'US_S', label: 'S' },
          { value: 'US_M', label: 'M' },
          { value: 'US_L', label: 'L' },
          { value: 'US_XL', label: 'XL' },
          { value: 'US_XXL', label: '2XL' },
          { value: 'US_XXXL', label: '3XL' }
        ],
        hasOtherOption: false
      },
      dietaryGroup: {
        type: 'checkbox-group',
        label: 'Dietary Restrictions',
        required: true,
        options: [
          { name: 'dietaryNone', label: 'None' },
          { name: 'dietaryVegetarian', label: 'Vegetarian' },
          { name: 'dietaryVegan', label: 'Vegan' },
          { name: 'dietaryHalal', label: 'Halal' },
          { name: 'dietaryNutAllergy', label: 'Nut allergy' },
          { name: 'dietaryOther', label: 'Other' }
        ]
      }
    }
  },
  {
    key: 'insights',
    label: 'Community Insights',
    description: 'This information helps us build a diverse and inclusive community.',
    schema: StepInsights,
    fields: {
      experienceLevel: {
        type: 'dropdown',
        label: 'Experience Level',
        fillerText: 'Select your hackathon experience',
        options: [
          { value: 'First-Time Participant', label: 'First-Time Participant' },
          { value: 'Experienced Participant', label: 'Experienced Participant' },
          { value: 'Advanced Participant', label: 'Advanced Participant' }
        ]
      },
      teamPreference: {
        type: 'dropdown',
        label: 'Team Preference',
        fillerText: 'Select your team preference',
        options: [
          { value: 'I have a team', label: 'I have a team' },
          { value: 'Match me with a team', label: 'Match me with a team' },
          { value: 'I will decide at the event', label: 'I will decide at the event' }
        ]
      },
      majorFieldOfStudy: {
        type: 'dropdown',
        label: 'What is your major or primary field of study?',
        fillerText: 'Select your major',
        options: [
          { value: 'Computer Science', label: 'Computer Science' },
          { value: 'Data Science', label: 'Data Science' },
          { value: 'Engineering', label: 'Engineering' },
          { value: 'Mathematics', label: 'Mathematics' },
          { value: 'Physics', label: 'Physics' },
          { value: 'Business', label: 'Business' },
          { value: 'Design / UI-UX', label: 'Design / UI-UX' },
          { value: 'Humanities', label: 'Humanities' },
          { value: 'Natural Sciences', label: 'Natural Sciences' },
          { value: 'Social Sciences', label: 'Social Sciences' },
          { value: 'Prefer not to answer', label: 'Prefer not to answer' }
        ],
        hasOtherOption: true,
        otherLabel: 'Other (please specify)'
      },
      gender: {
        type: 'dropdown',
        label: 'What gender do you identify with?',
        fillerText: 'Select gender',
        options: [
          { value: 'Female', label: 'Female' },
          { value: 'Male', label: 'Male' },
          { value: 'Non-binary', label: 'Non-binary' },
          { value: 'Prefer not to answer', label: 'Prefer not to answer' }
        ],
        hasOtherOption: true,
        otherLabel: 'Prefer to self-describe'
      },
      pronouns: {
        type: 'dropdown',
        label: 'What pronouns do you use?',
        fillerText: 'Select pronouns',
        options: [
          { value: 'She/Her', label: 'She/Her' },
          { value: 'He/Him', label: 'He/Him' },
          { value: 'They/Them', label: 'They/Them' },
          { value: 'Prefer not to answer', label: 'Prefer not to answer' }
        ],
        hasOtherOption: true,
        otherLabel: 'Other'
      },
      raceEthnicity: {
        type: 'dropdown',
        label: 'Race / Ethnicity',
        fillerText: 'Select your race or ethnicity',
        options: [
          { value: 'Asian Indian', label: 'Asian Indian' },
          { value: 'Black or African', label: 'Black or African' },
          { value: 'Chinese', label: 'Chinese' },
          { value: 'Filipino', label: 'Filipino' },
          { value: 'Guamanian or Chamorro', label: 'Guamanian or Chamorro' },
          {
            value: 'Hispanic / Latino / Spanish Origin',
            label: 'Hispanic / Latino / Spanish Origin'
          },
          { value: 'Japanese', label: 'Japanese' },
          { value: 'Korean', label: 'Korean' },
          { value: 'Middle Eastern', label: 'Middle Eastern' },
          {
            value: 'Native American or Alaskan Native',
            label: 'Native American or Alaskan Native'
          },
          { value: 'Native Hawaiian', label: 'Native Hawaiian' },
          { value: 'Samoan', label: 'Samoan' },
          { value: 'Vietnamese', label: 'Vietnamese' },
          { value: 'White', label: 'White' },
          {
            value: 'Other Asian (Thai, Cambodian, etc.)',
            label: 'Other Asian (Thai, Cambodian, etc.)'
          },
          { value: 'Other Pacific Islander', label: 'Other Pacific Islander' },
          { value: 'Prefer Not to Answer', label: 'Prefer Not to Answer' }
        ],
        hasOtherOption: true,
        otherLabel: 'Other (please specify)'
      },
      sexualOrientation: {
        type: 'dropdown',
        label: 'Do you consider yourself to be any of the following?',
        fillerText: 'Select your identity',
        options: [
          { value: 'Heterosexual or straight', label: 'Heterosexual or straight' },
          { value: 'Gay or lesbian', label: 'Gay or lesbian' },
          { value: 'Bisexual', label: 'Bisexual' },
          { value: 'Prefer Not to Answer', label: 'Prefer Not to Answer' }
        ],
        hasOtherOption: true,
        otherLabel: 'Different identity ________'
      }
    }
  },
  {
    key: 'agreements',
    label: 'Agreements & Consent',
    description: 'Please review the event permissions and participation agreements.',
    schema: StepAgreements,
    fields: {
      sfHacksPromoEmail: {
        type: 'checkbox',
        label:
          'I authorize SF Hacks and its event co-hosts to send me occasional emails about relevant events, career opportunities, and community updates.'
      },
      photoReleaseConsent: {
        type: 'checkbox',
        label:
          'I agree that photos or videos of me taken at the event may be used on social media and that I may be tagged in related posts.'
      },
      resumeShareConsent: {
        type: 'checkbox',
        label:
          'I agree that my resume may be shared with sponsor companies for recruiting purposes.'
      },
      mlhCodeOfConductAgreement: {
        type: 'checkbox',
        label: (
          <>
            I have read and agree to the{' '}
            <a
              href="https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              MLH Code of Conduct
            </a>
            .
          </>
        )
      },
      mlhAuthorizedDataShare: {
        type: 'checkbox',
        label: (
          <>
            I authorize you to share my application/registration information with Major League
            Hacking for event administration, ranking, and MLH administration in-line with the{' '}
            <a
              href="https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              MLH Privacy Policy
            </a>
            . I further agree to the terms of both the{' '}
            <a
              href="https://github.com/MLH/mlh-policies/blob/main/contest-terms.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              MLH Contest Terms and Conditions
            </a>{' '}
            and the{' '}
            <a
              href="https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              MLH Privacy Policy
            </a>
            .
          </>
        )
      }
    }
  }
];
