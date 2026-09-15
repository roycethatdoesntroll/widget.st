(() => {
  const WS = createWS();
  const s = WS.settings || {};

  // Settings:
  // size (number): pixel size of the map (default 220)
  // accent (color)
  // show_labels (checkbox)
  // player_lands (fulltext): optional JSON array of land names to show as extra dots

  const size = Math.max(160, Math.min(400, s.size || 220));
  const accent = s.accent || "rgb(0, 200, 255)";
  const showLabels = s.show_labels !== false;

  let lands = ["Land of Wind and Shade", "Land of Light and Rain", "Land of Heat and Clockwork", "Land of Frost and Frogs"];
  try {
    if (s.player_lands) lands = typeof s.player_lands === "string" ? JSON.parse(s.player_lands) : s.player_lands;
  } catch (e) {}

  const root = document.createElement("div");
  root.style.cssText = `
    font-family: "Courier New", Courier, monospace;
    background: #0a0a12;
    border: 3px solid ${accent};
    padding: 8px;
    width: ${size + 16}px;
    box-sizing: border-box;
    color: #cce;
    position: relative;
  `;

  const title = document.createElement("div");
  title.textContent = "INCIPISPHERE";
  title.style.cssText = `text-align:center; font-size:12px; color:${accent}; margin-bottom:4px; letter-spacing:1px;`;
  root.appendChild(title);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  canvas.style.cssText = "display:block; margin:0 auto; image-rendering:pixelated;";
  root.appendChild(canvas);

  const tip = document.createElement("div");
  tip.style.cssText = `
    position:absolute; bottom:6px; left:0; right:0; text-align:center;
    font-size:10px; opacity:0.85; pointer-events:none;
  `;
  tip.textContent = "hover bodies";
  root.appendChild(tip);

  const ctx = canvas.getContext("2d");
  const cx = size / 2, cy = size / 2;
  const rSkaia = size * 0.18;
  const rProspit = size * 0.32;
  const rMedium = size * 0.48;
  const rDerse = size * 0.62;

  // simple bodies
  const bodies = [
    { name: "Skaia", x: cx, y: cy, r: rSkaia, color: "#aaddff", desc: "Crucible of potential" },
    { name: "Prospit", x: cx + rProspit, y: cy, r: 8, color: "#ffeebb", desc: "The golden moon" },
    { name: "Derse", x: cx - rDerse, y: cy, r: 9, color: "#aa66cc", desc: "The purple moon" }
  ];

  // player lands on the medium ring
  lands.forEach((name, i) => {
    const ang = (i / lands.length) * Math.PI * 2 - Math.PI / 2;
    bodies.push({
      name: name,
      x: cx + Math.cos(ang) * rMedium,
      y: cy + Math.sin(ang) * rMedium,
      r: 6,
      color: "#88ff88",
      desc: "Player Land"
    });
  });

  function draw() {
    ctx.fillStyle = "#0a0a12";
    ctx.fillRect(0, 0, size, size);

    // orbits
    ctx.strokeStyle = "rgba(100,140,180,0.25)";
    ctx.lineWidth = 1;
    [rProspit, rMedium, rDerse].forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // bodies
    bodies.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.stroke();
    });

    // labels
    if (showLabels) {
      ctx.fillStyle = "#cce";
      ctx.font = "9px Courier New";
      ctx.textAlign = "center";
      bodies.forEach(b => {
        if (b.r > 7) ctx.fillText(b.name, b.x, b.y + b.r + 10);
      });
    }
  }

  draw();

  canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (size / rect.width);
    const my = (e.clientY - rect.top) * (size / rect.height);
    let found = null;
    for (const b of bodies) {
      const dx = mx - b.x, dy = my - b.y;
      if (dx * dx + dy * dy < (b.r + 6) * (b.r + 6)) {
        found = b;
        break;
      }
    }
    tip.textContent = found ? `${found.name} — ${found.desc}` : "hover bodies";
  };
  canvas.onmouseleave = () => { tip.textContent = "hover bodies"; };

  WS.element.appendChild(root);
})();
