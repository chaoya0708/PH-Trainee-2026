function formatTaipeiTime(isoString, lang) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  const options = { 
    timeZone: 'Asia/Taipei', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  };
  return date.toLocaleString(lang === 'zh' ? 'zh-TW' : 'en-US', options);
}

function formatTaipeiDateOnly(isoString) {
  if (!isoString) return '';
  if (!isoString.includes('T')) return isoString;
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  const options = { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' };
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(date);
  const p = {};
  parts.forEach(part => p[part.type] = part.value);
  return `${p.year}-${p.month}-${p.day}`;
}

const iso = "2026-07-21T11:45:00+08:00";
console.log("Time: ", formatTaipeiTime(iso, 'zh'));
console.log("Date: ", formatTaipeiDateOnly(iso));
