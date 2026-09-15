(() => {
  const WS = createWS();
  const uid = WS.settings.user_id || "1";
  const root = document.createElement("div");
  root.style.cssText = "font:12px/1.4 sans-serif;max-width:280px;border:1px solid #444;padding:10px;background:#1a1a1a;color:#eee";
  root.textContent = "Loading…";
  WS.element.appendChild(root);

  async function get(doType, id) {
    const r = await WS.fetch("https://mspfa.com/", {
      method: "POST",
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      body: `do=${doType}&${doType === "user" ? "u" : "s"}=${id}`
    });
    return r.json();
  }

  get("user", uid).then(u => {
    if (!u || u === 0) { root.textContent = "User not found / API blocked"; return; }

    const icon = u.o || u.i ? `https://mspfa.com/images/avatars/${u.i}.png` : "";
    let html = `<a href="https://mspfa.com/?u=${u.i}" target="_blank" style="color:#7cf;text-decoration:none">
      <img src="${icon}" width="48" height="48" style="float:left;margin:0 8px 4px 0;border-radius:4px" onerror="this.remove()">
      <b>${u.n || "User "+uid}</b></a><br>`;

    // badges (u.b or u.badges if present)
    const badges = u.b || u.badges || [];
    if (badges.length) {
      html += `<div style="clear:both;margin:6px 0">` +
        badges.map(b => `<span title="${b.n||b}" style="background:#333;padding:1px 4px;margin:1px;border-radius:3px;font-size:10px">${b.n||b}</span>`).join("") +
        `</div>`;
    }

    // top stories (owned/edited)
    const stories = (u.s || u.stories || []).slice(0, 5);
    if (stories.length) {
      html += `<div style="clear:both;margin-top:8px;border-top:1px solid #333;padding-top:6px"><b>Top stories</b><ul style="margin:4px 0;padding-left:16px">`;
      stories.forEach(s => {
        html += `<li><a href="https://mspfa.com/?s=${s.i||s}" target="_blank" style="color:#9cf">${s.n||"Story "+s}</a></li>`;
      });
      html += `</ul></div>`;
    } else {
      html += `<div style="clear:both;margin-top:6px;opacity:.7">No public stories</div>`;
    }

    root.innerHTML = html;
  }).catch(() => root.textContent = "Fetch failed");
})();
