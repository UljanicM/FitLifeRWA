import{c as C,a as d,h as L,r as A,g as H,Q as D,y as N,b as F,R,w as Q,o as G,d as I,m as b,l as m,S as J,U as Z}from"./index.e50bee54.js";import{h as M,a as ee}from"./render.ccdd95ed.js";import{u as O,a as j}from"./use-dark.0f7cd856.js";import{u as te,b as le,g as oe,c as $}from"./QBtn.1786d8b2.js";import{v as ie}from"./vm.1ac4b770.js";var he=C({name:"QItemLabel",props:{overline:Boolean,caption:Boolean,header:Boolean,lines:[Number,String]},setup(e,{slots:t}){const l=d(()=>parseInt(e.lines,10)),o=d(()=>"q-item__label"+(e.overline===!0?" q-item__label--overline text-overline":"")+(e.caption===!0?" q-item__label--caption text-caption":"")+(e.header===!0?" q-item__label--header":"")+(l.value===1?" ellipsis":"")),n=d(()=>e.lines!==void 0&&l.value>1?{overflow:"hidden",display:"-webkit-box","-webkit-box-orient":"vertical","-webkit-line-clamp":l.value}:null);return()=>L("div",{style:n.value,class:o.value},M(t.default))}}),ge=C({name:"QItemSection",props:{avatar:Boolean,thumbnail:Boolean,side:Boolean,top:Boolean,noWrap:Boolean},setup(e,{slots:t}){const l=d(()=>`q-item__section column q-item__section--${e.avatar===!0||e.side===!0||e.thumbnail===!0?"side":"main"}`+(e.top===!0?" q-item__section--top justify-start":" justify-center")+(e.avatar===!0?" q-item__section--avatar":"")+(e.thumbnail===!0?" q-item__section--thumbnail":"")+(e.noWrap===!0?" q-item__section--nowrap":""));return()=>L("div",{class:l.value},M(t.default))}}),ye=C({name:"QItem",props:{...O,...te,tag:{type:String,default:"div"},active:{type:Boolean,default:null},clickable:Boolean,dense:Boolean,insetLevel:Number,tabindex:[String,Number],focused:Boolean,manualFocus:Boolean},emits:["click","keyup"],setup(e,{slots:t,emit:l}){const{proxy:{$q:o}}=H(),n=j(e,o),{hasLink:c,linkAttrs:s,linkClass:a,linkTag:f,navigateOnClick:E}=le(),u=A(null),p=A(null),h=d(()=>e.clickable===!0||c.value===!0||e.tag==="label"),v=d(()=>e.disable!==!0&&h.value===!0),g=d(()=>"q-item q-item-type row no-wrap"+(e.dense===!0?" q-item--dense":"")+(n.value===!0?" q-item--dark":"")+(c.value===!0&&e.active===null?a.value:e.active===!0?` q-item--active${e.activeClass!==void 0?` ${e.activeClass}`:""}`:"")+(e.disable===!0?" disabled":"")+(v.value===!0?" q-item--clickable q-link cursor-pointer "+(e.manualFocus===!0?"q-manual-focusable":"q-focusable q-hoverable")+(e.focused===!0?" q-manual-focusable--focused":""):"")),S=d(()=>{if(e.insetLevel===void 0)return null;const r=o.lang.rtl===!0?"Right":"Left";return{["padding"+r]:16+e.insetLevel*56+"px"}});function k(r){v.value===!0&&(p.value!==null&&(r.qKeyEvent!==!0&&document.activeElement===u.value?p.value.focus():document.activeElement===p.value&&u.value.focus()),E(r))}function T(r){if(v.value===!0&&D(r,[13,32])===!0){N(r),r.qKeyEvent=!0;const W=new MouseEvent("click",r);W.qKeyEvent=!0,u.value.dispatchEvent(W)}l("keyup",r)}function i(){const r=ee(t.default,[]);return v.value===!0&&r.unshift(L("div",{class:"q-focus-helper",tabindex:-1,ref:p})),r}return()=>{const r={ref:u,class:g.value,style:S.value,role:"listitem",onClick:k,onKeyup:T};return v.value===!0?(r.tabindex=e.tabindex||"0",Object.assign(r,s.value)):h.value===!0&&(r["aria-disabled"]="true"),L(f.value,r,i())}}});const ne=["ul","ol"];var qe=C({name:"QList",props:{...O,bordered:Boolean,dense:Boolean,separator:Boolean,padding:Boolean,tag:{type:String,default:"div"}},setup(e,{slots:t}){const l=H(),o=j(e,l.proxy.$q),n=d(()=>ne.includes(e.tag)?null:"list"),c=d(()=>"q-list"+(e.bordered===!0?" q-list--bordered":"")+(e.dense===!0?" q-list--dense":"")+(e.separator===!0?" q-list--separator":"")+(o.value===!0?" q-list--dark":"")+(e.padding===!0?" q-list--padding":""));return()=>L(e.tag,{class:c.value,role:n.value},M(t.default))}});function Le(e,t,l){let o;function n(){o!==void 0&&(R.remove(o),o=void 0)}return F(()=>{e.value===!0&&n()}),{removeFromHistory:n,addToHistory(){o={condition:()=>l.value===!0,handler:t},R.add(o)}}}const Ee={modelValue:{type:Boolean,default:null},"onUpdate:modelValue":[Function,Array]},Se=["beforeShow","show","beforeHide","hide"];function ke({showing:e,canShow:t,hideOnRouteChange:l,handleShow:o,handleHide:n,processOnMount:c}){const s=H(),{props:a,emit:f,proxy:E}=s;let u;function p(i){e.value===!0?g(i):h(i)}function h(i){if(a.disable===!0||i!==void 0&&i.qAnchorHandled===!0||t!==void 0&&t(i)!==!0)return;const r=a["onUpdate:modelValue"]!==void 0;r===!0&&(f("update:modelValue",!0),u=i,I(()=>{u===i&&(u=void 0)})),(a.modelValue===null||r===!1)&&v(i)}function v(i){e.value!==!0&&(e.value=!0,f("beforeShow",i),o!==void 0?o(i):f("show",i))}function g(i){if(a.disable===!0)return;const r=a["onUpdate:modelValue"]!==void 0;r===!0&&(f("update:modelValue",!1),u=i,I(()=>{u===i&&(u=void 0)})),(a.modelValue===null||r===!1)&&S(i)}function S(i){e.value!==!1&&(e.value=!1,f("beforeHide",i),n!==void 0?n(i):f("hide",i))}function k(i){a.disable===!0&&i===!0?a["onUpdate:modelValue"]!==void 0&&f("update:modelValue",!1):i===!0!==e.value&&(i===!0?v:S)(u)}Q(()=>a.modelValue,k),l!==void 0&&ie(s)===!0&&Q(()=>E.$route.fullPath,()=>{l.value===!0&&e.value===!0&&g()}),c===!0&&G(()=>{k(a.modelValue)});const T={show:h,hide:g,toggle:p};return Object.assign(E,T),T}const Te=[Element,String],re=[null,document,document.body,document.scrollingElement,document.documentElement];function xe(e,t){let l=oe(t);if(l===void 0){if(e==null)return window;l=e.closest(".scroll,.scroll-y,.overflow-auto")}return re.includes(l)?window:l}function se(e){return e===window?window.pageYOffset||window.scrollY||document.body.scrollTop||0:e.scrollTop}function ae(e){return e===window?window.pageXOffset||window.scrollX||document.body.scrollLeft||0:e.scrollLeft}let x;function _e(){if(x!==void 0)return x;const e=document.createElement("p"),t=document.createElement("div");$(e,{width:"100%",height:"200px"}),$(t,{position:"absolute",top:"0px",left:"0px",visibility:"hidden",width:"200px",height:"150px",overflow:"hidden"}),t.appendChild(e),document.body.appendChild(t);const l=e.offsetWidth;t.style.overflow="scroll";let o=e.offsetWidth;return l===o&&(o=t.clientWidth),t.remove(),x=l-o,x}function ue(e,t=!0){return!e||e.nodeType!==Node.ELEMENT_NODE?!1:t?e.scrollHeight>e.clientHeight&&(e.classList.contains("scroll")||e.classList.contains("overflow-auto")||["auto","scroll"].includes(window.getComputedStyle(e)["overflow-y"])):e.scrollWidth>e.clientWidth&&(e.classList.contains("scroll")||e.classList.contains("overflow-auto")||["auto","scroll"].includes(window.getComputedStyle(e)["overflow-x"]))}let y=0,B,V,q,P=!1,U,z,X,w=null;function ce(e){de(e)&&N(e)}function de(e){if(e.target===document.body||e.target.classList.contains("q-layout__backdrop"))return!0;const t=J(e),l=e.shiftKey&&!e.deltaX,o=!l&&Math.abs(e.deltaX)<=Math.abs(e.deltaY),n=l||o?e.deltaY:e.deltaX;for(let c=0;c<t.length;c++){const s=t[c];if(ue(s,o))return o?n<0&&s.scrollTop===0?!0:n>0&&s.scrollTop+s.clientHeight===s.scrollHeight:n<0&&s.scrollLeft===0?!0:n>0&&s.scrollLeft+s.clientWidth===s.scrollWidth}return!0}function Y(e){e.target===document&&(document.scrollingElement.scrollTop=document.scrollingElement.scrollTop)}function _(e){P!==!0&&(P=!0,requestAnimationFrame(()=>{P=!1;const{height:t}=e.target,{clientHeight:l,scrollTop:o}=document.scrollingElement;(q===void 0||t!==window.innerHeight)&&(q=l-t,document.scrollingElement.scrollTop=o),o>q&&(document.scrollingElement.scrollTop-=Math.ceil((o-q)/8))}))}function K(e){const t=document.body,l=window.visualViewport!==void 0;if(e==="add"){const{overflowY:o,overflowX:n}=window.getComputedStyle(t);B=ae(window),V=se(window),U=t.style.left,z=t.style.top,X=window.location.href,t.style.left=`-${B}px`,t.style.top=`-${V}px`,n!=="hidden"&&(n==="scroll"||t.scrollWidth>window.innerWidth)&&t.classList.add("q-body--force-scrollbar-x"),o!=="hidden"&&(o==="scroll"||t.scrollHeight>window.innerHeight)&&t.classList.add("q-body--force-scrollbar-y"),t.classList.add("q-body--prevent-scroll"),document.qScrollPrevented=!0,b.is.ios===!0&&(l===!0?(window.scrollTo(0,0),window.visualViewport.addEventListener("resize",_,m.passiveCapture),window.visualViewport.addEventListener("scroll",_,m.passiveCapture),window.scrollTo(0,0)):window.addEventListener("scroll",Y,m.passiveCapture))}b.is.desktop===!0&&b.is.mac===!0&&window[`${e}EventListener`]("wheel",ce,m.notPassive),e==="remove"&&(b.is.ios===!0&&(l===!0?(window.visualViewport.removeEventListener("resize",_,m.passiveCapture),window.visualViewport.removeEventListener("scroll",_,m.passiveCapture)):window.removeEventListener("scroll",Y,m.passiveCapture)),t.classList.remove("q-body--prevent-scroll"),t.classList.remove("q-body--force-scrollbar-x"),t.classList.remove("q-body--force-scrollbar-y"),document.qScrollPrevented=!1,t.style.left=U,t.style.top=z,window.location.href===X&&window.scrollTo(B,V),q=void 0)}function fe(e){let t="add";if(e===!0){if(y++,w!==null){clearTimeout(w),w=null;return}if(y>1)return}else{if(y===0||(y--,y>0))return;if(t="remove",b.is.ios===!0&&b.is.nativeMobile===!0){w!==null&&clearTimeout(w),w=setTimeout(()=>{K(t),w=null},100);return}}K(t)}function Ce(){let e;return{preventBodyScroll(t){t!==e&&(e!==void 0||t===!0)&&(e=t,fe(t))}}}function Be(){if(window.getSelection!==void 0){const e=window.getSelection();e.empty!==void 0?e.empty():e.removeAllRanges!==void 0&&(e.removeAllRanges(),Z.is.mobile!==!0&&e.addRange(document.createRange()))}else document.selection!==void 0&&document.selection.empty()}function Ve(e,t,l){return l<=t?t:Math.min(l,Math.max(t,e))}function Pe(e,t,l){if(l<=t)return t;const o=l-t+1;let n=t+(e-t)%o;return n<t&&(n=o+n),n===0?0:n}export{qe as Q,Se as a,ke as b,Be as c,Le as d,Ve as e,Ce as f,xe as g,se as h,ae as i,_e as j,he as k,ye as l,ge as m,Pe as n,Te as s,Ee as u};