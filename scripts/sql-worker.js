let SQL;
let db;

self.onmessage = async function (e) {
  const { type, headers, rows, query, wasmPath } = e.data;

  if (type === "initWorker") {
    try {
      importScripts(wasmPath);  // Load sql-wasm.js

      const wasmFilePath = wasmPath.replace(".js", ".wasm");

      initSqlJs({
        locateFile: () => wasmFilePath  // Tell SQL.js where to find .wasm
      }).then(SQLLib => {
        SQL = SQLLib;
        self.postMessage({ type: "ready" });
      }).catch(err => {
        self.postMessage({ type: "error", error: "initSqlJs failed: " + err.message });
      });

    } catch (err) {
      self.postMessage({ type: "error", error: "importScripts failed: " + err.message });
    }
  }

  if (type === "init") {
    try {
      db = new SQL.Database();

      const colDefs = headers.map(h => `"${h}" TEXT`).join(",");
      db.run(`CREATE TABLE data (${colDefs});`);

      const stmt = db.prepare(`INSERT INTO data VALUES (${headers.map(() => "?").join(",")})`);
      rows.forEach(row => stmt.run(row));
      stmt.free();

      self.postMessage({ type: "initialized" });
    } catch (err) {
      self.postMessage({ type: "error", error: err.message });
    }
  }

  if (type === "query") {
    try {
      const result = db.exec(query);
      self.postMessage({ type: "queryResult", result });
    } catch (err) {
      self.postMessage({ type: "error", error: err.message });
    }
  }
};
