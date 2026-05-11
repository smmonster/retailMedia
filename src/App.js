import React, { useEffect, useRef, useState } from "react";
import "./App.css";

import { BANNER_SPECS } from "./constants/banners";
import { auditOne } from "./utils/image";
import DropZone from "./components/DropZone";
import BannerRow from "./components/BannerRow";
import Section from "./components/Section";
import UnmatchedSection from "./components/UnmatchedSection";
import GuideFloating from "./components/GuideFloating";

/**
 * 검수 아이템 형태:
 * { file, url, meta:{width,height,size,ext,bgHex?}, type, checks:{size,bytes,format,margins}, manual:{contentMatch} }
 */
export default function App() {
  const [items, setItems] = useState([]);
  const [guideOpacityPct, setGuideOpacityPct] = useState(40); // 0~100
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

  // 새로 추가된 아이템에 대해서만 검수 수행
  useEffect(() => {
    items.forEach((it, idx) => {
      if (!it || it.meta?.width) return;
      if (!it.url || !it.file) return;
      auditOne(it.file, it.url, canvasRef.current)
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

  // 가이드 툴팁(.guide-tip) 토글: 다른 곳을 클릭하면 닫고, 자기 자신은 토글
  useEffect(() => {
    const handler = (e) => {
      const tip = e.target.closest(".guide-tip");
      document.querySelectorAll(".guide-tip").forEach((el) => {
        if (el !== tip) el.classList.remove("active");
      });
      if (tip) tip.classList.toggle("active");
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

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

  const renderRows = (list) =>
    list.filter(Boolean).map((it, idxInGroup) => {
      const globalIndex = items.indexOf(it);
      return (
        <BannerRow
          key={`${it?.file?.name || "untitled"}-${idxInGroup}`}
          item={it}
          index={globalIndex}
          guideOpacityPct={guideOpacityPct}
          onToggleManual={toggleManual}
        />
      );
    });

  const group = {
    homeTop: items.filter((it) => it?.type === "homeTop"),
    subTop: items.filter((it) => it?.type === "subTop"),
    homeSubBottom: items.filter((it) => it?.type === "homeSubBottom"),
    unmatched: items.filter((it) => it?.type === "unmatched"),
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div>
            <h1>리테일미디어 - 배너 이미지 자동 검수</h1>
            <p>홈 상단(1125×540) · 서브 상단(750×160) · 홈서브 하단(1250×560)</p>
          </div>
        </header>

        <DropZone onFiles={onFiles} />

        <Section
          title={BANNER_SPECS.homeTop.label}
          spec={BANNER_SPECS.homeTop}
          rows={renderRows(group.homeTop)}
        />
        <Section
          title={BANNER_SPECS.subTop.label}
          spec={BANNER_SPECS.subTop}
          rows={renderRows(group.subTop)}
        />
        <Section
          title={BANNER_SPECS.homeSubBottom.label}
          spec={BANNER_SPECS.homeSubBottom}
          rows={renderRows(group.homeSubBottom)}
        />

        <UnmatchedSection rows={renderRows(group.unmatched)} />

        {/* 분석용 오프스크린 캔버스 */}
        <canvas
          ref={canvasRef}
          width="10"
          height="10"
          style={{ display: "none" }}
        />

        <GuideFloating value={guideOpacityPct} onChange={setGuideOpacityPct} />
      </div>
    </div>
  );
}
