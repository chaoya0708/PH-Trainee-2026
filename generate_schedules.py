from datetime import date, timedelta

def generate_dates(start_date, end_date):
    delta = end_date - start_date
    dates = []
    for i in range(delta.days + 1):
        day = start_date + timedelta(days=i)
        if day.weekday() < 5:  # 0-4 are Mon-Fri
            dates.append(day.strftime("%Y-%m-%d"))
    return dates

schedules = {"diane": {}, "mark": {}, "jairuz": {}}

# Diane
diane_dates = generate_dates(date(2026, 6, 15), date(2026, 6, 21)) + generate_dates(date(2026, 6, 22), date(2026, 6, 28))
for d in diane_dates:
    schedules["diane"][d] = "{ dept: 'cmf_production', objective: '調理單位執行燒賣調理配餡 / Siomai Filling Preparation' }"

# Mark
mark_dates = generate_dates(date(2026, 6, 1), date(2026, 6, 14)) + generate_dates(date(2026, 6, 29), date(2026, 7, 12))
for d in mark_dates:
    schedules["mark"][d] = "{ dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' }"

# Jairuz
jairuz_dates = generate_dates(date(2026, 6, 1), date(2026, 7, 12))
for d in jairuz_dates:
    schedules["jairuz"][d] = "{ dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' }"

out = "  DEFAULT_SCHEDULES: {\n"
for user in ["diane", "mark", "jairuz"]:
    out += f"    {user}: {{\n"
    entries = []
    for d, val in schedules[user].items():
        entries.append(f"      '{d}': {val}")
    out += ",\n".join(entries) + "\n"
    out += "    }" + ("," if user != "jairuz" else "") + "\n"
out += "  }"

print(out)
