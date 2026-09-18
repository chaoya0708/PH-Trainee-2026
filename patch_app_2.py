import sys

with open('js/app.js', 'r') as f:
    content = f.read()

target = """      }).join('');

      html += `</div></div>`;
      return html;
    }).join('')}
          </div>
        </div>
      `;
  }

  container.innerHTML = `
    ${smartNudgeHtml}
    <div class="card-header" style="margin:0 0 4px;">
      <div><h2 style="font-family:var(--font-title);font-size:20px;font-weight:700;">${t('reviewTitle')}</h2>
      <p style="font-size:12px;color:var(--text-secondary);">${t('reviewSubTitle')}</p></div>
    </div>
    ${pastAssessmentsHtml}
    ${assessFormHtml}
  `;"""

replacement = """      }).join('');

      html += `</div></div>`;
      return html;
    }).join('')}
          </div>
        </div>
      `;
  };

  const pastAssessmentsHtml = renderAssessmentList(relevantAssessments, state.activeLanguage === 'zh' ? '已送出的單位考核' : 'Submitted Unit Assessments', 'fi fi-rr-time-past');
  const pastSelfAssessmentsHtml = renderAssessmentList(relevantSelfAssessments, state.activeLanguage === 'zh' ? '已送出的自我評估' : 'Submitted Self Assessments', 'fi fi-rr-user');

  container.innerHTML = `
    ${smartNudgeHtml}
    <div class="card-header" style="margin:0 0 4px;">
      <div><h2 style="font-family:var(--font-title);font-size:20px;font-weight:700;">${t('reviewTitle')}</h2>
      <p style="font-size:12px;color:var(--text-secondary);">${t('reviewSubTitle')}</p></div>
    </div>
    ${pastAssessmentsHtml}
    ${pastSelfAssessmentsHtml}
    ${assessFormHtml}
  `;"""

if target in content:
    content = content.replace(target, replacement)
    with open('js/app.js', 'w') as f:
        f.write(content)
    print("Success replacing block 2")
else:
    print("Failed to find target 2")
