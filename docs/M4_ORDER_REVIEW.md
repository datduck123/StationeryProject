# M4 — Order & Review

Tài liệu đối chiếu phạm vi M4-01–M4-12 của Huỳnh Tuấn Kiệt. Spring Boot 3.2 / Java 21, Spring Data JPA, SQL Server, Flyway; frontend React/Vite. OpenAPI được sinh từ controller và DTO đang chạy, tránh duy trì một bản schema khác với code.

## Phạm vi và nhánh

| Mã | Phần triển khai | Nhánh tương ứng | Bằng chứng / điều kiện hoàn tất |
| --- | --- | --- | --- |
| M4-01 | Orders, OrderItems, Reviews, Payment/Cart/Voucher mappings; FK và unique một review trên một order item | `feature/db-order-review-kiet` | Flyway trong `Be/src/main/resources/db/migration`; entity trong `Be/src/main/java/fpt/edu/vn/stationery/entity` |
| M4-02 | Tạo đơn từ giỏ trên server; tính tiền; khóa tồn kho/voucher; tạo payment; xóa giỏ trong cùng transaction | `feature/be-orders-kiet` | `OrderServiceImpl.createOrder`; `OrderFlowIntegrationTest` kiểm tra commit và rollback thực |
| M4-03 | Lịch sử, lọc/sắp xếp/phân trang, chi tiết đơn của mình, chỉ hủy PENDING, hoàn stock/voucher | `feature/be-orders-kiet` | `OrderController`, `CustomerOrderQueryService`, order tests |
| M4-04 | Danh sách/thống kê/chi tiết/cập nhật trạng thái; notification sau commit và transaction riêng | `feature/be-admin-orders-kiet` | `AdminOrderController`, `OrderStatusChangedListener`, `NotificationWriter` và listener tests |
| M4-05 | Review đúng người mua, đơn DELIVERED, đúng order item, một lần, rating/comment hợp lệ | `feature/be-reviews-kiet` | `ReviewServiceImpl`, `ReviewBusinessRuleTest`, unique FK database |
| M4-06 | API review công khai, điểm trung bình, số lượt, phân bố sao, phân trang; kiểm tra quyền review | `feature/be-reviews-kiet` | `ReviewPublicController` |
| M4-07 | Checkout sang trang đặt hàng thành công và lịch sử đơn dạng bảng | `feature/fe-orders-kiet` | `/checkout`, `/order-success`, `/account/orders` |
| M4-08 | Chi tiết đơn, timeline, mã vận đơn, hủy PENDING, review item đã giao | `feature/fe-orders-kiet` | `/account/orders/:id` |
| M4-09 | Admin bảng, tìm kiếm/lọc/sort/phân trang, badge, chi tiết, action đổi trạng thái | `feature/fe-admin-orders-kiet` | `/admin/orders`, `/admin/orders/:id` |
| M4-10 | Modal đánh giá 1–5 sao/comment; danh sách/điểm review ở sản phẩm; chặn chưa mua | `feature/fe-reviews-kiet` | `ProductReviewModal`, `ProductDetail`, order detail |
| M4-11 | Unit tests business rules và integration test transaction/database constraint | `test/order-review-kiet` | `ReviewBusinessRuleTest`, `OrderTransactionTest`, `OrderFlowIntegrationTest` |
| M4-12 | Hợp đồng Checkout → Order → Stock/Cart/Voucher; OpenAPI; PR tích hợp | `feature/integration-order-kiet` | Các hợp đồng bên dưới; chỉ ghi PR hoàn tất khi đã có URL PR và review của nhóm |

Code có trong working tree không đồng nghĩa code đã được commit/push vào từng nhánh. Trạng thái Git/PR phải kiểm tra riêng trước khi cập nhật bảng công việc.

## Chạy ứng dụng

1. Bật SQL Server và kiểm tra cấu hình datasource của môi trường local.
2. Trong thư mục `Fe` chạy `npm install` nếu chưa cài dependency và `npm run dev`. Launcher tự tạo khóa JWT riêng cho máy trong `Be/.dev-jwt-secret` (đã ignore khỏi Git); nếu có biến môi trường `JWT_SECRET`, launcher ưu tiên giá trị đó. Chạy backend trực tiếp bằng Maven cần tự đặt `JWT_SECRET`.
3. Chờ cả Vite và Spring Boot khởi động. Script từ chối chạy nếu cổng 3000/8080 đang có tiến trình khác; dừng đúng phiên dev cũ trước khi chạy lại.
4. Mở `http://localhost:3000`. Frontend chạy được trước backend chưa có nghĩa API đã sẵn sàng.

Có thể chạy bản demo trên cổng khác trong PowerShell, từ thư mục `Fe`:

```powershell
$env:FE_PORT = '3001'
$env:BE_PORT = '8081'
npm run dev
```

Khi đó mở `http://localhost:3001`; launcher tự trỏ frontend tới API `http://localhost:8081/api` và proxy ảnh upload đúng backend. Biến `VITE_API_BASE_URL` được cấu hình rõ sẽ được ưu tiên. Swagger dùng cùng `BE_PORT`.

Flyway tự chạy migration SQL Server khi backend khởi động. Không chạy SQL migration SQL Server bằng H2. Test H2 tạo schema từ entities và chỉ kiểm tra logic transaction/JPA; phải kiểm tra migration trên SQL Server riêng.

## Swagger và xác thực

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Dùng nút **Authorize**, nhập bearer JWT nhận từ API đăng nhập của dự án.
- Principal là email từ JWT; client không gửi `userId` để chọn chủ đơn/review.
- Nhóm `/api/admin/**` yêu cầu ADMIN. Cart/order/review yêu cầu đăng nhập. GET review sản phẩm được phép công khai.
- Trang bảng hiển thị STT `pageNumber * pageSize + index + 1`. API `orderId` vẫn là khóa thật dùng cho details/cancel/status; không thay ID database thành STT.

## Hợp đồng API

Các API phân trang dùng `page` bắt đầu từ **0**, `size` 1–100. UI hiển thị trang 1, 2, 3… và chuyển về chỉ số API tương ứng.

Response trang thống nhất:

```json
{
  "content": [],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 0,
  "totalPages": 0,
  "last": true
}
```

| Method | API | Request/query | Kết quả |
| --- | --- | --- | --- |
| GET | `/api/cart` | `shippingMethod=STANDARD\|EXPRESS`, `voucherCode` tùy chọn | Giỏ thật, tổng tiền/khối lượng, shipping, discount, thông báo stock |
| POST | `/api/cart/items` | `{ "productId": 1, "quantity": 2 }` | Thêm vào giỏ của user hiện tại |
| PUT | `/api/cart/items/{cartItemId}` | `{ "quantity": 3 }` | Đặt số lượng của item thuộc mình |
| DELETE | `/api/cart/items/{cartItemId}` | — | Xóa item thuộc mình |
| DELETE | `/api/cart` | — | Xóa giỏ của mình |
| GET | `/api/vouchers/active` | — | Voucher còn hạn và còn lượt |
| POST | `/api/orders` | DTO bên dưới | **201** chi tiết đơn đã tạo |
| GET | `/api/orders` | `status`, `page`, `size`, `sortBy`, `sortDir` | Đơn của user hiện tại |
| GET | `/api/orders/{orderId}` | — | Chi tiết đơn của mình; đơn của người khác trả **404** |
| PUT | `/api/orders/{orderId}/cancel` | — | Hủy đơn PENDING của mình, hoàn stock/voucher |
| GET | `/api/admin/orders` | `status`, `keyword`, `page`, `size`, `sortBy`, `sortDir` | Tất cả đơn; keyword theo mã đơn/tên/email |
| GET | `/api/admin/orders/stats` | — | Thống kê toàn bộ đơn, không chỉ trang hiện tại |
| GET | `/api/admin/orders/{orderId}` | — | Chi tiết đơn cho admin |
| PUT | `/api/admin/orders/{orderId}` | `{ "status": "CONFIRMED" }` | Chuyển trạng thái hợp lệ; notification sau commit |
| GET | `/api/notifications` | `is_read=true\|false`, `page`, `size` | Chỉ notification của mình |
| PUT | `/api/notifications/{id}/read` | — | Đánh dấu notification của mình đã đọc |
| POST | `/api/reviews` | `{ "orderItemId": 7, "rating": 5, "comment": "Sản phẩm tốt" }` | **201** review mới; **409** nếu item đã review |
| GET | `/api/products/{productId}/reviews` | `page`, `size`, `sortDir=asc\|desc` | Public: reviews, averageRating, reviewCount, ratingDistribution |
| GET | `/api/products/{productId}/reviews/eligibility` | JWT tùy chọn | `eligible`, `orderItemId` hợp lệ nếu có; lý do nếu không đủ điều kiện |
| DELETE | `/api/admin/reviews/{reviewId}` | — | Admin ẩn review vi phạm; giữ record để chặn review lại cùng item |

Ví dụ tạo đơn sau khi đã thêm cùng các item vào giỏ:

```json
{
  "shippingAddress": "123 Nguyễn Huệ, Quận 1, TP.HCM",
  "phone": "0900000000",
  "shippingMethod": "STANDARD",
  "paymentMethod": "COD",
  "voucherCode": null,
  "note": "Gọi trước khi giao"
}
```

Backend đọc toàn bộ giỏ của user đang đăng nhập từ database; request không nhận `items` do client tự dựng. Giá, tồn kho, khối lượng, voucher, phí giao, số tiền phải trả đều tính lại ở backend. Không gửi `subtotal`, `discountAmount`, `totalCost`, `paymentStatus` hoặc `userId` để quyết định kết quả.

`STANDARD`: 20.000 ₫; `EXPRESS`: 40.000 ₫. Voucher giảm số tiền cố định theo schema hiện hành và không vượt subtotal. Tổng phải trả = subtotal − discount + shipping. Payment mới là `PENDING`; COD được ghi nhận `SUCCESS` khi admin xác nhận DELIVERED, hủy payment còn PENDING chuyển `FAILED`. API cổng thanh toán/callback phải xác minh theo module thanh toán của nhóm trước khi đánh dấu online `SUCCESS`. `trackingCode` là mã theo dõi nội bộ sinh từ Order, chưa là mã do đơn vị vận chuyển cấp.

## Quy tắc trạng thái và notification

Luồng hợp lệ: `PENDING → CONFIRMED → SHIPPING → DELIVERED`. Admin có thể hủy trước khi giao; `DELIVERED`/`CANCELLED` là trạng thái kết thúc. Khách chỉ tự hủy khi `PENDING`. Cập nhật lặp cùng trạng thái không được hoàn tồn kho/voucher hoặc tạo notification trùng.

| Trạng thái mới | Loại notification | Nội dung |
| --- | --- | --- |
| CONFIRMED | `order_confirmed` | Đơn hàng #ID đã được xác nhận |
| SHIPPING / DELIVERED | `status_updated` | Đơn hàng #ID đã chuyển sang trạng thái đang giao / đã giao |
| CANCELLED | `order_cancelled` | Đơn hàng #ID đã bị hủy |

Event được publish trong service. Listener chạy `AFTER_COMMIT`, writer dùng transaction riêng. Lỗi tạo notification được log và không đảo ngược cập nhật đơn chính.

## Demo web bằng tài khoản customer và admin

Chuẩn bị một cửa sổ trình duyệt đăng nhập customer A và một cửa sổ ẩn danh đăng nhập ADMIN. Chọn sản phẩm ACTIVE có stock đủ; ghi lại tồn kho trước demo ở admin product. Có thể dùng customer B để thử quyền truy cập.

1. Customer A vào cửa hàng → chi tiết sản phẩm → thêm 2 sản phẩm vào giỏ. Thay số lượng, tải lại trang để kiểm tra giỏ đã lưu thật.
2. Vào giỏ → Thanh toán. Điền địa chỉ/điện thoại. Chọn STANDARD/EXPRESS để kiểm tra phí; nhập voucher hợp lệ nếu có. Kiểm tra subtotal, discount, shipping và total trước khi đặt.
3. Đặt hàng một lần. Kiểm tra trang thành công có mã đơn/mã vận đơn, tiền, trạng thái. Tải lại lịch sử đơn: có đơn mới; giỏ đã xóa item đã mua; admin product thấy stock giảm đúng số lượng.
4. Customer A mở danh sách `/account/orders`: STT tăng liên tục giữa các trang, filter trạng thái, sort mới/cũ và tổng tiền. Mở chi tiết để đối chiếu giá từng sản phẩm, payment, shipping, phone, voucher, timeline.
5. Tạo một đơn PENDING khác → bấm Hủy ở danh sách/chi tiết → xác nhận. Kiểm tra trạng thái CANCELLED và stock/voucher được hoàn đúng một lần. Thử hủy lại hoặc hủy đơn CONFIRMED: bị từ chối.
6. ADMIN vào Order Management. Tìm tên/email/mã đơn, lọc trạng thái, chuyển trang và đổi sort. Status chỉ hiển thị badge; Actions có Details và Edit status.
7. Với đơn đầu tiên, ADMIN dùng Edit status: CONFIRMED → SHIPPING → DELIVERED. Mở Details giữa các bước để kiểm tra dữ liệu đồng nhất. Không cho nhảy PENDING → DELIVERED hoặc đổi đơn đã kết thúc.
8. Customer A tải lại chi tiết đơn/notification: timeline và notification đúng từng thay đổi. Customer B mở URL đơn/notification của A: không đọc hoặc thao tác được.
9. Trước DELIVERED, nút đánh giá bị chặn. Sau DELIVERED, Customer A chọn một item → đánh giá 1–5 sao và comment → gửi. Tải lại trang: item báo đã đánh giá; gửi lại cùng item bị chặn.
10. Mở chi tiết đúng sản phẩm ở trình duyệt chưa đăng nhập: review vừa tạo hiển thị, trung bình/số lượt/phân bố sao đúng. Người chưa mua không được tự viết review cho sản phẩm đó.
11. ADMIN ẩn review thử nghiệm nếu cần; tải lại trang sản phẩm để kiểm tra review biến mất, trung bình và số lượt được tính lại. Customer không được gửi lại review cho cùng order item đã bị ẩn. Record vẫn được giữ để bảo toàn quy tắc mỗi item một lần.
12. Chuyển VI/EN ở trang customer; kiểm tra nhãn bảng, trạng thái, tiền, nút, modal và pagination đổi ngôn ngữ đồng bộ.

## Kiểm thử tự động

Chạy từ `Be`:

```powershell
.\mvnw.cmd -Pdev-isolated test
```

Chạy riêng các test của M4:

```powershell
.\mvnw.cmd -Pdev-isolated "-Dtest=OrderTransactionTest,OrderServiceTest,ReviewBusinessRuleTest,ReviewApiSecurityTest,OrderStatusChangedListenerTest,OrderFlowIntegrationTest,OrderConcurrencyIntegrationTest" test
```

`OrderFlowIntegrationTest` bắt buộc dùng `jdbc:h2:mem:order-flow`, không đọc/ghi SQL Server local. Mỗi action đi qua Spring transaction thật; dữ liệu được seed và đọc lại trong transaction riêng. Các trường hợp:

- Thành công: Order/OrderItems/Payment được lưu, stock và lượt voucher giảm, cart được xóa cùng một commit.
- Payment insert vi phạm CHECK thật trên database: mọi thay đổi Order/OrderItems/stock/voucher/cart rollback.
- Thiếu stock hoặc voucher hết hạn: không tạo order/payment, không mất cart, không thay stock/voucher.
- Hủy PENDING: hoàn stock/voucher đúng một lần.
- DELIVERED + đúng owner cho phép review; PENDING và owner khác bị chặn.
- Service chặn review lần hai; unique constraint database vẫn chặn nếu bỏ qua service.
- Public summary phản ánh rating/reviewCount/distribution sau review đã commit.
- Admin ẩn review vi phạm: loại khỏi public list/count/average/distribution nhưng giữ unique order_item và không cho gửi lại.
- Notification thật được tạo sau commit cho xác nhận/cập nhật/hủy; lỗi CHECK database khi insert notification không làm rollback trạng thái đơn chính.

`OrderConcurrencyIntegrationTest` chạy hai transaction đồng thời để kiểm tra: không bán quá stock, không tiêu thụ lượt voucher cuối hai lần, không tạo hai đơn từ cùng giỏ khi bấm hai lần, không hoàn stock/voucher hai lần khi hủy đồng thời.

Kết quả ngày 16/10/2026: toàn bộ backend **136 tests, 0 failures, 0 errors**, gồm 11 OrderFlow integration và 4 concurrency cases. Frontend `npm run build` thành công. Migration V1–V10 và 17 trường hợp ràng buộc dữ liệu đã được kiểm tra trên SQL Server database tạm riêng; database tạm được xóa sau kiểm tra. Backend local cũng khởi động thành công, Flyway cập nhật schema từ v7 lên v10. Kiểm tra HTTP trên ứng dụng thật: **19 kiểm tra PASS**, gồm customer/admin/public, chặn customer vào admin và chặn rating sai; không tạo/xóa đơn hay review của người dùng.

Script kiểm tra SQL Server tạm: `Be/scripts/Test-M4Migrations.ps1`. Script kiểm tra API local đang chạy: `Be/scripts/Test-M4Runtime.ps1` (dùng khóa JWT local do launcher tạo, không in token). Công cụ tự động điều khiển trình duyệt lỗi khởi tạo kernel trong phiên này; cần thực hiện các bước demo UI ở trên để nghiệm thu thao tác và bố cục trực quan.

Chạy build frontend từ `Fe`: `npm run build`. Build không thay cho demo trình duyệt; test H2 không thay cho chạy Flyway/kiểm tra locking SQL Server trên database thử nghiệm.

## Tích hợp và bàn giao M4-12

| Phần liên quan | Thành viên | Hợp đồng cần giữ |
| --- | --- | --- |
| Auth/User | Đạt | JWT principal=email, ROLE_CUSTOMER/ROLE_ADMIN, user ACTIVE |
| Product | Tài | `stock_quantity`, `weight_kg`, giá/stock lấy server; lock khi checkout/cancel |
| Cart/Checkout | Vương | `CartItems` thuộc user; checkout dùng cùng item/quantity với server; xóa cart sau thành công |
| Voucher | An | Schema `discount_amount`, `min_order_amount`, `status`, `usage_limit`, `used_count`; consume/release trong transaction |
| Order/Review | Kiệt | Đơn/stock/cart/voucher/payment commit cùng nhau; review gắn unique order_item, đủ business rules |

PR tích hợp cần nêu migrations mới, thay đổi hợp đồng cart/voucher/payment, kết quả test/build thực tế, và giới hạn online payment nếu gateway chưa được tích hợp. Gửi Tài/Vương review đoạn stock/cart; không đánh dấu M4-12 Done chỉ vì code đã build.
