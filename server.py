import http.server
import socketserver

PORT = 8080

Handler = http.server.SimpleHTTPRequestHandler

Handler.extensions_map = {
    ".manifest": "text/cache-manifest",
    ".html": "text/html",
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".svg": "image/svg+xml",
    ".css": "text/css",
    ".js": "application/x-javascript",
    "": "application/octet-stream",  # Default
}

httpd = socketserver.TCPServer(("", PORT), Handler)

print("Serving At Port: ", PORT)
httpd.serve_forever()
