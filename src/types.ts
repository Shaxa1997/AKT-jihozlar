export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'blocked';

export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  position?: string;
  avatarUrl?: string;
  telegramId?: string;
  status: UserStatus;
  equipmentCount?: number;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
}

export interface EquipmentTypeItem {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

export type EquipmentStatus = 
  | 'yangi' 
  | 'ishlayapti' 
  | 'ishlatilmoqda' 
  | 'tamirda' 
  | 'ishdan_chiqqan' 
  | 'hisobdan_chiqarilgan' 
  | 'omborda';

export interface EquipmentImage {
  id: string;
  url: string;
  name: string;
  uploadedAt: string;
  sortOrder: number;
}

export interface Equipment {
  id: string; // Firestore document ID
  code: string; // e.g. JHZ-2026-000001
  typeId: string;
  typeName: string;
  name: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  inventoryNumber?: string;
  manufactureYear: number;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyPeriod?: string;
  status: EquipmentStatus;
  ownerType: 'tashkilot' | 'bolim' | 'xodim';
  departmentId?: string;
  departmentName?: string;
  ownerUserId?: string;
  currentUserId: string;
  currentUserName: string;
  userPosition?: string;
  userPhone?: string;
  userPhotoUrl?: string;
  locationRoom?: string;
  locationAddress?: string;
  notes?: string;
  mainImageUrl?: string;
  images: EquipmentImage[];
  signatureUrl?: string;
  signedBy?: string;
  signedAt?: string;
  qrCodeUrl?: string;
  isBroken: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName?: string;
}

export interface EquipmentFailure {
  id: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentTypeName: string;
  failureDate: string;
  failureReason: string; // Selected reason or custom
  failureType?: string; // Electronic, Mechanical, Physical, etc.
  reportedBy: string;
  reportedByName: string;
  images: string[];
  notes?: string;
  status: 'nosoz' | 'tamirda' | 'tamirlandi' | 'hisobdan_chiqarildi';
  repairCost?: number;
  repairDate?: string;
  repairNotes?: string;
  createdAt: string;
}

export interface EquipmentHistory {
  id: string;
  equipmentId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  performedByName: string;
  timestamp: string;
  details?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  userId?: string; // If target user, or undefined if for admins
  targetRole?: UserRole;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface TechSupportRequest {
  id: string;
  equipmentId?: string;
  equipmentCode?: string;
  equipmentName?: string;
  applicantId: string;
  applicantName: string;
  applicantPhone?: string;
  departmentName?: string;
  roomNumber?: string;
  title: string;
  description: string;
  priority: 'past' | 'orta' | 'yuqori' | 'shoshilinch';
  status: 'yangi' | 'jarayonda' | 'bajarildi' | 'rad_etildi';
  assignedTechnician?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EquipmentFilterOptions {
  search?: string;
  typeId?: string;
  status?: string;
  departmentId?: string;
  userId?: string;
  manufactureYear?: string;
  dateFrom?: string;
  dateTo?: string;
  isBrokenOnly?: boolean;
  sortBy?: 'newest' | 'oldest' | 'code' | 'year' | 'status';
}
