#!/usr/bin/env python3
"""Server cho demo: phục vụ file tĩnh + API đăng ảnh.

Chỉ dùng thư viện chuẩn của Python, không cần Docker hay cài thêm gì.

    python3 server.py            # http://localhost:5178
    PORT=8000 python3 server.py  # đổi cổng

Mật khẩu đăng ảnh: file .upload-password (hoặc biến môi trường UPLOAD_PASSWORD).

API:
    GET    /api/config           {"passwordRequired": true|false}
    GET    /api/uploads          danh sách ảnh đã đăng (mới nhất trước)
    POST   /api/auth             kiểm tra mật khẩu (header X-Upload-Password)
    POST   /api/upload?collection=&cat=&name=&w=&h=   thân request = bytes của ảnh, cần X-Upload-Password
    DELETE /api/uploads/<id>     xoá ảnh, cần header X-Delete-Token (nhận khi đăng)
"""
import json
import os
import re
import secrets
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent
UPLOADS = ROOT / 'uploads'
UPLOADS.mkdir(exist_ok=True)
MANIFEST = UPLOADS / 'manifest.json'

MAX_BYTES = 20 * 1024 * 1024   # 20MB mỗi ảnh
MAX_ITEMS = 300                # giới hạn số ảnh để không đầy ổ khi để link công khai
LOCK = threading.Lock()


def load_password():
    """Mật khẩu đăng ảnh: biến môi trường UPLOAD_PASSWORD, nếu không có thì đọc file .upload-password."""
    env = os.environ.get('UPLOAD_PASSWORD', '').strip()
    if env:
        return env
    try:
        return (ROOT / '.upload-password').read_text('utf-8').strip()
    except FileNotFoundError:
        return ''


PASSWORD = load_password()
MAX_FAILS = 5                 # sai quá 5 lần trong 10 phút thì khoá IP đó
FAIL_WINDOW = 600
FAILS = {}

COLLECTIONS = {'tong-hop', 'khach-studio', 'tinh', 'nang-tho', 'sang-chanh', 'cuoi'}
CATS = {'', 'tinh', 'black', 'red', 'nangtho', 'quyenru', 'sangchanh', 'cuoi', 'basic'}


def sniff(data: bytes):
    """Nhận diện ảnh theo vài byte đầu, không tin Content-Type do client gửi."""
    if data[:3] == b'\xff\xd8\xff':
        return '.jpg'
    if data[:8] == b'\x89PNG\r\n\x1a\n':
        return '.png'
    if data[:6] in (b'GIF87a', b'GIF89a'):
        return '.gif'
    if data[:4] == b'RIFF' and data[8:12] == b'WEBP':
        return '.webp'
    return None


def load():
    try:
        return json.loads(MANIFEST.read_text('utf-8'))
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def save(items):
    tmp = MANIFEST.with_suffix('.tmp')
    tmp.write_text(json.dumps(items, ensure_ascii=False), 'utf-8')
    os.replace(tmp, MANIFEST)


def public(item):
    return {k: v for k, v in item.items() if k != 'token'}


def to_int(value, default):
    try:
        return max(1, min(20000, int(value)))
    except (TypeError, ValueError):
        return default


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        # luôn lấy bản mới nhất khi đang sửa code / đăng ảnh
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def send_json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def deny(self, code, message):
        self.close_connection = True
        self.send_json(code, {'error': message})

    def client_ip(self):
        # đi qua Cloudflare Tunnel thì IP thật nằm ở header CF-Connecting-IP
        return self.headers.get('CF-Connecting-IP') or self.client_address[0]

    def password_ok(self):
        """Kiểm tra header X-Upload-Password. Sai thì tự trả lỗi và trả về False."""
        if not PASSWORD:
            return True
        ip, now = self.client_ip(), time.time()
        with LOCK:
            recent = [t for t in FAILS.get(ip, []) if now - t < FAIL_WINDOW]
            FAILS[ip] = recent
        if len(recent) >= MAX_FAILS:
            self.deny(429, 'Sai mật khẩu quá nhiều lần, thử lại sau 10 phút')
            return False
        given = self.headers.get('X-Upload-Password', '').strip().encode('utf-8')
        if secrets.compare_digest(given, PASSWORD.encode('utf-8')):
            with LOCK:
                FAILS.pop(ip, None)
            return True
        with LOCK:
            FAILS.setdefault(ip, []).append(now)
        time.sleep(0.6)  # làm chậm việc dò mật khẩu
        self.deny(401, 'Sai mật khẩu')
        return False

    @staticmethod
    def blocked(path):
        # không cho tải mã nguồn server, file ẩn (.upload-password…) hay manifest
        return path == '/server.py' or path.startswith('/uploads/manifest') or any(p.startswith('.') for p in path.split('/') if p)

    # ---------- GET ----------
    def do_GET(self):
        path = urlparse(self.path).path
        if path == '/api/uploads':
            with LOCK:
                items = load()
            return self.send_json(200, [public(i) for i in items])
        if path == '/api/config':
            return self.send_json(200, {'passwordRequired': bool(PASSWORD)})
        if self.blocked(path):
            return self.send_json(404, {'error': 'Không tìm thấy'})
        return super().do_GET()

    def do_HEAD(self):
        if self.blocked(urlparse(self.path).path):
            self.send_response(404)
            self.end_headers()
            return
        return super().do_HEAD()

    # ---------- POST ----------
    def do_POST(self):
        url = urlparse(self.path)
        if url.path == '/api/auth':
            if self.password_ok():
                self.send_json(200, {'ok': True})
            return
        if url.path != '/api/upload':
            return self.deny(404, 'Không tìm thấy')
        if not self.password_ok():
            return
        q = parse_qs(url.query)
        get = lambda k, d='': (q.get(k) or [d])[0]

        try:
            length = int(self.headers.get('Content-Length', 0))
        except ValueError:
            length = 0
        if length <= 0:
            return self.deny(400, 'Không có dữ liệu ảnh')
        if length > MAX_BYTES:
            return self.deny(413, 'Ảnh quá lớn (tối đa 20MB)')

        data = self.rfile.read(length)
        ext = sniff(data)
        if not ext:
            return self.deny(415, 'Chỉ nhận ảnh JPG, PNG, WEBP hoặc GIF')

        collection = get('collection')
        if collection not in COLLECTIONS:
            collection = 'tong-hop'
        cat = get('cat')
        if cat not in CATS:
            cat = ''
        name = re.sub(r'[^\w.\- ()]', '', get('name'))[:80].strip() or f'anh{ext}'

        with LOCK:
            items = load()
            if len(items) >= MAX_ITEMS:
                return self.deny(507, 'Thư viện test đã đầy, hãy xoá bớt ảnh')
            uid = secrets.token_hex(6)
            filename = f'{uid}{ext}'
            (UPLOADS / filename).write_bytes(data)
            item = {
                'id': uid,
                'url': f'uploads/{filename}',
                'name': name,
                'collection': collection,
                'cat': cat,
                'w': to_int(get('w'), 4),
                'h': to_int(get('h'), 5),
                'size': len(data),
                'created': int(time.time() * 1000),
                'token': secrets.token_hex(16),
            }
            items.insert(0, item)
            save(items)
        return self.send_json(200, item)   # token chỉ trả cho người vừa đăng

    # ---------- DELETE ----------
    def do_DELETE(self):
        m = re.fullmatch(r'/api/uploads/([0-9a-f]{12})', urlparse(self.path).path)
        if not m:
            return self.deny(404, 'Không tìm thấy')
        token = self.headers.get('X-Delete-Token', '')
        with LOCK:
            items = load()
            target = next((i for i in items if i['id'] == m[1]), None)
            if not target:
                return self.deny(404, 'Ảnh không còn tồn tại')
            if not secrets.compare_digest(target.get('token', ''), token):
                return self.deny(403, 'Bạn chỉ xoá được ảnh do mình đăng')
            (UPLOADS / Path(target['url']).name).unlink(missing_ok=True)
            save([i for i in items if i['id'] != m[1]])
        return self.send_json(200, {'ok': True})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5178))
    host = os.environ.get('HOST', '127.0.0.1')
    print(f'Phú Thi Dev demo đang chạy: http://localhost:{port}  (Ctrl+C để dừng)')
    print('Đăng ảnh: ' + ('cần mật khẩu' if PASSWORD else 'KHÔNG có mật khẩu (tạo file .upload-password để bật)'))
    ThreadingHTTPServer((host, port), Handler).serve_forever()
