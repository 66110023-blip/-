import React from 'react';
import { useFactory } from '../context/FactoryContext';
import { X, AlertOctagon, Clock, Wrench } from 'lucide-react';

export const AlertHistoryModal: React.FC = () => {
  const {
    showAlertHistoryModal,
    setShowAlertHistoryModal,
    selectedMachineId,
    machines
  } = useFactory();

  if (!showAlertHistoryModal) return null;

  const machine = machines.find((m) => m.id === selectedMachineId) || machines[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full border border-[#cbd5e1] shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
          <div className="flex items-center space-x-2">
            <AlertOctagon className="w-5 h-5 text-[#ef4444]" />
            <h2 className="text-lg font-extrabold text-[#051125]">
              Alert & Downtime History
            </h2>
          </div>
          <button
            onClick={() => setShowAlertHistoryModal(false)}
            className="p-1 rounded-lg text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#051125] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block">
            Target Machine
          </span>
          <p className="font-mono-data font-black text-xl text-[#051125]">
            {machine.name} ({machine.processType})
          </p>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {machine.downtimeHistory.map((dt) => (
            <div
              key={dt.id}
              className="bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded-xl space-y-1"
            >
              <div className="flex items-center justify-between font-mono-data text-xs">
                <span className="text-[#475569] font-medium flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-[#94a3b8]" />
                  <span>{dt.timeRange}</span>
                </span>
                <span className="font-bold text-[#ef4444]">{dt.durationMins} mins</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-sm text-[#051125]">{dt.reason}</span>
                <span className="text-[10px] font-bold text-[#051125] bg-[#e2e8f0] px-2 py-0.5 rounded-xs uppercase">
                  {dt.category}
                </span>
              </div>
            </div>
          ))}

          {machine.downtimeHistory.length === 0 && (
            <p className="text-xs text-[#94a3b8] italic py-4 text-center">
              No historical alerts recorded for this unit.
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-[#f1f5f9]">
          <button
            onClick={() => setShowAlertHistoryModal(false)}
            className="w-full bg-[#051125] hover:bg-[#1e293b] text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
          >
            Close Alert History
          </button>
        </div>
      </div>
    </div>
  );
};
