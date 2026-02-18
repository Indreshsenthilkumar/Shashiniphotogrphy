import"./modulepreload-polyfill-B5Qt9EMX.js";const y="https://shashiniphotogrphy-production.up.railway.app/api",x="https://script.google.com/macros/s/AKfycbwQTkkUUH6KSrajQCD4WLJ3uRT8ddBDqr-dQFIDwMAkFsAB9PXBZxnYmzo6SaHMP9iF/exec";window.onerror=function(e){return console.error("[Admin Shield]",e),!0};window.onunhandledrejection=function(e){console.error("[Admin Shield] Rejection",e.reason)};function v(e){return e?e.startsWith("http")||e.startsWith("data:")||e.startsWith("./")||e.startsWith("../")?e:e.startsWith("/")?y+e:y+"/"+e:""}function c(e,o="success"){const t=document.createElement("div");t.style.cssText=`
        position: fixed;
        top: 100px;
        right: 30px;
        background: ${o==="success"?"linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)":"linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)"};
        color: white;
        padding: 16px 24px;
        border-radius: 15px;
        font-size: 13px;
        font-weight: 600;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `,t.textContent=e,document.body.appendChild(t),setTimeout(()=>{t.style.animation="slideOutRight 0.3s ease-out",setTimeout(()=>t.remove(),300)},3e3)}window.copyToClipboard=(e,o="Content")=>{navigator.clipboard.writeText(e).then(()=>{c(`✓ ${o} copied!`,"success")}).catch(t=>{c("Failed to copy","error")})};let a={activeTab:"overview",vaults:[],selections:[],bookings:[],eventTypes:[],cms:{items:[],hero:{slides:[],interval:5},graphics:{}},messages:[],vaultSearch:"",vaultFilter:"all",vaultDateFilter:"all",viewMode:"list",currentPage:1,itemsPerPage:9,bookingSearch:"",bookingFilter:"all",messageSearch:"",messageFilter:"all"};async function L(){if(sessionStorage.getItem("adminLoggedIn")!=="true"){window.location.href="./index.html";return}A(),z(),window.innerWidth<768&&(a.viewMode="cards"),await b(),h(),C(),setInterval(async()=>{console.log("[Admin] Auto-refreshing data..."),await b(),h()},3e4),window.addEventListener("scroll",()=>{document.body.classList.toggle("scrolled",window.scrollY>50)})}function C(){console.log("[Admin] Setting up mobile menu...");const e=document.getElementById("hamburger-btn"),o=document.getElementById("close-menu-btn"),t=document.getElementById("mobile-menu"),i=document.querySelectorAll(".mobile-nav-link"),r=document.getElementById("mobile-theme-toggle");r&&(r.onclick=n=>{n.stopPropagation(),window.toggleTheme()}),e&&t?e.onclick=n=>{n.stopPropagation(),console.log("[Admin] Hamburger clicked"),t.classList.add("active")}:console.warn("[Admin] Hamburger or menu element missing:",{ham:e,menu:t}),o&&t&&(o.onclick=()=>t.classList.remove("active")),i&&t&&i.forEach(n=>{n.onclick=l=>{const s=l.currentTarget.dataset.tab;s&&(switchTab(s),t.classList.remove("active"))}}),document.addEventListener("click",n=>{t&&t.classList.contains("active")&&!t.contains(n.target)&&n.target!==e&&t.classList.remove("active")})}async function b(){var o,t,i;const e=async(r,n)=>{const l=new AbortController,s=setTimeout(()=>l.abort(),2e4);try{const d=await fetch(r,{signal:l.signal});if(clearTimeout(s),!d.ok)throw new Error(`HTTP ${d.status}`);return await d.json()}catch(d){clearTimeout(s);const p=d.name==="AbortError";return console.error(`[Admin Sync] ${n} failed:`,p?"Timeout":d.message),c(p?`Sync delayed: ${n} (Google is slow)`:`Sync issue: ${n}`,"error"),[]}};try{const r=Date.now(),[n,l,s,d,p,u]=await Promise.all([e(`${y}/vaults?sync=true&t=${r}`,"Vaults"),e(`${y}/vaults/selections?t=${r}`,"Selections"),fetch(`${x}?action=getCMS&t=${r}`).then(g=>g.json()).catch(g=>(console.warn("[CMS] Sheet fetch failed, falling back to local:",g),e(`${y}/cms?t=${r}`,"CMS (Local Fallback)"))),e(`${y}/bookings?sync=true&t=${r}`,"Bookings"),e(`${y}/bookings/event-types?t=${r}`,"EventTypes"),e(`${y}/messages?sync=true&t=${r}`,"Messages")]);a.vaults=Array.isArray(n)?n:[],a.selections=Array.isArray(l)?l:[],s&&s.items&&s.hero?a.cms={items:s.items||[],hero:s.hero||{slides:[],interval:5},graphics:s.graphics||{}}:a.cms={items:s&&s.items?s.items:Array.isArray(s)?s:((o=a.cms)==null?void 0:o.items)||[],hero:s&&s.hero?s.hero:((t=a.cms)==null?void 0:t.hero)||{slides:[],interval:5},graphics:s&&s.graphics?s.graphics:((i=a.cms)==null?void 0:i.graphics)||{}},a.bookings=Array.isArray(d)?d:[],a.eventTypes=Array.isArray(p)?p:[],a.messages=Array.isArray(u)?u:[],a.sheetVaults=Array.isArray(n)?n:[]}catch(r){console.error("Data refresh failed:",r),alert(`Backend Connection Error: ${r.message}. Ensure backend is running on port 5001.`)}}function A(){document.querySelectorAll(".nav-tab").forEach(e=>{e.addEventListener("click",o=>{o.preventDefault();const t=e.dataset.tab;a.activeTab=t,document.querySelectorAll(".nav-tab").forEach(i=>i.classList.toggle("active",i.dataset.tab===t)),document.querySelectorAll(".tab-content").forEach(i=>i.classList.toggle("active",i.id===t)),h()})})}function z(){const e=document.querySelector(".theme-toggle");localStorage.getItem("theme")==="dark"&&document.body.classList.add("dark-mode"),e&&(window.toggleTheme=()=>{document.body.classList.toggle("dark-mode");const m=document.body.classList.contains("dark-mode")?"dark":"light";localStorage.setItem("theme",m)},e&&(e.onclick=window.toggleTheme));const t=document.getElementById("save-link");t&&(t.onclick=P);const i=document.getElementById("cms-add");i&&(i.onclick=N);const r=document.getElementById("cms-add-youtube");r&&(r.onclick=window.addYouTubeCMS),j();const n=document.getElementById("open-link_vault_btn");n&&(n.onclick=()=>{document.getElementById("vault-modal").style.display="flex"}),window.onclick=m=>{m.target.className==="modal-overlay"&&(m.target.style.display="none")};const l=document.getElementById("vault-search");l&&(l.oninput=m=>{a.vaultSearch=m.target.value.toLowerCase(),k()});const s=document.getElementById("vault-status-filter");s&&(s.onchange=m=>{a.vaultFilter=m.target.value,k()});const d=document.getElementById("vault-date-filter");d&&(d.onchange=m=>{a.vaultDateFilter=m.target.value,k()});const p=document.getElementById("booking-search");p&&(p.oninput=m=>{a.bookingSearch=m.target.value.toLowerCase(),I()});const u=document.getElementById("booking-status-filter");u&&(u.onchange=m=>{a.bookingFilter=m.target.value,I()});const g=document.getElementById("message-search");g&&(g.oninput=m=>{a.messageSearch=m.target.value.toLowerCase(),$()});const f=document.getElementById("message-status-filter");f&&(f.onchange=m=>{a.messageFilter=m.target.value,$()})}function h(){D(),k(),I(),F(),$(),M()}function M(){["link-session-type","edit-vault-type","edit-booking-type"].forEach(o=>{const t=document.getElementById(o);if(t){const i=t.value,r=a.eventTypes.filter(n=>n);t.innerHTML=r.map(n=>`<option value="${n}">${n}</option>`).join(""),r.includes(i)?t.value=i:r.length>0&&(t.value=r[0])}}),document.getElementById("vault-status-filter")}function D(){const e=document.getElementById("overview-stats-grid");if(e){const r=[{label:"Active Vaults",value:a.vaults.length,icon:"🎞️",sub:`${new Set(a.vaults.map(n=>n.customerMobile)).size} Clients`,tab:"vaults"},{label:"New Enquiries",value:a.messages.filter(n=>!n.read).length,icon:"✉️",sub:"Inbox Activity",tab:"messages"},{label:"Studio CMS",value:a.cms.length,icon:"📸",sub:"Active Photos",tab:"cms"}];e.innerHTML=r.map(n=>`
            <div class="stat-card" onclick="window.switchTab('${n.tab}')" style="cursor: pointer; padding: 25px; border-radius: 25px; background: var(--white); border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.02); transition: all 0.3s;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <span style="font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: 2px; text-transform: uppercase;">${n.label}</span>
                    <span style="font-size: 20px;">${n.icon}</span>
                </div>
                <div class="stat-value" style="font-size: 32px; font-weight: 800; margin: 0 0 5px 0;">${n.value}</div>
                <p style="font-size: 11px; color: #aaa; font-weight: 600; margin: 0;">${n.sub}</p>
            </div>
        `).join("")}const o=document.getElementById("recent-activity-feed");if(o){const r=[...a.messages.map(n=>({...n,type:"Message",icon:"✉️",color:"rgba(184, 156, 125, 0.1)",view:"messages",title:n.sender,sub:n.text,date:n.timestamp})),...a.cms.hero.slides.map(n=>({...n,type:"Hero Slide",icon:"🖼️",color:"rgba(52, 152, 219, 0.1)",view:"cms",title:n.title||"New Hero Media",sub:"Updated Home Banner",date:parseInt(n.id)})),...a.cms.items.slice(0,10).map(n=>({...n,type:"Gallery",icon:"🎨",color:"rgba(46, 204, 113, 0.1)",view:"cms",title:n.title,sub:"New Master Exhibition Piece",date:parseInt(n.id)}))].sort((n,l)=>new Date(l.date||l.timestamp||l.createdAt)-new Date(n.date||n.timestamp||n.createdAt)).slice(0,8);r.length===0?o.innerHTML='<div style="text-align:center; padding: 40px; color: #ccc;">No current studio activity logged.</div>':o.innerHTML=r.map(n=>{const l=new Date(n.timestamp||n.createdAt||Date.now()),s=isNaN(l.getTime())?"Recently":l.toLocaleDateString(void 0,{day:"numeric",month:"short"});return`
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
            `}).join("")}const t=document.getElementById("next-session-focus");t&&(a.bookings.filter(r=>r.status==="confirmed"&&new Date(r.date)>=new Date().setHours(0,0,0,0)).sort((r,n)=>new Date(r.date)-new Date(n.date))[0],t.innerHTML=`
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
        `}}window.switchTab=e=>{a.activeTab=e,document.querySelectorAll(".nav-tab").forEach(o=>o.classList.toggle("active",o.dataset.tab===e)),document.querySelectorAll(".tab-content").forEach(o=>o.classList.toggle("active",o.id===e)),h(),window.scrollTo({top:0,behavior:"smooth"})};window.setViewMode=e=>{a.viewMode=e,document.querySelectorAll(".view-toggle-btn").forEach(o=>{o.classList.toggle("active",o.innerText.toLowerCase()===e)}),k()};function k(){const e=document.getElementById("vaults-container");if(!e)return;let o=a.vaults;a.vaultSearch&&(o=o.filter(s=>s.customerMobile.includes(a.vaultSearch)||s.sessionTitle.toLowerCase().includes(a.vaultSearch)||s.customerName&&s.customerName.toLowerCase().includes(a.vaultSearch)||s.vaultId.toLowerCase().includes(a.vaultSearch))),a.vaultFilter!=="all"&&(o=o.filter(s=>{const d=a.selections.find(g=>g.vaultId===s.vaultId&&g.mobile===s.customerMobile),p=d&&d.finalized;let u=s.workflowStatus||(p?"finalized":s.status);return u==="active"&&(u="pending"),u===a.vaultFilter})),a.vaultDateFilter==="newest"?o.sort((s,d)=>new Date(d.id*1||0)-new Date(s.id*1||0)):a.vaultDateFilter==="oldest"&&o.sort((s,d)=>new Date(s.id*1||0)-new Date(d.id*1||0));const t=Math.ceil(o.length/a.itemsPerPage);a.currentPage>t&&(a.currentPage=t||1);const i=(a.currentPage-1)*a.itemsPerPage,r=o.slice(i,i+a.itemsPerPage);if(o.length===0){e.innerHTML=`
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
                ${r.map(s=>{const d=a.selections.find(E=>E.vaultId===s.vaultId&&E.mobile===s.customerMobile),u=d&&d.finalized?"finalized":s.status==="active"?"pending":s.status,g=s.workflowStatus||u,f=new Date(parseInt(s.id)).toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"numeric"}),m=new Date(parseInt(s.id)).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1});return`
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
                                <div style="font-size: 10px; color: #555;">${m}</div>
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
                                <select class="status-pill ${g}" 
                                        onchange="this.className='status-pill ' + this.value; window.updateWorkflowStatus('${s.id}', this.value)"
                                        style="font-family: 'Metropolis', sans-serif; padding-right: 30px;">
                                    <option value="pending" ${g==="pending"?"selected":""}>Selection in Progress</option>
                                    <option value="finalized" ${g==="finalized"?"selected":""}>Finalized</option>
                                    <option value="albumpending" ${g==="albumpending"?"selected":""}>Album in Progress</option>
                                    <option value="albumcompleted" ${g==="albumcompleted"?"selected":""}>Album Completed</option>
                                    <option value="delivered" ${g==="delivered"?"selected":""}>Delivered</option>
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
            ${r.map(s=>{const d=a.selections.find(f=>f.vaultId===s.vaultId&&f.mobile===s.customerMobile),p=d&&d.finalized,u=s.workflowStatus||(p?"finalized":"pending"),g=new Date(parseInt(s.id)).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});return`
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
                        <span style="display: flex; align-items: center; gap: 5px;">📅 ${g}</span>
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <span>📱 ${s.customerMobile}</span>
                            <button class="copy-btn-mini" onclick="window.copyToClipboard('${s.customerMobile}', 'Mobile Number')" title="Copy Mobile">📋</button>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                        <select class="status-pill ${u}" 
                                onchange="this.className='status-pill ' + this.value; window.updateWorkflowStatus('${s.id}', this.value)"
                                style="font-size: 11px; padding: 6px 12px;">
                            <option value="pending" ${u==="pending"?"selected":""}>Pending</option>
                            <option value="finalized" ${u==="finalized"?"selected":""}>Finalized</option>
                            <option value="albumpending" ${u==="albumpending"?"selected":""}>In Progress</option>
                            <option value="albumcompleted" ${u==="albumcompleted"?"selected":""}>Done</option>
                            <option value="delivered" ${u==="delivered"?"selected":""}>Delivered</option>
                        </select>
                        <button onclick="window.viewSelection('${s.vaultId}', '${s.customerMobile}')" 
                                style="background: var(--text-primary); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;">
                            Manage
                        </button>
                    </div>
                </div>
            `}).join("")}
        </div>
        `;let l="";t>1&&(l=`
        <div style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 30px; padding-bottom: 10px;">
            <button onclick="changePage(${a.currentPage-1})" ${a.currentPage===1?"disabled":""} 
                    style="border:none; background:none; color:${a.currentPage===1?"#ccc":"#999"}; font-size:12px; font-weight:700; cursor:${a.currentPage===1?"default":"pointer"};">
                Previous
            </button>
            
            ${Array.from({length:t},(s,d)=>d+1).map(s=>`
                <div onclick="changePage(${s})" 
                     style="width: 30px; height: 30px; background: ${a.currentPage===s?"var(--accent)":"transparent"}; color: ${a.currentPage===s?"#fff":"#999"}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; cursor: pointer;">
                    ${s}
                </div>
            `).join("")}

            <button onclick="changePage(${a.currentPage+1})" ${a.currentPage===t?"disabled":""}
                    style="border:none; background:none; color:${a.currentPage===t?"#ccc":"#999"}; font-size:12px; font-weight:700; cursor:${a.currentPage===t?"default":"pointer"};">
                Next
            </button>
        </div>
        `),e.innerHTML=n+l}window.changePage=e=>{var o;a.currentPage=e,k(),(o=document.getElementById("vaults-container"))==null||o.scrollIntoView({behavior:"smooth",block:"start"})};async function P(){const e=document.getElementById("link-url").value,o=document.getElementById("link-mobile").value,t=document.getElementById("link-name").value,i=document.getElementById("link-session-type").value,r=document.getElementById("link-title").value;if(o.replace(/\D/g,"").length!==10)return alert("Please enter a valid 10-digit mobile number");if(!e||!o)return alert("Folder link and mobile are required");const l=document.getElementById("save-link");l.disabled=!0,l.innerText="SAVING...";try{(await fetch(`${y}/vaults/link`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({folderLink:e,mobile:o,customerName:t,sessionType:i,sessionTitle:r})})).ok?(document.getElementById("vault-modal").style.display="none",document.getElementById("link-url").value="",document.getElementById("link-mobile").value="",document.getElementById("link-name").value="",document.getElementById("link-title").value="",c("✓ Vault linked successfully!","success"),await b(),h()):c("Failed to save vault","error")}catch{alert("Network error")}finally{l.disabled=!1,l.innerText="SAVE VAULT"}}window.toggleVaultLock=async e=>{const o=a.vaults.find(t=>String(t.id)===String(e));o&&(o.status=o.status==="locked"?"active":"locked",h());try{if(!(await fetch(`${y}/vaults/${e}/toggle-lock`,{method:"PATCH"})).ok)throw new Error("Update failed")}catch{o&&(o.status=o.status==="locked"?"active":"locked",h()),c("Failed to toggle lock","error")}};window.editVault=e=>{const o=a.vaults.find(r=>String(r.id)===String(e));if(!o){console.error("Edit Vault: ID not found in state:",e);return}document.getElementById("edit-vault-id").value=o.id,document.getElementById("edit-vault-name").value=o.customerName||"",document.getElementById("edit-vault-mobile").value=o.customerMobile||"",document.getElementById("edit-vault-type").value=o.sessionType||"Wedding",document.getElementById("edit-vault-title").value=o.sessionTitle||"",document.getElementById("edit-vault-drive-id").value=o.vaultId||"";const i=new Date(o.createdAt||parseInt(o.id)).toISOString().split("T")[0];document.getElementById("edit-vault-date").value=i,document.getElementById("edit-vault-modal").style.display="flex"};document.getElementById("update-vault-btn").onclick=async()=>{const e=document.getElementById("edit-vault-id").value,o=document.getElementById("edit-vault-name").value,t=document.getElementById("edit-vault-mobile").value,i=document.getElementById("edit-vault-type").value,r=document.getElementById("edit-vault-title").value,n=document.getElementById("edit-vault-date").value,l=document.getElementById("edit-vault-drive-id").value;if(t.length!==10)return alert("Please enter a valid 10-digit mobile number");const s=document.getElementById("update-vault-btn");s.disabled=!0,s.innerText="SAVING...";try{(await fetch(`${y}/vaults/${e}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({customerName:o,customerMobile:t,sessionType:i,sessionTitle:r,createdAt:n?new Date(n).toISOString():void 0,vaultId:l})})).ok?(c("Changes saved successfully!"),document.getElementById("edit-vault-modal").style.display="none",await b(),h()):c("Failed to update vault","error")}catch{c("Network error","error")}finally{s.disabled=!1,s.innerText="SAVE CHANGES"}};window.updateWorkflowStatus=async(e,o)=>{try{if(!(await fetch(`${y}/vaults/${e}/workflow-status`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({workflowStatus:o})})).ok)throw new Error("Failed to update status");await b(),k(),c("Workflow status updated!")}catch(t){console.error("Workflow update error:",t),c("Update failed: "+t.message,"error"),k()}};window.deleteVault=async e=>{if(confirm("Are you sure you want to permanently delete this vault? This action cannot be undone."))try{const o=await fetch(`${y}/vaults/${e}`,{method:"DELETE"});if(!o.ok){const t=await o.json();throw new Error(t.error||"Delete failed")}c("✓ Vault deleted successfully","success"),await b(),h()}catch(o){c("Failed to delete vault: "+o.message,"error")}};window.viewSelection=async(e,o)=>{const t=a.selections.find(l=>l.vaultId===e&&l.mobile===o),i=a.vaults.find(l=>String(l.id)===String(e))||{},r=t&&t.finalized,n=document.createElement("div");n.className="modal-overlay",n.style.cssText="display:flex; z-index: 9000;",n.innerHTML='<div class="login-modal" style="text-align:center;"><p style="font-weight:700;">Accessing Vault...</p><p style="font-size:12px; opacity:0.6;">Checking for updates and fetching collections.</p></div>',document.body.appendChild(n);try{const l=await fetch(`${y}/vaults/${e}/photos`);if(!l.ok)throw new Error("Could not fetch photos");const d=(await l.json()).photos||[];n.remove(),window.currentVaultPhotos=d,window.currentSelections=new Set(t?t.selections:[]),window.currentViewFilter=window.currentSelections.size>0?"selected":"all",window.currentVaultId=e,window.currentMobile=o,window.isFinalizedView=r,window.renderSelectionGrid=()=>{const u=document.getElementById("selection-grid");if(!u)return;let g=[];window.currentViewFilter==="selected"?g=window.currentVaultPhotos.filter(f=>window.currentSelections.has(f.id)):window.currentViewFilter==="unselected"?g=window.currentVaultPhotos.filter(f=>!window.currentSelections.has(f.id)):g=window.currentVaultPhotos,window.adminLightboxPhotos=g,g.length===0?u.innerHTML=`<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #999;">
                    <p style="font-size: 48px; margin-bottom: 20px;">📭</p>
                    <p style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">No photos found in this view</p>
                </div>`:(u.className="premium-grid",u.innerHTML=g.map((f,m)=>{const E=window.currentSelections.has(f.id);return`
                    <div class="premium-card ${E?"selected":""}" 
                            id="photo-card-${f.id}" style="animation-delay: ${m*.05}s">
                        
                        <div class="card-badge">#${m+1}</div>
                        
                        <div class="premium-card-image-wrapper" onclick="openAdminLightbox(${m}, window.adminLightboxPhotos)">
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
                                        onclick="window.toggleDeliveryPhoto('${e}', '${o}', '${f.id}')">
                                    ${E?"Remove Selection":"Add Selection"}
                                </button>
                            </div>
                        `:""}
                    </div>
                `}).join("")),document.getElementById("cnt-selected")&&(document.getElementById("cnt-selected").innerText=window.currentSelections.size),document.getElementById("cnt-unselected")&&(document.getElementById("cnt-unselected").innerText=window.currentVaultPhotos.length-window.currentSelections.size),document.getElementById("cnt-all")&&(document.getElementById("cnt-all").innerText=window.currentVaultPhotos.length)},window.adminLightboxPhotos=d;const p=document.createElement("div");p.className="modal-overlay",p.style.display="flex",p.innerHTML=`
            <div class="premium-modal">
                <button onclick="this.closest('.modal-overlay').remove(); document.body.style.overflow = '';" 
                        style="position: absolute; top: 30px; right: 30px; z-index: 1001; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); font-size: 18px;">✕</button>

                <div class="premium-header">
                    <div class="premium-header-content">
                        <div class="premium-title-group">
                            <span class="premium-subtitle">${r?"DELIVERY MANAGER":"CURATION PREVIEW"}</span>
                            <h2>${i.title||(t==null?void 0:t.vaultName)||"Vault Photos"}</h2>
                            <div style="margin-top: 15px; color: rgba(255,255,255,0.6); font-size: 13px; font-weight: 500;">
                                <span style="color: #4CAF50;">●</span> ${o}
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
        `,document.body.appendChild(p),document.body.style.overflow="hidden",window.renderSelectionGrid()}catch(l){typeof n<"u"&&n.remove(),c("Error loading vault photos","error"),console.error(l)}};window.switchViewFilter=e=>{window.currentViewFilter=e,document.querySelectorAll(".glass-tab-btn").forEach(o=>o.classList.remove("active")),document.getElementById(`tab-${e}`).classList.add("active"),window.renderSelectionGrid()};window.toggleDeliveryPhoto=async(e,o,t)=>{const i=document.querySelector(`.action-btn-${t}`),r=i.innerHTML,n=window.currentSelections.has(t),l=n?"remove":"add";i.disabled=!0,i.innerHTML="Wait...";try{const s=await fetch(`${y}/vaults/delivery/${l}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({vaultId:e,mobile:o,photoId:t})});if(s.ok)n?window.currentSelections.delete(t):window.currentSelections.add(t),c("Delivery updated!","success"),window.renderSelectionGrid(),b();else{const d=await s.json();alert(`Error: ${d.error}`),i.innerHTML=r,i.disabled=!1}}catch{alert("Network error"),i.innerHTML=r,i.disabled=!1}};window.openAdminLightbox=(e,o)=>{const t=typeof o=="string"?JSON.parse(o):o,i=document.createElement("div");i.id="admin-lightbox",i.className="lightbox-overlay",i.innerHTML=`
        <div class="lightbox-container">
            <button class="lightbox-close" onclick="closeAdminLightbox()">✕</button>
            <button class="lightbox-nav lightbox-prev" onclick="navigateAdminLightbox(-1)">‹</button>
            <button class="lightbox-nav lightbox-next" onclick="navigateAdminLightbox(1)">›</button>
            <div class="lightbox-content">
                <img id="admin-lightbox-image" src="${t[e].googleUrl||v(t[e].url)}">
                <div class="lightbox-info">
                    <span class="lightbox-counter">${e+1} / ${t.length}</span>
                </div>
            </div>
        </div>
    `,document.body.appendChild(i),window.adminLightboxPhotos=t,window.adminLightboxIndex=e,window.adminLightboxKeyHandler=r=>{r.key==="ArrowLeft"&&navigateAdminLightbox(-1),r.key==="ArrowRight"&&navigateAdminLightbox(1),r.key==="Escape"&&closeAdminLightbox()},document.addEventListener("keydown",window.adminLightboxKeyHandler)};window.navigateAdminLightbox=e=>{window.adminLightboxIndex+=e;const o=window.adminLightboxPhotos;window.adminLightboxIndex<0&&(window.adminLightboxIndex=o.length-1),window.adminLightboxIndex>=o.length&&(window.adminLightboxIndex=0);const t=document.getElementById("admin-lightbox-image"),i=document.querySelector("#admin-lightbox .lightbox-counter");t.style.opacity="0",setTimeout(()=>{t.src=v(o[window.adminLightboxIndex].url),i.textContent=`${window.adminLightboxIndex+1} / ${o.length}`,t.style.opacity="1"},200)};window.closeAdminLightbox=()=>{const e=document.getElementById("admin-lightbox");e&&(e.style.opacity="0",setTimeout(()=>e.remove(),300)),document.removeEventListener("keydown",window.adminLightboxKeyHandler)};function I(){console.log("[Cal.com] Admin Booking View Active")}window.renderCalendar=()=>{};window.updateBookingStatus=()=>{};window.bulkBlock=()=>{};window.toggleDate=()=>{};window.cancelBooking=()=>{};window.deleteBooking=()=>{};window.editBooking=()=>{};window.addEventType=()=>{};window.removeEventType=()=>{};window.editEventType=()=>{};window.addEventType=()=>{alert("Add new event types in your Cal.com Dashboard")};window.removeEventType=()=>{alert("Event types must be removed in Cal.com")};window.editEventType=()=>{alert("Event types must be edited in Cal.com")};function F(){V(),T();const e=document.getElementById("cms-gallery");if(!e)return;const o=[...a.cms.items].sort((t,i)=>i.id-t.id);e.innerHTML=o.map(t=>{var s;const i=t.url&&(t.url.startsWith("data:video/")||t.url.endsWith(".mp4")),r=t.url&&(t.url.includes("youtube.com")||t.url.includes("youtu.be"));let n="";r?n=`<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; position:relative;">
                <img src="https://img.youtube.com/vi/${(s=t.url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/))==null?void 0:s[1]}/mqdefault.jpg" style="width:100%; height:100%; object-fit:cover; opacity:0.6;">
                <div style="position:absolute; color:white; font-size:24px;">🎬</div>
            </div>`:i?n=`<video src="${v(t.url)}" style="width:100%; height:100%; object-fit: cover;" muted></video><div style="position:absolute; bottom:5px; right:5px; color:white; font-size:10px;">🎞️</div>`:n=`<img src="${v(t.url)}" style="width:100%; height:100%; object-fit: cover;">`;const l=new Date(parseInt(t.id)).toLocaleDateString(void 0,{month:"short",day:"numeric"});return`
        <div class="card" style="padding: 0; margin-bottom:0; overflow: hidden; border-radius: 18px; background: var(--white); border: 1px solid var(--border-color); display: flex; flex-direction: column; transition: transform 0.2s;">
            <div onclick="window.previewCMS('${t.id}')" style="position: relative; width: 100%; aspect-ratio: 1; overflow: hidden; background: #000; cursor: pointer;">
                ${n}
                <div style="position: absolute; top: 10px; right: 10px;">
                    <button onclick="event.stopPropagation(); window.deleteCMS('${t.id}')" title="Remove" style="background: rgba(0,0,0,0.6); border: none; color: white; width: 26px; height: 26px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 11px; backdrop-filter: blur(10px);">✕</button>
                </div>
            </div>
            <div style="padding: 12px 15px; background: #fff;">
                <span style="font-weight: 700; font-size: 13px; color: var(--text-primary); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;">${t.title}</span>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 9px; color: var(--accent); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">${r?"YOUTUBE":i?"VIDEO":"IMAGE"}</span>
                    <span style="font-size: 9px; color: #bbb;">${l}</span>
                </div>
            </div>
        </div>
        `}).join("")}function T(){const e=a.cms.graphics||{},o=document.querySelector("#graphic-artist-preview img"),t=document.querySelector("#graphic-whoWeAre-preview img"),i=document.querySelector("#graphic-readyToBegin-preview img");o&&e.artist&&(o.src=v(e.artist),o.style.opacity="1"),t&&e.whoWeAre&&(t.src=v(e.whoWeAre),t.style.opacity="1"),i&&e.readyToBegin&&(i.src=v(e.readyToBegin),i.style.opacity="1"),console.log("[Admin] Graphics settings rendered.")}window.uploadGraphic=async(e,o)=>{const t=o.target.files[0];if(t){c(`Uploading ${e} image...`,"info");try{const i=await S(t);try{await fetch(`${y}/cms/graphics`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key:e,url:i})})}catch{console.warn("[Local Sync] Local backend unreachable, skipping local sync.")}console.log(`[Admin] Uploading graphic '${e}' to Sheet...`);const n=await(await fetch(x,{method:"POST",body:JSON.stringify({action:"saveGraphic",key:e,url:i})})).json();console.log("[Admin] Sheet upload result:",n),n.success&&n.url?(a.cms.graphics||(a.cms.graphics={}),a.cms.graphics[e]=n.url,c(`✓ ${e.toUpperCase()} updated!`,"success")):(console.warn("[Admin] Cloud sync weirdness, using local base64"),a.cms.graphics||(a.cms.graphics={}),a.cms.graphics[e]=i,c(`Saved locally (Cloud: ${n.error||"Unknown"})`,"warning")),T()}catch(i){console.error("Graphic Upload Error:",i),c("Upload failed: "+i.message,"error"),a.cms.graphics&&!a.cms.graphics[e]&&(a.cms.graphics[e]=await S(t),T())}finally{o.target.value=""}}};window.saveHeroConfig=async()=>{const e=document.getElementById("hero-interval-input");if(!e)return;const o=parseInt(e.value);if(!o||o<1)return alert("Invalid interval");const t=document.querySelector('.cta-btn[onclick="saveHeroConfig()"]'),i=t?t.innerText:"SAVE CONFIG";t&&(t.innerText="SAVING...");try{await fetch(x,{method:"POST",body:JSON.stringify({action:"saveHeroConfig",interval:o})}),a.cms.hero||(a.cms.hero={}),a.cms.hero.interval=o,c("Interval saved to Cloud!","success")}catch(r){console.error("Failed to save config:",r),c("Failed to save config","error")}finally{t&&(t.innerText=i)}};function V(){const e=document.getElementById("hero-slides-container"),o=document.getElementById("hero-interval-input");if(!(!e||!o)){if(document.activeElement!==o&&(o.value=a.cms.hero.interval||5),a.cms.hero.slides.length===0){e.innerHTML='<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: #999; border: 2px dashed #eee; border-radius: 12px; font-size: 12px;">No custom hero media set. Using default background.</div>';return}e.innerHTML=a.cms.hero.slides.map(t=>`
            <div style="position: relative; aspect-ratio: 16/9; border-radius: 10px; overflow: hidden; background: #000; border: 1px solid #eee;">
                ${t.type==="video"?`<video src="${v(t.url)}" muted style="width:100%; height:100%; object-fit:cover;"></video>`:`<img src="${v(t.url)}" style="width:100%; height:100%; object-fit:cover;">`}
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 15px 10px 5px; pointer-events: none;">
                    <span style="color: white; font-size: 10px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">${t.title||"Untitled Banner"}</span>
                </div>
                <button onclick="deleteHeroSlide('${t.id}')" style="position: absolute; top: 5px; right: 5px; width: 22px; height: 22px; border-radius: 50%; border: none; background: rgba(0,0,0,0.7); color: white; cursor: pointer; font-size: 10px; z-index: 2;">✕</button>
            </div>
        `).join("")}}window.previewHeroUpload=async e=>{const o=e.target.files;if(!o||!o.length)return;let t=0;try{for(let i=0;i<o.length;i++){c(`Uploading ${i+1}/${o.length}...`,"info");const r=o[i],n=r.type.startsWith("video")?"video":"image",l=await S(r),s=r.name.split(".").slice(0,-1).join("."),p=await(await fetch(x,{method:"POST",body:JSON.stringify({action:"addMedia",section:"HeroSlide",type:n,title:s,url:l})})).json();if(!p||!p.success)throw new Error((p==null?void 0:p.error)||"Spreadsheet rejected the upload");t++}c(`✓ ${t} media added to hero!`,"success"),c("Refreshing gallery...","info"),await new Promise(i=>setTimeout(i,1500))}catch(i){console.error("Upload Error:",i),c("Upload failed: "+i.message,"error")}finally{e.target.value="",await b(),h()}};window.deleteHeroSlide=async e=>{if(confirm("Remove this slide from the hero section?"))try{if(!(await fetch(x,{method:"POST",body:JSON.stringify({action:"deleteMedia",id:e})})).ok)throw new Error("Delete request failed");c("Hero slide removed","success"),await b(),h()}catch{c("Failed to remove slide","error")}};async function N(){const e=document.getElementById("cms-url").value,o=document.getElementById("cms-title").value;if(!e||!o)return;const t=document.getElementById("cms-add");t.disabled=!0,t.innerText="ADDING...",await fetch(x,{method:"POST",body:JSON.stringify({action:"addMedia",section:"Gallery",type:"image",title:o,url:e})}),document.getElementById("cms-url").value="",document.getElementById("cms-title").value="",c("Photo added to gallery!","success"),await b(),h(),t.disabled=!1,t.innerText="ADD PHOTO"}window.switchUploadTab=e=>{["url","file","youtube"].forEach(t=>{const i=document.getElementById(`tab-${t}`);i&&(i.style.borderBottom=e===t?"3px solid var(--accent)":"3px solid transparent",i.style.color=e===t?"var(--accent)":"#999");const r=document.getElementById(`upload-${t}`);r&&(r.style.display=e===t?t==="file"?"block":"flex":"none")})};window.addYouTubeCMS=async()=>{const e=document.getElementById("cms-youtube-url").value,o=document.getElementById("cms-youtube-title").value;if(!e||!o)return c("Please enter both URL and Title","error");if(!e.includes("youtube.com")&&!e.includes("youtu.be"))return c("Invalid YouTube URL","error");const t=document.getElementById("cms-add-youtube");t.disabled=!0,t.innerText="ADDING...";try{await fetch(x,{method:"POST",body:JSON.stringify({action:"addMedia",section:"Gallery",type:"image",title:o,url:e})}),document.getElementById("cms-youtube-url").value="",document.getElementById("cms-youtube-title").value="",c("YouTube Video added to gallery!"),await b(),h()}catch{c("Failed to add video","error")}finally{t.disabled=!1,t.innerText="ADD VIDEO"}};let w=[];function j(){const e=document.getElementById("drop-zone"),o=document.getElementById("file-input"),t=document.getElementById("upload-files-btn");!e||!o||(e.onclick=()=>o.click(),o.onchange=i=>B(i.target.files),e.ondragover=i=>{i.preventDefault(),e.style.borderColor="var(--accent)",e.style.background="rgba(184, 156, 125, 0.1)"},e.ondragleave=()=>{e.style.borderColor="var(--border-color)",e.style.background="var(--card-bg)"},e.ondrop=i=>{i.preventDefault(),e.style.borderColor="var(--border-color)",e.style.background="var(--card-bg)",B(i.dataTransfer.files)},t&&(t.onclick=H))}function B(e){if(w=Array.from(e).filter(i=>{const r=i.type.startsWith("image/"),n=i.type.startsWith("video/");return!r&&!n?(c(`${i.name} is not an image or video`,"error"),!1):i.size>50*1024*1024?(c(`${i.name} exceeds 50MB`,"error"),!1):!0}),w.length===0)return;const o=document.getElementById("preview-container"),t=document.getElementById("preview-grid");o.style.display="block",t.innerHTML="",w.forEach((i,r)=>{const n=new FileReader;n.onload=l=>{const s=document.createElement("div");s.style.cssText="position: relative; border-radius: 15px; overflow: hidden; border: 2px solid var(--border-color);";const p=i.type.startsWith("video/")?`<video src="${l.target.result}" style="width: 100%; height: 120px; object-fit: cover;" muted playsinline></video><div style="position:absolute; top:4px; left:4px; padding:2px 6px; background:black; color:white; font-size:8px; border-radius:4px;">VIDEO</div>`:`<img src="${l.target.result}" style="width: 100%; height: 120px; object-fit: cover;">`;s.innerHTML=`
                ${p}
                <div style="padding: 8px; background: var(--card-bg);">
                    <input type="text" id="file-title-${r}" placeholder="Title" style="width: 100%; border: 1px solid var(--border-color); padding: 5px; border-radius: 8px; font-size: 10px;">
                </div>
                <button onclick="removeFilePreview(${r})" style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 12px;">✕</button>
            `,t.appendChild(s)},n.readAsDataURL(i)})}window.removeFilePreview=e=>{w.splice(e,1),w.length===0?document.getElementById("preview-container").style.display="none":B(w)};async function H(){if(w.length===0)return;const e=document.getElementById("upload-files-btn");e.disabled=!0,e.innerText="UPLOADING...";try{for(let o=0;o<w.length;o++){const t=w[o],i=document.getElementById(`file-title-${o}`),r=i?i.value.trim():t.name.replace(/\.[^/.]+$/,""),n=await S(t),l=t.type.startsWith("video")?"video":"image",d=await(await fetch(x,{method:"POST",body:JSON.stringify({action:"addMedia",section:"Gallery",type:l,title:r||`Photo ${Date.now()}`,url:n})})).json();if(!d.success)throw new Error(d.error||"Upload failed")}c(`✓ ${w.length} photo${w.length>1?"s":""} uploaded!`,"success"),w=[],document.getElementById("preview-container").style.display="none",document.getElementById("file-input").value="",await b(),h()}catch(o){console.error("Upload Error:",o),c("Upload failed","error")}finally{e.disabled=!1,e.innerText="UPLOAD SELECTED"}}function S(e){return new Promise((o,t)=>{const i=new FileReader;i.onload=()=>o(i.result),i.onerror=t,i.readAsDataURL(e)})}window.deleteCMS=async e=>{if(confirm("Remove this photo from gallery?")){try{await fetch(x,{method:"POST",body:JSON.stringify({action:"deleteMedia",id:e})}),c("Item removed from gallery","success")}catch{c("Failed to remove item","error")}await b(),h()}};window.previewCMS=e=>{var p;const o=a.cms.items.find(u=>String(u.id)===String(e));if(!o)return;const t=document.getElementById("admin-lightbox"),i=document.getElementById("admin-lightbox-image"),r=document.getElementById("admin-lightbox-video"),n=document.getElementById("admin-lightbox-youtube"),l=document.getElementById("admin-lightbox-title");i.style.display="none",r.style.display="none",n.style.display="none",n.innerHTML="",l.innerText=o.title||"Untitled Work";const s=o.url&&(o.url.startsWith("data:video/")||o.url.endsWith(".mp4"));if(o.url&&(o.url.includes("youtube.com")||o.url.includes("youtu.be"))){const u=(p=o.url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/))==null?void 0:p[1];n.style.display="block",n.innerHTML=`<iframe src="https://www.youtube.com/embed/${u}?autoplay=1" style="width:100%; height:100%; border:none; border-radius:15px;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`}else s?(r.style.display="block",r.src=o.googleUrl||v(o.url),r.play()):(i.style.display="block",i.src=o.googleUrl||v(o.url));t.style.display="flex"};function $(){const e=document.getElementById("messages-container");if(!e)return;if(a.messages.length===0){e.innerHTML=`
            <div style="text-align: center; padding: 60px; color: #ccc;">
                <p style="font-size: 48px; margin-bottom: 20px;">✉️</p>
                <h3>Your inbox is empty</h3>
                <p>New enquiries will appear here in a table format.</p>
            </div>
        `;return}let o=[...a.messages];a.messageSearch&&(o=o.filter(i=>i.sender&&i.sender.toLowerCase().includes(a.messageSearch)||i.mobile&&i.mobile.toLowerCase().includes(a.messageSearch))),a.messageFilter!=="all"&&(o=o.filter(i=>i.status===a.messageFilter));const t=o.sort((i,r)=>new Date(r.timestamp)-new Date(i.timestamp));if(t.length===0){e.innerHTML='<div style="text-align:center; padding: 40px; color: #999;">No messages match your search.</div>';return}e.innerHTML=`
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
                    ${t.map(i=>{const n={received:{color:"#FF4136",bg:"rgba(255, 65, 54, 0.05)",label:"RECEIVED"},"in progress":{color:"#FF851B",bg:"rgba(255, 133, 27, 0.05)",label:"PROGRESS"},cleared:{color:"#2ECC40",bg:"rgba(46, 204, 64, 0.05)",label:"CLEARED"}}[i.status||"received"]||{color:"#999",bg:"transparent"},l=n.color,s=i.sender?i.sender.split(" ").map(d=>d[0]).join("").toUpperCase().slice(0,2):"??";return`
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
                                                    ${i.replies.length>0?i.replies.map(d=>`
                                                        <div style="margin-bottom: 12px; padding: 12px; background: rgba(184, 156, 125, 0.05); border-radius: 12px; border: 1px solid rgba(184, 156, 125, 0.08);">
                                                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                                                <span style="font-weight: 800; font-size: 8px; color: var(--accent); letter-spacing: 1px;">STUDIO REPLY</span>
                                                                <span style="font-size: 8px; color: #bbb;">${new Date(d.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
                                                            </div>
                                                            <p style="font-size: 11px; margin: 0; color: #555; line-height: 1.4;">${d.text}</p>
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

    `}window.toggleMessage=e=>{const o=document.getElementById(`msg-detail-${e}`),t=document.getElementById(`msg-row-${e}`),i=o.style.display==="table-row";document.querySelectorAll('[id^="msg-detail-"]').forEach(r=>{r.style.display="none";const n=r.id.replace("msg-detail-",""),l=document.getElementById(`msg-row-${n}`);if(l){const s=a.messages.find(d=>d.id===n);if(s){const d={received:"rgba(255, 65, 54, 0.05)","in progress":"rgba(255, 133, 27, 0.05)",cleared:"rgba(46, 204, 64, 0.1)"};l.style.background=d[s.status]||"white"}}}),i||(o.style.display="table-row",t.style.background="rgba(184, 156, 125, 0.05)")};window.updateMessageStatus=async(e,o)=>{const t=document.getElementById(`msg-row-${e}`),i=t?t.style.background:"",r={received:{bg:"rgba(255, 65, 54, 0.05)"},"in progress":{bg:"rgba(255, 133, 27, 0.05)"},cleared:{bg:"rgba(46, 204, 64, 0.1)"}};t&&r[o]&&(t.style.background=r[o].bg);try{if(!(await fetch(`${y}/messages/${e}/status`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:o})})).ok)throw new Error("Sync failed");c(`✓ Sync Complete: ${o.toUpperCase()}`,"success"),await b(),$()}catch(n){console.error("Status update error:",n),c("Update failed!","error"),t&&(t.style.background=i),$()}};window.sendMessageReply=async e=>{const o=document.getElementById(`reply-input-${e}`),t=o.value.trim();if(!t)return;const i=document.activeElement;i.disabled=!0,i.innerText="SENDING...";try{await fetch(`${y}/messages/${e}/reply`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:t})}),o.value="",c("Reply logged and synced","success"),setTimeout(async()=>{await b(),$(),window.toggleMessage&&window.toggleMessage(e)},1500)}catch{c("Reply failed","error")}finally{i.disabled=!1,i.innerText="SEND REPLY"}};window.copyToClipboard=(e,o)=>{navigator.clipboard.writeText(e).then(()=>{c(`${o} copied to clipboard`,"success")}).catch(t=>{c("Failed to copy","error")})};L();
