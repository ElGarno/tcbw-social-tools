import { toPng } from "html-to-image";
import JSZip from "jszip";
import { FORMAT_DIMS } from "../catalog.js";

export async function downloadPng(node, { templateId, variant, format }) {
  const dims = FORMAT_DIMS[format];
  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 1,
    width: dims.w,
    height: dims.h,
    style: { transform: "none", transformOrigin: "top left" },
  });
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.download = `tcbw_${templateId}_${variant}_${format}_${stamp}.png`;
  a.href = dataUrl;
  a.click();
}

export async function downloadAllFormats(containerNode, { templateId, variant }) {
  const nodes = Array.from(containerNode.querySelectorAll("[data-format]"));
  const zip = new JSZip();
  const stamp = new Date().toISOString().slice(0, 10);

  for (const node of nodes) {
    const f = node.dataset.format;
    const dims = FORMAT_DIMS[f];
    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: 1,
      width: dims.w,
      height: dims.h,
    });
    zip.file(`tcbw_${templateId}_${variant}_${f}_${stamp}.png`, dataUrl.split(",")[1], { base64: true });
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.download = `tcbw_${templateId}_${variant}_${stamp}.zip`;
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
}
