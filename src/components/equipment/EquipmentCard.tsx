import React from 'react';
import { Package, User, Calendar, MapPin, ChevronRight, AlertCircle, CheckCircle2, Wrench, ShieldAlert } from 'lucide-react';
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Ishlayapti
          </span>
        );
      case 'tamirda':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Wrench className="w-3 h-3" /> Ta'mirda
          </span>
        );
      case 'ishdan_chiqqan':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-3 h-3" /> Ishdan chiqqan
          </span>
        );
      case 'yangi':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Yangi
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 capitalize">
            {status.replace('_', ' ')}
          </span>
        );
    }
  };

  const mainPhoto = equipment.mainImageUrl || (equipment.images && equipment.images[0]?.url);

  return (
    <div
      onClick={onClick}
      className="group relative bg-white dark:bg-[#161B22] rounded-lg border border-slate-200 dark:border-[#30363D] overflow-hidden shadow-sm hover:border-blue-500 transition-all cursor-pointer flex flex-col"
    >
      {/* Photo Header */}
      <div className="relative h-36 w-full bg-slate-100 dark:bg-[#0B0F13] overflow-hidden flex items-center justify-center border-b border-slate-200 dark:border-[#30363D]">
        {mainPhoto ? (
          <img
            src={mainPhoto}
            alt={equipment.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 gap-1">
            <Package className="w-8 h-8 stroke-[1.5]" />
            <span className="text-[10px] font-mono">No Image</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-white text-[10px] font-mono font-semibold tracking-wider border border-white/10">
            {equipment.code}
          </span>
          {getStatusBadge(equipment.status)}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          <div className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-0.5 font-mono">
            {equipment.typeName}
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-[#E2E8F0] line-clamp-1 group-hover:text-blue-500 transition-colors">
            {equipment.name}
          </h3>
          {(equipment.brand || equipment.model) && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
              {equipment.brand} {equipment.model}
            </p>
          )}
        </div>

        {/* User & Location Info */}
        <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-[#1E293B] text-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 text-[11px]">
            <span className="flex items-center gap-1.5 truncate">
              <User className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{equipment.currentUserName}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono shrink-0">
              {equipment.manufactureYear}y.
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{equipment.departmentName || equipment.locationRoom || 'Xona yo\'q'}</span>
            </span>
            <span className="flex items-center gap-0.5 text-blue-500 font-medium text-[10px]">
              Batafsil <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
