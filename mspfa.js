(() => {
  const WS = createWS();
  const uid = WS.settings.user_id || "1";
  const root = document.createElement("div");
  root.style.cssText = `
    font:12px/1.4 ${WS.settings.font || "sans-serif"};
    max-width:280px;border:1px solid #444;padding:10px;
    background:${WS.settings.bg_color || "#1a1a1a"};
    color:${WS.settings.text_color || "#eeeeee"}
  `;
  root.textContent = "Loading…";
  WS.element.appendChild(root);

  const linkColor = WS.settings.link_color || "#77ccff";

  async function get(doType, id) {
    const r = await WS.fetch("https://mspfa.com/", {
      method: "POST",
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      body: `do=${doType}&${doType === "user" ? "u" : "s"}=${id}`
    });
    return r.json();
  }

  get("user", uid).then(async u => {
    if (!u || u === 0) { root.textContent = "User not found / API blocked"; return; }

    // Profile picture
    const pfp = u.o || `https://mspfa.com/images/avatars/${u.i}.png`;
    let html = `<a href="https://mspfa.com/?u=${u.i}" target="_blank" style="color:${linkColor};text-decoration:none;display:flex;align-items:center;gap:8px">
      <img src="${pfp}" width="48" height="48" style="border-radius:4px;object-fit:cover" onerror="this.src='https://mspfa.com/images/ico.png'">
      <b>${u.n || "User "+uid}</b>
    </a>`;

    // Badges with images
    const badges = u.b || u.badges || [];
    if (badges.length) {
      html += `<div style="margin:8px 0;display:flex;flex-wrap:wrap;gap:4px">`;
      badges.forEach(b => {
        const img = b.o || b.i || b.img || "";
        const name = b.n || b.name || b;
        html += `<span title="${name}" style="display:inline-flex;align-items:center;gap:2px;background:#333;padding:2px 4px;border-radius:3px;font-size:10px">
          ${img ? `<img src="${img}" width="16" height="16" onerror="this.remove()">` : ""}${name}
        </span>`;
      });
      html += `</div>`;
    }

    // Stories with cover images
    const stories = (u.s || u.stories || []).slice(0, 5);
    if (stories.length) {
      html += `<div style="margin-top:8px;border-top:1px solid #333;padding-top:6px"><b>Top stories</b>`;
      for (const s of stories) {
        const sid = s.i || s;
        let cover = s.o || "";
        if (!cover) {
          try {
            const st = await get("story", sid);
            cover = st?.o || "";
          } catch {}
        }
        html += `<a href="https://mspfa.com/?s=${sid}" target="_blank" style="color:${linkColor};text-decoration:none;display:flex;align-items:center;gap:6px;margin:4px 0">
          ${cover ? `<img src="${cover}" width="32" height="32" style="border-radius:3px;object-fit:cover" onerror="this.remove()">` : ""}
          <span>${s.n || "Story "+sid}</span>
        </a>`;
      }
      html += `</div>`;
    } else {
      html += `<div style="margin-top:6px;opacity:.7">No public stories</div>`;
    }

    root.innerHTML = html;
  }).catch(() => root.textContent = "Fetch failed");
})();
