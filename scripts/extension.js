let tableData = "";

function extractTable() {
    const table = document.querySelector('table');
    if (!table) return null;
    let csv = [];
    for (let row of table.rows) {
        let cells = Array.from(row.cells).map(cell => `"${cell.innerText}"`);
        csv.push(cells.join(","));
    }
    return csv.join("\n");
}

document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: extractTable
        }, (results) => {
            if (results && results[0] && results[0].result) {
                tableData = results[0].result;
            } else {
                alert("⚠️ No table found on this page.");
            }
        });
    });
});

document.getElementById('downloadCsvBtn').addEventListener('click', () => {
    if (!tableData) {
        alert('⚠️ Table not available yet!');
        return;
    }
    const blob = new Blob([tableData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_table.csv';
    a.click();
    URL.revokeObjectURL(url);
});
