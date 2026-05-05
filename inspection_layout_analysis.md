# Phân Tích Chi Tiết Layout — Inspection_Fast_CTQ (C# Xamarin)

> **File nguồn phân tích:**
> - `activity_main.xml` (3300+ dòng, layout chính)
> - `Strings.xml` (tất cả label text)
> - `MainActivity.cs` (4400+ dòng, logic & data binding)
> - Các layout phụ: `layoutshowallpo.axml`, `layoutht.axml`, `layoutcl.axml`, `layoutdefimg.axml`, `layouteditctnnum.xml`

---

## Tổng quan bố cục

Ứng dụng là **single-page vertical scroll** trên tablet/điện thoại, chạy ở chế độ **Portrait**. Toàn bộ giao diện nằm trong 1 `ScrollView` dọc, chia thành **13 section** xếp chồng từ trên xuống dưới. Bên phải màn hình có 1 cột nút bấm cố định (floating buttons).

```
┌─────────────────────────────────────────────────────┐
│  [FLOATING BUTTONS - Cột phải, cố định]             │
│  ┌──────┐                                           │
│  │UNHIDE│  ← btnhide                                │
│  │ SAVE │  ← btnsaveall                             │
│  │IMAGE │  ← btnsaveimage                           │
│  │CHKPO │  ← btnshowpo1                             │
│  │CHART │  ← btnend_in_report                       │
│  │CLRIMG│  ← btnclearimage                          │
│  │CLRPO │  ← btnclear_po                            │
│  │ WEB  │  ← btnview_web                            │
│  │REWORK│  ← btntracking_rework                     │
│  │SUBMIT│  ← btnsubmit1                             │
│  │TRANS │  ← btnsubmit2  (Submit TRANS4M)           │
│  └──────┘                                           │
│                                                     │
│ ┌─────── SCROLLVIEW (toàn bộ nội dung) ───────────┐ │
│ │  SECTION 1: Login                                │ │
│ │  SECTION 2: PO Header (PO Number, SKU, Qty...)   │ │
│ │  SECTION 3: ExpandableListView (PO Detail)       │ │
│ │  SECTION 4: General Checklist                    │ │
│ │  SECTION 5: Fabric & Artwork Checklist           │ │
│ │  SECTION 6: Label Checklist                      │ │
│ │  SECTION 7: Packaging Checklist                  │ │
│ │  SECTION 8: Measurements                         │ │
│ │  SECTION 9: Inspection Quantities                │ │
│ │  SECTION 10: Photos (6 nút chụp ảnh)            │ │
│ │  SECTION 11: ExpandableListView (Defect Picker)  │ │
│ │  SECTION 12: Result (Pass/Fail + Totals)         │ │
│ │  SECTION 13: Defect List + Submit Button         │ │
│ └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## SECTION 1: Login

**Mô tả:** Màn hình đăng nhập, hiển thị ban đầu. Sau khi login thành công sẽ ẩn đi và hiện các section còn lại.

| ID | Loại | Nội dung / Label | Ghi chú |
|:---|:---|:---|:---|
| `ed1` | EditText | "User name" | Username input |
| `ed2` | EditText (password) | "Password" | Password input |
| `btn1` | Button | "Login v1.48" | Nút login, nền cam `#fff69212` |
| `btn2` | Button | "APP - Regular orders" | Chọn AQL mode: `Regular orders (AQL 1.0, Level I)` |
| `btn3` | Button | "APP - Japan orders" | Chọn AQL mode: `Japan orders (AQL 1.0, Level II)` |
| `btn4` | Button | "APP - 100% inspection" | Chọn AQL mode: `100%inspection` |

**Logic:** Khi click Login → gọi `exec [Hr].[dbo].[ADynamicApp] 72, 'newlogin', user, pass...` → nếu thành công → lưu `inspectorid`, `inspectorname`, `factory` → ẩn `layoutlogin`, hiện phần nội dung.

---

## SECTION 2: PO Header (Thông tin đầu vào PO)

**Mô tả:** Dãy các ô nhập/hiển thị nằm ngang, mỗi ô chiếm ~25% chiều rộng.

| ID | Loại | Label (Strings.xml) | Dữ liệu | Ghi chú |
|:---|:---|:---|:---|:---|
| `ed3` | EditText | "PO Number" | Nhập PO Number | User nhập tay |
| `tv1` | TextView | — | Hiển thị SKU (gán = `txtsku`) | Từ `dtt.Rows[0]["SKU"]` |
| `tv2` | TextView | — | Hiển thị SKU dạng dài | Hiển thị chuỗi tất cả SKU |
| `tv3` | TextView | — | — | (spacer hoặc info phụ) |
| `tv4` | TextView | "Supplier" | `txtsup` = `dtt.Rows[0]["CompanyName"]` | |
| `tv5` | TextView | "Po QTY" | `txttotalqty` = `dtt.Rows[0]["QtyTotal"]` | |
| `tv6` | TextView | "Inspected QTY" | Label tĩnh | |
| `tv7` | EditText | "Inspected QTY" | `edinspecqty` = editable | User có thể sửa |
| `btnsearchpo` | Button | "Search PO" | Nền cam `#fff69212` | Mở Dialog chọn PO |
| `btnsave1` | Button | "SAVE" | Ẩn (`visibility=gone`) | Dự phòng |

**Logic khi bấm "SEARCH PO":**
1. Gọi `exec [Hr].[dbo].[ADynamicApp] 72, '{poNumber}', '{factory}', '', '', '', ''`
2. Lấy `DataTable`, tạo distinct theo `PlanRefNo, PONo, QtyTotal, Inspector`
3. Hiển thị **Dialog** (`layoutshowallpo.axml`) với ListView chứa các cột:
   - **PlanRefNo** | **PONo** | **QtyTotal** | **Inspector**
4. Khi user chọn 1 dòng → fill dữ liệu vào toàn bộ section PO Header + PO Detail

---

## SECTION 3: ExpandableListView — PO & Inspection Detail (`expan1`)

**Mô tả:** Một `ExpandableListView` có 1 group header: **"PO & Inspection Detail"**, bên trong chứa danh sách key-value (Label–Value).

| # | Label (Key) | Giá trị (Value) — Nguồn dữ liệu | 
|:---|:---|:---|
| 1 | Report Type | `aqllv` (ví dụ: "Regular orders (AQL 1.0, Level I)") |
| 2 | PO Number | `dtt.Rows[0]["PONo"]` |
| 3 | SKU Number | `dtt.Rows[0]["SKU"]` |
| 4 | SKU Name | "N/A" (hardcode) |
| 5 | Style | `dtt.Rows[0]["Style"]` |
| 6 | SKU Description | "N/A" (hardcode) |
| 7 | Quantity | "N/A" (hardcode) |
| 8 | Color | "N/A" (hardcode) |
| 9 | Size | `dtt.Rows[0]["ManuSize"]` |
| 10 | Client | "N/A" (hardcode) |
| 11 | Client PO# | "N/A" (hardcode) |
| 12 | Department | "N/A" (hardcode) |
| 13 | Origin | "N/A" (hardcode) |
| 14 | Destination | `dtt.Rows[0]["ShipDest"]` |
| 15 | Ship Mode | `dtt.Rows[0]["ShipMode"]` |
| 16 | ETD | "N/A" (hardcode) |
| 17 | Packing Type | "Carton" (hardcode) |
| 18 | Inspection Name | `inspectorname` (từ Login) |
| 19 | Supplier Name | `dtt.Rows[0]["CompanyName"]` |
| 20 | Supplier ERP ID | `dtt.Rows[0]["ERPID"]` |
| 21 | Factory ERP ID | `dtt.Rows[0]["ERPID"]` + "001" |

---

## SECTION 4: General Checklist (10 items)

**Header:** `tv8` — **"General"** (nền xám), bên dưới có 10 dòng. Mỗi dòng gồm:
- Cột 1 (40%): Label tên mục
- Cột 2 (20%): Nút **Conform** (nền xanh `#33FF33`)
- Cột 3 (30%): Nút **Non-Conform** (không nền)
- Cột 4 (10%): Nút **N/A** (không nền)

| # | ID Label | Label Text | ID Conform | ID Non-Conform | ID N/A |
|:---|:---|:---|:---|:---|:---|
| 1 | `tv9` | Material Approval | `tv91` | `tv92` | `tv93` |
| 2 | `tv10` | Sealing sample | `tv101` | `tv102` | `tv103` |
| 3 | `tv11` | Metal Detection | `tv111` | `tv112` | `tv113` |
| 4 | `tv12` | Finish Goods Testing | `tv121` | `tv122` | `tv123` |
| 5 | `tv13` | Moisture control (carton) | `tv131` | `tv132` | `tv133` |
| 6 | `tv14` | Moisture control (product) | `tv141` | `tv142` | `tv143` |
| 7 | `tv14gen7` | Factory disclaimer | `tv14gen71` | `tv14gen72` | `tv14gen73` |
| 8 | `tv14gen8` | A-01 compliance | `tv14gen81` | `tv14gen82` | `tv14gen83` |
| 9 | `tv14gen9` | CPSIA compliance | `tv14gen91` | `tv14gen92` | `tv14gen93` |
| 10 | `tv14gen10` | Customer/Country specific compliance | `tv14gen101` | `tv14gen102` | `tv14gen103` |

**Sau General → 1 dòng Comment:**

| ID | Loại | Label | Ghi chú |
|:---|:---|:---|:---|
| `tv15` | TextView | "Comment" (20%) | Label tĩnh |
| `ed151` | EditText | Placeholder: "100%-57/30-57/30" (80%) | `edcomentcarton` — user nhập hoặc auto fill từ DB |

**Logic toggle màu sắc:**
- Click **Conform** → nền xanh `#33FF33`, 2 nút kia về mặc định `#E6E6FA`
- Click **Non-Conform** → nền cam `#FF6600`, toàn bộ ScrollView chuyển đỏ nhạt `#FFE4E1`, nút FAIL bật đỏ
- Click **N/A** → nền cam `#FF6600`, 2 nút kia về nhạt
- Lưu vào 3 mảng: `listcheck1` (Conform), `listcheck2` (Non-Conform), `listcheck3` (N/A) — chứa index

---

## SECTION 5: Fabric & Artwork Checklist (4 items)

**Header:** `tv16` — **"Fabric and artwork checklist"** (nền xám)

| # | ID Label | Label Text | ID Conform | ID Non-Conform | ID N/A |
|:---|:---|:---|:---|:---|:---|
| 1 | `tv17` | Color/Shade | `tv171` | `tv172` | `tv173` |
| 2 | `tv18` | Handfeel | `tv181` | `tv182` | `tv183` |
| 3 | `tv19` | Appearance | `tv191` | `tv192` | `tv193` |
| 4 | `tv20` | Print/Emb/Decorations | `tv201` | `tv202` | `tv203` |

**Sau Fabric → 1 dòng Comment:**

| ID | Loại | Label |
|:---|:---|:---|
| `tv21` | TextView | "Comment" |
| `ed211` | EditText | "Add a Comment" |

---

## SECTION 6: Label Checklist (8 items)

**Header:** `tv22` — **"Label"** (nền xám)

| # | ID Label | Label Text | ID Conform | ID Non-Conform | ID N/A |
|:---|:---|:---|:---|:---|:---|
| 1 | `tv23` | Fiber Content | `tv231` | `tv232` | `tv233` |
| 2 | `tv24` | Care Instruction | `tv241` | `tv242` | `tv243` |
| 3 | `tv25` | Decorative Label | `tv251` | `tv252` | `tv253` |
| 4 | `tv26` | Adicom Label | `tv261` | `tv262` | `tv263` |
| 5 | `tv27` | Country of Origin | `tv271` | `tv272` | `tv273` |
| 6 | `tv28` | Size Key | `tv281` | `tv282` | `tv283` |
| 7 | `tv29` | 8_Flag Label | `tv291` | `tv292` | `tv293` |
| 8 | `tv30` | Additional Label | `tv301` | `tv302` | `tv303` |

**Sau Label → 1 dòng Comment:**

| ID | Loại | Label |
|:---|:---|:---|
| `tv31` | TextView | "Comment" |
| `ed311` | EditText | "Add a Comment" |

---

## SECTION 7: Packaging Checklist (4 items)

**Header:** `tv32` — **"Packaging"** (nền xám)

| # | ID Label | Label Text | ID Conform | ID Non-Conform | ID N/A |
|:---|:---|:---|:---|:---|:---|
| 1 | `tv33` | Shipping Mark | `tv331` | `tv332` | `tv333` |
| 2 | `tv34` | Polybag/Marketing | `tv341` | `tv342` | `tv343` |
| 3 | `tv35` | Color/Size/Qty | `tv351` | `tv352` | `tv353` |
| 4 | `tv36` | Hangtag | `tv361` | `tv362` | `tv363` |

**Sau Packaging → 1 dòng Comment:**

| ID | Loại | Label |
|:---|:---|:---|
| `tv37` | TextView | "Comment" |
| `ed371` | EditText | "Add a Comment" |

---

## SECTION 8: Measurements (1 item)

**Header:** `tv38` — **"Measurements"** (nền xám)

| # | ID Label | Label Text | ID Conform | ID Non-Conform | ID N/A |
|:---|:---|:---|:---|:---|:---|
| 1 | `tv39` | Min 2 pcs per size measured... | `tv391` | `tv392` | `tv393` |

**Sau Measurements → 1 dòng Comment:**

| ID | Loại | Label |
|:---|:---|:---|
| `tv40` | TextView | "Comment" |
| `ed401` | EditText | "Add a Comment" |

---

## SECTION 9: Inspection Quantities (4 fields)

**Header:** `tv41` — **"Inspection Quantities"** (nền xám, ẩn/hiện tuỳ mode)

| # | ID Label | Label Text (20%) | ID Value (80%) | Giá trị |
|:---|:---|:---|:---|:---|
| 1 | `tv42` | Booked Qty (Pcs) | `tv421` (`txtbookpcs`) | = `dtt.Rows[0]["QtyTotal"]` |
| 2 | `tv43` | Inspected Qty (Pcs) | `tv431` (`txtinsqtypcs`) | = `dtt.Rows[0]["QtyTotal"]` |
| 3 | `tv44` | SampleSize | `tv441` (`txtsamplesize`) | = `checksamplesize` result hoặc `dtt["InsQTY"]` |
| 4 | `tv45` | Inspected Carton Numbers | `tv451` (`txtctnnumber`) | = `dtt["CartonNum"]` hoặc `dtt["CTNNo"]` |

---

## SECTION 10: Photos (6 nút camera)

**Header:** `tv46` — **"Photos"** (nền xám)

| # | ID | Label Text | Mô tả |
|:---|:---|:---|:---|
| 1 | `btndef1` | China hangtab | Chụp ảnh nhãn Hangtab → lưu tpic1 |
| 2 | `btndef2` | Picture for special packaging (optional) | Chụp ảnh packaging → lưu tpic2 |
| 3 | `btndef3` | Compare Sample vs. Actual | Chụp ảnh so sánh → lưu tpic3 |
| 4 | `btndef4` | Exceptional development approval vs. Actual | Chụp exceptional → lưu tpic4 |
| 5 | `btndef5` | Defect photo (optional) | Chụp ảnh defect → lưu tpic5 |
| 6 | `btndef6` | Measurements | Chụp ảnh measurement → lưu tpic6 |

**Bên dưới 6 nút:** `layoutphoto1` — vùng hiển thị preview ảnh đã chụp (dạng Grid hình nhỏ).

**Logic chụp ảnh:** Click nút → mở Camera intent → nhận ảnh → convert Base64 → thêm vào list `tpic1..tpic6` → hiển thị preview. Khi Save → lưu vào bảng `QCFinalImage` với Description tương ứng (HANGTAB, PACKAGING, COMPARE, EXCEPTIONAL, DEFECT, MEASUREMENTS).

---

## SECTION 11: ExpandableListView — Defect Picker (`expan2`)

**Mô tả:** Một ExpandableListView cho phép user chọn loại lỗi để ghi nhận. Cấu trúc 2 cấp:
- **Group** (Level 1): Defect Type — load từ `exec QCFinal 'load_DefectType'` → ví dụ: "WORKMANSHIP", "MATERIAL", ...
- **Child** (Level 2): Defect Code — load từ `exec QCFinal 'load_DefectCode', '{DefectType}'` → ví dụ: "WK01-Broken Stitch", "MT02-Color Shading"

**Khi user chọn 1 child defect:**
1. Mở Dialog (`layoutht.axml`) gồm:
   - `editTextdefcri` — Critical qty (ẩn, visibility=gone)
   - `editTextdefma` — **Major qty** (hiển thị, user nhập số)
   - `editTextdefmi` — Minor qty (ẩn, visibility=gone)
   - `editTextdefunit` — Zone (ẩn)
   - `spinnerzonedef` — Spinner chọn Zone
   - `buttondefinput` — Nút **"Add"**
2. Nhấn Add → insert vào bảng `QCFinalDefImg` → cập nhật `Accepted`, `Rejected` trong `QCFinalReport`

---

## SECTION 12: Result (Kết quả Pass/Fail)

**Header:** `tv50` — **"Result"** (nền xám)

| ID | Label / Vai trò | Hiển thị |
|:---|:---|:---|
| `tv51` (`txtrspass`) | **PASS** (50%, nền xanh `#33FF33`) | Click → toàn ScrollView nền `#E6E6FA` |
| `tv511` (`txtrsfail`) | **FAIL** (50%, không nền) | Tự bật đỏ khi có Non-Conform hoặc defect |

**Header phụ:** `tv52` — **"Major"** (nền xám, full width)

| ID | Label | Giá trị |
|:---|:---|:---|
| `tv53` | Total Defects Found (50%) | — |
| `tv531` (`txttotaldef`) | Số defects (50%) | = tổng `Rejected` |
| `tv54` | Accept\|Reject Qty (50%) | — |
| `tv541` (`txttotalacre`) | Giá trị (50%) | = `Accepted\|Rejected` (ví dụ: "180\|20") |

---

## SECTION 13: Defect List + Submit

| ID | Loại | Mô tả |
|:---|:---|:---|
| `lv1` | ListView (nền `#99CC66`) | Hiển thị danh sách lỗi đã ghi nhận, mỗi dòng có Checkbox + Tên defect (`layoutcl.axml`). Long-press 1 dòng → xoá defect. |
| `btnsub` | Button (nền cam) | "Submit" — gọi logic tổng hợp, update status, sinh JSON Trans4m |

---

## Dialog phụ: Search PO Result (`layoutshowallpo.axml`)

Hiện khi user bấm "SEARCH PO". Là 1 ListView với header:

| Cột | Width | Nội dung |
|:---|:---|:---|
| `textViewshowpo1` (25dp) | Rất nhỏ | STT hoặc ký tự |
| `textViewshowpo2` (120dp) | **PONo** | Mã PO |
| `textViewshowpo3` (150dp) | **DateSubmit** | — (dùng cho hiển thị QtyTotal) |
| `textViewshowpo4` (195dp) | **Name** | Tên Inspector |
| `textViewshowpo5` (55dp) | **Status** | — |

**Thực tế trong code (line 1792):**  
DataTable distinct theo: `PlanRefNo`, `PONo`, `QtyTotal`, `Inspector`  
→ Hiển thị 4 cột: **PlanRefNo** | **PONo** | **QtyTotal** | **Inspector** (đúng như screenshot user cung cấp)

---

## Bản đồ Data Columns từ Store Procedure

Procedure `exec [Hr].[dbo].[ADynamicApp] 72` trả về các columns (trích từ code binding):

| Column Name | Dùng ở đâu |
|:---|:---|
| `PlanRefNo` | Unique key cho 1 inspection plan |
| `PONo` | Mã PO |
| `SKU` | Mã SKU |
| `CompanyName` | Tên Supplier |
| `QtyTotal` | Tổng số lượng PO |
| `InsQTY` | Số lượng đã inspect (nếu đã save trước đó) |
| `CartonNum` | Số carton |
| `CTNNo` | Số carton (backup) |
| `Style` | Mã Style |
| `ManuSize` | Sizes (dạng "66,58,54,62,42,70,46,50") |
| `ShipDest` | Destination (ví dụ: "GBR") |
| `ShipMode` | Ship Mode (ví dụ: "MO-002") |
| `ERPID` | ERP ID của Supplier |
| `RecNo` | Record Number (nếu đã tồn tại report) |
| `Accpected` | Số lượng accepted |
| `Rejected` | Số lượng rejected |
| `Status` | "Reject" hoặc khác |
| `list1` | GeneralList (Conform indexes, dạng "0\|1\|3\|5") |
| `list2` | CheckList (Non-Conform indexes) |
| `list3` | N/A indexes |
| `Fabriccomposition` | Thành phần vải |
| `Moisturestandard` | Tiêu chuẩn ẩm |
| `Piecescheck` | Số piece check |
| `Inspector` | Tên inspector |

---

## Tổng kết — Checklist Sections cho React Migration

| # | Section Name | Số items checklist | Có Comment? | Component React đề xuất |
|:---|:---|:---|:---|:---|
| 1 | Login | — | — | Đã có sẵn (PageLogin) |
| 2 | PO Header | 5 fields + Search | — | `PoHeader` |
| 3 | PO & Inspection Detail | 21 key-value | — | `PoDetailAccordion` |
| 4 | General | 10 items | ✅ | `ChecklistSection` (reusable) |
| 5 | Fabric & Artwork | 4 items | ✅ | `ChecklistSection` (reusable) |
| 6 | Label | 8 items | ✅ | `ChecklistSection` (reusable) |
| 7 | Packaging | 4 items | ✅ | `ChecklistSection` (reusable) |
| 8 | Measurements | 1 item | ✅ | `ChecklistSection` (reusable) |
| 9 | Inspection Quantities | 4 fields | — | `InspectionQuantities` |
| 10 | Photos | 6 nút camera | — | `PhotoSection` |
| 11 | Defect Picker | Dynamic (từ DB) | — | `DefectPickerAccordion` |
| 12 | Result | Pass/Fail + totals | — | `ResultSection` |
| 13 | Defect List + Submit | ListView + 1 button | — | `DefectListView` |
