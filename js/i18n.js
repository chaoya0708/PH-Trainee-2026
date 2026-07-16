/**
 * VIMEI Knowledge Tracker - i18n Translation Dictionary (v2)
 */

const I18N = {
  en: {
    // App
    appTitle:    'Training Program Tracker',
    appSubTitle: 'Trainee Learning Journey & Milestone System',

    // Login
    loginSelectRole:   'Select Your Role',
    loginAdmin:        'Mentor',
    loginTrainee:      'Trainee',
    loginGuest:        'Supervisor/Colleague',
    roleMentorName:    'Program Mentor',
    roleTraineeName:   'Trainee',
    roleAssessorName:  'Station Assessor',
    roleExecutiveName: 'Management Team',
    loginAdminLabel:   'Enter Mentor PIN',
    loginTraineeName:  'Select Your Name',
    loginTraineePin:   'Enter Your PIN',
    loginGuestLabel:   'Enter Access Code',
    loginBtn:          'Login',
    loginEnterBtn:     'Enter',
    loginBack:         '← Back',
    loginError:        'Incorrect PIN or code. Please try again.',
    loginWelcome:      'Welcome back,',

    // Sidebar tabs
    tabDashboard:  'Dashboard & Schedule',
    tabForm:       'Weekly Journal',
    tabMilestones: 'Milestone Tracker',
    tabReview:     'Review & Feedback',
    tabAnalytics:  'Analytics',

    // Dashboard
    weeklySchedule:     'Rotation Schedule',
    todayObjective:     "Today's Learning Objective",
    rotationDept:       'CHIMEI / YUSHAN',
    noSchedule:         'No schedule assigned for this day.',
    addScheduleBtn:     '+ Assign Rotation',
    viewingTrainee:     'Viewing:',
    overallProgress:    'Overall Progress',

    // Observation Form
    formTitle:      'Weekly Journal',
    formSubTitle:   'Record your weekly on-site findings and learning progress.',
    privateNotice:  'Private Journal: Visible only to you and the mentor.',
    lblDept:        'CHIMEI / YUSHAN',
    lblDate:        'Date',
    lblKeyObs:      'Weekly Observation & Notes',
    lblActionable:  'Actionable Idea for VIMEI Philippines',
    lblPhoto:       'Report File Upload (Max 20MB)',
    phKeyObs:       'Describe your weekly findings, challenges, or best practices observed...',
    phActionable:   'How can we apply this in the Philippines plant? Consider local culture, Vikings Buffet requirements...',
    phPhoto:        'https://drive.google.com/...',
    submitBtn:      'Submit Weekly Journal',
    submitSuccess:  'Weekly Journal submitted successfully!',

    // Milestones
    milestoneTitle:    'Milestone Progress',
    milestoneSubTitle: 'Trainee completion tracker per rotation unit.',
    criteria1: 'Weekly Journal Submitted',
    criteria2: 'Mentor Reviewed (Rating > 0)',
    criteria3: 'Good Performance (Rating ≥ 3★)',
    criteria4: 'Excellent & Locked (Rating ≥ 4★)',

    // Review Panel
    reviewTitle:        'Review & Feedback',
    reviewSubTitle:     'Mentor feedback and supervisor/colleague comments.',
    filterLabel:        'Filter by:',
    allTrainees:        'All Trainees',
    allDepts:           'All Departments',
    statusPending:      'Pending Review',
    statusReviewed:     'Reviewed',
    feedbackLabel:      'Feedback & Comments',
    ratingLabel:        'Performance Rating',
    submitFeedbackBtn:  'Submit Feedback & Lock',
    guestCommentLabel:  'Add Note',
    phGuestComment:     'Leave a brief note...',
    submitGuestBtn:     'Submit Note',
    feedbackSuccess:    'Feedback saved successfully!',
    guestSuccess:       'Note submitted!',
    ratingRequired:     'Please select a rating before submitting.',
    guestNotesTitle:    'Supervisor/Colleague Notes',

    // Analytics
    analyticsTitle:         'Program Analytics Center',
    analyticsSubTitle:      'High-level program metrics, trainee performance summary, and data exports.',
    kpiTotalSubmissions:    'Total Weekly Journals',
    kpiAvgRating:           'Average Rating',
    kpiProgramProgress:     'Avg Program Progress',
    tblHeaderName:          'Trainee Name',
    tblHeaderProgress:      'Milestone Completion',
    tblHeaderAvgRating:     'Avg Rating',
    tblHeaderSubmissions:   'Submissions',
    btnExportSummary:       'Export Trainee Summary (CSV)',
    btnExportLogs:          'Export Weekly Journals (CSV)',

    // Station Assessments
    assessSectionTitle:   'Station Rotation Assessment',
    assessSectionDesc:    'Perform final evaluation and grading for trainees upon rotation completion.',
    lblTraineeToAssess:   'Select Trainee to Assess',
    lblDeptToAssess:      'Select Rotation Station',
    lblGrade:             'Final Station Grade',
    lblCompetency1:       'Learning Agility & Adaptability',
    lblCompetency2:       'Problem Solving & Analysis',
    lblCompetency3:       'Proactiveness & Execution',
    lblCompetency4:       'Communication & Teamwork',
    lblCompetency5:       'Innovation & Strategic Thinking',
    lblAssessComments:    'Overall Assessment Comments',
    btnSubmitAssess:      'Submit Assessment & Lock',
    assessSuccess:        'Station Assessment saved successfully!',
    lblAssessedBy:        'Assessor',
    lblAwaitingAssessment: 'Awaiting Final Assessment',
    lblAssessGrade:       'Grade',

    // General
    logoutBtn:  'Logout',
    loadingMsg: 'Loading...',
    demoModeAlert: '⚡ Demo Mode: Data is stored locally in this browser.',
  },

  zh: {
    // App
    appTitle:    'Training Program Tracker',
    appSubTitle: '國際生學習歷程與里程碑平台',

    // Login
    loginSelectRole:   '請選擇您的身份',
    loginAdmin:        '計畫導師',
    loginTrainee:      '國際生',
    loginGuest:        '輪調單位考核',
    roleMentorName:    '計畫導師',
    roleTraineeName:   '國際生',
    roleAssessorName:  '輪調單位考核',
    roleExecutiveName: '管理團隊',
    loginAdminLabel:   '輸入導師密碼',
    loginTraineeName:  '請選擇您的名字',
    loginTraineePin:   '輸入您的個人密碼',
    loginGuestLabel:   '輸入代碼',
    loginBtn:          '登入',
    loginEnterBtn:     '進入',
    loginBack:         '← 返回',
    loginError:        '密碼或代碼錯誤，請再試一次。',
    loginWelcome:      '歡迎回來，',

    // Sidebar tabs
    tabDashboard:  '儀表板與排程',
    tabForm:       '填寫週記',
    tabMilestones: '里程碑追蹤',
    tabReview:     '審查與回饋',
    tabAnalytics:  '數據分析',

    // Dashboard
    weeklySchedule:     '輪調排程',
    todayObjective:     '今日學習目標',
    rotationDept:       '奇美/玉膳',
    noSchedule:         '今日尚無指派目標。',
    addScheduleBtn:     '+ 指派輪調',
    viewingTrainee:     '目前檢視：',
    overallProgress:    '整體完成度',

    // Observation Form
    formTitle:      '週記',
    formSubTitle:   '記錄本週現場觀察、心得與學習歷程。',
    privateNotice:  '閉門記錄：僅您與導師可見。',
    lblDept:        '奇美/玉膳',
    lblDate:        '日期',
    lblKeyObs:      '本週關鍵觀察與心得',
    lblActionable:  '對菲律賓建廠之啟發與提案',
    lblPhoto:       '上傳報告檔案 (限制 20MB)',
    phKeyObs:       '請描述本週在現場觀察到的具體事項、學習收穫或遭遇的挑戰...',
    phActionable:   '如何將此經驗應用到未來的菲律賓新廠？請考量當地員工習慣及 Vikings Buffet 的需求...',
    phPhoto:        'https://drive.google.com/...',
    submitBtn:      '送出週記',
    submitSuccess:  '週記送出成功！',

    // Milestones
    milestoneTitle:    '里程碑進度',
    milestoneSubTitle: '各輪調單位的培訓完成追蹤器。',
    criteria1: '已提交週記',
    criteria2: '導師已評分（評分 > 0）',
    criteria3: '表現良好（評分 ≥ 3★）',
    criteria4: '表現優異且已結案（評分 ≥ 4★）',

    // Review Panel
    reviewTitle:        '審查與回饋',
    reviewSubTitle:     '導師回饋與主管/同仁評語。',
    filterLabel:        '篩選：',
    allTrainees:        '所有學員',
    allDepts:           '所有單位',
    statusPending:      '待審查',
    statusReviewed:     '已審查完成',
    feedbackLabel:      '指導回饋',
    ratingLabel:        '表現評級',
    submitFeedbackBtn:  '送出回饋並結案',
    guestCommentLabel:  '新增主管/同仁評語',
    phGuestComment:     '留下一則簡短評語...',
    submitGuestBtn:     '送出評語',
    feedbackSuccess:    '回饋已成功儲存！',
    guestSuccess:       '主管/同仁評語已送出！',
    ratingRequired:     '請在送出前先給予評分。',
    guestNotesTitle:    '主管/同仁評語',

    // Analytics
    analyticsTitle:         '國際生培訓數據分析中心',
    analyticsSubTitle:      '主管數據中心：查看國際生整體進度、星等統計並匯出培訓資料。',
    kpiTotalSubmissions:    '累計提交週記',
    kpiAvgRating:           '平均表現星等',
    kpiProgramProgress:     '計畫整體完成度',
    tblHeaderName:          '國際生',
    tblHeaderProgress:      '里程碑進度',
    tblHeaderAvgRating:     '平均星等',
    tblHeaderSubmissions:   '週記數',
    btnExportSummary:       '匯出國際生總表 (CSV)',
    btnExportLogs:          '匯出詳細週記 (CSV)',

    // Station Assessments
    assessSectionTitle:   '輪調站別考核評估',
    assessSectionDesc:    '針對國際生於該站別輪調結束後，進行核心能力指標評估與等第評定。',
    lblTraineeToAssess:   '選擇被考核國際生',
    lblDeptToAssess:      '選擇考核站別',
    lblGrade:             '站別最終考核等第',
    lblCompetency1:       '學習敏銳度與適應力',
    lblCompetency2:       '邏輯分析與問題解決',
    lblCompetency3:       '積極主動與當責執行',
    lblCompetency4:       '溝通協調與團隊合作',
    lblCompetency5:       '創新思維與策略觀',
    lblAssessComments:    '考核總評語',
    btnSubmitAssess:      '送出考核並確認結案',
    assessSuccess:        '站別考核已成功儲存！',
    lblAssessedBy:        '考核主管',
    lblAwaitingAssessment: '待進行站別考核',
    lblAssessGrade:       '考核等第',

    // General
    logoutBtn:  '登出',
    loadingMsg: '載入中...',
    demoModeAlert: '⚡ Demo 模式：資料儲存於此瀏覽器，尚未連接 Google Sheets。',
  }
};


window.VimeiI18n = {
  I18N,
  t(key) {
    const lang = (window._appLang || 'en');
    return (I18N[lang] && I18N[lang][key]) || (I18N['en'] && I18N['en'][key]) || key;
  }
};
