# Hướng dẫn Triển khai (Deploy) Hệ thống Báo cáo NQ71

Hệ thống được phát triển với Vite (React) và cơ sở dữ liệu Supabase. Ứng dụng hiện đang được cấu hình để có thể chạy tự động toàn phần ở **chế độ Demo** (không cần kết nối backend) và **chế độ Production** (kết nối với Supabase có thật).

Dưới đây là các bước để đưa hệ thống lên mạng internet để mọi người có thể sử dụng thật:

## Bước 1: Khởi tạo Cơ sở dữ liệu Supabase

1. Truy cập [Supabase](https://supabase.com) và tạo một tài khoản (miễn phí).
2. Tạo một Project mới (Ví dụ: `nq71-tracker`).
3. Truy cập vào mục **SQL Editor** trong thanh menu bên trái của Dashboard.
4. Copy toàn bộ nội dung của file `supabase/schema.sql` có trong mã nguồn dự án của bạn và dán vào tab truy vấn.
5. Chạy (Run) kịch bản SQL đó. Thao tác này sẽ rải toàn bộ các bảng dữ liệu (`profiles`, `tasks`, `reports`, `audit_logs`) và tự động thêm các tài khoản cơ sở như Admin, các khối Cấp 2.

## Bước 2: Thiết lập Biến Môi Trường (.env)

Hệ thống của bạn có tích hợp cơ chế nhận biết Demo Mode thông minh: Nó sẽ tự động tắt chế độ Demo và chuyển sang lấy dữ liệu thật nếu bạn cung cấp đúng thông tin kết nối Supabase.

1. Ngay tại thư mục gốc của project (cùng cấp với `package.json`), tạo một file tên là `.env` (hoặc `.env.local` nếu chạy trên máy tính của bạn).
2. Tới Supabase Project của bạn, chọn **Project Settings** > **API**.
3. Điền các nội dung sau vào file `.env`:

```env
VITE_SUPABASE_URL=https://<nhap-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<nhap-anon-key-cua-ban>
```

*(Sau khi có 2 tham số này, hệ thống sẽ ẩn các nội dung mock/demo như các gợi ý mật khẩu)*

## Bước 3: Đưa hệ thống Frontend lên Host (Vercel)

Cách dễ nhất và nhanh nhất để đưa trang React+Vite này lên Internet là sử dụng **Vercel** (miễn phí và tự động Build).

1. Tải mã nguồn của dự án lên tài khoản GitHub của bạn.
2. Truy cập [Vercel](https://vercel.com/) và tạo tài khoản thông qua GitHub.
3. Click "Add New" > "Project", sau đó Import Repository chứa mã nguồn NQ71 Tracker.
4. Ở màn hình cấu hình triển khai (Configure Project):
   - **Framework Preset**: Chọn `Vite` (mặc định Vercel sẽ tự nhận ra).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: Thêm 2 biến VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY cùng giá trị đã lấy từ Supabase ở *Bước 2*.
5. Bấm nút **Deploy**.

Khoảng 1 phút sau, hệ thống của bạn sẽ được tung lên mạng dưới một đường dẫn web chính thức (vd: `nq71-tracker.vercel.app`). Bất kỳ ai vào web đều có thể xem phần Thống Kê Public bằng đường link bạn gửi.

## Bước 4: Kiểm tra và Vận hành

Sau khi dự án được deploy, hệ thống sẽ kết nối trực tiếp với Database Supabase mà bạn đã setup thay vì dữ liệu sinh ra tự động.

**Tài khoản đăng nhập lần đầu tiên sau khi lên Live:**
- **Admin**: Nhập User `admin` kèm theo Mật khẩu bí mật mặc định: `Sgd@2026#2027!` (hệ thống sẽ gán vào tài khoản gốc).
- **Các đơn vị Cấp 2**: Có thể lấy email đã gán rải rác bên trong câu lệnh SQL (`schema.sql`) để thao tác thử nghiệm (nhập đúng email vào hệ thống).

Chúc bạn triển khai thành công!
