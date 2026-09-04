import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'th';

export interface Translations {
  [key: string]: {
    en: string;
    th: string;
  };
}

export const TRANSLATIONS: Translations = {
  // Brand & Header
  'brand.title': { en: 'FACILITY COMMAND', th: 'ระบบควบคุมโรงงาน' },
  'nav.facility_map': { en: 'Facility Map', th: 'แผนผังโรงงาน' },
  'nav.main_floor': { en: 'Main Floor (CAD)', th: 'ผังโรงงานหลัก (CAD)' },
  'nav.process_view': { en: 'Process View', th: 'มุมมองกระบวนการ' },
  'nav.process': { en: 'Process', th: 'กระบวนการ' },
  'nav.analytics': { en: 'Analytics & KPIs', th: 'การวิเคราะห์ & KPI' },
  'nav.alerts': { en: 'Alerts & Issues', th: 'การแจ้งเตือน & ปัญหา' },
  'nav.upload_layout': { en: 'Upload Layout', th: 'อัปโหลดเลย์เอาต์' },
  'nav.custom_layout': { en: 'Custom Layout', th: 'เลย์เอาต์กำหนดเอง' },
  'nav.cad_map': { en: 'CAD Map', th: 'แผนที่ CAD' },
  'nav.settings': { en: 'Settings', th: 'การตั้งค่า' },
  'nav.back': { en: 'Go Back', th: 'ย้อนกลับ' },

  // Language
  'lang.language': { en: 'Language', th: 'ภาษา' },
  'lang.en': { en: 'English', th: 'English' },
  'lang.th': { en: 'ไทย', th: 'ไทย' },
  'lang.switch': { en: 'Switch Language', th: 'เปลี่ยนภาษา' },

  // CAD Modes & Toolbar
  'cad.mode.image': { en: 'Floor Image', th: 'ภาพผังโรงงาน' },
  'cad.mode.vector': { en: 'Vector CAD', th: 'เวกเตอร์ CAD' },
  'cad.mode.hybrid': { en: 'Hybrid', th: 'แบบผสม (Hybrid)' },
  'cad.dimensions': { en: 'Dimensions', th: 'ขนาดมิติ' },
  'cad.dimensions_on': { en: 'Dimensions: ON', th: 'ขนาดมิติ: เปิด' },
  'cad.dimensions_off': { en: 'Dimensions: OFF', th: 'ขนาดมิติ: ปิด' },
  'cad.edit_mode': { en: 'Edit Layout Mode', th: 'โหมดแก้ไขเลย์เอาต์' },
  'cad.exit_calibration': { en: 'Exit Calibration', th: 'ออกจากโหมดปรับเทียบ' },
  'cad.history': { en: 'History', th: 'ประวัติ' },
  'cad.add_equipment': { en: 'Add Equipment', th: 'เพิ่มเครื่องจักร/อุปกรณ์' },
  'cad.duplicate': { en: 'Duplicate', th: 'ทำสำเนา' },
  'cad.delete': { en: 'Delete', th: 'ลบ' },
  'cad.snap': { en: 'Snap', th: 'สแน็ปกริด' },
  'cad.json_layout': { en: 'JSON Layout', th: 'โครงสร้าง JSON' },
  'cad.restore_last_saved': { en: 'Restore Last Saved', th: 'กู้คืนค่าที่บันทึกล่าสุด' },
  'cad.reset_defaults': { en: 'Reset to Defaults', th: 'รีเซ็ตเป็นค่าเริ่มต้น' },
  'cad.save_layout': { en: 'Save Calibrated Layout', th: 'บันทึกเลย์เอาต์ปรับเทียบ' },
  'cad.zoom_in': { en: 'Zoom In', th: 'ขยาย' },
  'cad.zoom_out': { en: 'Zoom Out', th: 'ย่อ' },
  'cad.reset_zoom': { en: 'Reset to 100%', th: 'รีเซ็ต 100%' },
  'cad.fullscreen': { en: 'Fullscreen', th: 'เต็มจอ' },
  'cad.exit_fullscreen': { en: 'Exit Fullscreen', th: 'ออกจากเต็มจอ' },

  // Production Lines & Categories
  'line.all': { en: 'ALL Lines', th: 'ทุกไลน์ผลิต' },
  'line.l1': { en: 'Line 1', th: 'ไลน์ 1' },
  'line.l2': { en: 'Line 2', th: 'ไลน์ 2' },
  'line.l3': { en: 'Line 3', th: 'ไลน์ 3' },
  'line.l4': { en: 'Line 4', th: 'ไลน์ 4' },
  'line.l5': { en: 'Line 5', th: 'ไลน์ 5' },
  'line.l6': { en: 'Line 6', th: 'ไลน์ 6' },

  // Machine Categories & Equipment
  'cat.dispensing': { en: 'Dispensing (Top & Under Fill)', th: 'หยอดกาว (Top & Under Fill)' },
  'cat.oven_vacuum': { en: 'Vacuum Chamber', th: 'เตาอบสุญญากาศ' },
  'cat.oven_bake': { en: 'Bake Oven Tunnel', th: 'อุโมงค์เตาอบความร้อน' },
  'cat.fvmi': { en: 'First Visual Mechanical Inspection', th: 'การตรวจสอบสายตา FVMI' },
  'cat.packout': { en: 'Pack Out & Buffer', th: 'การบรรจุ & ถาดพัก' },
  'cat.ocr': { en: 'OCR 2D Matrix Scanner', th: 'เครื่องอ่านโค้ด 2D OCR' },

  // Machine Statuses
  'status.running': { en: 'RUNNING', th: 'กำลังทำงาน' },
  'status.stop': { en: 'STOP', th: 'หยุดทำงาน' },
  'status.idle': { en: 'IDLE', th: 'พร้อมใช้งาน/พัก' },
  'status.jam_clear': { en: 'JAM CLEAR', th: 'กำลังเคลียร์การติดขัด' },

  // Layout Customization & Internal Data Link
  'layout.customize_title': { en: 'Layout Customization & Telemetry Link', th: 'หน้าปรับแต่งเลย์เอาต์และเชื่อมโยงข้อมูลภายใน' },
  'layout.linked_equipment': { en: 'Linked Line Equipment & Machines', th: 'เครื่องจักรและอุปกรณ์ที่เชื่อมโยงในไลน์' },
  'layout.sync_status': { en: 'Linked with Live Factory State', th: 'เชื่อมโยงกับสถานะโรงงานจริง' },
  'layout.change_line_model': { en: 'Update Running Model for Line', th: 'เปลี่ยนรุ่นการผลิตทั้งไลน์' },
  'layout.active_units': { en: 'Active Units', th: 'เครื่องที่กำลังทำงาน' },
  'layout.line_throughput': { en: 'Line Throughput', th: 'ยอดผลิตของไลน์' },
  'layout.view_details': { en: 'View Machine Details', th: 'ดูข้อมูลเครื่องจักร' },

  // Metrics & Labels
  'metric.oee': { en: 'OEE', th: 'ประสิทธิผล OEE' },
  'metric.uph': { en: 'UPH', th: 'ยอดผลิตต่อชม. (UPH)' },
  'metric.target_uph': { en: 'Target UPH', th: 'เป้าหมาย UPH' },
  'metric.cycle_time': { en: 'Cycle Time', th: 'เวลารอบการผลิต' },
  'metric.running_model': { en: 'Running Model', th: 'รุ่นที่กำลังผลิต' },
  'metric.operator': { en: 'Operator', th: 'ผู้ควบคุมเครื่อง' },
  'metric.input': { en: 'Input', th: 'จำนวนรับเข้า' },
  'metric.output': { en: 'Output', th: 'จำนวนผลิตได้' },
  'metric.shift': { en: 'Shift Time', th: 'กะเวลา' },
  'metric.temperature': { en: 'Temperature', th: 'อุณหภูมิ' },
  'metric.pressure': { en: 'Pressure', th: 'แรงดัน' },
  'metric.vibration': { en: 'Vibration', th: 'การสั่นสะเทือน' },
  'metric.flow_rate': { en: 'Flow Rate', th: 'อัตราการไหล' },
  'metric.current': { en: 'Current', th: 'กระแสไฟ' },
  'metric.magazines': { en: 'Magazines', th: 'จำนวน Magazine' },
  'metric.magazine_count': { en: 'Magazine Count', th: 'จำนวน Magazine' },

  // Settings Modal
  'settings.title': { en: 'Dashboard Configuration', th: 'การกำหนดค่าระบบ' },
  'settings.clock': { en: 'PST System Clock', th: 'นาฬิกาเวลามาตรฐาน PST' },
  'settings.cad_layout': { en: 'Production Line CAD Layout', th: 'ผัง CAD ไลน์การผลิต' },
  'settings.upload_change': { en: 'Upload or Change Layout', th: 'อัปโหลดหรือเปลี่ยนผัง' },
  'settings.realtime_engine': { en: 'Real-Time Engine', th: 'ระบบจำลองข้อมูลสด' },
  'settings.sim_active': { en: 'Live Simulation Active', th: 'กำลังจำลองข้อมูลสด' },
  'settings.sim_paused': { en: 'Simulation Paused', th: 'หยุดจำลองข้อมูลชั่วคราว' },
  'settings.close': { en: 'Close', th: 'ปิด' },

  // Alerts Modal
  'alerts.title': { en: 'Active Alerts & Issue Logs', th: 'รายการแจ้งเตือนและปัญหาปัจจุบัน' },
  'alerts.no_issues': { en: 'No unresolved critical alerts', th: 'ไม่มีการแจ้งเตือนวิกฤตที่ค้างอยู่' },
};

const STORAGE_LANG_KEY = 'factory_app_language_v1';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      if (saved === 'en') return 'en';
    } catch (e) {}
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
    } catch (e) {}
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'th' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: string, defaultText?: string): string => {
    const item = TRANSLATIONS[key];
    if (item && item[language]) {
      return item[language];
    }
    return defaultText !== undefined ? defaultText : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
