// App.js
import React, { useEffect, useRef, useState } from "react";
import "./App.css";

/** 배너 스펙 정의 */
const BANNER_SPECS = {
  homeTop: {
    key: "homeTop",
    label: "홈 상단배너",
    width: 1125,
    height: 540,
    max_bytes: 800 * 1024,
    formats: ["jpg", "jpeg", "png"],
  },
  subTop: {
    key: "subTop",
    label: "서브 상단배너",
    width: 750,
    height: 160,
    max_bytes: 200 * 1024,
    formats: ["jpg", "jpeg", "png"],
  },
  homeSubBottom: {
    key: "homeSubBottom",
    label: "홈서브 하단배너",
    width: 1250,
    height: 560,
    max_bytes: 250 * 1024,
    formats: ["jpg", "jpeg", "png"],
  },
};

// 배너별 가이드 요약 정보
const GUIDE_INFO = {
  homeTop: {
    title: "가이드 요약",
    lines: [
      "1) 사이즈: 1125×540px",
      "2) 용량: ≤ 800KB",
      "3) 포맷: JPG, JPEG, PNG",
      "4) 추가 검수 사항:",
    ],
    sub: [
      "<span style='color:#2563eb;font-weight:600'>파일명과 소재 내 텍스트가 어느 정도 유사한지 확인</span>",
      "좌측 텍스트 / 우측 오브젝트로 구성. 오브젝트는 상/하/좌/우 최소 여백 가이드를 준수하는지 확인",
      "<b>하단 뱃지는 사이즈/스타일/위치 변경 없이 문구만 수정되었는지 확인</b>" +
      " <span class='guide-tip'> (뱃지보기)" +
        "   <img class='guide-tip-img' src='/homeTop_cta_guide.png' />" +
        " </span>"
    ],
  },
  subTop: {
    title: "가이드 요약",
    lines: [
      "1) 사이즈: 750×160px",
      "2) 용량: ≤ 200KB",
      "3) 포맷: JPG, JPEG, PNG",
      "4) 추가 검수 사항:",
    ],
sub: [
  "<span style='color:#2563eb;font-weight:600'>파일명과 소재 내 텍스트가 어느 정도 유사한지 확인</span>",
  "1행의 텍스트 컬러만 변경 가능하며, 뱃지 내 텍스트 컬러와 동일하게 적용 권장",
  "<b>배경색은 단색으로만 적용 가능. 그라데이션 및 패턴 적용 불가</b>",
  "<span style='color:#2563eb;font-weight:600'>소재의 배경이 광고영역의 배경 컬러와 자연스럽게 이어지는지 확인</span> (빨간 라인으로 배너/배경 구분)",
  `<b>뱃지는 사이즈/스타일/위치 변경 없이 문구만 수정되었는지 확인</b>
   <span class='guide-tip'>(뱃지보기)
     <img class='guide-tip-img' src='${process.env.PUBLIC_URL}/subTop_cta_guide.png' />
   </span>`
],
  },
  homeSubBottom: {
    title: "가이드 요약",
    lines: [
      "1) 사이즈: 1250×560px",
      "2) 용량: ≤ 250KB",
      "3) 포맷: JPG, JPEG, PNG",
      "4) 추가 검수 사항:",
    ],
sub: [
  "하단 <b>행동유도버튼</b> 은 수동 검수 제외. 메인 이미지만 검수 진행",
  "<span style='color:#2563eb;font-weight:600'>파일명과 소재 내 텍스트가 어느 정도 유사한지 확인</span>",
  `<span style='color:#2563eb;font-weight:600'>해상도에 따라 상하좌우 일부 영역이 가려보일 수 있으며, 주요 CREATIVE 가 SAFE AREA 가이드에 맞게 제작되었는지 확인</span>
   <span class='guide-tip'>(예시보기)
     <img class='guide-tip-img' src='${process.env.PUBLIC_URL}/subTop_safearea_guide.png' />
   </span>`
],
  },
};
const SPEC_LIST = Object.values(BANNER_SPECS);

// ---------- utils ----------
function colorDistanceRGB(a, b) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}


function averageColor(ctx, w, h, step = 8) {
  let r = 0,
    g = 0,
    b = 0,
    c = 0;
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

function detectBorderIntrusion(ctx, w, h, border = 30, bgSample) {
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

function extOf(name) {
  const n = name?.toLowerCase() || "";
  const i = n.lastIndexOf(".");
  return i >= 0 ? n.slice(i + 1) : "";
}

function classifyBySize(w, h) {
  const hit = SPEC_LIST.find((sp) => sp.width === w && sp.height === h);
  return hit ? hit.key : "unmatched";
}

function toHexColor(r, g, b) {
  const comp = (v) => v.toString(16).padStart(2, "0");
  return `#${comp(r)}${comp(g)}${comp(b)}`;
}

function getGuideSrc(type) {
  const base = process.env.PUBLIC_URL || "";
  if (type === "homeTop") return `${base}/homeTop_guide.png`;
  if (type === "subTop") return `${base}/subTop_guide.png`;
  if (type === "homeSubBottom") return `${base}/homeSubBottom_guide.png`;
  return null;
}

// ---------- small components ----------
const StatusDot = ({ ok }) => (
  <span className={`badge-mini ${ok ? "pass" : "fail"}`}>{ok ? "✔" : "✖"}</span>
);

const DropZone = ({ onFiles }) => {
  const [active, setActive] = useState(false);

  const onDragOver = (e) => {
    e.preventDefault();
    setActive(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setActive(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setActive(false);
    const raw = Array.from(e.dataTransfer.files || []);
    const files = raw.filter((f) => f && /^image\/(png|jpeg|jpg)$/.test(f.type));
    if (files.length) onFiles(files);
  };

  return (
    <div
      className={`dropzone-lg ${active ? "active" : ""}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="dz-inner">
        <div className="dz-title">여기로 이미지를 드래그 앤 드롭</div>
        <div className="dz-help">PNG / JPG · 각 규격별 가이드에 따라 자동 분류/검수</div>
      </div>
    </div>
  );
};

// ---------- main ----------
export default function App() {
  /**
   * items:
   * { file, url, meta:{width,height,size,ext,bgHex?}, type, checks:{size,bytes,format,margins}, manual:{contentMatch} }
   */
  const [items, setItems] = useState([]);

  // 전역 가이드 투명도 (정수 0~100)
  const [guideOpacityPct, setGuideOpacityPct] = useState(40);

  const canvasRef = useRef(null);

  const onFiles = (files) => {
    const mapped = files.filter(Boolean).map((f) => ({
      file: f,
      url: typeof URL !== "undefined" ? URL.createObjectURL(f) : "",
      meta: {},
      type: "pending",
      checks: { size: false, bytes: false, format: false, margins: false },
      manual: { contentMatch: false },
    }));
    if (mapped.length) setItems((prev) => [...prev, ...mapped]);
  };

  
  useEffect(() => {
    items.forEach((it, idx) => {
      if (!it || it.meta?.width) return;
      if (!it.url || !it.file) return;
      auditOne(it.file, it.url)
        .then((res) => {
          setItems((prev) => {
            const next = [...prev];
            if (!next[idx]) return prev;
            next[idx] = { ...next[idx], ...res };
            return next;
          });
        })
        .catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  useEffect(() => {
  const handler = (e) => {
    const tip = e.target.closest(".guide-tip");
    // 클릭한게 guide-tip이면 toggle, 아니면 전부 닫기
    document.querySelectorAll(".guide-tip").forEach((el) => {
      if (el !== tip) el.classList.remove("active");
    });
    if (tip) {
      tip.classList.toggle("active");
    }
  };

  document.addEventListener("click", handler);
  return () => document.removeEventListener("click", handler);
}, []);


  const auditOne = (file, url) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const cvs = canvasRef.current;
        if (!cvs) return resolve({});
        const ctx = cvs.getContext("2d");
        cvs.width = img.naturalWidth;
        cvs.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const type = classifyBySize(w, h);
        const spec = BANNER_SPECS[type] || null;

        const bytesOk =
          typeof file?.size === "number" && spec
            ? file.size <= spec.max_bytes
            : false;
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

        // 750x160(서브 상단배너)인 경우, 좌상단 1x1px 색상 추출
        let bgHex = null;
        if (type === "subTop") {
          const pix = ctx.getImageData(0, 0, 1, 1).data;
          const r = pix[0];
          const g = pix[1];
          const b = pix[2];
          bgHex = toHexColor(r, g, b);
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

  const toggleManual = (i) =>
    setItems((prev) => {
      const next = [...prev];
      if (!next[i]) return prev;
      next[i] = {
        ...next[i],
        manual: {
          ...next[i].manual,
          contentMatch: !next[i].manual?.contentMatch,
        },
      };
      return next;
    });

  // 공용 행 렌더러 (전역 guideOpacityPct 사용)
  const renderRows = (list) =>
    list
      .filter(Boolean)
      .map((it, idxInGroup) => {
        const globalIndex = items.indexOf(it);
        const name = it?.file?.name || "(untitled)";
        const chk =
          it?.checks || {
            size: false,
            bytes: false,
            format: false,
            margins: false,
          };
        const width = it?.meta?.width || 0;
        const height = it?.meta?.height || 0;
        const isSubTop = it?.type === "subTop";
        const guideSrc = getGuideSrc(it?.type);
        const guideOpacity = guideOpacityPct / 100;

        // 썸네일 사이즈: 기본 1/3, 서브상단(750x160)만 1/2
        let thumbW = width ? Math.round(width / 3) : 250;
        let thumbH = height ? Math.round(height / 3) : 53;
        if (isSubTop && width === 750 && height === 160) {
          thumbW = Math.round(width / 2); // 375
          thumbH = Math.round(height / 2); // 80
        }

        // 서브상단 광고 영역(900x160의 1/2 -> 450x80)
        const adW = 450;
        const adH = 80;
        const bgColor = it?.meta?.bgHex || "#f3f4f6";

        const sizeVal = width && height ? `${width}×${height}` : "-";
        const bytesVal =
          typeof it?.meta?.size === "number"
            ? `${(it.meta.size / 1024).toFixed(1)} KB`
            : "-";
        const fmtVal = it?.meta?.ext ? `.${it.meta.ext.toUpperCase()}` : "-";

        return (
          <tr key={`${name}-${idxInGroup}`}>
            {/* 이미지 + 파일명 */}
            <td className="cell-thumb">
              <div
                style={{
                  fontSize: 12,
                  color: "#374151",
                  marginBottom: 6,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={name}
              >
                <span className="thumb-name-label">파일명:</span> <b>{name}</b>
              </div>

              {isSubTop ? (
  // 서브 상단: 광고 영역 상단에 이미지 폭 비율 빨간 바 + 광고 영역
  (() => {
const ratio = thumbW && adW ? thumbW / adW : 0; // 이미지 폭 / 광고 영역 폭
const barWidth = Math.min(Math.max(ratio, 0), 1) * 100;
const sideGap = (100 - barWidth) / 2; // 좌우 여백 %

    return (
  <div className="ad-area-visual">
    {/* 상단 비율 막대 */}
    <div className="ad-area-ruler">
      <div
        className="ad-area-ruler-fill"
        style={{
          width: `${barWidth}%`,
          marginLeft: `${sideGap}%`, // 🔹 가운데 정렬
        }}
      />
    </div>

    {/* 광고 영역 */}
    <div
      className="ad-area"
      style={{ width: adW, height: adH, backgroundColor: bgColor }}
    >
      <div className="ad-area-inner">
        <div className="thumb-wrap" style={{ width: thumbW, height: thumbH }}>
          {it?.url ? <img className="thumb" src={it.url} alt={name} /> : null}
          {guideSrc && (
            <img
              className="thumb-guide"
              src={guideSrc}
              alt={`${it.type} guide`}
              style={{ opacity: guideOpacity }}
            />
          )}
        </div>
      </div>
    </div>
  </div>
);
  })()
) : (
  // 나머지 타입: 단순 썸네일 (1/3) + 가이드 오버레이
  <div
    className="thumb-wrap"
    style={{ width: thumbW, height: thumbH }}
    title={name}
  >
    {it?.url ? <img className="thumb" src={it.url} alt={name} /> : null}
    {guideSrc && (
      <img
        className="thumb-guide"
        src={guideSrc}
        alt={`${it.type} guide`}
        style={{ opacity: guideOpacity }}
      />
    )}
  </div>
)}
            </td>

            {/* 소재내용 검수(체크박스만) */}
            <td style={{ textAlign: "center" }}>
              <input
                aria-label="소재내용 검수"
                type="checkbox"
                checked={!!it?.manual?.contentMatch}
                onChange={() =>
                  globalIndex >= 0 && toggleManual(globalIndex)
                }
              />
            </td>

            {/* 사이즈 */}
            <td className="cell-status">
              <StatusDot ok={!!chk.size} />
              <span className="value">{sizeVal}</span>
            </td>

            {/* 용량 */}
            <td className="cell-status">
              <StatusDot ok={!!chk.bytes} />
              <span className="value">{bytesVal}</span>
            </td>

            {/* 포맷 */}
            <td className="cell-status">
              <StatusDot ok={!!chk.format} />
              <span className="value">{fmtVal}</span>
            </td>
          </tr>
        );
      });

  // 그룹핑
  const group = {
    homeTop: items.filter((it) => it?.type === "homeTop"),
    subTop: items.filter((it) => it?.type === "subTop"),
    homeSubBottom: items.filter((it) => it?.type === "homeSubBottom"),
    unmatched: items.filter((it) => it?.type === "unmatched"),
  };

  const rowsHomeTop = renderRows(group.homeTop);
  const rowsSubTop = renderRows(group.subTop);
  const rowsHomeSubBottom = renderRows(group.homeSubBottom);
  const rowsUnmatched = renderRows(group.unmatched);

  const Section = ({ title, spec, rows }) => {
  const guide = GUIDE_INFO[spec.key];  // homeTop / subTop / homeSubBottom

  return (
    <div className="card" style={{ borderRadius: 4, marginBottom: 12 }}>
      <div className="title">{title}</div>

      {guide ? (
        <div className="guide-info">
          <ul className="guide-info-list">
            {guide.lines.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
            {guide.sub && guide.sub.length > 0 && (
              <ul className="guide-info-sublist">
                {guide.sub.map((s, si) => (
  <li key={si} dangerouslySetInnerHTML={{ __html: s }} />
))}
              </ul>
            )}
          </ul>
        </div>
      ) : (
        // fallback: GUIDE_INFO가 없는 경우 기존 간단 리스트
        <ul className="list" style={{ marginTop: 0, marginBottom: 8 }}>
          <li>
            사이즈: {spec.width}×{spec.height}px
          </li>
          <li>용량: ≤ {(spec.max_bytes / 1024).toFixed(0)}KB</li>
          <li>포맷: {spec.formats.join(", ").toUpperCase()}</li>
        </ul>
      )}

      <div className="table-wrap" style={{ borderRadius: 4 }}>
        <table className="table">
          <thead>
            <tr>
              <th className="cell-thumb">이미지</th>
              <th>소재내용검수</th>
              <th className="cell-status">사이즈</th>
              <th className="cell-status">용량</th>
              <th className="cell-status">포맷</th>
            </tr>
          </thead>
          <tbody>
            {rows}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    color: "#6b7280",
                    padding: "16px",
                  }}
                >
                  항목이 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

  const UnmatchedSection = ({ rows }) => (
    <div className="card" style={{ borderRadius: 4, marginBottom: 12 }}>
      <div className="title">미매칭(규격 불일치)</div>
      <ul className="list" style={{ marginTop: 0, marginBottom: 12 }}>
        <li>
          아래 이미지는 정의된 세 가지 규격과 일치하지 않습니다. (1125×540 / 750×160 /
          1250×560)
        </li>
      </ul>
      <div className="table-wrap" style={{ borderRadius: 4 }}>
        <table className="table">
          <thead>
            <tr>
              <th className="cell-thumb">이미지</th>
              <th>소재내용검수</th>
              <th className="cell-status">사이즈</th>
              <th className="cell-status">용량</th>
              <th className="cell-status">포맷</th>
            </tr>
          </thead>
          <tbody>
            {rows}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    color: "#6b7280",
                    padding: "18px",
                  }}
                >
                  항목이 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div>
            <h1>리테일미디어 - 배너 이미지 자동 검수</h1>
            <p>홈 상단(1125×540) · 서브 상단(750×160) · 홈서브 하단(1250×560)</p>
          </div>
        </header>

        {/* 단일 업로드 영역 */}
        <DropZone onFiles={onFiles} />

        {/* 전역 가이드 투명도 슬라이더 */}
        

        {/* 타입별 섹션 */}
        <Section
          title={BANNER_SPECS.homeTop.label}
          spec={BANNER_SPECS.homeTop}
          rows={rowsHomeTop}
        />
        <Section
          title={BANNER_SPECS.subTop.label}
          spec={BANNER_SPECS.subTop}
          rows={rowsSubTop}
        />
        <Section
          title={BANNER_SPECS.homeSubBottom.label}
          spec={BANNER_SPECS.homeSubBottom}
          rows={rowsHomeSubBottom}
        />

        {/* 미매칭 섹션 */}
        <UnmatchedSection rows={rowsUnmatched} />

        {/* 분석용 오프스크린 캔버스 */}
        <canvas
          ref={canvasRef}
          width="10"
          height="10"
          style={{ display: "none" }}
        />

{/* 화면 공통 · 플로팅 가이드 컨트롤러 */}
<div className="guide-floating">
  <div className="guide-floating-title">가이드 투명도</div>
  <div className="guide-floating-body">
    <span className="guide-floating-label">0%</span>
    <input
      type="range"
      min="0"
      max="100"
      step="5"
      value={guideOpacityPct}
      onChange={(e) => {
        const v = parseInt(e.target.value, 10);
        if (!Number.isNaN(v)) setGuideOpacityPct(v);
      }}
      className="guide-floating-range"
    />
    <span className="guide-floating-value">{guideOpacityPct}%</span>
  </div>
</div>


      </div>
    </div>
  );
}
