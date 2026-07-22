from datetime import datetime, timedelta

lines = """Diane, 7/27, 奇美, 研發中點, 研發中點 新品開發流程/ 認識原料 RD(chinese) New Product Development Process & Ingredient Knowledge
Diane, 7/28, 奇美, 研發中點, 研發中點 手工/工程 樣品打樣 RD(chinese)Manual & Pilot Sample Production
Diane, 7/29, 奇美, 研發西點, 西點研發 手工/工程 樣品打樣 RD(western) Manual & Pilot Sample Production
Diane, 7/30, 奇美, 研發中點, 研發中點 手工/工程 樣品打樣 RD(chinese)Manual & Pilot Sample Production
Diane, 7/31, 奇美, 研發西點, 西點研發 手工/工程樣品打樣｜測試包餡 RD(western)Manual & Pilot Sample Production, encrusting trial
Diane, 8/4~8/10, 玉膳, QA/QC, 玉膳(現場品管 QA/QC) On-site QA/QC
Diane, 8/11~8/17, 玉膳, QA/QC, 玉膳(現場品管 QA/QC) On-site QA/QC
Diane, 8/18~8/24, 玉膳, QA/QC, 玉膳(現場品管 QA/QC) On-site QA/QC
Diane, 8/25~8/28, 玉膳, QA/QC, 玉膳(現場品管 QA/QC) On-site QA/QC
Diane, 8/29~8/31, 玉膳, QA/QC, 玉膳(現場品管 QA/QC) On-site QA/QC
Diane, 9/1~9/7, 玉膳, 前處理段, 玉膳(調理食品：前處理段) Prepared Foods – Pre-processing
Diane, 9/8~9/14, 玉膳, 前處理段, 玉膳(調理食品：前處理段) Prepared Foods – Pre-processing
Diane, 9/15~9/21, 玉膳, 前處理段, 玉膳(調理食品：前處理段) Prepared Foods – Pre-processing
Diane, 9/22~9/28, 玉膳, 前處理段, 玉膳(調理食品：前處理段) Prepared Foods – Pre-processing
Diane, 9/29~9/30, 玉膳, 前處理段, 玉膳(調理食品：前處理段) Prepared Foods – Pre-processing
Diane, 10/1~10/7, 玉膳, 烹煮段, 玉膳(調理食品：烹煮區) Prepared Foods – Cooking Area
Diane, 10/8~10/14, 玉膳, 烹煮段, 玉膳(調理食品：烹煮區) Prepared Foods – Cooking Area
Diane, 10/15~10/21, 玉膳, 烹煮段, 玉膳(調理食品：烹煮區) Prepared Foods – Cooking Area
Diane, 10/22~10/28, 玉膳, 烹煮段, 玉膳(調理食品：烹煮區) Prepared Foods – Cooking Area
Diane, 10/29~10/31, 玉膳, 烹煮段, 玉膳(調理食品：烹煮區) Prepared Foods – Cooking Area
Diane, 11/1~11/7, 玉膳, 包裝段, 玉膳(調理食品：後段包裝) Prepared Foods – Packaging Area
Diane, 11/8~11/14, 玉膳, 包裝段, 玉膳(調理食品：後段包裝) Prepared Foods – Packaging Area
Diane, 11/15~11/21, 玉膳, 包裝段, 玉膳(調理食品：後段包裝) Prepared Foods – Packaging Area
Diane, 11/22~11/28, 玉膳, 包裝段, 玉膳(調理食品：後段包裝) Prepared Foods – Packaging Area
Diane, 11/29~11/30, 玉膳, 包裝段, 玉膳(調理食品：後段包裝) Prepared Foods – Packaging Area
Diane, 12/1~12/7, 玉膳, 倉儲物流與冷凍庫管理, 玉膳(倉儲物流與凍庫管理) Warehouse & Cold Storage Management
Diane, 12/8~12/14, 玉膳, 倉儲物流與冷凍庫管理, 玉膳(倉儲物流與凍庫管理) Warehouse & Cold Storage Management
Diane, 12/15~12/21, 玉膳, 倉儲物流與冷凍庫管理, 玉膳(倉儲物流與凍庫管理) Warehouse & Cold Storage Management
Diane, 12/22~12/28, 玉膳, 倉儲物流與冷凍庫管理, 玉膳(倉儲物流與凍庫管理) Warehouse & Cold Storage Management
Diane, 12/29~12/31, 玉膳, 倉儲物流與冷凍庫管理, 玉膳(倉儲物流與凍庫管理) Warehouse & Cold Storage Management"""

def get_dept_id(factory, dept_str):
    factory = factory.strip()
    dept_str = dept_str.strip()
    if factory == "奇美":
        if "研發中點" in dept_str: return "cmf_rd_chinese"
        if "研發西點" in dept_str: return "cmf_rd_western"
        if "品管" in dept_str or "QA/QC" in dept_str: return "cmf_qc"
        if "生產" in dept_str: return "cmf_production"
    elif factory == "玉膳":
        if "QA/QC" in dept_str or "品管" in dept_str: return "yushan_qc"
        if "前處理段" in dept_str: return "yushan_prep"
        if "烹煮段" in dept_str: return "yushan_cooking"
        if "包裝段" in dept_str: return "yushan_packaging"
        if "倉儲物流" in dept_str: return "yushan_warehouse"
    return "unknown"

entries = []
for line in lines.strip().split('\n'):
    parts = [p.strip() for p in line.split(',', 4)]
    if len(parts) < 5: continue
    name = parts[0]
    date_str = parts[1]
    factory = parts[2]
    dept_str = parts[3]
    obj = parts[4]
    
    dept_id = get_dept_id(factory, dept_str)
    
    # Parse dates
    if "~" in date_str:
        start_str, end_str = date_str.split('~')
        start_d = datetime.strptime(f"2026/{start_str}", "%Y/%m/%d")
        end_d = datetime.strptime(f"2026/{end_str}", "%Y/%m/%d")
        
        curr = start_d
        while curr <= end_d:
            if curr.weekday() < 5:  # skip weekends
                entries.append((curr.strftime("%Y-%m-%d"), dept_id, obj))
            curr += timedelta(days=1)
    else:
        d = datetime.strptime(f"2026/{date_str}", "%Y/%m/%d")
        if d.weekday() < 5:
            entries.append((d.strftime("%Y-%m-%d"), dept_id, obj))

with open('new_diane_schedules.txt', 'w') as f:
    for date, dept, obj in entries:
        f.write(f"      '{date}': {{ dept: '{dept}', objective: '{obj.replace(chr(39), chr(92)+chr(39))}' }},\n")
print("done")
