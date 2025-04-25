# browser_extension_table_extract

## Steps to Test the Chrome Browser Extension

1. **Clone the Repository**  
   Clone this repository to your local machine:
   ```bash
   git clone https://github.com/your-repo/browser_extension_table_extract.git
   cd browser_extension_table_extract
   ```

2. **Open Chrome Extensions Page**  
   Open the Chrome browser and navigate to `chrome://extensions/`.

3. **Enable Developer Mode**  
   In the top-right corner of the extensions page, enable "Developer mode."

4. **Load the Extension**  
   - Click on "Load unpacked."
   - Select the folder where this repository is located.

5. **Test the Extension**  
   - Open any webpage with tables.
   - Click on the extension icon in the Chrome toolbar.
   - In the popup, click the "Fetch" button to extract table data from the page.

6. **Check the Console**  
   - Open the browser's developer tools (`Ctrl+Shift+I` or `Cmd+Option+I` on macOS).
   - Check the console for logs of the extracted table data.

## Prerequisites
- Google Chrome browser
- Basic knowledge of Chrome extensions
- A local server (optional, for API testing)
