import { z } from 'zod';

/**
 * SchoolOS Auxiliary School Operations Types
 * Covers Clinic, Transport, Hostel/Exeat, and Library (Playbook pp. 14, 28-29, 51-52)
 */

// ------------------------------------------------------------------------------
// 1. Clinic & Health Management
// ------------------------------------------------------------------------------

export type TriageSeverity = 'MILD' | 'MODERATE' | 'CRITICAL';

export interface ClinicVisit {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classArm: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  prescription?: string;
  temperatureCelsius: number;
  triageSeverity: TriageSeverity;
  parentNotified: boolean;
  parentNotificationChannel?: 'SMS' | 'WHATSAPP' | 'PHONE';
  admittedToSickBay: boolean;
  timeIn: string;
  timeOut?: string;
  nurseName: string;
}

export const CreateClinicVisitSchema = z.object({
  studentId: z.string().min(1, 'Student ID required'),
  studentName: z.string().min(1, 'Student name required'),
  classArm: z.string().min(1, 'Class arm required'),
  symptoms: z.string().min(3, 'Symptoms description required'),
  diagnosis: z.string().min(3, 'Diagnosis required'),
  treatment: z.string().min(3, 'Treatment applied required'),
  prescription: z.string().optional(),
  temperatureCelsius: z.number().min(34).max(43),
  triageSeverity: z.enum(['MILD', 'MODERATE', 'CRITICAL']),
  notifyParent: z.boolean().default(false),
  admitToSickBay: z.boolean().default(false),
});

export type CreateClinicVisitInput = z.infer<typeof CreateClinicVisitSchema>;

// ------------------------------------------------------------------------------
// 2. Transport & Bus Fleet Management
// ------------------------------------------------------------------------------

export interface TransportRoute {
  id: string;
  schoolId: string;
  routeName: string;
  zone: string;
  vehiclePlateNumber: string;
  vehicleCapacity: number;
  driverName: string;
  driverPhone: string;
  stops: string[];
  assignedStudentIds: string[];
  termFee: number;
}

export const CreateTransportRouteSchema = z.object({
  routeName: z.string().min(3, 'Route name required'),
  zone: z.string().min(2, 'Zone identifier required'),
  vehiclePlateNumber: z.string().min(5, 'Plate number required'),
  vehicleCapacity: z.number().min(5).max(100),
  driverName: z.string().min(2, 'Driver name required'),
  driverPhone: z.string().min(10, 'Driver phone required'),
  stops: z.array(z.string()).min(1, 'At least one stop required'),
  termFee: z.number().min(0),
});

export type CreateTransportRouteInput = z.infer<typeof CreateTransportRouteSchema>;

// ------------------------------------------------------------------------------
// 3. Hostel & Exeat Management
// ------------------------------------------------------------------------------

export type ExeatType = 'WEEKEND' | 'MEDICAL' | 'EMERGENCY' | 'ACADEMIC';
export type ExeatStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHECKED_OUT' | 'RETURNED';

export interface HostelRoom {
  id: string;
  schoolId: string;
  blockName: string;
  gender: 'MALE' | 'FEMALE';
  roomNumber: string;
  capacity: number;
  assignedStudentIds: string[];
  wardenName: string;
}

export interface ExeatPass {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classArm: string;
  hostelRoom: string;
  type: ExeatType;
  reason: string;
  destinationAddress: string;
  guardianContact: string;
  departureDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: ExeatStatus;
  approvedBy?: string;
  approvalNotes?: string;
  gatePassBarcode: string;
}

export const CreateExeatPassSchema = z.object({
  studentId: z.string().min(1, 'Student ID required'),
  studentName: z.string().min(1, 'Student name required'),
  classArm: z.string().min(1, 'Class arm required'),
  hostelRoom: z.string().min(1, 'Hostel room required'),
  type: z.enum(['WEEKEND', 'MEDICAL', 'EMERGENCY', 'ACADEMIC']),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  destinationAddress: z.string().min(5, 'Destination address required'),
  guardianContact: z.string().min(10, 'Guardian contact required'),
  departureDate: z.string(),
  expectedReturnDate: z.string(),
});

export type CreateExeatPassInput = z.infer<typeof CreateExeatPassSchema>;

// ------------------------------------------------------------------------------
// 4. Library & Catalog Management
// ------------------------------------------------------------------------------

export interface LibraryBook {
  id: string;
  schoolId: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  copiesTotal: number;
  copiesAvailable: number;
  shelfLocation: string;
}

export interface BookLoan {
  id: string;
  schoolId: string;
  bookId: string;
  bookTitle: string;
  borrowerId: string;
  borrowerName: string;
  borrowerRole: 'STUDENT' | 'TEACHER';
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  fineAmount: number;
}

export const CreateBookLoanSchema = z.object({
  bookId: z.string().min(1, 'Book ID required'),
  borrowerId: z.string().min(1, 'Borrower ID required'),
  borrowerName: z.string().min(1, 'Borrower name required'),
  borrowerRole: z.enum(['STUDENT', 'TEACHER']),
  durationDays: z.number().min(1).max(30).default(14),
});

export type CreateBookLoanInput = z.infer<typeof CreateBookLoanSchema>;

// ------------------------------------------------------------------------------
// 5. Fixed Assets & Facility Maintenance (Playbook p. 14, 29)
// ------------------------------------------------------------------------------

export type AssetCategory =
  | 'IT_EQUIPMENT'
  | 'FURNITURE'
  | 'LAB_EQUIPMENT'
  | 'POWER_GENERATOR'
  | 'VEHICLE'
  | 'FACILITY';

export type AssetCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_REPAIR' | 'DECOMMISSIONED';
export type MaintenanceStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';

export interface MaintenanceTicket {
  id: string;
  assetId: string;
  assetName: string;
  issueDescription: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  requestedBy: string;
  requestedDate: string;
  estimatedCost: number;
  actualCost?: number;
  status: MaintenanceStatus;
  resolvedDate?: string;
  resolutionNotes?: string;
}

export interface FixedAsset {
  id: string;
  schoolId: string;
  assetCode: string;
  name: string;
  category: AssetCategory;
  location: string;
  condition: AssetCondition;
  purchaseDate: string;
  purchaseCost: number;
  custodian: string;
  maintenanceTickets: MaintenanceTicket[];
}

export const CreateFixedAssetSchema = z.object({
  assetCode: z.string().min(2, 'Asset code required'),
  name: z.string().min(2, 'Asset name required'),
  category: z.enum([
    'IT_EQUIPMENT',
    'FURNITURE',
    'LAB_EQUIPMENT',
    'POWER_GENERATOR',
    'VEHICLE',
    'FACILITY',
  ]),
  location: z.string().min(2, 'Location required'),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_REPAIR', 'DECOMMISSIONED']).default('GOOD'),
  purchaseDate: z.string(),
  purchaseCost: z.number().min(0),
  custodian: z.string().min(2, 'Custodian required'),
});

export type CreateFixedAssetInput = z.infer<typeof CreateFixedAssetSchema>;

export const CreateMaintenanceTicketSchema = z.object({
  assetId: z.string().min(1, 'Asset ID required'),
  issueDescription: z.string().min(5, 'Issue description must be at least 5 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']).default('MEDIUM'),
  estimatedCost: z.number().min(0).default(0),
});

export type CreateMaintenanceTicketInput = z.infer<typeof CreateMaintenanceTicketSchema>;

// ------------------------------------------------------------------------------
// 6. PTA Executive & Segregated Project Levies (Playbook p. 14, 28, 51)
// ------------------------------------------------------------------------------

export interface PtaProject {
  id: string;
  schoolId: string;
  title: string;
  session: string;
  targetAmount: number;
  raisedAmount: number;
  levyPerStudent: number;
  status: 'ACTIVE' | 'COMPLETED';
  description: string;
  committeeChairman: string;
  lastMeetingDate?: string;
  meetingMinutesSummary?: string;
}

export interface PtaContribution {
  id: string;
  schoolId: string;
  projectId: string;
  studentId: string;
  studentName: string;
  classArm: string;
  amount: number;
  paidDate: string;
  paymentMethod: 'PAYSTACK' | 'BANK_TRANSFER' | 'CASH';
  receiptReference: string;
}

export const CreatePtaProjectSchema = z.object({
  title: z.string().min(3, 'Project title required'),
  session: z.string().min(4, 'Academic session required'),
  targetAmount: z.number().min(1000, 'Target amount must be at least ₦1,000'),
  levyPerStudent: z.number().min(0),
  description: z.string().min(10, 'Description required'),
  committeeChairman: z.string().min(2, 'Chairman name required'),
});

export type CreatePtaProjectInput = z.infer<typeof CreatePtaProjectSchema>;

export const RecordPtaContributionSchema = z.object({
  projectId: z.string().min(1, 'Project ID required'),
  studentId: z.string().min(1, 'Student ID required'),
  studentName: z.string().min(1, 'Student name required'),
  classArm: z.string().min(1, 'Class arm required'),
  amount: z.number().min(100, 'Contribution amount required'),
  paymentMethod: z.enum(['PAYSTACK', 'BANK_TRANSFER', 'CASH']).default('BANK_TRANSFER'),
});

export type RecordPtaContributionInput = z.infer<typeof RecordPtaContributionSchema>;

export interface AuxiliaryMetrics {
  totalClinicVisitsToday: number;
  criticalCasesToday: number;
  activeTransportRoutes: number;
  studentsOnBusesCount: number;
  activeHostelScholarsCount: number;
  pendingExeatsCount: number;
  totalLibraryBooksCount: number;
  booksOnLoanCount: number;
  totalFixedAssetsCount: number;
  pendingMaintenanceCount: number;
  activePtaProjectsCount: number;
}
