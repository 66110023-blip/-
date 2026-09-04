import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FloorStation,
  CADRenderMode,
  ProductionLine,
  SnapGridSize,
} from '../types';
import { CATEGORY_METADATA } from '../data/defaultCadLayout';
import { CAD_FLOOR_SVG_DATA_URL } from '../data/defaultCadFloorImage';
import { CADVectorBlueprint } from './CADVectorBlueprint';
import {
  Activity,
  AlertCircle,
  Move,
  Maximize2,
  Gauge,
  User,
  Zap,
  Trash2,
  Layers,
  Eye,
  Flame,
  Cpu,
} from 'lucide-react';

interface CADCanvasProps {
  stations: FloorStation[];
  selectedStationId: string | null;
  selectedLine: ProductionLine;
  renderMode: CADRenderMode;
  imageOpacity: number;
  customImageUrl?: string;
  isEditMode: boolean;
  liveTelemetry: boolean;
  snapEnabled: boolean;
  gridSnap: SnapGridSize;
  showDimensions: boolean;
  activeCategoryFilter?: string | null;
  zoom: number;
  panOffset: { x: number; y: number };
  onStationSelect: (station: FloorStation | null) => void;
  onStationUpdate: (updatedStation: FloorStation, addToHistory?: boolean) => void;
  onStationDelete?: (stationId: string) => void;
  onStationDiagnosticsOpen: (station: FloorStation) => void;
  onStationDirectNavigate?: (station: FloorStation) => void;
  onPanChange: (offset: { x: number; y: number }) => void;
  onZoomChange?: (newZoom: number, newPanOffset?: { x: number; y: number }) => void;
}

type ResizeHandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export const CADCanvas: React.FC<CADCanvasProps> = ({
  stations,
  selectedStationId,
  selectedLine,
  renderMode,
  imageOpacity,
  customImageUrl,
  isEditMode,
  liveTelemetry,
  snapEnabled,
  gridSnap,
  showDimensions,
  activeCategoryFilter,
  zoom,
  panOffset,
  onStationSelect,
  onStationUpdate,
  onStationDelete,
  onStationDiagnosticsOpen,
  onStationDirectNavigate,
  onPanChange,
  onZoomChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasStageRef = useRef<HTMLDivElement>(null);

  // Dragging & Resizing State
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isWheeling, setIsWheeling] = useState(false);
  const wheelTimeoutRef = useRef<any>(null);

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ clientX: number; clientY: number; origX: number; origY: number } | null>(null);

  const [activeResize, setActiveResize] = useState<{
    stationId: string;
    handle: ResizeHandleType;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  } | null>(null);

  const [hoveredStation, setHoveredStation] = useState<FloorStation | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Snap coordinate helper
  const snapCoord = useCallback(
    (val: number): number => {
      if (!snapEnabled) return Number(val.toFixed(1));
      const step = gridSnap;
      return Number((Math.round(val / step) * step).toFixed(1));
    },
    [snapEnabled, gridSnap]
  );

  // Filter stations based on active line
  const visibleStations = stations.filter(
    (s) => selectedLine === 'ALL' || s.line === selectedLine
  );

  const selectedStation = stations.find((s) => s.id === selectedStationId) || null;

  // Handle Pan Dragging (Middle click or dragging on empty canvas)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasStageRef.current || (e.target as HTMLElement).classList.contains('cad-pan-target')) {
      if (e.button === 0 || e.button === 1) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
        onStationSelect(null);
      }
    }
  };

  // Station Drag Start (Edit Mode)
  const handleStationMouseDown = (e: React.MouseEvent, station: FloorStation) => {
    e.stopPropagation();
    onStationSelect(station);

    if (!isEditMode) {
      // Normal mode: do not drag
      return;
    }

    if (e.button !== 0) return; // Only left click for dragging

    setActiveDragId(station.id);
    setDragStartPos({
      clientX: e.clientX,
      clientY: e.clientY,
      origX: station.x,
      origY: station.y,
    });
  };

  // Resize Handle Start (Edit Mode)
  const handleResizeStart = (e: React.MouseEvent, station: FloorStation, handle: ResizeHandleType) => {
    e.stopPropagation();
    if (!isEditMode) return;

    setActiveResize({
      stationId: station.id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      origX: station.x,
      origY: station.y,
      origW: station.w,
      origH: station.h,
    });
  };

  // Global mouse move for drag, resize, pan
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // 1. Pan movement
      if (isPanning) {
        onPanChange({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
        return;
      }

      const canvas = canvasStageRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / 100;
      const scaleY = rect.height / 100;

      // 2. Station Drag movement
      if (activeDragId && dragStartPos) {
        const deltaXPixels = (e.clientX - dragStartPos.clientX) / zoom;
        const deltaYPixels = (e.clientY - dragStartPos.clientY) / zoom;

        const deltaXPercent = deltaXPixels / scaleX;
        const deltaYPercent = deltaYPixels / scaleY;

        const currentStation = stations.find((s) => s.id === activeDragId);
        if (currentStation) {
          const rawX = dragStartPos.origX + deltaXPercent;
          const rawY = dragStartPos.origY + deltaYPercent;

          const clampedX = Math.max(0, Math.min(100 - currentStation.w, rawX));
          const clampedY = Math.max(0, Math.min(100 - currentStation.h, rawY));

          const newX = snapCoord(clampedX);
          const newY = snapCoord(clampedY);

          if (newX !== currentStation.x || newY !== currentStation.y) {
            onStationUpdate({ ...currentStation, x: newX, y: newY }, false);
          }
        }
        return;
      }

      // 3. Station Resize movement
      if (activeResize) {
        const station = stations.find((s) => s.id === activeResize.stationId);
        if (!station) return;

        const deltaX = (e.clientX - activeResize.startX) / (scaleX * zoom);
        const deltaY = (e.clientY - activeResize.startY) / (scaleY * zoom);

        let newX = activeResize.origX;
        let newY = activeResize.origY;
        let newW = activeResize.origW;
        let newH = activeResize.origH;

        const minW = 2.5;
        const minH = 2.5;

        // Apply based on handle type
        if (activeResize.handle.includes('e')) {
          newW = Math.max(minW, activeResize.origW + deltaX);
        }
        if (activeResize.handle.includes('w')) {
          const potW = activeResize.origW - deltaX;
          if (potW >= minW) {
            newW = potW;
            newX = activeResize.origX + deltaX;
          }
        }
        if (activeResize.handle.includes('s')) {
          newH = Math.max(minH, activeResize.origH + deltaY);
        }
        if (activeResize.handle.includes('n')) {
          const potH = activeResize.origH - deltaY;
          if (potH >= minH) {
            newH = potH;
            newY = activeResize.origY + deltaY;
          }
        }

        // Snap and clamp
        newX = snapCoord(Math.max(0, Math.min(100 - newW, newX)));
        newY = snapCoord(Math.max(0, Math.min(100 - newH, newY)));
        newW = snapCoord(Math.min(100 - newX, newW));
        newH = snapCoord(Math.min(100 - newY, newH));

        onStationUpdate({ ...station, x: newX, y: newY, w: newW, h: newH }, false);
      }
    },
    [
      isPanning,
      panStart,
      activeDragId,
      dragStartPos,
      activeResize,
      zoom,
      stations,
      snapCoord,
      onPanChange,
      onStationUpdate,
    ]
  );

  const handleMouseUp = useCallback(() => {
    if (activeDragId) {
      const station = stations.find((s) => s.id === activeDragId);
      if (station) {
        onStationUpdate(station, true); // Push to history
      }
    }
    if (activeResize) {
      const station = stations.find((s) => s.id === activeResize.stationId);
      if (station) {
        onStationUpdate(station, true); // Push to history
      }
    }

    setIsPanning(false);
    setActiveDragId(null);
    setDragStartPos(null);
    setActiveResize(null);
  }, [activeDragId, activeResize, stations, onStationUpdate]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Mouse Wheel & Trackpad Pinch Zoom Handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onZoomChange) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent browser default window zooming / scrolling over canvas
      e.preventDefault();

      setIsWheeling(true);
      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => setIsWheeling(false), 120);

      const containerRect = container.getBoundingClientRect();

      // Mouse position relative to center of container (transform-origin of canvas)
      const mouseX = e.clientX - (containerRect.left + containerRect.width / 2);
      const mouseY = e.clientY - (containerRect.top + containerRect.height / 2);

      let zoomDelta: number;
      if (e.ctrlKey) {
        // Trackpad pinch-to-zoom gesture (ctrlKey is set to true by browsers on macOS/Windows trackpads)
        zoomDelta = -e.deltaY * 0.012;
      } else {
        // Standard mouse wheel
        const delta = Math.max(-120, Math.min(120, -e.deltaY));
        zoomDelta = delta * 0.0018;
      }

      const zoomMultiplier = Math.exp(zoomDelta);
      const minZoom = 0.35;
      const maxZoom = 4.0;
      const nextZoom = Math.max(minZoom, Math.min(maxZoom, Number((zoom * zoomMultiplier).toFixed(3))));

      if (Math.abs(nextZoom - zoom) < 0.0001) return;

      // Focal point zoom: adjust pan offset so the coordinate under the cursor remains stable
      const pointOnCanvasX = (mouseX - panOffset.x) / zoom;
      const pointOnCanvasY = (mouseY - panOffset.y) / zoom;

      const nextPanX = Math.round(mouseX - pointOnCanvasX * nextZoom);
      const nextPanY = Math.round(mouseY - pointOnCanvasY * nextZoom);

      onZoomChange(nextZoom, { x: nextPanX, y: nextPanY });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [zoom, panOffset, onZoomChange]);

  // Touch / Mobile Trackpad 2-Finger Pinch Zoom & Pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onZoomChange) return;

    let initialDist = 0;
    let initialZ = zoom;
    let initialP = panOffset;
    let initialCenter = { x: 0, y: 0 };
    let initialTouchPos = { x: 0, y: 0 };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        initialDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        initialZ = zoom;
        initialP = { ...panOffset };

        const containerRect = container.getBoundingClientRect();
        initialCenter = {
          x: (t1.clientX + t2.clientX) / 2 - (containerRect.left + containerRect.width / 2),
          y: (t1.clientY + t2.clientY) / 2 - (containerRect.top + containerRect.height / 2),
        };
        initialTouchPos = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDist > 0) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const scaleFactor = currentDist / initialDist;
        const nextZoom = Math.max(0.35, Math.min(4.0, Number((initialZ * scaleFactor).toFixed(3))));

        const currentTouchX = (t1.clientX + t2.clientX) / 2;
        const currentTouchY = (t1.clientY + t2.clientY) / 2;
        const deltaX = currentTouchX - initialTouchPos.x;
        const deltaY = currentTouchY - initialTouchPos.y;

        const pointOnCanvasX = (initialCenter.x - initialP.x) / initialZ;
        const pointOnCanvasY = (initialCenter.y - initialP.y) / initialZ;

        const nextPanX = Math.round(initialCenter.x + deltaX - pointOnCanvasX * nextZoom);
        const nextPanY = Math.round(initialCenter.y + deltaY - pointOnCanvasY * nextZoom);

        onZoomChange(nextZoom, { x: nextPanX, y: nextPanY });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        initialDist = 0;
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [zoom, panOffset, onZoomChange]);

  // Safari Gesture API for smooth Pinch Zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onZoomChange) return;

    let gestureStartZoom = zoom;
    let gestureStartPan = panOffset;
    let gestureFocal = { x: 0, y: 0 };

    const handleGestureStart = (e: any) => {
      e.preventDefault();
      gestureStartZoom = zoom;
      gestureStartPan = { ...panOffset };
      const containerRect = container.getBoundingClientRect();
      gestureFocal = {
        x: (e.clientX || containerRect.left + containerRect.width / 2) - (containerRect.left + containerRect.width / 2),
        y: (e.clientY || containerRect.top + containerRect.height / 2) - (containerRect.top + containerRect.height / 2),
      };
    };

    const handleGestureChange = (e: any) => {
      e.preventDefault();
      const scale = e.scale || 1;
      const nextZoom = Math.max(0.35, Math.min(4.0, Number((gestureStartZoom * scale).toFixed(3))));

      const pointOnCanvasX = (gestureFocal.x - gestureStartPan.x) / gestureStartZoom;
      const pointOnCanvasY = (gestureFocal.y - gestureStartPan.y) / gestureStartZoom;

      const nextPanX = Math.round(gestureFocal.x - pointOnCanvasX * nextZoom);
      const nextPanY = Math.round(gestureFocal.y - pointOnCanvasY * nextZoom);

      onZoomChange(nextZoom, { x: nextPanX, y: nextPanY });
    };

    const handleGestureEnd = (e: any) => {
      e.preventDefault();
    };

    container.addEventListener('gesturestart', handleGestureStart as any, { passive: false });
    container.addEventListener('gesturechange', handleGestureChange as any, { passive: false });
    container.addEventListener('gestureend', handleGestureEnd as any, { passive: false });

    return () => {
      container.removeEventListener('gesturestart', handleGestureStart as any);
      container.removeEventListener('gesturechange', handleGestureChange as any);
      container.removeEventListener('gestureend', handleGestureEnd as any);
    };
  }, [zoom, panOffset, onZoomChange]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleCanvasMouseDown}
      className={`relative w-full h-full overflow-hidden select-none bg-[#090d16] cad-pan-target ${
        isPanning ? 'cursor-grabbing' : isEditMode ? 'cursor-crosshair' : 'cursor-grab'
      }`}
    >
      {/* Zoomable / Pannable Inner Canvas Container */}
      <div
        ref={canvasStageRef}
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isPanning || activeDragId || activeResize || isWheeling ? 'none' : 'transform 0.15s ease-out',
        }}
        className="relative w-[1400px] h-[875px] max-w-none shadow-2xl mx-auto my-6 bg-white border border-[#334155] rounded-xs overflow-hidden"
      >
        {/* Layer 1: Floor Image / Blueprint Raster */}
        {(renderMode === 'image' || renderMode === 'hybrid') && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{ opacity: renderMode === 'hybrid' ? imageOpacity : 1 }}
          >
            <img
              src={customImageUrl || CAD_FLOOR_SVG_DATA_URL}
              alt="CAD Floor Plan Blueprint"
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>
        )}

        {/* Layer 2: Scalable Vector CAD Blueprint */}
        {(renderMode === 'vector' || renderMode === 'hybrid') && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{ opacity: renderMode === 'hybrid' ? 0.9 : 1 }}
          >
            <CADVectorBlueprint
              selectedLine={selectedLine}
              showGrid={renderMode === 'vector'}
              showDimensions={showDimensions}
              showLabels={true}
            />
          </div>
        )}

        {/* Dimension Overlay (When in image mode and showDimensions is toggled ON) */}
        {renderMode === 'image' && showDimensions && (
          <div className="absolute inset-0 pointer-events-none z-15">
            <CADVectorBlueprint
              selectedLine={selectedLine}
              showGrid={false}
              showDimensions={true}
              showLabels={false}
            />
          </div>
        )}

        {/* Layer 3: Dynamic Snap-to-Grid visual grid when in Edit Mode */}
        {isEditMode && snapEnabled && (
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle, #3b82f6 1px, transparent 1px)`,
              backgroundSize: `${gridSnap * 14}px ${gridSnap * 8.75}px`,
            }}
          />
        )}

        {/* Layer 4: Interactive Highlighted Equipment Zones */}
        <div className="absolute inset-0 z-20 pointer-events-auto">
          {visibleStations.map((station) => {
            const meta = CATEGORY_METADATA[station.category] || CATEGORY_METADATA.dispensing;
            const isSelected = station.id === selectedStationId;
            const isDragging = station.id === activeDragId;
            const isResizing = activeResize?.stationId === station.id;
            const isStationActive = isSelected || isDragging || isResizing;
            const isCategoryMatch =
              !activeCategoryFilter ||
              station.category === activeCategoryFilter ||
              station.category.startsWith(activeCategoryFilter);

            // Status indicator colors
            const statusColor =
              station.status === 'RUNNING'
                ? 'bg-emerald-500'
                : station.status === 'STOP'
                ? 'bg-rose-500 animate-pulse'
                : station.status === 'JAM_CLEAR'
                ? 'bg-amber-500 animate-bounce'
                : 'bg-slate-400';

            return (
              <div
                key={station.id}
                id={`station-${station.id}`}
                style={{
                  left: `${station.x}%`,
                  top: `${station.y}%`,
                  width: `${station.w}%`,
                  height: `${station.h}%`,
                  opacity: isCategoryMatch ? 1 : 0.3,
                  transition: 'all 0.2s ease',
                }}
                onMouseDown={(e) => handleStationMouseDown(e, station)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isEditMode) {
                    if (onStationDirectNavigate) {
                      onStationDirectNavigate(station);
                    } else {
                      onStationDiagnosticsOpen(station);
                    }
                  }
                }}
                onMouseEnter={(e) => {
                  if (!isEditMode && !isDragging && !isResizing) {
                    setHoveredStation(station);
                    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setHoverPos({ x: r.left + r.width / 2, y: r.top });
                  }
                }}
                onMouseLeave={() => setHoveredStation(null)}
                className={`absolute group cursor-pointer rounded-xs transition-all duration-75 flex flex-col justify-between p-1 select-none border ${
                  isStationActive
                    ? 'border-[#2563eb] ring-2 ring-[#2563eb]/50 z-30 shadow-lg shadow-blue-500/20'
                    : isCategoryMatch && activeCategoryFilter
                    ? 'border-sky-500 ring-2 ring-sky-400 z-20 shadow-md shadow-sky-500/30'
                    : `border-current ${meta.textColor} hover:ring-2 hover:ring-current/40 hover:z-20`
                }`}
              >
                {/* Background color overlay with subtle glass tint */}
                <div
                  className="absolute inset-0 rounded-xs pointer-events-none"
                  style={{
                    backgroundColor: `${meta.color}${isStationActive ? '33' : '18'}`,
                    backdropFilter: 'blur(0.5px)',
                  }}
                />

                {/* Top Badge: Machine Code & Status Pulse */}
                <div className="relative z-10 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColor}`}
                    />
                    <span className="font-mono text-[9px] font-black tracking-tight text-[#0f172a] bg-white/90 px-1 py-0.2 rounded-xs truncate shadow-2xs">
                      {station.code}
                    </span>
                  </div>

                  {liveTelemetry && station.oeePercent !== undefined && station.oeePercent > 0 && (
                    <span className="font-mono text-[8px] font-bold text-emerald-700 bg-emerald-100/90 px-0.8 py-0.2 rounded-xs shrink-0">
                      {station.oeePercent.toFixed(0)}%
                    </span>
                  )}
                </div>

                {/* Bottom Center: Line & Category icon */}
                <div className="relative z-10 flex items-end justify-between text-[8px] font-mono text-[#334155]">
                  <span className="bg-white/80 px-0.8 rounded-xs font-bold text-[7.5px] text-[#475569]">
                    {station.line}
                  </span>
                  {liveTelemetry && station.cycleTimeSec ? (
                    <span className="font-mono text-[7.5px] text-[#1e293b] font-medium bg-white/70 px-0.8 rounded-xs">
                      {station.cycleTimeSec}s
                    </span>
                  ) : (
                    <span className="text-[7.5px] text-[#64748b] truncate max-w-[45px]">
                      {station.category === 'packout' ? 'aoi' : station.category === 'ocr' ? 'xray' : station.category.replace('oven-', '')}
                    </span>
                  )}
                </div>

                {/* Real-time Floating Coordinate HUD Badge (Shown during drag/resize in Edit Mode) */}
                {isEditMode && isStationActive && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0f172a] text-white text-[9px] font-mono px-2 py-0.5 rounded-md shadow-xl whitespace-nowrap z-50 flex items-center gap-2 border border-[#3b82f6]">
                    <div className="flex items-center gap-1.5 pointer-events-none">
                      <Move className="w-2.5 h-2.5 text-blue-400" />
                      <span>
                        X: <strong className="text-blue-300">{station.x}%</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Y: <strong className="text-blue-300">{station.y}%</strong>
                      </span>
                      <span>•</span>
                      <span>
                        W: <strong className="text-emerald-300">{station.w}%</strong>
                      </span>
                      <span>•</span>
                      <span>
                        H: <strong className="text-emerald-300">{station.h}%</strong>
                      </span>
                    </div>

                    {onStationDelete && (
                      <button
                        type="button"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          onStationDelete(station.id);
                        }}
                        className="pointer-events-auto p-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors cursor-pointer flex items-center gap-0.5 px-1 font-sans text-[9px] font-bold"
                        title="Delete Station"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                )}

                {/* 8-Directional Resizing Handles (Shown when station is selected in Edit Mode) */}
                {isEditMode && isStationActive && (
                  <>
                    {/* NW Handle */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, station, 'nw')}
                      className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full cursor-nwse-resize z-40 hover:scale-125 transition-transform shadow-xs"
                    />
                    {/* N Handle */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, station, 'n')}
                      className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-600 rounded-full cursor-ns-resize z-40 hover:scale-125 transition-transform shadow-xs"
                    />
                    {/* NE Handle */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, station, 'ne')}
                      className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full cursor-nesw-resize z-40 hover:scale-125 transition-transform shadow-xs"
                    />
                    {/* E Handle */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, station, 'e')}
                      className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-600 rounded-full cursor-ew-resize z-40 hover:scale-125 transition-transform shadow-xs"
                    />
                    {/* SE Handle */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, station, 'se')}
                      className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full cursor-nwse-resize z-40 hover:scale-125 transition-transform shadow-xs"
                    />
                    {/* S Handle */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, station, 's')}
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-600 rounded-full cursor-ns-resize z-40 hover:scale-125 transition-transform shadow-xs"
                    />
                    {/* SW Handle */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, station, 'sw')}
                      className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-full cursor-nesw-resize z-40 hover:scale-125 transition-transform shadow-xs"
                    />
                    {/* W Handle */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, station, 'w')}
                      className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-600 rounded-full cursor-ew-resize z-40 hover:scale-125 transition-transform shadow-xs"
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Hover Tooltip (Shown on normal mode hover) */}
      {hoveredStation && !isEditMode && (() => {
        const meta = CATEGORY_METADATA[hoveredStation.category] || CATEGORY_METADATA.dispensing;
        return (
          <div
            style={{
              left: `${hoverPos.x}px`,
              top: `${hoverPos.y - 12}px`,
              transform: 'translate(-50%, -100%)',
            }}
            className="fixed z-50 pointer-events-none bg-[#0f172a]/95 backdrop-blur-md text-white border border-[#334155] rounded-xl p-3.5 shadow-2xl min-w-[240px] max-w-xs animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Tooltip Card with Dynamic Machine Category Theming */}
            <div
              className="flex items-center justify-between border-b pb-2 mb-2"
              style={{ borderColor: `${meta?.color || '#3b82f6'}50` }}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    hoveredStation.status === 'RUNNING'
                      ? 'bg-emerald-400 shadow-xs shadow-emerald-400/50'
                      : hoveredStation.status === 'STOP'
                      ? 'bg-rose-400 animate-pulse shadow-xs shadow-rose-400/50'
                      : 'bg-amber-400'
                  }`}
                />
                <span className="font-mono font-extrabold text-sm text-white">
                  {hoveredStation.code}
                </span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                  meta?.badgeClass || ''
                }`}
              >
                {hoveredStation.line} • {meta?.label}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-medium mb-2.5">
              {hoveredStation.name}
            </p>

            {/* Machine-Specific Parameter Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              {/* Param 1: Yield / OEE with Machine Color */}
              <div
                className="p-1.5 rounded-lg border"
                style={{
                  backgroundColor: `${meta?.color || '#0284c7'}15`,
                  borderColor: `${meta?.color || '#0284c7'}40`,
                }}
              >
                <span className="text-slate-300 text-[10px] flex items-center gap-1">
                  <Gauge
                    className="w-3 h-3"
                    style={{ color: meta?.color || '#0284c7' }}
                  />
                  {hoveredStation.category === 'xray' || hoveredStation.category === 'ocr'
                    ? 'X-ray Yield'
                    : hoveredStation.category === 'aoi' || hoveredStation.category === 'packout'
                    ? 'AOI Accuracy'
                    : hoveredStation.category === 'fvmi'
                    ? 'Vision Accuracy'
                    : hoveredStation.category.includes('oven')
                    ? 'Thermal Stability'
                    : 'OEE Rate'}
                </span>
                <span
                  className="font-bold text-xs"
                  style={{ color: meta?.color || '#10b981' }}
                >
                  {hoveredStation.oeePercent
                    ? `${hoveredStation.oeePercent}%`
                    : hoveredStation.category === 'xray' || hoveredStation.category === 'ocr'
                    ? '99.2%'
                    : hoveredStation.category === 'aoi' || hoveredStation.category === 'packout'
                    ? '98.9%'
                    : '98.5%'}
                </span>
              </div>

              {/* Param 2: Cycle Time / Speed / Temp with Machine Color */}
              <div
                className="p-1.5 rounded-lg border"
                style={{
                  backgroundColor: `${meta?.color || '#0284c7'}15`,
                  borderColor: `${meta?.color || '#0284c7'}40`,
                }}
              >
                <span className="text-slate-300 text-[10px] flex items-center gap-1">
                  <Activity
                    className="w-3 h-3"
                    style={{ color: meta?.color || '#0284c7' }}
                  />
                  {hoveredStation.category === 'xray' || hoveredStation.category === 'ocr'
                    ? 'Scan Latency'
                    : hoveredStation.category === 'aoi' || hoveredStation.category === 'packout'
                    ? 'Scan Time'
                    : hoveredStation.category === 'fvmi'
                    ? 'Inspect Time'
                    : hoveredStation.category.includes('oven')
                    ? 'Process Temp'
                    : 'Cycle Time'}
                </span>
                <span className="text-slate-100 font-bold text-xs">
                  {hoveredStation.category === 'xray' || hoveredStation.category === 'ocr'
                    ? '32 ms'
                    : hoveredStation.category === 'aoi' || hoveredStation.category === 'packout'
                    ? '2.4 s'
                    : hoveredStation.category.includes('oven')
                    ? `${hoveredStation.sensorTelemetry?.temperatureC || 175}°C`
                    : hoveredStation.cycleTimeSec
                    ? `${hoveredStation.cycleTimeSec}s`
                    : '3.5s'}
                </span>
              </div>

              {/* Machine-Specific Specs & Parameters */}
              <div
                className="p-1.5 rounded-lg border col-span-2 flex items-center justify-between text-[10px]"
                style={{
                  backgroundColor: `${meta?.color || '#0284c7'}20`,
                  borderColor: `${meta?.color || '#0284c7'}50`,
                }}
              >
                {hoveredStation.category === 'xray' || hoveredStation.category === 'ocr' ? (
                  <>
                    <span className="text-pink-300 font-medium flex items-center gap-1">
                      <Zap className="w-3 h-3 text-pink-400" /> 90kV Micro-Focus X-ray
                    </span>
                    <span className="text-pink-200 font-bold">BGA Radiography & NDT</span>
                  </>
                ) : hoveredStation.category === 'aoi' || hoveredStation.category === 'packout' ? (
                  <>
                    <span className="text-purple-300 font-medium flex items-center gap-1">
                      <Layers className="w-3 h-3 text-purple-400" /> Dual-Side AOI Optical
                    </span>
                    <span className="text-purple-200 font-bold">Telecentric Vision & AI</span>
                  </>
                ) : hoveredStation.category === 'fvmi' ? (
                  <>
                    <span className="text-orange-300 font-medium flex items-center gap-1">
                      <Eye className="w-3 h-3 text-orange-400" /> Dual-Camera AI Vision
                    </span>
                    <span className="text-orange-200 font-bold">Defect AI Active</span>
                  </>
                ) : hoveredStation.category === 'oven-vacuum' ? (
                  <>
                    <span className="text-emerald-300 font-medium flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-400" /> Vacuum Degas Pump
                    </span>
                    <span className="text-emerald-200 font-bold">&lt; 0.05 Pa High Vacuum</span>
                  </>
                ) : hoveredStation.category === 'oven-bake' ? (
                  <>
                    <span className="text-amber-300 font-medium flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" /> Multi-Zone Pre-Cure
                    </span>
                    <span className="text-amber-200 font-bold">175°C ± 1.5°C</span>
                  </>
                ) : (
                  <>
                    <span className="text-sky-300 font-medium flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-sky-400" /> Piezo Jetting Valve
                    </span>
                    <span className="text-sky-200 font-bold">Fluid Line Active</span>
                  </>
                )}
              </div>
            </div>

            <div
              className="mt-2.5 pt-2 border-t text-[10px] flex items-center justify-center gap-1 font-sans font-medium"
              style={{
                borderColor: `${meta?.color || '#3b82f6'}40`,
                color: meta?.color || '#38bdf8',
              }}
            >
              <Zap className="w-3.5 h-3.5" style={{ color: meta?.color || '#f59e0b' }} />
              <span>Click to view station telemetry & status ({hoveredStation.code})</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
