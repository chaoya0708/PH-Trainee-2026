/**
 * VIMEI Knowledge Tracker - System Configuration
 * ================================================
 * 修改這個檔案來設定 PIN 碼、學員名單及 Google Sheets 連結
 * Edit this file to configure PINs, trainees, and Google Sheets connection
 */

const CONFIG = {

  // ----------------------------------------------------------------
  // 模式設定 / Mode Setting
  // true  = Demo 模式（資料存在瀏覽器，用於測試）
  // false = 正式模式（資料存到 Google Sheets，需先完成 SETUP_GUIDE.md 步驟）
  // ----------------------------------------------------------------
  DEMO_MODE: false,

  // ----------------------------------------------------------------
  // Google Apps Script 網址（完成 SETUP_GUIDE.md 步驟後貼入）
  // ----------------------------------------------------------------
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyr7udXNLP9mnMyrLfdjuMLhAkXawjRiu_k2b4fUT9wYtMXmWwaOy4b5ZueIr6QI07j8A/exec',

  // ----------------------------------------------------------------
  // 密碼設定 / PIN & Access Codes (請自行修改 / Please change these)
  // ----------------------------------------------------------------
  ADMIN_PIN: '0000',      // 計畫導師 (Mentor) 密碼
  GUEST_CODE: 'vimei2026', // 輪調主管/同仁 (Assessor) 授權代碼
  EXECUTIVE_CODE: 'vimeivip',  // 高階決策主管 (Executive) 授權代碼

  // ----------------------------------------------------------------
  // UI 設定 / UI Settings
  // ----------------------------------------------------------------
  DEFAULT_LANG:  'en',    // 'en' or 'zh'
  DEFAULT_THEME: 'light', // 'light' or 'dark',

  // ----------------------------------------------------------------
  // 管理者資訊 / Admin Info
  // ----------------------------------------------------------------
  ADMIN: {
    id: 'admin',
    name: 'Mentor',
    avatar: '🧑‍🏫',
    bio: ''
  },

  // ----------------------------------------------------------------
  // 國際生名單與個人 PIN / Trainees & Individual PINs
  // ----------------------------------------------------------------
  TRAINEES: [
    {
      id: 'diane',
      name: '白妙儀 (Diane Solomon Barcelenia)',
      avatar: '',
      pin: '1111',
      bio: ''
    },
    {
      id: 'mark',
      name: '段亦林 (Mark Jayzon Comon Dagala)',
      avatar: '',
      pin: '2222',
      bio: ''
    },
    {
      id: 'jairuz',
      name: '侯俊材 (Jairuz Delos Reyes Nazareno)',
      avatar: '',
      pin: '3333',
      bio: ''
    }
  ],

  // ----------------------------------------------------------------
  // 輪調部門 / Rotation Departments
  // ----------------------------------------------------------------
  DEPARTMENTS: {
    // Chimei
    cmf_production: { id: 'cmf_production', name: 'Chimei - Production', nameZh: 'Chimei - 生產', shortZh: '生產', shortEn: 'Prod', color: '#64748b', icon: '' },
    cmf_qc: { id: 'cmf_qc', name: 'Chimei - QA/QC', nameZh: 'Chimei - 品管', shortZh: '品管', shortEn: 'QA/QC', color: '#64748b', icon: '' },
    cmf_rd_chinese: { id: 'cmf_rd_chinese', name: 'Chimei - R&D (Chinese Dim Sum)', nameZh: 'Chimei - 研發 (中點)', shortZh: '研發中', shortEn: 'R&D(C)', color: '#64748b', icon: '' },
    cmf_rd_western: { id: 'cmf_rd_western', name: 'Chimei - R&D (Western Pastry)', nameZh: 'Chimei - 研發 (西點)', shortZh: '研發西', shortEn: 'R&D(W)', color: '#64748b', icon: '' },
    // Yushan
    yushan_qc: { id: 'yushan_qc', name: 'Yushan - QA/QC', nameZh: 'Yushan - 品管', shortZh: 'Yushan品管', shortEn: 'YS QA', color: '#ea580c', icon: '' },
    yushan_prep: { id: 'yushan_prep', name: 'Yushan - Pre-processing', nameZh: 'Yushan - 前處理段', shortZh: '前處理', shortEn: 'Prep', color: '#ea580c', icon: '' },
    yushan_cooking: { id: 'yushan_cooking', name: 'Yushan - Cooking', nameZh: 'Yushan - 烹煮段', shortZh: '烹煮段', shortEn: 'Cook', color: '#ea580c', icon: '' },
    yushan_packaging: { id: 'yushan_packaging', name: 'Yushan - Packaging', nameZh: 'Yushan - 包裝段', shortZh: '包裝段', shortEn: 'Pack', color: '#ea580c', icon: '' },
    yushan_warehouse: { id: 'yushan_warehouse', name: 'Yushan - Warehouse & Cold Storage', nameZh: 'Yushan - 倉儲物流與凍庫管理', shortZh: '倉儲', shortEn: 'Whse', color: '#ea580c', icon: '' },
    // Other
    holiday: { id: 'holiday', name: 'Day Off / Company Trip', nameZh: '休假日 / 員工旅遊', shortZh: '休假', shortEn: 'Off', color: '#10b981', icon: '' }
  },

  // ----------------------------------------------------------------
  // 初始排程（Demo 模式使用）
  // ----------------------------------------------------------------
  DEFAULT_SCHEDULES: {
    diane: {
      '2026-06-15': { dept: 'cmf_production', objective: '調理單位執行燒賣調理配餡 / Siomai Filling Preparation' },
      '2026-06-16': { dept: 'cmf_production', objective: '調理單位執行燒賣調理配餡 / Siomai Filling Preparation' },
      '2026-06-17': { dept: 'cmf_production', objective: '調理單位執行燒賣調理配餡 / Siomai Filling Preparation' },
      '2026-06-18': { dept: 'cmf_production', objective: '調理單位執行燒賣調理配餡 / Siomai Filling Preparation' },
      '2026-06-19': { dept: 'cmf_production', objective: '調理單位執行燒賣調理配餡 / Siomai Filling Preparation' },
      '2026-06-22': { dept: 'cmf_production', objective: '調理單位執行燒賣調理配餡 / Siomai Filling Preparation' },
      '2026-06-23': { dept: 'cmf_production', objective: '調理單位執行燒賣調理配餡 / Siomai Filling Preparation' },
      '2026-06-24': { dept: 'cmf_production', objective: '調理單位執行燒賣調理配餡 / Siomai Filling Preparation' },
      '2026-06-25': { dept: 'cmf_production', objective: '調理單位執行燒賣調理配餡 / Siomai Filling Preparation' },
      '2026-06-26': { dept: 'cmf_production', objective: '調理單位執行燒賣調理配餡 / Siomai Filling Preparation' }
    },
    mark: {
      '2026-06-01': { dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' },
      '2026-06-02': { dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' },
      '2026-06-03': { dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' },
      '2026-06-04': { dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' },
      '2026-06-05': { dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' },
      '2026-06-08': { dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' },
      '2026-06-09': { dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' },
      '2026-06-10': { dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' },
      '2026-06-11': { dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' },
      '2026-06-12': { dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' },
      '2026-06-29': { dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' },
      '2026-06-30': { dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' },
      '2026-07-01': { dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' },
      '2026-07-02': { dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' },
      '2026-07-03': { dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' },
      '2026-07-06': { dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' },
      '2026-07-07': { dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' },
      '2026-07-08': { dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' },
      '2026-07-09': { dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' },
      '2026-07-10': { dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' }
    },
    jairuz: {
      '2026-06-01': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-06-02': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-06-03': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-06-04': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-06-05': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-06-08': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-06-09': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-06-10': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-06-11': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-06-12': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-06-15': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-06-16': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-06-17': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-06-18': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-06-19': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-06-22': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-06-23': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-06-24': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-06-25': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-06-26': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-06-29': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-06-30': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-07-01': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-07-02': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-07-03': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-07-06': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-07-07': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-07-08': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-07-09': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' },
      '2026-07-10': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' }
    }
  }


};
