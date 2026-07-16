const fs = require('fs');

function isWeekend(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
}

function generateDates(startDateStr, endDateStr) {
  const dates = [];
  let curr = new Date(startDateStr);
  const end = new Date(endDateStr);
  while (curr <= end) {
    const iso = curr.toISOString().split('T')[0];
    if (!isWeekend(iso)) {
      dates.push(iso);
    }
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

const schedules = { diane: {}, mark: {}, jairuz: {} };

// Diane
const dianeDates1 = generateDates('2026-06-15', '2026-06-21');
const dianeDates2 = generateDates('2026-06-22', '2026-06-28');
const dianeAll = [...dianeDates1, ...dianeDates2];
for (const d of dianeAll) {
  schedules.diane[d] = {
    dept: 'cmf_production',
    objective: '調理單位執行燒賣調理配餡 / Siomai Filling Preparation'
  };
}

// Mark
const markDates1 = generateDates('2026-06-01', '2026-06-14');
const markDates2 = generateDates('2026-06-29', '2026-07-12');
const markAll = [...markDates1, ...markDates2];
for (const d of markAll) {
  schedules.mark[d] = {
    dept: 'cmf_production',
    objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning'
  };
}

// Jairuz
const jairuzDates = generateDates('2026-06-01', '2026-07-12');
for (const d of jairuzDates) {
  schedules.jairuz[d] = {
    dept: 'cmf_production',
    objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing'
  };
}

// Output formatted JS
let out = '  DEFAULT_SCHEDULES: {\n';
for (const user of ['diane', 'mark', 'jairuz']) {
  out += `    ${user}: {\n`;
  const entries = Object.entries(schedules[user]).map(([d, val]) => {
    return `      '${d}': { dept: '${val.dept}', objective: '${val.objective}' }`;
  });
  out += entries.join(',\n') + '\n';
  out += `    }${user === 'jairuz' ? '' : ','}\n`;
}
out += '  }';
console.log(out);
