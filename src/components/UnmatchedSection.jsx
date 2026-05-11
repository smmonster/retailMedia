import React from "react";

export default function UnmatchedSection({ rows }) {
  return (
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
}
