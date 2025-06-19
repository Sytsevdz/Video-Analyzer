
import React from "react";
import ReactDOM from "react-dom/client";

const App = () => {
  const [videoId, setVideoId] = React.useState("");
  const [player, setPlayer] = React.useState(null);
  const [moments, setMoments] = React.useState([]);
  const [matchName, setMatchName] = React.useState("");
  const [savedMatches, setSavedMatches] = React.useState([]);

  const labels = ["Doelpunt voor", "Doelpunt tegen", "Balverlies", "Balwinst", "Schot op doel NL", "Aanval NL", "Aanval Tegenstander", "Verdediging NL", "Verdediging Tegenstander", "Overtreding"];

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (!player) return;
      const active = document.activeElement;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.tagName === "SELECT")) return;

      const key = e.key.toLowerCase();
      const map = {
        '1': 'Doelpunt voor',
        '2': 'Doelpunt tegen',
        '3': 'Balverlies',
        '4': 'Balwinst',
        '5': 'Schot op doel NL',
        'a': 'Aanval NL',
        's': 'Aanval Tegenstander',
        'd': 'Verdediging NL',
        'f': 'Verdediging Tegenstander',
      };

      if (key === 'w') {
        markMoment("");
      } else if (key === 'e') {
        markMoment("", true);
      } else if (key === ' ') {
        if (player.getPlayerState() === 2) player.playVideo();
      } else if (map[key]) {
        markMoment(map[key]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [player]);

  const handlePlayerReady = (event) => {
    setPlayer(event.target);
  };

  const handleVideoLoad = () => {
    const id = getYouTubeVideoId(videoId);
    if (!id) return;
    document.getElementById("player-container").innerHTML = "";
    new YT.Player("player-container", {
      width: "100%",
      height: "100%",
      videoId: id,
      playerVars: { modestbranding: 1, rel: 0 },
      events: { onReady: handlePlayerReady },
    });
  };

  const getYouTubeVideoId = (url) => {
    const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
    return match ? match[1] : null;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const markMoment = (label = "", pause = false) => {
    if (!player) return;
    const currentTime = Math.max(0, player.getCurrentTime() - 5);
    if (pause) player.pauseVideo();
    const newMoment = { time: currentTime, label, note: "" };
    setMoments((prev) => [...prev, newMoment]);
  };

  const jumpTo = (time) => {
    if (player) player.seekTo(time, true);
  };

  const updateLabel = (index, newLabel) => {
    const updated = [...moments];
    updated[index].label = newLabel;
    setMoments(updated);
  };

  const updateNote = (index, note) => {
    const updated = [...moments];
    updated[index].note = note;
    setMoments(updated);
  };

  const adjustTime = (index, offset) => {
    const updated = [...moments];
    updated[index].time = Math.max(0, updated[index].time + offset);
    setMoments(updated);
  };

  const deleteMoment = (index) => {
    const updated = moments.filter((_, i) => i !== index);
    setMoments(updated);
  };

  const saveMatch = () => {
    if (!matchName) return;
    localStorage.setItem("match_" + matchName, JSON.stringify(moments));
    if (!savedMatches.includes(matchName)) {
      setSavedMatches([...savedMatches, matchName]);
    }
  };

  const loadMatches = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("match_")).map(k => k.replace("match_", ""));
    setSavedMatches(keys);
  };

  const loadMatch = (name) => {
    const data = localStorage.getItem("match_" + name);
    if (data) {
      setMoments(JSON.parse(data));
      setMatchName(name);
    }
  };

  const deleteMatch = (name) => {
    localStorage.removeItem("match_" + name);
    setSavedMatches(savedMatches.filter(m => m !== name));
  };

  const download = () => {
    const blob = new Blob([JSON.stringify(moments, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = matchName || "momenten.json";
    a.click();
  };

  const buttonStyle = {
    margin: "5px",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #aaa",
    background: "#f3f3f3",
    cursor: "pointer"
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: 20 }}>
      <h1>Video Analyse NL</h1>
      <input type="text" placeholder="YouTube link plakken..." value={videoId} onChange={(e) => setVideoId(e.target.value)} style={{ width: "100%", marginBottom: 10 }} />
      <button onClick={handleVideoLoad} style={{ ...buttonStyle, background: "#007bff", color: "#fff" }}>🎬 Laad video</button>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", marginTop: 20 }}>
        <div style={{ flex: 3 }}>
          <div style={{ position: "relative", paddingTop: "56.25%" }}>
            <div style={{
  position: "absolute",
  top: 10,
  left: 10,
  right: 10,
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  zIndex: 10
}}>
  <button onClick={() => markMoment("")} style={buttonStyle}>Markeer moment</button>
  <button onClick={() => markMoment("", true)} style={buttonStyle}>Markeer + pauzeer</button>
  <button onClick={() => markMoment("Doelpunt voor")} style={buttonStyle}>Doelpunt voor</button>
  <button onClick={() => markMoment("Doelpunt tegen")} style={buttonStyle}>Doelpunt tegen</button>
  <button onClick={() => markMoment("Balverlies")} style={buttonStyle}>Balverlies</button>
  <button onClick={() => markMoment("Balwinst")} style={buttonStyle}>Balwinst</button>
  <button onClick={() => markMoment("Schot op doel NL")} style={buttonStyle}>Schot op doel NL</button>
  <button onClick={() => markMoment("Aanval NL")} style={buttonStyle}>Aanval NL</button>
  <button onClick={() => markMoment("Aanval Tegenstander")} style={buttonStyle}>Aanval Tegenstander</button>
  <button onClick={() => markMoment("Verdediging NL")} style={buttonStyle}>Verdediging NL</button>
  <button onClick={() => markMoment("Verdediging Tegenstander")} style={buttonStyle}>Verdediging Tegenstander</button>
</div>
            <div id="player-container" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}></div>
          </div>

          <h3>Gemarkeerde momenten:</h3>
          <ul>
            {moments.map((m, i) => (
              <li key={i}>
                <button onClick={() => jumpTo(m.time)} style={{ marginRight: 5, ...buttonStyle }}>{formatTime(m.time)}</button>
                <select value={m.label} onChange={(e) => updateLabel(i, e.target.value)}>
                  <option value="">-- Kies label --</option>
                  {labels.map((l, j) => <option key={j} value={l}>{l}</option>)}
                </select>
                <input type="text" placeholder="Notitie..." value={m.note} onChange={(e) => updateNote(i, e.target.value)} style={{ marginLeft: 5 }} />
                <button onClick={() => adjustTime(i, -1)}>-1s</button>
                <button onClick={() => adjustTime(i, 1)}>+1s</button>
                <button onClick={() => deleteMoment(i)} style={{ color: "red" }}>🗑️</button>
              </li>
            ))}
          </ul>

          <button onClick={download} style={buttonStyle}>📥 Download JSON</button>
        </div>

        <div style={{ flex: 1 }}>
          <input type="text" placeholder="Wedstrijdnaam..." value={matchName} onChange={(e) => setMatchName(e.target.value)} style={{ width: "100%" }} />
          <button onClick={saveMatch} disabled={!matchName} style={buttonStyle}>💾 Opslaan</button>
          <button onClick={loadMatches} style={buttonStyle}>📂 Bekijk opgeslagen</button>
          {savedMatches.length > 0 && (
            <ul>
              {savedMatches.map((m, i) => (
                <li key={i}>
                  <strong>{m}</strong>
                  <button onClick={() => loadMatch(m)} style={{ marginLeft: 10 }}>Laden</button>
                  <button onClick={() => deleteMatch(m)} style={{ marginLeft: 5, color: "red" }}>🗑️</button>
                </li>
              ))}
            </ul>
          )}
          <div style={{ marginTop: "20px" }}>
            <img src="/sneltoetsen_legenda.png" alt="/Sneltoetsen legenda" style={{ width: "100%", maxWidth: "350px", borderRadius: "8px", border: "1px solid #ccc" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
