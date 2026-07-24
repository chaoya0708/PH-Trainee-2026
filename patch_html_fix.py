import re

with open('index.html', 'r') as f:
    html = f.read()

section = """
      <!-- INSIGHTS (MENTOR ONLY) -->
      <section id="sectionInsights" class="view-section">
        <div class="header-banner" style="background: linear-gradient(135deg, #1e293b, #0f172a);">
          <div class="header-icon" style="background: rgba(255,255,255,0.1); color: #fff;"><i class="fi fi-rr-brain"></i></div>
          <div class="header-text">
            <h1 data-i18n="tabInsights">Mentor Insights</h1>
            <p data-i18n="insightsDesc">Internal private observation notes for Mentor.</p>
          </div>
        </div>
        <div id="insightsContainer" style="margin-top: 20px;"></div>
      </section>
"""

# If not already present, insert it
if 'id="sectionInsights"' not in html:
    html = html.replace('<section class="view-section" id="sectionAnalytics"></section>', '<section class="view-section" id="sectionAnalytics"></section>' + section)
    with open('index.html', 'w') as f:
        f.write(html)
        print("Fixed index.html sections.")
else:
    print("Section already exists.")
