import json

with open('scratch/full_data.json', 'r') as f:
    full_data = f.read()

html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>VIMEI Data Migration</title>
  <style>
    body {{ font-family: sans-serif; padding: 40px; background: #f8fafc; color: #1e293b; }}
    .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }}
    button {{ background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold; width: 100%; }}
    button:disabled {{ background: #94a3b8; cursor: not-allowed; }}
    #log {{ margin-top: 20px; background: #1e293b; color: #10b981; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 14px; white-space: pre-wrap; min-height: 200px; overflow-y: auto; }}
  </style>
</head>
<body>
  <div class="container">
    <h2>🚀 終極資料搬移工具 (離線直達版)</h2>
    <p>因為瀏覽器會被安全機制阻擋，系統已經在背景幫您下載好所有最新資料了！點擊下方按鈕即可直接將完整的資料庫（包含所有班表）上傳至 Firebase。</p>
    <button id="startBtn" onclick="startMigration()">開始終極搬移</button>
    <div id="log">等待開始...</div>
  </div>

  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
  <script src="js/config.js"></script>
  
  <script>
    firebase.initializeApp(CONFIG.FIREBASE_CONFIG);
    const db = firebase.firestore();
    const logEl = document.getElementById('log');
    const btn = document.getElementById('startBtn');

    const FULL_DATA = {full_data};

    function log(msg) {{
      console.log(msg);
      logEl.innerHTML += '\\n> ' + msg;
      logEl.scrollTop = logEl.scrollHeight;
    }}

    async function migrateCollection(colName, dataList) {{
      if (!dataList || !Array.isArray(dataList) || dataList.length === 0) return;
      log(`開始上傳 ${{colName}} (${{dataList.length}} 筆資料)...`);
      let count = 0;
      for (const item of dataList) {{
        const docId = item.id;
        let docData = {{ ...item }};
        Object.keys(docData).forEach(key => {{
          if (docData[key] === undefined) delete docData[key];
        }});
        try {{
          if (docId) {{
            await db.collection(colName).doc(docId).set(docData);
          }} else {{
            await db.collection(colName).add(docData);
          }}
          count++;
          if (count % 10 === 0) log(`  已上傳 ${{count}} 筆...`);
        }} catch (e) {{
          log(`❌ 上傳錯誤: ${{e.message}}`);
        }}
      }}
      log(`✅ ${{colName}} 上傳完成！(共 ${{count}} 筆)`);
    }}

    async function startMigration() {{
      btn.disabled = true;
      btn.innerText = "資料搬移中，請勿關閉網頁...";
      try {{
        log("\\n--- 開始寫入 Firebase ---");
        await migrateCollection('observations', FULL_DATA.observations || []);
        await migrateCollection('guest_comments', FULL_DATA.guest_comments || []);
        await migrateCollection('assessments', FULL_DATA.assessments || []);
        await migrateCollection('resources', FULL_DATA.resources || []);
        await migrateCollection('schedules', FULL_DATA.schedules || []);

        log("\\n🎉 所有資料皆已成功搬移到 Firebase！(包含所有班表)");
        btn.innerText = "✅ 搬移完成，您可以關閉此網頁了";
        btn.style.background = "#10b981";
      }} catch (err) {{
        log(`\\n❌ 發生致命錯誤: ${{err.message}}`);
        btn.innerText = "搬移失敗";
        btn.style.background = "#ef4444";
      }}
    }}
  </script>
</body>
</html>
"""

with open('migrate.html', 'w') as f:
    f.write(html)
print("Injected full_data into migrate.html")
