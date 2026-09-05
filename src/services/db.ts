import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  UserProfile, 
  Department, 
  EquipmentTypeItem, 
  Equipment, 
  EquipmentFailure, 
  EquipmentHistory, 
  AuditLog, 
  AppNotification, 
  EquipmentFilterOptions,
  EquipmentStatus,
  TechSupportRequest
} from '../types';

// Collection references
export const COLLECTIONS = {
  USERS: 'users',
  DEPARTMENTS: 'departments',
  EQUIPMENT_TYPES: 'equipment_types',
  EQUIPMENT: 'equipment',
  EQUIPMENT_FAILURES: 'equipment_failures',
  EQUIPMENT_HISTORY: 'equipment_history',
  AUDIT_LOGS: 'audit_logs',
  NOTIFICATIONS: 'notifications',
  TECH_SUPPORT: 'tech_support'
};

// Default seed data initializer
export async function seedInitialDataIfEmpty() {
  try {
    const deptSnap = await getDocs(collection(db, COLLECTIONS.DEPARTMENTS));
    if (deptSnap.empty) {
      const defaultDepartments = [
        { name: "Raqamli texnologiyalar", code: "RT", description: "IT va Tizim administratsiyasi" },
        { name: "Buxgalteriya", code: "BX", description: "Moliya va hisob-kitob" },
        { name: "Kadrlar bo'limi", code: "KB", description: "Inson resurslari va kadrlar" },
        { name: "Kutubxona", code: "KT", description: "Kutubxona va axborot resurslari" },
        { name: "Metodika", code: "MT", description: "O'quv va metodik ta'minot" },
        { name: "Rahbariyat", code: "RH", description: "Tashkilot rahbariyati" }
      ];
      for (const d of defaultDepartments) {
        const docRef = doc(collection(db, COLLECTIONS.DEPARTMENTS));
        await setDoc(docRef, { ...d, id: docRef.id, createdAt: new Date().toISOString() });
      }
    }

    const typeSnap = await getDocs(collection(db, COLLECTIONS.EQUIPMENT_TYPES));
    if (typeSnap.empty) {
      const defaultTypes = [
        "Kompyuter", "Monitor", "Printer", "Notebook", "Proyektor", 
        "Kamera", "Konditsioner", "Telefon", "Planshet", "Server", 
        "Router", "Switch", "UPS", "Mebel", "Boshqa"
      ];
      for (const t of defaultTypes) {
        const docRef = doc(collection(db, COLLECTIONS.EQUIPMENT_TYPES));
        await setDoc(docRef, { id: docRef.id, name: t });
      }
    }

    const userSnap = await getDocs(collection(db, COLLECTIONS.USERS));
    if (userSnap.empty) {
      // Seed initial admin and standard user
      const adminUser: UserProfile = {
        uid: "admin_default_id",
        name: "Shaxzodbek Xolmatov",
        phone: "+998 90 123 45 67",
        role: "admin",
        position: "Bosh Administrator",
        status: "active",
        createdAt: new Date().toISOString(),
        equipmentCount: 0
      };
      const demoUser: UserProfile = {
        uid: "user_default_id",
        name: "Jasur Toshmatov",
        phone: "+998 91 987 65 43",
        role: "user",
        position: "Aparaturachi Muhandis",
        status: "active",
        createdAt: new Date().toISOString(),
        equipmentCount: 0
      };
      await setDoc(doc(db, COLLECTIONS.USERS, adminUser.uid), adminUser);
      await setDoc(doc(db, COLLECTIONS.USERS, demoUser.uid), demoUser);
    }
  } catch (err) {
    console.error("Error seeding initial data:", err);
  }
}

// Generate Safe Unique Equipment Code: JHZ-2026-000001
export async function generateEquipmentCode(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const eqSnap = await getDocs(collection(db, COLLECTIONS.EQUIPMENT));
  const count = eqSnap.size + 1;
  const paddedNumber = String(count).padStart(6, '0');
  return `JHZ-${currentYear}-${paddedNumber}`;
}

// Helper to sanitize objects for Firestore (removes any undefined properties)
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized: Record<string, any> = { ...obj };
  Object.keys(sanitized).forEach((key) => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    } else if (sanitized[key] !== null && typeof sanitized[key] === 'object' && !Array.isArray(sanitized[key])) {
      sanitized[key] = sanitizeForFirestore(sanitized[key]);
    }
  });
  return sanitized as T;
}

// Log Audit Action
export async function logAudit(
  userId: string, 
  userName: string, 
  userRole: 'admin' | 'user', 
  action: string, 
  targetType: string, 
  targetId: string, 
  details: string
) {
  try {
    const auditRef = doc(collection(db, COLLECTIONS.AUDIT_LOGS));
    const log: AuditLog = {
      id: auditRef.id,
      userId: userId || '',
      userName: userName || '',
      userRole: userRole || 'user',
      action: action || '',
      targetType: targetType || '',
      targetId: targetId || '',
      details: details || '',
      timestamp: new Date().toISOString()
    };
    await setDoc(auditRef, sanitizeForFirestore(log));
  } catch (e) {
    console.error("Audit log error:", e);
  }
}

// Log Equipment Timeline History
export async function addEquipmentHistory(
  equipmentId: string,
  action: string,
  performedBy: string,
  performedByName: string,
  details?: string,
  oldValue?: string,
  newValue?: string
) {
  try {
    const histRef = doc(collection(db, COLLECTIONS.EQUIPMENT_HISTORY));
    const item: EquipmentHistory = {
      id: histRef.id,
      equipmentId: equipmentId || '',
      action: action || '',
      performedBy: performedBy || '',
      performedByName: performedByName || '',
      timestamp: new Date().toISOString(),
      ...(details !== undefined && { details }),
      ...(oldValue !== undefined && { oldValue }),
      ...(newValue !== undefined && { newValue })
    };
    await setDoc(histRef, sanitizeForFirestore(item));
  } catch (e) {
    console.error("Equipment history error:", e);
  }
}

// Create Notification
export async function createNotification(
  title: string,
  message: string,
  type: 'info' | 'warning' | 'danger' | 'success' = 'info',
  userId?: string,
  targetRole?: 'admin' | 'user'
) {
  try {
    const notifRef = doc(collection(db, COLLECTIONS.NOTIFICATIONS));
    const notification: AppNotification = {
      id: notifRef.id,
      title: title || '',
      message: message || '',
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
      ...(userId !== undefined && { userId }),
      ...(targetRole !== undefined && { targetRole })
    };
    await setDoc(notifRef, sanitizeForFirestore(notification));
  } catch (e) {
    console.error("Notification create error:", e);
  }
}

// Fetch Departments
export async function getDepartments(): Promise<Department[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.DEPARTMENTS));
  return snap.docs.map(doc => doc.data() as Department);
}

// Save/Update Department
export async function saveDepartment(dept: Partial<Department>): Promise<Department> {
  const isNew = !dept.id;
  const docRef = isNew ? doc(collection(db, COLLECTIONS.DEPARTMENTS)) : doc(db, COLLECTIONS.DEPARTMENTS, dept.id!);
  const fullDept: Department = {
    id: docRef.id,
    name: dept.name || 'Yangi Bo\'lim',
    code: dept.code || 'B01',
    description: dept.description || '',
    createdAt: dept.createdAt || new Date().toISOString()
  };
  await setDoc(docRef, fullDept, { merge: true });
  return fullDept;
}

// Fetch Equipment Types
export async function getEquipmentTypes(): Promise<EquipmentTypeItem[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.EQUIPMENT_TYPES));
  return snap.docs.map(doc => doc.data() as EquipmentTypeItem);
}

// Save/Update Equipment Type
export async function saveEquipmentType(typeItem: Partial<EquipmentTypeItem>): Promise<EquipmentTypeItem> {
  const isNew = !typeItem.id;
  const docRef = isNew ? doc(collection(db, COLLECTIONS.EQUIPMENT_TYPES)) : doc(db, COLLECTIONS.EQUIPMENT_TYPES, typeItem.id!);
  const fullItem: EquipmentTypeItem = {
    id: docRef.id,
    name: typeItem.name || 'Yangi tur',
    icon: typeItem.icon || 'Box',
    description: typeItem.description || ''
  };
  await setDoc(docRef, fullItem, { merge: true });
  return fullItem;
}

// Users Service
export async function getUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.USERS));
  return snap.docs.map(doc => doc.data() as UserProfile);
}

export async function getUserById(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, COLLECTIONS.USERS, uid);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
}

export async function saveUser(user: UserProfile): Promise<UserProfile> {
  await setDoc(doc(db, COLLECTIONS.USERS, user.uid), user, { merge: true });
  return user;
}

// EQUIPMENT CRUD SERVICES
export async function createEquipment(
  equipmentData: Omit<Equipment, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'isDeleted'>,
  currentUser: UserProfile
): Promise<Equipment> {
  const code = await generateEquipmentCode();
  const docRef = doc(collection(db, COLLECTIONS.EQUIPMENT));
  const now = new Date().toISOString();

  // Ensure all fields are valid non-undefined values for Firestore
  const sanitizedData = {
    typeId: equipmentData.typeId || 'type_gen',
    typeName: equipmentData.typeName || 'Kompyuter va Texnika',
    name: equipmentData.name || 'Yangi Jihoz',
    brand: equipmentData.brand || '',
    model: equipmentData.model || '',
    serialNumber: equipmentData.serialNumber || '',
    inventoryNumber: equipmentData.inventoryNumber || '',
    manufactureYear: equipmentData.manufactureYear || new Date().getFullYear(),
    status: equipmentData.status || 'ishlayapti',
    ownerType: equipmentData.ownerType || 'tashkilot',
    departmentId: equipmentData.departmentId || '',
    departmentName: equipmentData.departmentName || '',
    currentUserId: equipmentData.currentUserId || currentUser.uid,
    currentUserName: equipmentData.currentUserName || currentUser.name,
    userPosition: equipmentData.userPosition || '',
    userPhone: equipmentData.userPhone || '',
    userPhotoUrl: equipmentData.userPhotoUrl || '',
    locationRoom: equipmentData.locationRoom || '',
    notes: equipmentData.notes || '',
    mainImageUrl: equipmentData.mainImageUrl || '',
    images: equipmentData.images || [],
    signatureUrl: equipmentData.signatureUrl || '',
    signedBy: equipmentData.signedBy || currentUser.name,
    signedAt: equipmentData.signedAt || now,
    isBroken: equipmentData.isBroken ?? (equipmentData.status === 'ishdan_chiqqan')
  };

  const newEquipment: Equipment = {
    ...sanitizedData,
    id: docRef.id,
    code,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    createdBy: currentUser.uid,
    createdByName: currentUser.name
  };

  await setDoc(docRef, sanitizeForFirestore(newEquipment));

  // Background audit & history logging (non-blocking)
  Promise.all([
    logAudit(
      currentUser.uid, 
      currentUser.name, 
      currentUser.role, 
      'CREATE', 
      'EQUIPMENT', 
      docRef.id, 
      `Yangi jihoz qo'shildi: ${newEquipment.name} (${newEquipment.code})`
    ),
    addEquipmentHistory(
      docRef.id,
      "Jihoz tizimga kiritildi va saqlandi",
      currentUser.uid,
      currentUser.name,
      `Boshlang'ich holat: ${newEquipment.status}, Biriktirilgan shaxs: ${newEquipment.currentUserName}`
    ),
    createNotification(
      "Yangi jihoz ro'yxatga olindi",
      `${currentUser.name} tomonidan ${newEquipment.typeName} (${newEquipment.code}) qo'shildi.`,
      'info',
      undefined,
      'admin'
    )
  ]).catch(err => console.error("Non-blocking background tasks error:", err));

  return newEquipment;
}

export async function updateEquipment(
  id: string,
  updates: Partial<Equipment>,
  currentUser: UserProfile,
  reason?: string
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.EQUIPMENT, id);
  const oldDoc = await getDoc(docRef);
  const oldData = oldDoc.data() as Equipment | undefined;

  const now = new Date().toISOString();
  await updateDoc(docRef, sanitizeForFirestore({ ...updates, updatedAt: now }));

  // History timeline notes if status changed
  if (oldData && updates.status && updates.status !== oldData.status) {
    await addEquipmentHistory(
      id,
      `Holat o'zgartirildi: ${oldData.status} → ${updates.status}`,
      currentUser.uid,
      currentUser.name,
      reason || "Holat yangilanishi"
    );
  }

  // Audit
  await logAudit(
    currentUser.uid,
    currentUser.name,
    currentUser.role,
    'UPDATE',
    'EQUIPMENT',
    id,
    `Jihoz ma'lumotlari yangilandi (${id})`
  );
}

export async function softDeleteEquipment(
  id: string,
  currentUser: UserProfile
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.EQUIPMENT, id);
  await updateDoc(docRef, sanitizeForFirestore({ 
    isDeleted: true, 
    updatedAt: new Date().toISOString() 
  }));

  await logAudit(
    currentUser.uid,
    currentUser.name,
    currentUser.role,
    'DELETE',
    'EQUIPMENT',
    id,
    `Jihoz tizimdan (soft-delete) o'chirildi`
  );

  await addEquipmentHistory(
    id,
    "Jihoz hisobdan/ro'yxatdan o'chirildi",
    currentUser.uid,
    currentUser.name
  );
}

export async function transferEquipment(
  equipmentId: string,
  newUserId: string,
  newUserName: string,
  newUserPosition: string,
  transferReason: string,
  currentUser: UserProfile
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.EQUIPMENT, equipmentId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;

  const oldData = snap.data() as Equipment;
  const oldUserName = oldData.currentUserName;

  await updateDoc(docRef, sanitizeForFirestore({
    currentUserId: newUserId,
    currentUserName: newUserName,
    userPosition: newUserPosition,
    updatedAt: new Date().toISOString()
  }));

  await addEquipmentHistory(
    equipmentId,
    `Jihoz boshqa xodimga biriktirildi`,
    currentUser.uid,
    currentUser.name,
    `O'tkazildi: ${oldUserName} → ${newUserName}. Sababi: ${transferReason}`,
    oldUserName,
    newUserName
  );

  await logAudit(
    currentUser.uid,
    currentUser.name,
    currentUser.role,
    'TRANSFER',
    'EQUIPMENT',
    equipmentId,
    `Jihoz biriktiruvi o'zgartirildi: ${oldUserName} -> ${newUserName}`
  );

  await createNotification(
    "Jihoz biriktiruvi o'zgartirildi",
    `${oldData.code} kodli jihoz ${newUserName} xodimiga biriktirildi.`,
    'info',
    newUserId
  );
}

// Fetch Equipment with Filter options
export async function getEquipmentList(
  filters?: EquipmentFilterOptions,
  currentUser?: UserProfile
): Promise<Equipment[]> {
  const eqSnap = await getDocs(collection(db, COLLECTIONS.EQUIPMENT));
  let list = eqSnap.docs.map(doc => doc.data() as Equipment).filter(e => !e.isDeleted);

  // If user is non-admin, default filter to items assigned to user or created by user
  if (currentUser && currentUser.role !== 'admin') {
    list = list.filter(e => e.currentUserId === currentUser.uid || e.createdBy === currentUser.uid);
  }

  if (!filters) return list;

  if (filters.search) {
    const s = filters.search.toLowerCase().trim();
    list = list.filter(e => 
      e.code.toLowerCase().includes(s) ||
      e.name.toLowerCase().includes(s) ||
      e.currentUserName.toLowerCase().includes(s) ||
      (e.brand && e.brand.toLowerCase().includes(s)) ||
      (e.model && e.model.toLowerCase().includes(s)) ||
      (e.serialNumber && e.serialNumber.toLowerCase().includes(s))
    );
  }

  if (filters.typeId) {
    list = list.filter(e => e.typeId === filters.typeId);
  }

  if (filters.status) {
    list = list.filter(e => e.status === filters.status);
  }

  if (filters.departmentId) {
    list = list.filter(e => e.departmentId === filters.departmentId);
  }

  if (filters.userId) {
    list = list.filter(e => e.currentUserId === filters.userId);
  }

  if (filters.manufactureYear) {
    list = list.filter(e => e.manufactureYear === Number(filters.manufactureYear));
  }

  if (filters.isBrokenOnly) {
    list = list.filter(e => e.isBroken || e.status === 'ishdan_chiqqan');
  }

  // Sorting
  if (filters.sortBy === 'oldest') {
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (filters.sortBy === 'code') {
    list.sort((a, b) => a.code.localeCompare(b.code));
  } else if (filters.sortBy === 'year') {
    list.sort((a, b) => b.manufactureYear - a.manufactureYear);
  } else if (filters.sortBy === 'status') {
    list.sort((a, b) => a.status.localeCompare(b.status));
  } else {
    // Default newest
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return list;
}

export async function getEquipmentById(id: string): Promise<Equipment | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.EQUIPMENT, id));
  if (snap.exists()) {
    return snap.data() as Equipment;
  }
  return null;
}

export async function getEquipmentByCode(code: string): Promise<Equipment | null> {
  const q = query(collection(db, COLLECTIONS.EQUIPMENT), where("code", "==", code));
  const snap = await getDocs(q);
  if (!snap.empty) {
    return snap.docs[0].data() as Equipment;
  }
  return null;
}

// FAILURES (NOSOZLIKLAR)
export async function reportEquipmentFailure(
  failureData: Omit<EquipmentFailure, 'id' | 'createdAt'>,
  currentUser: UserProfile
): Promise<EquipmentFailure> {
  const failureRef = doc(collection(db, COLLECTIONS.EQUIPMENT_FAILURES));
  const now = new Date().toISOString();

  const newFailure: EquipmentFailure = {
    ...failureData,
    id: failureRef.id,
    createdAt: now,
    notes: failureData.notes || '',
    images: failureData.images || []
  };

  await setDoc(failureRef, sanitizeForFirestore(newFailure));

  // Update Equipment status to 'ishdan_chiqqan'
  await updateEquipment(
    failureData.equipmentId,
    { 
      status: 'ishdan_chiqqan', 
      isBroken: true 
    },
    currentUser,
    `Nosozlik qayd etildi: ${failureData.failureReason}`
  );

  // Notify admins
  await createNotification(
    "⚠️ Jihoz ishdan chiqdi!",
    `${newFailure.equipmentCode} (${newFailure.equipmentTypeName}) nosoz deb topildi. Sababi: ${newFailure.failureReason}`,
    'danger',
    undefined,
    'admin'
  );

  return newFailure;
}

export async function getFailures(): Promise<EquipmentFailure[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.EQUIPMENT_FAILURES));
  return snap.docs.map(doc => doc.data() as EquipmentFailure);
}

// HISTORY & AUDIT LOGS
export async function getEquipmentHistoryList(equipmentId: string): Promise<EquipmentHistory[]> {
  const q = query(
    collection(db, COLLECTIONS.EQUIPMENT_HISTORY), 
    where("equipmentId", "==", equipmentId)
  );
  const snap = await getDocs(q);
  const items = snap.docs.map(doc => doc.data() as EquipmentHistory);
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return items;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.AUDIT_LOGS));
  const items = snap.docs.map(doc => doc.data() as AuditLog);
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return items;
}

// NOTIFICATIONS
export async function getNotifications(userId?: string, role?: string): Promise<AppNotification[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.NOTIFICATIONS));
  let items = snap.docs.map(doc => doc.data() as AppNotification);

  if (userId || role) {
    items = items.filter(n => 
      (n.userId && n.userId === userId) || 
      (n.targetRole && n.targetRole === role) || 
      (!n.userId && !n.targetRole)
    );
  }

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return items;
}

export async function markNotificationAsRead(id: string) {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id), { isRead: true });
}

// DASHBOARD STATS CALCULATOR
export async function getDashboardStats(currentUser?: UserProfile) {
  const allEquipment = await getEquipmentList(undefined, currentUser);
  const allUsers = await getUsers();

  const total = allEquipment.length;
  const working = allEquipment.filter(e => e.status === 'ishlayapti').length;
  const inUse = allEquipment.filter(e => e.status === 'ishlatilmoqda').length;
  const inRepair = allEquipment.filter(e => e.status === 'tamirda').length;
  const broken = allEquipment.filter(e => e.status === 'ishdan_chiqqan' || e.isBroken).length;
  const writtenOff = allEquipment.filter(e => (e.status as string) === 'hisobdan_chiqarildi' || e.status === 'hisobdan_chiqarilgan').length;
  const inStock = allEquipment.filter(e => e.status === 'omborda').length;
  const newItems = allEquipment.filter(e => e.status === 'yangi').length;

  const assignedToMe = currentUser 
    ? allEquipment.filter(e => e.currentUserId === currentUser.uid).length 
    : 0;

  // Monthly stats
  const monthlyCounts: { [month: string]: number } = {};
  allEquipment.forEach(e => {
    const month = e.createdAt ? e.createdAt.substring(0, 7) : '2026-09';
    monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
  });

  // Type breakdown
  const typeCounts: { [type: string]: number } = {};
  allEquipment.forEach(e => {
    typeCounts[e.typeName] = (typeCounts[e.typeName] || 0) + 1;
  });

  return {
    total,
    working,
    inUse,
    inRepair,
    broken,
    writtenOff,
    inStock,
    newItems,
    assignedToMe,
    userCount: allUsers.length,
    recentEquipment: allEquipment.slice(0, 5),
    monthlyCounts,
    typeCounts
  };
}

// TECH SUPPORT REQUESTS SERVICES
export async function getTechSupportRequests(): Promise<TechSupportRequest[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.TECH_SUPPORT));
    const items = snap.docs.map(doc => doc.data() as TechSupportRequest);
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items;
  } catch (err) {
    console.error("Error fetching tech support requests:", err);
    return [];
  }
}

export async function createTechSupportRequest(
  data: Omit<TechSupportRequest, 'id' | 'createdAt' | 'status'>,
  currentUser: UserProfile
): Promise<TechSupportRequest> {
  const docRef = doc(collection(db, COLLECTIONS.TECH_SUPPORT));
  const now = new Date().toISOString();

  const reqItem: TechSupportRequest = {
    ...data,
    id: docRef.id,
    status: 'yangi',
    createdAt: now
  };

  await setDoc(docRef, sanitizeForFirestore(reqItem));

  // Create notification for admins
  await createNotification(
    "🛠️ Yangi texnik yordam so'rovi!",
    `${currentUser.name} (${data.departmentName || 'Bo\'lim'}) tomonidan so'rov yuborildi: "${data.title}"`,
    'warning',
    undefined,
    'admin'
  );

  return reqItem;
}

export async function updateTechSupportStatus(
  id: string,
  status: 'yangi' | 'jarayonda' | 'bajarildi' | 'rad_etildi',
  assignedTechnician?: string,
  resolutionNotes?: string
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.TECH_SUPPORT, id);
  const now = new Date().toISOString();

  await updateDoc(docRef, sanitizeForFirestore({
    status,
    ...(assignedTechnician !== undefined && { assignedTechnician }),
    ...(resolutionNotes !== undefined && { resolutionNotes }),
    updatedAt: now
  }));
}
