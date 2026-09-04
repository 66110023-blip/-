import React from 'react';
import { ProductionLine } from '../types';

interface CADVectorBlueprintProps {
  selectedLine?: ProductionLine;
  showGrid?: boolean;
  showDimensions?: boolean;
  showLabels?: boolean;
}

export const CADVectorBlueprint: React.FC<CADVectorBlueprintProps> = ({
  selectedLine = 'ALL',
  showGrid = true,
  showDimensions = true,
  showLabels = true,
}) => {
  return (
    <svg
      viewBox="0 0 1600 1000"
      className="w-full h-full select-none"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* CAD Blueprint grid patterns */}
        <pattern id="cad-small-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
        </pattern>
        <pattern id="cad-grid" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#cad-small-grid)" />
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#cbd5e1" strokeWidth="1" />
        </pattern>

        {/* Diagonal architectural wall hatch */}
        <pattern id="wall-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#64748b" strokeWidth="1.5" />
        </pattern>

        {/* Machine Conveyor roller pattern */}
        <pattern id="conveyor-rollers" width="10" height="20" patternUnits="userSpaceOnUse">
          <line x1="5" y1="0" x2="5" y2="20" stroke="#94a3b8" strokeWidth="1" />
          <line x1="0" y1="0" x2="10" y2="0" stroke="#64748b" strokeWidth="1" />
          <line x1="0" y1="20" x2="10" y2="20" stroke="#64748b" strokeWidth="1" />
        </pattern>

        {/* Cleanroom grating pattern */}
        <pattern id="cleanroom-floor" width="15" height="15" patternUnits="userSpaceOnUse">
          <rect width="15" height="15" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.5" />
          <circle cx="7.5" cy="7.5" r="1.5" fill="#cbd5e1" />
        </pattern>

        {/* CAD Dimension Arrow Markers */}
        <marker id="arrow-left" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 9 2 L 1 5 L 9 8 z" fill="#475569" />
        </marker>
        <marker id="arrow-right" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 1 2 L 9 5 L 1 8 z" fill="#475569" />
        </marker>
      </defs>

      {/* Background CAD Canvas */}
      <rect width="1600" height="1000" fill="#ffffff" />
      {showGrid && <rect width="1600" height="1000" fill="url(#cad-grid)" opacity="0.65" />}

      {/* Grid Coordinates (A-P on X-axis, 01-10 on Y-axis) */}
      <g className="font-mono text-[9px] fill-[#64748b] font-medium select-none" opacity="0.7">
        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S'].map((col, i) => (
          <text key={col} x={100 * i + 50} y={18} textAnchor="middle">{col}</text>
        ))}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row, i) => (
          <text key={row} x={15} y={100 * i + 55} textAnchor="middle">{row.toString().padStart(2, '0')}</text>
        ))}
      </g>

      {/* ================= ARCHITECTURAL BOUNDARIES & WALLS ================= */}
      {/* Outer Factory Perimeter Walls (Thick double lines with hatch) */}
      <g stroke="#1e293b" strokeWidth="2.5" fill="none">
        {/* Main Floor Perimeter */}
        <path d="M 80 80 L 1520 80 L 1520 920 L 80 920 Z" />
        
        {/* Wall Hatching Fill */}
        <rect x="72" y="72" width="1456" height="12" fill="url(#wall-hatch)" stroke="#1e293b" strokeWidth="1.5" />
        <rect x="72" y="916" width="1456" height="12" fill="url(#wall-hatch)" stroke="#1e293b" strokeWidth="1.5" />
        <rect x="72" y="72" width="12" height="856" fill="url(#wall-hatch)" stroke="#1e293b" strokeWidth="1.5" />
        <rect x="1516" y="72" width="12" height="856" fill="url(#wall-hatch)" stroke="#1e293b" strokeWidth="1.5" />
      </g>

      {/* Structural I-Beam Columns across the factory floor */}
      <g fill="#334155" stroke="#0f172a" strokeWidth="1">
        {[250, 500, 750, 1000, 1250].flatMap((cx) =>
          [200, 450, 700, 850].map((cy) => (
            <g key={`col-${cx}-${cy}`} transform={`translate(${cx - 8}, ${cy - 8})`}>
              <rect width="16" height="16" fill="#475569" />
              <path d="M 0 0 L 16 0 M 0 16 L 16 16 M 8 0 L 8 16" stroke="#0f172a" strokeWidth="2" />
            </g>
          ))
        )}
      </g>

      {/* ================= NORTH ROOMS & ANCILLARY ZONES ================= */}
      {/* Board Cleaning Room & FCB Router (Top-Left) */}
      <g stroke="#334155" strokeWidth="1.5" fill="#f8fafc">
        <rect x="100" y="95" width="220" height="110" />
        <text x="110" y="120" className="font-mono text-[11px] font-bold fill-[#1e293b]">FCB ROUTER & CLEANING</text>
        <rect x="115" y="130" width="80" height="60" fill="#f1f5f9" stroke="#64748b" strokeDasharray="3 3" />
        <rect x="210" y="130" width="90" height="60" fill="#f1f5f9" stroke="#64748b" strokeDasharray="3 3" />
        <text x="155" y="165" textAnchor="middle" className="font-mono text-[9px] fill-[#64748b]">FCB Machine</text>
        <text x="255" y="165" textAnchor="middle" className="font-mono text-[9px] fill-[#64748b]">Dry Cabinet</text>
      </g>

      {/* Nitrogen Supply & Utility Headers (Top Center) */}
      <g stroke="#475569" strokeWidth="1.2" fill="#f8fafc">
        <rect x="420" y="95" width="560" height="45" />
        <line x1="420" y1="115" x2="980" y2="115" stroke="#0284c7" strokeWidth="2" strokeDasharray="6 4" />
        <text x="700" y="110" textAnchor="middle" className="font-mono text-[10px] font-bold fill-[#0369a1]">
          HIGH-PURITY N2 & CDA MAIN SUPPLY MANIFOLD (6.2 BAR)
        </text>
        <text x="700" y="130" textAnchor="middle" className="font-mono text-[8.5px] fill-[#64748b]">
          EXHAUST DUCTING • CLEANROOM AIR FLOW STAGE IV
        </text>
      </g>

      {/* East Wing Rooms: Sorting Tray & Transport staging & Shelf racks */}
      <g stroke="#334155" strokeWidth="1.5" fill="#f8fafc">
        {/* East Partition Wall */}
        <line x1="1200" y1="95" x2="1200" y2="905" stroke="#1e293b" strokeWidth="2.5" />
        <rect x="1200" y="95" width="300" height="150" />
        <text x="1220" y="125" className="font-mono text-[11px] font-bold fill-[#1e293b]">SMT FEEDER PREPARATION</text>
        <rect x="1220" y="140" width="120" height="85" fill="#f1f5f9" />
        <rect x="1360" y="140" width="120" height="85" fill="#f1f5f9" />
        <text x="1280" y="185" textAnchor="middle" className="font-mono text-[9px] fill-[#64748b]">Reel Splicer</text>
        <text x="1420" y="185" textAnchor="middle" className="font-mono text-[9px] fill-[#64748b]">Parts Feeder Storage</text>

        {/* Central East Matrix: Sorting Tray Area */}
        <rect x="1220" y="270" width="260" height="280" fill="url(#cleanroom-floor)" stroke="#64748b" />
        <text x="1235" y="295" className="font-mono text-[11px] font-bold fill-[#7e22ce]">
          SORTING TRAY MATRIX & BUFFER
        </text>
        <text x="1235" y="312" className="font-mono text-[8.5px] fill-[#64748b]">
          Capacity: 4500 Units/hr • Auto Bin Matrix
        </text>
        
        {/* Tray grid boxes */}
        {Array.from({ length: 5 }).map((_, r) => (
          Array.from({ length: 4 }).map((_, c) => (
            <rect
              key={`tray-${r}-${c}`}
              x={1240 + c * 55}
              y={325 + r * 42}
              width="45"
              height="32"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1"
              rx="2"
            />
          ))
        ))}

        {/* Transport Reg & High-Bay AGV Terminal */}
        <rect x="1220" y="580" width="260" height="300" fill="#f8fafc" stroke="#64748b" />
        <text x="1235" y="605" className="font-mono text-[11px] font-bold fill-[#0369a1]">
          TRANSPORT REGION & AGV DOCK
        </text>
        <text x="1235" y="622" className="font-mono text-[8.5px] fill-[#64748b]">
          AGV Fleet Autonomous Docking • Palletizing Bay
        </text>
        
        {/* AGV Path Lines */}
        <path d="M 1250 650 L 1430 650 L 1430 840 L 1250 840 Z" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="5 5" />
        <circle cx="1250" cy="650" r="12" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
        <circle cx="1430" cy="650" r="12" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
        <circle cx="1430" cy="840" r="12" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
        <circle cx="1250" cy="840" r="12" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
        <text x="1340" y="750" textAnchor="middle" className="font-mono text-[10px] font-bold fill-[#0284c7]">AGV RUNWAY</text>
      </g>

      {/* ================= SOUTH ROOMS: CHANGE ROOM & FILM APPLICATOR ================= */}
      <g stroke="#334155" strokeWidth="1.5" fill="#f8fafc">
        {/* South Partition Wall */}
        <rect x="750" y="870" width="240" height="40" />
        <text x="870" y="895" textAnchor="middle" className="font-mono text-[10px] font-bold fill-[#1e293b]">
          STAFF CHANGE ROOM & AIR SHOWER
        </text>

        <rect x="520" y="870" width="210" height="40" />
        <text x="625" y="895" textAnchor="middle" className="font-mono text-[9.5px] font-bold fill-[#1e293b]">
          APPLY SPATULA FILM / JIG CLEAN
        </text>

        <rect x="280" y="870" width="220" height="40" />
        <text x="390" y="895" textAnchor="middle" className="font-mono text-[10px] font-bold fill-[#1e293b]">
          ST4 / ST3 CHEMICAL TANK ISOLATION
        </text>
      </g>

      {/* ================= 6 PRODUCTION LINES (L6 to L1) ================= */}
      {/* Defined Columns:
          L6: X center = 560 (35.0%)
          L5: X center = 680 (42.5%)
          L4: X center = 800 (50.0%)
          L3: X center = 925 (57.8%)
          L2: X center = 1050 (65.6%)
          L1: X center = 1175 (73.4%)
      */}
      {[
        { name: 'L6', lineId: 'L6', cx: 560, label: 'PRODUCTION LINE 6 (UNDER FILL & DUAL BAKE)' },
        { name: 'L5', lineId: 'L5', cx: 685, label: 'PRODUCTION LINE 5 (UNDER FILL & BAKE)' },
        { name: 'L4', lineId: 'L4', cx: 810, label: 'PRODUCTION LINE 4 (UNDER FILL & VACUUM B)' },
        { name: 'L3', lineId: 'L3', cx: 935, label: 'PRODUCTION LINE 3 (UNDER FILL & BAKE)' },
        { name: 'L2', lineId: 'L2', cx: 1060, label: 'PRODUCTION LINE 2 (TOP FILL & VACUUM A)' },
        { name: 'L1', lineId: 'L1', cx: 1185, label: 'PRODUCTION LINE 1 (TOP FILL & BAKE)' },
      ].map((line) => {
        const isFocused = selectedLine === 'ALL' || selectedLine === line.lineId;
        const opacity = isFocused ? 1 : 0.25;

        return (
          <g key={line.lineId} opacity={opacity} className="transition-opacity duration-200">
            {/* Background Line Guide Corridor */}
            <rect
              x={line.cx - 52}
              y={180}
              width="104"
              height="700"
              fill={isFocused && selectedLine === line.lineId ? '#eff6ff' : '#fbfcfd'}
              stroke={isFocused && selectedLine === line.lineId ? '#3b82f6' : '#e2e8f0'}
              strokeWidth={isFocused && selectedLine === line.lineId ? '2' : '1'}
              strokeDasharray={isFocused && selectedLine === line.lineId ? 'none' : '4 4'}
              rx="4"
            />

            {/* Line Title Header Badge on Top */}
            <rect
              x={line.cx - 45}
              y={188}
              width="90"
              height="20"
              fill={selectedLine === line.lineId ? '#1e3a8a' : '#1e293b'}
              rx="3"
            />
            <text
              x={line.cx}
              y={202}
              textAnchor="middle"
              className="font-mono text-[10px] font-extrabold fill-white"
            >
              {line.name}
            </text>

            {/* Central Conveyor Rail Track */}
            <rect
              x={line.cx - 14}
              y={215}
              width="28"
              height="650"
              fill="url(#conveyor-rollers)"
              stroke="#64748b"
              strokeWidth="1.2"
            />

            {/* Conveyor Motion Flow Arrows */}
            {[270, 390, 510, 630, 750, 830].map((arrowY) => (
              <g key={`arrow-${line.lineId}-${arrowY}`} stroke="#0284c7" strokeWidth="2" fill="none" opacity="0.6">
                <path d={`M ${line.cx - 8} ${arrowY} L ${line.cx} ${arrowY + 8} L ${line.cx + 8} ${arrowY}`} />
              </g>
            ))}

            {/* Machine Outline Archetypes on the CAD drawing */}
            {/* 1. Dispensing Machine Stage */}
            <g stroke="#334155" strokeWidth="1.2" fill="#ffffff">
              <rect x={line.cx - 40} y={230} width="80" height="55" rx="3" />
              <circle cx={line.cx} cy={257} r="10" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
              <line x1={line.cx - 10} y1={257} x2={line.cx + 10} y2={257} stroke="#0284c7" strokeWidth="1.5" />
              <line x1={line.cx} y1={247} x2={line.cx} y2={267} stroke="#0284c7" strokeWidth="1.5" />
            </g>

            {/* 2. Second Dispenser or Underfill stage */}
            <g stroke="#334155" strokeWidth="1.2" fill="#ffffff">
              <rect x={line.cx - 40} y={320} width="80" height="55" rx="3" />
              <circle cx={line.cx} cy={347} r="10" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
              <line x1={line.cx - 10} y1={347} x2={line.cx + 10} y2={347} stroke="#0284c7" strokeWidth="1.5" />
              <line x1={line.cx} y1={337} x2={line.cx} y2={357} stroke="#0284c7" strokeWidth="1.5" />
            </g>

            {/* 3. FVMI Optical Inspection Bay */}
            <g stroke="#334155" strokeWidth="1.2" fill="#ffffff">
              <rect x={line.cx - 42} y={440} width="84" height="60" rx="3" />
              <circle cx={line.cx} cy={470} r="14" fill="#ffedd5" stroke="#ea580c" strokeWidth="1.5" />
              <circle cx={line.cx} cy={470} r="6" fill="#ea580c" />
              <rect x={line.cx - 36} y={445} width="12" height="12" fill="#cbd5e1" />
              <rect x={line.cx + 24} y={445} width="12" height="12" fill="#cbd5e1" />
            </g>

            {/* 4. Oven Stage (Vacuum or Bake Tunnel) */}
            <g stroke="#334155" strokeWidth="1.2" fill="#ffffff">
              <rect x={line.cx - 48} y={580} width="96" height="85" rx="3" />
              {/* Heating elements / coil lines */}
              <line x1={line.cx - 40} y1={600} x2={line.cx + 40} y2={600} stroke="#ca8a04" strokeWidth="2" />
              <line x1={line.cx - 40} y1={620} x2={line.cx + 40} y2={620} stroke="#ca8a04" strokeWidth="2" />
              <line x1={line.cx - 40} y1={640} x2={line.cx + 40} y2={640} stroke="#ca8a04" strokeWidth="2" />
              <circle cx={line.cx} cy={622} r="12" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.5" />
            </g>

            {/* 5. Packout Station - 1 Unit (Purple) */}
            <g stroke="#334155" strokeWidth="1.2" fill="#ffffff">
              <rect x={line.cx - 44} y={752} width="88" height="42" rx="3" />
              <rect x={line.cx - 28} y={758} width="56" height="30" fill="#f3e8ff" stroke="#9333ea" strokeWidth="1.5" rx="2" />
              <line x1={line.cx - 20} y1={773} x2={line.cx + 20} y2={773} stroke="#9333ea" strokeWidth="1.2" strokeDasharray="3 2" />
              <circle cx={line.cx} cy={773} r="4" fill="#9333ea" />
            </g>

            {/* 6. OCR 2D Matrix Scanner - 1 Unit (Pink) */}
            <g stroke="#334155" strokeWidth="1.2" fill="#ffffff">
              <rect x={line.cx - 44} y={802} width="88" height="42" rx="3" />
              <rect x={line.cx - 28} y={808} width="56" height="30" fill="#fdf2f8" stroke="#ec4899" strokeWidth="1.5" rx="2" />
              <circle cx={line.cx} cy={823} r="8.5" fill="#fce7f3" stroke="#ec4899" strokeWidth="1.5" />
              <rect x={line.cx - 3.5} y={819.5} width="7" height="7" fill="#ec4899" rx="1" />
              <line x1={line.cx - 18} y1={823} x2={line.cx - 11} y2={823} stroke="#ec4899" strokeWidth="1.5" />
              <line x1={line.cx + 11} y1={823} x2={line.cx + 18} y2={823} stroke="#ec4899" strokeWidth="1.5" />
            </g>

            {/* Line Footer Label */}
            <text
              x={line.cx}
              y={880}
              textAnchor="middle"
              className="font-mono text-[9px] font-bold fill-[#64748b]"
            >
              {line.name} OUTBOUND
            </text>
          </g>
        );
      })}

      {/* ================= CAD DIMENSION LINES & LABELS ================= */}
      {showDimensions && (
        <g stroke="#475569" strokeWidth="1" opacity="0.85" className="font-mono text-[9px] fill-[#334155]">
          {/* Top Overall Width Dimension: 48.50 m (TOTAL) */}
          <line x1="80" y1="48" x2="1520" y2="48" markerStart="url(#arrow-left)" markerEnd="url(#arrow-right)" stroke="#334155" strokeWidth="1.2" />
          <line x1="80" y1="36" x2="80" y2="60" stroke="#475569" strokeWidth="1.2" />
          <line x1="1520" y1="36" x2="1520" y2="60" stroke="#475569" strokeWidth="1.2" />
          <rect x="740" y="37" width="120" height="18" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" rx="3" />
          <text x="800" y="50" textAnchor="middle" className="font-bold fill-[#0f172a] text-[9.5px]">48.50 m (TOTAL WIDTH)</text>

          {/* Left Overall Height Dimension: 28.20 m (TOTAL) */}
          <line x1="45" y1="80" x2="45" y2="920" markerStart="url(#arrow-left)" markerEnd="url(#arrow-right)" stroke="#334155" strokeWidth="1.2" />
          <line x1="32" y1="80" x2="58" y2="80" stroke="#475569" strokeWidth="1.2" />
          <line x1="32" y1="920" x2="58" y2="920" stroke="#475569" strokeWidth="1.2" />
          <rect x="8" y="490" width="74" height="20" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" rx="3" />
          <text x="45" y="504" textAnchor="middle" className="font-bold fill-[#0f172a] text-[9.5px]">28.20 m</text>

          {/* Production Line Inter-Spacing Callouts (7.50 m Pitch between Lines L6->L5, L5->L4, etc.) */}
          <line x1="560" y1="165" x2="685" y2="165" stroke="#0284c7" strokeWidth="1.2" markerStart="url(#arrow-left)" markerEnd="url(#arrow-right)" />
          <line x1="560" y1="156" x2="560" y2="174" stroke="#0284c7" strokeWidth="1.2" />
          <line x1="685" y1="156" x2="685" y2="174" stroke="#0284c7" strokeWidth="1.2" />
          <rect x="590" y="153" width="65" height="14" fill="#eff6ff" stroke="#93c5fd" strokeWidth="0.8" rx="2" />
          <text x="622.5" y="163.5" textAnchor="middle" className="fill-[#0369a1] font-bold text-[8px]">PITCH 7.50m</text>

          <line x1="685" y1="165" x2="810" y2="165" stroke="#0284c7" strokeWidth="1.2" markerStart="url(#arrow-left)" markerEnd="url(#arrow-right)" />
          <line x1="810" y1="156" x2="810" y2="174" stroke="#0284c7" strokeWidth="1.2" />
          <rect x="715" y="153" width="65" height="14" fill="#eff6ff" stroke="#93c5fd" strokeWidth="0.8" rx="2" />
          <text x="747.5" y="163.5" textAnchor="middle" className="fill-[#0369a1] font-bold text-[8px]">PITCH 7.50m</text>

          <line x1="810" y1="165" x2="935" y2="165" stroke="#0284c7" strokeWidth="1.2" markerStart="url(#arrow-left)" markerEnd="url(#arrow-right)" />
          <line x1="935" y1="156" x2="935" y2="174" stroke="#0284c7" strokeWidth="1.2" />
          <rect x="840" y="153" width="65" height="14" fill="#eff6ff" stroke="#93c5fd" strokeWidth="0.8" rx="2" />
          <text x="872.5" y="163.5" textAnchor="middle" className="fill-[#0369a1] font-bold text-[8px]">PITCH 7.50m</text>

          <line x1="935" y1="165" x2="1060" y2="165" stroke="#0284c7" strokeWidth="1.2" markerStart="url(#arrow-left)" markerEnd="url(#arrow-right)" />
          <line x1="1060" y1="156" x2="1060" y2="174" stroke="#0284c7" strokeWidth="1.2" />
          <rect x="965" y="153" width="65" height="14" fill="#eff6ff" stroke="#93c5fd" strokeWidth="0.8" rx="2" />
          <text x="997.5" y="163.5" textAnchor="middle" className="fill-[#0369a1] font-bold text-[8px]">PITCH 7.50m</text>

          <line x1="1060" y1="165" x2="1185" y2="165" stroke="#0284c7" strokeWidth="1.2" markerStart="url(#arrow-left)" markerEnd="url(#arrow-right)" />
          <line x1="1185" y1="156" x2="1185" y2="174" stroke="#0284c7" strokeWidth="1.2" />
          <rect x="1090" y="153" width="65" height="14" fill="#eff6ff" stroke="#93c5fd" strokeWidth="0.8" rx="2" />
          <text x="1122.5" y="163.5" textAnchor="middle" className="fill-[#0369a1] font-bold text-[8px]">PITCH 7.50m</text>

          {/* Conveyor Line Length Dimension (L1->L6 Conveyor Length 22.50m) */}
          <line x1="1260" y1="215" x2="1260" y2="865" stroke="#475569" strokeWidth="1" strokeDasharray="4 2" markerStart="url(#arrow-left)" markerEnd="url(#arrow-right)" />
          <line x1="1245" y1="215" x2="1275" y2="215" stroke="#475569" strokeWidth="1" />
          <line x1="1245" y1="865" x2="1275" y2="865" stroke="#475569" strokeWidth="1" />
          <rect x="1235" y="530" width="55" height="16" fill="#ffffff" stroke="#cbd5e1" rx="2" />
          <text x="1262.5" y="541.5" textAnchor="middle" className="font-bold text-[8px]">22.50 m</text>

          {/* Transport Warehouse Width (East Wing 9.50m) */}
          <line x1="1200" y1="945" x2="1500" y2="945" stroke="#475569" strokeWidth="1" markerStart="url(#arrow-left)" markerEnd="url(#arrow-right)" />
          <line x1="1200" y1="935" x2="1200" y2="955" stroke="#475569" strokeWidth="1" />
          <line x1="1500" y1="935" x2="1500" y2="955" stroke="#475569" strokeWidth="1" />
          <text x="1350" y="942" textAnchor="middle" className="font-bold text-[8.5px]">EAST WING 9.50 m</text>
        </g>
      )}

      {/* Architectural Compass / Orientation Mark */}
      <g transform="translate(1450, 130)" opacity="0.8">
        <circle cx="0" cy="0" r="22" fill="#ffffff" stroke="#334155" strokeWidth="1.5" />
        <path d="M 0 -18 L 6 0 L 0 -4 L -6 0 Z" fill="#0f172a" />
        <path d="M 0 18 L 6 0 L 0 4 L -6 0 Z" fill="#94a3b8" />
        <text x="0" y="-22" textAnchor="middle" className="font-mono text-[9px] font-extrabold fill-[#0f172a]">N</text>
      </g>

      {/* Revision Title Block on bottom right */}
      {showLabels && (
        <g transform="translate(1210, 890)" className="font-mono">
          <rect width="290" height="22" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" rx="2" />
          <text x="10" y="15" className="text-[8.5px] fill-[#475569] font-medium">
            CAD DWG: FACILITY-FL-MAIN-L1-L6-REV3.4 • SCALE 1:100 • METRIC
          </text>
        </g>
      )}
    </svg>
  );
};
