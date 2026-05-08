import React from "react";

export const TopBar = ({ onDownload, onDownloadAll, downloadStatus }) => (
  <header className="topbar">
    <div className="topbar-left">
      <img src="/wappen.png" alt="TC BW Attendorn" />
      <div>
        <div className="topbar-title">Social Media Generator</div>
        <div className="topbar-sub">TC Blau-Weiss Attendorn</div>
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {downloadStatus === "working" && <span className="badge-pending">Erzeuge PNG …</span>}
      {downloadStatus === "done" && <span className="badge-pending badge-ok">Heruntergeladen ✓</span>}
      <button className="btn btn-ghost" onClick={onDownloadAll} disabled={downloadStatus === "working"}>
        ZIP (alle Formate)
      </button>
      <button className="btn btn-primary" onClick={onDownload} disabled={downloadStatus === "working"}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>↓</span>
        PNG herunterladen
      </button>
    </div>
  </header>
);
