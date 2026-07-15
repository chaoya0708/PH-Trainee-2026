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
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwfnYVUJiOggtH2f9Ob6YgaIUeuW3_wuFFecoYVnQKE-O93vAlxd4WQ50eULBSGP4Tcaw/exec',

  // ----------------------------------------------------------------
  // 密碼設定 / PIN & Access Codes (請自行修改 / Please change these)
  // ----------------------------------------------------------------
  ADMIN_PIN:      '0000',      // 計畫導師 (Mentor) 密碼
  GUEST_CODE:     'vimei2026', // 輪調主管/同仁 (Assessor) 授權代碼
  EXECUTIVE_CODE: 'vimeivip',  // 高階決策主管 (Executive) 授權代碼

  // ----------------------------------------------------------------
  // 管理者資訊 / Admin Info
  // ----------------------------------------------------------------
  ADMIN: {
    id:     'admin',
    name:   'Mentor',
    avatar: '🧑‍🏫',
    bio:    ''
  },

  // ----------------------------------------------------------------
  // 國際生名單與個人 PIN / Trainees & Individual PINs
  // ----------------------------------------------------------------
  TRAINEES: [
    {
      id:     'diane',
      name:   '白妙儀 (Diane Solomon Barcelenia)',
      avatar: '',
      pin:    '1111',
      bio:    ''
    },
    {
      id:     'mark',
      name:   '段亦林 (Mark Jayzon Comon Dagala)',
      avatar: '',
      pin:    '2222',
      bio:    ''
    },
    {
      id:     'jairuz',
      name:   '侯俊材 (Jairuz Delos Reyes Nazareno)',
      avatar: '',
      pin:    '3333',
      bio:    ''
    }
  ],

  // ----------------------------------------------------------------
  // 輪調部門 / Rotation Departments
  // ----------------------------------------------------------------
  DEPARTMENTS: {
    // Chimei
    cmf_production:    { id: 'cmf_production',    name: 'Chimei - Production',              nameZh: 'Chimei - 生產',               shortZh: '生產',    shortEn: 'Prod',   color: '#64748b', icon: '' },
    cmf_qc:            { id: 'cmf_qc',            name: 'Chimei - QA/QC',                   nameZh: 'Chimei - 品管',               shortZh: '品管',    shortEn: 'QA/QC',  color: '#64748b', icon: '' },
    cmf_rd_chinese:    { id: 'cmf_rd_chinese',    name: 'Chimei - R&D (Chinese Dim Sum)',   nameZh: 'Chimei - 研發 (中點)',        shortZh: '研發中',   shortEn: 'R&D(C)', color: '#64748b', icon: '' },
    cmf_rd_western:    { id: 'cmf_rd_western',    name: 'Chimei - R&D (Western Pastry)',    nameZh: 'Chimei - 研發 (西點)',        shortZh: '研發西',   shortEn: 'R&D(W)', color: '#64748b', icon: '' },
    // Yushan
    yushan_qc:         { id: 'yushan_qc',         name: 'Yushan - QA/QC',                   nameZh: 'Yushan - 品管',               shortZh: 'Yushan品管', shortEn: 'YS QA', color: '#ea580c', icon: '' },
    yushan_prep:       { id: 'yushan_prep',       name: 'Yushan - Pre-processing',          nameZh: 'Yushan - 前處理段',           shortZh: '前處理',   shortEn: 'Prep',   color: '#ea580c', icon: '' },
    yushan_cooking:    { id: 'yushan_cooking',    name: 'Yushan - Cooking',                 nameZh: 'Yushan - 烹煮段',             shortZh: '烹煮段',   shortEn: 'Cook',   color: '#ea580c', icon: '' },
    yushan_packaging:  { id: 'yushan_packaging',  name: 'Yushan - Packaging',               nameZh: 'Yushan - 包裝段',             shortZh: '包裝段',   shortEn: 'Pack',   color: '#ea580c', icon: '' },
    yushan_warehouse:  { id: 'yushan_warehouse',  name: 'Yushan - Warehouse & Cold Storage',nameZh: 'Yushan - 倉儲物流與凍庫管理',  shortZh: '倉儲',     shortEn: 'Whse',   color: '#ea580c', icon: '' }
  },

  // ----------------------------------------------------------------
  // 初始排程（Demo 模式使用）
  // ----------------------------------------------------------------
  DEFAULT_SCHEDULES: {
    diane: {
      '2026-07-13': { dept: 'yushan_prep',    objective: 'Inspect ozone water concentration levels for leafy greens and record temperature logs.' },
      '2026-07-14': { dept: 'yushan_prep',    objective: 'Observe 5S execution in the sorting area and identify bottleneck points.' },
      '2026-07-15': { dept: 'yushan_cooking', objective: 'Understand cooking time-temperature logs for dim sum fillings (CCP1).' },
      '2026-07-16': { dept: 'cmf_rd_chinese', objective: 'Participate in Chinese Dim Sum R&D sensory evaluation tests.' },
      '2026-07-17': { dept: 'yushan_qc',      objective: 'Audit raw material inspection reports and supplier deviation records.' }
    },
    mark: {
      '2026-07-13': { dept: 'yushan_prep',      objective: 'Examine layout efficiency of vegetable dicing machines.' },
      '2026-07-14': { dept: 'yushan_cooking',   objective: 'Monitor energy consumption of high-pressure jacketed steam kettles.' },
      '2026-07-15': { dept: 'cmf_production',   objective: 'Analyze production throughput bottlenecks on the main assembly line.' },
      '2026-07-16': { dept: 'yushan_packaging', objective: 'Analyze sealing integrity issues on Tray Sealing Machine A.' },
      '2026-07-17': { dept: 'yushan_warehouse', objective: 'Inspect raw material cold storage room temperature controls and FIFO stack practices.' }
    },
    jairuz: {
      '2026-07-13': { dept: 'cmf_qc',         objective: 'Check sanitation records of workers in the sanitizing chamber.' },
      '2026-07-14': { dept: 'yushan_qc',      objective: 'Validate CCP calibration records for metal detectors.' },
      '2026-07-15': { dept: 'cmf_qc',         objective: 'Perform swab test sampling and analyze bacterial plate count procedure.' },
      '2026-07-16': { dept: 'yushan_prep',    objective: 'Inspect chemical pesticide residue detection logs.' },
      '2026-07-17': { dept: 'yushan_packaging', objective: 'Establish leak-test SOP for gas-flush bags.' }
    }
  }

};
