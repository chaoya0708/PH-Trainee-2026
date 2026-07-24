import re

with open('index.html', 'r') as f:
    html = f.read()

# Add nav-item
nav_item = """        <li class="nav-item" id="liInsights">
          <a class="nav-link" onclick="window.switchTab('insights')">
            <i class="fi fi-rr-brain"></i>
            <span data-i18n="tabInsights">Mentor Insights</span>
          </a>
        </li>
"""
html = html.replace('        <li class="nav-item" id="liAnalytics">', nav_item + '        <li class="nav-item" id="liAnalytics">')

# Add section
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
html = html.replace('      <!-- ANALYTICS -->', section + '      <!-- ANALYTICS -->')

with open('index.html', 'w') as f:
    f.write(html)
