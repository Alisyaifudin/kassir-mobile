export const mig00 = `PRAGMA journal_mode = 'wal';
CREATE TABLE products (
  id INTEGER PRIMARY KEY, 
  name TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER NOT NULL,
  barcode TEXT,
  capital REAL NOT NULL DEFAULT 0,
  note TEXT NOT NULL DEFAULT ''
);`