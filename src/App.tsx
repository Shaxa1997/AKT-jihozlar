import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav, ActiveTab } from './components/common/BottomNav';
import { EquipmentList } from './components/equipment/EquipmentList';
import { EquipmentFormModal } from './components/equipment/EquipmentFormModal';
import { EquipmentDetailModal } from './components/equipment/EquipmentDetailModal';
import { ReportFailureModal } from './components/equipment/ReportFailureModal';
import { TransferModal } from './components/equipment/TransferModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserManagement } from './components/admin/UserManagement';
import { DepartmentManagement } from './components/admin/DepartmentManagement';
import { EquipmentTypeManagement } from './components/admin/EquipmentTypeManagement';
import { AuditLogView } from './components/admin/AuditLogView';
import { ReportsView } from './components/admin/ReportsView';
import { QRScannerModal } from './components/admin/QRScannerModal';
import { UserProfileView } from './components/user/UserProfileView';
import { WarrantyLetterView } from './components/warranty/WarrantyLetterView';
import { TechSupportView } from './components/support/TechSupportView';
import { DetailedStatsView } from './components/stats/DetailedStatsView';
import { Equipment } from './types';
import { 
  Package, 
  CheckCircle2, 
  Wrench, 
  AlertTriangle, 
  PlusCircle, 
  Users, 
  ShieldCheck,
  Building2,
  FileSpreadsheet
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [failureEquipment, setFailureEquipment] = useState<Equipment | null>(null);
  const [transferEquipmentItem, setTransferEquipmentItem] = useState<Equipment | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  const handleTriggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0B0F13] text-slate-900 dark:text-[#E2E8F0] flex flex-col font-sans transition-colors pb-16 lg:pb-0">
      
      {/* Top Header */}
      <Header
        onOpenQRScanner={() => setIsQRScannerOpen(true)}
      />

      {/* Body Layout */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex">
        
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenQRScanner={() => setIsQRScannerOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-5 max-w-full overflow-x-hidden">
          
          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <div className="space-y-4">
              
              {/* High Density Hero Banner Card */}
              <div className="p-4 sm:p-5 rounded-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Platforma Faol • Firestore Realtime
                    </span>
                  </div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#E2E8F0]">
                    Xush kelibsiz, {user?.name || 'Foydalanuvchi'}!
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                    Tashkilot jihozlari inventarizatsiyasi, xodimlarga biriktirish va holat monitoiringi.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm flex items-center gap-1.5 transition-all border border-blue-500/30"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Jihoz Qo'shish</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('equipment')}
                    className="px-3 py-1.5 rounded bg-slate-100 dark:bg-[#161B22] hover:bg-slate-200 dark:hover:bg-[#1F242C] text-slate-700 dark:text-slate-300 font-medium text-xs border border-slate-200 dark:border-[#30363D] transition-colors"
                  >
                    Barcha Jihozlar →
                  </button>
                </div>
              </div>

              {/* Equipment List View */}
              <EquipmentList
                key={refreshKey}
                onSelectEquipment={(eq) => setSelectedEquipment(eq)}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />

            </div>
          )}

          {/* TAB 2: ALL EQUIPMENT */}
          {activeTab === 'equipment' && (
            <EquipmentList
              key={refreshKey}
              onSelectEquipment={(eq) => setSelectedEquipment(eq)}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          )}

          {/* TAB 3: BROKEN EQUIPMENT */}
          {activeTab === 'broken' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  ⚠️ Ishdan Chiqqan va Nosoz Jihozlar
                </h2>
              </div>
              <EquipmentList
                key={refreshKey}
                brokenOnly={true}
                onSelectEquipment={(eq) => setSelectedEquipment(eq)}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && <UserProfileView />}

          {/* NEW TABS */}
          {activeTab === 'warranty' && <WarrantyLetterView />}
          {activeTab === 'support' && <TechSupportView />}
          {activeTab === 'statistics' && <DetailedStatsView />}

          {/* ADMIN TABS */}
          {activeTab === 'admin' && <AdminDashboard />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'departments' && <DepartmentManagement />}
          {activeTab === 'types' && <EquipmentTypeManagement />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'audit' && <AuditLogView />}

        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* MODALS */}
      {/* 1. Add Equipment Form Modal */}
      <EquipmentFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleTriggerRefresh}
      />

      {/* 2. Equipment Detail & Passport Modal */}
      <EquipmentDetailModal
        equipment={selectedEquipment}
        onClose={() => setSelectedEquipment(null)}
        onReportFailure={(eq) => setFailureEquipment(eq)}
        onTransfer={(eq) => setTransferEquipmentItem(eq)}
      />

      {/* 3. Report Failure Modal */}
      <ReportFailureModal
        equipment={failureEquipment}
        onClose={() => setFailureEquipment(null)}
        onSuccess={handleTriggerRefresh}
      />

      {/* 4. Transfer Modal */}
      <TransferModal
        equipment={transferEquipmentItem}
        onClose={() => setTransferEquipmentItem(null)}
        onSuccess={handleTriggerRefresh}
      />

      {/* 5. QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onSelectEquipment={(eq) => setSelectedEquipment(eq)}
      />

    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MainAppContent />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
