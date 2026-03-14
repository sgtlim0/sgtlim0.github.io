import{r as i,u as w,j as e,T as g,R as N,a as C}from"./chunks/globals-DAzaIlIo.js";import{g as S,c as L,D as M,s as A,a as E}from"./chunks/storage-D3ZAw9zR.js";/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=(...t)=>t.filter((s,r,a)=>!!s&&s.trim()!==""&&a.indexOf(s)===r).join(" ").trim();/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(s,r,a)=>a?a.toUpperCase():r.toLowerCase());/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=t=>{const s=z(t);return s.charAt(0).toUpperCase()+s.slice(1)};/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var B={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=t=>{for(const s in t)if(s.startsWith("aria-")||s==="role"||s==="title")return!0;return!1};/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=i.forwardRef(({color:t="currentColor",size:s=24,strokeWidth:r=2,absoluteStrokeWidth:a,className:c="",children:o,iconNode:d,...x},m)=>i.createElement("svg",{ref:m,...B,width:s,height:s,stroke:t,strokeWidth:a?Number(r)*24/Number(s):r,className:v("lucide",c),...!o&&!_(x)&&{"aria-hidden":"true"},...x},[...d.map(([n,l])=>i.createElement(n,l)),...Array.isArray(o)?o:[o]]));/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=(t,s)=>{const r=i.forwardRef(({className:a,...c},o)=>i.createElement(R,{ref:o,iconNode:s,className:v(`lucide-${T(j(t))}`,`lucide-${t}`,a),...c}));return r.displayName=j(t),r};/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=[["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]],W=k("moon",I);/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O=[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]],P=k("sun",O);function D(){const{theme:t,toggleTheme:s}=w();return e.jsx("button",{onClick:s,className:"p-2 rounded-lg hover:bg-bg-hover transition-colors","aria-label":t==="light"?"다크 모드로 전환":"라이트 모드로 전환","aria-pressed":t==="dark",children:t==="light"?e.jsx(W,{className:"w-4 h-4 text-text-secondary"}):e.jsx(P,{className:"w-4 h-4 text-text-secondary"})})}function F({className:t="",style:s}){return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        @keyframes skeleton-shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}),e.jsx("div",{className:`rounded ${t}`,style:{background:"linear-gradient(90deg, var(--bg-card) 25%, var(--bg-hover) 50%, var(--bg-card) 75%)",backgroundSize:"200% 100%",animation:"skeleton-shimmer 1.5s infinite",...s}})]})}function $({lines:t=1,width:s="100%"}){return e.jsx("div",{className:"space-y-2",children:Array.from({length:t}).map((r,a)=>e.jsx(F,{className:"h-4",style:{width:a===t-1&&t>1?"75%":s}},a))})}function V({settings:t,onSettingsChange:s}){const r=()=>{typeof chrome<"u"&&chrome.runtime&&chrome.runtime.openOptionsPage()};return e.jsxs("header",{className:"flex items-center justify-between px-4 py-3 border-b border-ext-surface",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center",children:e.jsx("span",{className:"text-white font-bold text-sm",children:"H"})}),e.jsx("h1",{className:"text-base font-semibold text-ext-text",children:"H Chat"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(D,{}),e.jsx("button",{type:"button",onClick:r,className:"p-1.5 rounded hover:bg-ext-surface transition-colors","aria-label":"설정 열기",children:e.jsxs("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:[e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"}),e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15 12a3 3 0 11-6 0 3 3 0 016 0z"})]})})]})]})}const H=[{mode:"summarize",label:"요약",description:"페이지 내용을 간단히 요약합니다",color:"text-blue-500",icon:e.jsx("svg",{className:"w-6 h-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"})})},{mode:"explain",label:"설명",description:"내용을 자세히 설명합니다",color:"text-green-500",icon:e.jsx("svg",{className:"w-6 h-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})})},{mode:"research",label:"조사",description:"주제에 대해 심층 조사합니다",color:"text-orange-500",icon:e.jsx("svg",{className:"w-6 h-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"})})},{mode:"translate",label:"번역",description:"다른 언어로 번역합니다",color:"text-purple-500",icon:e.jsx("svg",{className:"w-6 h-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"})})}];function U({disabled:t=!1,onSelect:s}){return e.jsxs("div",{className:"p-4",children:[e.jsx("h2",{className:"text-sm font-medium text-ext-text-secondary mb-3",children:"분석 모드 선택"}),e.jsx("div",{className:"grid grid-cols-2 gap-3",children:H.map(r=>e.jsxs("button",{type:"button",onClick:()=>s(r.mode),disabled:t,className:"flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-ext-surface hover:border-ext-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-ext-surface","aria-label":`${r.label} 모드`,children:[e.jsx("div",{className:r.color,children:r.icon}),e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"text-sm font-medium text-ext-text",children:r.label}),e.jsx("div",{className:"text-xs text-ext-text-secondary mt-1",children:r.description})]})]},r.mode))}),t&&e.jsx("p",{className:"text-xs text-ext-text-secondary text-center mt-3",children:"페이지 컨텍스트를 먼저 추출해주세요"})]})}function K({context:t,onClear:s}){const r=(a,c)=>a.length<=c?a:a.slice(0,c)+"...";return e.jsx("div",{className:"mx-4 mt-4 p-3 rounded-lg bg-ext-surface border border-ext-surface",children:e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-1",children:[t.favicon&&e.jsx("img",{src:t.favicon,alt:"",className:"w-4 h-4 flex-shrink-0"}),e.jsx("h3",{className:"text-sm font-medium text-ext-text truncate",children:t.title})]}),e.jsx("p",{className:"text-xs text-ext-text-secondary truncate mb-2",children:t.url}),e.jsx("p",{className:"text-xs text-ext-text line-clamp-2",children:r(t.text,120)}),e.jsxs("div",{className:"flex items-center gap-3 mt-2 text-[10px] text-ext-text-secondary",children:[e.jsxs("span",{children:[t.text.length.toLocaleString(),"자"]}),t.sanitized&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("svg",{className:"w-3 h-3",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"})}),"새니타이즈됨"]})]})]}),e.jsx("button",{type:"button",onClick:s,className:"flex-shrink-0 p-1 rounded hover:bg-ext-bg transition-colors","aria-label":"컨텍스트 지우기",children:e.jsx("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]})})}async function*Z(t,s){const c={summarize:`이 페이지의 주요 내용을 요약하면 다음과 같습니다:

1. React 19의 새로운 Actions API가 도입되었습니다.
2. 서버 컴포넌트 지원이 개선되었습니다.
3. Document Metadata 관리 기능이 추가되었습니다.
4. Asset Loading이 최적화되었습니다.

전반적으로 개발자 경험과 성능이 크게 향상되었습니다.`,explain:`선택하신 내용에 대해 자세히 설명드리겠습니다.

이 개념은 React의 핵심 원리 중 하나로, 컴포넌트 재사용성과 타입 안전성을 동시에 보장하는 중요한 패턴입니다.

구체적으로는:
- 타입 파라미터를 활용한 제네릭 프로그래밍
- 컴파일 타임 타입 체크
- 런타임 오버헤드 없음

이를 통해 더 안전하고 유지보수하기 쉬운 코드를 작성할 수 있습니다.`,research:`관련 정보를 조사한 결과입니다:

**주요 트렌드:**
- AI 기술의 급속한 발전
- 생성형 AI의 대중화
- 멀티모달 모델의 확산

**산업 영향:**
- 개발 생산성 30-50% 향상
- 새로운 비즈니스 모델 창출
- 기존 워크플로우의 자동화

**향후 전망:**
2024년에는 더욱 강력하고 효율적인 모델들이 등장할 것으로 예상됩니다.`,translate:`번역 결과:

This page introduces the new features of React 19.

The main updates include:
- New Actions API for form handling
- Improved server components support
- Document metadata management
- Optimized asset loading

These features significantly enhance developer experience and application performance.`}[t].split(" ");for(let o=0;o<c.length;o++)yield c.slice(0,o+1).join(" "),await new Promise(d=>setTimeout(d,50))}function q({mode:t,context:s,onComplete:r,onError:a}){const[c,o]=i.useState(""),[d,x]=i.useState(!1),[m,n]=i.useState(null),l=i.useRef(null);i.useEffect(()=>()=>{l.current?.abort()},[]);const h=i.useCallback(async()=>{if(!s){const u=new Error("No context available");n(u),a?.(u);return}try{x(!0),n(null),o(""),l.current=new AbortController;const u=Z(t,s.text);for await(const y of u){if(l.current.signal.aborted)break;o(y)}l.current.signal.aborted||r?.(c)}catch(u){u instanceof Error&&u.name!=="AbortError"&&(n(u),a?.(u))}finally{x(!1),l.current=null}},[t,s,r,a,c]),p=i.useCallback(()=>{l.current?.abort(),o(""),n(null),x(!1)},[]);return{result:c,isStreaming:d,error:m,startAnalysis:h,reset:p}}const G={text:"This is a sample page context for development. Lorem ipsum dolor sit amet, consectetur adipiscing elit. React 19 introduces new features like Actions and improved server components.",url:"https://example.com/article",title:"Sample Article - Development Mode",favicon:"https://example.com/favicon.ico",timestamp:Date.now()-1e3*60*2,sanitized:!0};function f(){return typeof chrome>"u"||!chrome?.storage?.local}function X(){const[t,s]=i.useState(null),[r,a]=i.useState(!0),[c,o]=i.useState(null),d=i.useCallback(async()=>{try{if(a(!0),o(null),f())s(G);else{const n=await S();s(n)}}catch(n){o(n instanceof Error?n:new Error("Failed to load context"))}finally{a(!1)}},[]);i.useEffect(()=>{if(d(),f())return;const n=(l,h)=>{if(h==="local"&&l.hchat_context){const p=l.hchat_context.newValue;s(p||null)}};return chrome.storage.onChanged.addListener(n),()=>{chrome.storage.onChanged.removeListener(n)}},[d]);const x=i.useCallback(async()=>{try{o(null),f()||await L(),s(null)}catch(n){const l=n instanceof Error?n:new Error("Failed to clear context");throw o(l),l}},[]),m=i.useCallback(async()=>{await d()},[d]);return{context:t,isLoading:r,error:c,clearContext:x,refreshContext:m}}function J(){const[t,s]=i.useState(M),[r,a]=i.useState(!0),[c,o]=i.useState(null);i.useEffect(()=>{(async()=>{try{a(!0),o(null);const n=await E();s(n)}catch(n){o(n instanceof Error?n:new Error("Failed to load settings"))}finally{a(!1)}})();const m=(n,l)=>{if(l==="local"&&n.hchat_settings){const h=n.hchat_settings.newValue;h&&s(h)}};if(typeof chrome<"u"&&chrome?.storage?.onChanged)return chrome.storage.onChanged.addListener(m),()=>{chrome.storage.onChanged.removeListener(m)}},[]);const d=i.useCallback(async x=>{try{o(null);const m=await A(x);s(m)}catch(m){const n=m instanceof Error?m:new Error("Failed to update settings");throw o(n),n}},[]);return{settings:t,isLoading:r,error:c,updateSettings:d}}const Q={summarize:"요약",explain:"설명",research:"조사",translate:"번역"};function Y({mode:t,context:s,onBack:r}){const{result:a,isStreaming:c,error:o,startAnalysis:d,reset:x}=q({mode:t,context:s});i.useEffect(()=>(d(),()=>x()),[d,x]);const m=async()=>{try{await navigator.clipboard.writeText(a)}catch(l){console.error("Failed to copy:",l)}},n=()=>{x(),r()};return e.jsxs("div",{className:"flex flex-col h-full",children:[e.jsxs("div",{className:"flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-ext-surface",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("button",{type:"button",onClick:r,className:"p-1 rounded hover:bg-ext-surface transition-colors","aria-label":"뒤로가기",children:e.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15 19l-7-7 7-7"})})}),e.jsx("h2",{className:"text-base font-semibold text-ext-text",children:"분석 결과"})]}),e.jsx("span",{className:"inline-flex items-center px-2 py-0.5 rounded-full bg-ext-primary/10 text-ext-primary text-xs font-semibold",children:Q[t]})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto p-4",children:[o?e.jsx("div",{className:"p-4 rounded-lg bg-red-500/10 border border-red-500/20",children:e.jsxs("div",{className:"flex items-start gap-2",children:[e.jsx("svg",{className:"w-5 h-5 text-red-500 flex-shrink-0 mt-0.5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-sm font-semibold text-red-700 dark:text-red-400 mb-1",children:"오류 발생"}),e.jsx("p",{className:"text-xs text-red-600 dark:text-red-400",children:o.message})]})]})}):c&&!a?e.jsx("div",{className:"space-y-2",children:e.jsx($,{lines:4})}):e.jsx("div",{className:"prose prose-sm max-w-none",children:e.jsxs("div",{className:"text-sm text-ext-text whitespace-pre-wrap leading-relaxed",children:[a,c&&e.jsx("span",{className:"inline-block w-2 h-4 ml-1 bg-ext-primary animate-pulse"})]})}),s&&!o&&e.jsxs("div",{className:"mt-4 pt-4 border-t border-ext-surface",children:[e.jsx("h3",{className:"text-xs font-medium text-ext-text-secondary mb-2",children:"분석 대상"}),e.jsxs("div",{className:"text-xs text-ext-text-secondary space-y-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[s.favicon&&e.jsx("img",{src:s.favicon,alt:"",className:"w-3 h-3"}),e.jsx("span",{className:"truncate",children:s.title})]}),e.jsx("div",{className:"truncate",children:s.url}),e.jsxs("div",{className:"text-[10px]",children:["텍스트 길이: ",s.text.length.toLocaleString(),"자",s.sanitized&&" · 새니타이즈됨"]})]})]})]}),e.jsxs("div",{className:"flex-shrink-0 flex items-center justify-between px-4 py-3 border-t border-ext-surface",children:[e.jsx("button",{type:"button",onClick:n,className:"px-3 py-1.5 text-sm font-medium text-ext-text-secondary hover:text-ext-text border border-ext-surface rounded-md hover:bg-ext-surface transition-colors",children:"새 분석"}),e.jsxs("button",{type:"button",onClick:m,disabled:!a||c,className:"px-3 py-1.5 text-sm font-medium text-white bg-ext-primary rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1",children:[e.jsx("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"})}),"복사"]})]})]})}function ee(){const{context:t,clearContext:s}=X(),{settings:r,updateSettings:a}=J(),[c,o]=i.useState(null),d=n=>{o(n)},x=()=>{o(null)},m=async()=>{try{await s()}catch(n){console.error("Failed to clear context:",n)}};return c&&t?e.jsx(g,{children:e.jsx("div",{className:"w-[400px] h-[600px] flex flex-col bg-ext-bg text-ext-text",children:e.jsx(Y,{mode:c,context:t,onBack:x})})}):e.jsx(g,{children:e.jsxs("div",{className:"w-[400px] max-h-[600px] overflow-y-auto bg-ext-bg text-ext-text",children:[e.jsx(V,{settings:r,onSettingsChange:a}),t&&!c&&e.jsx(K,{context:t,onClear:m}),e.jsx(U,{disabled:!t,onSelect:d})]})})}const b=document.getElementById("root");b&&N.createRoot(b).render(e.jsx(C.StrictMode,{children:e.jsx(ee,{})}));
