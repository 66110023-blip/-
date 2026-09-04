import React from 'react';
import { Header } from './Header';
import { useFactory } from '../context/FactoryContext';
import { Activity, ShieldAlert, Cpu, Award } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { machines, ovenUnits, chartsData, navigate } = useFactory();

  const totalMachines = machines.length;
  const runningMachines = machines.filter((m) => m.status === 'RUNNING').length;
  const stoppedMachines = machines.filter((m) => m.status === 'STOP' || m.status === 'JAM_CLEAR').length;

  const avgOee = (
    machines
      .filter((m) => m.oeePercent && m.oeePercent > 0)
      .reduce((acc, m) => acc + (m.oeePercent || 0), 0) / (machines.length || 1)
  ).toFixed(1);

  const totalOutput = machines.reduce((acc, m) => acc + m.outputCount, 0);

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header title="Analytics & Reports" />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-5">
        {/* KPI Cards Summary */}
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-[#cbd5e1] p-3.5 shadow-2xs">
            <div className="flex items-center space-x-2 text-[#475569] mb-1">
              <Award className="w-4 h-4 text-[#10b981]" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Average OEE</span>
            </div>
            <span className="font-mono-data font-black text-3xl text-[#051125]">
              {avgOee}%
            </span>
          </div>

          <div className="bg-white rounded-xl border border-[#cbd5e1] p-3.5 shadow-2xs">
            <div className="flex items-center space-x-2 text-[#475569] mb-1">
              <Activity className="w-4 h-4 text-[#2563eb]" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Total Output</span>
            </div>
            <span className="font-mono-data font-black text-3xl text-[#051125]">
              {totalOutput.toLocaleString()}
            </span>
          </div>
        </section>

        {/* Machine Status Allocation */}
        <section className="bg-white rounded-xl border border-[#cbd5e1] p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2">
            <h3 className="text-xs font-bold text-[#1e293b] tracking-wider uppercase">
              Line Operational Health
            </h3>
            <span className="font-mono-data text-xs font-bold text-[#051125]">
              {runningMachines}/{totalMachines} Active
            </span>
          </div>

          <div className="flex h-3 rounded-full overflow-hidden bg-[#e2e8f0]">
            <div
              style={{ width: `${(runningMachines / totalMachines) * 100}%` }}
              className="bg-[#10b981] transition-all duration-300"
            />
            <div
              style={{ width: `${(stoppedMachines / totalMachines) * 100}%` }}
              className="bg-[#ef4444] transition-all duration-300"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-semibold pt-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <span>Running ({runningMachines})</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
              <span>Stopped ({stoppedMachines})</span>
            </div>
          </div>
        </section>

        {/* Glue Expiry Tracker (Dispensing Nodes) */}
        <section className="bg-white rounded-xl border border-[#cbd5e1] p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-[#ea580c]" />
              <h3 className="text-xs font-bold text-[#1e293b] tracking-wider uppercase">
                Glue Expiry Monitor
              </h3>
            </div>
            <span className="text-[10px] font-bold text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded-xs">
              LIVE
            </span>
          </div>

          <div className="space-y-2.5">
            {machines
              .filter((m) => m.glueInfo)
              .map((m) => (
                <div
                  key={m.id}
                  onClick={() => navigate('machine-detail', m.id)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#051125] cursor-pointer transition-all"
                >
                  <div className="flex items-center space-x-2.5">
                    <Cpu className="w-4 h-4 text-[#051125]" />
                    <div>
                      <span className="font-mono-data font-bold text-sm text-[#051125] block">
                        {m.name} ({m.processType})
                      </span>
                      <span className="text-[11px] font-mono-data text-[#64748b]">
                        Glue: {m.glueInfo?.glueType} | Exp: {m.glueInfo?.expiryTime}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono-data font-bold text-xs text-[#051125] block">
                      {m.glueInfo?.remainingMins} mins
                    </span>
                    <span className="text-[10px] text-[#16a34a] font-semibold">In Spec</span>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Oven Process Units Status Summary */}
        <section className="bg-white rounded-xl border border-[#cbd5e1] p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2">
            <h3 className="text-xs font-bold text-[#1e293b] tracking-wider uppercase">
              Oven Units Status (Vacuum & Bake)
            </h3>
            <button
              onClick={() => navigate('oven-selection')}
              className="text-xs font-bold text-[#2563eb] hover:underline"
            >
              View Node
            </button>
          </div>

          <div className="space-y-2">
            {ovenUnits.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-2 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      u.status === 'RUNNING' ? 'bg-[#10b981]' : 'bg-[#eab308]'
                    }`}
                  />
                  <span className="font-bold text-[#051125]">{u.name}</span>
                  <span className="text-[10px] font-mono-data text-[#64748b]">({u.subType})</span>
                </div>

                <div className="flex items-center space-x-3 font-mono-data">
                  <span className="text-[#051125] font-semibold">{u.tempCelsius.toFixed(1)}°C</span>
                  <span className="font-bold text-[#051125]">{u.runningModel}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
