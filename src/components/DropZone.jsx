import React, { useState } from "react";

export default function DropZone({ onFiles }) {
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
        <div className="dz-help">
          PNG / JPG · 각 규격별 가이드에 따라 자동 분류/검수
        </div>
      </div>
    </div>
  );
}
