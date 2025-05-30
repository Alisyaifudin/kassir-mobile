CREATE TABLE cashiers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL REFERENCES roles(role),
  password TEXT NOT NULL
) STRICT;

CREATE TABLE roles (
  role TEXT PRIMARY KEY
) STRICT;

INSERT INTO roles VALUES ('admin'), ('manager'), ('user');

CREATE TABLE disc_kinds (
  kind TEXT PRIMARY KEY
) STRICT;

INSERT INTO disc_kinds VALUES ('number'), ('percent');

CREATE TABLE modes (
  mode TEXT PRIMARY KEY
) STRICT;

INSERT INTO modes VALUES ('sell'), ('buy');

CREATE TABLE methods (
  method TEXT PRIMARY KEY
) STRICT;

INSERT INTO methods VALUES ('cash'), ('transfer'), ('debit'), ('qris');

CREATE TABLE method_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  method TEXT NOT NULL REFERENCES methods(method)
) STRICT;

CREATE TABLE records (
  timestamp INTEGER PRIMARY KEY,
  total_before_disc REAL NOT NULL,
  disc_val REAL NOT NULL,
  disc_eff_val REAL NOT NULL,
  disc_kind TEXT NOT NULL REFERENCES disc_kinds(kind),
  total_additional REAL NOT NULL,
  rounding REAL NOT NULL,
  credit INTEGER NOT NULL CHECK (credit IN (0, 1)),
  cashier TEXT NOT NULL,
  mode TEXT NOT NULL REFERENCES modes(mode),
  pay REAL NOT NULL,
  method INTEGER REFERENCES method_types(id),
  note TEXT NOT NULL DEFAULT ''
) STRICT;

CREATE TABLE record_items (
  id INTEGER PRIMARY KEY,
  timestamp INTEGER NOT NULL REFERENCES records(timestamp) ON DELETE CASCADE ON UPDATE CASCADE,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  qty INTEGER NOT NULL,
  disc_val REAL NOT NULL,
  capital REAL NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL ON UPDATE CASCADE
) STRICT;

CREATE TABLE additionals (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  timestamp INTEGER NOT NULL REFERENCES records(timestamp) ON DELETE CASCADE ON UPDATE CASCADE,
  value REAL NOT NULL,
  kind TEXT NOT NULL REFERENCES disc_kinds(kind),
  eff_value REAL NOT NULL
) STRICT;

CREATE TABLE discounts (
  id INTEGER PRIMARY KEY,
  record_item_id INTEGER NOT NULL REFERENCES record_items(id) ON DELETE CASCADE ON UPDATE CASCADE,
  value REAL NOT NULL,
  kind TEXT NOT NULL REFERENCES disc_kinds(kind),
  eff_value REAL NOT NULL
) STRICT;