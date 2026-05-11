import React from "react";

// 화면 왼쪽에 떠 있는 가이드 투명도 슬라이더 (0~100%)
export default function GuideFloating({ value, onChange }) {
  return (
    <div className="guide-floating">
      <div className="guide-floating-title">가이드 투명도</div>
      <div className="guide-floating-body">
        <span className="guide-floating-label">0%</span>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!Number.isNaN(v)) onChange(v);
          }}
          className="guide-floating-range"
        />
        <span className="guide-floating-value">{value}%</span>
      </div>
    </div>
  );
}
