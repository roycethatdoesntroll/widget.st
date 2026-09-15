(() => {
  const WS = createWS();
  const s = WS.settings || {};

  // Settings expected:
  // playlist (fulltext or stringset): JSON array of {title, artist?, url} or use uploaded audio files
  // accent_color (color): default #00ff00 (Sburb green)
  // bg_color (color): default #0a0a0a
  // autoplay (checkbox)
  // show_artist (checkbox)

  const accent = s.accent_color || "rgb(0, 255, 0)";
  const bg = s.bg_color || "rgb(10, 10, 10)";
  const showArtist = s.show_artist !== false;

  // Default sample playlist (replace with your own tracks / Bandcamp links or uploaded audio)
  let playlist = [];
  try {
    if (s.playlist) {
      playlist = typeof s.playlist === "string" ? JSON.parse(s.playlist) : s.playlist;
    }
  } catch (e) {}
  if (!playlist.length) {
    playlist = [
      { title: "Sburban Jungle", artist: "Mark J. Hadley", url: "" },
      { title: "Showtime", artist: "Homestuck", url: "" },
      { title: "Harlequin", artist: "Homestuck", url: "" },
      { title: "Aggrieve", artist: "Homestuck", url: "" }
    ];
  }

  // If user uploaded audio files via image_set / audio settings, map them
  // (WidgetStar audio settings give {file, url})

  let current = 0;
  let audio = new Audio();
  let playing = false;

  const root = document.createElement("div");
  root.style.cssText = `
    font-family: "Courier New", Courier, monospace;
    background: ${bg};
    color: ${accent};
    border: 3px solid ${accent};
    padding: 12px;
    max-width: 320px;
    box-sizing: border-box;
    image-rendering: pixelated;
    user-select: none;
  `;

  const titleEl = document.createElement("div");
  titleEl.style.cssText = "font-weight: bold; font-size: 14px; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;";
  root.appendChild(titleEl);

  const artistEl = document.createElement("div");
  artistEl.style.cssText = "font-size: 11px; opacity: 0.8; margin-bottom: 8px;";
  if (showArtist) root.appendChild(artistEl);

  const progress = document.createElement("div");
  progress.style.cssText = `
    height: 6px; background: #333; margin-bottom: 8px; cursor: pointer; position: relative;
  `;
  const bar = document.createElement("div");
  bar.style.cssText = `height: 100%; width: 0%; background: ${accent}; transition: width 0.1s;`;
  progress.appendChild(bar);
  root.appendChild(progress);

  const controls = document.createElement("div");
  controls.style.cssText = "display: flex; gap: 8px; align-items: center; justify-content: center;";

  function btn(label) {
    const b = document.createElement("button");
    b.textContent = label;
    b.style.cssText = `
      background: transparent; border: 2px solid ${accent}; color: ${accent};
      font-family: inherit; font-size: 16px; padding: 4px 10px; cursor: pointer;
    `;
    b.onmouseover = () => { b.style.background = accent; b.style.color = bg; };
    b.onmouseout = () => { b.style.background = "transparent"; b.style.color = accent; };
    return b;
  }

  const prevBtn = btn("◀");
  const playBtn = btn("▶");
  const nextBtn = btn("▶▶");

  controls.append(prevBtn, playBtn, nextBtn);
  root.appendChild(controls);

  const trackInfo = document.createElement("div");
  trackInfo.style.cssText = "font-size: 10px; text-align: center; margin-top: 6px; opacity: 0.7;";
  root.appendChild(trackInfo);

  function loadTrack(i) {
    current = (i + playlist.length) % playlist.length;
    const t = playlist[current];
    titleEl.textContent = t.title || "Unknown Track";
    artistEl.textContent = t.artist || "";
    trackInfo.textContent = `${current + 1} / ${playlist.length}`;
    if (t.url) {
      audio.src = t.url;
      if (playing) audio.play().catch(() => {});
    } else {
      audio.removeAttribute("src");
      titleEl.textContent += " (no audio)";
    }
  }

  playBtn.onclick = () => {
    if (!audio.src) return;
    if (playing) {
      audio.pause();
      playBtn.textContent = "▶";
      playing = false;
    } else {
      audio.play().catch(() => {});
      playBtn.textContent = "❚❚";
      playing = true;
    }
  };
  prevBtn.onclick = () => { loadTrack(current - 1); };
  nextBtn.onclick = () => { loadTrack(current + 1); };

  audio.addEventListener("timeupdate", () => {
    if (audio.duration) bar.style.width = (audio.currentTime / audio.duration * 100) + "%";
  });
  audio.addEventListener("ended", () => loadTrack(current + 1));
  progress.onclick = (e) => {
    if (!audio.duration) return;
    const rect = progress.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  };

  loadTrack(0);
  if (s.autoplay) {
    playing = true;
    playBtn.textContent = "❚❚";
    audio.play().catch(() => {});
  }

  WS.element.appendChild(root);
})();
