import React, { useState, useRef } from "react";
import { TopBar } from "./components/TopBar.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { Preview, HiddenRenderer } from "./components/Preview.jsx";
import { TEMPLATES, FORMAT_DIMS } from "./catalog.js";
import { MatchResultForm } from "./components/forms/MatchResultForm.jsx";
import { MatchAnnouncementForm } from "./components/forms/MatchAnnouncementForm.jsx";
import { SeasonScheduleForm } from "./components/forms/SeasonScheduleForm.jsx";
import { EventCardForm } from "./components/forms/EventCardForm.jsx";
import { downloadPng, downloadAllFormats } from "./lib/download-png.js";

const FORM_BY_TEMPLATE = {
  "match-result":       MatchResultForm,
  "match-announcement": MatchAnnouncementForm,
  "season-schedule":    SeasonScheduleForm,
  "event-card":         EventCardForm,
};

export default function App() {
  const [templateId, setTemplateId] = useState("match-result");
  const [format, setFormat] = useState("square");
  const [variant, setVariant] = useState("win");
  const [data, setData] = useState(TEMPLATES["match-result"].defaults);
  const [downloadStatus, setDownloadStatus] = useState("idle");
  const previewRef = useRef(null);
  const hiddenRef = useRef(null);

  const tpl = TEMPLATES[templateId];
  const Form = FORM_BY_TEMPLATE[templateId];
  const set = (patch) => setData(d => ({ ...d, ...patch }));

  const switchTemplate = (id) => {
    const t = TEMPLATES[id];
    setTemplateId(id);
    setFormat(t.formats[0]);
    setVariant(t.variants[0].id);
    setData(t.defaults);
  };

  const formatLabels = Object.fromEntries(
    Object.entries(FORMAT_DIMS).map(([k, v]) => [k, v.label])
  );

  const onDownload = async () => {
    if (!previewRef.current) return;
    setDownloadStatus("working");
    try {
      await downloadPng(previewRef.current, { templateId, variant, format });
      setDownloadStatus("done");
      setTimeout(() => setDownloadStatus("idle"), 1800);
    } catch (e) {
      console.error(e);
      alert("Download fehlgeschlagen — Konsole ansehen");
      setDownloadStatus("idle");
    }
  };

  const onDownloadAll = async () => {
    if (!hiddenRef.current) return;
    setDownloadStatus("working");
    try {
      await downloadAllFormats(hiddenRef.current, { templateId, variant });
      setDownloadStatus("done");
      setTimeout(() => setDownloadStatus("idle"), 1800);
    } catch (e) {
      console.error(e);
      alert("ZIP-Download fehlgeschlagen — Konsole ansehen");
      setDownloadStatus("idle");
    }
  };

  return (
    <div className="app">
      <TopBar onDownload={onDownload} onDownloadAll={onDownloadAll} downloadStatus={downloadStatus} />
      <div className="body">
        <Sidebar
          templates={TEMPLATES}
          templateId={templateId}
          onSelectTemplate={switchTemplate}
          format={format}
          formats={tpl.formats}
          onSelectFormat={setFormat}
          variant={variant}
          variants={tpl.variants}
          onSelectVariant={setVariant}
          formatLabels={formatLabels}
        >
          <Form data={data} set={set} variant={variant} />
        </Sidebar>
        <Preview
          template={tpl}
          format={format}
          variant={variant}
          data={data}
          onReset={() => setData(tpl.defaults)}
          previewRef={previewRef}
        />
      </div>
      <HiddenRenderer ref={hiddenRef} template={tpl} variant={variant} data={data} formats={tpl.formats} />
    </div>
  );
}
