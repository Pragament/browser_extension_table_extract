let tableDataArray = [];

function extractAllTables() {
    const tables = document.querySelectorAll('table');
    if (!tables.length) return null;

    let allTablesCSV = [];

    tables.forEach((table) => {
        let csv = [];
        for (let row of table.rows) {
            let cells = Array.from(row.cells).map(cell => `"${cell.innerText}"`);
            csv.push(cells.join(","));
        }
        allTablesCSV.push(csv.join("\n"));
    });

    return allTablesCSV;
}

document.addEventListener('DOMContentLoaded', () => {
    const tableSelector = document.getElementById('tableSelector');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: extractAllTables
        }, (results) => {
            if (results && results[0] && results[0].result && results[0].result.length > 0) {
                tableDataArray = results[0].result;

                if (tableDataArray.length > 1) {
                    tableSelector.style.display = 'block';
                    tableDataArray.forEach((_, index) => {
                        const option = document.createElement('option');
                        option.value = index;
                        option.text = `Table ${index + 1}`;
                        tableSelector.appendChild(option);
                    });
                }
            } else {
                alert("⚠️ No table found on this page.");
            }
        });
    });

    document.getElementById('downloadCsvBtn').addEventListener('click', () => {
        if (tableDataArray.length === 0) {
            alert('⚠️ Table not available yet!');
            return;
        }

        let selectedData = "";

        if (tableDataArray.length === 1) {
            selectedData = tableDataArray[0];
        } else {
            const selectedIndex = tableSelector.value;
            selectedData = tableDataArray[selectedIndex];
        }

        const blob = new Blob([selectedData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'extracted_table.csv';
        a.click();
        URL.revokeObjectURL(url);
    });
});
