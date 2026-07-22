const res = {
  "Wed Jul 22 2026 00:00:00 GMT+0800 (台北標準時間)": {"dept": "yushan_packaging"},
  "Sun Oct 25 2026 00:00:00 GMT+0800 (台北標準時間)":{"dept":"holiday"}
};

const normalized = {};
for (const dStr in res) {
  let key = dStr;
  const parts = dStr.match(/([a-zA-Z]{3}) (\d{1,2}) (\d{4})/);
  if (parts) {
    const monthMap = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
    const yyyy = parts[3];
    const mm = String(monthMap[parts[1]]).padStart(2, '0');
    const dd = String(parts[2]).padStart(2, '0');
    key = `${yyyy}-${mm}-${dd}`;
  }
  normalized[key] = res[dStr];
}
console.log(normalized);
