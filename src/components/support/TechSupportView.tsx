import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  User, 
  Building, 
  Phone, 
  MessageSquare, 
  Send, 
  X, 
  Check, 
  Sparkles,
  ShieldCheck,
  Package
} from 'lucide-react';
import { TechSupportRequest, Equipment } from '../../types';
import { 
  getTechSupportRequests, 
  createTechSupportRequest, 
  updateTechSupportStatus, 
  getEquipmentList 
} from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const TechSupportView: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [requests, setRequests] = useState<TechSupportRequest[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedEqId, setSelectedEqId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'past' | 'orta' | 'yuqori' | 'shoshilinch'>('orta');
  const [roomNumber, setRoomNumber] = useState('');
  const [applicantPhone, setApplicantPhone] = useState(user?.phone || '');

  // Tech Response Modal
  const [editingRequest, setEditingRequest] = useState<TechSupportRequest | null>(null);
  const [techStatus, setTechStatus] = useState<'yangi' | 'jarayonda' | 'bajarildi' | 'rad_etildi'>('jarayonda');
  const [assignedTech, setAssignedTech] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqData, eqData] = await Promise.all([
        getTechSupportRequests(),
        getEquipmentList(undefined, user || undefined)
      ]);
      setRequests(reqData);
      setEquipmentList(eqData);
    } catch (err) {
      console.error("Error loading tech support data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast("Mavzu va muammo tavsifini kiriting", "warning");
      return;
    }

    if (!user) {
      showToast("Tizimga kirishingiz lozim", "danger");
      return;
    }

    setSubmitting(true);
    try {
      const selectedEq = equipmentList.find(e => e.id === selectedEqId);

      await createTechSupportRequest(
        {
          applicantId: user.uid,
          applicantName: user.name,
          applicantPhone: applicantPhone || user.phone || '',
          departmentName: user.departmentName || 'Bo\'lim',
          equipmentId: selectedEq?.id,
          equipmentCode: selectedEq?.code,
          equipmentName: selectedEq?.name,
          title: title.trim(),
          description: description.trim(),
          priority,
          roomNumber: roomNumber.trim()
        },
        user
      );

      showToast("Texnik yordam so'rovi yuborildi! Tehnik tez orada bog'lanadi.", "success");
      setIsModalOpen(false);
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedEqId('');
      setRoomNumber('');
      loadData();
    } catch (err) {
      console.error("Error creating tech support request:", err);
      showToast("Xatolik yuz berdi", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!editingRequest) return;
    try {
      await updateTechSupportStatus(
        editingRequest.id,
        techStatus,
        assignedTech || user?.name,
        resolutionNotes
      );
      showToast("So'rov holati yangilandi", "success");
      setEditingRequest(null);
      loadData();
    } catch (err) {
      console.error("Error updating status:", err);
      showToast("Xatolik yuz berdi", "danger");
    }
  };

  // Filtered requests
  const filteredRequests = requests.filter(r => {
    const s = search.toLowerCase();
    const matchesSearch = 
      r.title.toLowerCase().includes(s) ||
      r.applicantName.toLowerCase().includes(s) ||
      (r.equipmentCode && r.equipmentCode.toLowerCase().includes(s)) ||
      (r.equipmentName && r.equipmentName.toLowerCase().includes(s));

    if (!matchesSearch) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  // Stats
  const totalCount = requests.length;
  const newCount = requests.filter(r => r.status === 'yangi').length;
  const progressCount = requests.filter(r => r.status === 'jarayonda').length;
  const resolvedCount = requests.filter(r => r.status === 'bajarildi').length;

  return (
    <div className="space-y-5">
      
      {/* Top Banner Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-indigo-800/40">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
              <Wrench className="w-3 h-3 text-indigo-400" /> IT Helpdesk & Servis Hizmati
            </span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">
            🛠️ Texnik Yordam Ko'rsatish
          </h1>
          <p className="text-xs text-indigo-200 max-w-xl leading-relaxed">
            Kompyuterlar, tarmoq, printer va boshqa jihozlardagi nosozliklar bo'yicha IT mutaxassislariga tezkor so'rov yuborish va bajarilish holatini kuzatish.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all shrink-0 active:scale-95 border border-white/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Yangi So'rov Yuborish</span>
        </button>
      </div>

      {/* Numerical Stats Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 font-bold">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black font-mono text-slate-900 dark:text-white">{totalCount}</div>
            <div className="text-[10px] font-medium text-slate-500">Jami So'rovlar</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-blue-200 dark:border-blue-900/50 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black font-mono text-blue-600 dark:text-blue-400">{newCount}</div>
            <div className="text-[10px] font-medium text-slate-500">Yangi So'rovlar</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-amber-200 dark:border-amber-900/50 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">{progressCount}</div>
            <div className="text-[10px] font-medium text-slate-500">Jarayonda</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-emerald-200 dark:border-emerald-900/50 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">{resolvedCount}</div>
            <div className="text-[10px] font-medium text-slate-500">Bajarildi</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-[#1E293B] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="So'rov, xodim yoki jihoz kodi qidirish..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] outline-none focus:border-blue-500 text-slate-900 dark:text-[#E2E8F0]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Barchasi
          </button>
          <button
            onClick={() => setFilterStatus('yangi')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              filterStatus === 'yangi'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Yangi ({newCount})
          </button>
          <button
            onClick={() => setFilterStatus('jarayonda')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              filterStatus === 'jarayonda'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Jarayonda ({progressCount})
          </button>
          <button
            onClick={() => setFilterStatus('bajarildi')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              filterStatus === 'bajarildi'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Bajarildi ({resolvedCount})
          </button>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-2">
          <Wrench className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Texnik yordam so'rovi mavjud emas</h3>
          <p className="text-xs text-slate-500">Yuqoridagi "Yangi So'rov Yuborish" tugmasini bosib IT bo'limiga murojaat qilishingiz mumkin.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => {
            const isNew = req.status === 'yangi';
            const isInProgress = req.status === 'jarayonda';
            const isResolved = req.status === 'bajarildi';
            const isRejected = req.status === 'rad_etildi';

            return (
              <div 
                key={req.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status badge */}
                    {isNew && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Yangi So'rov
                      </span>
                    )}
                    {isInProgress && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 animate-spin" /> Jarayonda
                      </span>
                    )}
                    {isResolved && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Bajarildi
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Rad etildi
                      </span>
                    )}

                    {/* Priority */}
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${
                      req.priority === 'shoshilinch' ? 'bg-rose-500 text-white font-bold animate-bounce' :
                      req.priority === 'yuqori' ? 'bg-amber-500 text-white' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      Shoshilinchlik: {req.priority.toUpperCase()}
                    </span>

                    {req.equipmentCode && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {req.equipmentCode} - {req.equipmentName}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {req.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{req.description}"
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> <strong>{req.applicantName}</strong></span>
                    <span className="flex items-center gap-1"><Building className="w-3 h-3" /> {req.departmentName}</span>
                    {req.roomNumber && <span>Xona: {req.roomNumber}</span>}
                    {req.applicantPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {req.applicantPhone}</span>}
                    <span className="font-mono text-[10px] text-slate-400">{new Date(req.createdAt).toLocaleString('uz-UZ')}</span>
                  </div>

                  {req.resolutionNotes && (
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200">
                      <strong>IT Xulosasi:</strong> {req.resolutionNotes} ({req.assignedTechnician})
                    </div>
                  )}
                </div>

                {/* Admin/Specialist Action Button */}
                {user?.role === 'admin' && (
                  <button
                    onClick={() => {
                      setEditingRequest(req);
                      setTechStatus(req.status);
                      setAssignedTech(req.assignedTechnician || user.name);
                      setResolutionNotes(req.resolutionNotes || '');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
                  >
                    <Wrench className="w-3.5 h-3.5 text-blue-500" />
                    <span>Holatni boshqarish</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Tech Support Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
            
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Texnik Yordam So'rovi Yuborish</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-600 dark:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-5 space-y-4">
              
              {/* Equipment Select */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Jihozni tanlang (Ixtiyoriy):
                </label>
                <select
                  value={selectedEqId}
                  onChange={(e) => setSelectedEqId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] text-xs font-medium outline-none focus:border-blue-500"
                >
                  <option value="">-- Umumiy muammo / Jihoz biriktirilmagan --</option>
                  {equipmentList.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.code} - {eq.name} ({eq.typeName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Muammo sarlavhasi <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masalan: Monitor yonmayapti, Printer ulanmayapti"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] text-xs outline-none focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Muammo batafsil tavsifi <span className="text-rose-500">*</span>:
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Qanday nosozlik yuz berdi va qachon boshlandi?"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] text-xs outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Urgency & Room */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Muhimlik darajasi:
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] text-xs outline-none focus:border-blue-500"
                  >
                    <option value="past">Past</option>
                    <option value="orta">O'rta (Odatdiy)</option>
                    <option value="yuqori">Yuqori</option>
                    <option value="shoshilinch">🚨 Shoshilinch</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Xona raqami:
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="Masalan: 204-xona"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Telefon raqamingiz:
                </label>
                <input
                  type="text"
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] text-xs outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Yuborilmoqda...' : 'Yuborish'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Admin Status Management Modal */}
      {editingRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">IT Servis Boshqaruvi</h3>
              <button onClick={() => setEditingRequest(null)} className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Holatni tanglang:</label>
                <select
                  value={techStatus}
                  onChange={(e) => setTechStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] text-xs font-bold outline-none"
                >
                  <option value="yangi">Yangi So'rov</option>
                  <option value="jarayonda">⚙️ Jarayonda (Aralashildi)</option>
                  <option value="bajarildi">✅ Bajarildi (Tuzatildi)</option>
                  <option value="rad_etildi">❌ Rad etildi</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Biriktirilgan IT Mutaxassis:</label>
                <input
                  type="text"
                  value={assignedTech}
                  onChange={(e) => setAssignedTech(e.target.value)}
                  placeholder="Xodim F.I.Sh"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Bajarilgan ish / Xulosa:</label>
                <textarea
                  rows={2}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Masalan: Kabel almashtirildi, drayver yangilandi."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] text-xs outline-none resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setEditingRequest(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  Saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
