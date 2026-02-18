import"./modulepreload-polyfill-B5Qt9EMX.js";const y="https://shashiniphotogrphy-production.up.railway.app/api",x="https://script.google.com/macros/s/AKfycbymHcV4JOdFk5geINGLBPe0SUPV3quv2TL0yKs8nX2AzAGuf0Ika-0WY8A8wkWzV06Y/exec";window.onerror=function(t){return console.error("[Admin Shield]",t),!0};window.onunhandledrejection=function(t){console.error("[Admin Shield] Rejection",t.reason)};function v(t){return t?t.startsWith("http")||t.startsWith("data:")||t.startsWith("./")||t.startsWith("../")?t:t.startsWith("/")?y+t:y+"/"+t:""}function d(t,e="success"){const o=document.createElement("div");o.style.cssText=`
        position: fixed;
        top: 100px;
        right: 30px;
        background: ${e==="success"?"linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)":"linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)"};
        color: white;
        padding: 16px 24px;
        border-radius: 15px;
        font-size: 13px;
        font-weight: 600;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `,o.textContent=t,document.body.appendChild(o),setTimeout(()=>{o.style.animation="slideOutRight 0.3s ease-out",setTimeout(()=>o.remove(),300)},3e3)}window.copyToClipboard=(t,e="Content")=>{navigator.clipboard.writeText(t).then(()=>{d(`✓ ${e} copied!`,"success")}).catch(o=>{d("Failed to copy","error")})};let a={activeTab:"overview",vaults:[],selections:[],bookings:[],eventTypes:[],cms:{items:[],hero:{slides:[],interval:5},graphics:{}},messages:[],vaultSearch:"",vaultFilter:"all",vaultDateFilter:"all",viewMode:"list",currentPage:1,itemsPerPage:9,bookingSearch:"",bookingFilter:"all",messageSearch:"",messageFilter:"all"};async function B(){if(sessionStorage.getItem("adminLoggedIn")!=="true"){window.location.href="./index.html";return}A(),z(),window.innerWidth<768&&(a.viewMode="cards"),await b(),h(),C(),setInterval(async()=>{console.log("[Admin] Auto-refreshing data..."),await b(),h()},3e4),window.addEventListener("scroll",()=>{document.body.classList.toggle("scrolled",window.scrollY>50)})}function C(){console.log("[Admin] Setting up mobile menu...");const t=document.getElementById("hamburger-btn"),e=document.getElementById("close-menu-btn"),o=document.getElementById("mobile-menu"),i=document.querySelectorAll(".mobile-nav-link"),r=document.getElementById("mobile-theme-toggle");r&&(r.onclick=n=>{n.stopPropagation(),window.toggleTheme()}),t&&o?t.onclick=n=>{n.stopPropagation(),console.log("[Admin] Hamburger clicked"),o.classList.add("active")}:console.warn("[Admin] Hamburger or menu element missing:",{ham:t,menu:o}),e&&o&&(e.onclick=()=>o.classList.remove("active")),i&&o&&i.forEach(n=>{n.onclick=l=>{const s=l.currentTarget.dataset.tab;s&&(switchTab(s),o.classList.remove("active"))}}),document.addEventListener("click",n=>{o&&o.classList.contains("active")&&!o.contains(n.target)&&n.target!==t&&o.classList.remove("active")})}async function b(){const t=async(e,o)=>{const i=new AbortController,r=setTimeout(()=>i.abort(),2e4);try{const n=await fetch(e,{signal:i.signal});if(clearTimeout(r),!n.ok)throw new Error(`HTTP ${n.status}`);return await n.json()}catch(n){clearTimeout(r);const l=n.name==="AbortError";return console.error(`[Admin Sync] ${o} failed:`,l?"Timeout":n.message),d(l?`Sync delayed: ${o} (Google is slow)`:`Sync issue: ${o}`,"error"),[]}};try{const e=Date.now(),[o,i,r,n,l]=await Promise.all([t(`${y}/vaults?sync=true&t=${e}`,"Vaults"),t(`${y}/vaults/selections?t=${e}`,"Selections"),t(`${y}/bookings?sync=true&t=${e}`,"Bookings"),t(`${y}/bookings/event-types?t=${e}`,"EventTypes"),t(`${y}/messages?sync=true&t=${e}`,"Messages")]),s=await fetch(`${x}?action=getCMS&t=${e}`).then(c=>c.json()).catch(async c=>(console.warn("[CMS Sync] Sheet unreachable, checking local fallback:",c),await t(`${y}/cms?t=${e}`,"CMS (Local Fallback)")));a.vaults=Array.isArray(o)?o:[],a.selections=Array.isArray(i)?i:[],s&&typeof s=="object"?(a.cms={items:s.items||[],hero:s.hero||{slides:[],interval:5},graphics:s.graphics||{}},console.log("[CMS Sync] Data synchronized from Master Source.")):a.cms=a.cms||{items:[],hero:{slides:[],interval:5},graphics:{}},a.bookings=Array.isArray(r)?r:[],a.eventTypes=Array.isArray(n)?n:[],a.messages=Array.isArray(l)?l:[],a.sheetVaults=Array.isArray(o)?o:[]}catch(e){console.error("Data refresh failed:",e),alert(`Backend Connection Error: ${e.message}. Ensure backend is running on port 5001.`)}}function A(){document.querySelectorAll(".nav-tab").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault();const o=t.dataset.tab;a.activeTab=o,document.querySelectorAll(".nav-tab").forEach(i=>i.classList.toggle("active",i.dataset.tab===o)),document.querySelectorAll(".tab-content").forEach(i=>i.classList.toggle("active",i.id===o)),h()})})}function z(){const t=document.querySelector(".theme-toggle");localStorage.getItem("theme")==="dark"&&document.body.classList.add("dark-mode"),t&&(window.toggleTheme=()=>{document.body.classList.toggle("dark-mode");const u=document.body.classList.contains("dark-mode")?"dark":"light";localStorage.setItem("theme",u)},t&&(t.onclick=window.toggleTheme));const o=document.getElementById("save-link");o&&(o.onclick=D);const i=document.getElementById("cms-add");i&&(i.onclick=N);const r=document.getElementById("cms-add-youtube");r&&(r.onclick=window.addYouTubeCMS),j();const n=document.getElementById("open-link_vault_btn");n&&(n.onclick=()=>{document.getElementById("vault-modal").style.display="flex"}),window.onclick=u=>{u.target.className==="modal-overlay"&&(u.target.style.display="none")};const l=document.getElementById("vault-search");l&&(l.oninput=u=>{a.vaultSearch=u.target.value.toLowerCase(),k()});const s=document.getElementById("vault-status-filter");s&&(s.onchange=u=>{a.vaultFilter=u.target.value,k()});const c=document.getElementById("vault-date-filter");c&&(c.onchange=u=>{a.vaultDateFilter=u.target.value,k()});const g=document.getElementById("booking-search");g&&(g.oninput=u=>{a.bookingSearch=u.target.value.toLowerCase(),I()});const p=document.getElementById("booking-status-filter");p&&(p.onchange=u=>{a.bookingFilter=u.target.value,I()});const m=document.getElementById("message-search");m&&(m.oninput=u=>{a.messageSearch=u.target.value.toLowerCase(),$()});const f=document.getElementById("message-status-filter");f&&(f.onchange=u=>{a.messageFilter=u.target.value,$()})}function h(){P(),k(),I(),F(),$(),M()}function M(){["link-session-type","edit-vault-type","edit-booking-type"].forEach(e=>{const o=document.getElementById(e);if(o){const i=o.value,r=a.eventTypes.filter(n=>n);o.innerHTML=r.map(n=>`<option value="${n}">${n}</option>`).join(""),r.includes(i)?o.value=i:r.length>0&&(o.value=r[0])}}),document.getElementById("vault-status-filter")}function P(){const t=document.getElementById("overview-stats-grid");if(t){const r=[{label:"Active Vaults",value:a.vaults.length,icon:"🎞️",sub:`${new Set(a.vaults.map(n=>n.customerMobile)).size} Clients`,tab:"vaults"},{label:"New Enquiries",value:a.messages.filter(n=>!n.read).length,icon:"✉️",sub:"Inbox Activity",tab:"messages"},{label:"Studio CMS",value:a.cms.length,icon:"📸",sub:"Active Photos",tab:"cms"}];t.innerHTML=r.map(n=>`
            <div class="stat-card" onclick="window.switchTab('${n.tab}')" style="cursor: pointer; padding: 25px; border-radius: 25px; background: var(--white); border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.02); transition: all 0.3s;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <span style="font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: 2px; text-transform: uppercase;">${n.label}</span>
                    <span style="font-size: 20px;">${n.icon}</span>
                </div>
                <div class="stat-value" style="font-size: 32px; font-weight: 800; margin: 0 0 5px 0;">${n.value}</div>
                <p style="font-size: 11px; color: #aaa; font-weight: 600; margin: 0;">${n.sub}</p>
            </div>
        `).join("")}const e=document.getElementById("recent-activity-feed");if(e){const r=[...a.messages.map(n=>({...n,type:"Message",icon:"✉️",color:"rgba(184, 156, 125, 0.1)",view:"messages",title:n.sender,sub:n.text,date:n.timestamp})),...a.cms.hero.slides.map(n=>({...n,type:"Hero Slide",icon:"🖼️",color:"rgba(52, 152, 219, 0.1)",view:"cms",title:n.title||"New Hero Media",sub:"Updated Home Banner",date:parseInt(n.id)})),...a.cms.items.slice(0,10).map(n=>({...n,type:"Gallery",icon:"🎨",color:"rgba(46, 204, 113, 0.1)",view:"cms",title:n.title,sub:"New Master Exhibition Piece",date:parseInt(n.id)}))].sort((n,l)=>new Date(l.date||l.timestamp||l.createdAt)-new Date(n.date||n.timestamp||n.createdAt)).slice(0,8);r.length===0?e.innerHTML='<div style="text-align:center; padding: 40px; color: #ccc;">No current studio activity logged.</div>':e.innerHTML=r.map(n=>{const l=new Date(n.timestamp||n.createdAt||Date.now()),s=isNaN(l.getTime())?"Recently":l.toLocaleDateString(void 0,{day:"numeric",month:"short"});return`
                <div onclick="window.switchTab('${n.view}')" style="display: flex; align-items: center; gap: 20px; padding: 20px; border-radius: 20px; background: #fafafa; border: 1px solid #f0f0f0; cursor: pointer; transition: all 0.3s;">
                    <div style="width: 45px; height: 45px; border-radius: 12px; background: ${n.color}; color: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">${n.icon}</div>
                    <div style="flex:1; min-width: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                            <span style="font-weight: 800; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-primary);">${n.title||"Unknown"}</span>
                            <span style="font-size: 9px; font-weight: 700; color: #bbb; text-transform: uppercase; white-space: nowrap;">${s}</span>
                        </div>
                        <span style="display: block; font-size: 11px; color: #777; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${(n.type||"Activity").toUpperCase()} • "${n.sub||"..."}"</span>
                    </div>
                </div>
            `}).join("")}const o=document.getElementById("next-session-focus");o&&(a.bookings.filter(r=>r.status==="confirmed"&&new Date(r.date)>=new Date().setHours(0,0,0,0)).sort((r,n)=>new Date(r.date)-new Date(n.date))[0],o.innerHTML=`
            <div class="card" style="padding: 40px; border-radius: 40px; background: linear-gradient(135deg, #2c3e50 0%, #000000 100%); color: white; border: none; box-shadow: 0 30px 60px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; text-align: center;">
                <div>
                    <span style="display: inline-block; padding: 6px 15px; background: rgba(255,255,255,0.1); border-radius: 20px; font-size: 9px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 25px;">STUDIO MANAGEMENT</span>
                    <h3 style="font-family: 'Metropolis', sans-serif; font-size: 24px; margin: 0 0 20px 0;">External Scheduling Active</h3>
                    <p style="font-size: 13px; opacity: 0.7; max-width: 300px;">Manage all upcoming studio sessions and availability in the Cal.com dashboard.</p>
                </div>
            </div>
        `);const i=document.getElementById("studio-quick-summary");if(i){const r=a.vaults.filter(l=>l.workflowStatus==="pending"||!l.workflowStatus).length,n=a.messages.filter(l=>!l.read).length;a.bookings.filter(l=>l.status==="pending").length,i.innerHTML=`
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: rgba(231, 76, 60, 0.05); border-radius: 15px; border: 1px solid rgba(231, 76, 60, 0.1);">
                    <span style="font-size: 12px; font-weight: 700; color: #E74C3C;">Unread Enquiries</span>
                    <span style="font-size: 14px; font-weight: 800; color: #E74C3C;">${n}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: rgba(184, 156, 125, 0.05); border-radius: 15px; border: 1px solid rgba(184, 156, 125, 0.1);">
                    <span style="font-size: 12px; font-weight: 700; color: var(--accent);">Active Vaults</span>
                    <span style="font-size: 14px; font-weight: 800; color: var(--accent);">${r}</span>
                </div>
            </div>
        `}}window.switchTab=t=>{a.activeTab=t,document.querySelectorAll(".nav-tab").forEach(e=>e.classList.toggle("active",e.dataset.tab===t)),document.querySelectorAll(".tab-content").forEach(e=>e.classList.toggle("active",e.id===t)),h(),window.scrollTo({top:0,behavior:"smooth"})};window.setViewMode=t=>{a.viewMode=t,document.querySelectorAll(".view-toggle-btn").forEach(e=>{e.classList.toggle("active",e.innerText.toLowerCase()===t)}),k()};function k(){const t=document.getElementById("vaults-container");if(!t)return;let e=a.vaults;a.vaultSearch&&(e=e.filter(s=>s.customerMobile.includes(a.vaultSearch)||s.sessionTitle.toLowerCase().includes(a.vaultSearch)||s.customerName&&s.customerName.toLowerCase().includes(a.vaultSearch)||s.vaultId.toLowerCase().includes(a.vaultSearch))),a.vaultFilter!=="all"&&(e=e.filter(s=>{const c=a.selections.find(m=>m.vaultId===s.vaultId&&m.mobile===s.customerMobile),g=c&&c.finalized;let p=s.workflowStatus||(g?"finalized":s.status);return p==="active"&&(p="pending"),p===a.vaultFilter})),a.vaultDateFilter==="newest"?e.sort((s,c)=>new Date(c.id*1||0)-new Date(s.id*1||0)):a.vaultDateFilter==="oldest"&&e.sort((s,c)=>new Date(s.id*1||0)-new Date(c.id*1||0));const o=Math.ceil(e.length/a.itemsPerPage);a.currentPage>o&&(a.currentPage=o||1);const i=(a.currentPage-1)*a.itemsPerPage,r=e.slice(i,i+a.itemsPerPage);if(e.length===0){t.innerHTML=`
            <div style="text-align: center; padding: 100px; color: #999; background: #fff; border-radius: 20px;">
                <p style="font-size: 48px; margin-bottom: 20px;">📂</p>
                <p style="font-size: 14px; font-weight: 700;">No collections found matching your criteria</p>
            </div>
        `;return}let n="";a.viewMode==="list"?n=`
        <table class="admin-table">
            <thead>
                <tr>
                    <th style="width: 40px;"><input type="checkbox" class="admin-checkbox"></th>
                    <th>Content</th>
                    <th>Date</th>
                    <th>Client Mobile</th>
                    <th>Link</th>
                    <th>Status</th>
                    <th style="text-align: right;">Action</th>
                </tr>
            </thead>
            <tbody>
                ${r.map(s=>{const c=a.selections.find(E=>E.vaultId===s.vaultId&&E.mobile===s.customerMobile),p=c&&c.finalized?"finalized":s.status==="active"?"pending":s.status,m=s.workflowStatus||p,f=new Date(parseInt(s.id)).toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"numeric"}),u=new Date(parseInt(s.id)).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1});return`
                        <tr>
                            <td><input type="checkbox" class="admin-checkbox"></td>
                            <td>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="width: 36px; height: 36px; border-radius: 8px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                        <span style="font-size: 16px;">🖼️</span>
                                    </div>
                                    <div style="display: flex; flex-direction: column;">
                                        <div style="display: flex; align-items: center; gap: 5px;">
                                            <span style="font-weight: 800; color: #111;">${s.customerName||"No Name"}</span>
                                            <span style="font-size: 9px; font-weight: 800; color: var(--accent); background: #FFF4E5; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">${s.sessionType||"Portrait"}</span>
                                        </div>
                                        <span style="font-size: 11px; font-weight: 600; color: #333;">${s.sessionTitle}</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div style="font-size: 12px; font-weight: 600; color: #111;">${f}</div>
                                <div style="font-size: 10px; color: #555;">${u}</div>
                            </td>
                            <td>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-weight: 600; color: #111;">${s.customerMobile}</span>
                                    <button class="copy-btn-mini" onclick="window.copyToClipboard('${s.customerMobile}', 'Mobile Number')" title="Copy Mobile">📋</button>
                                </div>
                            </td>
                            <td>
                                <a href="javascript:void(0)" onclick="window.viewSelection('${s.vaultId}', '${s.customerMobile}')" class="manage-link">Manage</a>
                            </td>
                            <td>
                                <select class="status-pill ${m}" 
                                        onchange="this.className='status-pill ' + this.value; window.updateWorkflowStatus('${s.id}', this.value)"
                                        style="font-family: 'Metropolis', sans-serif; padding-right: 30px;">
                                    <option value="pending" ${m==="pending"?"selected":""}>Selection in Progress</option>
                                    <option value="finalized" ${m==="finalized"?"selected":""}>Finalized</option>
                                    <option value="albumpending" ${m==="albumpending"?"selected":""}>Album in Progress</option>
                                    <option value="albumcompleted" ${m==="albumcompleted"?"selected":""}>Album Completed</option>
                                    <option value="delivered" ${m==="delivered"?"selected":""}>Delivered</option>
                                </select>
                            </td>
                            <td style="text-align: right;">
                                <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
                                    <button onclick="window.toggleVaultLock('${s.id}')" 
                                            style="padding: 6px 12px; border-radius: 8px; border: none; font-size: 9px; font-weight: 800; cursor: pointer; background: ${s.status==="locked"?"#FFEBEE":"#E8F5E9"}; color: ${s.status==="locked"?"#F44336":"#4CAF50"};">
                                        ${s.status==="locked"?"LOCKED":"ACTIVE"}
                                    </button>
                                    <div class="dot-menu">
                                        <button class="action-dot-btn">•••</button>
                                        <div class="dot-menu-content">
                                            <div class="dot-menu-item" onclick="window.editVault('${s.id}')"><span>✏️</span> Edit Details</div>
                                            <div class="dot-menu-item delete" onclick="window.deleteVault('${s.id}')"><span>🗑️</span> Delete Collection</div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    `}).join("")}
            </tbody>
        </table>`:n=`
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
            ${r.map(s=>{const c=a.selections.find(f=>f.vaultId===s.vaultId&&f.mobile===s.customerMobile),g=c&&c.finalized,p=s.workflowStatus||(g?"finalized":"pending"),m=new Date(parseInt(s.id)).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});return`
                <div class="card" style="padding: 20px; border-radius: 20px; background: white; border: 1px solid var(--border-color); transition: all 0.3s ease;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                        <span style="font-size: 10px; font-weight: 800; color: var(--accent); background: #FFF4E5; padding: 4px 10px; border-radius: 6px; text-transform: uppercase;">${s.sessionType||"Portrait"}</span>
                        <div class="dot-menu">
                             <button class="action-dot-btn">•••</button>
                             <div class="dot-menu-content">
                                 <div class="dot-menu-item" onclick="window.editVault('${s.id}')"><span>✏️</span> Edit Details</div>
                                 <div class="dot-menu-item delete" onclick="window.deleteVault('${s.id}')"><span>🗑️</span> Delete Collection</div>
                             </div>
                        </div>
                    </div>
                    
                    <h3 style="font-size: 18px; margin-bottom: 5px;">${s.sessionTitle}</h3>
                    <p style="color: #666; font-size: 13px; margin-bottom: 20px;">${s.customerName}</p>
                    
                    <div style="display: flex; gap: 15px; margin-bottom: 20px; font-size: 12px; color: #888; align-items: center;">
                        <span style="display: flex; align-items: center; gap: 5px;">📅 ${m}</span>
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <span>📱 ${s.customerMobile}</span>
                            <button class="copy-btn-mini" onclick="window.copyToClipboard('${s.customerMobile}', 'Mobile Number')" title="Copy Mobile">📋</button>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                        <select class="status-pill ${p}" 
                                onchange="this.className='status-pill ' + this.value; window.updateWorkflowStatus('${s.id}', this.value)"
                                style="font-size: 11px; padding: 6px 12px;">
                            <option value="pending" ${p==="pending"?"selected":""}>Pending</option>
                            <option value="finalized" ${p==="finalized"?"selected":""}>Finalized</option>
                            <option value="albumpending" ${p==="albumpending"?"selected":""}>In Progress</option>
                            <option value="albumcompleted" ${p==="albumcompleted"?"selected":""}>Done</option>
                            <option value="delivered" ${p==="delivered"?"selected":""}>Delivered</option>
                        </select>
                        <button onclick="window.viewSelection('${s.vaultId}', '${s.customerMobile}')" 
                                style="background: var(--text-primary); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;">
                            Manage
                        </button>
                    </div>
                </div>
            `}).join("")}
        </div>
        `;let l="";o>1&&(l=`
        <div style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 30px; padding-bottom: 10px;">
            <button onclick="changePage(${a.currentPage-1})" ${a.currentPage===1?"disabled":""} 
                    style="border:none; background:none; color:${a.currentPage===1?"#ccc":"#999"}; font-size:12px; font-weight:700; cursor:${a.currentPage===1?"default":"pointer"};">
                Previous
            </button>
            
            ${Array.from({length:o},(s,c)=>c+1).map(s=>`
                <div onclick="changePage(${s})" 
                     style="width: 30px; height: 30px; background: ${a.currentPage===s?"var(--accent)":"transparent"}; color: ${a.currentPage===s?"#fff":"#999"}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; cursor: pointer;">
                    ${s}
                </div>
            `).join("")}

            <button onclick="changePage(${a.currentPage+1})" ${a.currentPage===o?"disabled":""}
                    style="border:none; background:none; color:${a.currentPage===o?"#ccc":"#999"}; font-size:12px; font-weight:700; cursor:${a.currentPage===o?"default":"pointer"};">
                Next
            </button>
        </div>
        `),t.innerHTML=n+l}window.changePage=t=>{var e;a.currentPage=t,k(),(e=document.getElementById("vaults-container"))==null||e.scrollIntoView({behavior:"smooth",block:"start"})};async function D(){const t=document.getElementById("link-url").value,e=document.getElementById("link-mobile").value,o=document.getElementById("link-name").value,i=document.getElementById("link-session-type").value,r=document.getElementById("link-title").value;if(e.replace(/\D/g,"").length!==10)return alert("Please enter a valid 10-digit mobile number");if(!t||!e)return alert("Folder link and mobile are required");const l=document.getElementById("save-link");l.disabled=!0,l.innerText="SAVING...";try{(await fetch(`${y}/vaults/link`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({folderLink:t,mobile:e,customerName:o,sessionType:i,sessionTitle:r})})).ok?(document.getElementById("vault-modal").style.display="none",document.getElementById("link-url").value="",document.getElementById("link-mobile").value="",document.getElementById("link-name").value="",document.getElementById("link-title").value="",d("✓ Vault linked successfully!","success"),await b(),h()):d("Failed to save vault","error")}catch{alert("Network error")}finally{l.disabled=!1,l.innerText="SAVE VAULT"}}window.toggleVaultLock=async t=>{const e=a.vaults.find(o=>String(o.id)===String(t));e&&(e.status=e.status==="locked"?"active":"locked",h());try{if(!(await fetch(`${y}/vaults/${t}/toggle-lock`,{method:"PATCH"})).ok)throw new Error("Update failed")}catch{e&&(e.status=e.status==="locked"?"active":"locked",h()),d("Failed to toggle lock","error")}};window.editVault=t=>{const e=a.vaults.find(r=>String(r.id)===String(t));if(!e){console.error("Edit Vault: ID not found in state:",t);return}document.getElementById("edit-vault-id").value=e.id,document.getElementById("edit-vault-name").value=e.customerName||"",document.getElementById("edit-vault-mobile").value=e.customerMobile||"",document.getElementById("edit-vault-type").value=e.sessionType||"Wedding",document.getElementById("edit-vault-title").value=e.sessionTitle||"",document.getElementById("edit-vault-drive-id").value=e.vaultId||"";const i=new Date(e.createdAt||parseInt(e.id)).toISOString().split("T")[0];document.getElementById("edit-vault-date").value=i,document.getElementById("edit-vault-modal").style.display="flex"};document.getElementById("update-vault-btn").onclick=async()=>{const t=document.getElementById("edit-vault-id").value,e=document.getElementById("edit-vault-name").value,o=document.getElementById("edit-vault-mobile").value,i=document.getElementById("edit-vault-type").value,r=document.getElementById("edit-vault-title").value,n=document.getElementById("edit-vault-date").value,l=document.getElementById("edit-vault-drive-id").value;if(o.length!==10)return alert("Please enter a valid 10-digit mobile number");const s=document.getElementById("update-vault-btn");s.disabled=!0,s.innerText="SAVING...";try{(await fetch(`${y}/vaults/${t}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({customerName:e,customerMobile:o,sessionType:i,sessionTitle:r,createdAt:n?new Date(n).toISOString():void 0,vaultId:l})})).ok?(d("Changes saved successfully!"),document.getElementById("edit-vault-modal").style.display="none",await b(),h()):d("Failed to update vault","error")}catch{d("Network error","error")}finally{s.disabled=!1,s.innerText="SAVE CHANGES"}};window.updateWorkflowStatus=async(t,e)=>{try{if(!(await fetch(`${y}/vaults/${t}/workflow-status`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({workflowStatus:e})})).ok)throw new Error("Failed to update status");await b(),k(),d("Workflow status updated!")}catch(o){console.error("Workflow update error:",o),d("Update failed: "+o.message,"error"),k()}};window.deleteVault=async t=>{if(confirm("Are you sure you want to permanently delete this vault? This action cannot be undone."))try{const e=await fetch(`${y}/vaults/${t}`,{method:"DELETE"});if(!e.ok){const o=await e.json();throw new Error(o.error||"Delete failed")}d("✓ Vault deleted successfully","success"),await b(),h()}catch(e){d("Failed to delete vault: "+e.message,"error")}};window.viewSelection=async(t,e)=>{const o=a.selections.find(l=>l.vaultId===t&&l.mobile===e),i=a.vaults.find(l=>String(l.id)===String(t))||{},r=o&&o.finalized,n=document.createElement("div");n.className="modal-overlay",n.style.cssText="display:flex; z-index: 9000;",n.innerHTML='<div class="login-modal" style="text-align:center;"><p style="font-weight:700;">Accessing Vault...</p><p style="font-size:12px; opacity:0.6;">Checking for updates and fetching collections.</p></div>',document.body.appendChild(n);try{const l=await fetch(`${y}/vaults/${t}/photos`);if(!l.ok)throw new Error("Could not fetch photos");const c=(await l.json()).photos||[];n.remove(),window.currentVaultPhotos=c,window.currentSelections=new Set(o?o.selections:[]),window.currentViewFilter=window.currentSelections.size>0?"selected":"all",window.currentVaultId=t,window.currentMobile=e,window.isFinalizedView=r,window.renderSelectionGrid=()=>{const p=document.getElementById("selection-grid");if(!p)return;let m=[];window.currentViewFilter==="selected"?m=window.currentVaultPhotos.filter(f=>window.currentSelections.has(f.id)):window.currentViewFilter==="unselected"?m=window.currentVaultPhotos.filter(f=>!window.currentSelections.has(f.id)):m=window.currentVaultPhotos,window.adminLightboxPhotos=m,m.length===0?p.innerHTML=`<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #999;">
                    <p style="font-size: 48px; margin-bottom: 20px;">📭</p>
                    <p style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">No photos found in this view</p>
                </div>`:(p.className="premium-grid",p.innerHTML=m.map((f,u)=>{const E=window.currentSelections.has(f.id);return`
                    <div class="premium-card ${E?"selected":""}" 
                            id="photo-card-${f.id}" style="animation-delay: ${u*.05}s">
                        
                        <div class="card-badge">#${u+1}</div>
                        
                        <div class="premium-card-image-wrapper" onclick="openAdminLightbox(${u}, window.adminLightboxPhotos)">
                            <img src="${f.googleUrl||v(f.url)}" loading="lazy">
                            <div class="premium-card-overlay">
                                ${E?`
                                    <div class="selection-indicator">
                                        <span style="font-size: 18px;">✨</span> SELECTED
                                    </div>
                                `:""}
                            </div>
                        </div>

                        ${window.isFinalizedView?`
                            <div class="card-action-bar">
                                <button class="premium-action-btn ${E?"remove":"add"} action-btn-${f.id}" 
                                        onclick="window.toggleDeliveryPhoto('${t}', '${e}', '${f.id}')">
                                    ${E?"Remove Selection":"Add Selection"}
                                </button>
                            </div>
                        `:""}
                    </div>
                `}).join("")),document.getElementById("cnt-selected")&&(document.getElementById("cnt-selected").innerText=window.currentSelections.size),document.getElementById("cnt-unselected")&&(document.getElementById("cnt-unselected").innerText=window.currentVaultPhotos.length-window.currentSelections.size),document.getElementById("cnt-all")&&(document.getElementById("cnt-all").innerText=window.currentVaultPhotos.length)},window.adminLightboxPhotos=c;const g=document.createElement("div");g.className="modal-overlay",g.style.display="flex",g.innerHTML=`
            <div class="premium-modal">
                <button onclick="this.closest('.modal-overlay').remove(); document.body.style.overflow = '';" 
                        style="position: absolute; top: 30px; right: 30px; z-index: 1001; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); font-size: 18px;">✕</button>

                <div class="premium-header">
                    <div class="premium-header-content">
                        <div class="premium-title-group">
                            <span class="premium-subtitle">${r?"DELIVERY MANAGER":"CURATION PREVIEW"}</span>
                            <h2>${i.title||(o==null?void 0:o.vaultName)||"Vault Photos"}</h2>
                            <div style="margin-top: 15px; color: rgba(255,255,255,0.6); font-size: 13px; font-weight: 500;">
                                <span style="color: #4CAF50;">●</span> ${e}
                                <span style="margin: 0 10px; opacity: 0.3;">|</span>
                                ${new Date().toLocaleDateString()}
                            </div>
                        </div>

                        <div>
                            ${i.driveUrl?`
                                <a href="${i.driveUrl}" target="_blank" class="drive-btn-premium">
                                    <span>📂</span> Open Drive Folder
                                </a>
                            `:""}
                        </div>
                    </div>
                    
                    <div class="glass-tabs">
                        <button onclick="window.switchViewFilter('selected')" id="tab-selected" class="glass-tab-btn active">
                            ✨ Selected (<span id="cnt-selected">0</span>)
                        </button>
                        <button onclick="window.switchViewFilter('unselected')" id="tab-unselected" class="glass-tab-btn">
                            ⬜ Unselected (<span id="cnt-unselected">0</span>)
                        </button>
                        <button onclick="window.switchViewFilter('all')" id="tab-all" class="glass-tab-btn">
                            📸 All (<span id="cnt-all">0</span>)
                        </button>
                    </div>
                </div>

                <div class="premium-grid-container">
                    <div id="selection-grid" class="premium-grid">
                        <!-- Photos rendered here -->
                    </div>
                </div>
            </div>
        `,document.body.appendChild(g),document.body.style.overflow="hidden",window.renderSelectionGrid()}catch(l){typeof n<"u"&&n.remove(),d("Error loading vault photos","error"),console.error(l)}};window.switchViewFilter=t=>{window.currentViewFilter=t,document.querySelectorAll(".glass-tab-btn").forEach(e=>e.classList.remove("active")),document.getElementById(`tab-${t}`).classList.add("active"),window.renderSelectionGrid()};window.toggleDeliveryPhoto=async(t,e,o)=>{const i=document.querySelector(`.action-btn-${o}`),r=i.innerHTML,n=window.currentSelections.has(o),l=n?"remove":"add";i.disabled=!0,i.innerHTML="Wait...";try{const s=await fetch(`${y}/vaults/delivery/${l}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({vaultId:t,mobile:e,photoId:o})});if(s.ok)n?window.currentSelections.delete(o):window.currentSelections.add(o),d("Delivery updated!","success"),window.renderSelectionGrid(),b();else{const c=await s.json();alert(`Error: ${c.error}`),i.innerHTML=r,i.disabled=!1}}catch{alert("Network error"),i.innerHTML=r,i.disabled=!1}};window.openAdminLightbox=(t,e)=>{const o=typeof e=="string"?JSON.parse(e):e,i=document.createElement("div");i.id="admin-lightbox",i.className="lightbox-overlay",i.innerHTML=`
        <div class="lightbox-container">
            <button class="lightbox-close" onclick="closeAdminLightbox()">✕</button>
            <button class="lightbox-nav lightbox-prev" onclick="navigateAdminLightbox(-1)">‹</button>
            <button class="lightbox-nav lightbox-next" onclick="navigateAdminLightbox(1)">›</button>
            <div class="lightbox-content">
                <img id="admin-lightbox-image" src="${o[t].googleUrl||v(o[t].url)}">
                <div class="lightbox-info">
                    <span class="lightbox-counter">${t+1} / ${o.length}</span>
                </div>
            </div>
        </div>
    `,document.body.appendChild(i),window.adminLightboxPhotos=o,window.adminLightboxIndex=t,window.adminLightboxKeyHandler=r=>{r.key==="ArrowLeft"&&navigateAdminLightbox(-1),r.key==="ArrowRight"&&navigateAdminLightbox(1),r.key==="Escape"&&closeAdminLightbox()},document.addEventListener("keydown",window.adminLightboxKeyHandler)};window.navigateAdminLightbox=t=>{window.adminLightboxIndex+=t;const e=window.adminLightboxPhotos;window.adminLightboxIndex<0&&(window.adminLightboxIndex=e.length-1),window.adminLightboxIndex>=e.length&&(window.adminLightboxIndex=0);const o=document.getElementById("admin-lightbox-image"),i=document.querySelector("#admin-lightbox .lightbox-counter");o.style.opacity="0",setTimeout(()=>{o.src=v(e[window.adminLightboxIndex].url),i.textContent=`${window.adminLightboxIndex+1} / ${e.length}`,o.style.opacity="1"},200)};window.closeAdminLightbox=()=>{const t=document.getElementById("admin-lightbox");t&&(t.style.opacity="0",setTimeout(()=>t.remove(),300)),document.removeEventListener("keydown",window.adminLightboxKeyHandler)};function I(){console.log("[Cal.com] Admin Booking View Active")}window.renderCalendar=()=>{};window.updateBookingStatus=()=>{};window.bulkBlock=()=>{};window.toggleDate=()=>{};window.cancelBooking=()=>{};window.deleteBooking=()=>{};window.editBooking=()=>{};window.addEventType=()=>{};window.removeEventType=()=>{};window.editEventType=()=>{};window.addEventType=()=>{alert("Add new event types in your Cal.com Dashboard")};window.removeEventType=()=>{alert("Event types must be removed in Cal.com")};window.editEventType=()=>{alert("Event types must be edited in Cal.com")};function F(){V(),T();const t=document.getElementById("cms-gallery");if(!t)return;const e=[...a.cms.items].sort((o,i)=>i.id-o.id);t.innerHTML=e.map(o=>{var s;const i=o.url&&(o.url.startsWith("data:video/")||o.url.endsWith(".mp4")),r=o.url&&(o.url.includes("youtube.com")||o.url.includes("youtu.be"));let n="";r?n=`<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; position:relative;">
                <img src="https://img.youtube.com/vi/${(s=o.url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/))==null?void 0:s[1]}/mqdefault.jpg" style="width:100%; height:100%; object-fit:cover; opacity:0.6;">
                <div style="position:absolute; color:white; font-size:24px;">🎬</div>
            </div>`:i?n=`<video src="${v(o.url)}" style="width:100%; height:100%; object-fit: cover;" muted></video><div style="position:absolute; bottom:5px; right:5px; color:white; font-size:10px;">🎞️</div>`:n=`<img src="${v(o.url)}" style="width:100%; height:100%; object-fit: cover;">`;const l=new Date(parseInt(o.id)).toLocaleDateString(void 0,{month:"short",day:"numeric"});return`
        <div class="card" style="padding: 0; margin-bottom:0; overflow: hidden; border-radius: 18px; background: var(--white); border: 1px solid var(--border-color); display: flex; flex-direction: column; transition: transform 0.2s;">
            <div onclick="window.previewCMS('${o.id}')" style="position: relative; width: 100%; aspect-ratio: 1; overflow: hidden; background: #000; cursor: pointer;">
                ${n}
                <div style="position: absolute; top: 10px; right: 10px;">
                    <button onclick="event.stopPropagation(); window.deleteCMS('${o.id}')" title="Remove" style="background: rgba(0,0,0,0.6); border: none; color: white; width: 26px; height: 26px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 11px; backdrop-filter: blur(10px);">✕</button>
                </div>
            </div>
            <div style="padding: 12px 15px; background: #fff;">
                <span style="font-weight: 700; font-size: 13px; color: var(--text-primary); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;">${o.title}</span>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 9px; color: var(--accent); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">${r?"YOUTUBE":i?"VIDEO":"IMAGE"}</span>
                    <span style="font-size: 9px; color: #bbb;">${l}</span>
                </div>
            </div>
        </div>
        `}).join("")}function T(){const t=a.cms.graphics||{},e=document.querySelector("#graphic-artist-preview img"),o=document.querySelector("#graphic-whoWeAre-preview img"),i=document.querySelector("#graphic-readyToBegin-preview img");e&&t.artist&&(e.src=v(t.artist),e.style.opacity="1"),o&&t.whoWeAre&&(o.src=v(t.whoWeAre),o.style.opacity="1"),i&&t.readyToBegin&&(i.src=v(t.readyToBegin),i.style.opacity="1"),console.log("[Admin] Graphics settings rendered.")}window.uploadGraphic=async(t,e)=>{const o=e.target.files[0];if(o){d(`Uploading ${t} image...`,"info");try{const i=await S(o);try{await fetch(`${y}/cms/graphics`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key:t,url:i})})}catch{console.warn("[Local Sync] Local backend unreachable, skipping local sync.")}console.log(`[Admin] Uploading graphic '${t}' to Sheet...`);const n=await(await fetch(x,{method:"POST",body:JSON.stringify({action:"saveGraphic",key:t,url:i})})).json();console.log("[Admin] Sheet upload result:",n),n.success&&n.url?(a.cms.graphics||(a.cms.graphics={}),a.cms.graphics[t]=n.url,d(`✓ ${t.toUpperCase()} updated!`,"success")):(console.warn("[Admin] Cloud sync weirdness, using local base64"),a.cms.graphics||(a.cms.graphics={}),a.cms.graphics[t]=i,d(`Saved locally (Cloud: ${n.error||"Unknown"})`,"warning")),T()}catch(i){console.error("Graphic Upload Error:",i),d("Upload failed: "+i.message,"error"),a.cms.graphics&&!a.cms.graphics[t]&&(a.cms.graphics[t]=await S(o),T())}finally{e.target.value=""}}};window.saveHeroConfig=async()=>{const t=document.getElementById("hero-interval-input");if(!t)return;const e=parseInt(t.value);if(!e||e<1)return alert("Invalid interval");const o=document.querySelector('.cta-btn[onclick="saveHeroConfig()"]'),i=o?o.innerText:"SAVE CONFIG";o&&(o.innerText="SAVING...");try{await fetch(x,{method:"POST",body:JSON.stringify({action:"saveHeroConfig",interval:e})}),a.cms.hero||(a.cms.hero={}),a.cms.hero.interval=e,d("Interval saved to Cloud!","success")}catch(r){console.error("Failed to save config:",r),d("Failed to save config","error")}finally{o&&(o.innerText=i)}};function V(){const t=document.getElementById("hero-slides-container"),e=document.getElementById("hero-interval-input");if(!(!t||!e)){if(document.activeElement!==e&&(e.value=a.cms.hero.interval||5),a.cms.hero.slides.length===0){t.innerHTML='<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: #999; border: 2px dashed #eee; border-radius: 12px; font-size: 12px;">No custom hero media set. Using default background.</div>';return}t.innerHTML=a.cms.hero.slides.map(o=>`
            <div style="position: relative; aspect-ratio: 16/9; border-radius: 10px; overflow: hidden; background: #000; border: 1px solid #eee;">
                ${o.type==="video"?`<video src="${v(o.url)}" muted style="width:100%; height:100%; object-fit:cover;"></video>`:`<img src="${v(o.url)}" style="width:100%; height:100%; object-fit:cover;">`}
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 15px 10px 5px; pointer-events: none;">
                    <span style="color: white; font-size: 10px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">${o.title||"Untitled Banner"}</span>
                </div>
                <button onclick="deleteHeroSlide('${o.id}')" style="position: absolute; top: 5px; right: 5px; width: 22px; height: 22px; border-radius: 50%; border: none; background: rgba(0,0,0,0.7); color: white; cursor: pointer; font-size: 10px; z-index: 2;">✕</button>
            </div>
        `).join("")}}window.previewHeroUpload=async t=>{const e=t.target.files;if(!e||!e.length)return;let o=0;try{for(let i=0;i<e.length;i++){d(`Uploading ${i+1}/${e.length}...`,"info");const r=e[i],n=r.type.startsWith("video")?"video":"image",l=await S(r),s=r.name.split(".").slice(0,-1).join("."),g=await(await fetch(x,{method:"POST",body:JSON.stringify({action:"addMedia",section:"HeroSlide",type:n,title:s,url:l})})).json();if(!g||!g.success)throw new Error((g==null?void 0:g.error)||"Spreadsheet rejected the upload");o++}d(`✓ ${o} media added to hero!`,"success"),d("Refreshing gallery...","info"),await new Promise(i=>setTimeout(i,1500))}catch(i){console.error("Upload Error:",i),d("Upload failed: "+i.message,"error")}finally{t.target.value="",await b(),h()}};window.deleteHeroSlide=async t=>{if(confirm("Remove this slide from the hero section?"))try{if(window.showLoader(),!(await fetch(x,{method:"POST",body:JSON.stringify({action:"deleteMedia",id:t})})).ok)throw new Error("Delete request failed");d("Hero slide removed","success"),setTimeout(async()=>{await b(),h(),window.hideLoader()},800)}catch(e){window.hideLoader(),console.error("Hero delete failed:",e),d("Failed to remove slide","error")}};async function N(){const t=document.getElementById("cms-url").value,e=document.getElementById("cms-title").value;if(!t||!e)return;const o=document.getElementById("cms-add");o.disabled=!0,o.innerText="ADDING...",await fetch(x,{method:"POST",body:JSON.stringify({action:"addMedia",section:"Gallery",type:"image",title:e,url:t})}),document.getElementById("cms-url").value="",document.getElementById("cms-title").value="",d("Photo added to gallery!","success"),await b(),h(),o.disabled=!1,o.innerText="ADD PHOTO"}window.switchUploadTab=t=>{["url","file","youtube"].forEach(o=>{const i=document.getElementById(`tab-${o}`);i&&(i.style.borderBottom=t===o?"3px solid var(--accent)":"3px solid transparent",i.style.color=t===o?"var(--accent)":"#999");const r=document.getElementById(`upload-${o}`);r&&(r.style.display=t===o?o==="file"?"block":"flex":"none")})};window.addYouTubeCMS=async()=>{const t=document.getElementById("cms-youtube-url").value,e=document.getElementById("cms-youtube-title").value;if(!t||!e)return d("Please enter both URL and Title","error");if(!t.includes("youtube.com")&&!t.includes("youtu.be"))return d("Invalid YouTube URL","error");const o=document.getElementById("cms-add-youtube");o.disabled=!0,o.innerText="ADDING...";try{await fetch(x,{method:"POST",body:JSON.stringify({action:"addMedia",section:"Gallery",type:"image",title:e,url:t})}),document.getElementById("cms-youtube-url").value="",document.getElementById("cms-youtube-title").value="",d("YouTube Video added to gallery!"),await b(),h()}catch{d("Failed to add video","error")}finally{o.disabled=!1,o.innerText="ADD VIDEO"}};let w=[];function j(){const t=document.getElementById("drop-zone"),e=document.getElementById("file-input"),o=document.getElementById("upload-files-btn");!t||!e||(t.onclick=()=>e.click(),e.onchange=i=>L(i.target.files),t.ondragover=i=>{i.preventDefault(),t.style.borderColor="var(--accent)",t.style.background="rgba(184, 156, 125, 0.1)"},t.ondragleave=()=>{t.style.borderColor="var(--border-color)",t.style.background="var(--card-bg)"},t.ondrop=i=>{i.preventDefault(),t.style.borderColor="var(--border-color)",t.style.background="var(--card-bg)",L(i.dataTransfer.files)},o&&(o.onclick=H))}function L(t){if(w=Array.from(t).filter(i=>{const r=i.type.startsWith("image/"),n=i.type.startsWith("video/");return!r&&!n?(d(`${i.name} is not an image or video`,"error"),!1):i.size>50*1024*1024?(d(`${i.name} exceeds 50MB`,"error"),!1):!0}),w.length===0)return;const e=document.getElementById("preview-container"),o=document.getElementById("preview-grid");e.style.display="block",o.innerHTML="",w.forEach((i,r)=>{const n=new FileReader;n.onload=l=>{const s=document.createElement("div");s.style.cssText="position: relative; border-radius: 15px; overflow: hidden; border: 2px solid var(--border-color);";const g=i.type.startsWith("video/")?`<video src="${l.target.result}" style="width: 100%; height: 120px; object-fit: cover;" muted playsinline></video><div style="position:absolute; top:4px; left:4px; padding:2px 6px; background:black; color:white; font-size:8px; border-radius:4px;">VIDEO</div>`:`<img src="${l.target.result}" style="width: 100%; height: 120px; object-fit: cover;">`;s.innerHTML=`
                ${g}
                <div style="padding: 8px; background: var(--card-bg);">
                    <input type="text" id="file-title-${r}" placeholder="Title" style="width: 100%; border: 1px solid var(--border-color); padding: 5px; border-radius: 8px; font-size: 10px;">
                </div>
                <button onclick="removeFilePreview(${r})" style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 12px;">✕</button>
            `,o.appendChild(s)},n.readAsDataURL(i)})}window.removeFilePreview=t=>{w.splice(t,1),w.length===0?document.getElementById("preview-container").style.display="none":L(w)};async function H(){if(w.length===0)return;const t=document.getElementById("upload-files-btn");t.disabled=!0,t.innerText="UPLOADING...";try{for(let e=0;e<w.length;e++){const o=w[e],i=document.getElementById(`file-title-${e}`),r=i?i.value.trim():o.name.replace(/\.[^/.]+$/,""),n=await S(o),l=o.type.startsWith("video")?"video":"image",c=await(await fetch(x,{method:"POST",body:JSON.stringify({action:"addMedia",section:"Gallery",type:l,title:r||`Photo ${Date.now()}`,url:n})})).json();if(!c.success)throw new Error(c.error||"Upload failed")}d(`✓ ${w.length} photo${w.length>1?"s":""} uploaded!`,"success"),w=[],document.getElementById("preview-container").style.display="none",document.getElementById("file-input").value="",await b(),h()}catch(e){console.error("Upload Error:",e),d("Upload failed","error")}finally{t.disabled=!1,t.innerText="UPLOAD SELECTED"}}function S(t){return new Promise((e,o)=>{const i=new FileReader;i.onload=()=>e(i.result),i.onerror=o,i.readAsDataURL(t)})}window.deleteCMS=async t=>{if(confirm("Remove this photo from gallery?"))try{if(window.showLoader(),!(await fetch(x,{method:"POST",body:JSON.stringify({action:"deleteMedia",id:t})})).ok)throw new Error("Network response was not ok");d("Item removed from gallery","success"),setTimeout(async()=>{await b(),h(),window.hideLoader()},800)}catch(e){window.hideLoader(),console.error("Delete failed:",e),d("Failed to remove item. Please try again.","error")}};window.previewCMS=t=>{var g;const e=a.cms.items.find(p=>String(p.id)===String(t));if(!e)return;const o=document.getElementById("admin-lightbox"),i=document.getElementById("admin-lightbox-image"),r=document.getElementById("admin-lightbox-video"),n=document.getElementById("admin-lightbox-youtube"),l=document.getElementById("admin-lightbox-title");i.style.display="none",r.style.display="none",n.style.display="none",n.innerHTML="",l.innerText=e.title||"Untitled Work";const s=e.url&&(e.url.startsWith("data:video/")||e.url.endsWith(".mp4"));if(e.url&&(e.url.includes("youtube.com")||e.url.includes("youtu.be"))){const p=(g=e.url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/))==null?void 0:g[1];n.style.display="block",n.innerHTML=`<iframe src="https://www.youtube.com/embed/${p}?autoplay=1" style="width:100%; height:100%; border:none; border-radius:15px;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`}else s?(r.style.display="block",r.src=e.googleUrl||v(e.url),r.play()):(i.style.display="block",i.src=e.googleUrl||v(e.url));o.style.display="flex"};function $(){const t=document.getElementById("messages-container");if(!t)return;if(a.messages.length===0){t.innerHTML=`
            <div style="text-align: center; padding: 60px; color: #ccc;">
                <p style="font-size: 48px; margin-bottom: 20px;">✉️</p>
                <h3>Your inbox is empty</h3>
                <p>New enquiries will appear here in a table format.</p>
            </div>
        `;return}let e=[...a.messages];a.messageSearch&&(e=e.filter(i=>i.sender&&i.sender.toLowerCase().includes(a.messageSearch)||i.mobile&&i.mobile.toLowerCase().includes(a.messageSearch))),a.messageFilter!=="all"&&(e=e.filter(i=>i.status===a.messageFilter));const o=e.sort((i,r)=>new Date(r.timestamp)-new Date(i.timestamp));if(o.length===0){t.innerHTML='<div style="text-align:center; padding: 40px; color: #999;">No messages match your search.</div>';return}t.innerHTML=`
        <div class="table-card" style="background: var(--white); border-radius: 25px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.02); overflow-x: auto;">
            <table style="width: 100%; border-collapse: separate; border-spacing: 0; min-width: 1000px;">
                <thead>
                    <tr style="background: #fafaf9;">
                        <th style="padding: 20px 30px; font-size: 11px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #f0f0f0;">Customer</th>
                        <th style="padding: 20px 15px; font-size: 11px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #f0f0f0;">Mobile</th>
                        <th style="padding: 20px 15px; font-size: 11px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #f0f0f0;">Email</th>
                        <th style="padding: 20px 15px; font-size: 11px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #f0f0f0;">Extract</th>
                        <th style="padding: 20px 15px; font-size: 11px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #f0f0f0;">Status</th>
                        <th style="padding: 20px 30px; border-bottom: 1px solid #f0f0f0; text-align: right;"></th>
                    </tr>
                </thead>
                <tbody>
                    ${o.map(i=>{const n={received:{color:"#FF4136",bg:"rgba(255, 65, 54, 0.05)",label:"RECEIVED"},"in progress":{color:"#FF851B",bg:"rgba(255, 133, 27, 0.05)",label:"PROGRESS"},cleared:{color:"#2ECC40",bg:"rgba(46, 204, 64, 0.05)",label:"CLEARED"}}[i.status||"received"]||{color:"#999",bg:"transparent"},l=n.color,s=i.sender?i.sender.split(" ").map(c=>c[0]).join("").toUpperCase().slice(0,2):"??";return`
                            <tr id="msg-row-${i.id}" class="admin-table-row" style="transition: all 0.3s; background: ${n.bg};">
                                <td style="padding: 15px 30px; border-bottom: 1px solid #f0f0f0; border-right: 1px solid #f8f8f8;">
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <div style="width: 38px; height: 38px; flex-shrink: 0; border-radius: 12px; background: #faf9f8; color: var(--accent); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; border: 1px solid #f0f0f0; position: relative;">
                                            ${s}
                                            ${i.read?"":'<div style="position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; background: #E74C3C; border: 2px solid #fff; border-radius: 50%;"></div>'}
                                        </div>
                                        <div style="overflow: hidden;">
                                            <span style="display: block; font-weight: 800; font-size: 13px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${i.sender}</span>
                                            <span style="display: block; font-size: 9px; color: #bbb; font-weight: 700; text-transform: uppercase;">${new Date(i.timestamp).toLocaleDateString(void 0,{day:"numeric",month:"short"})}</span>
                                        </div>
                                    </div>
                                </td>
                                <td style="padding: 20px 15px; border-bottom: 1px solid #f0f0f0; border-right: 1px solid #f8f8f8;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="font-size: 12px; font-weight: 700; color: var(--text-secondary); white-space: nowrap;">${i.mobile}</span>
                                        <button onclick="window.copyToClipboard('${i.mobile}', 'Phone')" 
                                                style="border: none; background: #f8f8f8; width: 24px; height: 24px; flex-shrink: 0; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 10px; transition: all 0.2s;"
                                                onmouseover="this.style.background='#eee'" onmouseout="this.style.background='#f8f8f8'">📋</button>
                                    </div>
                                </td>
                                <td style="padding: 20px 15px; border-bottom: 1px solid #f0f0f0; border-right: 1px solid #f8f8f8;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="font-size: 11px; font-weight: 700; color: var(--accent); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 120px;">${i.email||'<span style="color:#eee">N/A</span>'}</span>
                                        ${i.email?`
                                            <button onclick="window.copyToClipboard('${i.email}', 'Email')" 
                                                    style="border: none; background: #f8f8f8; width: 24px; height: 24px; flex-shrink: 0; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 10px; transition: all 0.2s;"
                                                    onmouseover="this.style.background='#eee'" onmouseout="this.style.background='#f8f8f8'">📋</button>
                                        `:""}
                                    </div>
                                </td>
                                <td style="padding: 20px 15px; border-bottom: 1px solid #f0f0f0; border-right: 1px solid #f8f8f8; cursor: pointer;" onclick="window.toggleMessage('${i.id}')">
                                    <div style="max-width: 180px; font-size: 12px; color: #777; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-style: italic;">
                                        "${i.text}"
                                    </div>
                                    <span style="font-size: 9px; color: var(--accent); font-weight: 800; text-transform: uppercase;">DETAILS</span>
                                </td>
                                <td style="padding: 20px 15px; border-bottom: 1px solid #f0f0f0; border-right: 1px solid #f8f8f8;">
                                    <div style="position: relative; width: 120px;">
                                        <select onchange="window.updateMessageStatus('${i.id}', this.value)" 
                                                style="border: none; background: ${l}; color: white; font-size: 9px; font-weight: 800; cursor: pointer; text-transform: uppercase; outline: none; padding: 10px 15px; border-radius: 10px; width: 100%; appearance: none; text-align: center; box-shadow: 0 4px 15px ${l}33;">
                                            <option value="received" ${i.status==="received"?"selected":""} style="background: white; color: black;">RECEIVED</option>
                                            <option value="in progress" ${i.status==="in progress"?"selected":""} style="background: white; color: black;">PROGRESS</option>
                                            <option value="cleared" ${i.status==="cleared"?"selected":""} style="background: white; color: black;">CLEARED</option>
                                        </select>
                                    </div>
                                </td>
                                <td style="padding: 20px 30px; border-bottom: 1px solid #f0f0f0; text-align: right;">
                                    <button onclick="window.toggleMessage('${i.id}')" class="cta-btn" style="padding: 10px 18px; font-size: 9px; border-radius: 10px; white-space: nowrap;">VIEW</button>
                                </td>
                            </tr>
                            <tr id="msg-detail-${i.id}" style="display: none; background: #faf9f8;">
                                <td colspan="6" style="padding: 0; border-bottom: 1px solid #eee;">
                                    <div style="padding: 40px 60px; animation: slideDown 0.4s ease-out;">
                                        <div style="background: white; border-radius: 30px; border: 1px solid var(--border-color); padding: 35px; box-shadow: 0 30px 60px rgba(0,0,0,0.06); display: grid; grid-template-columns: 1.5fr 1fr; gap: 30px;">
                                            <div>
                                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                                    <h4 style="margin:0; font-family: 'Metropolis', sans-serif; font-size: 16px; color: var(--text-primary);">Enquiry Content</h4>
                                                    <span style="font-size: 10px; font-weight: 700; color: #999; text-transform: uppercase;">ID: #${String(i.id).slice(-6)}</span>
                                                </div>
                                                <div style="background: #fdfdfd; padding: 20px; border-radius: 15px; font-size: 14px; color: #444; line-height: 1.7; border: 1px solid #f0f0f0; margin-bottom: 25px;">
                                                    "${i.text}"
                                                </div>
                                                
                                                <div style="display: flex; gap: 10px;">
                                                    <input type="text" id="reply-input-${i.id}" class="login-input" style="flex:1; margin-bottom:0; border-radius: 12px; padding: 15px; font-size: 13px;" placeholder="Message to client...">
                                                    <button onclick="window.sendMessageReply('${i.id}')" class="cta-btn" style="padding: 0 25px; border-radius: 12px; font-size: 10px;">SEND REPLY</button>
                                                </div>
                                            </div>

                                            <div style="border-left: 1px solid #eee; padding-left: 30px;">
                                                <h4 style="margin-bottom: 15px; font-family: 'Metropolis', sans-serif; font-size: 15px;">Interaction Logs</h4>
                                                <div id="replies-${i.id}" style="max-height: 250px; overflow-y: auto; padding-right: 10px;">
                                                    ${i.replies.length>0?i.replies.map(c=>`
                                                        <div style="margin-bottom: 12px; padding: 12px; background: rgba(184, 156, 125, 0.05); border-radius: 12px; border: 1px solid rgba(184, 156, 125, 0.08);">
                                                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                                                <span style="font-weight: 800; font-size: 8px; color: var(--accent); letter-spacing: 1px;">STUDIO REPLY</span>
                                                                <span style="font-size: 8px; color: #bbb;">${new Date(c.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
                                                            </div>
                                                            <p style="font-size: 11px; margin: 0; color: #555; line-height: 1.4;">${c.text}</p>
                                                        </div>
                                                    `).join(""):`
                                                        <div style="text-align: center; padding: 30px 0; color: #ccc;">
                                                            <p style="font-size: 20px; margin-bottom: 5px;">💬</p>
                                                            <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">No replies</p>
                                                        </div>
                                                    `}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        `}).join("")}
                </tbody>
            </table>
        </div>

    `}window.toggleMessage=t=>{const e=document.getElementById(`msg-detail-${t}`),o=document.getElementById(`msg-row-${t}`),i=e.style.display==="table-row";document.querySelectorAll('[id^="msg-detail-"]').forEach(r=>{r.style.display="none";const n=r.id.replace("msg-detail-",""),l=document.getElementById(`msg-row-${n}`);if(l){const s=a.messages.find(c=>c.id===n);if(s){const c={received:"rgba(255, 65, 54, 0.05)","in progress":"rgba(255, 133, 27, 0.05)",cleared:"rgba(46, 204, 64, 0.1)"};l.style.background=c[s.status]||"white"}}}),i||(e.style.display="table-row",o.style.background="rgba(184, 156, 125, 0.05)")};window.updateMessageStatus=async(t,e)=>{const o=document.getElementById(`msg-row-${t}`),i=o?o.style.background:"",r={received:{bg:"rgba(255, 65, 54, 0.05)"},"in progress":{bg:"rgba(255, 133, 27, 0.05)"},cleared:{bg:"rgba(46, 204, 64, 0.1)"}};o&&r[e]&&(o.style.background=r[e].bg);try{if(!(await fetch(`${y}/messages/${t}/status`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:e})})).ok)throw new Error("Sync failed");d(`✓ Sync Complete: ${e.toUpperCase()}`,"success"),await b(),$()}catch(n){console.error("Status update error:",n),d("Update failed!","error"),o&&(o.style.background=i),$()}};window.sendMessageReply=async t=>{const e=document.getElementById(`reply-input-${t}`),o=e.value.trim();if(!o)return;const i=document.activeElement;i.disabled=!0,i.innerText="SENDING...";try{await fetch(`${y}/messages/${t}/reply`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:o})}),e.value="",d("Reply logged and synced","success"),setTimeout(async()=>{await b(),$(),window.toggleMessage&&window.toggleMessage(t)},1500)}catch{d("Reply failed","error")}finally{i.disabled=!1,i.innerText="SEND REPLY"}};window.copyToClipboard=(t,e)=>{navigator.clipboard.writeText(t).then(()=>{d(`${e} copied to clipboard`,"success")}).catch(o=>{d("Failed to copy","error")})};B();
