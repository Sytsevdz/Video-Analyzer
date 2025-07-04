import React from "react";
import ReactDOM from "react-dom/client";
import { supabase } from "./supabaseClient";

const App = () => {
  const [videoId, setVideoId] = React.useState("");
  const [player, setPlayer] = React.useState(null);
  const [moments, setMoments] = React.useState([]);
  const [matchName, setMatchName] = React.useState("");
  const [savedMatches, setSavedMatches] = React.useState([]);
  const [shouldLoadVideo, setShouldLoadVideo] = React.useState(false);

  const labels = [
    "Doelpunt NL",
    "Tegendoelpunt",
    "Schot NL",
    "Schot tegen",
    "Balwinst",
    "Balverlies",
    "Start aanval NL",
    "Start tegenaanval",
    "Verdedigingsmoment NL",
    "Verdedigingsmoment tegen"
  ];

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (!player) return;
      const active = document.activeElement;
      if (active && ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName)) return;

      const key = e.key.toLowerCase();
      const map = {
        '1': 'Doelpunt NL',
        '2': 'Tegendoelpunt',
        '6': 'Balverlies',
        '5': 'Balwinst',
        '3': 'Schot NL',
        '4': 'Schot tegen',
        'a': 'Start aanval NL',
        's': 'Start tegenaanval',
        'd': 'Verdedigingsmoment NL',
        'f': 'Verdedigingsmoment tegen',
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

  React.useEffect(() => {
    if (shouldLoadVideo && videoId) {
      handleVideoLoad();
      setShouldLoadVideo(false);
    }
  }, [shouldLoadVideo, videoId]);

  const handlePlayerReady = (event) => setPlayer(event.target);

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

  const jumpTo = (time) => player && player.seekTo(time, true);

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

  const deleteMoment = (index) => setMoments(moments.filter((_, i) => i !== index));

  const saveMatch = async () => {
    if (!matchName || !videoId) return;

    const { error } = await supabase.from("matches").upsert({
      name: matchName,
      moments,
      video_id: videoId
    });

    if (error) {
      console.error("Fout bij opslaan:", error.message);
    } else {
      console.log("Wedstrijd opgeslagen.");
      if (!savedMatches.includes(matchName)) {
        setSavedMatches([...savedMatches, matchName]);
      }
    }
  };

  const handleLoadMatch = async (name) => {
    const { data, error } = await supabase.from("matches").select().eq("name", name).single();

    if (error) {
      console.error("Fout bij ophalen:", error.message);
      return;
    }

    setMoments(data.moments || []);
    setMatchName(data.name);
    setVideoId(data.video_id || "");
    setShouldLoadVideo(true);
  };

  const deleteMatch = async (name) => {
    const { error } = await supabase.from("matches").delete().eq("name", name);
    if (error) {
      console.error("Fout bij verwijderen:", error.message);
    } else {
      loadMatches();
    }
  };

  const download = () => {
    const blob = new Blob([JSON.stringify(moments, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = matchName || "momenten.json";
    a.click();
  };

  const buttonStyle = (color = "#f3f3f3", large = false) => ({
    margin: "5px",
    padding: large ? "12px 18px" : "8px 12px",
    borderRadius: "8px",
    border: "1px solid #aaa",
    background: color,
    cursor: "pointer",
    minWidth: large ? "180px" : undefined
  });

  const renderFloatingButtons = () => (
    <>
      <button onClick={() => markMoment("")} style={buttonStyle("#ddd", true)}>➕ Markeer moment</button>
      <button onClick={() => markMoment("", true)} style={buttonStyle("#ddd", true)}>⏸️ Markeer + pauze</button>
      <button onClick={() => markMoment("Doelpunt NL")} style={buttonStyle("#d4edda")}>Doelpunt NL</button>
      <button onClick={() => markMoment("Tegendoelpunt")} style={buttonStyle("#f8d7da")}>Tegendoelpunt</button>
      <button onClick={() => markMoment("Schot NL")} style={buttonStyle("#d4edda")}>Schot NL</button>
      <button onClick={() => markMoment("Schot tegen")} style={buttonStyle("#f8d7da")}>Schot tegen</button>
      <button onClick={() => markMoment("Balwinst")} style={buttonStyle("#d4edda")}>Balwinst</button>
      <button onClick={() => markMoment("Balverlies")} style={buttonStyle("#f8d7da")}>Balverlies</button>
      <button onClick={() => markMoment("Start aanval NL")} style={buttonStyle("#d4edda")}>Start aanval NL</button>
      <button onClick={() => markMoment("Start tegenaanval")} style={buttonStyle("#f8d7da")}>Start tegenaanval</button>
      <button onClick={() => markMoment("Verdedigingsmoment NL")} style={buttonStyle("#d4edda")}>Verdedigingsmoment NL</button>
      <button onClick={() => markMoment("Verdedigingsmoment tegen")} style={buttonStyle("#f8d7da")}>Verdedigingsmoment tegen</button>
    </>
  );
  
const renderLegend = () => (
  <div style={{
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "10px",
    background: "#f9f9f9",
    fontSize: "14px",
    lineHeight: "1.6"
  }}>
    <h4 style={{ marginTop: 0 }}>🎮 Sneltoetsen</h4>
    <ul style={{ paddingLeft: "20px" }}>
      <li><strong>1</strong>: Doelpunt NL</li>
      <li><strong>2</strong>: Tegendoelpunt</li>
      <li><strong>3</strong>: Schot NL</li>
      <li><strong>4</strong>: Schot tegen</li>
      <li><strong>5</strong>: Balwinst</li>
      <li><strong>6</strong>: Balverlies</li>
      <li><strong>A</strong>: Start aanval NL</li>
      <li><strong>S</strong>: Start tegenaanval</li>
      <li><strong>D</strong>: Verdedigingsmoment NL</li>
      <li><strong>F</strong>: Verdedigingsmoment tegen</li>
      <li><strong>W</strong>: Markeer moment</li>
      <li><strong>E</strong>: Markeer + pauze</li>
      <li><strong>Spatie</strong>: Start video als deze gepauzeeerd is</li>
    </ul>
  </div>
);

  return (
    <div style={{ fontFamily: "sans-serif", padding: 20 }}>
      <h1>Video Analyse NL</h1>
      <input type="text" placeholder="YouTube link plakken..." value={videoId} onChange={(e) => setVideoId(e.target.value)} style={{ width: "100%", marginBottom: 10 }} />
      <button onClick={handleVideoLoad} style={buttonStyle("#007bff", true)}>🎬 Laad video</button>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", marginTop: 20 }}>
        <div style={{ flex: 3 }}>
          <div style={{ position: "relative", paddingTop: "56.25%" }}>
            <div id="player-container" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}></div>
            <div style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              right: "10px",
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              zIndex: 2,
              justifyContent: "center",
              pointerEvents: "auto"
            }}>
              {renderFloatingButtons()}
            </div>
          </div>

          <h3>Gemarkeerde momenten:</h3>
          <ul>
            {moments.map((m, i) => (
              <li key={i}>
                <button onClick={() => jumpTo(m.time)} style={{ marginRight: 5, ...buttonStyle() }}>{formatTime(m.time)}</button>
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

          <button onClick={download} style={buttonStyle()}>📥 Download JSON</button>
        </div>

        <div style={{ flex: 1 }}>
          <input type="text" placeholder="Wedstrijdnaam..." value={matchName} onChange={(e) => setMatchName(e.target.value)} style={{ width: "100%" }} />
          <button onClick={saveMatch} disabled={!matchName} style={buttonStyle()}>💾 Opslaan</button>
          <button onClick={() => {
            supabase.from("matches").select("name").then(({ data }) => {
              setSavedMatches(data.map((m) => m.name));
            });
          }} style={buttonStyle()}>📂 Bekijk opgeslagen</button>
          {savedMatches.length > 0 && (
            <ul>
              {savedMatches.map((m, i) => (
                <li key={i}>
                  <strong>{m}</strong>
                  <button onClick={() => handleLoadMatch(m)} style={{ marginLeft: 10 }}>Laden</button>
                  <button onClick={() => deleteMatch(m)} style={{ marginLeft: 5, color: "red" }}>🗑️</button>
                </li>
              ))}
            </ul>
          )}
          <div style={{ marginTop: "20px" }}>
            {renderLegend()}
          </div>
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
