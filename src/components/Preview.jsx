import React, { useEffect, useRef, useState, useMemo } from "react";
import { FORMAT_DIMS } from "../catalog.js";

export const Preview = ({ template, format, variant, data, onReset, previewRef }) => {
  const dims = FORMAT_DIMS[format];
  const stageRef = useRef(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const compute = () => {
      const el = stageRef.current;
      if (!el) return;
      const padding = 64;
      const availW = el.clientWidth - padding;
      const availH = el.clientHeight - padding;
      const s = Math.min(availW / dims.w, availH / dims.h, 1);
      setScale(s > 0 ? s : 0.5);
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (stageRef.current) ro.observe(stageRef.current);
    window.addEventListener("resize", compute);
    return () => { ro.disconnect(); window.removeEventListener("resize", compute); };
  }, [dims.w, dims.h]);

  const Component = template.Component;
  const componentProps = useMemo(() => {
    const props = { format, data };
    if (template.variants.length > 1) props.variant = variant;
    return props;
  }, [format, variant, data, template]);

  return (
    <main className="stage">
      <div className="stage-toolbar">
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-700)" }}>
            {template.label} · {dims.label}
          </span>
          <span style={{ fontSize: 12, color: "var(--gray-500)" }}>
            Vorschau {Math.round(scale * 100)} % · {dims.w}×{dims.h} px
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" onClick={onReset}>Reset</button>
        </div>
      </div>
      <div className="stage-canvas" ref={stageRef}>
        <div className="preview-frame" style={{ width: dims.w * scale, height: dims.h * scale }}>
          <div className="preview-scaler" style={{ transform: `scale(${scale})`, width: dims.w, height: dims.h }}>
            <div ref={previewRef}>
              <Component {...componentProps} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export const HiddenRenderer = React.forwardRef(({ template, variant, data, formats }, ref) => {
  const Component = template.Component;
  return (
    <div ref={ref} style={{ position: "absolute", left: -99999, top: 0, pointerEvents: "none" }}>
      {formats.map(f => {
        const dims = FORMAT_DIMS[f];
        const props = { format: f, data };
        if (template.variants.length > 1) props.variant = variant;
        return (
          <div key={f} data-format={f} style={{ width: dims.w, height: dims.h }}>
            <Component {...props} />
          </div>
        );
      })}
    </div>
  );
});
