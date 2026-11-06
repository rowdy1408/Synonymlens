# SynonymLens · IELTS

Trang tra từ cho học viên IELTS: gõ một từ để xem nghĩa, collocation, mẫu câu, từ đồng nghĩa và trái nghĩa. Mỗi từ có 2 tray: **Word** và **Synonyms & antonyms**.

Trang luôn hiện ở giao diện sáng (giống bản thiết kế), kể cả khi máy đang để chế độ tối.

Trang là web tĩnh, chỉ gồm HTML, CSS và JavaScript. Không cần server riêng, không cần API key.

## Hai loại mục từ

| Loại | Nguồn | Có gì |
|---|---|---|
| **Full card** | `js/curated.js` (giáo viên soạn và duyệt) | CEFR, collocation, mẫu câu có ô slot, bảng synonym có ký hiệu ▲▼ ⊂⊃≠ +−, khung chi tiết, antonym với 3 cách dùng |
| **Basic entry** | `data/` (WordNet 3.1 + câu ví dụ Tatoeba) | Cùng khuôn với full card: 2 tray, bảng Verdict · Degree · Scope · Attitude, khung chi tiết, antonym 3 cách dùng. Phần WordNet không có (CEFR, collocation, mức độ, thái độ, register) hiện dấu **?** viền đứt = chưa kiểm tra. Scope lấy từ quan hệ WordNet (= ≈ ⊃ ⊂); swap test và negation test thay từ tự động trong câu ví dụ |

Hiện có 1 full card là **important**. Các từ khác hiện ở dạng basic entry. Từ tục và từ quá chuyên ngành bị chặn, có thông báo riêng.

## Đưa lên GitHub Pages

1. Tạo một repository mới trên GitHub.
2. Giải nén file zip, rồi upload **toàn bộ nội dung bên trong thư mục** lên repository. File `index.html` phải nằm ngay ở thư mục gốc.
   - Trên web GitHub: **Add file → Upload files**, kéo thả các thư mục `css`, `js`, `data` cùng các file lẻ. GitHub cho upload tối đa 100 file mỗi lần. Thư mục `data` có 94 file, nên upload `data` một lượt riêng.
3. Vào **Settings → Pages**. Ở mục **Source**, chọn **Deploy from a branch**, branch `main`, thư mục `/ (root)`, rồi bấm **Save**.
4. Chờ 1–2 phút. Trang sẽ chạy ở `https://<tên-tài-khoản>.github.io/<tên-repo>/`.

> Mở thẳng `index.html` từ máy (file://) thì full card vẫn chạy, nhưng basic entry không tải được dữ liệu, vì trình duyệt chặn đọc file. Muốn thử trên máy thì mở terminal trong thư mục và chạy `python3 -m http.server`, rồi vào `http://localhost:8000`.

## Thêm một full card

Mở `js/curated.js`. Chép khối dữ liệu của `important` rồi sửa nội dung. Mỗi từ gồm:

- `entry`: từ, loại từ, IPA UK/US; mỗi nghĩa có `level` (CEFR), `short`, `def`, `use`, `collocations`, `patterns`.
- `syn`: theo từng nghĩa, `synonyms` + `more`; mỗi từ có `verdict`, `degree`, `scope`, `att`, `register`, `pair`, `use`, `avoid`, `grammar`, `ok`, `no`.
- `ant`: theo từng nghĩa; mỗi antonym có `p` (vị trí trên thang), `opp`, `att`, `neg`, `pair`, `contrast`, `trap`, `use`, `avoid`, `ok`, `no`.
- `scale`: các nhóm từ trên thang "How much it matters".
- `family`: các dạng khác của từ, gõ vào sẽ dẫn về thẻ (ví dụ `importance`).

Trong câu ví dụ, bọc từ cần tô đậm bằng dấu `*…*`. Ô slot viết theo dạng `+ N`, `+ V`, `+ V-ing`, `+ S + V`, `+ sb`, `+ sth`.

Có full card rồi, ô tìm kiếm tự hiểu thêm: gõ sai chính tả, gõ dạng khác trong họ từ, và gõ cả cụm thì cuộn tới đúng collocation hoặc mẫu câu.

## Kho câu ví dụ riêng (`data/examples.csv`)

Câu ví dụ do mình tự soạn theo chủ đề IELTS. Câu nào cũng gắn với đúng một nghĩa của từ. Trên trang, các câu này hiện **trước** câu WordNet và Tatoeba.

| Cột | Ý nghĩa |
|---|---|
| `word` | Từ gốc, viết thường (ví dụ `environment`) |
| `sense` | Số thứ tự nghĩa, đúng số trên tab nghĩa của trang (1, 2, 3…) |
| `sentence` | Câu ví dụ. Bọc từ cần tô đậm bằng `*…*`. Câu có dấu phẩy thì đặt trong ngoặc kép `"…"` |
| `topic` | Chủ đề: Education, Environment, Work… |
| `skill` | Writing hoặc Speaking |
| `status` | `draft` hiện kèm nhãn "draft · not reviewed"; `approved` hiện bình thường; trạng thái khác (ví dụ `hidden`) thì không hiện |

**Cách sửa:** mở `data/examples.csv` trên GitHub, bấm biểu tượng bút chì, sửa hoặc thêm dòng, rồi bấm **Commit changes**. Trang cập nhật sau 1–2 phút. Muốn sửa nhiều thì tải file về, mở bằng Excel hoặc Google Sheets, sửa xong lưu lại dạng CSV (UTF-8) rồi upload đè lên.

Có 148 câu cho 60 từ của Academic Word List (sublist 1), cộng 65 câu cho các collocation chủ đề (Education, Environment, Health, Cities, Crime and law), gắn vào từng từ trong cụm. Các câu do AI soạn nháp nên đang để `draft`, chờ giáo viên duyệt.

## Collocation và chủ đề IELTS từ sách (`data/collocations.csv`, `data/topics.csv`)

Lấy từ 4 cuốn: *Cambridge Vocabulary for IELTS*, *Check Your English Vocabulary for IELTS*, *IELTS Vocabulary Masterclass 8.5 (Book 2)* và *IELTSforFREE: IELTS Vocabulary*. Mỗi dòng ghi rõ nguồn: sách và unit, trang hoặc set.

- `collocations.csv` (`word, sense, collocation, topic, source, status`): hiện trong cột **Collocations** của tray Word, đúng nghĩa ghi ở cột `sense`. Số nghĩa được gán tự động, nên có thể lệch. Thấy sai thì sửa số `sense`, hoặc đổi `status` thành `hidden`.
- `topics.csv` (`word, topic, source`): hiện thành dòng **IELTS topics** ở đầu tray Word. Rê chuột lên một chủ đề để xem nguồn.
- Trang chỉ lấy cụm từ và tên chủ đề. Câu ví dụ, định nghĩa và bài tập trong sách **không** đưa lên trang. Câu ví dụ cho collocation là câu tự viết, nằm trong `examples.csv`.

## Lịch sử tìm kiếm

Các từ đã tra được lưu ngay trong trình duyệt của người dùng (localStorage), không gửi đi đâu. Bấm vào ô tìm kiếm để xem lại. Bấm × ở cuối dòng để xoá một từ (hoặc chọn dòng bằng phím mũi tên rồi nhấn Delete), hoặc bấm **Clear all** để xoá hết.

## Cấu trúc thư mục

```
index.html
css/style.css
js/words.js      danh sách gợi ý khi gõ (từ đơn, xếp theo tần suất)
js/curated.js    full card do giáo viên soạn
js/lexicon.js    đọc dữ liệu WordNet, tìm dạng gốc của từ
js/app.js        giao diện, tìm kiếm, lịch sử
data/            WordNet theo phần (manifest.json + s000–s090.json),
                 words.json (tần suất), ipa-us.json (phiên âm Mỹ),
                 ex/a.json … ex/z.json (câu ví dụ Tatoeba, tối đa 4 câu mỗi từ)
```

## Nguồn dữ liệu và giấy phép

- **WordNet 3.1**, © Princeton University. Giấy phép nằm trong `WORDNET_LICENSE.txt`.
- **wordfreq** của Robyn Speer: chỉ dùng điểm tần suất (zipf). Dữ liệu wordfreq theo giấy phép CC BY-SA 4.0.
- **CMU Pronouncing Dictionary**, © Carnegie Mellon University (giấy phép kiểu BSD), lấy qua gói `cmu-pronouncing-dictionary` (ISC, xem `CMUDICT_LICENSE.txt`). Phiên âm Mỹ được chuyển tự động từ ký hiệu ARPAbet sang IPA, nên vị trí dấu nhấn có thể lệch ở một số từ.
- **Tatoeba** (tatoeba.org), giấy phép CC BY 2.0 FR: câu ví dụ cho basic entry. Câu được chọn tự động theo từ, không theo nghĩa, nên có thể minh hoạ một nghĩa khác của từ. Trang có ghi chú điều này.
- Nội dung các full card do giáo viên soạn.
