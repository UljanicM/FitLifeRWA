import{Q as d}from"./QInput.670d7c47.js";import{Q as V}from"./QBtn.1786d8b2.js";import{Q as f}from"./QBanner.402d4dfb.js";import{Q as k,a as b}from"./QCard.2e234736.js";import{Q as _}from"./QPage.32e5fb9e.js";import{_ as N}from"./plugin-vue_export-helper.21dcd24c.js";import{r,F as u,G as c,H as n,I as s,K as w,J as v,O as p,aa as g}from"./index.e50bee54.js";import"./use-key-composition.142d9081.js";import"./vm.1ac4b770.js";import"./use-dark.0f7cd856.js";import"./render.ccdd95ed.js";const Q={name:"RegistracijaPage",setup(){const o=r(""),a=r(""),t=r(""),e=r(""),i=r(""),m=r(""),l=r("");return{firstName:o,lastName:a,username:t,password:e,confirmPassword:i,registerUser:()=>{if(m.value="",l.value="",!o.value||!a.value||!t.value||!e.value||!i.value){m.value="Molimo unesite ime, prezime, korisni\u010Dko ime, lozinku i potvrdu lozinke.";return}if(e.value!==i.value){m.value="Lozinke nisu iste.";return}console.log("Korisnik registriran:",{firstName:o.value,lastName:a.value,username:t.value,password:e.value}),l.value="Registracija uspje\u0161na! Sada se mo\u017Eete prijaviti.",o.value="",a.value="",t.value="",e.value="",i.value=""},errorMessage:m,successMessage:l}}};function q(o,a,t,e,i,m){return u(),c(_,{padding:""},{default:n(()=>[s(b,{class:"q-pa-md",bordered:""},{default:n(()=>[s(k,null,{default:n(()=>[a[5]||(a[5]=w("div",{class:"text-h6 text-center q-mb-md"},"Registracija",-1)),s(d,{modelValue:e.firstName,"onUpdate:modelValue":a[0]||(a[0]=l=>e.firstName=l),label:"Ime",filled:"",class:"q-mb-md",dense:!0},null,8,["modelValue"]),s(d,{modelValue:e.lastName,"onUpdate:modelValue":a[1]||(a[1]=l=>e.lastName=l),label:"Prezime",filled:"",class:"q-mb-md",dense:!0},null,8,["modelValue"]),s(d,{modelValue:e.username,"onUpdate:modelValue":a[2]||(a[2]=l=>e.username=l),label:"Korisni\u010Dko ime",filled:"",class:"q-mb-md",dense:!0},null,8,["modelValue"]),s(d,{modelValue:e.password,"onUpdate:modelValue":a[3]||(a[3]=l=>e.password=l),label:"Lozinka",type:"password",filled:"",class:"q-mb-md",dense:!0},null,8,["modelValue"]),s(d,{modelValue:e.confirmPassword,"onUpdate:modelValue":a[4]||(a[4]=l=>e.confirmPassword=l),label:"Potvrdi lozinku",type:"password",filled:"",class:"q-mb-md",dense:!0},null,8,["modelValue"]),s(V,{onClick:e.registerUser,label:"Registriraj se",color:"primary",class:"full-width q-mt-md"},null,8,["onClick"]),e.errorMessage?(u(),c(f,{key:0,class:"q-mt-md",color:"negative",dense:""},{default:n(()=>[v(p(e.errorMessage),1)]),_:1})):g("",!0),e.successMessage?(u(),c(f,{key:1,class:"q-mt-md",color:"positive",dense:""},{default:n(()=>[v(p(e.successMessage),1)]),_:1})):g("",!0)]),_:1})]),_:1})]),_:1})}var S=N(Q,[["render",q],["__scopeId","data-v-51260c59"]]);export{S as default};