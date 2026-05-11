// 배너별 가이드 요약(검수 안내 문구)
// sub 항목은 HTML이 포함되어 dangerouslySetInnerHTML 로 렌더된다.
const PUBLIC_URL = process.env.PUBLIC_URL || "";

export const GUIDE_INFO = {
  homeTop: {
    title: "가이드 요약",
    lines: [
      "1) 사이즈: 1125×540px",
      "2) 용량: ≤ 80KB",
      "3) 포맷: JPG, JPEG, PNG",
      "4) 추가 검수 사항:",
    ],
    sub: [
      "<span style='color:#2563eb;font-weight:600'>파일명에 소재 내 메인+서브 문구가 모두 정확히 포함되어있는지 확인</span>",
      "좌측 텍스트 / 우측 오브젝트로 구성. 오브젝트는 상/하/좌/우 최소 여백 가이드를 준수하는지 확인",
      `<b>하단 뱃지는 사이즈/스타일/위치 변경 없이 문구만 수정되었는지 확인</b>
       <span class='guide-tip'>(뱃지보기)
         <img class='guide-tip-img' src='${PUBLIC_URL}/homeTop_cta_guide.png' />
       </span>`,
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
      "<span style='color:#2563eb;font-weight:600'>파일명에 소재 내 메인+서브 문구가 모두 정확히 포함되어있는지 확인</span>",
      "1행의 텍스트 컬러만 변경 가능하며, 뱃지 내 텍스트 컬러와 동일하게 적용 권장",
      "<b>배경색은 단색으로만 적용 가능. 그라데이션 및 패턴 적용 불가</b>",
      "<span style='color:#2563eb;font-weight:600'>소재의 배경이 광고영역의 배경 컬러와 자연스럽게 이어지는지 확인</span> (빨간 라인으로 배너/배경 구분)",
      `<b>뱃지는 사이즈/스타일/위치 변경 없이 문구만 수정되었는지 확인</b>
       <span class='guide-tip'>(뱃지보기)
         <img class='guide-tip-img' src='${PUBLIC_URL}/subTop_cta_guide.png' />
       </span>`,
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
      "<span style='color:#2563eb;font-weight:600'>파일명에 소재 내 메인+서브 문구가 모두 정확히 포함되어있는지 확인</span>",
      "해상도에 따라 상하좌우 일부 영역이 가려보일 수 있으며, <span style='color:#2563eb;font-weight:600'>주요 CREATIVE 가 SAFE AREA 가이드에 맞게 제작되었는지 확인</span>",
    ],
  },
};
