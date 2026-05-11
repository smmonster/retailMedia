import React from "react";
import StatusDot from "./StatusDot";
import { getGuideSrc } from "../utils/image";

// 서브 상단 광고 영역(900x160 의 1/2 → 450x80)
const AD_W = 450;
const AD_H = 80;

export default function BannerRow({ item, index, guideOpacityPct, onToggleManual }) {
  const name = item?.file?.name || "(untitled)";
  const chk = item?.checks || {
    size: false,
    bytes: false,
    format: false,
    margins: false,
  };
  const width = item?.meta?.width || 0;
  const height = item?.meta?.height || 0;
  const isSubTop = item?.type === "subTop";
  const guideSrc = getGuideSrc(item?.type);
  const guideOpacity = guideOpacityPct / 100;

  // 썸네일 사이즈: 기본 1/3, 서브상단(750x160)만 1/2
  let thumbW = width ? Math.round(width / 3) : 250;
  let thumbH = height ? Math.round(height / 3) : 53;
  if (isSubTop && width === 750 && height === 160) {
    thumbW = Math.round(width / 2); // 375
    thumbH = Math.round(height / 2); // 80
  }

  const bgColor = item?.meta?.bgHex || "#f3f4f6";

  const sizeVal = width && height ? `${width}×${height}` : "-";
  const bytesVal =
    typeof item?.meta?.size === "number"
      ? `${(item.meta.size / 1024).toFixed(1)} KB`
      : "-";
  const fmtVal = item?.meta?.ext ? `.${item.meta.ext.toUpperCase()}` : "-";

  const renderThumb = () => (
    <div className="thumb-wrap" style={{ width: thumbW, height: thumbH }} title={name}>
      {item?.url ? <img className="thumb" src={item.url} alt={name} /> : null}
      {guideSrc && (
        <img
          className="thumb-guide"
          src={guideSrc}
          alt={`${item.type} guide`}
          style={{ opacity: guideOpacity }}
        />
      )}
    </div>
  );

  const renderSubTopVisual = () => {
    // 이미지 폭이 광고 영역에서 차지하는 비율을 상단 빨간 바로 표시
    const ratio = thumbW && AD_W ? thumbW / AD_W : 0;
    const barWidth = Math.min(Math.max(ratio, 0), 1) * 100;
    const sideGap = (100 - barWidth) / 2;

    return (
      <div className="ad-area-visual">
        <div className="ad-area-ruler">
          <div
            className="ad-area-ruler-fill"
            style={{ width: `${barWidth}%`, marginLeft: `${sideGap}%` }}
          />
        </div>
        <div
          className="ad-area"
          style={{ width: AD_W, height: AD_H, backgroundColor: bgColor }}
        >
          <div className="ad-area-inner">{renderThumb()}</div>
        </div>
      </div>
    );
  };

  return (
    <tr>
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

        {isSubTop ? renderSubTopVisual() : renderThumb()}
      </td>

      <td style={{ textAlign: "center" }}>
        <input
          aria-label="소재내용 검수"
          type="checkbox"
          checked={!!item?.manual?.contentMatch}
          onChange={() => index >= 0 && onToggleManual(index)}
        />
      </td>

      <td className="cell-status">
        <StatusDot ok={!!chk.size} />
        <span className="value">{sizeVal}</span>
      </td>

      <td className="cell-status">
        <StatusDot ok={!!chk.bytes} />
        <span className="value">{bytesVal}</span>
      </td>

      <td className="cell-status">
        <StatusDot ok={!!chk.format} />
        <span className="value">{fmtVal}</span>
      </td>
    </tr>
  );
}
