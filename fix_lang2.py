import re

with open('index.html', 'r') as f:
    html = f.read()

# Remove the existing lang select
select_regex = r'<select class="login-lang-select"[^>]*>.*?</select>'
select_match = re.search(select_regex, html, re.DOTALL)
if select_match:
    select_html = select_match.group(0)
    html = html.replace(select_html, '')
    
    # Insert it back right after the login-card closes
    insert_point = '    </div>\n  </div>'
    
    # Let's find the closing div of login-card
    # Actually, login-card ends right before "  </div>" (login-form-side)
    # We can inject it before the last </div> of login-form-side.
    # The structure:
    # <div class="login-form-side">
    #   <div class="login-brand">...</div>
    #   <div class="login-card">...</div>
    # </div>
    
    new_insertion = f"""
    <div style="margin-top: 30px; display: flex; justify-content: center; width: 100%;">
      {select_html}
    </div>
  </div>"""
    
    html = html.replace('    </div>\n  </div>\n\n  <!-- Language selector -->', '    </div>\n' + new_insertion)
    # Just in case the comment was removed
    html = html.replace('    </div>\n  </div>\n\n\n  </div>\n</div><!-- /loginScreen -->', '    </div>\n' + new_insertion + '\n</div><!-- /loginScreen -->')
    
with open('index.html', 'w') as f:
    f.write(html)
print("done html")
