import re

with open('index.html', 'r') as f:
    html = f.read()

# I want to wrap the contents of <div id="loginScreen" class="login-screen">
# in <div class="login-form-side"> and add <div class="login-image-side"></div> before it.
# Let's find the start of the login-screen:
start_tag = '<div id="loginScreen" class="login-screen">'
end_tag = '</div><!-- /loginScreen -->'

start_idx = html.find(start_tag)
end_idx = html.find(end_tag) + len(end_tag)

if start_idx != -1 and end_idx != -1:
    login_screen_content = html[start_idx + len(start_tag) : html.find(end_tag)]
    
    new_login_screen = f"""<div id="loginScreen" class="login-screen">
  <div class="login-image-side"></div>
  <div class="login-form-side">
{login_screen_content}
  </div>
</div><!-- /loginScreen -->"""

    html = html[:start_idx] + new_login_screen + html[end_idx:]
    with open('index.html', 'w') as f:
        f.write(html)
    print("HTML updated.")
else:
    print("Could not find login screen bounds.")
