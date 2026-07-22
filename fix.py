import re

with open('js/app.js', 'r') as f:
    content = f.read()

# 1. Update state
content = re.sub(
    r"(selectedDate:\s*'[^']+',)",
    r"\1\n  viewDate:           '2026-07-14',\n  calendarView:       'month',",
    content
)

# 2. Add calendar helper functions right before renderDashboard
helpers = """
function getCalendarMonthDays(dateStr) {
  const targetDate = new Date(dateStr);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  let dayOfWeek = firstDayOfMonth.getDay(); 
  
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const startDate = new Date(year, month, 1 + diff);
  
  const days = [];
  for (let i = 0; i < 42; i++) {
    const temp = new Date(startDate);
    temp.setDate(startDate.getDate() + i);
    const yyyy = temp.getFullYear();
    const mm = String(temp.getMonth() + 1).padStart(2, '0');
    const dd = String(temp.getDate()).padStart(2, '0');
    days.push(`${yyyy}-${mm}-${dd}`);
  }
  return days;
}

window.toggleCalendarView = function(view) {
  state.calendarView = view;
  renderDashboard();
};

window.navigateCalendar = function(direction) {
  const d = new Date(state.viewDate || state.selectedDate);
  if (state.calendarView === 'month') {
    d.setMonth(d.getMonth() + direction);
  } else {
    d.setDate(d.getDate() + (direction * 7));
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  state.viewDate = `${yyyy}-${mm}-${dd}`;
  renderDashboard();
};

function renderDashboard() {"""
content = content.replace("function renderDashboard() {", helpers)

with open('js/app.js', 'w') as f:
    f.write(content)

