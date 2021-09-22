const e=Symbol("Comlink.proxy"),t=Symbol("Comlink.endpoint"),o=Symbol("Comlink.releaseProxy"),n=Symbol("Comlink.thrown"),r=e=>"object"==typeof e&&null!==e||"function"==typeof e,s=new Map([["proxy",{canHandle:t=>r(t)&&t[e],serialize(e){const{port1:t,port2:o}=new MessageChannel;return a(e,t),[o,[o]]},deserialize(e){return e.start(),c(e,[],t);var t}}],["throw",{canHandle:e=>r(e)&&n in e,serialize({value:e}){let t;return t=e instanceof Error?{isError:!0,value:{message:e.message,name:e.name,stack:e.stack}}:{isError:!1,value:e},[t,[]]},deserialize(e){if(e.isError)throw Object.assign(new Error(e.value.message),e.value);throw e.value}}]]);function a(t,o=self){o.addEventListener("message",(function r(s){if(!s||!s.data)return;const{id:l,type:c,path:u}=Object.assign({path:[]},s.data),p=(s.data.argumentList||[]).map(m);let g;try{const o=u.slice(0,-1).reduce(((e,t)=>e[t]),t),n=u.reduce(((e,t)=>e[t]),t);switch(c){case"GET":g=n;break;case"SET":o[u.slice(-1)[0]]=m(s.data.value),g=!0;break;case"APPLY":g=n.apply(o,p);break;case"CONSTRUCT":g=function(t){return Object.assign(t,{[e]:!0})}(new n(...p));break;case"ENDPOINT":{const{port1:e,port2:o}=new MessageChannel;a(t,o),g=function(e,t){return d.set(e,t),e}(e,[e])}break;case"RELEASE":g=void 0;break;default:return}}catch(e){g={value:e,[n]:0}}Promise.resolve(g).catch((e=>({value:e,[n]:0}))).then((e=>{const[t,n]=f(e);o.postMessage(Object.assign(Object.assign({},t),{id:l}),n),"RELEASE"===c&&(o.removeEventListener("message",r),i(o))}))})),o.start&&o.start()}function i(e){(function(e){return"MessagePort"===e.constructor.name})(e)&&e.close()}function l(e){if(e)throw new Error("Proxy has been released and is not useable")}function c(e,n=[],r=function(){}){let s=!1;const a=new Proxy(r,{get(t,r){if(l(s),r===o)return()=>p(e,{type:"RELEASE",path:n.map((e=>e.toString()))}).then((()=>{i(e),s=!0}));if("then"===r){if(0===n.length)return{then:()=>a};const t=p(e,{type:"GET",path:n.map((e=>e.toString()))}).then(m);return t.then.bind(t)}return c(e,[...n,r])},set(t,o,r){l(s);const[a,i]=f(r);return p(e,{type:"SET",path:[...n,o].map((e=>e.toString())),value:a},i).then(m)},apply(o,r,a){l(s);const i=n[n.length-1];if(i===t)return p(e,{type:"ENDPOINT"}).then(m);if("bind"===i)return c(e,n.slice(0,-1));const[d,f]=u(a);return p(e,{type:"APPLY",path:n.map((e=>e.toString())),argumentList:d},f).then(m)},construct(t,o){l(s);const[r,a]=u(o);return p(e,{type:"CONSTRUCT",path:n.map((e=>e.toString())),argumentList:r},a).then(m)}});return a}function u(e){const t=e.map(f);return[t.map((e=>e[0])),(o=t.map((e=>e[1])),Array.prototype.concat.apply([],o))];var o}const d=new WeakMap;function f(e){for(const[t,o]of s)if(o.canHandle(e)){const[n,r]=o.serialize(e);return[{type:"HANDLER",name:t,value:n},r]}return[{type:"RAW",value:e},d.get(e)||[]]}function m(e){switch(e.type){case"HANDLER":return s.get(e.name).deserialize(e.value);case"RAW":return e.value}}function p(e,t,o){return new Promise((n=>{const r=new Array(4).fill(0).map((()=>Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16))).join("-");e.addEventListener("message",(function t(o){o.data&&o.data.id&&o.data.id===r&&(e.removeEventListener("message",t),n(o.data))})),e.start&&e.start(),e.postMessage(Object.assign({id:r},t),o)}))}const g={tools:[],config:{},files:[],fs:{},async init(){if(g.tools.length<2)throw"Expecting at least 1 tool.";const e=g.tools[0];return await this._setup(e,!0),e.module.FS.mkdir(g.config.dirData,511),e.module.FS.mkdir(g.config.dirMounted,511),e.module.FS.chdir(g.config.dirData),g.fs=e.module.FS,await Promise.all(g.tools.map((e=>this._setup(e)))),await this._setupFS(),g._log("Ready"),!0},mount(e){const t=g.config.dirData,o=g.config.dirShared,n=g.config.dirMounted;let r=[],s=[];e?.length&&"string"!=typeof e||(e=[e]),g._log(`Mounting ${e.length} files`);for(let o of e)if(o instanceof File||o?.data instanceof Blob&&o.name)r.push(o),s.push(o.name);else{if("string"!=typeof o||!o.startsWith("http"))throw"Cannot mount file(s) specified. Must be a File, Blob, or a URL string.";{const e=o.split("//").pop().replace(/\//g,"-");g.fs.createLazyFile(t,e,o,!0,!0),s.push(e)}}try{g.fs.unmount(n)}catch(e){}return g.files=g.files.concat(r),g.fs.mount(g.tools[0].module.WORKERFS,{files:g.files.filter((e=>e instanceof File)),blobs:g.files.filter((e=>e?.data instanceof Blob))},n),r.map((e=>{const r=`${o}${n}/${e.name}`,s=`${o}${t}/${e.name}`;try{g.tools[1].module.FS.unlink(s)}catch(e){}g._log(`Creating symlink: ${s} --\x3e ${r}`),g.tools[1].module.FS.symlink(r,s)})),s.map((e=>`${o}${t}/${e}`))},async exec(e,t=null){if(g._log(`Executing %c${e}%c args=${t}`,"color:darkblue; font-weight:bold",""),!e)throw"Expecting a command";let o=e;null==t&&(t=e.split(" "),o=t.shift());const n=g.tools.filter((e=>e.program==o));if(0==n.length)throw`Program ${o} not found.`;const r=n[0];r.stdout="",r.stderr="",r.module.callMain(t);try{r.module.FS.close(r.module.FS.streams[1]),r.module.FS.close(r.module.FS.streams[2])}catch(e){}return r.module.FS.streams[1]=r.module.FS.open("/dev/stdout","w"),r.module.FS.streams[2]=r.module.FS.open("/dev/stderr","w"),g.config.printInterleaved?r.stdout:{stdout:r.stdout,stderr:r.stderr}},cat:e=>g._fileop("cat",e),ls:e=>g._fileop("ls",e),download:e=>g._fileop("download",e),async _setup(e,t=!1){if(!e.ready){if(e.urlPrefix||(e.urlPrefix=`${g.config.urlCDN}/${e.tool}/${e.version}`),e.program||(e.program=e.tool),!t){const t=await fetch(`${e.urlPrefix}/config.json`).then((e=>e.json()));t["wasm-features"]?.includes("simd")&&!await(async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,10,1,8,0,65,0,253,15,253,98,11])))()&&(console.warn(`[biowasm] SIMD is not supported in this browser. Loading slower non-SIMD version of ${e.program}.`),e.program+="-nosimd"),t["wasm-features"]?.includes("threads")&&!await(async e=>{try{return"undefined"!=typeof MessageChannel&&(new MessageChannel).port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(e)}catch(e){return!1}})(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]))&&(console.warn(`[biowasm] Threads are not supported in this browser. Loading slower non-threaded version of ${e.program}.`),e.program+="-nothreads")}if(self.importScripts(`${e.urlPrefix}/${e.program}.js`),e.module=await Module({thisProgram:e.program,locateFile:(t,o)=>`${e.urlPrefix}/${t}`,print:t=>e.stdout+=`${t}\n`,printErr:g.config.printInterleaved?t=>e.stdout+=`${t}\n`:t=>e.stderr+=`${t}\n`}),!t){const t=e.module.FS;t.mkdir(g.config.dirShared),t.mount(e.module.PROXYFS,{root:"/",fs:g.fs},g.config.dirShared),t.chdir(`${g.config.dirShared}${g.config.dirData}`)}e.stdout="",e.stderr="",e.ready=!0}},async _setupFS(){for(let e in g.tools)if(0!=e)for(let t in g.tools){if(0==t||e==t)continue;const o=g.tools[e].module.FS,n=g.tools[t].module.FS,r=`/${g.tools[e].tool}`;o.analyzePath(r).exists&&!n.analyzePath(r).exists&&(g._log(`Mounting ${r} onto ${g.tools[t].tool} filesystem`),n.mkdir(r),n.mount(g.tools[0].module.PROXYFS,{root:r,fs:o},r))}},_fileop(e,t){g._log(`Running ${e} ${t}`);const o=g.tools[1].module.FS,n=o.analyzePath(t);if(!n.exists)return g._log(`File ${t} not found.`),!1;switch(e){case"cat":return o.readFile(t,{encoding:"utf8"});case"ls":return o.isFile(n.object.mode)?o.stat(t):o.readdir(t);case"download":const e=new Blob([this.cat(t)]);return URL.createObjectURL(e)}return!1},_log(e){if(!g.config.debug)return;let t=[...arguments];t.shift(),console.log(`%c[WebWorker]%c ${e}`,"font-weight:bold","",...t)}};a(g);
