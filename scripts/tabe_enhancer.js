// ==UserScript==
// @name         Auto Table Enhancer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Auto-detects tables and prompts to enhance them with styling and sorting.
// @author       You
// @match        *://*/*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    // Utility function to enhance tables
    function enhanceTable(table) {
        // Add basic zebra striping and hover effect
        table.querySelectorAll("tr:nth-child(even)").forEach(row => {
            row.style.backgroundColor = "#f9f9f9";
        });
        table.querySelectorAll("tr").forEach(row => {
            row.addEventListener("mouseenter", () => row.style.backgroundColor = "#e0f7fa");
            row.addEventListener("mouseleave", () => {
                row.style.backgroundColor = row.rowIndex % 2 === 0 ? "#f9f9f9" : "white";
            });
        });

        // Make header clickable to sort columns
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

    // Inject popup
    function showPopup(tables) {
        const popup = document.createElement("div");
        popup.id = "tableEnhancePopup";
        popup.innerHTML = `
            <strong>Table detected! Enhance it?</strong><br/>
            <button id="enhanceBtn">Enhance ✅</button>
            <button id="ignoreBtn">Ignore ❌</button>
        `;
        document.body.appendChild(popup);

        GM_addStyle(`
            #tableEnhancePopup {
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
            }
            #tableEnhancePopup button {
                margin: 5px 3px 0 0;
                padding: 5px 10px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            #enhanceBtn { background: #4CAF50; color: white; }
            #ignoreBtn { background: #f44336; color: white; }
        `);

        document.getElementById("enhanceBtn").addEventListener("click", () => {
            tables.forEach(enhanceTable);
            popup.remove();
        });

        document.getElementById("ignoreBtn").addEventListener("click", () => {
            popup.remove();
        });
    }

    // Wait for DOM to load and check for tables
    window.addEventListener("load", () => {
        const tables = Array.from(document.querySelectorAll("table"));
        if (tables.length > 0) {
            showPopup(tables);
        }
    });
})();
