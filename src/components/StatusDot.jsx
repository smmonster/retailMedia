import React from "react";

export default function StatusDot({ ok }) {
  return (
    <span className={`badge-mini ${ok ? "pass" : "fail"}`}>
      {ok ? "✔" : "✖"}
    </span>
  );
}
