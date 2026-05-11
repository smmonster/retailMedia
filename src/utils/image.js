import { BANNER_SPECS, SPEC_LIST } from "../constants/banners";

export function colorDistanceRGB(a, b) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

export function averageColor(ctx, w, h, step = 8) {
  let r = 0;
  let g = 0;
  let b = 0;
  let c = 0;
  for (let y = 0; y < h; y += step) {
    const row = ctx.getImageData(0, y, w, 1).data;
    for (let x = 0; x < row.length; x += 4 * step) {
      r += row[x];
      g += row[x + 1];
      b += row[x + 2];
      c++;
    }
  }
  if (c === 0) return { r: 255, g: 255, b: 255 };
  return { r: Math.round(r / c), g: Math.round(g / c), b: Math.round(b / c) };
}

export function detectBorderIntrusion(ctx, w, h, border = 30, bgSample) {
  const thr = 30;
  const leftData = ctx.getImageData(0, 0, border, h).data;
  const rightData = ctx.getImageData(w - border, 0, border, h).data;

  const check = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      const px = { r: data[i], g: data[i + 1], b: data[i + 2] };
      if (colorDistanceRGB(px, bgSample) > thr) return true;
    }
    return false;
  };

  return { left: check(leftData), right: check(rightData) };
}

export function extOf(name) {
  const n = name?.toLowerCase() || "";
  const i = n.lastIndexOf(".");
  return i >= 0 ? n.slice(i + 1) : "";
}

export function classifyBySize(w, h) {
  const hit = SPEC_LIST.find((sp) => sp.width === w && sp.height === h);
  return hit ? hit.key : "unmatched";
}

export function toHexColor(r, g, b) {
  const comp = (v) => v.toString(16).padStart(2, "0");
  return `#${comp(r)}${comp(g)}${comp(b)}`;
}

export function getGuideSrc(type) {
  const base = process.env.PUBLIC_URL || "";
  if (type === "homeTop") return `${base}/homeTop_guide.png`;
  if (type === "subTop") return `${base}/subTop_guide.png`;
  if (type === "homeSubBottom") return `${base}/homeSubBottom_guide.png`;
  return null;
}

/**
 * 캔버스에 이미지를 그려 사이즈/용량/포맷/여백 검수를 수행한다.
 * 동작은 기존 App.js 의 auditOne 과 동일.
 */
export function auditOne(file, url, canvas) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (!canvas) return resolve({});
      const ctx = canvas.getContext("2d");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const type = classifyBySize(w, h);
      const spec = BANNER_SPECS[type] || null;

      const bytesOk =
        typeof file?.size === "number" && spec ? file.size <= spec.max_bytes : false;
      const ext = extOf(file?.name || "");
      const formatOk = spec ? spec.formats.includes(ext) : false;
      const sizeOk = spec ? w === spec.width && h === spec.height : false;

      // 여백 검사는 서브 상단에서만 (로직만 유지)
      let marginsOk = true;
      if (type === "subTop") {
        const avg = averageColor(ctx, w, h, 8);
        const intr = detectBorderIntrusion(ctx, w, h, 30, avg);
        marginsOk = !intr.left && !intr.right;
      }

      // 750x160(서브 상단배너)인 경우 좌상단 1x1px 색상 추출
      let bgHex = null;
      if (type === "subTop") {
        const pix = ctx.getImageData(0, 0, 1, 1).data;
        bgHex = toHexColor(pix[0], pix[1], pix[2]);
      }

      resolve({
        meta: { width: w, height: h, size: file?.size ?? null, ext, bgHex },
        type,
        checks: { size: sizeOk, bytes: bytesOk, format: formatOk, margins: marginsOk },
        url,
      });
    };
    img.onerror = () =>
      resolve({
        meta: {},
        type: "unmatched",
        checks: { size: false, bytes: false, format: false, margins: false },
        url,
      });
    img.src = url;
  });
}
