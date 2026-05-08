import React from "react";

export const Sidebar = ({
  templates,
  templateId,
  onSelectTemplate,
  format,
  formats,
  onSelectFormat,
  variant,
  variants,
  onSelectVariant,
  formatLabels,
  children,
}) => {
  const showVariants = variants.length > 1;

  return (
    <aside className="sidebar">
      <div className="tabs" style={{ gridTemplateColumns: `repeat(${Object.keys(templates).length}, 1fr)` }}>
        {Object.entries(templates).map(([id, t]) => (
          <button
            key={id}
            className={`tab ${templateId === id ? "active" : ""}`}
            onClick={() => onSelectTemplate(id)}
            title={t.sublabel}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="form">
        <div className="form-section-title">Format</div>
        <div className="pillgroup">
          {formats.map(f => (
            <button
              key={f}
              className={`pill ${format === f ? "active" : ""}`}
              onClick={() => onSelectFormat(f)}
            >
              {formatLabels[f]}
            </button>
          ))}
        </div>

        {showVariants && (
          <>
            <div className="form-section-title">Variante</div>
            <div className="pillgroup">
              {variants.map(v => (
                <button
                  key={v.id}
                  className={`pill ${v.accent === "orange" ? "accent-orange" : ""} ${variant === v.id ? "active" : ""}`}
                  onClick={() => onSelectVariant(v.id)}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </>
        )}

        {children}
      </div>
    </aside>
  );
};
