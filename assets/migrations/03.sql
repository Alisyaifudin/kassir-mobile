CREATE TABLE socials (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  value TEXT NOT NULL
) STRICT;

CREATE TABLE money_kinds (
  kind TEXT PRIMARY KEY
) STRICT;

INSERT INTO money_kinds VALUES ('saving'), ('debt');

CREATE TABLE money (
  timestamp INTEGER PRIMARY KEY,
  value REAL NOT NULL,
  kind NOT NULL REFERENCES money_kinds(kind)
) STRICT;