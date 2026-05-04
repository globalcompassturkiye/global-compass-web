-- students tablosunda kayit_tarihi yoksa bir kez uygulayın:
-- wrangler d1 execute STUDENTS_DB --remote --file=./migrations/0001_add_kayit_tarihi.sql
-- Kolon zaten varsa bu dosyayı atlayın (SQLite ADD COLUMN tekrar çalışmaz).

ALTER TABLE students ADD COLUMN kayit_tarihi TEXT;
