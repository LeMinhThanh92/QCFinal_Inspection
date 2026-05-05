# Phân tích Logic "Search PO" từ source code C# (D:\QCFINAL_Fast\Inspection_Fast_CTQ)

Qua việc đọc source file `MainActivity.cs` của ứng dụng C# hiện tại, tôi đã nắm được toàn bộ quy trình khi người dùng tìm kiếm PO và cách ứng dụng lấy dữ liệu fill vào các trường trên UI. Dưới đây là phân tích chi tiết:

## 1. Luồng hoạt động (Workflow)
- Khi nhập `PONo` vào ô `edsearchpo` và nhấn Enter (ở hàm `Edsearchpo_KeyPress`), app sẽ gọi API / Stored Procedure:
  ```sql
  DtradeProduction.dbo.QCFinal 'searchpo','<PONo>','<factory>','','','',''
  ```
- Nếu trả về nhiều dòng, nó gom nhóm lại theo `PlanRefNo`, `PONo`, `QtyTotal` và cho user chọn qua một dialog (`AlertDialog`).
- Khi user click vào một mục trong Dialog, app copy các cột dữ liệu tương ứng từ `DataTable` vào giao diện.

## 2. Ánh xạ các trường dữ liệu (Data Mapping)

Đây là các biến UI trên form được gán dữ liệu cụ thể từ DB:

| Biến C# (Giao diện) | Cột trong Database (DataTable) | Vị trí bên Web App hiện tại (React) |
| :--- | :--- | :--- |
| `txtsku` (SKU Number) | `SKU` | PoDetailAccordion: `SKU Number` |
| `ponumber` / `edsearchpo` | `PONo` | PoDetailAccordion: `PO Number` |
| `txtsup` (Company) | `CompanyName` | PoDetailAccordion: `Supplier Name` |
| `txttotalqty` / `txtbookpcs`| `QtyTotal` | InspectionSections: `Booked Qty (Pcs)` |
| `txtinsqtypcs` | `QtyTotal` | InspectionSections: `Inspected Qty (Pcs)` |
| *Size* (Trong List) | `ManuSize` | PoDetailAccordion: `Size` |
| *Destination* (Trong List)| `ShipDest` | PoDetailAccordion: `Destination` |
| *Ship Mode* (Trong List) | `ShipMode` | PoDetailAccordion: `Ship Mode` |
| `txtctnnumber` | `CartonNum` (Ưu tiên) / `CTNNo` (Dự phòng) | InspectionSections: `Inspected Carton Numbers` |
| `txttotalacre` | `${Accpected} | ${Rejected}` | InspectionSections: `Accept \| Reject Qty` |
| `txttotaldef` | `Rejected` | InspectionSections: `Total Defects Found` |
| `edcomentcarton` | `${Fabriccomposition}-${Moisturestandard}-${Piecescheck}` | (Carton comments) |

## 3. Logic xử lý tính toán Sample Size (Rất quan trọng)
Có một logic ngầm để điền thông số **Sample Size**:
- C# gọi thêm 1 API check `samplesize` bằng mức độ AQL hiện tại (ví dụ: *Regular orders AQL 1.0*):
  ```sql
  DtradeProduction.dbo.QCFinal 'checksamplesize','<aqllv>','<QtyTotal>','','','',''
  ```
- Sau đó gán cho biến `samplesize`.
- **Logic chốt số lượng Inspection (InsQTY):**
  - Nếu `InsQTY` từ DB trả về là *null* hoặc *rỗng*, nó sẽ lấy `samplesize` vừa tính ở trên gán vào `txtsamplesize.Text` và `edinspecqty.Text`.
  - Nếu `InsQTY` trong DB đã có (tức là đã thao tác trước đó), nó sẽ dùng luôn `InsQTY` đó.

## 4. Xử lý Checklist & Result
- App đọc giá trị `list1`, `list2`, `list3` dạng chuỗi `1|4|7`... và gọi các hành động đổi màu nút tương ứng với *Conform*, *Non-Conform* và *N/A*. Điều này hoàn toàn khớp với logic Zustand `checklistStatuses` mà tôi đã build cho Web.
- Nếu thuộc tính `Accpected` khác 0, app sẽ cập nhật các text box Pass/Fail (`txttotalacre.Text` và `txttotaldef.Text`).

---
**Nhận xét đối chiếu với phiên bản Web mới (`PoDetailAccordion.tsx` và `InspectionSections.tsx`):**
Hệ thống Web hiện tại của chúng ta đã được map chính xác khoảng 90% các thông số này (ví dụ fallback `poInfo?.totalQty || poInfo?.QtyTotal`). Tuy nhiên, cần chú ý bổ sung logic **tính `samplesize` tự động** qua API khi `InsQTY` chưa có nếu API trên Web chưa làm việc đó.
