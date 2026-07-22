import re

with open('js/api.js', 'r') as f:
    js = f.read()

old_func = """    async getAllSchedules() {
      if (CONFIG.DEMO_MODE) return lsGetObj(LS_SCHED);
      const res = await callScriptGet('getAllSchedules');
      const normalized = {};
      for (const t in res) {
        normalized[t] = {};
        for (const dStr in res[t]) {
          const cleanStr = dStr.replace(/\(.*?\)/g, '').trim();
          const d = new Date(cleanStr);
          const key = isNaN(d) ? dStr : d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
          normalized[t][key] = res[t][dStr];
        }
      }
      return normalized;
    },"""

new_func = """    async getAllSchedules() {
      if (CONFIG.DEMO_MODE) return lsGetObj(LS_SCHED);
      const trainees = ['diane', 'mark', 'jairuz'];
      const allSchedules = {};
      await Promise.all(trainees.map(async (t) => {
        allSchedules[t] = await this.getScheduleForTrainee(t);
      }));
      return allSchedules;
    },"""

if old_func in js:
    js = js.replace(old_func, new_func)
    with open('js/api.js', 'w') as f:
        f.write(js)
    print("Replaced getAllSchedules")
else:
    print("Could not find old_func exactly.")
