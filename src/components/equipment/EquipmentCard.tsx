import React from 'react';
import { Package, User, MapPin, ChevronRight, CheckCircle2, Wrench, ShieldAlert, Sparkles, Hash } from 'lucide-react';
import { Equipment } from '../../types';

interface EquipmentCardProps {
  equipment: Equipment;
  onClick: () => void;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, onClick }) => {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ishlayapti':
      case 'ishlatilmoqda':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ishlayapti
          </span>
        );
      case 'tamirda':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 backdrop-blur-md shadow-sm">
            <Wrench className="w-3 h-3" /> Ta'mirda
          </span>
        );
      case 'ishdan_chiqqan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 backdrop-blur-md shadow-sm">
            <ShieldAlert className="w-3 h-3" /> Nosoz
          </span>
        );
      case 'yangi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 backdrop-blur-md shadow-sm">
            <Sparkles className="w-3 h-3" /> Yangi
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800/80 text-slate-300 border border-slate-700 backdrop-blur-md capitalize">
            {status.replace('_', ' ')}
          </span>
        );
    }
  };

  const mainPhoto = equipment.mainImageUrl || (equipment.images && equipment.images[0]?.url);

  return (
    <div
      onClick={onClick}
      className="group relative bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-[#1E293B] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      {/* Top Image Box */}
      <div className="relative h-40 w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#0B0F13] dark:to-[#161B22] overflow-hidden flex items-center justify-center border-b border-slate-100 dark:border-[#1E293B]">
        {mainPhoto ? (
          <img
            src={mainPhoto}
            alt={equipment.name}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-1.5 p-4 text-center">
            <div className="w-10 h-10 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500">
              <Package className="w-5 h-5 stroke-[1.75]" />
            </div>
            <span className="text-[10px] font-mono tracking-wider font-semibold">Rasm biriktirilmagan</span>
          </div>
        )}

        {/* Gradient overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-mono font-black tracking-wider border border-white/20 shadow-md flex items-center gap-1">
            <Hash className="w-3 h-3 text-blue-400" /> {equipment.code}
          </span>
          {getStatusBadge(equipment.status)}
        </div>

        {/* Bottom Tag over image */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] font-bold drop-shadow z-10 pointer-events-none">
          <span className="px-2 py-0.5 rounded-lg bg-blue-600/90 backdrop-blur-md text-[10px] font-mono text-white shadow-sm border border-blue-400/30">
            {equipment.typeName || 'Jihoz'}
          </span>
          <span className="text-[10px] font-mono text-slate-200 bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-sm">
            Yil: {equipment.manufactureYear}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {equipment.name}
          </h3>
          {(equipment.brand || equipment.model) && (
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
              {equipment.brand} {equipment.model}
            </p>
          )}
        </div>

        {/* Details List */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 text-[11px]">
            <span className="flex items-center gap-1.5 truncate font-medium">
              <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <User className="w-3 h-3" />
              </div>
              <span className="truncate">{equipment.currentUserName || 'Biriktirilmagan'}</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 truncate">
              <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                <MapPin className="w-3 h-3" />
              </div>
              <span className="truncate">{equipment.departmentName || equipment.locationRoom || 'Xona ko\'rsatilmagan'}</span>
            </span>

            <span className="inline-flex items-center gap-0.5 font-bold text-blue-600 dark:text-blue-400 text-[11px] group-hover:translate-x-1 transition-transform shrink-0">
              Ko'rish <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
