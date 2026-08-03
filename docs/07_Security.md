# 07 — Security Architecture

## 🛡 Security Overview & Defense-in-Depth

DocFlow employs a zero-trust, defense-in-depth security model across authentication, session persistence, storage isolation, and rate limiting.

---

## 🔑 1. Authentication & Password Security

### Argon2id Password Hashing (`argon2-cffi`)
Passwords are never stored in plaintext or weak hash formats. DocFlow uses **Argon2id**, winner of the Password Hashing Competition (PHC).

```python
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

ph = PasswordHasher(
    time_cost=3,        # 3 iterations
    memory_cost=65536,  # 64 MB RAM per hash
    parallelism=4,      # 4 parallel threads
    hash_len=32,
    salt_len=16
)

def get_password_hash(password: str) -> str:
    return ph.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return ph.verify(hashed_password, plain_password)
    except VerifyMismatchError:
        return False
```
- **GPU Brute-Force Immunity**: Memory cost of 64MB makes parallel GPU/ASIC cracking unfeasible.
- **Side-Channel Protection**: Hybrid Argon2id design combines Argon2i (resistant to side-channel attacks) and Argon2d (resistant to GPU cracking).

---

## 🍪 2. HTTP-Only Cookie Session Persistence

Traditional applications store JWT access tokens in browser `LocalStorage` or `SessionStorage`, exposing tokens to cross-site scripting (XSS) extraction attacks.

### DocFlow Cookie Configuration
```python
response.set_cookie(
    key=settings.COOKIE_NAME,    # "access_token"
    value=access_token,
    httponly=True,               # Prevents JavaScript document.cookie access (XSS immune)
    max_age=1440 * 60,           # 24 hours
    samesite="lax",              # Protects against Cross-Site Request Forgery (CSRF)
    secure=False,                # Set to True in HTTPS production environments
)
```
- **XSS Immunity**: JavaScript code running in the browser cannot access `document.cookie`.
- **CSRF Protection**: `SameSite=Lax` prevents unauthorized cross-site requests.

---

## 👑 3. Role-Based Access Control (RBAC) & Guard Rails

### Public Registration Hardening
Public user registration (`POST /api/v1/auth/register`) enforces default `role="USER"`:
```python
db_user = User(
    email=user_in.email.lower().strip(),
    hashed_password=hashed_pwd,
    full_name=user_in.full_name.strip(),
    role="USER",  # Strict default rule
    is_active=True,
)
```

### Self & Root Admin Protection Guards
Administrative endpoints enforce safety rules preventing lockouts:
1. **Root Administrator Protection**: Attempts to demote or disable `admin@docflow.io` raise `HTTP 400 Bad Request`.
2. **Self-Action Prevention**: An active administrator attempting to demote or disable their own account receives `HTTP 400 Bad Request`.

---

## 📁 4. Secure File Storage & Path Traversal Protection

### Upload Boundaries & Whitelist
- **Extension Whitelist**: Allowed extensions are strictly `.pdf`, `.docx`, `.txt`.
- **MIME Type Validation**:
  - PDF: `application/pdf`
  - DOCX: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - TXT: `text/plain`
- **File Size Limit**: Maximum file size is capped at `10 * 1024 * 1024` bytes (10MB).

### UUID Filename Masking
Files uploaded to disk are never saved with user-supplied filenames (`file.filename`). Instead, a cryptographically random UUID4 filename is generated:

```python
file_ext = os.path.splitext(file.filename)[1].lower()
uuid_filename = f"{uuid.uuid4()}{file_ext}"
file_path = os.path.join(settings.UPLOAD_DIR, uuid_filename)
```

### Path Traversal Prevention
By discarding client-supplied filenames for disk operations and storing files in a isolated target directory (`/app/uploads/`), path traversal attacks (e.g. uploading a file named `../../../../etc/passwd`) are completely impossible.

---

## 🔒 5. Zero-Trust Ownership Authorization

Every document query, download, and deletion verifies that `document.owner_id == current_user.id`:

```python
if document.owner_id != current_user.id:
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access forbidden: You do not have permission to access this document."
    )
```

---

## ⏱ 6. Redis Rate Limiting & Denial-of-Service Defense

Atomic Redis sorted sets block high-frequency request floods:
- **Login Defense**: Max 5 authentication requests per minute per IP address.
- **Upload Defense**: Max 10 document upload requests per minute per user/IP.

---

## 📝 7. System Activity Audit Logging

Security-relevant actions (`USER_LOGIN`, `DOCUMENT_UPLOADED`, `DOCUMENT_DELETED`, `USER_ENABLED`, `USER_DISABLED`, `ROLE_UPDATED`) record client IP addresses and user IDs in immutable PostgreSQL audit tables.
