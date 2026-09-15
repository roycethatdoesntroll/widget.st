(() => {
  const WS = createWS();
  const s = WS.settings || {};

  // Settings:
  // accent (color): default green
  // show_seconds (checkbox)
  // style (select): "digital" | "command" | "skaia"
  // timezone_label (text): optional label under the time

  const accent = s.accent || "rgb(0, 255, 0)";
  const showSec = s.show_seconds !== false;
  const style = s.style || "digital";
  const tzLabel = s.timezone_label || "LOCAL TIME";

  const root = document.createElement("div");
  root.style.cssText = `
    font-family: "Courier New", Courier, monospace;
    background: #0a0a0a;
    color: ${accent};
    border: 3px solid ${accent};
    padding: 14px 18px;
    text-align: center;
    min-width: 180px;
    box-sizing: border-box;
    image-rendering: pixelated;
    user-select: none;
  `;

  const cmd = document.createElement("div");
  cmd.style.cssText = "font-size:11px; opacity:0.7; margin-bottom:4px;";
  if (style === "command") {
    cmd.textContent = "==>";
  } 
  root.appendChild(cmd);
}
  const timeEl = document.createElement("div");
  timeEl.style.cssText = `
    font-size: 28px; font-weight: bold; letter-spacing: 2px;
    text-shadow: 0 0 8px ${accent}44;
  `;
  root.appendChild(timeEl);

  const dateEl = document.createElement("div");
  dateEl.style.cssText = "font-size:12px; margin-top:4px; opacity:0.85;";
  root.appendChild(dateEl);

  const label = document.createElement("div");
  label.style.cssText = "font-size:10px; margin-top:6px; opacity:0.6;";
  label.textContent = tzLabel;
  root.appendChild(label);

  // optional tiny Skaia ornament for "skaia" style
  if (style === "skaia") {
    const orb = document.createElement("div");
    orb.style.cssText = `
      width: 18px; height: 18px; border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #dff, #8cf 60%, #48a);
      margin: 8px auto 0; box-shadow: 0 0 10px #8cf8;
    `;
    root.appendChild(orb);
  }

  function pad(n) { return n.toString().padStart(2, "0"); }

  function tick() {
    const now = new Date();
    let h = now.getHours();
    const m = pad(now.getMinutes());
    const sec = pad(now.getSeconds());
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;

    if (showSec) {
      timeEl.textContent = `${pad(h)}:${m}:${sec}`;
    } else {
      timeEl.textContent = `${pad(h)}:${m}`;
    }

    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    dateEl.textContent = `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()} ${ampm}`;

    // special 4/13 easter egg
    if (now.getMonth() === 3 && now.getDate() === 13) {
      dateEl.textContent += " ★ 4/13";
      dateEl.style.color = "#ff0";
    } else {
      dateEl.style.color = "";
    }
  }

  tick();
  setInterval(tick, 1000);

  WS.element.appendChild(root);
})();
