function injectEnhancePrompt() {
  if (document.getElementById("enhancePrompt")) return;

  const prompt = document.createElement("div");
  prompt.id = "enhancePrompt";
  prompt.style = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999999;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px 16px;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  font-family: 'Segoe UI', sans-serif;
  font-size: 15px;
  display: flex;
  flex-direction: column; /* 👈 important for vertical layout */
  width: 220px;           /* 👈 decrease width */
  height: auto;           /* 👈 allow height to grow */
  gap: 10px;
  border: 1px solid #ccc;
`;

 prompt.innerHTML = `
  <span style="font-weight: 350; margin-bottom: 6px;">📊 Table detected! Enhance it?</span>
  <div style="display: flex; gap: 10px;">
    <button id="enhanceBtn" style="background-color: #28a745; color: white; border: none; padding: 5px 5px; border-radius: 3px; cursor: pointer;">✅ Enhance</button>
    <button id="ignoreBtn" style="background-color: #dc3545; color: white; border: none; padding: 5px 5px; border-radius: 3px; cursor: pointer;">❌ Ignore</button>
  </div>
`;


  document.body.appendChild(prompt);

  document.getElementById("enhanceBtn").onclick = () => {
    prompt.remove();
    injectEnhancerUI();
  };

  document.getElementById("ignoreBtn").onclick = () => prompt.remove();
}

function injectEnhancerUI() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("scripts/table_enhancer.js");
  script.type = "module";
  document.body.appendChild(script);
}

(function () {
  const tables = document.querySelectorAll("table");
  if (tables.length > 0) {
    injectEnhancePrompt();
  }
})();
