/**
 * config.js — 포트폴리오 설정 파일
 *
 * ✅ 스킬이나 카테고리를 추가/제거할 때는 이 파일만 수정하면 됩니다.
 * 나머지 UI는 자동으로 반영됩니다.
 */

window.PORTFOLIO_CONFIG = {

  // ── 개인정보 ──────────────────────────────────────
  name:    { ko: '김석현', en: 'Kim Seokhyun' },
  initials: 'KSH',
  birth:   '2006.01.21',
  nationality: '대한민국',
  affiliation: '인덕대학교 Game&VR콘텐츠디자인학과',
  email:   'seokhyunkim121@gmail.com',
  artstation: 'artstation.com/Kimseokhyun6',  // ArtStation 주소로 교체
  github: 'github.com/kingtteoksoon',          // GitHub 주소로 교체
  bio: [
    '기술과 디자인의 경계를 탐구하는 3D 디자이너입니다.',
    '인터랙티브한 경험과 시각적 완성도를 추구하며,',
    '아이디어를 실제 구현으로 연결하는 작업을 지향합니다.'
  ],

  // ── 스킬 목록 ─────────────────────────────────────
  // 추가: 배열에 문자열 하나 더 넣으면 됩니다.
  skills: [
    'Blender',
    'Maya',
    'ZBrush',
    'Substance 3D Painter',
    'Unreal Engine',
    'Unity',
    'C#',
    'C++',
    'After Effects',
    'Photoshop',
    'AI Pipeline',
    '3D Modeling',
    'Game Design',
    'VFX',
    'Sound Design',
  ],

  // ── 프로젝트 카테고리 (업로드 폼 체크박스) ──────────
  // 추가: 배열에 { value, label } 객체 하나 더 넣으면 됩니다.
  categories: [
    { value: 'Blender',               label: 'Blender'            },
    { value: 'Maya',                  label: 'Maya'               },
    { value: 'ZBrush',                label: 'ZBrush'             },
    { value: 'Substance 3D Painter',  label: 'Substance'          },
    { value: 'Unreal Engine',         label: 'Unreal Engine'      },
    { value: 'Unity',                 label: 'Unity'              },
    { value: 'C#',                    label: 'C#'                 },
    { value: 'C++',                   label: 'C++'                },
    { value: 'UI/UX',                 label: 'UI/UX'              },
    { value: 'Photography',           label: 'Photography'        },
    { value: 'Stylized',              label: 'Stylized'           },
    { value: 'VFX',                   label: 'VFX'                },
    { value: 'Sound Design',          label: 'Sound Design'       },
    { value: 'Video',                 label: 'Video'              },
  ],

  // ── 학력 ─────────────────────────────────────────
  education: [
    { year: '현재', title: '인덕대학교 Game&VR콘텐츠디자인학과', sub: '휴학 중 — 졸업 예정' },
    { year: '과거', title: '청학고등학교', sub: '졸업 — 2023' },
  ],

  // ── 수상 이력 ─────────────────────────────────────
  awards: [
    { year: '2025', title: '2025 Winter IMS', sub: '인덕대학교' },
  ],

};
