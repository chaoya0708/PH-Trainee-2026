import sys

with open('js/app.js', 'r') as f:
    content = f.read()

# Update login trainee name grid
old_grid = """    grid.innerHTML = CONFIG.TRAINEES.map(tr => `
      <button class="trainee-name-btn" onclick="selectLoginTrainee('${tr.id}')">
        ${tr.avatar ? `<span class="tnb-avatar">${tr.avatar}</span>` : ''}
        <div>
          <div class="tnb-name">${tr.name}</div>
          ${tr.bio ? `<div class="tnb-bio">${tr.bio}</div>` : ''}
        </div>
      </button>
    `).join('');"""

new_grid = """    grid.innerHTML = CONFIG.TRAINEES.map(tr => {
      const parts = tr.name.split(' / ');
      const nameHtml = parts.length > 1 ? `${parts[0]} <span style="font-size:12px; font-weight:400; opacity:0.8;">/ ${parts[1]}</span>` : tr.name;
      return `
      <button class="trainee-name-btn" onclick="selectLoginTrainee('${tr.id}')">
        ${tr.avatar ? `<span class="tnb-avatar">${tr.avatar}</span>` : ''}
        <div>
          <div class="tnb-name">${nameHtml}</div>
          ${tr.bio ? `<div class="tnb-bio">${tr.bio}</div>` : ''}
        </div>
      </button>
      `;
    }).join('');"""

content = content.replace(old_grid, new_grid)

# Update loginUserPreview
old_preview = """  $('loginUserPreview').innerHTML = `
    ${tr.avatar ? `<span>${tr.avatar}</span>` : ''}
    <div><strong>${tr.name}</strong><p>${t('loginTraineePin')}</p></div>
  `;"""

new_preview = """  const parts = tr.name.split(' / ');
  const nameHtml = parts.length > 1 ? `${parts[0]} <span style="font-size:12px; font-weight:400; opacity:0.8;">/ ${parts[1]}</span>` : tr.name;
  $('loginUserPreview').innerHTML = `
    ${tr.avatar ? `<span>${tr.avatar}</span>` : ''}
    <div><strong>${nameHtml}</strong><p>${t('loginTraineePin')}</p></div>
  `;"""

content = content.replace(old_preview, new_preview)

with open('js/app.js', 'w') as f:
    f.write(content)

print("Patch applied to app.js")
