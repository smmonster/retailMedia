import React from "react";
import { GUIDE_INFO } from "../constants/guideInfo";

export default function Section({ title, spec, rows }) {
  const guide = GUIDE_INFO[spec.key];

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
        // fallback: GUIDE_INFO 가 없는 경우 기본 간단 리스트
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
}
