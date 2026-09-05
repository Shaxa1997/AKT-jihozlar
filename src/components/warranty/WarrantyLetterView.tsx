import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Search, 
  Printer, 
  ShieldCheck, 
  Calendar, 
  User, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText,
  X,
  ExternalLink,
  Building,
  Award
} from 'lucide-react';
import { Equipment } from '../../types';
import { getEquipmentList } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

export const WarrantyLetterView: React.FC = () => {
  const { user } = useAuth();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'valid' | 'expiring' | 'expired'>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getEquipmentList(undefined, user || undefined);
      setEquipmentList(data);
    } catch (err) {
      console.error("Error loading equipment for warranty:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter equipment with warranty logic
  const filteredEquipment = equipmentList.filter((item) => {
    // Search
    const s = search.toLowerCase();
    const matchesSearch = 
      item.code.toLowerCase().includes(s) ||
      item.name.toLowerCase().includes(s) ||
      item.currentUserName.toLowerCase().includes(s) ||
      (item.typeName && item.typeName.toLowerCase().includes(s));

    if (!matchesSearch) return false;

    // Filter status
    const period = item.warrantyPeriod || '12 oy';
    const isExpired = period.toLowerCase().includes('o\'tgan') || period.toLowerCase().includes('tugagan');
    const isExpiring = period.toLowerCase().includes('1 oy') || period.toLowerCase().includes('yaqin');

    if (filterState === 'valid') return !isExpired;
    if (filterState === 'expired') return isExpired;
    if (filterState === 'expiring') return isExpiring;
    return true;
  });

  const handlePrintDocument = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-blue-800/40">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-blue-400" /> Rasmiy Kafolat Hujjatlari
            </span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">
            📜 Kafolat Xatlari va Kafolat Sertifikatlari
          </h1>
          <p className="text-xs text-blue-200 max-w-xl leading-relaxed">
            Tashkilot jihozlari va aparaturalarining kafolat xatlarini shakllantirish, ko'rish, chop etish va kafolat muddatlarini monitoring qilish.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
            <div className="text-lg font-black font-mono text-white">{equipmentList.length}</div>
            <div className="text-[10px] text-blue-200">Jami Kafolatlar</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-3 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-[#1E293B] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidiruv: kod, nom, xodim, tur..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] outline-none focus:border-blue-500 text-slate-900 dark:text-[#E2E8F0]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0">
          <button
            onClick={() => setFilterState('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              filterState === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Barcha kafolatlar
          </button>
          <button
            onClick={() => setFilterState('valid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              filterState === 'valid'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Amaldagi kafolat
          </button>
          <button
            onClick={() => setFilterState('expiring')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              filterState === 'expiring'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Muddati tugayotgan
          </button>
        </div>
      </div>

      {/* Equipment Warranty Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredEquipment.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-2">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Kafolat xati topilmadi</h3>
          <p className="text-xs text-slate-500 font-mono">Qidiruv parametrlarini o'zgartirib ko'ring.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredEquipment.map((item) => (
            <div 
              key={item.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    {item.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <Award className="w-3 h-3" /> Kafolat: {item.warrantyPeriod || '12 oy'}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {item.brand} {item.model} • Yil: {item.manufactureYear}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1 text-slate-500"><User className="w-3 h-3" /> Mas'ul xodim:</span>
                    <strong className="font-semibold text-slate-800 dark:text-slate-100">{item.currentUserName}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1 text-slate-500"><Building className="w-3 h-3" /> Bo'lim:</span>
                    <span>{item.departmentName || 'Bo\'lim ko\'rsatilmadi'}</span>
                  </div>
                  {item.serialNumber && (
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-slate-500">Seriya SN:</span>
                      <span className="font-mono text-[11px] font-semibold">{item.serialNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedEquipment(item)}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <FileCheck className="w-4 h-4" />
                <span>Kafolat Xatini Ko'rish / Chop Etish</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Official Warranty Document Modal */}
      {selectedEquipment && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-bold">Rasmiy Kafolat Xati Hujjati</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintDocument}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow hover:bg-blue-700"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Chop etish</span>
                </button>
                <button
                  onClick={() => setSelectedEquipment(null)}
                  className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 font-serif bg-white text-slate-900 print:p-0 print:m-0" id="printableWarrantyDoc">
              
              {/* Document Letterhead Header */}
              <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                <div className="text-xs font-sans font-bold uppercase tracking-widest text-slate-500">
                  O'ZBEKISTON RESPUBLIKASI TASHKILOTI
                </div>
                <h1 className="text-lg font-extrabold uppercase tracking-tight text-slate-900 font-sans">
                  TASHKILOT IT VA APARATURA BO'LIMI
                </h1>
                <p className="text-[11px] font-sans text-slate-600">
                  Manzil: Markaziy Bino, Toshkent s. • Tel: +998 71 200 00 00
                </p>
              </div>

              {/* Document Ref & Title */}
              <div className="flex items-center justify-between text-xs font-sans font-mono border-b border-slate-200 pb-3">
                <div>Kafolat No: <strong className="font-bold">{selectedEquipment.code}-KF</strong></div>
                <div>Sana: <strong>{new Date().toLocaleDateString('uz-UZ')}</strong></div>
              </div>

              <div className="text-center py-2">
                <h2 className="text-xl font-black tracking-wider uppercase underline decoration-2 underline-offset-4 text-slate-900 font-sans">
                  KAFOLAT XATI
                </h2>
                <span className="text-xs text-slate-500 font-sans font-medium">GUARANTEE & WARRANTY CERTIFICATE</span>
              </div>

              {/* Main Legal / Warranty Content */}
              <div className="text-sm leading-relaxed space-y-4 text-slate-800">
                <p>
                  Ushbu kafolat xati bilan <strong>Tashkilot Texnik Administratsiyasi</strong> ushbu jihozning texnik jihatdan soz holatda ekanligini hamda belgilangan kafolat muddati davomida uning uzluksiz va xavfsiz ishlashi kafolatlanishini tasdiqlaydi.
                </p>

                {/* Equipment Specification Box */}
                <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 font-sans text-xs space-y-2">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 text-sm flex items-center justify-between">
                    <span>Jihoz ko'rsatkichlari:</span>
                    <span className="text-blue-700 font-mono">{selectedEquipment.code}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>Jihoz nomi:</strong> {selectedEquipment.name}</div>
                    <div><strong>Jihoz turi:</strong> {selectedEquipment.typeName}</div>
                    <div><strong>Brend/Model:</strong> {selectedEquipment.brand || 'Standart'} {selectedEquipment.model || ''}</div>
                    <div><strong>Seriya raqami:</strong> {selectedEquipment.serialNumber || 'SN-MAVJUD_EMAS'}</div>
                    <div><strong>Ishlab chiqarilgan yili:</strong> {selectedEquipment.manufactureYear} y.</div>
                    <div><strong>Inventar raqami:</strong> {selectedEquipment.inventoryNumber || selectedEquipment.code}</div>
                  </div>
                </div>

                {/* Assigned Person */}
                <div className="p-3 rounded-xl border border-slate-200 bg-blue-50/50 font-sans text-xs space-y-1">
                  <div className="text-slate-600">Javobgar va Mas'ul xodim:</div>
                  <div className="text-sm font-bold text-slate-900">{selectedEquipment.currentUserName}</div>
                  <div className="text-slate-600">Bo'lim: {selectedEquipment.departmentName || 'Bosh bo\'lim'}</div>
                </div>

                <div className="space-y-2 text-xs text-slate-700 font-sans">
                  <h4 className="font-bold text-slate-900">Kafolat shartlari va qoidalari:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Kafolat muddati: <strong>{selectedEquipment.warrantyPeriod || '12 oy'}</strong> (biriktirilgan sanadan e'tiboran).</li>
                    <li>Kafolat davomida kelib chiqqan barcha texnik nosozliklar IT bo'limi tomonidan bepul bartaraf etiladi.</li>
                    <li>Jihozni uchinchi shaxslarga ruxsatsiz berish yoki texnik muhri/plombasini buzish taqiqlanadi.</li>
                  </ul>
                </div>
              </div>

              {/* Signature Block */}
              <div className="pt-8 border-t border-slate-300 font-sans flex items-end justify-between">
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-800">
                    Bosh Administrator / IT Mas'ul:
                  </div>
                  <div className="h-12 border-b border-slate-400 w-48 flex items-end pb-1 text-xs text-slate-600 italic">
                    {selectedEquipment.signedBy || 'Shaxzodbek Xolmatov'}
                  </div>
                  <div className="text-[10px] text-slate-500">Imzo va F.I.Sh</div>
                </div>

                {/* Circular Official Seal Placeholder */}
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-blue-600/60 flex flex-col items-center justify-center text-center p-1 text-blue-700/80 font-bold text-[9px] rotate-[-12deg] select-none">
                  <span>O'ZBEKISTON RESPUBLIKASI</span>
                  <span className="text-[8px] my-0.5">TASHKILOT MUHRI</span>
                  <span>[ MUHR UCHUN ]</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
              <button
                onClick={() => setSelectedEquipment(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-300"
              >
                Yopish
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
