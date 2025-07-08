(function () {
  'use strict';

  function enhanceTable(table) {
    table.querySelectorAll("tr:nth-child(even)").forEach(row => {
      row.style.backgroundColor = "#f9f9f9";
    });
    table.querySelectorAll("tr").forEach(row => {
      row.addEventListener("mouseenter", () => row.style.backgroundColor = "#e0f7fa");
      row.addEventListener("mouseleave", () => {
        row.style.backgroundColor = row.rowIndex % 2 === 0 ? "#f9f9f9" : "white";
      });
    });

    const headers = table.querySelectorAll("th");
    headers.forEach((th, columnIndex) => {
      th.style.cursor = "pointer";
      th.addEventListener("click", () => {
        const rows = Array.from(table.rows).slice(1);
        const ascending = !th.classList.contains("ascending");
        rows.sort((a, b) => {
          const aText = a.cells[columnIndex].innerText.trim();
          const bText = b.cells[columnIndex].innerText.trim();
          return ascending
            ? aText.localeCompare(bText, undefined, { numeric: true })
            : bText.localeCompare(aText, undefined, { numeric: true });
        });
        rows.forEach(row => table.tBodies[0].appendChild(row));
        headers.forEach(h => h.classList.remove("ascending", "descending"));
        th.classList.add(ascending ? "ascending" : "descending");
      });
    });
  }

  function showPopup(tables) {
    if (document.getElementById("tableEnhancePopup")) return;

    const popup = document.createElement("div");
    popup.id = "tableEnhancePopup";
    popup.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        border: 1px solid #ccc;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        padding: 10px;
        font-family: sans-serif;
        z-index: 9999;
        border-radius: 8px;
      ">
        <strong style="display:block;margin-bottom:5px;">Table detected! Enhance it?</strong>
        <button id="enhanceBtn" style="background: #4CAF50; color: white; padding: 5px 10px; border: none; border-radius: 5px; cursor: pointer;">Enhance ✅</button>
        <button id="ignoreBtn" style="background: #f44336; color: white; padding: 5px 10px; border: none; border-radius: 5px; cursor: pointer; margin-left: 6px;">Ignore ❌</button>
      </div>
    `;
    document.body.appendChild(popup);

    document.getElementById("enhanceBtn").addEventListener("click", () => {
      tables.forEach(enhanceTable);
      popup.remove();
    });

    document.getElementById("ignoreBtn").addEventListener("click", () => {
      popup.remove();
    });
  }

  // Get tables and trigger popup
  const tables = Array.from(document.querySelectorAll("table"));
  if (tables.length > 0) {
    showPopup(tables);
  }
})();
