import { z } from 'zod';

export type SchoolSection =
  | 'EARLY_YEARS'
  | 'PRIMARY'
  | 'JUNIOR_SECONDARY'
  | 'SENIOR_SECONDARY';

export interface SchoolProfile {
  id: string;
  name: string;
  slug: string;
  officialCode?: string;
  motto?: string;
  logoUrl?: string;
  crestUrl?: string;
  contactEmail: string;
  contactPhone: string;
  currency: string;
  timezone: string;
  address: string;
  city: string;
  state: string;
  isOnboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CampusItem {
  id: string;
  schoolId: string;
  name: string;
  code?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  isMain: boolean;
  phone?: string;
}

export interface TermItem {
  id: string;
  name: string; // '1st Term', '2nd Term', '3rd Term'
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isCurrent: boolean;
  isLocked: boolean;
}

export interface AcademicSessionItem {
  id: string;
  schoolId: string;
  name: string; // e.g. "2026/2027"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isCurrent: boolean;
  terms: TermItem[];
}

export interface ClassArmItem {
  id: string;
  levelId: string;
  name: string; // "Gold", "Diamond", "Emerald", "Silver"
  capacity: number;
  formTeacherId?: string;
  formTeacherName?: string;
}

export interface ClassLevelItem {
  id: string;
  schoolId: string;
  campusId: string;
  name: string; // e.g. "JSS 1", "Basic 4", "Nursery 2"
  levelOrder: number;
  section: SchoolSection;
  arms: ClassArmItem[];
}

export interface SubjectItem {
  id: string;
  schoolId: string;
  name: string; // "Mathematics"
  code: string; // "MTH"
  department: string; // "Sciences", "Humanities", "Commercial", "Languages", "Vocational"
  isElective: boolean;
  applicableSections: SchoolSection[];
}

export interface OperationalRules {
  workingHoursStart: string; // e.g. "07:45"
  workingHoursEnd: string; // e.g. "15:30"
  periodDurationMinutes: number; // e.g. 40
  assemblyDurationMinutes: number; // e.g. 20
  breakDurationMinutes: number; // e.g. 30
  latenessCutoff: string; // e.g. "08:15"
  daysPerWeek: number; // e.g. 5
}

export interface AcademicConfiguration {
  school: SchoolProfile;
  campuses: CampusItem[];
  activeSession: AcademicSessionItem;
  sessions: AcademicSessionItem[];
  classLevels: ClassLevelItem[];
  subjects: SubjectItem[];
  operationalRules: OperationalRules;
}

// ------------------------------------------------------------------------------
// Zod Validation Schemas
// ------------------------------------------------------------------------------

export const SchoolProfileSchema = z.object({
  name: z.string().min(3, 'Official school name must be at least 3 characters'),
  slug: z.string().min(2, 'School slug must be at least 2 characters'),
  officialCode: z.string().optional(),
  motto: z.string().optional(),
  logoUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
  crestUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
  contactEmail: z.string().email('Valid contact email is required'),
  contactPhone: z
    .string()
    .min(10, 'Nigerian phone number must be at least 10 digits')
    .regex(/^[+0-9\s-]+$/, 'Invalid phone number format'),
  currency: z.string().default('NGN'),
  timezone: z.string().default('Africa/Lagos'),
  address: z.string().min(5, 'Campus physical address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
});

export const CampusItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Campus name is required'),
  code: z.string().optional(),
  address: z.string().min(5, 'Physical address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().default('Nigeria'),
  isMain: z.boolean(),
  phone: z.string().optional(),
});

export const CampusesListSchema = z
  .array(CampusItemSchema)
  .min(1, 'At least one campus is required')
  .refine((items) => items.filter((c) => c.isMain).length === 1, {
    message: 'Exactly one campus must be designated as the Main Campus',
  });

export const TermItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Term name is required'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'),
  isCurrent: z.boolean().default(false),
  isLocked: z.boolean().default(false),
});

export const AcademicSessionSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().regex(/^\d{4}\/\d{4}$/, 'Session name must follow format YYYY/YYYY (e.g. 2026/2027)'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'),
    isCurrent: z.boolean().default(true),
    terms: z.array(TermItemSchema).min(1, 'At least one term is required in the academic session'),
  })
  .refine((val) => new Date(val.startDate) < new Date(val.endDate), {
    message: 'Academic session start date must precede end date',
  })
  .refine(
    (val) => {
      // Exactly one current term or none
      const currentTerms = val.terms.filter((t) => t.isCurrent);
      return currentTerms.length <= 1;
    },
    { message: 'Only one term can be active at a time' }
  );

export const ClassArmSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Arm name is required'),
  capacity: z.number().int().positive('Capacity must be a positive integer').max(100, 'Max capacity is 100'),
  formTeacherId: z.string().optional(),
  formTeacherName: z.string().optional(),
});

export const ClassLevelSchema = z.object({
  id: z.string().optional(),
  campusId: z.string().optional(),
  name: z.string().min(2, 'Class level name is required (e.g. JSS 1)'),
  levelOrder: z.number().int().min(1),
  section: z.enum(['EARLY_YEARS', 'PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY']),
  arms: z.array(ClassArmSchema).min(1, 'Each class level must have at least one arm (e.g. Gold)'),
});

export const ClassLevelsListSchema = z
  .array(ClassLevelSchema)
  .min(1, 'At least one class level must be configured');

export const SubjectItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Subject name is required'),
  code: z.string().min(2, 'Subject code must be at least 2 characters').max(8, 'Max 8 characters'),
  department: z.string().min(2, 'Department is required'),
  isElective: z.boolean().default(false),
  applicableSections: z.array(z.enum(['EARLY_YEARS', 'PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'])).min(1),
});

export const SubjectsListSchema = z
  .array(SubjectItemSchema)
  .min(1, 'At least one subject must be defined')
  .refine(
    (items) => {
      const codes = items.map((s) => s.code.toUpperCase());
      return new Set(codes).size === codes.length;
    },
    { message: 'Subject codes must be unique across the school curriculum' }
  );

export const OperationalRulesSchema = z.object({
  workingHoursStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:MM required'),
  workingHoursEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:MM required'),
  periodDurationMinutes: z.number().int().min(20).max(90),
  assemblyDurationMinutes: z.number().int().min(10).max(60),
  breakDurationMinutes: z.number().int().min(15).max(60),
  latenessCutoff: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:MM required'),
  daysPerWeek: z.number().int().min(4).max(6).default(5),
});

// ------------------------------------------------------------------------------
// Nigerian Curriculum Presets (NERDC Compliant)
// ------------------------------------------------------------------------------

export const NIGERIAN_PRESET_LEVELS: Array<{
  name: string;
  levelOrder: number;
  section: SchoolSection;
  arms: Array<{ name: string; capacity: number }>;
}> = [
  {
    name: 'Nursery 1',
    levelOrder: 1,
    section: 'EARLY_YEARS',
    arms: [
      { name: 'Red', capacity: 25 },
      { name: 'Blue', capacity: 25 },
    ],
  },
  {
    name: 'Nursery 2',
    levelOrder: 2,
    section: 'EARLY_YEARS',
    arms: [
      { name: 'Yellow', capacity: 25 },
      { name: 'Green', capacity: 25 },
    ],
  },
  {
    name: 'Primary 1',
    levelOrder: 3,
    section: 'PRIMARY',
    arms: [
      { name: 'A', capacity: 35 },
      { name: 'B', capacity: 35 },
    ],
  },
  {
    name: 'Primary 2',
    levelOrder: 4,
    section: 'PRIMARY',
    arms: [
      { name: 'A', capacity: 35 },
      { name: 'B', capacity: 35 },
    ],
  },
  {
    name: 'Primary 3',
    levelOrder: 5,
    section: 'PRIMARY',
    arms: [
      { name: 'A', capacity: 35 },
      { name: 'B', capacity: 35 },
    ],
  },
  {
    name: 'Primary 4',
    levelOrder: 6,
    section: 'PRIMARY',
    arms: [
      { name: 'A', capacity: 35 },
      { name: 'B', capacity: 35 },
    ],
  },
  {
    name: 'Primary 5',
    levelOrder: 7,
    section: 'PRIMARY',
    arms: [
      { name: 'A', capacity: 35 },
      { name: 'B', capacity: 35 },
    ],
  },
  {
    name: 'Primary 6',
    levelOrder: 8,
    section: 'PRIMARY',
    arms: [
      { name: 'A', capacity: 35 },
      { name: 'B', capacity: 35 },
    ],
  },
  {
    name: 'JSS 1',
    levelOrder: 9,
    section: 'JUNIOR_SECONDARY',
    arms: [
      { name: 'A', capacity: 40 },
      { name: 'B', capacity: 40 },
      { name: 'C', capacity: 40 },
    ],
  },
  {
    name: 'JSS 2',
    levelOrder: 10,
    section: 'JUNIOR_SECONDARY',
    arms: [
      { name: 'A', capacity: 40 },
      { name: 'B', capacity: 40 },
      { name: 'C', capacity: 40 },
    ],
  },
  {
    name: 'JSS 3',
    levelOrder: 11,
    section: 'JUNIOR_SECONDARY',
    arms: [
      { name: 'A', capacity: 40 },
      { name: 'B', capacity: 40 },
      { name: 'C', capacity: 40 },
    ],
  },
  {
    name: 'SSS 1',
    levelOrder: 12,
    section: 'SENIOR_SECONDARY',
    arms: [
      { name: 'Science', capacity: 35 },
      { name: 'Arts', capacity: 35 },
      { name: 'Commercial', capacity: 35 },
    ],
  },
  {
    name: 'SSS 2',
    levelOrder: 13,
    section: 'SENIOR_SECONDARY',
    arms: [
      { name: 'Science', capacity: 35 },
      { name: 'Arts', capacity: 35 },
      { name: 'Commercial', capacity: 35 },
    ],
  },
  {
    name: 'SSS 3',
    levelOrder: 14,
    section: 'SENIOR_SECONDARY',
    arms: [
      { name: 'Science', capacity: 35 },
      { name: 'Arts', capacity: 35 },
      { name: 'Commercial', capacity: 35 },
    ],
  },
];

export const NIGERIAN_PRESET_SUBJECTS: Array<{
  name: string;
  code: string;
  department: string;
  isElective: boolean;
  applicableSections: SchoolSection[];
}> = [
  {
    name: 'Mathematics',
    code: 'MTH',
    department: 'Sciences',
    isElective: false,
    applicableSections: ['PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'],
  },
  {
    name: 'English Language',
    code: 'ENG',
    department: 'Languages',
    isElective: false,
    applicableSections: ['PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'],
  },
  {
    name: 'Basic Science',
    code: 'BSC',
    department: 'Sciences',
    isElective: false,
    applicableSections: ['PRIMARY', 'JUNIOR_SECONDARY'],
  },
  {
    name: 'Basic Technology',
    code: 'BTECH',
    department: 'Vocational',
    isElective: false,
    applicableSections: ['JUNIOR_SECONDARY'],
  },
  {
    name: 'Civic Education',
    code: 'CIV',
    department: 'Humanities',
    isElective: false,
    applicableSections: ['PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'],
  },
  {
    name: 'Agricultural Science',
    code: 'AGR',
    department: 'Vocational',
    isElective: false,
    applicableSections: ['PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'],
  },
  {
    name: 'Computer Studies (ICT)',
    code: 'ICT',
    department: 'Sciences',
    isElective: false,
    applicableSections: ['PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'],
  },
  {
    name: 'Christian Religious Studies',
    code: 'CRS',
    department: 'Humanities',
    isElective: true,
    applicableSections: ['PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'],
  },
  {
    name: 'Islamic Religious Studies',
    code: 'IRS',
    department: 'Humanities',
    isElective: true,
    applicableSections: ['PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'],
  },
  {
    name: 'Yoruba Language',
    code: 'YOR',
    department: 'Languages',
    isElective: true,
    applicableSections: ['PRIMARY', 'JUNIOR_SECONDARY'],
  },
  {
    name: 'French Language',
    code: 'FRN',
    department: 'Languages',
    isElective: true,
    applicableSections: ['PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'],
  },
  {
    name: 'Physics',
    code: 'PHY',
    department: 'Sciences',
    isElective: false,
    applicableSections: ['SENIOR_SECONDARY'],
  },
  {
    name: 'Chemistry',
    code: 'CHM',
    department: 'Sciences',
    isElective: false,
    applicableSections: ['SENIOR_SECONDARY'],
  },
  {
    name: 'Biology',
    code: 'BIO',
    department: 'Sciences',
    isElective: false,
    applicableSections: ['SENIOR_SECONDARY'],
  },
  {
    name: 'Further Mathematics',
    code: 'FMTH',
    department: 'Sciences',
    isElective: true,
    applicableSections: ['SENIOR_SECONDARY'],
  },
  {
    name: 'Economics',
    code: 'ECO',
    department: 'Commercial',
    isElective: false,
    applicableSections: ['SENIOR_SECONDARY'],
  },
  {
    name: 'Financial Accounting',
    code: 'ACC',
    department: 'Commercial',
    isElective: true,
    applicableSections: ['SENIOR_SECONDARY'],
  },
  {
    name: 'Commerce',
    code: 'COM',
    department: 'Commercial',
    isElective: true,
    applicableSections: ['SENIOR_SECONDARY'],
  },
  {
    name: 'Government',
    code: 'GOV',
    department: 'Humanities',
    isElective: true,
    applicableSections: ['SENIOR_SECONDARY'],
  },
  {
    name: 'Literature in English',
    code: 'LIT',
    department: 'Humanities',
    isElective: true,
    applicableSections: ['SENIOR_SECONDARY'],
  },
];
