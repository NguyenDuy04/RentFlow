# RentFlow — Hệ thống quản lý phòng trọ

MVP quản lý phòng trọ cho chủ nhà: phòng, người thuê, chỉ số điện nước, hóa đơn (kèm xuất PDF tiếng Việt có dấu) và thanh toán, cùng dashboard tổng **quan**.

**Backend:** FastAPI + MongoDB (Motor) + Pydantic v2 + JWT
**Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind + TanStack Query + React Hook Form + Zod
**Database:** MongoDB (Atlas cho production, Docker cho local dev)

Toàn bộ code trong gói này đã được **build và test thật**: backend có 21 automated test (pytest) chạy qua toàn bộ luồng nghiệp vụ, frontend đã `tsc --noEmit` sạch và `next build` thành công cho cả 11 route.

---

## 1. Cấu trúc thư mục

```
rentflow/
├── docker-compose.yml      # MongoDB local cho dev (tùy chọn)
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI app + CORS + router
│   │   ├── core/           # config (env), JWT, bcrypt
│   │   ├── db/             # kết nối MongoDB (Motor) + index
│   │   ├── models/         # Pydantic models (Create/Update/Public) từng entity
│   │   ├── api/routes/     # auth, rooms, tenants, meters, pricing, bills, payments, dashboard
│   │   ├── services/       # billing.py (tính hóa đơn), pdf.py (xuất PDF tiếng Việt)
│   │   └── assets/fonts/   # Noto Sans (Regular + Bold) — hỗ trợ đầy đủ dấu tiếng Việt trong PDF
│   ├── scripts/seed.py     # tạo tài khoản chủ trọ đầu tiên
│   ├── tests/              # 21 test (pytest) — auth, rooms, tenants, billing, payments, dashboard
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── app/                # Next.js App Router
    |   ├── register/
    │   ├── login/
    │   └── (dashboard)/    # layout bảo vệ + dashboard, rooms, tenants, meters, billing, payments, settings
    ├── components/
    │   ├── ui/             # Button, Input, Dialog, Table, Tabs, DropdownMenu... (kiểu shadcn/ui)
    │   ├── layout/         # Sidebar, Header, Providers (React Query + Toaster)
    │   └── {rooms,tenants,meters,billing,payments,dashboard}/
    ├── hooks/              # React Query hooks cho từng entity
    ├── schemas/            # Zod validation
    ├── types/              # TypeScript types khớp với response backend
    ├── lib/                # api-client (fetch + JWT), auth (lưu token), utils
    └── .env
```

---

## 2. Chạy local

### Yêu cầu

- Python 3.11+
- Node.js 20+
- Docker (nếu muốn chạy MongoDB local thay vì dùng Atlas ngay)

### Bước 1 — MongoDB

Nếu dùng Docker

- Mở

```bash
sudo docker compose up -d
```

- Tắt

```bash
sudo docker compose down
```

Hoặc bỏ qua bước này và dùng thẳng connection string MongoDB Atlas ở bước 2.

### Bước 2 — Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Sửa MONGODB_URI trong .env nếu dùng Atlas thay vì Docker

python scripts/seed.py        # tạo tài khoản chủ trọ đầu tiên
uvicorn app.main:app --reload --port 8000
```

Backend chạy tại `http://localhost:8000`, tài liệu API tự động tại `http://localhost:8000/docs`.

Tài khoản mặc định (đổi ngay sau khi đăng nhập lần đầu, hoặc set `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` trong `.env` trước khi chạy seed):

```
Email: admin@rentflow.app
Mật khẩu: ChangeMe123!
```

### Bước 3 — Frontend

```bash
cd frontend
npm install   # NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm run dev
```

Mở `http://localhost:3000`.

### Chạy test backend

```bash
cd backend
pip install -r requirements-dev.txt
pytest tests/ -v
```

Bộ test dùng MongoDB giả lập trong bộ nhớ (`mongomock-motor`) nên không cần MongoDB thật để chạy test.

---

## 3. Triển khai production (theo đúng stack trong spec)

- **Frontend → Vercel**: import repo, root directory `frontend/`, set biến môi trường `NEXT_PUBLIC_API_URL` trỏ tới URL backend đã deploy.
- **Backend → Railway** (hoặc bất kỳ nền tảng nào chạy được ASGI): deploy thư mục `backend/`, start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, set các biến môi trường trong `.env.example` (đặc biệt `JWT_SECRET_KEY` — tạo bằng `python3 -c "import secrets; print(secrets.token_hex(32))"`, và `CORS_ORIGINS` trỏ tới domain frontend trên Vercel).
- **Database → MongoDB Atlas**: tạo cluster, whitelist IP của backend (hoặc `0.0.0.0/0` nếu backend có IP động), lấy connection string dạng `mongodb+srv://...` đặt vào `MONGODB_URI`.
- Sau khi deploy, chạy `scripts/seed.py` một lần (với `MONGODB_URI` trỏ tới Atlas) để tạo tài khoản chủ trọ đầu tiên.

---

## 4. Những gì đã hoàn thành (đúng theo MVP scope trong spec)

| Module                                                                                                                    | Trạng thái |
| ------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Authentication (login, remember me, profile, đổi mật khẩu)                                                                | ✅         |
| Room Management (CRUD, tìm kiếm, chặn xóa phòng đang có người thuê)                                                       | ✅         |
| Tenant Management (CRUD, chuyển phòng, kết thúc hợp đồng, tự động cập nhật trạng thái phòng)                              | ✅         |
| Meter Reading (nhập chỉ số, auto-fill từ tháng trước, tự tính tiêu thụ, lưu lịch sử)                                      | ✅         |
| Billing (tự động tính tiền phòng + điện + nước + phí dịch vụ, chặn tạo trùng, xuất PDF tiếng Việt có dấu)                 | ✅         |
| Payment (ghi nhận thanh toán, VietQR, xác nhận chuyển khoản thủ công, thanh toán một phần, lịch sử)                       | ✅         |
| Dashboard (overview cards, cảnh báo quá hạn/sắp hết hạn HĐ/đang bảo trì, biểu đồ doanh thu 6/12 tháng, hoạt động gần đây) | ✅         |

Các mục **không bắt buộc trong MVP** theo spec (Email, QR Payment, SMS, AI Features, Multi-Tenant System) chưa được triển khai, đúng như phạm vi đề ra.

---

## 5. Một số quyết định thiết kế cần lưu ý

- **Xác thực chủ trọ**: RentFlow là hệ thống single-tenant (một tài khoản chủ trọ duy nhất). Tài khoản đầu tiên có thể tạo bằng **một trong hai cách**: (1) chạy `scripts/seed.py`, hoặc (2) mở `/register` trên frontend — đây là màn "thiết lập lần đầu" kiểu WordPress/Nextcloud, chỉ hoạt động khi hệ thống _chưa có_ tài khoản nào (`GET /api/auth/setup-status`); sau khi đã có một tài khoản, `POST /api/auth/register` luôn trả về 403. Không có đăng ký công khai nhiều người dùng.
- **Token lưu ở đâu**: JWT được lưu trong cookie `HttpOnly`, `SameSite=Lax`; JavaScript không thể đọc token. Cookie chỉ tồn tại trong phiên trình duyệt nếu không chọn "Ghi nhớ đăng nhập", và có hạn 30 ngày nếu chọn. Khi triển khai frontend/backend trên hai site khác nhau, đặt `AUTH_COOKIE_SAMESITE=none` và `AUTH_COOKIE_SECURE=true` trên backend; luôn bật `AUTH_COOKIE_SECURE=true` khi backend dùng HTTPS.
- **Hạn thanh toán hóa đơn**: mặc định 10 ngày kể từ ngày tạo hóa đơn (`DUE_DAYS` trong `backend/app/api/routes/bills.py`) — chỉnh lại nếu chủ trọ có quy định khác.
- **Doanh thu tháng hiện tại** trên dashboard: tính theo _tiền đã thực thu_ (tổng các khoản `Payment` trong tháng), không phải tổng hóa đơn đã tạo — phản ánh dòng tiền thực tế.
- **"Quá hạn"** không phải một trạng thái lưu trong DB mà được tính động (`unpaid` + qua `due_date`) — luôn chính xác theo thời gian thực, không cần cron job.
- **VietQR**: nhập mã BIN 6 số, số tài khoản và tên chủ tài khoản trong **Cài đặt → Tài khoản nhận tiền**. Tại chi tiết bill chưa thanh toán, chọn **Tạo VietQR** rồi gửi ảnh QR cho khách; khách tự chuyển khoản với số tiền và mã bill được điền sẵn. Chủ trọ cần kiểm tra giao dịch trong ứng dụng ngân hàng và chọn **Xác nhận đã nhận tiền** để ghi payment. QR được tạo qua dịch vụ ảnh `img.vietqr.io`; không có webhook hay tự động đối soát.
- **Phòng nhiều người ở chung**: `max_occupants` được lưu nhưng chưa enforce giới hạn số người thuê/phòng khi thêm người thuê mới — trạng thái phòng (`occupied`/`available`) tự cập nhật dựa trên còn tenant đang active hay không.
- **Điều hướng responsive**: màn hình `lg` (≥1024px) trở lên dùng sidebar cố định bên trái; dưới `lg` (điện thoại, tablet đứng) dùng bottom navigation cố định (4 mục chính + nút "Thêm") để thao tác bằng ngón cái thuận tiện hơn menu trượt.
