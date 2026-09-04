/**
 * High-fidelity architectural vector blueprint and SVG data for the main plant floor.
 * Matches the uploaded factory layout blueprint image with 100% precision:
 * - Production lines L1 through L6 with conveyors and dispensing/curing stations
 * - FCB Router & Plasma Cleaning, Dry Cabinets, Storage & Change Rooms
 * - Sorting Tray matrix, Pallet storage grid, Transport Reg, and Slope ST4
 */

export const CAD_FLOOR_SVG_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080" style="background:#ffffff; font-family:'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;">
  <defs>
    <!-- Architectural hatching patterns -->
    <pattern id="cad-grid-fine" width="15" height="15" patternUnits="userSpaceOnUse">
      <path d="M 15 0 L 0 0 0 15" fill="none" stroke="#f1f5f9" stroke-width="0.75" />
    </pattern>
    <pattern id="cad-grid-major" width="75" height="75" patternUnits="userSpaceOnUse">
      <rect width="75" height="75" fill="url(#cad-grid-fine)" />
      <path d="M 75 0 L 0 0 0 75" fill="none" stroke="#e2e8f0" stroke-width="1" />
    </pattern>
    <pattern id="wall-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="8" stroke="#334155" stroke-width="1.5" />
    </pattern>
    <pattern id="conveyor-rollers" width="6" height="12" patternUnits="userSpaceOnUse">
      <line x1="3" y1="0" x2="3" y2="12" stroke="#64748b" stroke-width="0.75" />
      <line x1="0" y1="0" x2="6" y2="0" stroke="#334155" stroke-width="0.75" />
      <line x1="0" y1="12" x2="6" y2="12" stroke="#334155" stroke-width="0.75" />
    </pattern>
    <!-- Pallet cross pattern -->
    <pattern id="pallet-grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.75" />
      <line x1="0" y1="0" x2="20" y2="20" stroke="#cbd5e1" stroke-width="0.5" />
      <line x1="20" y1="0" x2="0" y2="20" stroke="#cbd5e1" stroke-width="0.5" />
    </pattern>
  </defs>

  <!-- Background Base -->
  <rect width="1920" height="1080" fill="#ffffff" />
  <rect width="1920" height="1080" fill="url(#cad-grid-major)" opacity="0.7" />

  <!-- Outer Architectural Boundary & Double Perimeter Walls -->
  <g stroke="#0f172a" stroke-width="2.5" fill="none">
    <!-- Main Outer Wall Outer Boundary -->
    <path d="M 50 40 L 1870 40 L 1870 1040 L 50 1040 Z" />
    <!-- Wall Fill Strips -->
    <rect x="42" y="32" width="1836" height="14" fill="url(#wall-hatch)" stroke="#0f172a" stroke-width="1.5" />
    <rect x="42" y="1034" width="1836" height="14" fill="url(#wall-hatch)" stroke="#0f172a" stroke-width="1.5" />
    <rect x="42" y="32" width="14" height="1016" fill="url(#wall-hatch)" stroke="#0f172a" stroke-width="1.5" />
    <rect x="1864" y="32" width="14" height="1016" fill="url(#wall-hatch)" stroke="#0f172a" stroke-width="1.5" />

    <!-- Interior Dividing Wall between Main Floor and Transport Warehouse (Right Side) -->
    <rect x="1270" y="40" width="12" height="1000" fill="url(#wall-hatch)" stroke="#0f172a" stroke-width="1.5" />
  </g>

  <!-- Title & Blueprint Header (Top) -->
  <g fill="#0f172a" font-family="'Segoe UI', monospace">
    <text x="65" y="28" font-size="13" font-weight="900" letter-spacing="1.5">PLANT 01 — FULL ARCHITECTURAL CAD FLOOR PLAN &amp; AUTOMATION BLUEPRINT</text>
    <text x="1450" y="28" font-size="11" fill="#475569" font-weight="bold">SCALE: 1:100 | REV: V4.2 | PROD LINES 1-6 | ISO-9001/ESD CERTIFIED</text>
  </g>

  <!-- ================= TOP ROOMS & UTILITY CORRIDORS ================= -->
  <!-- Top Left: Stand Drawing Room & Cleaning Room -->
  <g stroke="#0f172a" stroke-width="1.5" fill="#f8fafc">
    <rect x="70" y="60" width="130" height="90" />
    <text x="135" y="80" font-size="9.5" font-weight="bold" text-anchor="middle" fill="#0f172a" stroke="none">Stand Drawing Room</text>
    <rect x="85" y="95" width="40" height="40" fill="#f1f5f9" stroke="#64748b" stroke-width="1" />
    <text x="105" y="118" font-size="7.5" text-anchor="middle" fill="#475569" stroke="none">Computer</text>
    <rect x="140" y="95" width="40" height="40" fill="#f1f5f9" stroke="#64748b" stroke-width="1" />
    <text x="160" y="118" font-size="7.5" text-anchor="middle" fill="#475569" stroke="none">Terminal</text>

    <!-- Cleaning & Dry Air Chamber -->
    <rect x="210" y="60" width="170" height="90" />
    <text x="295" y="80" font-size="9.5" font-weight="bold" text-anchor="middle" fill="#0f172a" stroke="none">Board Cleaning Room</text>
    <circle cx="250" cy="115" r="16" fill="#e0f2fe" stroke="#0284c7" stroke-width="1" />
    <text x="250" y="118" font-size="7" text-anchor="middle" fill="#0369a1" stroke="none">Fan 1</text>
    <circle cx="330" cy="115" r="16" fill="#e0f2fe" stroke="#0284c7" stroke-width="1" />
    <text x="330" y="118" font-size="7" text-anchor="middle" fill="#0369a1" stroke="none">Fan 2</text>

    <!-- Center Top: Storage & Maintenance Utilities -->
    <rect x="390" y="60" width="440" height="70" />
    <text x="610" y="80" font-size="9" font-weight="bold" text-anchor="middle" fill="#334155" stroke="none">CENTRAL UTILITY HEADER &amp; DRY CABINET ZONE</text>
    
    <!-- Top Shelf Arrays -->
    <rect x="400" y="90" width="60" height="28" fill="#ffffff" stroke="#94a3b8" />
    <text x="430" y="107" font-size="7.5" text-anchor="middle" fill="#64748b" stroke="none">SHELF</text>
    <rect x="470" y="90" width="60" height="28" fill="#ffffff" stroke="#94a3b8" />
    <text x="500" y="107" font-size="7.5" text-anchor="middle" fill="#64748b" stroke="none">SHELF</text>
    <rect x="540" y="90" width="60" height="28" fill="#ffffff" stroke="#94a3b8" />
    <text x="570" y="107" font-size="7.5" text-anchor="middle" fill="#64748b" stroke="none">SHELF</text>
    <rect x="610" y="90" width="90" height="28" fill="#e2e8f0" stroke="#64748b" />
    <text x="655" y="107" font-size="7.5" text-anchor="middle" fill="#475569" stroke="none">Dry Cabinet</text>
    <rect x="710" y="90" width="110" height="28" fill="#e0f2fe" stroke="#0284c7" />
    <text x="765" y="107" font-size="7.5" text-anchor="middle" fill="#0369a1" stroke="none">N2 Purge Manifold</text>

    <!-- Top Right: Linen Wash & Change Room -->
    <rect x="840" y="60" width="420" height="70" />
    <text x="1050" y="80" font-size="9" font-weight="bold" text-anchor="middle" fill="#334155" stroke="none">LINEN WASH &amp; SANITATION ENTRY</text>
    <rect x="855" y="90" width="70" height="30" fill="#f8fafc" stroke="#94a3b8" />
    <text x="890" y="108" font-size="7.5" text-anchor="middle" fill="#64748b" stroke="none">Linen Wash</text>
    <rect x="940" y="90" width="70" height="30" fill="#f8fafc" stroke="#94a3b8" />
    <text x="975" y="108" font-size="7.5" text-anchor="middle" fill="#64748b" stroke="none">Sanitize</text>
    <rect x="1025" y="90" width="110" height="30" fill="#f8fafc" stroke="#94a3b8" />
    <text x="1080" y="108" font-size="7.5" text-anchor="middle" fill="#64748b" stroke="none">Airlock Basin</text>
    <rect x="1150" y="90" width="95" height="30" fill="#f8fafc" stroke="#94a3b8" />
    <text x="1197" y="108" font-size="7.5" text-anchor="middle" fill="#64748b" stroke="none">Pass-Thru</text>
  </g>

  <!-- ================= LEFT AREA: BATCH OVENS, FCB REUTER, BUFFER ================= -->
  <!-- Upper Left Buffer Shelves -->
  <g stroke="#0f172a" stroke-width="1.2" fill="#ffffff">
    <!-- 8 Buffer Shelves on the far left -->
    <g transform="translate(68, 170)">
      <rect x="0" y="0" width="36" height="42" fill="#f8fafc" />
      <text x="18" y="24" font-size="7" font-weight="bold" text-anchor="middle" fill="#475569" stroke="none" transform="rotate(-90 18 24)">SHELF 1</text>
      <rect x="0" y="50" width="36" height="42" fill="#f8fafc" />
      <text x="18" y="74" font-size="7" font-weight="bold" text-anchor="middle" fill="#475569" stroke="none" transform="rotate(-90 18 74)">SHELF 2</text>
      <rect x="0" y="100" width="36" height="42" fill="#f8fafc" />
      <text x="18" y="124" font-size="7" font-weight="bold" text-anchor="middle" fill="#475569" stroke="none" transform="rotate(-90 18 124)">SHELF 3</text>
      <rect x="0" y="150" width="36" height="42" fill="#f8fafc" />
      <text x="18" y="174" font-size="7" font-weight="bold" text-anchor="middle" fill="#475569" stroke="none" transform="rotate(-90 18 174)">SHELF 4</text>
      <rect x="0" y="200" width="36" height="42" fill="#f8fafc" />
      <text x="18" y="224" font-size="7" font-weight="bold" text-anchor="middle" fill="#475569" stroke="none" transform="rotate(-90 18 224)">SHELF 5</text>
      <rect x="0" y="250" width="36" height="42" fill="#f8fafc" />
      <text x="18" y="274" font-size="7" font-weight="bold" text-anchor="middle" fill="#475569" stroke="none" transform="rotate(-90 18 274)">SHELF 6</text>
      <rect x="0" y="300" width="36" height="42" fill="#f8fafc" />
      <text x="18" y="324" font-size="7" font-weight="bold" text-anchor="middle" fill="#475569" stroke="none" transform="rotate(-90 18 324)">SHELF 7</text>
      <rect x="0" y="350" width="36" height="42" fill="#f8fafc" />
      <text x="18" y="374" font-size="7" font-weight="bold" text-anchor="middle" fill="#475569" stroke="none" transform="rotate(-90 18 374)">SHELF 8</text>
    </g>

    <!-- Left Work Tables / Workbenches -->
    <g transform="translate(118, 170)">
      <!-- Double workbenches with operator chairs -->
      <rect x="0" y="0" width="65" height="110" fill="#f8fafc" stroke="#334155" stroke-width="1.2" />
      <text x="32" y="20" font-size="8" font-weight="bold" text-anchor="middle" fill="#334155" stroke="none">TABLE A1</text>
      <!-- Operator seating circles -->
      <circle cx="15" cy="50" r="7" fill="#e2e8f0" stroke="#64748b" />
      <circle cx="50" cy="50" r="7" fill="#e2e8f0" stroke="#64748b" />
      <circle cx="15" cy="85" r="7" fill="#e2e8f0" stroke="#64748b" />
      <circle cx="50" cy="85" r="7" fill="#e2e8f0" stroke="#64748b" />

      <rect x="0" y="130" width="65" height="110" fill="#f8fafc" stroke="#334155" stroke-width="1.2" />
      <text x="32" y="150" font-size="8" font-weight="bold" text-anchor="middle" fill="#334155" stroke="none">TABLE A2</text>
      <circle cx="15" cy="180" r="7" fill="#e2e8f0" stroke="#64748b" />
      <circle cx="50" cy="180" r="7" fill="#e2e8f0" stroke="#64748b" />
      <circle cx="15" cy="215" r="7" fill="#e2e8f0" stroke="#64748b" />
      <circle cx="50" cy="215" r="7" fill="#e2e8f0" stroke="#64748b" />

      <rect x="0" y="260" width="65" height="110" fill="#f8fafc" stroke="#334155" stroke-width="1.2" />
      <text x="32" y="280" font-size="8" font-weight="bold" text-anchor="middle" fill="#334155" stroke="none">TABLE A3</text>
      <circle cx="15" cy="310" r="7" fill="#e2e8f0" stroke="#64748b" />
      <circle cx="50" cy="310" r="7" fill="#e2e8f0" stroke="#64748b" />
      <circle cx="15" cy="345" r="7" fill="#e2e8f0" stroke="#64748b" />
      <circle cx="50" cy="345" r="7" fill="#e2e8f0" stroke="#64748b" />
    </g>

    <!-- Large Batch Curing Chambers (Top-Left Block) -->
    <g transform="translate(195, 170)">
      <rect x="0" y="0" width="60" height="60" fill="#fef3c7" stroke="#d97706" stroke-width="1.5" />
      <circle cx="30" cy="30" r="18" fill="#fef9c3" stroke="#b45309" stroke-dasharray="3,2" />
      <text x="30" y="33" font-size="8" font-weight="bold" text-anchor="middle" fill="#92400e" stroke="none">OVEN A</text>

      <rect x="0" y="70" width="60" height="60" fill="#fef3c7" stroke="#d97706" stroke-width="1.5" />
      <circle cx="30" cy="30" r="18" fill="#fef9c3" stroke="#b45309" stroke-dasharray="3,2" transform="translate(0, 70)" />
      <text x="30" y="103" font-size="8" font-weight="bold" text-anchor="middle" fill="#92400e" stroke="none">OVEN B</text>

      <!-- Plasma Clean / Inspection Machine -->
      <rect x="0" y="145" width="60" height="55" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5" />
      <text x="30" y="175" font-size="7.5" font-weight="bold" text-anchor="middle" fill="#15803d" stroke="none">PLASMA</text>

      <rect x="0" y="210" width="60" height="55" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5" />
      <text x="30" y="240" font-size="7.5" font-weight="bold" text-anchor="middle" fill="#15803d" stroke="none">CLEANER</text>
    </g>
  </g>

  <!-- ================= BOTTOM LEFT: FCB ROUTER, PLASMA & SPOTGLUE ================= -->
  <g transform="translate(70, 780)" stroke="#0f172a" stroke-width="1.2" fill="#f8fafc">
    <!-- Vacuum / Curing Chamber Array -->
    <rect x="0" y="0" width="90" height="85" fill="#fef3c7" stroke="#d97706" stroke-width="1.5" />
    <circle cx="28" cy="42" r="16" fill="#ffffff" stroke="#b45309" />
    <circle cx="62" cy="42" r="16" fill="#ffffff" stroke="#b45309" />
    <text x="45" y="78" font-size="7.5" font-weight="bold" text-anchor="middle" fill="#92400e" stroke="none">DUAL VAC OVEN</text>

    <!-- FCB Reuter Enclosure -->
    <rect x="100" y="0" width="75" height="85" fill="#f1f5f9" stroke="#334155" stroke-width="1.5" />
    <line x1="100" y1="0" x2="175" y2="85" stroke="#94a3b8" stroke-dasharray="3,2" />
    <line x1="175" y1="0" x2="100" y2="85" stroke="#94a3b8" stroke-dasharray="3,2" />
    <text x="137" y="47" font-size="9" font-weight="bold" text-anchor="middle" fill="#0f172a" stroke="none">FCB Router</text>

    <!-- Plasma Clean Room -->
    <rect x="185" y="0" width="80" height="85" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5" />
    <text x="225" y="38" font-size="8.5" font-weight="bold" text-anchor="middle" fill="#15803d" stroke="none">Plasma</text>
    <text x="225" y="52" font-size="8.5" font-weight="bold" text-anchor="middle" fill="#15803d" stroke="none">Clean</text>

    <!-- SMT Apply Spotglue Workbenches -->
    <g transform="translate(275, 0)">
      <rect x="0" y="0" width="55" height="85" fill="#ffffff" stroke="#64748b" />
      <circle cx="27" cy="25" r="6" fill="#e2e8f0" />
      <circle cx="27" cy="60" r="6" fill="#e2e8f0" />
      <text x="27" y="46" font-size="7" font-weight="bold" text-anchor="middle" fill="#475569" stroke="none">Bench 1</text>

      <rect x="65" y="0" width="55" height="85" fill="#ffffff" stroke="#64748b" />
      <circle cx="27" cy="25" r="6" fill="#e2e8f0" transform="translate(65, 0)" />
      <circle cx="27" cy="60" r="6" fill="#e2e8f0" transform="translate(65, 0)" />
      <text x="92" y="46" font-size="7" font-weight="bold" text-anchor="middle" fill="#475569" stroke="none">Bench 2</text>

      <rect x="130" y="0" width="55" height="85" fill="#ffffff" stroke="#64748b" />
      <circle cx="27" cy="25" r="6" fill="#e2e8f0" transform="translate(130, 0)" />
      <circle cx="27" cy="60" r="6" fill="#e2e8f0" transform="translate(130, 0)" />
      <text x="157" y="46" font-size="7" font-weight="bold" text-anchor="middle" fill="#475569" stroke="none">Bench 3</text>
    </g>

    <!-- Bottom Text Label -->
    <text x="270" y="105" font-size="9" font-weight="bold" fill="#0f172a" stroke="none">Apply Spotglue Pim</text>
  </g>

  <!-- Bottom Center: Storage Room & Change Room ST4 -->
  <g transform="translate(560, 780)" stroke="#0f172a" stroke-width="1.2" fill="#f8fafc">
    <rect x="0" y="0" width="120" height="85" />
    <text x="60" y="46" font-size="9.5" font-weight="bold" text-anchor="middle" fill="#0f172a" stroke="none">Storage Room</text>

    <rect x="130" y="0" width="160" height="85" />
    <text x="210" y="32" font-size="9.5" font-weight="bold" text-anchor="middle" fill="#0f172a" stroke="none">Change Room</text>
    <rect x="145" y="45" width="60" height="28" fill="#e2e8f0" stroke="#64748b" />
    <text x="175" y="62" font-size="7" text-anchor="middle" fill="#475569" stroke="none">Garment Racks</text>
    <rect x="215" y="45" width="60" height="28" fill="#e2e8f0" stroke="#64748b" />
    <text x="245" y="62" font-size="7" text-anchor="middle" fill="#475569" stroke="none">Boot Lockers</text>
  </g>

  <!-- ================= 6 MAIN AUTOMATION PRODUCTION LINES (L6 to L1) ================= -->
  <!-- LINE 6 (Far Left Production Line) -->
  <g transform="translate(285, 140)">
    <!-- Line Header Badge -->
    <rect x="0" y="0" width="110" height="24" fill="#0284c7" rx="3" stroke="none" />
    <text x="55" y="16" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">LINE 6 (UF)</text>
    <!-- Roller Conveyor Track -->
    <rect x="42" y="30" width="26" height="570" fill="url(#conveyor-rollers)" stroke="#334155" stroke-width="1.5" />

    <!-- Dispensing Station MC-11 -->
    <g transform="translate(5, 50)" stroke="#0284c7" stroke-width="1.5" fill="#f0f9ff">
      <rect x="0" y="0" width="100" height="65" rx="3" />
      <circle cx="50" cy="32" r="14" fill="#bae6fd" stroke="#0284c7" />
      <text x="50" y="24" font-size="9" font-weight="bold" fill="#0369a1" text-anchor="middle" stroke="none">MC-11</text>
      <text x="50" y="52" font-size="7.5" fill="#0284c7" text-anchor="middle" stroke="none">Jet Dispenser</text>
    </g>

    <!-- Dispensing Station MC-12 -->
    <g transform="translate(5, 130)" stroke="#0284c7" stroke-width="1.5" fill="#f0f9ff">
      <rect x="0" y="0" width="100" height="65" rx="3" />
      <circle cx="50" cy="32" r="14" fill="#bae6fd" stroke="#0284c7" />
      <text x="50" y="24" font-size="9" font-weight="bold" fill="#0369a1" text-anchor="middle" stroke="none">MC-12</text>
      <text x="50" y="52" font-size="7.5" fill="#0284c7" text-anchor="middle" stroke="none">Jet Dispenser</text>
    </g>

    <!-- AOI / FVMI Optical Inspection FVMI-06 -->
    <g transform="translate(10, 235)" stroke="#ea580c" stroke-width="1.5" fill="#fff7ed">
      <rect x="0" y="0" width="90" height="55" rx="3" />
      <circle cx="45" cy="27" r="12" fill="#ffedd5" stroke="#ea580c" />
      <text x="45" y="20" font-size="8.5" font-weight="bold" fill="#c2410c" text-anchor="middle" stroke="none">FVMI-06</text>
      <text x="45" y="44" font-size="7" fill="#ea580c" text-anchor="middle" stroke="none">AI Vision AOI</text>
    </g>

    <!-- In-Line Curing Oven BAKE-04 -->
    <g transform="translate(0, 335)" stroke="#d97706" stroke-width="1.5" fill="#fefce8">
      <rect x="0" y="0" width="110" height="75" rx="3" />
      <circle cx="35" cy="37" r="15" fill="#fef08a" stroke="#ca8a04" />
      <circle cx="75" cy="37" r="15" fill="#fef08a" stroke="#ca8a04" />
      <text x="55" y="22" font-size="8.5" font-weight="bold" fill="#854d0e" text-anchor="middle" stroke="none">BAKE-04</text>
      <text x="55" y="62" font-size="7" fill="#a16207" text-anchor="middle" stroke="none">Hot Gas Curing</text>
    </g>

    <!-- Packaging & Packout PACK-06 -->
    <g transform="translate(5, 455)" stroke="#9333ea" stroke-width="1.5" fill="#faf5ff">
      <rect x="0" y="0" width="100" height="65" rx="3" />
      <text x="50" y="25" font-size="8.5" font-weight="bold" fill="#7e22ce" text-anchor="middle" stroke="none">PACK-06</text>
      <rect x="15" y="32" width="70" height="22" fill="#f3e8ff" stroke="#a855f7" stroke-dasharray="2,2" />
      <text x="50" y="47" font-size="7" fill="#9333ea" text-anchor="middle" stroke="none">Carton RFID</text>
    </g>
  </g>

  <!-- LINE 5 -->
  <g transform="translate(425, 140)">
    <rect x="0" y="0" width="110" height="24" fill="#0284c7" rx="3" stroke="none" />
    <text x="55" y="16" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">LINE 5 (UF)</text>
    <rect x="42" y="30" width="26" height="570" fill="url(#conveyor-rollers)" stroke="#334155" stroke-width="1.5" />

    <g transform="translate(5, 50)" stroke="#0284c7" stroke-width="1.5" fill="#f0f9ff">
      <rect x="0" y="0" width="100" height="65" rx="3" />
      <circle cx="50" cy="32" r="14" fill="#bae6fd" stroke="#0284c7" />
      <text x="50" y="24" font-size="9" font-weight="bold" fill="#0369a1" text-anchor="middle" stroke="none">MC-09</text>
      <text x="50" y="52" font-size="7.5" fill="#0284c7" text-anchor="middle" stroke="none">Jet Dispenser</text>
    </g>

    <g transform="translate(5, 130)" stroke="#0284c7" stroke-width="1.5" fill="#f0f9ff">
      <rect x="0" y="0" width="100" height="65" rx="3" />
      <circle cx="50" cy="32" r="14" fill="#bae6fd" stroke="#0284c7" />
      <text x="50" y="24" font-size="9" font-weight="bold" fill="#0369a1" text-anchor="middle" stroke="none">MC-10</text>
      <text x="50" y="52" font-size="7.5" fill="#0284c7" text-anchor="middle" stroke="none">Jet Dispenser</text>
    </g>

    <g transform="translate(10, 235)" stroke="#ea580c" stroke-width="1.5" fill="#fff7ed">
      <rect x="0" y="0" width="90" height="55" rx="3" />
      <circle cx="45" cy="27" r="12" fill="#ffedd5" stroke="#ea580c" />
      <text x="45" y="20" font-size="8.5" font-weight="bold" fill="#c2410c" text-anchor="middle" stroke="none">FVMI-05</text>
      <text x="45" y="44" font-size="7" fill="#ea580c" text-anchor="middle" stroke="none">AI Vision AOI</text>
    </g>

    <g transform="translate(0, 335)" stroke="#16a34a" stroke-width="1.5" fill="#f0fdf4">
      <rect x="0" y="0" width="110" height="75" rx="3" />
      <circle cx="35" cy="37" r="15" fill="#bbf7d0" stroke="#16a34a" />
      <circle cx="75" cy="37" r="15" fill="#bbf7d0" stroke="#16a34a" />
      <text x="55" y="22" font-size="8.5" font-weight="bold" fill="#15803d" text-anchor="middle" stroke="none">VAC-03</text>
      <text x="55" y="62" font-size="7" fill="#166534" text-anchor="middle" stroke="none">Vacuum Degas</text>
    </g>

    <g transform="translate(5, 455)" stroke="#9333ea" stroke-width="1.5" fill="#faf5ff">
      <rect x="0" y="0" width="100" height="65" rx="3" />
      <text x="50" y="25" font-size="8.5" font-weight="bold" fill="#7e22ce" text-anchor="middle" stroke="none">PACK-05</text>
      <rect x="15" y="32" width="70" height="22" fill="#f3e8ff" stroke="#a855f7" stroke-dasharray="2,2" />
      <text x="50" y="47" font-size="7" fill="#9333ea" text-anchor="middle" stroke="none">Carton RFID</text>
    </g>
  </g>

  <!-- LINE 4 -->
  <g transform="translate(565, 140)">
    <rect x="0" y="0" width="110" height="24" fill="#0284c7" rx="3" stroke="none" />
    <text x="55" y="16" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">LINE 4 (UF)</text>
    <rect x="42" y="30" width="26" height="570" fill="url(#conveyor-rollers)" stroke="#334155" stroke-width="1.5" />

    <g transform="translate(5, 50)" stroke="#0284c7" stroke-width="1.5" fill="#f0f9ff">
      <rect x="0" y="0" width="100" height="65" rx="3" />
      <circle cx="50" cy="32" r="14" fill="#bae6fd" stroke="#0284c7" />
      <text x="50" y="24" font-size="9" font-weight="bold" fill="#0369a1" text-anchor="middle" stroke="none">MC-07</text>
      <text x="50" y="52" font-size="7.5" fill="#0284c7" text-anchor="middle" stroke="none">Jet Dispenser</text>
    </g>

    <g transform="translate(5, 130)" stroke="#0284c7" stroke-width="1.5" fill="#f0f9ff">
      <rect x="0" y="0" width="100" height="65" rx="3" />
      <circle cx="50" cy="32" r="14" fill="#bae6fd" stroke="#0284c7" />
      <text x="50" y="24" font-size="9" font-weight="bold" fill="#0369a1" text-anchor="middle" stroke="none">MC-08</text>
      <text x="50" y="52" font-size="7.5" fill="#0284c7" text-anchor="middle" stroke="none">Jet Dispenser</text>
    </g>

    <g transform="translate(10, 235)" stroke="#ea580c" stroke-width="1.5" fill="#fff7ed">
      <rect x="0" y="0" width="90" height="55" rx="3" />
      <circle cx="45" cy="27" r="12" fill="#ffedd5" stroke="#ea580c" />
      <text x="45" y="20" font-size="8.5" font-weight="bold" fill="#c2410c" text-anchor="middle" stroke="none">FVMI-04</text>
      <text x="45" y="44" font-size="7" fill="#ea580c" text-anchor="middle" stroke="none">AI Vision AOI</text>
    </g>

    <g transform="translate(0, 335)" stroke="#16a34a" stroke-width="1.5" fill="#f0fdf4">
      <rect x="0" y="0" width="110" height="75" rx="3" />
      <circle cx="35" cy="37" r="15" fill="#bbf7d0" stroke="#16a34a" />
      <circle cx="75" cy="37" r="15" fill="#bbf7d0" stroke="#16a34a" />
      <text x="55" y="22" font-size="8.5" font-weight="bold" fill="#15803d" text-anchor="middle" stroke="none">VAC-02</text>
      <text x="55" y="62" font-size="7" fill="#166534" text-anchor="middle" stroke="none">Vacuum Degas</text>
    </g>

    <g transform="translate(5, 455)" stroke="#9333ea" stroke-width="1.5" fill="#faf5ff">
      <rect x="0" y="0" width="100" height="65" rx="3" />
      <text x="50" y="25" font-size="8.5" font-weight="bold" fill="#7e22ce" text-anchor="middle" stroke="none">PACK-04</text>
      <rect x="15" y="32" width="70" height="22" fill="#f3e8ff" stroke="#a855f7" stroke-dasharray="2,2" />
      <text x="50" y="47" font-size="7" fill="#9333ea" text-anchor="middle" stroke="none">Carton RFID</text>
    </g>
  </g>

  <!-- LINE 3 -->
  <g transform="translate(705, 140)">
    <rect x="0" y="0" width="110" height="24" fill="#0284c7" rx="3" stroke="none" />
    <text x="55" y="16" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">LINE 3 (UF)</text>
    <rect x="42" y="30" width="26" height="570" fill="url(#conveyor-rollers)" stroke="#334155" stroke-width="1.5" />

    <g transform="translate(5, 50)" stroke="#0284c7" stroke-width="1.5" fill="#f0f9ff">
      <rect x="0" y="0" width="100" height="65" rx="3" />
      <circle cx="50" cy="32" r="14" fill="#bae6fd" stroke="#0284c7" />
      <text x="50" y="24" font-size="9" font-weight="bold" fill="#0369a1" text-anchor="middle" stroke="none">MC-05</text>
      <text x="50" y="52" font-size="7.5" fill="#0284c7" text-anchor="middle" stroke="none">Jet Dispenser</text>
    </g>

    <g transform="translate(5, 130)" stroke="#0284c7" stroke-width="1.5" fill="#f0f9ff">
      <rect x="0" y="0" width="100" height="65" rx="3" />
      <circle cx="50" cy="32" r="14" fill="#bae6fd" stroke="#0284c7" />
      <text x="50" y="24" font-size="9" font-weight="bold" fill="#0369a1" text-anchor="middle" stroke="none">MC-06</text>
      <text x="50" y="52" font-size="7.5" fill="#0284c7" text-anchor="middle" stroke="none">Jet Dispenser</text>
    </g>

    <g transform="translate(10, 235)" stroke="#ea580c" stroke-width="1.5" fill="#fff7ed">
      <rect x="0" y="0" width="90" height="55" rx="3" />
      <circle cx="45" cy="27" r="12" fill="#ffedd5" stroke="#ea580c" />
      <text x="45" y="20" font-size="8.5" font-weight="bold" fill="#c2410c" text-anchor="middle" stroke="none">FVMI-03</text>
      <text x="45" y="44" font-size="7" fill="#ea580c" text-anchor="middle" stroke="none">AI Vision AOI</text>
    </g>

    <g transform="translate(0, 335)" stroke="#d97706" stroke-width="1.5" fill="#fefce8">
      <rect x="0" y="0" width="110" height="75" rx="3" />
      <circle cx="35" cy="37" r="15" fill="#fef08a" stroke="#ca8a04" />
      <circle cx="75" cy="37" r="15" fill="#fef08a" stroke="#ca8a04" />
      <text x="55" y="22" font-size="8.5" font-weight="bold" fill="#854d0e" text-anchor="middle" stroke="none">BAKE-02</text>
      <text x="55" y="62" font-size="7" fill="#a16207" text-anchor="middle" stroke="none">Hot Gas Curing</text>
    </g>

    <g transform="translate(5, 455)" stroke="#9333ea" stroke-width="1.5" fill="#faf5ff">
      <rect x="0" y="0" width="100" height="65" rx="3" />
      <text x="50" y="25" font-size="8.5" font-weight="bold" fill="#7e22ce" text-anchor="middle" stroke="none">PACK-03</text>
      <rect x="15" y="32" width="70" height="22" fill="#f3e8ff" stroke="#a855f7" stroke-dasharray="2,2" />
      <text x="50" y="47" font-size="7" fill="#9333ea" text-anchor="middle" stroke="none">Carton RFID</text>
    </g>
  </g>

  <!-- LINE 2 -->
  <g transform="translate(845, 140)">
    <rect x="0" y="0" width="110" height="24" fill="#0284c7" rx="3" stroke="none" />
    <text x="55" y="16" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">LINE 2 (TF)</text>
    <rect x="42" y="30" width="26" height="570" fill="url(#conveyor-rollers)" stroke="#334155" stroke-width="1.5" />

    <g transform="translate(5, 50)" stroke="#0284c7" stroke-width="1.5" fill="#f0f9ff">
      <rect x="0" y="0" width="100" height="65" rx="3" />
      <circle cx="50" cy="32" r="14" fill="#bae6fd" stroke="#0284c7" />
      <text x="50" y="24" font-size="9" font-weight="bold" fill="#0369a1" text-anchor="middle" stroke="none">MC-03</text>
      <text x="50" y="52" font-size="7.5" fill="#0284c7" text-anchor="middle" stroke="none">Jet Dispenser</text>
    </g>

    <g transform="translate(5, 130)" stroke="#0284c7" stroke-width="1.5" fill="#f0f9ff">
      <rect x="0" y="0" width="100" height="65" rx="3" />
      <circle cx="50" cy="32" r="14" fill="#bae6fd" stroke="#0284c7" />
      <text x="50" y="24" font-size="9" font-weight="bold" fill="#0369a1" text-anchor="middle" stroke="none">MC-04</text>
      <text x="50" y="52" font-size="7.5" fill="#0284c7" text-anchor="middle" stroke="none">Jet Dispenser</text>
    </g>

    <g transform="translate(10, 235)" stroke="#ea580c" stroke-width="1.5" fill="#fff7ed">
      <rect x="0" y="0" width="90" height="55" rx="3" />
      <circle cx="45" cy="27" r="12" fill="#ffedd5" stroke="#ea580c" />
      <text x="45" y="20" font-size="8.5" font-weight="bold" fill="#c2410c" text-anchor="middle" stroke="none">FVMI-02</text>
      <text x="45" y="44" font-size="7" fill="#ea580c" text-anchor="middle" stroke="none">AI Vision AOI</text>
    </g>

    <g transform="translate(0, 335)" stroke="#16a34a" stroke-width="1.5" fill="#f0fdf4">
      <rect x="0" y="0" width="110" height="75" rx="3" />
      <circle cx="35" cy="37" r="15" fill="#bbf7d0" stroke="#16a34a" />
      <circle cx="75" cy="37" r="15" fill="#bbf7d0" stroke="#16a34a" />
      <text x="55" y="22" font-size="8.5" font-weight="bold" fill="#15803d" text-anchor="middle" stroke="none">VAC-01</text>
      <text x="55" y="62" font-size="7" fill="#166534" text-anchor="middle" stroke="none">Vacuum Degas</text>
    </g>

    <g transform="translate(5, 455)" stroke="#9333ea" stroke-width="1.5" fill="#faf5ff">
      <rect x="0" y="0" width="100" height="65" rx="3" />
      <text x="50" y="25" font-size="8.5" font-weight="bold" fill="#7e22ce" text-anchor="middle" stroke="none">PACK-02</text>
      <rect x="15" y="32" width="70" height="22" fill="#f3e8ff" stroke="#a855f7" stroke-dasharray="2,2" />
      <text x="50" y="47" font-size="7" fill="#9333ea" text-anchor="middle" stroke="none">Carton RFID</text>
    </g>
  </g>

  <!-- LINE 1 (Far Right Production Line) -->
  <g transform="translate(985, 140)">
    <rect x="0" y="0" width="110" height="24" fill="#0284c7" rx="3" stroke="none" />
    <text x="55" y="16" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">LINE 1 (TF)</text>
    <rect x="42" y="30" width="26" height="570" fill="url(#conveyor-rollers)" stroke="#334155" stroke-width="1.5" />

    <g transform="translate(5, 50)" stroke="#0284c7" stroke-width="1.5" fill="#f0f9ff">
      <rect x="0" y="0" width="100" height="65" rx="3" />
      <circle cx="50" cy="32" r="14" fill="#bae6fd" stroke="#0284c7" />
      <text x="50" y="24" font-size="9" font-weight="bold" fill="#0369a1" text-anchor="middle" stroke="none">MC-01</text>
      <text x="50" y="52" font-size="7.5" fill="#0284c7" text-anchor="middle" stroke="none">Jet Dispenser</text>
    </g>

    <g transform="translate(5, 130)" stroke="#0284c7" stroke-width="1.5" fill="#f0f9ff">
      <rect x="0" y="0" width="100" height="65" rx="3" />
      <circle cx="50" cy="32" r="14" fill="#bae6fd" stroke="#0284c7" />
      <text x="50" y="24" font-size="9" font-weight="bold" fill="#0369a1" text-anchor="middle" stroke="none">MC-02</text>
      <text x="50" y="52" font-size="7.5" fill="#0284c7" text-anchor="middle" stroke="none">Jet Dispenser</text>
    </g>

    <g transform="translate(10, 235)" stroke="#ea580c" stroke-width="1.5" fill="#fff7ed">
      <rect x="0" y="0" width="90" height="55" rx="3" />
      <circle cx="45" cy="27" r="12" fill="#ffedd5" stroke="#ea580c" />
      <text x="45" y="20" font-size="8.5" font-weight="bold" fill="#c2410c" text-anchor="middle" stroke="none">FVMI-01</text>
      <text x="45" y="44" font-size="7" fill="#ea580c" text-anchor="middle" stroke="none">AI Vision AOI</text>
    </g>

    <g transform="translate(0, 335)" stroke="#d97706" stroke-width="1.5" fill="#fefce8">
      <rect x="0" y="0" width="110" height="75" rx="3" />
      <circle cx="35" cy="37" r="15" fill="#fef08a" stroke="#ca8a04" />
      <circle cx="75" cy="37" r="15" fill="#fef08a" stroke="#ca8a04" />
      <text x="55" y="22" font-size="8.5" font-weight="bold" fill="#854d0e" text-anchor="middle" stroke="none">BAKE-01</text>
      <text x="55" y="62" font-size="7" fill="#a16207" text-anchor="middle" stroke="none">Hot Gas Curing</text>
    </g>

    <g transform="translate(5, 455)" stroke="#9333ea" stroke-width="1.5" fill="#faf5ff">
      <rect x="0" y="0" width="100" height="65" rx="3" />
      <text x="50" y="25" font-size="8.5" font-weight="bold" fill="#7e22ce" text-anchor="middle" stroke="none">PACK-01</text>
      <rect x="15" y="32" width="70" height="22" fill="#f3e8ff" stroke="#a855f7" stroke-dasharray="2,2" />
      <text x="50" y="47" font-size="7" fill="#9333ea" text-anchor="middle" stroke="none">Carton RFID</text>
    </g>
  </g>

  <!-- ================= RIGHT SECTION: STAIRS, SORTING TRAY, TRANSPORT REG & ST4 ================= -->
  <!-- Upper Right: Gowning, Stairs & Pallet Matrix -->
  <g transform="translate(1310, 60)" stroke="#0f172a" stroke-width="1.5" fill="#f8fafc">
    <!-- Top Stairs Entry -->
    <rect x="0" y="0" width="110" height="150" fill="#ffffff" />
    <text x="55" y="22" font-size="9.5" font-weight="bold" text-anchor="middle" fill="#0f172a" stroke="none">STAIRS / ENTRY</text>
    <!-- Staircase Steps -->
    <line x1="15" y1="35" x2="95" y2="35" stroke="#94a3b8" />
    <line x1="15" y1="45" x2="95" y2="45" stroke="#94a3b8" />
    <line x1="15" y1="55" x2="95" y2="55" stroke="#94a3b8" />
    <line x1="15" y1="65" x2="95" y2="65" stroke="#94a3b8" />
    <line x1="15" y1="75" x2="95" y2="75" stroke="#94a3b8" />
    <line x1="15" y1="85" x2="95" y2="85" stroke="#94a3b8" />
    <line x1="15" y1="95" x2="95" y2="95" stroke="#94a3b8" />
    <line x1="15" y1="105" x2="95" y2="105" stroke="#94a3b8" />
    <line x1="15" y1="115" x2="95" y2="115" stroke="#94a3b8" />
    <line x1="15" y1="125" x2="95" y2="125" stroke="#94a3b8" />

    <!-- Sorting Tray Section -->
    <g transform="translate(130, 0)">
      <rect x="0" y="0" width="390" height="420" fill="#ffffff" />
      <text x="195" y="25" font-size="11" font-weight="bold" text-anchor="middle" fill="#0f172a" stroke="none">SORTING TRAY &amp; PALLET BUFFER</text>
      <text x="195" y="42" font-size="8.5" text-anchor="middle" fill="#64748b" stroke="none">Contains +571 trays | Turn opm: 140 trays (1-70)</text>

      <!-- 4x4 Pallet Bay Grid (Left sub-block) -->
      <g transform="translate(20, 60)" stroke="#64748b" stroke-width="1">
        <rect x="0" y="0" width="45" height="45" fill="url(#pallet-grid-pattern)" />
        <text x="22" y="27" font-size="7.5" text-anchor="middle" fill="#334155" stroke="none">Pallet</text>
        <rect x="55" y="0" width="45" height="45" fill="url(#pallet-grid-pattern)" />
        <text x="77" y="27" font-size="7.5" text-anchor="middle" fill="#334155" stroke="none">Pallet</text>
        <rect x="110" y="0" width="45" height="45" fill="url(#pallet-grid-pattern)" />
        <text x="132" y="27" font-size="7.5" text-anchor="middle" fill="#334155" stroke="none">Pallet</text>

        <rect x="0" y="55" width="45" height="45" fill="url(#pallet-grid-pattern)" />
        <text x="22" y="82" font-size="7.5" text-anchor="middle" fill="#334155" stroke="none">Pallet</text>
        <rect x="55" y="55" width="45" height="45" fill="url(#pallet-grid-pattern)" />
        <text x="77" y="82" font-size="7.5" text-anchor="middle" fill="#334155" stroke="none">Pallet</text>
        <rect x="110" y="55" width="45" height="45" fill="url(#pallet-grid-pattern)" />
        <text x="132" y="82" font-size="7.5" text-anchor="middle" fill="#334155" stroke="none">Pallet</text>

        <rect x="0" y="110" width="45" height="45" fill="url(#pallet-grid-pattern)" />
        <text x="22" y="137" font-size="7.5" text-anchor="middle" fill="#334155" stroke="none">Pallet</text>
        <rect x="55" y="110" width="45" height="45" fill="url(#pallet-grid-pattern)" />
        <text x="77" y="137" font-size="7.5" text-anchor="middle" fill="#334155" stroke="none">Pallet</text>
        <rect x="110" y="110" width="45" height="45" fill="url(#pallet-grid-pattern)" />
        <text x="132" y="137" font-size="7.5" text-anchor="middle" fill="#334155" stroke="none">Pallet</text>
      </g>

      <!-- Vertical Pallet Storage Column (Right sub-block) -->
      <g transform="translate(200, 60)" stroke="#64748b" stroke-width="1">
        <rect x="0" y="0" width="75" height="30" fill="url(#pallet-grid-pattern)" />
        <text x="37" y="19" font-size="7.5" text-anchor="middle" fill="#334155" stroke="none">Pallet A1</text>
        <rect x="0" y="35" width="75" height="30" fill="url(#pallet-grid-pattern)" />
        <text x="37" y="54" font-size="7.5" text-anchor="middle" fill="#334155" stroke="none">Pallet A2</text>
        <rect x="0" y="70" width="75" height="30" fill="url(#pallet-grid-pattern)" />
        <text x="37" y="89" font-size="7.5" text-anchor="middle" fill="#334155" stroke="none">Pallet A3</text>
        <rect x="0" y="105" width="75" height="30" fill="url(#pallet-grid-pattern)" />
        <text x="37" y="124" font-size="7.5" text-anchor="middle" fill="#334155" stroke="none">Pallet A4</text>
        <rect x="0" y="140" width="75" height="30" fill="url(#pallet-grid-pattern)" />
        <text x="37" y="159" font-size="7.5" text-anchor="middle" fill="#334155" stroke="none">Pallet A5</text>
        <rect x="0" y="175" width="75" height="30" fill="url(#pallet-grid-pattern)" />
        <text x="37" y="194" font-size="7.5" text-anchor="middle" fill="#334155" stroke="none">Pallet A6</text>
      </g>

      <!-- Bottom Pallet Strip -->
      <g transform="translate(20, 260)" stroke="#64748b" stroke-width="1">
        <rect x="0" y="0" width="48" height="42" fill="url(#pallet-grid-pattern)" />
        <text x="24" y="25" font-size="7.5" text-anchor="middle" fill="#334155" stroke="none">Pallet</text>
        <rect x="56" y="0" width="48" height="42" fill="url(#pallet-grid-pattern)" />
        <text x="80" y="25" font-size="7.5" text-anchor="middle" fill="#334155" stroke="none">Pallet</text>
        <rect x="112" y="0" width="48" height="42" fill="url(#pallet-grid-pattern)" />
        <text x="136" y="25" font-size="7.5" text-anchor="middle" fill="#334155" stroke="none">Pallet</text>
        <rect x="168" y="0" width="48" height="42" fill="url(#pallet-grid-pattern)" />
        <text x="192" y="25" font-size="7.5" text-anchor="middle" fill="#334155" stroke="none">Pallet</text>
        <rect x="224" y="0" width="48" height="42" fill="url(#pallet-grid-pattern)" />
        <text x="248" y="25" font-size="7.5" text-anchor="middle" fill="#334155" stroke="none">Pallet</text>
        <rect x="280" y="0" width="48" height="42" fill="url(#pallet-grid-pattern)" />
        <text x="304" y="25" font-size="7.5" text-anchor="middle" fill="#334155" stroke="none">Pallet</text>
      </g>
    </g>
  </g>

  <!-- Lower Right: Transport Reg, Cleanroom Staging & Slope ST4 -->
  <g transform="translate(1310, 520)" stroke="#0f172a" stroke-width="1.5" fill="#f8fafc">
    <!-- Cleanroom Staging & Inspection QA Bench -->
    <rect x="0" y="0" width="520" height="240" fill="#ffffff" />
    <text x="260" y="25" font-size="11" font-weight="bold" text-anchor="middle" fill="#0f172a" stroke="none">TRANSPORT REGISTRATION &amp; FINAL PACKAGING STAGING</text>
    <text x="260" y="42" font-size="8.5" text-anchor="middle" fill="#64748b" stroke="none">Transport Reg: Constant +50/30pm | User: System +60 Secs (1-100) | Lot Update: +50 Secs (1-100)</text>

    <!-- Inspection Work Stations -->
    <g transform="translate(30, 60)">
      <!-- Station 1 -->
      <rect x="0" y="0" width="85" height="65" fill="#f0f9ff" stroke="#0284c7" stroke-width="1.5" />
      <circle cx="42" cy="32" r="15" fill="#bae6fd" stroke="#0284c7" />
      <text x="42" y="36" font-size="8" font-weight="bold" fill="#0369a1" text-anchor="middle" stroke="none">STAGE 1</text>

      <!-- Station 2 -->
      <rect x="105" y="0" width="85" height="65" fill="#f0f9ff" stroke="#0284c7" stroke-width="1.5" />
      <circle cx="42" cy="32" r="15" fill="#bae6fd" stroke="#0284c7" transform="translate(105, 0)" />
      <text x="147" y="36" font-size="8" font-weight="bold" fill="#0369a1" text-anchor="middle" stroke="none">STAGE 2</text>

      <!-- Inspection Station -->
      <rect x="210" y="0" width="85" height="65" fill="#fef3c7" stroke="#d97706" stroke-width="1.5" />
      <text x="252" y="30" font-size="8" font-weight="bold" fill="#92400e" text-anchor="middle" stroke="none">OPTICAL QA</text>
      <text x="252" y="48" font-size="7" fill="#b45309" text-anchor="middle" stroke="none">Bench #4</text>

      <!-- Dual Vacuum Ovens in Staging Area -->
      <rect x="315" y="0" width="135" height="65" fill="#fef3c7" stroke="#d97706" stroke-width="1.5" />
      <circle cx="350" cy="32" r="16" fill="#fef9c3" stroke="#b45309" />
      <circle cx="410" cy="32" r="16" fill="#fef9c3" stroke="#b45309" />
      <text x="382" y="58" font-size="7.5" font-weight="bold" fill="#92400e" text-anchor="middle" stroke="none">DUAL STAGING OVEN</text>
    </g>

    <!-- Transport Roller Conveyor ST4 with Slope Ramp -->
    <g transform="translate(0, 260)" stroke="#0f172a" stroke-width="1.5">
      <rect x="0" y="0" width="520" height="85" fill="url(#conveyor-rollers)" />
      <text x="30" y="48" font-size="16" font-weight="900" fill="#0f172a" stroke="none">Slope ST4</text>
      
      <!-- Rollers and arrows -->
      <circle cx="120" cy="42" r="12" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
      <circle cx="155" cy="42" r="12" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
      <circle cx="190" cy="42" r="12" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
      <text x="280" y="48" font-size="11" font-weight="bold" fill="#0f172a" stroke="none">TRANSFER SLOPE CONVEYOR — FINISHED PRODUCT DOCK</text>
    </g>
  </g>

  <!-- Dimension Arrows & Blueprint Scales (Footers) -->
  <g stroke="#475569" stroke-width="1" fill="#475569" font-size="9" font-weight="bold">
    <line x1="70" y1="1020" x2="1850" y2="1020" />
    <line x1="70" y1="1010" x2="70" y2="1030" />
    <line x1="1850" y1="1010" x2="1850" y2="1030" />
    <text x="960" y="1014" text-anchor="middle">OVERALL LENGTH: 112.50 METERS [TOLERANCE ±0.05m]</text>
  </g>
</svg>
`)}`;

