(() => {
  const WS = createWS();
  const s = WS.settings || {};

  // Settings:
  // items (image_set): list of {file, url, name} — each becomes a captchalogue card
  // modus (select): "stack" | "array" | "queue"  (visual only for now)
  // accent (color): card border / highlight
  // max_visible (number): how many cards to show at once (default 8)

  const accent = s.accent || "rgb(255, 0, 255)"; // classic stack magenta-ish
  const maxVis = s.max_visible || 8;
  const modus = s.modus || "stack";

  let items = [];
  if (s.items && Array.isArray(s.items)) {
    items = s.items.map((it, i) => ({
      name: it.name || `Item ${i + 1}`,
      url: it.url || "",
      code: (it.name || "ITEM").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8).padEnd(8, "0")
    }));
  }
  // fallback demo items
  if (!items.length) {
    items = [
      { name: "Hammer", url: "", code: "HAMMER01" },
      { name: "Cake", url: "", code: "CAKE0000" },
      { name: "Sburb Disc", url: "", code: "SBURBDSK" },
      { name: "Pogostick", url: "", code: "POGO0000" },
      { name: "Captchalogue Card", url: "", code: "11111111" }
    ];
  }

  const root = document.createElement("div");
  root.style.cssText = `
    font-family: "Courier New", Courier, monospace;
    background: #111;
    color: #eee;
    border: 3px solid ${accent};
    padding: 10px;
    max-width: 360px;
    box-sizing: border-box;
  `;

  const header = document.createElement("div");
  header.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:13px;";
  header.innerHTML = `<span style="color:${accent}; font-weight:bold;">SYLLADEX</span>
                      <span style="font-size:11px; opacity:0.7;">${modus.toUpperCase()} MODUS</span>`;
  root.appendChild(header);

  const deck = document.createElement("div");
  deck.style.cssText = `
    display: flex; flex-wrap: wrap; gap: 6px; justify-content: center;
    min-height: 90px;
  `;
  root.appendChild(deck);

  const status = document.createElement("div");
  status.style.cssText = "font-size:11px; text-align:center; margin-top:8px; opacity:0.8;";
  root.appendChild(status);

  let selected = -1;

  function render() {
    deck.innerHTML = "";
    const visible = items.slice(0, maxVis);
    visible.forEach((item, idx) => {
      const card = document.createElement("div");
      card.style.cssText = `
        width: 70px; height: 90px;
        background: #222;
        border: 2px solid ${selected === idx ? accent : "#555"};
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        cursor: pointer; position: relative; overflow: hidden;
        font-size: 10px; text-align: center; padding: 2px;
        transition: border-color 0.15s, transform 0.15s;
      `;
      if (item.url) {
        const img = document.createElement("img");
        img.src = item.url;
        img.style.cssText = "max-width:56px; max-height:50px; object-fit:contain; image-rendering:pixelated;";
        card.appendChild(img);
      } else {
        const placeholder = document.createElement("div");
        placeholder.textContent = "▣";
        placeholder.style.cssText = "font-size:28px; opacity:0.4;";
        card.appendChild(placeholder);
      }
      const name = document.createElement("div");
      name.textContent = item.name.slice(0, 10);
      name.style.cssText = "margin-top:2px; line-height:1.1; word-break:break-all;";
      card.appendChild(name);

      // tiny code on bottom
      const code = document.createElement("div");
      code.textContent = item.code;
      code.style.cssText = "position:absolute; bottom:1px; font-size:7px; opacity:0.5; letter-spacing:-0.5px;";
      card.appendChild(code);

      card.onclick = () => {
        selected = selected === idx ? -1 : idx;
        status.textContent = selected >= 0
          ? `Fetched: ${items[selected].name}  [${items[selected].code}]`
          : `${items.length} captchalogued`;
        render();
      };
      card.onmouseover = () => { if (selected !== idx) card.style.borderColor = accent; };
      card.onmouseout = () => { if (selected !== idx) card.style.borderColor = "#555"; };

      deck.appendChild(card);
    });

    if (items.length > maxVis) {
      const more = document.createElement("div");
      more.textContent = `+${items.length - maxVis}`;
      more.style.cssText = "width:70px; height:90px; display:flex; align-items:center; justify-content:center; border:2px dashed #444; color:#888; font-size:14px;";
      deck.appendChild(more);
    }

    if (selected < 0) status.textContent = `${items.length} captchalogued`;
  }

  render();
  WS.element.appendChild(root);
})();
