# Phân Tích Logic Upload SFTP: `UpSFTPImage` & `Btnsubmit2_Click`

Dựa trên mã nguồn C# của file `MainActivity.cs`, dưới đây là phân tích chi tiết về luồng hoạt động đẩy dữ liệu sang hệ thống TRANS4M/Pivot88 qua giao thức SFTP.

---

## 1. Hàm `UpSFTPImage(string nm, string url, int type)`

Hàm này đóng vai trò là "người vận chuyển" (Transporter) để đưa các file từ thiết bị Android lên Server SFTP của đối tác Pivot88.

**Tham số truyền vào:**
- `nm`: Tên file cần upload (kèm phần mở rộng).
- `url`: Đường dẫn thư mục vật lý chứa file trên thiết bị Android (thường là `DirectoryDownloads`).
- `type`: Cờ phân loại file.
  - `type = 0`: Dành cho file **JSON** (Báo cáo dữ liệu).
  - `type = 1`: Dành cho file **Hình ảnh** (Ảnh chụp tổng quan hoặc ảnh lỗi).

**Logic Hoạt Động:**
1. **Kết nối SFTP:** Mở một phiên kết nối SSH/SFTP (dùng thư viện `SftpClient`) bằng thông tin được khai báo ngầm: `Pv88Ip`, `Pv88Port`, `Pv88User`, `Pv88Pw` (ví dụ: `adidasstage4.pivot88.com`, cổng `58122`, user `trax-importer`).
2. **Xử lý luồng file lớn:** Hệ thống đặt `client.BufferSize = 10 * 1024` (10KB) nhằm tránh các lỗi Payload Size (đứt gãy gói tin) khi upload file lớn hoặc file có dung lượng bất thường qua mạng yếu.
3. **Phân nhánh Upload:**
   - Nếu `type == 1` (Hình ảnh): Nó đọc file ảnh từ thiết bị Android và đẩy lên thư mục đích trên Server là **`/incoming/images/`**.
   - Nếu `type == 0` (JSON): Nó đọc file JSON và đẩy lên thư mục đích trên Server là **`/incoming/`**.
4. **Đóng kết nối & Thông báo:** Bắn `Toast` hoàn tất hoặc thất bại.

---

## 2. Kịch Bản Gọi SFTP Bên Trong Sự Kiện `Btnsubmit2_Click`

Nhiều người lầm tưởng rằng "Hệ thống sẽ tạo xong file JSON rồi mới upload ảnh". **Nhưng thực tế hoàn toàn ngược lại!** Hệ thống sẽ **upload toàn bộ hình ảnh TRƯỚC**, rồi mới đóng gói và upload file JSON.

Dưới đây là thứ tự thi hành thực tế trong sự kiện `Btnsubmit2_Click`:

### Bước 1: Duyệt Dữ Liệu & Xử Lý Hình Ảnh (Song Song)
Khi hệ thống chạy vòng lặp để ghép dữ liệu từ Database vào đối tượng C# (bước chuẩn bị JSON), mỗi khi gặp một URL hình ảnh (ảnh overview hoặc ảnh defect), nó thực hiện ngay lập tức chuỗi hành động sau thông qua hàm trung gian `DownloadImageandUpload`:
1. **Đổi tên ảnh chuẩn hóa:** Format lại tên file ảnh thành cấu trúc `[Unikey].[tên_file_gốc].[phần_mở_rộng]`. `Unikey` là mã khóa ngoại liên kết ảnh với một báo cáo cụ thể trong Pivot88.
2. **Download về thiết bị (Local):** Gọi `WebClient.DownloadFile` để **tải file ảnh từ Web Server** (`http://192.168.1.248/ImageQCFINAL/...`) về thư mục `Downloads` của máy tính bảng.
3. **Upload ảnh lên SFTP:** Ngay sau khi tải xong, gọi `UpSFTPImage(..., type = 1)` để đẩy thẳng file ảnh đó lên SFTP thư mục **`/incoming/images/`**.
4. **Dọn rác (Clean up):** Upload xong, hệ thống chạy `File.Delete()` để xóa file ảnh vừa tải trong máy tính bảng, tiết kiệm bộ nhớ.

*Hành động này lặp lại cho hàng chục/hàng trăm tấm ảnh trong báo cáo PO đó.*

### Bước 2: Sinh File JSON (Serialization)
Sau khi toàn bộ dữ liệu đã được tổng hợp (và tất cả hình ảnh tương ứng **đã được đẩy thành công** lên thư mục `/incoming/images/`), hệ thống mới tiến hành convert đối tượng C# thành chuỗi text chuẩn JSON.

### Bước 3: Ghi File JSON Xuống Local
Chuỗi JSON được ghi vật lý xuống thiết bị bằng `StreamWriter` với định dạng tên: `JsonTest_AQLOutbound_[PO]_[Timestamp].json`.

### Bước 4: Upload File JSON Lên SFTP
Hệ thống gọi lệnh chốt hạ: `UpSFTPImage(nm, dirPath, 0);`. 
File JSON sẽ được đẩy vào thư mục gốc **`/incoming/`**.

*Lý do cho việc JSON vào sau:* Khi hệ thống Pivot88 quét thư mục `/incoming/`, nó sẽ đọc file JSON. Bên trong file JSON có chứa tham chiếu tên các file ảnh. Nếu file JSON đẩy lên trước mà ảnh chưa kịp lên `/incoming/images/`, Pivot88 sẽ báo lỗi thiếu file đính kèm! Do đó, **Ảnh phải lên trước, JSON lên sau làm lệnh chốt.**

### Bước 5: Lưu Log & Khóa Giao Diện
- Xóa file JSON ở máy tính bảng.
- Insert dữ liệu vào bảng `InlineFGsWHPOSFTP` để lưu lịch sử đã submit.
- Hiển thị Popup `"Submited COMPLETE..."` và vô hiệu hóa các nút bấm, ngăn không cho gửi lại.

---

## 3. Đề Xuất Chuyển Đổi Lên Nền Tảng Spring Boot (Web)

Trên nền tảng Web mới, kịch bản này nên được thiết kế lại tối ưu hơn nhiều:

1. **Không Cần Tải File Trung Gian Về Local:** Thay vì C# App phải tải file ảnh từ máy chủ `192.168.1.248` về thiết bị rồi lại phải đẩy lên Pivot88 (qua mạng 3G/Wifi rất dễ lỗi), Spring Boot Backend hoàn toàn có thể lấy ảnh trực tiếp thông qua Network LAN (hoặc SMB) từ `192.168.1.248` và Stream thẳng sang `SFTP Pivot88`. Việc này giảm tải hoàn toàn cho Client Web.
2. **Thư Viện SSH/SFTP Java:** Có thể dùng `JSCh` hoặc `Apache MINA SSHD` trong Java để thay thế thư viện `SftpClient` của C#.
3. **Transaction File JSON:** Spring Boot tạo JSON dạng `String`, sau đó convert sang `InputStream` để bắn thẳng vào SFTP `/incoming/` mà không cần ghi file vật lý `.json` xuống ổ cứng Server (trừ khi cần log file).
