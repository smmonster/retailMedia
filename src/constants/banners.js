// 배너 규격 정의
export const BANNER_SPECS = {
  homeTop: {
    key: "homeTop",
    label: "홈 상단배너",
    width: 1125,
    height: 540,
    max_bytes: 80 * 1024,
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

export const SPEC_LIST = Object.values(BANNER_SPECS);
