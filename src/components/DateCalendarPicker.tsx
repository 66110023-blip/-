import React, { useState, useRef, useEffect } from 'react';
import { useFactory } from '../context/FactoryContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  RotateCcw,
  CalendarDays
} from 'lucide-react';

interface DateCalendarPickerProps {
  compact?: boolean;
  align?: 'left' | 'right';
  className?: string;
}

export const DateCalendarPicker: React.FC<DateCalendarPickerProps> = ({
  compact = false,
  align = 'right',
  className = ''
}) => {
  const { selectedDate, setSelectedDate, isToday } = useFactory();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse current selectedDate into Year, Month, Day
  const [viewYear, setViewYear] = useState<number>(() => {
    const d = new Date(selectedDate);
    return isNaN(d.getTime()) ? new Date().getFullYear() : d.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    const d = new Date(selectedDate);
    return isNaN(d.getTime()) ? new Date().getMonth() : d.getMonth(); // 0-indexed
  });

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Sync view when selectedDate changes externally
  useEffect(() => {
    const d = new Date(selectedDate);
    if (!isNaN(d.getTime())) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [selectedDate]);

  // Format DD/MM/YYYY
  const formatDisplayDate = (isoStr: string) => {
    try {
      const parts = isoStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      const d = new Date(isoStr);
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return isoStr;
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun

  const handleSelectDay = (day: number) => {
    const formattedMonth = (viewMonth + 1).toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
    setSelectedDate(dateStr);
    setIsOpen(false);
  };

  const setPreset = (offsetDays: number) => {
    // Current real date
    const base = new Date();
    base.setDate(base.getDate() - offsetDays);
    const y = base.getFullYear();
    const m = (base.getMonth() + 1).toString().padStart(2, '0');
    const d = base.getDate().toString().padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const selectedDayParts = selectedDate.split('-');
  const isSelectedInView =
    parseInt(selectedDayParts[0], 10) === viewYear &&
    parseInt(selectedDayParts[1], 10) - 1 === viewMonth;
  const currentSelectedDay = isSelectedInView ? parseInt(selectedDayParts[2], 10) : null;

  return (
    <div className={`relative inline-block text-left z-40 ${className}`} ref={dropdownRef}>
      {/* Date Pill / Button (DD/MM/YYYY) */}
      <button
        id="date-picker-button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 font-mono text-xs font-bold rounded-lg border transition-all cursor-pointer select-none ${
          !isToday
            ? 'bg-[#eff6ff] text-[#1d4ed8] border-[#93c5fd] hover:bg-[#dbeafe] shadow-2xs'
            : 'bg-white text-[#051125] border-[#cbd5e1] hover:bg-[#f8fafc] hover:border-[#94a3b8] shadow-2xs'
        } ${
          compact ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
        }`}
        title="Click to choose a date"
      >
        <CalendarIcon className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-[#051125]`} />
        <span className="tracking-wide">{formatDisplayDate(selectedDate)}</span>
        {!isToday && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-pulse ml-0.5" />
        )}
      </button>

      {/* Calendar Dropdown Popup */}
      {isOpen && (
        <div
          id="date-picker-dropdown"
          className={`absolute mt-2 w-72 md:w-80 bg-white rounded-xl shadow-xl border-2 border-[#051125] p-3.5 z-50 text-[#051125] ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {/* Header with Title and Presets */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#e2e8f0]">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-[#051125]" />
              <span className="text-xs font-black uppercase tracking-wider text-[#051125]">
                Select Production Date
              </span>
            </div>
            {!isToday && (
              <button
                onClick={() => setPreset(0)}
                className="text-[10px] font-bold text-[#2563eb] bg-[#eff6ff] hover:bg-[#dbeafe] px-2 py-0.5 rounded border border-[#bfdbfe] flex items-center gap-1 cursor-pointer transition-colors"
                title="Reset to today"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Today
              </button>
            )}
          </div>

          {/* Quick Date Presets */}
          <div className="grid grid-cols-4 gap-1 py-2 border-b border-[#f1f5f9]">
            <button
              onClick={() => setPreset(0)}
              className={`text-[10px] font-bold py-1 px-1.5 rounded text-center transition-colors cursor-pointer ${
                isToday ? 'bg-[#051125] text-white' : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setPreset(1)}
              className="text-[10px] font-bold py-1 px-1.5 rounded bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0] text-center transition-colors cursor-pointer"
            >
              -1 Day
            </button>
            <button
              onClick={() => setPreset(2)}
              className="text-[10px] font-bold py-1 px-1.5 rounded bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0] text-center transition-colors cursor-pointer"
            >
              -2 Days
            </button>
            <button
              onClick={() => setPreset(7)}
              className="text-[10px] font-bold py-1 px-1.5 rounded bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0] text-center transition-colors cursor-pointer"
            >
              -7 Days
            </button>
          </div>

          {/* Month & Year Navigation */}
          <div className="flex items-center justify-between py-2">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-[#f1f5f9] rounded-md transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 text-[#051125]" />
            </button>
            <span className="font-extrabold text-xs tracking-tight text-[#051125]">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-[#f1f5f9] rounded-md transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4 text-[#051125]" />
            </button>
          </div>

          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-[#94a3b8] py-1 border-b border-[#f1f5f9]">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1 pt-1.5">
            {/* Empty slots for start of month */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7 w-7" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = day === currentSelectedDay;
              const now = new Date();
              const isDayToday =
                viewYear === now.getFullYear() &&
                viewMonth === now.getMonth() &&
                day === now.getDate();

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 w-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer relative mx-auto ${
                    isSelected
                      ? 'bg-[#051125] text-white shadow-xs scale-105'
                      : isDayToday
                      ? 'bg-[#eff6ff] text-[#1d4ed8] border border-[#93c5fd] hover:bg-[#dbeafe]'
                      : 'text-[#1e293b] hover:bg-[#f1f5f9]'
                  }`}
                >
                  {day}
                  {isDayToday && !isSelected && (
                    <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#2563eb]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="mt-3 pt-2.5 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] font-medium text-[#64748b]">
            <span>Viewing: <strong className="text-[#051125] font-mono">{formatDisplayDate(selectedDate)}</strong></span>
            <span className="text-[10px] bg-[#f1f5f9] px-2 py-0.5 rounded font-mono font-bold text-[#051125]">
              {isToday ? 'LIVE' : 'HISTORY'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
