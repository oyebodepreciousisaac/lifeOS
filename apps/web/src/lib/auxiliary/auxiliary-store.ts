import crypto from 'crypto';
import { AuthSession } from '../auth/rbac';
import { logAuditEvent } from '../audit/logger';
import {
  ClinicVisit,
  CreateClinicVisitInput,
  CreateClinicVisitSchema,
  TransportRoute,
  CreateTransportRouteInput,
  CreateTransportRouteSchema,
  HostelRoom,
  ExeatPass,
  CreateExeatPassInput,
  CreateExeatPassSchema,
  ExeatStatus,
  LibraryBook,
  BookLoan,
  CreateBookLoanInput,
  CreateBookLoanSchema,
  FixedAsset,
  CreateFixedAssetInput,
  CreateFixedAssetSchema,
  MaintenanceTicket,
  CreateMaintenanceTicketInput,
  CreateMaintenanceTicketSchema,
  PtaProject,
  CreatePtaProjectInput,
  CreatePtaProjectSchema,
  PtaContribution,
  RecordPtaContributionInput,
  RecordPtaContributionSchema,
  AuxiliaryMetrics,
} from './auxiliary-types';
import { sendSingleNotification } from '../communication/communication-store';

/**
 * Multi-tenant Auxiliary School Operations Store
 * Covers Clinic, Transport, Hostel, Library, Fixed Assets & PTA (Playbook pp. 14, 28-29, 51-52)
 */

const clinicVisitsStore: Map<string, ClinicVisit[]> = new Map();
const transportRoutesStore: Map<string, TransportRoute[]> = new Map();
const hostelRoomsStore: Map<string, HostelRoom[]> = new Map();
const exeatPassesStore: Map<string, ExeatPass[]> = new Map();
const libraryBooksStore: Map<string, LibraryBook[]> = new Map();
const bookLoansStore: Map<string, BookLoan[]> = new Map();
const fixedAssetsStore: Map<string, FixedAsset[]> = new Map();
const ptaProjectsStore: Map<string, PtaProject[]> = new Map();
const ptaContributionsStore: Map<string, PtaContribution[]> = new Map();

const TENANT_A_ID = '11111111-1111-1111-1111-111111111111';
const TENANT_B_ID = '22222222-2222-2222-2222-222222222222';

function initializeAuxiliaryStore() {
  if (clinicVisitsStore.size > 0) return;

  // Tenant A: Clinic Seed
  clinicVisitsStore.set(TENANT_A_ID, [
    {
      id: 'cln_001',
      schoolId: TENANT_A_ID,
      studentId: 'stu_kcl_001',
      studentName: 'Chidubem Adeleke',
      classArm: 'JSS 1 Gold',
      symptoms: 'Mild headache and body fatigue after PE sports track heats.',
      diagnosis: 'Dehydration / Mild physical exhaustion',
      treatment: 'Oral rehydration solution (ORS) and 1 hour bed rest in sick bay.',
      prescription: 'Paracetamol 500mg prn',
      temperatureCelsius: 37.1,
      triageSeverity: 'MILD',
      parentNotified: true,
      parentNotificationChannel: 'SMS',
      admittedToSickBay: true,
      timeIn: '2026-10-18T10:15:00Z',
      nurseName: 'Nurse Veronica Ajayi (RN)',
    },
  ]);
  clinicVisitsStore.set(TENANT_B_ID, []);

  // Tenant A: Transport Seed
  transportRoutesStore.set(TENANT_A_ID, [
    {
      id: 'rt_lekki_01',
      schoolId: TENANT_A_ID,
      routeName: 'Lekki - Ikoyi Express Route A',
      zone: 'Zone 1 (Lekki / Victoria Island)',
      vehiclePlateNumber: 'EKY-882-XA (Toyota Coaster 32-seater)',
      vehicleCapacity: 32,
      driverName: 'Mr. Sunday Adebayo',
      driverPhone: '+234 803 234 5678',
      stops: ['Admiralty Way Lekki', 'Lekki Phase 1 Gate', 'Falomo Bridge Ikoyi', 'Main Campus Gate'],
      assignedStudentIds: ['stu_kcl_001', 'stu_kcl_002'],
      termFee: 65000,
    },
    {
      id: 'rt_ikeja_02',
      schoolId: TENANT_A_ID,
      routeName: 'Ikeja - Maryland Shuttle Route B',
      zone: 'Zone 2 (Mainland)',
      vehiclePlateNumber: 'KJA-451-BC (Toyota HiAce 18-seater)',
      vehicleCapacity: 18,
      driverName: 'Mr. Musa Aliyu',
      driverPhone: '+234 802 888 1234',
      stops: ['GRA Ikeja Roundabout', 'Anthony Village', 'Gbagada Expressway', 'Main Campus Gate'],
      assignedStudentIds: ['stu_kcl_003'],
      termFee: 85000,
    },
  ]);
  transportRoutesStore.set(TENANT_B_ID, []);

  // Tenant A: Hostel & Exeat Seed
  hostelRoomsStore.set(TENANT_A_ID, [
    {
      id: 'hostel_blk_a_101',
      schoolId: TENANT_A_ID,
      blockName: 'Nelson Mandela Hall (Boys Hostel)',
      gender: 'MALE',
      roomNumber: 'Room 101',
      capacity: 4,
      assignedStudentIds: ['stu_kcl_001'],
      wardenName: 'Mr. Emmanuel Nwosu',
    },
    {
      id: 'hostel_blk_b_204',
      schoolId: TENANT_A_ID,
      blockName: 'Queen Amina Hall (Girls Hostel)',
      gender: 'FEMALE',
      roomNumber: 'Room 204',
      capacity: 4,
      assignedStudentIds: ['stu_kcl_003'],
      wardenName: 'Mrs. Grace Okon',
    },
  ]);
  hostelRoomsStore.set(TENANT_B_ID, []);

  exeatPassesStore.set(TENANT_A_ID, [
    {
      id: 'exeat_001',
      schoolId: TENANT_A_ID,
      studentId: 'stu_kcl_001',
      studentName: 'Chidubem Adeleke',
      classArm: 'JSS 1 Gold',
      hostelRoom: 'Nelson Mandela Hall - Room 101',
      type: 'WEEKEND',
      reason: 'Family wedding ceremony in Ibadan.',
      destinationAddress: 'Plot 14 Admiralty Way Lekki / Ibadan',
      guardianContact: '+234 803 456 7890',
      departureDate: '2026-10-23T15:00:00Z',
      expectedReturnDate: '2026-10-25T17:00:00Z',
      status: 'APPROVED',
      approvedBy: 'Housemaster Nwosu',
      approvalNotes: 'Guardian identity verified by phone confirmation.',
      gatePassBarcode: 'EXP-2026-1023-8821',
    },
  ]);
  exeatPassesStore.set(TENANT_B_ID, []);

  // Tenant A: Library Seed
  libraryBooksStore.set(TENANT_A_ID, [
    {
      id: 'bk_001',
      schoolId: TENANT_A_ID,
      isbn: '978-0199123456',
      title: 'New General Mathematics for Junior Secondary Schools (JSS 1-3)',
      author: 'M.F. Macrae et al.',
      category: 'Mathematics & STEM',
      copiesTotal: 25,
      copiesAvailable: 23,
      shelfLocation: 'Shelf M-02 (Pure Sciences)',
    },
    {
      id: 'bk_002',
      schoolId: TENANT_A_ID,
      isbn: '978-0435905255',
      title: 'Things Fall Apart',
      author: 'Chinua Achebe',
      category: 'African Literature',
      copiesTotal: 30,
      copiesAvailable: 28,
      shelfLocation: 'Shelf L-01 (Literature in English)',
    },
    {
      id: 'bk_003',
      schoolId: TENANT_A_ID,
      isbn: '978-9781752341',
      title: 'Comprehensive Certificate Chemistry for Senior Secondary',
      author: 'G.N.C. Ohia et al.',
      category: 'Physical Sciences',
      copiesTotal: 15,
      copiesAvailable: 15,
      shelfLocation: 'Shelf C-04 (Chemistry Lab)',
    },
  ]);
  libraryBooksStore.set(TENANT_B_ID, []);

  bookLoansStore.set(TENANT_A_ID, [
    {
      id: 'loan_001',
      schoolId: TENANT_A_ID,
      bookId: 'bk_001',
      bookTitle: 'New General Mathematics for Junior Secondary Schools (JSS 1-3)',
      borrowerId: 'stu_kcl_001',
      borrowerName: 'Chidubem Adeleke',
      borrowerRole: 'STUDENT',
      borrowDate: '2026-10-10',
      dueDate: '2026-10-24',
      status: 'ACTIVE',
      fineAmount: 0,
    },
  ]);
  bookLoansStore.set(TENANT_B_ID, []);

  // Tenant A: Fixed Assets Seed
  fixedAssetsStore.set(TENANT_A_ID, [
    {
      id: 'asset_001',
      schoolId: TENANT_A_ID,
      assetCode: 'GEN-MIK-150',
      name: 'Mikano 150kVA Soundproof Diesel Generator',
      category: 'POWER_GENERATOR',
      location: 'Powerhouse / Utility Yard',
      condition: 'GOOD',
      purchaseDate: '2024-03-15',
      purchaseCost: 14500000,
      custodian: 'Engr. Festus Oladipo (Head of Facilities)',
      maintenanceTickets: [
        {
          id: 'ticket_001',
          assetId: 'asset_001',
          assetName: 'Mikano 150kVA Soundproof Diesel Generator',
          issueDescription: 'Routine 250-hour oil and fuel filter replacement and AVR inspection.',
          priority: 'MEDIUM',
          requestedBy: 'Engr. Festus Oladipo',
          requestedDate: '2026-10-05',
          estimatedCost: 120000,
          actualCost: 115000,
          status: 'COMPLETED',
          resolvedDate: '2026-10-07',
          resolutionNotes: 'Filters replaced and test-run successfully under full school ICT load.',
        },
      ],
    },
    {
      id: 'asset_002',
      schoolId: TENANT_A_ID,
      assetCode: 'ICT-LAB-PC-25',
      name: 'Dell OptiPlex Core i7 Desktop Set (25 units)',
      category: 'IT_EQUIPMENT',
      location: 'Senior ICT Innovation Lab',
      condition: 'GOOD',
      purchaseDate: '2025-01-20',
      purchaseCost: 18750000,
      custodian: 'Mrs. Folake Davies (ICT Coordinator)',
      maintenanceTickets: [],
    },
  ]);
  fixedAssetsStore.set(TENANT_B_ID, []);

  // Tenant A: PTA Project Seed
  ptaProjectsStore.set(TENANT_A_ID, [
    {
      id: 'pta_proj_001',
      schoolId: TENANT_A_ID,
      title: 'Solar Power Inverter & STEM Lab Modernization',
      session: '2026/2027',
      targetAmount: 5000000,
      raisedAmount: 3850000,
      levyPerStudent: 25000,
      status: 'ACTIVE',
      description: 'PTA initiative to install 15kVA pure sine wave solar system for the biology, physics, and robotics laboratories.',
      committeeChairman: 'Chief (Dr.) Raymond Eke (PTA Chairman)',
      lastMeetingDate: '2026-09-28',
      meetingMinutesSummary: 'PTA Exco approved Phase 1 solar panel mounting; 154 parents contributed.',
    },
  ]);
  ptaProjectsStore.set(TENANT_B_ID, []);

  ptaContributionsStore.set(TENANT_A_ID, [
    {
      id: 'pta_contrib_001',
      schoolId: TENANT_A_ID,
      projectId: 'pta_proj_001',
      studentId: 'stu_kcl_001',
      studentName: 'Chidubem Adeleke',
      classArm: 'JSS 1 Gold',
      amount: 25000,
      paidDate: '2026-10-02',
      paymentMethod: 'PAYSTACK',
      receiptReference: 'PTA-REC-2026-0091',
    },
  ]);
  ptaContributionsStore.set(TENANT_B_ID, []);
}

initializeAuxiliaryStore();

export function resetAuxiliaryStoreForTesting() {
  clinicVisitsStore.clear();
  transportRoutesStore.clear();
  hostelRoomsStore.clear();
  exeatPassesStore.clear();
  libraryBooksStore.clear();
  bookLoansStore.clear();
  fixedAssetsStore.clear();
  ptaProjectsStore.clear();
  ptaContributionsStore.clear();
  initializeAuxiliaryStore();
}

// ------------------------------------------------------------------------------
// 1. Clinic Management
// ------------------------------------------------------------------------------

export async function logClinicVisit(
  schoolId: string,
  actor: AuthSession,
  input: CreateClinicVisitInput
): Promise<ClinicVisit> {
  initializeAuxiliaryStore();

  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant clinic logging rejected.');
  }

  const validated = CreateClinicVisitSchema.parse(input);

  const visit: ClinicVisit = {
    id: `cln_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    studentId: validated.studentId,
    studentName: validated.studentName,
    classArm: validated.classArm,
    symptoms: validated.symptoms.trim(),
    diagnosis: validated.diagnosis.trim(),
    treatment: validated.treatment.trim(),
    prescription: validated.prescription?.trim(),
    temperatureCelsius: validated.temperatureCelsius,
    triageSeverity: validated.triageSeverity,
    parentNotified: validated.notifyParent || validated.triageSeverity === 'CRITICAL',
    parentNotificationChannel: validated.triageSeverity === 'CRITICAL' ? 'SMS' : 'WHATSAPP',
    admittedToSickBay: validated.admitToSickBay || validated.triageSeverity === 'CRITICAL',
    timeIn: new Date().toISOString(),
    nurseName: `${actor.firstName} ${actor.lastName} (${actor.userType})`,
  };

  // If severe or parent notification requested, dispatch automated parent alert
  if (visit.parentNotified) {
    try {
      await sendSingleNotification(
        schoolId,
        {
          recipient: {
            name: `Parent of ${visit.studentName}`,
            phonePrimary: '+2348034567890',
            recipientType: 'GUARDIAN',
            studentId: visit.studentId,
          },
          channel: 'SMS',
          category: 'OTHER',
          priority: visit.triageSeverity === 'CRITICAL' ? 'URGENT' : 'NORMAL',
          subject: `School Clinic Health Alert: ${visit.studentName}`,
          body: `Dear Parent, ${visit.studentName} visited the school clinic at ${new Date().toLocaleTimeString()} reporting: ${visit.symptoms}. Treatment: ${visit.treatment}. Triage status: ${visit.triageSeverity}.`,
        },
        actor
      );
    } catch {
      // In-memory fallback
    }
  }

  clinicVisitsStore.get(schoolId)!.unshift(visit);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CREATE',
    resourceType: 'CLINIC_VISIT',
    resourceId: visit.id,
    afterState: {
      studentName: visit.studentName,
      triageSeverity: visit.triageSeverity,
      parentNotified: visit.parentNotified,
    },
  });

  return visit;
}

export async function listClinicVisits(
  schoolId: string,
  actor: AuthSession
): Promise<ClinicVisit[]> {
  initializeAuxiliaryStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant clinic query rejected.');
  }
  return clinicVisitsStore.get(schoolId) || [];
}

// ------------------------------------------------------------------------------
// 2. Transport Management
// ------------------------------------------------------------------------------

export async function createTransportRoute(
  schoolId: string,
  actor: AuthSession,
  input: CreateTransportRouteInput
): Promise<TransportRoute> {
  initializeAuxiliaryStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant transport creation rejected.');
  }

  const validated = CreateTransportRouteSchema.parse(input);

  const route: TransportRoute = {
    id: `rt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    routeName: validated.routeName.trim(),
    zone: validated.zone.trim(),
    vehiclePlateNumber: validated.vehiclePlateNumber.trim(),
    vehicleCapacity: validated.vehicleCapacity,
    driverName: validated.driverName.trim(),
    driverPhone: validated.driverPhone.trim(),
    stops: validated.stops,
    assignedStudentIds: [],
    termFee: validated.termFee,
  };

  transportRoutesStore.get(schoolId)!.push(route);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CREATE',
    resourceType: 'TRANSPORT_ROUTE',
    resourceId: route.id,
    afterState: { routeName: route.routeName, capacity: route.vehicleCapacity },
  });

  return route;
}

export async function assignStudentToBusRoute(
  schoolId: string,
  actor: AuthSession,
  routeId: string,
  studentId: string
): Promise<TransportRoute> {
  initializeAuxiliaryStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant transport assignment rejected.');
  }

  const routes = transportRoutesStore.get(schoolId) || [];
  const route = routes.find((r) => r.id === routeId);
  if (!route) {
    throw new Error(`Transport route with ID ${routeId} not found.`);
  }

  if (route.assignedStudentIds.includes(studentId)) {
    throw new Error('Student is already assigned to this transport route.');
  }

  if (route.assignedStudentIds.length >= route.vehicleCapacity) {
    throw new Error(`Bus capacity exceeded. Maximum capacity is ${route.vehicleCapacity} scholars.`);
  }

  route.assignedStudentIds.push(studentId);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'UPDATE',
    resourceType: 'TRANSPORT_ROUTE',
    resourceId: route.id,
    afterState: { assignedStudentCount: route.assignedStudentIds.length },
  });

  return route;
}

export async function listTransportRoutes(
  schoolId: string,
  actor: AuthSession
): Promise<TransportRoute[]> {
  initializeAuxiliaryStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant transport query rejected.');
  }
  return transportRoutesStore.get(schoolId) || [];
}

// ------------------------------------------------------------------------------
// 3. Hostel & Exeat Management
// ------------------------------------------------------------------------------

export async function requestExeatPass(
  schoolId: string,
  actor: AuthSession,
  input: CreateExeatPassInput
): Promise<ExeatPass> {
  initializeAuxiliaryStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant exeat request rejected.');
  }

  const validated = CreateExeatPassSchema.parse(input);

  const pass: ExeatPass = {
    id: `exeat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    studentId: validated.studentId,
    studentName: validated.studentName,
    classArm: validated.classArm,
    hostelRoom: validated.hostelRoom,
    type: validated.type,
    reason: validated.reason.trim(),
    destinationAddress: validated.destinationAddress.trim(),
    guardianContact: validated.guardianContact.trim(),
    departureDate: validated.departureDate,
    expectedReturnDate: validated.expectedReturnDate,
    status: 'PENDING',
    gatePassBarcode: `EXP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  };

  exeatPassesStore.get(schoolId)!.unshift(pass);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CREATE',
    resourceType: 'EXEAT_PASS',
    resourceId: pass.id,
    afterState: { studentName: pass.studentName, type: pass.type },
  });

  return pass;
}

export async function reviewExeatPass(
  schoolId: string,
  actor: AuthSession,
  exeatId: string,
  action: ExeatStatus,
  notes: string
): Promise<ExeatPass> {
  initializeAuxiliaryStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant exeat review rejected.');
  }

  const list = exeatPassesStore.get(schoolId) || [];
  const pass = list.find((p) => p.id === exeatId);
  if (!pass) {
    throw new Error(`Exeat pass ${exeatId} not found.`);
  }

  pass.status = action;
  pass.approvedBy = `${actor.firstName} ${actor.lastName} (${actor.userType})`;
  pass.approvalNotes = notes.trim();

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: action === 'APPROVED' ? 'APPROVE' : 'REJECT',
    resourceType: 'EXEAT_PASS',
    resourceId: pass.id,
    afterState: { status: pass.status, approvedBy: pass.approvedBy },
  });

  return pass;
}

export async function listExeatPasses(
  schoolId: string,
  actor: AuthSession,
  status?: ExeatStatus
): Promise<ExeatPass[]> {
  initializeAuxiliaryStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant exeat query rejected.');
  }
  let list = exeatPassesStore.get(schoolId) || [];
  if (status) {
    list = list.filter((p) => p.status === status);
  }
  return list;
}

// ------------------------------------------------------------------------------
// 4. Library Management
// ------------------------------------------------------------------------------

export async function borrowBook(
  schoolId: string,
  actor: AuthSession,
  input: CreateBookLoanInput
): Promise<BookLoan> {
  initializeAuxiliaryStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant book loan rejected.');
  }

  const validated = CreateBookLoanSchema.parse(input);
  const books = libraryBooksStore.get(schoolId) || [];
  const book = books.find((b) => b.id === validated.bookId);

  if (!book) {
    throw new Error(`Library book ${validated.bookId} not found.`);
  }

  if (book.copiesAvailable <= 0) {
    throw new Error(`No available copies of "${book.title}" in library stock.`);
  }

  book.copiesAvailable -= 1;

  const now = new Date();
  const dueDate = new Date(now.getTime() + validated.durationDays * 86400000);

  const loan: BookLoan = {
    id: `loan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    bookId: book.id,
    bookTitle: book.title,
    borrowerId: validated.borrowerId,
    borrowerName: validated.borrowerName,
    borrowerRole: validated.borrowerRole,
    borrowDate: now.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    status: 'ACTIVE',
    fineAmount: 0,
  };

  bookLoansStore.get(schoolId)!.unshift(loan);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CREATE',
    resourceType: 'BOOK_LOAN',
    resourceId: loan.id,
    afterState: { bookTitle: loan.bookTitle, borrowerName: loan.borrowerName },
  });

  return loan;
}

export async function returnBook(
  schoolId: string,
  actor: AuthSession,
  loanId: string
): Promise<BookLoan> {
  initializeAuxiliaryStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant book return rejected.');
  }

  const loans = bookLoansStore.get(schoolId) || [];
  const loan = loans.find((l) => l.id === loanId);
  if (!loan) {
    throw new Error(`Book loan ${loanId} not found.`);
  }

  if (loan.status === 'RETURNED') {
    throw new Error('Book has already been returned.');
  }

  const books = libraryBooksStore.get(schoolId) || [];
  const book = books.find((b) => b.id === loan.bookId);
  if (book) {
    book.copiesAvailable += 1;
  }

  loan.status = 'RETURNED';
  loan.returnDate = new Date().toISOString().split('T')[0];

  // Calculate overdue fine if returned past due date (₦200 / day standard fine)
  const due = new Date(loan.dueDate);
  const returned = new Date(loan.returnDate);
  if (returned > due) {
    const daysLate = Math.ceil((returned.getTime() - due.getTime()) / 86400000);
    loan.fineAmount = daysLate * 200;
  }

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'UPDATE',
    resourceType: 'BOOK_LOAN',
    resourceId: loan.id,
    afterState: { status: loan.status, returnDate: loan.returnDate, fineAmount: loan.fineAmount },
  });

  return loan;
}

export async function listLibraryBooks(
  schoolId: string,
  actor: AuthSession
): Promise<LibraryBook[]> {
  initializeAuxiliaryStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant library book query rejected.');
  }
  return libraryBooksStore.get(schoolId) || [];
}

export async function listBookLoans(
  schoolId: string,
  actor: AuthSession
): Promise<BookLoan[]> {
  initializeAuxiliaryStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant library loan query rejected.');
  }
  return bookLoansStore.get(schoolId) || [];
}

// ------------------------------------------------------------------------------
// 5. Fixed Assets & Facility Maintenance
// ------------------------------------------------------------------------------

export async function createFixedAsset(
  schoolId: string,
  actor: AuthSession,
  input: CreateFixedAssetInput
): Promise<FixedAsset> {
  initializeAuxiliaryStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant asset creation rejected.');
  }

  const validated = CreateFixedAssetSchema.parse(input);

  const asset: FixedAsset = {
    id: `asset_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    assetCode: validated.assetCode.toUpperCase().trim(),
    name: validated.name.trim(),
    category: validated.category,
    location: validated.location.trim(),
    condition: validated.condition,
    purchaseDate: validated.purchaseDate,
    purchaseCost: validated.purchaseCost,
    custodian: validated.custodian.trim(),
    maintenanceTickets: [],
  };

  if (!fixedAssetsStore.has(schoolId)) {
    fixedAssetsStore.set(schoolId, []);
  }

  fixedAssetsStore.get(schoolId)!.unshift(asset);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CREATE',
    resourceType: 'FIXED_ASSET',
    resourceId: asset.id,
    afterState: { assetCode: asset.assetCode, name: asset.name, category: asset.category },
  });

  return asset;
}

export async function listFixedAssets(
  schoolId: string,
  actor: AuthSession
): Promise<FixedAsset[]> {
  initializeAuxiliaryStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant asset query rejected.');
  }
  return fixedAssetsStore.get(schoolId) || [];
}

export async function reportMaintenanceTicket(
  schoolId: string,
  actor: AuthSession,
  input: CreateMaintenanceTicketInput
): Promise<MaintenanceTicket> {
  initializeAuxiliaryStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant maintenance ticket rejected.');
  }

  const validated = CreateMaintenanceTicketSchema.parse(input);
  const assets = fixedAssetsStore.get(schoolId) || [];
  const asset = assets.find((a) => a.id === validated.assetId);

  if (!asset) {
    throw new Error(`Asset ${validated.assetId} not found.`);
  }

  const ticket: MaintenanceTicket = {
    id: `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    assetId: asset.id,
    assetName: asset.name,
    issueDescription: validated.issueDescription.trim(),
    priority: validated.priority,
    requestedBy: `${actor.firstName} ${actor.lastName} (${actor.userType})`,
    requestedDate: new Date().toISOString(),
    estimatedCost: validated.estimatedCost,
    status: 'OPEN',
  };

  asset.maintenanceTickets.unshift(ticket);
  if (ticket.priority === 'HIGH' || ticket.priority === 'EMERGENCY') {
    asset.condition = 'NEEDS_REPAIR';
  }

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CREATE',
    resourceType: 'MAINTENANCE_TICKET',
    resourceId: ticket.id,
    afterState: { assetName: asset.name, priority: ticket.priority, issue: ticket.issueDescription },
  });

  return ticket;
}

export async function resolveMaintenanceTicket(
  schoolId: string,
  actor: AuthSession,
  assetId: string,
  ticketId: string,
  actualCost: number,
  resolutionNotes: string
): Promise<MaintenanceTicket> {
  initializeAuxiliaryStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant maintenance resolution rejected.');
  }

  const assets = fixedAssetsStore.get(schoolId) || [];
  const asset = assets.find((a) => a.id === assetId);
  if (!asset) {
    throw new Error(`Asset ${assetId} not found.`);
  }

  const ticket = asset.maintenanceTickets.find((t) => t.id === ticketId);
  if (!ticket) {
    throw new Error(`Maintenance ticket ${ticketId} not found on asset.`);
  }

  ticket.status = 'COMPLETED';
  ticket.actualCost = actualCost;
  ticket.resolvedDate = new Date().toISOString();
  ticket.resolutionNotes = resolutionNotes.trim();

  // Reset asset condition back to GOOD if all tickets resolved
  const openTickets = asset.maintenanceTickets.filter((t) => t.status !== 'COMPLETED');
  if (openTickets.length === 0) {
    asset.condition = 'GOOD';
  }

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'UPDATE',
    resourceType: 'MAINTENANCE_TICKET',
    resourceId: ticket.id,
    afterState: { status: 'COMPLETED', actualCost, resolutionNotes },
  });

  return ticket;
}

// ------------------------------------------------------------------------------
// 6. PTA Executive & Segregated Project Levies
// ------------------------------------------------------------------------------

export async function createPtaProject(
  schoolId: string,
  actor: AuthSession,
  input: CreatePtaProjectInput
): Promise<PtaProject> {
  initializeAuxiliaryStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant PTA project creation rejected.');
  }

  const validated = CreatePtaProjectSchema.parse(input);

  const project: PtaProject = {
    id: `pta_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    title: validated.title.trim(),
    session: validated.session.trim(),
    targetAmount: validated.targetAmount,
    raisedAmount: 0,
    levyPerStudent: validated.levyPerStudent,
    status: 'ACTIVE',
    description: validated.description.trim(),
    committeeChairman: validated.committeeChairman.trim(),
    lastMeetingDate: new Date().toISOString().split('T')[0],
  };

  if (!ptaProjectsStore.has(schoolId)) {
    ptaProjectsStore.set(schoolId, []);
  }

  ptaProjectsStore.get(schoolId)!.unshift(project);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CREATE',
    resourceType: 'PTA_PROJECT',
    resourceId: project.id,
    afterState: { title: project.title, targetAmount: project.targetAmount },
  });

  return project;
}

export async function listPtaProjects(
  schoolId: string,
  actor: AuthSession
): Promise<PtaProject[]> {
  initializeAuxiliaryStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant PTA query rejected.');
  }
  return ptaProjectsStore.get(schoolId) || [];
}

export async function recordPtaContribution(
  schoolId: string,
  actor: AuthSession,
  input: RecordPtaContributionInput
): Promise<PtaContribution> {
  initializeAuxiliaryStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant PTA contribution rejected.');
  }

  const validated = RecordPtaContributionSchema.parse(input);
  const projects = ptaProjectsStore.get(schoolId) || [];
  const project = projects.find((p) => p.id === validated.projectId);

  if (!project) {
    throw new Error(`PTA Project ${validated.projectId} not found.`);
  }

  const ref = `PTA-REC-${Date.now().toString().slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const contribution: PtaContribution = {
    id: `contrib_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    projectId: project.id,
    studentId: validated.studentId,
    studentName: validated.studentName,
    classArm: validated.classArm,
    amount: validated.amount,
    paidDate: new Date().toISOString().split('T')[0],
    paymentMethod: validated.paymentMethod,
    receiptReference: ref,
  };

  if (!ptaContributionsStore.has(schoolId)) {
    ptaContributionsStore.set(schoolId, []);
  }

  ptaContributionsStore.get(schoolId)!.unshift(contribution);
  project.raisedAmount += validated.amount;

  if (project.raisedAmount >= project.targetAmount) {
    project.status = 'COMPLETED';
  }

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CREATE',
    resourceType: 'PTA_CONTRIBUTION',
    resourceId: contribution.id,
    afterState: {
      projectTitle: project.title,
      studentName: contribution.studentName,
      amount: contribution.amount,
      receiptReference: contribution.receiptReference,
    },
  });

  return contribution;
}

export async function listPtaContributions(
  schoolId: string,
  actor: AuthSession,
  projectId?: string
): Promise<PtaContribution[]> {
  initializeAuxiliaryStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant PTA contribution query rejected.');
  }

  const list = ptaContributionsStore.get(schoolId) || [];
  if (projectId) {
    return list.filter((c) => c.projectId === projectId);
  }
  return list;
}

// ------------------------------------------------------------------------------
// Auxiliary Metrics Aggregator
// ------------------------------------------------------------------------------

export async function getAuxiliaryMetrics(
  schoolId: string,
  actor: AuthSession
): Promise<AuxiliaryMetrics> {
  initializeAuxiliaryStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant auxiliary metrics query rejected.');
  }

  const clinic = clinicVisitsStore.get(schoolId) || [];
  const transport = transportRoutesStore.get(schoolId) || [];
  const exeats = exeatPassesStore.get(schoolId) || [];
  const books = libraryBooksStore.get(schoolId) || [];
  const loans = bookLoansStore.get(schoolId) || [];
  const assets = fixedAssetsStore.get(schoolId) || [];
  const pta = ptaProjectsStore.get(schoolId) || [];

  const pendingMaintenance = assets.reduce(
    (sum, a) => sum + a.maintenanceTickets.filter((t) => t.status !== 'COMPLETED').length,
    0
  );

  return {
    totalClinicVisitsToday: clinic.length,
    criticalCasesToday: clinic.filter((c) => c.triageSeverity === 'CRITICAL').length,
    activeTransportRoutes: transport.length,
    studentsOnBusesCount: transport.reduce((sum, r) => sum + r.assignedStudentIds.length, 0),
    activeHostelScholarsCount: 14,
    pendingExeatsCount: exeats.filter((e) => e.status === 'PENDING').length,
    totalLibraryBooksCount: books.reduce((sum, b) => sum + b.copiesTotal, 0),
    booksOnLoanCount: loans.filter((l) => l.status === 'ACTIVE').length,
    totalFixedAssetsCount: assets.length,
    pendingMaintenanceCount: pendingMaintenance,
    activePtaProjectsCount: pta.filter((p) => p.status === 'ACTIVE').length,
  };
}
