-- Tekrarlanan form gönderimleri: aynı e-posta ile birden fazla satır için
-- email üzerindeki UNIQUE indeksini kaldırın.
--
-- İndeks adını doğrulamak için (bir kez):
--   wrangler d1 execute <BINDING_ADI> --remote --command "SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='students';"
--
-- Yaygın SQLite otomatik indeks adı (ilk UNIQUE sütun genelde _1):
DROP INDEX IF EXISTS sqlite_autoindex_students_1;

-- El ile oluşturulmuş benzersiz indeks adları için örnekler (varsa):
DROP INDEX IF EXISTS idx_students_email;
DROP INDEX IF EXISTS students_email_unique;
