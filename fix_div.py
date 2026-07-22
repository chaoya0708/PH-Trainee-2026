with open('index.html', 'r') as f:
    html = f.read()

# Add a missing closing div right before <!-- /loginScreen -->
html = html.replace('</div><!-- /loginScreen -->', '  </div>\n</div><!-- /loginScreen -->')

with open('index.html', 'w') as f:
    f.write(html)
print("fixed div")
