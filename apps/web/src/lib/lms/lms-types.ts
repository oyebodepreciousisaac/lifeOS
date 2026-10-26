import { z } from 'zod';

/**
 * SchoolOS Lightweight LMS & Virtual Classroom Types
 * Phase 13 (Playbook pp. 15, 30, 52)
 */

// ------------------------------------------------------------------------------
// 1. Course Modules & Lessons
// ------------------------------------------------------------------------------

export interface CourseModule {
  id: string;
  schoolId: string;
  subjectName: string;
  classArm: string;
  title: string;
  orderIndex: number;
  description: string;
  isPublished: boolean;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  schoolId: string;
  moduleId: string;
  title: string;
  orderIndex: number;
  contentMarkdown: string;
  videoUrl?: string;
  resourcePdfUrl?: string;
  estimatedDurationMinutes: number;
  isPublished: boolean;
}

export const CreateCourseModuleSchema = z.object({
  subjectName: z.string().min(2, 'Subject name required'),
  classArm: z.string().min(2, 'Class arm required'),
  title: z.string().min(3, 'Module title required'),
  orderIndex: z.number().min(0).default(0),
  description: z.string().min(5, 'Description required'),
  isPublished: z.boolean().default(true),
});

export type CreateCourseModuleInput = z.infer<typeof CreateCourseModuleSchema>;

export const CreateLessonSchema = z.object({
  moduleId: z.string().min(1, 'Module ID required'),
  title: z.string().min(3, 'Lesson title required'),
  orderIndex: z.number().min(0).default(0),
  contentMarkdown: z.string().min(10, 'Content must be at least 10 characters'),
  videoUrl: z.string().url('Invalid video URL').optional().or(z.literal('')),
  resourcePdfUrl: z.string().url('Invalid resource PDF URL').optional().or(z.literal('')),
  estimatedDurationMinutes: z.number().min(5).max(180).default(45),
  isPublished: z.boolean().default(true),
});

export type CreateLessonInput = z.infer<typeof CreateLessonSchema>;

// ------------------------------------------------------------------------------
// 2. Online Quizzes & Automated Scoring
// ------------------------------------------------------------------------------

export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';

export interface QuizQuestion {
  id: string;
  prompt: string;
  questionType: QuestionType;
  options: string[];
  correctOptionIndex: number;
  correctTextAnswer?: string;
  points: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  schoolId: string;
  moduleId: string;
  lessonId?: string;
  title: string;
  instructions: string;
  timeLimitMinutes: number;
  passingScorePercent: number;
  questions: QuizQuestion[];
  isPublished: boolean;
}

export const QuizQuestionSchema = z.object({
  prompt: z.string().min(5, 'Question prompt required'),
  questionType: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER']).default('MULTIPLE_CHOICE'),
  options: z.array(z.string()).min(2, 'At least 2 options required'),
  correctOptionIndex: z.number().min(0),
  correctTextAnswer: z.string().optional(),
  points: z.number().min(1).default(1),
  explanation: z.string().min(3, 'Explanation required'),
});

export const CreateQuizSchema = z.object({
  moduleId: z.string().min(1, 'Module ID required'),
  lessonId: z.string().optional(),
  title: z.string().min(3, 'Quiz title required'),
  instructions: z.string().min(5, 'Instructions required'),
  timeLimitMinutes: z.number().min(5).max(120).default(20),
  passingScorePercent: z.number().min(10).max(100).default(50),
  questions: z.array(QuizQuestionSchema).min(1, 'At least 1 question required'),
  isPublished: z.boolean().default(true),
});

export type CreateQuizInput = z.infer<typeof CreateQuizSchema>;

export interface StudentQuizAnswer {
  questionId: string;
  selectedOptionIndex?: number;
  textAnswer?: string;
}

export interface QuizAttempt {
  id: string;
  schoolId: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  classArm: string;
  answers: StudentQuizAnswer[];
  scorePercent: number;
  pointsEarned: number;
  totalPoints: number;
  passed: boolean;
  startedAt: string;
  submittedAt: string;
}

export const SubmitQuizAttemptSchema = z.object({
  quizId: z.string().min(1, 'Quiz ID required'),
  studentId: z.string().min(1, 'Student ID required'),
  studentName: z.string().min(1, 'Student name required'),
  classArm: z.string().min(1, 'Class arm required'),
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOptionIndex: z.number().optional(),
      textAnswer: z.string().optional(),
    })
  ),
  startedAt: z.string(),
});

export type SubmitQuizAttemptInput = z.infer<typeof SubmitQuizAttemptSchema>;

// ------------------------------------------------------------------------------
// 3. Assignment Submission & Rubric Grading
// ------------------------------------------------------------------------------

export interface RubricCriterion {
  criterion: string;
  maxPoints: number;
}

export interface Assignment {
  id: string;
  schoolId: string;
  moduleId: string;
  title: string;
  description: string;
  instructions: string;
  rubricCriteria: RubricCriterion[];
  maxScore: number;
  dueDate: string;
  isPublished: boolean;
}

export const CreateAssignmentSchema = z.object({
  moduleId: z.string().min(1, 'Module ID required'),
  title: z.string().min(3, 'Assignment title required'),
  description: z.string().min(5, 'Description required'),
  instructions: z.string().min(5, 'Instructions required'),
  rubricCriteria: z
    .array(
      z.object({
        criterion: z.string().min(2),
        maxPoints: z.number().min(1),
      })
    )
    .min(1, 'At least one rubric criterion required'),
  maxScore: z.number().min(10).max(100).default(100),
  dueDate: z.string(),
  isPublished: z.boolean().default(true),
});

export type CreateAssignmentInput = z.infer<typeof CreateAssignmentSchema>;

export type AssignmentSubmissionStatus = 'SUBMITTED' | 'GRADED' | 'LATE';

export interface AssignmentSubmission {
  id: string;
  schoolId: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  classArm: string;
  submissionText: string;
  attachmentFileUrl?: string;
  submittedAt: string;
  status: AssignmentSubmissionStatus;
  scoreAwarded?: number;
  teacherFeedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}

export const SubmitAssignmentSchema = z.object({
  assignmentId: z.string().min(1, 'Assignment ID required'),
  studentId: z.string().min(1, 'Student ID required'),
  studentName: z.string().min(1, 'Student name required'),
  classArm: z.string().min(1, 'Class arm required'),
  submissionText: z.string().min(10, 'Submission must have at least 10 characters'),
  attachmentFileUrl: z.string().url().optional().or(z.literal('')),
});

export type SubmitAssignmentInput = z.infer<typeof SubmitAssignmentSchema>;

export const GradeAssignmentSchema = z.object({
  submissionId: z.string().min(1, 'Submission ID required'),
  scoreAwarded: z.number().min(0),
  teacherFeedback: z.string().min(3, 'Teacher feedback required'),
});

export type GradeAssignmentInput = z.infer<typeof GradeAssignmentSchema>;

// ------------------------------------------------------------------------------
// 4. Virtual Classroom Integrations (Zoom & Google Meet)
// ------------------------------------------------------------------------------

export type LiveClassProvider = 'ZOOM' | 'GOOGLE_MEET';
export type LiveClassStatus = 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';

export interface VirtualClassSession {
  id: string;
  schoolId: string;
  subjectName: string;
  classArm: string;
  title: string;
  provider: LiveClassProvider;
  joinUrl: string;
  meetingId: string;
  passcode?: string;
  scheduledStartTime: string;
  durationMinutes: number;
  hostTeacherName: string;
  status: LiveClassStatus;
  attendeeStudentIds: string[];
}

export const ScheduleVirtualClassSchema = z.object({
  subjectName: z.string().min(2, 'Subject name required'),
  classArm: z.string().min(2, 'Class arm required'),
  title: z.string().min(3, 'Class title required'),
  provider: z.enum(['ZOOM', 'GOOGLE_MEET']),
  joinUrl: z.string().url('Valid meeting URL required'),
  meetingId: z.string().min(5, 'Meeting ID required'),
  passcode: z.string().optional(),
  scheduledStartTime: z.string(),
  durationMinutes: z.number().min(15).max(180).default(45),
});

export type ScheduleVirtualClassInput = z.infer<typeof ScheduleVirtualClassSchema>;

// ------------------------------------------------------------------------------
// 5. Learning Analytics
// ------------------------------------------------------------------------------

export interface StudentLmsAnalytics {
  studentId: string;
  studentName: string;
  completedLessonsCount: number;
  totalLessonsCount: number;
  lessonProgressPercent: number;
  quizzesAttemptedCount: number;
  averageQuizScorePercent: number;
  assignmentsSubmittedCount: number;
  assignmentsGradedCount: number;
  averageAssignmentScorePercent: number;
}
