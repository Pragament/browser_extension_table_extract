let tableDataArray = [];
let dataTable;
let sqlWorker;
let chart;

function extractAllTables() {
  const tables = Array.from(document.querySelectorAll("table"));
  return tables.map(table => {
    const rows = Array.from(table.rows);
    return rows.map(row => Array.from(row.cells).map(cell => cell.textContent.trim()));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: extractAllTables
    }, results => {
      if (chrome.runtime.lastError || !results || !results[0].result) {
        alert("❌ Error extracting tables.");
        return;
      }
      tableDataArray = results[0].result;
      populateTableSelector();
    });
  });

  document.getElementById("tableSelector").addEventListener("change", renderTableAndChartControls);
  document.getElementById("downloadCsv").addEventListener("click", downloadCSV);
  document.getElementById("chartType").addEventListener("change", renderChart);
  document.getElementById("xAxis").addEventListener("change", renderChart);
  document.getElementById("yAxis").addEventListener("change", renderChart);
  document.getElementById("runSqlBtn").addEventListener("click", runSQLQuery);
});

function populateTableSelector() {
  const selector = document.getElementById("tableSelector");
  selector.innerHTML = tableDataArray.map((_, i) => `<option value="${i}">Table ${i + 1}</option>`).join("");
  renderTableAndChartControls();
}

function renderTableAndChartControls() {
  const index = document.getElementById("tableSelector").value;
  const table = tableDataArray[index];
  if (!table || table.length < 2) return;

  const headers = table[0];
  const body = table.slice(1);

  const container = document.getElementById("tableContainer");
  container.innerHTML = `<table id="dataTable" class="display nowrap" style="width:100%"></table>`;
  const tableEl = document.getElementById("dataTable");
  const thead = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>`;
  tableEl.innerHTML = thead;

  if (dataTable) dataTable.destroy();
  dataTable = new DataTable(tableEl, {
    data: body,
    columns: headers.map(h => ({ title: h })),
    responsive: true,
    scrollX: true,
    paging: true,
    pageLength: 10,
    colReorder: true,
    fixedHeader: true,
    dom: 'Bfrtip',
    buttons: ['copy', 'csv', 'excel', 'pdf', 'print', 'colvis'],
    initComplete: renderChart
  });

  const xSel = document.getElementById("xAxis");
  const ySel = document.getElementById("yAxis");
  xSel.innerHTML = headers.map((h, i) => `<option value="${i}">${h}</option>`).join("");
  ySel.innerHTML = headers.map((h, i) => `<option value="${i}">${h}</option>`).join("");

  initializeSQLDatabase(headers, body);
}

function initializeSQLDatabase(headers, rows) {
  if (sqlWorker) sqlWorker.terminate();

  sqlWorker = new Worker(chrome.runtime.getURL("scripts/sql-worker.js"));

  const sqlJsUrl = chrome.runtime.getURL("scripts/sql-wasm.js");

  sqlWorker.onmessage = (e) => {
    const { type, result, error } = e.data;

    if (type === "ready") {
      sqlWorker.postMessage({ type: "init", headers, rows });
    } else if (type === "initialized") {
      showSQLResult("✅ SQL database initialized.");
    } else if (type === "queryResult") {
      renderSQLResult(result);
    } else if (type === "error") {
      showSQLResult(`❌ SQL Error: ${error}`);
    }
  };

  sqlWorker.postMessage({ type: "initWorker", wasmPath: sqlJsUrl });
}

function runSQLQuery() {
  const inputEl = document.getElementById("sqlQuery");
  if (!inputEl) {
    showSQLResult("❌ SQL input box not found.");
    return;
  }

  const query = inputEl.value.trim();
  if (!query) {
    showSQLResult("⚠️ Please enter a SQL query.");
    return;
  }

  if (!sqlWorker) {
    showSQLResult("⚠️ SQL worker not ready.");
    return;
  }

  sqlWorker.postMessage({ type: "query", query });
}

function showSQLResult(message) {
  const output = document.getElementById("sqlResult");
  output.innerHTML = `<div class="text-warning mt-2">${message}</div>`;
}

function renderSQLResult(result) {
  const output = document.getElementById("sqlResult");
  if (!result || result.length === 0) {
    output.innerHTML = "<div class='text-muted'>No results.</div>";
    return;
  }

  const headers = result[0].columns;
  const rows = result[0].values;

  let html = "<table class='table table-sm table-bordered'><thead><tr>";
  html += headers.map(h => `<th>${h}</th>`).join("");
  html += "</tr></thead><tbody>";
  html += rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("");
  html += "</tbody></table>";

  output.innerHTML = html;
}

function downloadCSV() {
  const index = document.getElementById("tableSelector").value;
  const table = tableDataArray[index];
  const csv = table.map(row => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `table_${index}.csv`;
  a.click();
}

function downloadChartImage() {
  const canvas = document.getElementById("chartCanvas");
  const link = document.createElement("a");
  link.download = "chart.png";
  link.href = canvas.toDataURL();
  link.click();
}

function renderChart() {
  if (!dataTable) return;

  const xIndex = +document.getElementById("xAxis").value;
  const yIndices = Array.from(document.getElementById("yAxis").selectedOptions).map(opt => +opt.value);
  const chartType = document.getElementById("chartType").value;
  const headers = dataTable.columns().header().toArray().map(th => th.innerText);
  const data = dataTable.rows({ search: "applied" }).data().toArray();

  const labels = data.map(row => row[xIndex]);
  const datasets = yIndices.map(i => ({
    label: headers[i],
    data: data.map(row => +row[i] || 0),
    backgroundColor: getRandomColor(),
    borderColor: getRandomColor(),
    borderWidth: 1,
    fill: false
  }));

  const ctx = document.getElementById("chartCanvas").getContext("2d");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: chartType,
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: { legend: { position: "top" } },
      scales: chartType !== "pie" ? { y: { beginAtZero: true } } : {}
    }
  });
}

function getRandomColor() {
  const r = Math.floor(Math.random() * 200);
  const g = Math.floor(Math.random() * 200);
  const b = Math.floor(Math.random() * 200);
  return `rgba(${r},${g},${b},0.6)`;
}