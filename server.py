from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys
import os

class RequestHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        with open('result.txt', 'wb') as f:
            f.write(post_data)
        self.send_response(200)
        self.end_headers()

print("Starting server on port 8002")
httpd = HTTPServer(('127.0.0.1', 8002), RequestHandler)
httpd.serve_forever()
