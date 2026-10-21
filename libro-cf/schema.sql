CREATE TABLE IF NOT EXISTS visitas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  ip TEXT, pais TEXT, ciudad TEXT, region TEXT,
  ruta TEXT, capitulo TEXT, ua TEXT, ref TEXT
);
CREATE INDEX IF NOT EXISTS visitas_ts ON visitas(ts);
CREATE INDEX IF NOT EXISTS visitas_ip ON visitas(ip);
