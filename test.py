import sys
import esprima
with open('google-apps-script/Code.gs', 'r') as f:
    code = f.read()
try:
    esprima.parseScript(code)
    print("No syntax errors")
except Exception as e:
    print("Syntax error:", e)
