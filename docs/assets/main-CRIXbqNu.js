import"./modulepreload-polyfill-B5Qt9EMX.js";const g="https://shashiniphotogrphy-production.up.railway.app/api",w="https://script.google.com/macros/s/AKfycbz8yajS1Qwjipx_oeK19yYCZLVbm2-wcLwlH05x98fnuH5EzzlJLYpVwMX2fzndPAW1/exec",T="https://script.google.com/macros/s/AKfycbz8yajS1Qwjipx_oeK19yYCZLVbm2-wcLwlH05x98fnuH5EzzlJLYpVwMX2fzndPAW1/exec",m=document.getElementById("app"),f=document.querySelector(".profile-btn");function p(t){return t?t.startsWith("http")||t.startsWith("data:")||t.startsWith("./")||t.startsWith("../")?t:t.startsWith("/")?g+t:g+"/"+t:""}window.onerror=function(t){return console.error("[App Shield]",t),!0};window.onunhandledrejection=function(t){console.error("[App Shield] Rejection",t.reason)};async function C(t,i={},o=2e4){const s=new AbortController,n=setTimeout(()=>s.abort(),o);try{const a=await fetch(t,{...i,signal:s.signal});if(clearTimeout(n),!a.ok)throw new Error(`HTTP ${a.status}`);return await a.json()}catch(a){return clearTimeout(n),console.warn(`[SecureFetch] Error: ${t}`,a.message),null}}let e={user:JSON.parse(localStorage.getItem("user"))||null,view:"home",vaults:[],currentVault:null,photos:[],selectedPhotos:new Set,cms:{items:[],hero:{slides:[],interval:5},graphics:{}},messages:[]};async function $(){document.getElementById("global-loader")||document.body.insertAdjacentHTML("beforeend",`
        <div id="global-loader" class="global-loader-overlay">
            <div class="burst-loader">
                <div></div><div></div><div></div><div></div><div></div><div></div>
                <div></div><div></div><div></div><div></div><div></div><div></div>
            </div>
        </div>
        `);const t=document.getElementById("global-loader");window.showLoader=()=>t.classList.add("active"),window.hideLoader=()=>t.classList.remove("active"),window.state=e,window.render=h,window.onscroll=()=>{document.body.classList.toggle("scrolled",window.scrollY>50)},e.view==="home"&&document.body.classList.add("home-view"),window.setView=(l,u=null,d=!0)=>{e.view===l&&u===null||(e.view=l,window.innerWidth<768&&(e.viewMode="cards"),document.body.classList.toggle("home-view",l==="home"),document.querySelectorAll(".nav-link").forEach(y=>y.classList.toggle("active",y.dataset.view===l)),document.querySelectorAll(".mobile-nav-link").forEach(y=>y.classList.toggle("active",y.dataset.view===l)),d&&history.pushState({view:l},"",`#${l}`),h(),x().then(()=>{(l==="home"||l==="gallery")&&h()}))};const i=()=>{const l=window.location.hash.substring(1);l&&["home","gallery","bookings","vault","messages","profile"].includes(l)&&window.setView(l,null,!1)};window.onpopstate=l=>{l.state&&l.state.view?window.setView(l.state.view,null,!1):i()||window.setView("home",null,!1)},history.state?i():history.replaceState({view:e.view},"",`#${e.view}`),M(),P(),window.showLoader();const o=x().catch(l=>console.warn("Background fetch failed",l)),s=new Promise(l=>setTimeout(l,1500));await Promise.race([o,s]),window.hideLoader();const n=e.view;o.finally(()=>{e.view===n&&h()});const a=document.getElementById("hamburger-btn"),r=document.getElementById("close-menu-btn"),c=document.getElementById("mobile-menu");setInterval(async()=>{const l=window.location.hash.substring(1)||"home";await x(),(e.view==="home"||e.view==="gallery"||l==="home")&&(h(),e.view==="home"&&k())},6e4),a&&c&&(a.onclick=()=>c.classList.add("active")),r&&c&&(r.onclick=()=>c.classList.remove("active")),f&&(f.onclick=()=>{e.user?(e.view="profile",h()):window.showLoginModal()}),window.showLoginModal=()=>{const l=document.createElement("div");l.className="modal-overlay",l.innerHTML=`
            <div class="login-modal">
                <div style="width: 60px; height: 60px; background: rgba(184, 156, 125, 0.1); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; color: var(--accent);">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                </div>
                <h2>Login / Sign Up</h2>
                <p>Enter your details below to access your account and view your photography collections.</p>
                
                <div class="input-group" style="margin-bottom: 25px;">
                    <label class="input-label-premium">MOBILE NUMBER</label>
                    <input type="tel" id="login-mobile" class="login-input" placeholder="+94 7X XXX XXXX" maxlength="10" autofocus oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10)">
                </div>

                <div class="input-group" style="margin-bottom: 35px;">
                    <label class="input-label-premium">YOUR FULL NAME</label>
                    <input type="text" id="login-name" class="login-input" placeholder="e.g. John Doe">
                </div>
                
                <button class="cta-btn" id="login-submit" style="width: 100%; padding: 22px; font-size: 14px; letter-spacing: 3px; font-weight: 800;">SUBMIT ➔</button>
                <div class="login-footer-link" onclick="this.closest('.modal-overlay').remove()">Cancel & Go Back</div>
            </div>
        `,document.body.appendChild(l),setTimeout(()=>document.getElementById("login-mobile").focus(),100),document.getElementById("login-submit").onclick=async()=>{const u=document.getElementById("login-mobile").value,d=document.getElementById("login-name").value;if(u.length!==10)return alert("Please enter a valid 10-digit mobile number.");if(!d)return alert("Please enter your name.");window.showLoader();const y={mobile:u,name:d};localStorage.setItem("user",JSON.stringify(y)),e.user=y;try{await fetch(w,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"logLogin",mobile:u,name:d})})}catch(S){console.error("Cloud log failed:",S)}window.hideLoader(),l.remove(),h(),e.view==="vault"||e.view==="profile"?setView(e.view):alert("Welcome, "+d+"!")}},window.logout=()=>{confirm("Are you sure you want to logout?")&&(localStorage.removeItem("user"),e.user=null,e.vaults=[],setView("home"))},document.querySelectorAll(".mobile-nav-link").forEach(l=>{l.onclick=u=>{u.preventDefault();const d=l.dataset.view;d==="profile"?renderProfileView():setView(d),c.classList.remove("active")}}),h(),setInterval(async()=>{(e.view==="home"||e.view==="gallery")&&(await x(),h())},6e4)}async function x(){try{const t=await C(`${g}/cms`);t&&(e.cms={items:t.items||[],hero:t.hero||{slides:[],interval:5},graphics:t.graphics||{}},console.log("[CMS Sync] Local cache loaded."));const i=await fetch(`${T}?action=getCMS&t=${Date.now()}`).then(o=>o.json()).catch(()=>null);if(i){if(e.cms.items=i.items||[],i.hero&&(e.cms.hero=i.hero),i.graphics){const o=window.location.hostname.includes("localhost")||window.location.hostname.includes("127.0.0.1");Object.keys(i.graphics).forEach(s=>{(!e.cms.graphics[s]||!o)&&(e.cms.graphics[s]=i.graphics[s])})}console.log("[CMS Sync] Sheet data merged (Master).");return}}catch(t){console.error("[CMS Sync] Sync process had issues:",t)}}function M(){localStorage.getItem("theme")==="dark"&&document.body.classList.add("dark-mode"),window.toggleTheme=()=>{document.body.classList.toggle("dark-mode");const i=document.body.classList.contains("dark-mode")?"dark":"light";localStorage.setItem("theme",i)}}function P(){document.querySelectorAll(".nav-link, .mobile-nav-link").forEach(t=>{t.addEventListener("click",i=>{i.preventDefault();const o=t.getAttribute("href");if(o&&o.startsWith("#")){const n=o.substring(1);if(e.view!=="home")setView("home"),setTimeout(()=>{const r=document.getElementById(n);r&&r.scrollIntoView({behavior:"smooth"})},100);else{const r=document.getElementById(n);r&&r.scrollIntoView({behavior:"smooth"})}const a=document.getElementById("mobile-menu");a&&a.classList.remove("active");return}const s=t.dataset.view;if(s){if(s==="vault"&&!e.user)return showLoginModal();if(e.view!==s){setView(s);const n=document.getElementById("mobile-menu");n&&n.classList.remove("active")}}})})}window.showAdminLoginModal=()=>{const t=document.getElementById("mobile-menu");t&&t.classList.remove("active");const i=document.createElement("div");i.className="modal-overlay",i.style.zIndex="4000",i.innerHTML=`
        <div class="login-modal" style="max-width:380px;">
            <h2 style="text-align:center; margin-bottom:25px;">Admin Access</h2>
            <div class="input-group" style="margin-bottom: 20px;">
                <label class="input-label-premium">USERNAME</label>
                <input type="text" id="admin-user" class="login-input" placeholder="Admin Username">
            </div>
            <div class="input-group" style="margin-bottom: 30px;">
                <label class="input-label-premium">PASSWORD</label>
                <input type="password" id="admin-pass" class="login-input" placeholder="••••••">
            </div>
            
            <button class="cta-btn" id="admin-submit" style="width: 100%; padding: 18px;">SECURE LOGIN ➔</button>
            <div class="login-footer-link" onclick="this.closest('.modal-overlay').remove()">Cancel</div>
        </div>
    `,document.body.appendChild(i),setTimeout(()=>{const o=document.getElementById("admin-user");o&&o.focus()},100),document.getElementById("admin-submit").onclick=()=>{const o=document.getElementById("admin-user").value,s=document.getElementById("admin-pass").value;o==="admin123"&&s==="098765"?(sessionStorage.setItem("adminLoggedIn","true"),window.location.href="./admin.html"):alert("Invalid Credentials")}};function h(){if(window.scrollTo(0,0),document.body.classList.toggle("home-view",e.view==="home"),f)if(e.user){const t=e.user.name||"User",i=t.charAt(0).toUpperCase();f.innerHTML=`
                <div class="profile-icon">
                    <span>${i}</span>
                </div>
                <div class="profile-text-group">
                    <span class="profile-label">WELCOME,</span>
                    <span class="profile-name">${t}</span>
                </div>
            `}else f.innerHTML=`
                <div class="profile-icon" style="background: transparent; border: 1.5px solid var(--border-color); color: var(--text-primary);">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                <div class="profile-text-group">
                    <span class="profile-label">CLIENT PORTAL</span>
                    <span class="profile-name" style="font-size: 11px;">SIGN IN</span>
                </div>
            `;switch(e.view){case"home":z();break;case"gallery":B();break;case"bookings":N();break;case"vault":O();break;case"messages":I();break;case"profile":renderProfileView();break}}function z(){var t,i,o;m.innerHTML=`

        <section class="new-hero fade-in">
            <!-- Dynamic Hero Content (Video / Image) -->
            <div id="hero-media-container" style="position: absolute; inset:0; z-index:1;">
                ${e.cms.hero.slides.length>0?e.cms.hero.slides[0].type==="video"?`<video src="${p(e.cms.hero.slides[0].url)}" class="hero-slide-item" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:1; z-index:1;" muted loop playsinline autoplay></video>`:`<img src="${p(e.cms.hero.slides[0].url)}" class="hero-slide-item" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:1; z-index:1;">`:`
                     <div style="position:absolute; inset:0; background: #000;"></div>
                     <img src="./logo.png" class="hero-slide-bg" alt="Shashini Photography" style="opacity:0.3; object-fit: contain; width: 60%; height: 60%; left: 50%; top: 50%; transform: translate(-50%, -50%); position: absolute;">
                 `}
            </div>
            
            <div class="hero-main-content" style="z-index: 2; position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 0 20px;">
                <h1 class="hero-pro-title fade-in-up" style="animation-delay: 0.1s;">
                    SHASHINI PHOTOGRAPHY
                </h1>
                
                <p class="hero-desc fade-in-up" style="animation-delay: 0.2s; color: rgba(255,255,255,0.95); font-size: 16px; max-width: 900px; margin: 0 auto 30px auto; font-weight: 500; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">
                    Capturing love, tradition, and togetherness through my lens. Every wedding, every smile, every emotion is photographed with respect, care, and attention to detail. Because these moments are once in a lifetime. Memories that stay close to your heart.
                </p>

                <div class="hero-contact-row fade-in-up" style="animation-delay: 0.3s;">
                     <div class="hero-contact-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--accent)" stroke="none"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 1.25 0 2.45.2 3.57.57.35.13.44.52.24 1.02l-2.2 2.2z"/></svg>
                        <span>+91 91595 15252</span>
                    </div>
                    <div class="hero-contact-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--accent)" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        <span>Dindigul, Tamil Nadu</span>
                    </div>
                </div>

                <div class="hero-btn-group fade-in-up" style="animation-delay: 0.4s; display: flex; gap: 0;">
                    <button class="hero-btn-services" onclick="setView('gallery')">OUR SERVICES</button>
                    <button class="hero-btn-enquiry" onclick="setView('messages')">MAKE AN ENQUIRY</button>
                </div>
            </div>

            <!-- Right Edge Socials -->
            <div class="hero-right-socials fade-in" style="animation-delay: 0.5s;">
                <a href="https://www.instagram.com/shashini_photography" target="_blank" class="social-circle-right" title="Instagram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="tel:+919159515252" class="social-circle-right" title="Call Us">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </a>
                <a href="mailto:shashiniphotography@gmail.com" class="social-circle-right" title="Email Us">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </a>
            </div>
        </section>

        <!-- 1. Running Marquee -->
        <div class="marquee-container">
            <div class="marquee-content">
                <span class="marquee-item">Wedding Photography <span>•</span></span>
                <span class="marquee-item">Cinematic Films <span>•</span></span>
                <span class="marquee-item">Fine Art Portraits <span>•</span></span>
                <span class="marquee-item">Family Legacy <span>•</span></span>
                <span class="marquee-item">Candid Moments <span>•</span></span>
                <span class="marquee-item">Destination Shoots <span>•</span></span>
                <!-- Duplicate for seamless loop -->
                <span class="marquee-item">Wedding Photography <span>•</span></span>
                <span class="marquee-item">Cinematic Films <span>•</span></span>
                <span class="marquee-item">Fine Art Portraits <span>•</span></span>
                <span class="marquee-item">Family Legacy <span>•</span></span>
            </div>
        </div>
        


        <!-- 3. The Introduction (The Artist) -->
        <section class="container fade-in-up" style="margin-top: 100px;">
            <div class="premium-grid-card" style="background: var(--card-bg); border-radius: 40px; overflow: hidden; display: grid; grid-template-columns: 1fr 1fr; box-shadow: var(--shadow-lg); transition: all 0.5s ease;">
                <!-- Left: Image -->
                <div style="position: relative; min-height: 500px; overflow: hidden;">
                     <img src="${(t=e.cms.graphics)!=null&&t.artist?p(e.cms.graphics.artist):"./logo.png"}" alt="The Artist" class="story-img-zoom" style="width: 100%; height: 100%; object-fit: contain; background: var(--card-bg); position: absolute; inset: 0; transition: transform 0.8s cubic-bezier(0.19, 1, 0.22, 1); opacity: 0.6;">
                </div>

                <!-- Right: Content -->
                <div style="padding: 60px; display: flex; flex-direction: column; justify-content: center;">
                    <span class="section-subtitle">THE ARTIST</span>
                    <h2 class="section-title" style="margin-bottom: 30px;">More than just <br>a photographer.</h2>
                    <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.8; color: var(--text-secondary); font-style: italic;">
                        "I believe that the best photos aren't taken; they are felt. My job isn't to control the moment, but to anticipate it."
                    </p>
                    <p style="font-size: 15px; margin-bottom: 40px; line-height: 1.8; color: var(--text-secondary);">
                         With over a decade of experience in Tamil Nadu and beyond, I treat every event as if it were my own family's celebration. From the subtle tear in a father's eye to the burst of laughter in the reception, nothing goes unnoticed.
                    </p>
                    
                    <div style="display: flex; gap: 40px; border-top: 1px solid var(--border-color); padding-top: 30px;">
                        <div>
                            <span style="font-size: 36px; font-weight: 900; display: block; color: var(--text-primary);">150+</span>
                            <span style="font-size: 11px; text-transform: uppercase; color: var(--accent); letter-spacing: 2px; font-weight: 700;">Weddings</span>
                        </div>
                        <div>
                            <span style="font-size: 36px; font-weight: 900; display: block; color: var(--text-primary);">100%</span>
                            <span style="font-size: 11px; text-transform: uppercase; color: var(--accent); letter-spacing: 2px; font-weight: 700;">Happiness</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 3. Dynamic Services (Experience Categories) -->
        <section class="container fade-in-up" style="margin-top: 120px;">
            <div class="section-header">
                <div>
                    <span class="section-subtitle">WHAT WE DO</span>
                    <h2 class="section-title">Capturing Life's Archive</h2>
                </div>
                <button class="cta-btn" onclick="setView('bookings')">CHECK AVAILABILITY</button>
            </div>
            
            <div class="specialty-carousel-wrapper">
                <button class="carousel-btn prev" onclick="document.querySelector('.specialty-track').scrollBy({left: -350, behavior: 'smooth'})">←</button>
                <div class="specialty-track stagger-mobile">
                     <!-- 1. Weddings -->
                    <div class="specialty-card fade-in-up">
                        <div class="specialty-icon">💍</div>
                        <h3>Weddings</h3>
                        <p>Eternalizing your "I Do" moments with a blend of tradition, emotion, and modern elegance.</p>
                    </div>
                    <!-- 2. Candid -->
                    <div class="specialty-card fade-in-up">
                        <div class="specialty-icon">📸</div>
                        <h3>Candid</h3>
                        <p>Unscripted, natural, and artistic. Capturing the raw beauty of spontaneous moments.</p>
                    </div>
                     <!-- 3. Family -->
                    <div class="specialty-card fade-in-up">
                        <div class="specialty-icon">👨‍👩‍👧‍👦</div>
                        <h3>Family</h3>
                        <p>Capturing the warmth, love, and connection of your loved ones in timeless frames.</p>
                    </div>
                    <!-- 4. Events -->
                    <div class="specialty-card fade-in-up">
                        <div class="specialty-icon">✨</div>
                        <h3>Events</h3>
                        <p>Grand celebrations or intimate gatherings, we cover the energy of every event.</p>
                    </div>
                     <!-- 5. Birthday -->
                    <div class="specialty-card fade-in-up">
                        <div class="specialty-icon">🎂</div>
                        <h3>Birthday</h3>
                        <p>Celebrate another year of joy with vibrant, fun, and memorable birthday captures.</p>
                    </div>
                     <!-- 6. Baby Shower -->
                    <div class="specialty-card fade-in-up">
                        <div class="specialty-icon">🤰</div>
                        <h3>Baby Shower</h3>
                        <p>Welcoming a new life? We capture the anticipation and glow of your growing family.</p>
                    </div>
                     <!-- 7. Maturity (Puberty Ceremony) -->
                    <div class="specialty-card fade-in-up">
                        <div class="specialty-icon">🌸</div>
                        <h3>Puberty Ceremony</h3>
                        <p>Honoring tradition and growth. Beautiful portraits marking this special coming-of-age milestone.</p>
                    </div>
                     <!-- 8. Corporate -->
                    <div class="specialty-card fade-in-up">
                        <div class="specialty-icon">🤝</div>
                        <h3>Corporate</h3>
                        <p>Professional headshots, event coverage, and branding imagery to elevate your business.</p>
                    </div>
                     <!-- 9. Portraits -->
                    <div class="specialty-card fade-in-up">
                        <div class="specialty-icon">👤</div>
                        <h3>Portraits</h3>
                        <p>Individual or group sessions that highlight personality, style, and character.</p>
                    </div>
                </div>
                <button class="carousel-btn next" onclick="document.querySelector('.specialty-track').scrollBy({left: 350, behavior: 'smooth'})">→</button>
            </div>
        </section>

        <!-- 4. Exhibition Preview (Gallery) -->
        <section class="container fade-in-up" style="margin-top: 120px;">
             ${A()}
        </section>

        <!-- 5. How It Works (Process) -->
        <section class="container fade-in-up" style="margin-top: 120px;">
            <div style="text-align: center; max-width: 600px; margin: 0 auto;">
                <span class="section-subtitle">THE EXPERIENCE</span>
                <h2 class="section-title">From "Hello" to <br>Heirloom.</h2>
            </div>
            
            <div class="process-grid">
                <div class="process-step">
                    <div class="step-number">01</div>
                    <div class="step-icon">💬</div>
                    <h3>Consultation</h3>
                    <p>We start with a chat. Coffee or call, we discuss your vision, timeline, and must-have shots.</p>
                </div>
                <div class="process-step">
                    <div class="step-number">02</div>
                    <div class="step-icon">📸</div>
                    <h3>The Magic Day</h3>
                    <p>Relax. We handle the angles, lighting, and direction, so you can just be present in the moment.</p>
                </div>
                <div class="process-step">
                    <div class="step-number">03</div>
                    <div class="step-icon">🎁</div>
                    <h3>The Reveal</h3>
                    <p>Receive your curated gallery and private vault link. Select your favorites for the final album.</p>
                </div>
            </div>
        </section>

        <!-- 6. Love Notes (Testimonials) -->
        <section class="container fade-in-up" style="margin-top: 120px; background: var(--bg-color);">
             <div class="section-header">
                <div>
                     <span class="section-subtitle">LOVE NOTES</span>
                     <h2 class="section-title">Kind Words</h2>
                </div>
             </div>
             
             <div class="love-notes-wrapper" style="position: relative;">
                <button class="carousel-btn prev" style="left: -20px;" onclick="document.querySelector('.love-notes-scroller').scrollBy({left: -400, behavior: 'smooth'})">←</button>
                 <div class="love-notes-scroller" style="scroll-behavior: smooth;">
                    <div class="love-note-card">
                        <p class="love-note-quote">"We were worried about being awkward in front of the camera, but the team made us feel so comfortable. The photos are absolutely stunning!"</p>
                        <span class="love-note-author">— Priya & Rahul</span>
                    </div>
                    <div class="love-note-card">
                        <p class="love-note-quote">"Professional, punctual, and incredibly talented. They captured moments we didn't even notice happening. Highly recommended!"</p>
                        <span class="love-note-author">— Anita S.</span>
                    </div>
                    <div class="love-note-card">
                        <p class="love-note-quote">"The private vault feature is amazing. It made selecting photos for our album so easy and secure. Truly a premium experience."</p>
                        <span class="love-note-author">— The Kumar Family</span>
                    </div>
                     <div class="love-note-card">
                        <p class="love-note-quote">"Best decision we made for our wedding. The cinematic video still makes us cry happy tears every time we watch it."</p>
                        <span class="love-note-author">— Karthik & Meera</span>
                    </div>
                 </div>
                <button class="carousel-btn next" style="right: -20px;" onclick="document.querySelector('.love-notes-scroller').scrollBy({left: 400, behavior: 'smooth'})">→</button>
             </div>
        </section>

        <!-- 7. Our Story (Moved to Bottom) -->
        <!-- 7. Our Story (Moved to Bottom) -->
        <section id="about-section" class="container fade-in-up" style="margin-top: 100px; position: relative; z-index: 10;">
             <!-- Match Enquiry Section Dimensions EXACTLY but flipped content -->
             <div class="premium-grid-card" style="background: var(--card-bg); border-radius: 40px; overflow: hidden; display: grid; grid-template-columns: 1fr 1fr; box-shadow: var(--shadow-lg); transition: all 0.5s ease;">
                <!-- Left: Image (Full Grid Cell) -->
                <div style="position: relative; min-height: 400px; overflow: hidden;">
                    <img src="${(i=e.cms.graphics)!=null&&i.whoWeAre?p(e.cms.graphics.whoWeAre):"./logo.png"}" alt="Our Story" class="story-img-zoom" style="width: 100%; height: 100%; object-fit: contain; background: var(--card-bg); position: absolute; inset: 0; transition: transform 0.8s cubic-bezier(0.19, 1, 0.22, 1); opacity: 0.6;">
                </div>

                <!-- Right: Content -->
                <div class="story-content slide-in-right" style="padding: 60px; display: flex; flex-direction: column; justify-content: center;">
                    <span class="fade-in-up" style="animation-delay: 0.1s; color: #F5A623; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; font-size: 11px; margin-bottom: 20px; display: block;">WHO WE ARE</span>
                    <h2 class="section-title fade-in-up" style="animation-delay: 0.2s; margin-bottom: 20px;">Crafting Visual <br>Legacies.</h2>
                    <p class="fade-in-up" style="animation-delay: 0.3s; margin-bottom: 20px;">
                        Shashini Studio was created with a love for capturing real emotions and meaningful moments. Rooted in Tamil Nadu, we believe photography is about stories, not just pictures.
                    </p>
                    <p class="fade-in-up" style="animation-delay: 0.4s; margin-bottom: 0;">
                         We focus on natural expressions, honest smiles, and moments that feel truly yours.
                    </p>
                </div>
            </div>
        </section>

        <!-- 8. Enquiry Section -->
        <section class="container fade-in-up" style="margin-top: 100px; margin-bottom: 100px;">
            <div class="premium-grid-card" style="background: var(--card-bg); border-radius: 40px; overflow: hidden; display: grid; grid-template-columns: 1fr 1fr; box-shadow: var(--shadow-lg); transition: all 0.5s ease;">
                <div style="padding: 60px; display: flex; flex-direction: column; justify-content: center;">
                    <span class="section-subtitle">READY TO BEGIN?</span>
                    <h2 class="section-title" style="margin-bottom: 20px;">Let's Create <br>Something Beautiful.</h2>
                    <p style="margin-bottom: 30px;">Dates fill up fast. Send us a message to check availability for your special day.</p>
                    <button class="cta-btn" onclick="setView('messages')" style="width: fit-content;">START CONVERSATION ➔</button>
                </div>
                <!-- Right: Image (Converted to img tag for zoom effect) -->
                <div style="position: relative; min-height: 400px; overflow: hidden;">
                     <img src="${(o=e.cms.graphics)!=null&&o.readyToBegin?p(e.cms.graphics.readyToBegin):"./logo.png"}" alt="Enquiry" class="story-img-zoom" style="width: 100%; height: 100%; object-fit: contain; background: var(--card-bg); position: absolute; inset: 0; transition: transform 0.8s cubic-bezier(0.19, 1, 0.22, 1); opacity: 0.6;">
                </div>
            </div>
        </section>
    `,e.view==="home"&&(document.body.classList.add("home-view"),k())}function A(){const t=i=>"";return`
        <div class="section-header" style="flex-direction: column; align-items: center; text-align: center; gap: 10px;">
            <div>
                <span class="section-subtitle">STUDIO HIGHLIGHTS</span>
                <h2 class="section-title">The Master Exhibition</h2>
            </div>
            <button class="cta-btn" style="padding: 12px 25px; font-size: 11px; margin: 10px 0; border-radius: 12px;" onclick="setView('gallery')">EXPLORE EXHIBITION ➔</button>
        </div>
        
        <div class="exhibition-grid">
             ${e.cms.items.length===0?`
                <div style="grid-column: 1/-1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                    <div style="aspect-ratio: 1; border-radius: 20px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 40px;">⌛</div>
                    <div style="aspect-ratio: 1; border-radius: 20px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 40px;">📸</div>
                    <div style="aspect-ratio: 1; border-radius: 20px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 40px;">✨</div>
                </div>
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                   <p style="color: #999; font-size: 12px; font-weight: 600; letter-spacing: 1px;">CURATING THE MASTERPIECES...</p>
                </div>
            `:e.cms.items.slice(0,4).map((i,o)=>{var c;const s=i.url&&(i.url.startsWith("data:video/")||i.url.endsWith(".mp4")),n=i.url&&(i.url.includes("youtube.com")||i.url.includes("youtu.be")),a=t();let r="";return n?r=`<iframe src="https://www.youtube.com/embed/${(c=i.url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/))==null?void 0:c[1]}" 
                            style="width: 100%; height: 100%; border: none;" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen></iframe>`:s?r=`<video src="${p(i.url)}" muted loop playsinline onmouseover="this.play()" onmouseout="this.pause()"></video>`:r=`<img src="${p(i.url)}" alt="${i.title||"Exhibition Image"}">`,`
                    <div class="exhibition-item ${a} fade-in-up" 
                         style="animation-delay: ${.2+.1*o}s; cursor: pointer;" onclick="window.openGalleryLightbox(${o})">
                         ${r}
                    </div>
                `}).join("")}
        </div>
        <div style="text-align: center; margin-top: 40px;">
             <button class="cta-btn" style="padding: 16px 40px; font-size: 13px; letter-spacing: 2px; border-radius: 50px;" onclick="setView('gallery')">
                VIEW FULL GALLERY ➔
             </button>
        </div>
    `}function B(){m.innerHTML=`
        <div class="container slide-up" style="margin-top: 60px;">
            <div class="section-header" style="flex-direction: column; align-items: center; text-align: center;">
                <div>
                    <span class="section-subtitle">PORTFOLIO</span>
                    <h2 class="section-title">Visual Narratives</h2>
                </div>
            </div>
            <div class="photo-grid stagger-mobile" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px;">
                ${e.cms.items.length===0?`
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #999;">
                        <p>No gallery items found.</p>
                    </div>
                `:e.cms.items.map((t,i)=>{var a;const o=t.url&&(t.url.startsWith("data:video/")||t.url.endsWith(".mp4")),s=t.url&&(t.url.includes("youtube.com")||t.url.includes("youtu.be"));let n="";return s?n=`<iframe src="https://www.youtube.com/embed/${(a=t.url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/))==null?void 0:a[1]}" 
                            style="width: 100%; height: 100%; border: none;" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen></iframe>`:o?n=`<video src="${p(t.url)}" style="width:100%; height:100%; object-fit:cover;" muted controls playsinline></video>`:n=`<img src="${p(t.url)}" alt="${t.title}" loading="lazy" style="width:100%; height:100%; object-fit:cover;">`,`
                    <div class="photo-item" style="border-radius: 20px; overflow: hidden; position: relative; aspect-ratio: 1; cursor: pointer;" onclick="window.openGalleryLightbox(${i})">
                        ${n}
                    </div>
                `}).join("")}
            </div>
        </div>
        `}function N(){m.innerHTML=`
        <div class="container slide-up" style="margin-top: 60px; padding-bottom: 100px;">
            <div class="section-header" style="margin-bottom: 50px; flex-direction: column; align-items: center; text-align: center;">
                <span class="section-subtitle">SECURE YOUR MOMENT</span>
                <h2 class="section-title">Book a Date</h2>
                <p style="margin-top: 15px; font-size: 15px; color: var(--text-secondary); max-width: 600px; line-height: 1.6;">
                    Ready to create something beautiful together? Use the calendar below to check our upcoming availability and secure your session directly. We look forward to capturing your story.
                </p>
            </div>
            
            <div id="calcom-embed-wrapper" style="max-width: 1000px; width: 100%; margin: 0 auto; height: 750px; border-radius: 30px; overflow: hidden; background: var(--card-bg); border: 1px solid var(--border-color);">
                <!-- Cal inline embed code begins -->
                <div style="width:100%;height:100%;overflow:scroll" id="my-cal-inline-shashini-studio"></div>
                <!-- Cal inline embed code ends -->
            </div>
        </div>
        `,function(t,i,o){let s=function(a,r){a.q.push(r)},n=t.document;t.Cal=t.Cal||function(){let a=t.Cal,r=arguments;if(a.loaded||(a.ns={},a.q=a.q||[],n.head.appendChild(n.createElement("script")).src=i,a.loaded=!0),r[0]===o){const c=function(){s(c,arguments)},l=r[1];c.q=c.q||[],typeof l=="string"?(a.ns[l]=a.ns[l]||c,s(a.ns[l],r),s(a,["initNamespace",l])):s(a,r);return}s(a,r)}}(window,"https://app.cal.com/embed/embed.js","init"),Cal("init","shashiniphotography",{origin:"https://app.cal.com"}),Cal.ns.shashiniphotography("inline",{elementOrSelector:"#my-cal-inline-shashini-studio",config:{layout:"month_view",useSlotsViewOnSmallScreen:"true"},calLink:"indresh-j2lwto/shashiniphotography"}),Cal.ns.shashiniphotography("ui",{hideEventTypeDetails:!1,layout:"month_view"})}async function O(){if(!e.user)return showLoginModal();m.innerHTML='<div class="container" style="text-align:center; padding: 100px;"><p>Checking your photography vaults...</p></div>';try{const t=await fetch(`${g}/vaults?mobile=${e.user.mobile}`);e.vaults=await t.json(),m.innerHTML=`
            <div class="container slide-up" style="margin-top: 60px;">
                <div class="section-header" style="flex-direction: column; align-items: center; text-align: center;">
                    <div>
                        <span class="section-subtitle">PRIVATE COLLECTION</span>
                        <h2 class="section-title">Your Photography Vaults</h2>
                    </div>
                </div>
                ${e.vaults.length===0?`
                    <div style="text-align: center; padding: 100px; width: 100%; max-width: 500px; margin: 0 auto; background: var(--card-bg); border-radius: 30px; border: 1px solid var(--border-color);">
                        <div style="font-size: 50px; margin-bottom: 20px;">📂</div>
                        <h3 style="margin-bottom: 10px; font-family: 'Playfair Display', serif;">No Collections Found</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 25px; line-height: 1.6;">
                            It seems there are no active photography collections linked to this mobile number yet. If you recently had a session, please allow 24-48 hours for your vault to be created.
                        </p>
                        <button class="cta-btn" onclick="setView('messages')">CONTACT SUPPORT</button>
                    </div>
                `:`
                    <div class="vault-sessions-container">
                        ${e.vaults.map(i=>`
                            <div class="vault-session-card" onclick="window.enterVault('${i.vaultId}', '${i.id}')">
                                <h3>${i.sessionTitle}</h3>
                                <div class="vault-status-badge ${i.status}">${i.status.toUpperCase()}</div>
                            </div>
                        `).join("")}
                    </div>
                `}
            </div>
        `}catch(t){console.error("[Vault Access Error]",t),m.innerHTML=`<div class="container" style="text-align:center; padding: 100px;">
            <h3>Could not connect to your vault.</h3>
            <p style="color: #888; margin-top: 10px; font-size: 12px;">Error: ${t.message}</p>
            <p style="color: #ccc; font-size: 11px;">Please check if the backend is running.</p>
        </div>`}}window.enterVault=async(t,i)=>{var o;if((!e.vaults||e.vaults.length===0)&&e.user)try{const s=await fetch(`${g}/vaults?mobile=${e.user.mobile}`);e.vaults=await s.json()}catch(s){console.error("Failed to lazy load vaults:",s)}if(e.currentVault=(o=e.vaults)==null?void 0:o.find(s=>s.id&&String(s.id)===String(i)||s.vaultId===t),!e.currentVault){console.error("Vault not found locally:",i),m.innerHTML=`<div class="container" style="text-align:center; padding: 100px;">
            <p>Vault access error: Vault #${i} not found in your list.</p>
            <p style="font-size: 11px; color: #999;">Please ensure you are logged in with the correct mobile number.</p>
            <button class="cta-btn" onclick="state.view='vault'; render();" style="margin-top: 20px;">BACK TO VAULTS</button>
        </div>`;return}m.innerHTML='<div class="container" style="text-align:center; padding: 100px;"><p>Accessing photos...</p></div>';try{const[s,n]=await Promise.all([fetch(`${g}/vaults/selections`).then(r=>r.json()),fetch(`${g}/vaults/${t}/photos`).then(r=>r.json())]);if(n.error)throw new Error(n.error);const a=s.find(r=>r.vaultId===t&&r.mobile===e.user.mobile);if(e.selectedPhotos=new Set(a?a.selections:[]),e.photos=n.photos||[],e.photos.length===0){m.innerHTML=`
                <div class="container" style="text-align:center; padding: 100px;">
                    <h3>Vault empty or inaccessible</h3>
                    <p style="color: #666; margin-top: 10px;">We haven't added photos to this folder or permissions are missing.</p>
                    <button class="cta-btn" style="margin-top: 20px;" onclick="state.view='vault'; render();">BACK TO VAULTS</button>
                </div>
            `;return}L()}catch(s){m.innerHTML=`
            <div class="container" style="text-align:center; padding: 100px;">
                <h3>Access Error</h3>
                <p style="color: #666; margin-top: 10px;">${s.message||"We could not verify your folder."}</p>
                <button class="cta-btn" style="margin-top: 20px;" onclick="state.view='vault'; render();">BACK TO VAULTS</button>
            </div>
        `}};function L(){const t=e.currentVault.status==="locked";if(m.innerHTML=`
        <div class="container slide-up" style="margin-top: 60px;">
            <div class="section-header" style="margin-bottom: 30px; flex-direction: column; align-items: center; text-align: center;">
                <div>
                    <span class="section-subtitle">${t?"🔒 LOCKED":"📸 ACTIVE"} COLLECTION</span>
                    <h2 class="section-title">${e.currentVault.sessionTitle}</h2>
                    <p style="font-size: 12px; color: #999; margin-top: 8px;">
                        ${e.photos.length} photos • ${e.selectedPhotos.size} selected
                        ${t?"":" • Click to select, tap image to preview"}
                    </p>
                </div>
                ${t?'<div style="padding: 12px 24px; background: rgba(231, 76, 60, 0.1); border-radius: 15px; color: #E74C3C; font-weight: 700; font-size: 12px;">SELECTION FINALIZED</div>':`
                    <div style="display: flex; gap: 15px; align-items: center;">
                        <button class="cta-btn" id="save-selection" style="padding: 12px 30px; font-size: 13px; background: rgba(184, 156, 125, 0.2); color: var(--accent); border: 2px solid var(--accent);">
                            💾 SAVE SELECTION (${e.selectedPhotos.size})
                        </button>
                        <button class="cta-btn" id="finalize-selection" style="padding: 12px 30px; font-size: 13px; box-shadow: 0 4px 15px rgba(184, 156, 125, 0.3);">
                            ✓ FINALIZE & SUBMIT (${e.selectedPhotos.size})
                        </button>
                    </div>
                `}
            </div>
            
            ${t?"":`
                <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; padding: 15px 20px; margin-bottom: 30px; backdrop-filter: blur(10px);">
                    <p style="font-size: 12px; color: var(--text-secondary); margin: 0; line-height: 1.6;">
                        <strong style="color: var(--accent);">💡 Note:</strong> 
                        Use <strong>SAVE SELECTION</strong> to temporarily save your choices. 
                        Click <strong>FINALIZE & SUBMIT</strong> when you're done - this will create a delivery folder and lock your selection.
                    </p>
                </div>
            `}
            
            <!-- Masonry Grid -->
            <div class="vault-grid">
                ${e.photos.map((i,o)=>{const s=e.selectedPhotos.has(i.id);return`
                        <div class="vault-photo-card ${s?"vault-selected":""}" 
                             data-photo-id="${i.id}"
                             data-photo-index="${o}">
                            <img src="${p(i.url)}" 
                                 loading="lazy" 
                                 referrerpolicy="no-referrer"
                                 onerror="if(!this.dataset.backup1) { this.dataset.backup1=true; this.src='https://lh3.googleusercontent.com/d/${i.id}'; } else if(!this.dataset.backup2) { this.dataset.backup2=true; this.src='https://drive.google.com/uc?export=view&id=${i.id}'; }"
                                 onclick="window.openLightbox(${o})">
                            ${t?"":`
                                <div class="selection-overlay" onclick="event.stopPropagation(); window.togglePhoto('${i.id}')" 
                                     style="position: absolute; top: 15px; right: 15px; width: 40px; height: 40px; background: ${s?"var(--accent)":"rgba(0,0,0,0.5)"}; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; border: 3px solid white;">
                                    <span style="font-size: 18px; color: white;">${s?"✓":"○"}</span>
                                </div>
                            `}
                        </div>
                    `}).join("")}
            </div>
        </div>
    `,!t){const i=document.getElementById("save-selection"),o=document.getElementById("finalize-selection");i&&(i.onclick=V),o&&(o.onclick=H)}}window.openLightbox=t=>{const i=document.createElement("div");i.id="lightbox",i.className="lightbox-overlay",i.innerHTML=`
        <div class="lightbox-container">
            <button class="lightbox-close" onclick="closeLightbox()">✕</button>
            <button class="lightbox-nav lightbox-prev" onclick="navigateLightbox(-1)">‹</button>
            <button class="lightbox-nav lightbox-next" onclick="navigateLightbox(1)">›</button>
            
            <div class="lightbox-content">
                <img id="lightbox-image" src="${p(e.photos[t].url)}" 
                     referrerpolicy="no-referrer"
                     onerror="if(!this.dataset.backup1) { this.dataset.backup1=true; this.src='https://lh3.googleusercontent.com/d/${e.photos[t].id}'; } else if(!this.dataset.backup2) { this.dataset.backup2=true; this.src='https://drive.google.com/uc?export=view&id=${e.photos[t].id}'; }"
                     alt="Photo ${t+1}">
                <div class="lightbox-info">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="lightbox-counter">${t+1} / ${e.photos.length}</span>
                        ${e.currentVault.status!=="locked"?`
                            <button class="lightbox-select-btn ${e.selectedPhotos.has(e.photos[t].id)?"selected":""}" 
                                    onclick="togglePhotoInLightbox(${t})">
                                <span class="select-icon">${e.selectedPhotos.has(e.photos[t].id)?"✓ SELECTED":"+ SELECT"}</span>
                            </button>
                        `:""}
                    </div>
                </div>
            </div>
        </div>
    `,document.body.appendChild(i),document.body.style.overflow="hidden",window.currentLightboxIndex=t,window.lightboxKeyHandler=r=>{r.key==="ArrowLeft"&&navigateLightbox(-1),r.key==="ArrowRight"&&navigateLightbox(1),r.key==="Escape"&&closeLightbox(),r.key===" "&&(r.preventDefault(),togglePhotoInLightbox(window.currentLightboxIndex))},document.addEventListener("keydown",window.lightboxKeyHandler);let o=0,s=0;const n=document.getElementById("lightbox-image");n.addEventListener("touchstart",r=>{o=r.changedTouches[0].screenX}),n.addEventListener("touchend",r=>{s=r.changedTouches[0].screenX,a()});function a(){s<o-50&&navigateLightbox(1),s>o+50&&navigateLightbox(-1)}};window.navigateLightbox=t=>{window.currentLightboxIndex+=t,window.currentLightboxIndex<0&&(window.currentLightboxIndex=e.photos.length-1),window.currentLightboxIndex>=e.photos.length&&(window.currentLightboxIndex=0);const i=document.getElementById("lightbox-image"),o=document.querySelector(".lightbox-counter"),s=document.querySelector(".lightbox-select-btn");i.style.opacity="0",setTimeout(()=>{if(delete i.dataset.backup1,delete i.dataset.backup2,i.src=p(e.photos[window.currentLightboxIndex].url),o.textContent=`${window.currentLightboxIndex+1} / ${e.photos.length}`,s){const n=e.selectedPhotos.has(e.photos[window.currentLightboxIndex].id);s.className=`lightbox-select-btn ${n?"selected":""}`,s.querySelector(".select-icon").textContent=n?"✓ SELECTED":"+ SELECT"}i.style.opacity="1"},200)};window.togglePhotoInLightbox=t=>{window.togglePhoto(e.photos[t].id);const i=document.querySelector(".lightbox-select-btn");if(i){const n=e.selectedPhotos.has(e.photos[t].id);i.className=`lightbox-select-btn ${n?"selected":""}`,i.querySelector(".select-icon").textContent=n?"✓ SELECTED":"+ SELECT"}const o=document.getElementById("save-selection"),s=document.getElementById("finalize-selection");o&&(o.innerHTML=`💾 SAVE SELECTION (${e.selectedPhotos.size})`),s&&(s.innerHTML=`✓ FINALIZE & SUBMIT (${e.selectedPhotos.size})`)};window.closeLightbox=()=>{const t=document.getElementById("lightbox");t&&(t.style.opacity="0",setTimeout(()=>{t.remove(),document.body.style.overflow=""},300)),document.removeEventListener("keydown",window.lightboxKeyHandler),L()};window.togglePhoto=t=>{e.selectedPhotos.has(t)?e.selectedPhotos.delete(t):e.selectedPhotos.add(t),L()};window.openGalleryLightbox=t=>{var u;const i=e.cms.items;if(!i||!i[t])return;const o=i[t],s=o.url&&(o.url.startsWith("data:video/")||o.url.endsWith(".mp4")),n=o.url&&(o.url.includes("youtube.com")||o.url.includes("youtu.be")),a=document.createElement("div");a.id="gallery-lightbox",a.className="lightbox-overlay";let r="";n?r=`<iframe src="https://www.youtube.com/embed/${(u=o.url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/))==null?void 0:u[1]}?autoplay=1" style="width: 100%; aspect-ratio: 16/9; border: none; border-radius: 15px;" allow="autoplay" allowfullscreen></iframe>`:s?r=`<video src="${p(o.url)}" style="max-height: 80vh; max-width: 90vw; border-radius: 15px;" controls autoplay></video>`:r=`<img src="${p(o.url)}" alt="${o.title}" style="max-height: 80vh; max-width: 90vw; object-fit: contain; border-radius: 15px;">`,a.innerHTML=`
        <div class="lightbox-container">
            <button class="lightbox-close" onclick="window.closeGalleryLightbox()">✕</button>
            <button class="lightbox-nav lightbox-prev" onclick="window.navigateGalleryLightbox(-1)">‹</button>
            <button class="lightbox-nav lightbox-next" onclick="window.navigateGalleryLightbox(1)">›</button>
            
            <div class="lightbox-content" style="width: 95%; max-width: 1200px; display: flex; flex-direction: column; align-items: center;">
                <div class="media-wrapper" style="width: 100%; display: flex; justify-content: center; align-items: center;">
                    ${r}
                </div>
            </div>
        </div>
    `,document.body.appendChild(a),document.body.style.overflow="hidden",window.currentGalleryIndex=t,window.galleryKeyHandler=d=>{d.key==="ArrowLeft"&&window.navigateGalleryLightbox(-1),d.key==="ArrowRight"&&window.navigateGalleryLightbox(1),d.key==="Escape"&&window.closeGalleryLightbox()},document.addEventListener("keydown",window.galleryKeyHandler);let c=0,l=0;a.addEventListener("touchstart",d=>{c=d.changedTouches[0].screenX},{passive:!0}),a.addEventListener("touchend",d=>{l=d.changedTouches[0].screenX,l<c-50&&window.navigateGalleryLightbox(1),l>c+50&&window.navigateGalleryLightbox(-1)},{passive:!0})};window.navigateGalleryLightbox=t=>{var l;const i=e.cms.items;window.currentGalleryIndex+=t,window.currentGalleryIndex<0&&(window.currentGalleryIndex=i.length-1),window.currentGalleryIndex>=i.length&&(window.currentGalleryIndex=0);const o=document.getElementById("gallery-lightbox");if(!o)return;const s=i[window.currentGalleryIndex],n=s.url&&(s.url.startsWith("data:video/")||s.url.endsWith(".mp4")),a=s.url&&(s.url.includes("youtube.com")||s.url.includes("youtu.be")),r=o.querySelector(".lightbox-content");let c="";a?c=`<iframe src="https://www.youtube.com/embed/${(l=s.url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/))==null?void 0:l[1]}?autoplay=1" style="width: 100%; aspect-ratio: 16/9; border: none; border-radius: 15px;" allow="autoplay" allowfullscreen></iframe>`:n?c=`<video src="${p(s.url)}" style="max-height: 80vh; max-width: 90vw; border-radius: 15px;" controls autoplay></video>`:c=`<img src="${p(s.url)}" alt="${s.title}" style="max-height: 80vh; max-width: 90vw; object-fit: contain; border-radius: 15px;">`,r.innerHTML=`
        <div class="media-wrapper" style="width: 100%; display: flex; justify-content: center; align-items: center;">
            ${c}
        </div>
    `};window.closeGalleryLightbox=()=>{const t=document.getElementById("gallery-lightbox");t&&(t.style.opacity="0",setTimeout(()=>{t.remove(),document.body.style.overflow="",document.removeEventListener("keydown",window.galleryKeyHandler)},300))};async function V(){if(e.selectedPhotos.size===0)return alert("Please select at least one photo before saving.");const t=document.getElementById("save-selection");t.disabled=!0,t.innerHTML="💾 SAVING...";try{await fetch(`${g}/vaults/select`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mobile:e.user.mobile,vaultId:e.currentVault.vaultId,vaultName:e.currentVault.sessionTitle,selections:Array.from(e.selectedPhotos)})}),alert("✓ Selection saved! You can continue making changes or finalize when ready.")}catch{alert("Failed to save selection. Please try again.")}finally{t.disabled=!1,t.innerHTML=`💾 SAVE SELECTION (${e.selectedPhotos.size})`}}async function H(){if(e.selectedPhotos.size===0)return alert("Please select at least one photo before finalizing.");const t=`⚠️ IMPORTANT: Finalizing will:

✓ Create a delivery folder: "${e.user.mobile}_selected_pics"
✓ Copy ${e.selectedPhotos.size} selected photo(s) to that folder
✓ Lock this vault (no more changes allowed)

Are you sure you want to finalize your selection?`;if(!confirm(t))return;const i=document.getElementById("finalize-selection");i.disabled=!0,i.innerHTML="⏳ FINALIZING...";try{const o=await fetch(`${g}/vaults/finalize`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mobile:e.user.mobile,vaultId:e.currentVault.vaultId,selections:Array.from(e.selectedPhotos),customerId:e.user.mobile})}),s=await o.json();if(o.ok&&s.success){const n=`🎉 Selection Finalized Successfully!

📁 Delivery Folder: ${s.deliveryFolder.name}
📸 Photos Copied: ${s.copyResults.copied} of ${s.copyResults.total}
${s.copyResults.failed>0?`⚠️ Failed: ${s.copyResults.failed}
`:""}
Your vault is now locked. We will process your selected photos.`;alert(n),e.currentVault.status="locked",e.view="vault",h()}else throw new Error(s.error||"Finalization failed")}catch(o){alert(`❌ Finalization Error:

${o.message}

Please contact us for assistance.`),i.disabled=!1,i.innerHTML=`✓ FINALIZE & SUBMIT (${e.selectedPhotos.size})`}}window.renderProfileView=async function(){if(!e.user)return showLoginModal();m.innerHTML='<div class="container" style="text-align:center; padding: 100px;"><p>Loading your profile...</p></div>';try{const[t,i]=await Promise.all([fetch(`${g}/vaults?mobile=${e.user.mobile}`).then(o=>o.json()),fetch(`${w}?action=getProfile&mobile=${e.user.mobile}`).then(o=>o.json())]);i&&i.found?(e.user.name=i.name||e.user.name,e.user.email=i.email||e.user.email,e.user.loginCount=i.loginCount,e.user.lastLogin=i.lastLogin,e.user.collectionSummary=i.collectionSummary):e.user.collectionSummary=t.length+" Sessions",m.innerHTML=`
            <div class="container slide-up" style="margin-top: 60px;">
                <div class="section-header" style="margin-bottom: 40px;">
                    <div>
                        <span class="section-subtitle">CLIENT PORTAL</span>
                        <h2 class="section-title">Your Profile</h2>
                    </div>
                    <button class="cta-btn" style="background: rgba(231, 76, 60, 0.1); color: #E74C3C; border: 1px solid rgba(231, 76, 60, 0.2); padding: 10px 25px;" onclick="window.logout()">LOGOUT</button>
                </div>

                <div class="grid-2" style="gap: 30px;">
                    <!-- Profile Details -->
                    <div class="card" style="padding: 30px; border-radius: 25px; border: 1px solid var(--border-color);">
                        <h3 style="font-family: 'Playfair Display', serif; margin-bottom: 20px;">Your Profile</h3>
                        <p style="font-size: 11px; color: #999; margin-bottom: 25px;">Manage your personal details and contact information.</p>
                        
                        <div class="input-group" style="margin-bottom: 20px;">
                            <label style="font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: 1px; display: block; margin-bottom: 8px;">CLIENT ID (MOBILE)</label>
                            <input type="tel" class="login-input" value="${e.user.mobile}" disabled style="opacity: 0.7; padding: 15px; border-radius: 12px; margin-bottom: 0; background: #f5f5f5; font-weight: 700; color: #555;">
                            <p style="font-size: 9px; color: #999; margin-top: 6px; font-style: italic;">* Unique Client Identifier (Cannot be changed)</p>
                        </div>

                        <div class="input-group" style="margin-bottom: 20px;">
                            <label style="font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: 1px; display: block; margin-bottom: 8px;">FULL NAME</label>
                            <input type="text" id="profile-name" class="login-input" value="${e.user.name||""}" placeholder="Enter your full name" style="padding: 15px; border-radius: 12px; margin-bottom: 0;">
                        </div>

                        <div class="input-group" style="margin-bottom: 30px;">
                            <label style="font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: 1px; display: block; margin-bottom: 8px;">EMAIL ADDRESS <span style="font-weight: 400; color: #ccc; text-transform: lowercase;">(Optional)</span></label>
                            <input type="email" id="profile-email" class="login-input" value="${e.user.email||""}" placeholder="e.g. name@example.com" style="padding: 15px; border-radius: 12px; margin-bottom: 0;">
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            <button class="cta-btn" style="width: 100%; padding: 18px;" id="save-profile-btn" onclick="window.updateProfile()">SAVE CHANGES</button>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <button class="cta-btn" onclick="window.toggleTheme()" style="padding: 18px; background: var(--bg-color); color: var(--text-primary); border: 1px solid var(--border-color); box-shadow: none; display: flex; align-items: center; justify-content: center; gap: 10px;">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="5"></circle>
                                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
                                    </svg>
                                    <span>THEME</span>
                                </button>
                                <button class="cta-btn" onclick="window.logout()" style="padding: 18px; background: white; color: #E74C3C; border: 1px solid #ffdedb; box-shadow: none;">LOG OUT</button>
                            </div>
                        </div>
                    </div>

                    <!-- Statistics / Quick Links -->
                    <div class="card" style="padding: 30px; border-radius: 25px; border: 1px solid var(--border-color); display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <h3 style="font-family: 'Playfair Display', serif; margin-bottom: 20px;">Activity Summary</h3>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 10px;">
                                <div style="padding: 20px; background: rgba(0,0,0,0.02); border-radius: 20px; text-align: center;">
                                    <p style="font-size: 24px; font-weight: 800; color: var(--accent);">${e.user.loginCount||1}</p>
                                    <p style="font-size: 8px; font-weight: 800; color: #999; text-transform: uppercase;">Logins</p>
                                </div>
                                <div style="padding: 20px; background: rgba(0,0,0,0.02); border-radius: 20px; text-align: center;">
                                    <p style="font-size: 24px; font-weight: 800; color: var(--accent);">${t.length}</p>
                                    <p style="font-size: 8px; font-weight: 800; color: #999; text-transform: uppercase;">Vaults</p>
                                </div>
                            </div>
                            <div style="margin-top: 20px; padding: 15px; border-top: 1px solid #eee;">
                                <p style="font-size: 10px; color: #999;">LAST LOGIN: <span style="color: #333; font-weight: 700;">${e.user.lastLogin?new Date(e.user.lastLogin).toLocaleString():"Just now"}</span></p>
                            </div>
                        </div>

                        <div style="margin-top: 30px; display: flex; flex-direction: column; gap: 15px;">
                            <button class="cta-btn" style="width: 100%; padding: 15px; font-size: 11px;" onclick="setView('messages')">CONTACT STUDIO</button>
                            <button class="cta-btn" style="width: 100%; padding: 15px; font-size: 11px; background: var(--bg-color); color: var(--text-primary); border: 1px solid var(--border-color);" onclick="setView('bookings')">BOOK NEW SESSION</button>
                        </div>
                    </div>
                </div>

                <!-- Gallery Vaults Section -->
                <div class="card" style="margin-top: 30px; padding: 30px; border-radius: 25px; border: 1px solid var(--border-color); margin-bottom: 80px;">
                    <h3 style="font-family: 'Playfair Display', serif; margin-bottom: 25px;">Connected Gallery Vaults</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
                        ${t.length===0?`
                            <div style="grid-column: 1/-1; padding: 40px; text-align: center; background: rgba(0,0,0,0.01); border-radius: 20px;">
                                <p style="color: #999; font-size: 13px;">No private gallery vaults linked to this number yet.</p>
                            </div>
                        `:t.map(o=>`
                            <div class="card" style="margin-bottom: 0; padding: 25px; border: 1px solid rgba(0,0,0,0.05); cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);" 
                                 onclick="window.enterVault('${o.vaultId}', '${o.id}')"
                                 onmouseover="this.style.transform='translateY(-5px)'; this.style.borderColor='var(--accent)'; this.style.boxShadow='0 10px 30px rgba(0,0,0,0.05)';"
                                 onmouseout="this.style.transform='none'; this.style.borderColor='rgba(0,0,0,0.05)'; this.style.boxShadow='none';">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                                    <span style="font-size: 9px; font-weight: 900; color: ${o.status==="locked"?"#000000":"var(--accent)"}; text-transform: uppercase; letter-spacing: 1px; background: ${o.status==="locked"?"rgba(0, 0, 0, 0.05)":"rgba(184, 156, 125, 0.1)"}; padding: 4px 10px; border-radius: 10px;">
                                        ${o.status==="locked"?"Locked":"Active"}
                                    </span>
                                    <span style="font-size: 10px; color: #999;">${new Date(o.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h4 style="margin: 0; font-family: 'Playfair Display', serif; font-size: 18px; margin-bottom: 20px;">${o.sessionTitle}</h4>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 11px; font-weight: 700; color: var(--accent);">VIEW PHOTOS ➔</span>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            </div>
        `}catch(t){if(console.error("Profile load error:",t),!e.user)return showLoginModal();m.innerHTML=`
            <div class="container" style="text-align:center; padding: 100px;">
                <h3 style="font-family: 'Playfair Display', serif; margin-bottom: 20px;">Profile Error</h3>
                <p style="color: #666; margin-bottom: 30px;">Could not load profile data. Please check your connection.</p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button class="cta-btn" onclick="window.renderProfileView()" style="padding: 12px 25px;">TRY AGAIN</button>
                    <button class="cta-btn" onclick="window.logout()" style="padding: 12px 25px; background: #fff; color: #E74C3C; border: 1px solid #E74C3C;">LOG OUT</button>
                </div>
            </div>`}};async function I(){m.innerHTML=`
        <div class="container slide-up" style="margin-top: 60px; margin-bottom: 80px;">
            <div class="section-header" style="flex-direction: column; align-items: center; text-align: center;">
                <div>
                    <span class="section-subtitle">GET IN TOUCH</span>
                    <h2 class="section-title">Send an Enquiry</h2>
                </div>
            </div>
            <div style="max-width: 800px; margin: 0 auto;">
                ${j()}
            </div>
        </div>
    `}function j(){var t,i;return`
        <div class="card enquiry-card-premium" style="width: 100%; padding: 50px; border-radius: 40px; box-shadow: 0 40px 100px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 35px;">
                <h3 style="font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 15px;">Start Your Journey</h3>
                <p style="color: var(--text-secondary); font-size: 15px; line-height: 1.6; max-width: 500px; margin: 0 auto;">
                    Every great photo starts with a conversation. Whether you have a specific vision in mind or just want to chat about possibilities, we're here to listen.
                </p>
            </div>
            
            <div class="enquiry-grid-responsive" style="display: grid; gap: 20px;">
                <div class="input-group">
                    <label class="input-label-premium" style="margin-bottom: 8px;">FULL NAME</label>
                    <input type="text" id="msg-name" class="login-input" value="${((t=e.user)==null?void 0:t.name)||""}" style="padding: 18px; border-radius: 15px;" placeholder="e.g. John Doe">
                </div>
                <div class="input-row-multi">
                    <div class="input-group">
                        <label class="input-label-premium" style="margin-bottom: 8px;">MOBILE NUMBER</label>
                        <input type="tel" id="msg-mobile" class="login-input" value="${((i=e.user)==null?void 0:i.mobile)||""}" maxlength="10" oninput="this.value = this.value.replace(/\\D/g, '').slice(0, 10)" style="padding: 18px; border-radius: 15px;" placeholder="9876543210">
                    </div>
                    <div class="input-group">
                        <label class="input-label-premium" style="margin-bottom: 8px;">EMAIL (OPTIONAL)</label>
                        <input type="email" id="msg-email" class="login-input" style="padding: 18px; border-radius: 15px;" placeholder="john@example.com">
                    </div>
                </div>
                <div class="input-group">
                    <label class="input-label-premium" style="margin-bottom: 8px;">YOUR MESSAGE</label>
                    <textarea id="direct-msg-text" class="login-input" style="height: 150px; padding: 18px; resize: none;" placeholder="Tell us about your shoot requirements..."></textarea>
                </div>
                <button class="cta-btn" style="width: 100%; padding: 22px; font-weight: 800; letter-spacing: 2px;" onclick="window.requestCallback()">SEND DIRECT MESSAGE ➔</button>
            </div>
        </div>
    `}window.requestCallback=async()=>{const t=document.getElementById("direct-msg-text").value.trim(),i=document.getElementById("msg-name").value.trim(),o=document.getElementById("msg-mobile").value.trim(),s=document.getElementById("msg-email").value.trim();if(!t||!i||!o)return alert("Please fill in your name, mobile number, and message.");if(o.length!==10)return alert("Please enter a valid 10-digit mobile number");const n=document.activeElement;n.disabled=!0,n.innerText="SENDING...";try{const a={action:"add",sender:i,mobile:o,email:s,text:t,timestamp:new Date().toISOString()};(await fetch(`${g}/messages`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)})).ok?(alert("Message sent! We will get back to you soon."),document.getElementById("direct-msg-text").value="",await I()):alert("Failed to send message")}catch{alert("Network error")}finally{n.disabled=!1,n.innerText="SUBMIT ENQUIRY"}};window.showMessageModal=()=>{var i,o,s;const t=document.createElement("div");t.className="modal-overlay",t.style.display="flex",t.innerHTML=`
        <div class="login-modal" style="max-width: 450px; padding: 35px; border-radius: 25px;">
            <h2 style="font-family: 'Playfair Display', serif; margin-bottom: 5px;">Send a Message</h2>
            <p style="margin-bottom: 25px; color: #666; font-size: 14px;">How can we help you today?</p>
            <div style="display: grid; gap: 15px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="input-group">
                        <label style="font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: 1px; display: block; margin-bottom: 8px;">FULL NAME</label>
                        <input type="text" id="modal-msg-name" class="login-input" placeholder="Your Name" value="${((i=e.user)==null?void 0:i.name)||""}" style="margin-bottom:0; border-radius: 12px;">
                    </div>
                    <div class="input-group">
                        <label style="font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: 1px; display: block; margin-bottom: 8px;">MOBILE NUMBER</label>
                        <input type="tel" id="modal-msg-mobile" class="login-input" placeholder="Your Mobile" value="${((o=e.user)==null?void 0:o.mobile)||""}" maxlength="10" oninput="this.value = this.value.replace(/D/g, '').slice(0, 10)" style="margin-bottom:0; border-radius: 12px;">
                    </div>
                </div>
                <div class="input-group">
                    <label style="font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: 1px; display: block; margin-bottom: 8px;">EMAIL (OPTIONAL)</label>
                    <input type="email" id="modal-msg-email" class="login-input" placeholder="e.g. john@example.com" value="${((s=e.user)==null?void 0:s.email)||""}" style="margin-bottom:0; border-radius: 12px;">
                </div>
                <div class="input-group">
                    <label style="font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: 1px; display: block; margin-bottom: 8px;">YOUR MESSAGE</label>
                    <textarea id="modal-msg-text" class="login-input" style="height: 120px; padding: 15px; resize: none; margin-bottom: 0; border-radius: 12px;" placeholder="How can we help?"></textarea>
                </div>
                <button class="cta-btn" style="width: 100%; padding: 18px;" id="send-modal-msg-btn">SEND MESSAGE</button>
            </div>
        </div>
    `,document.body.appendChild(t),t.addEventListener("click",n=>{n.target===t&&t.remove()}),document.getElementById("send-modal-msg-btn").onclick=async()=>{const n=document.getElementById("modal-msg-name").value.trim(),a=document.getElementById("modal-msg-mobile").value.trim(),r=document.getElementById("modal-msg-email").value.trim(),c=document.getElementById("modal-msg-text").value.trim();if(!n||!a||!c)return alert("Please fill in Name, Mobile, and Message");if(a.length!==10)return alert("Please enter a valid 10-digit mobile number");const l=document.getElementById("send-modal-msg-btn");l.disabled=!0,l.innerText="SENDING...";try{const u={action:"add",sender:n,mobile:a,email:r,text:c,timestamp:new Date().toISOString()};await fetch(`${g}/messages`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(u)});try{fetch(w,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},body:JSON.stringify(u)})}catch(d){console.error("Google Sheets sync failed:",d)}l.style.background="#2ECC71",l.innerText="✨ MESSAGE SENT!",setTimeout(()=>t.remove(),1500),e.view==="messages"&&I()}catch{alert("Encountered an error sending message."),l.disabled=!1,l.innerText="SUBMIT ENQUIRY"}}};window.updateProfile=async()=>{const t=document.getElementById("profile-name").value,i=document.getElementById("profile-email").value;if(!t)return alert("Please enter your full name.");const o=document.getElementById("save-profile-btn");o.innerText="SAVING...",o.disabled=!0;try{const s={...e.user,name:t,email:i};await fetch(w,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"updateProfile",mobile:e.user.mobile,name:t,email:i})}),localStorage.setItem("user",JSON.stringify(s)),e.user=s,h(),alert("✨ Profile updated successfully and synced to Google Sheets!"),window.renderProfileView()}catch(s){console.error("Update failed:",s),alert("Failed to sync changes to cloud.")}finally{o&&(o.innerText="SAVE CHANGES",o.disabled=!1)}};let b=null,v=0,E="";function k(){const t=document.getElementById("hero-media-container");if(!t||!e.cms.hero.slides.length){b&&clearInterval(b),E="";return}const i=JSON.stringify(e.cms.hero);if(i===E)return;E=i,b&&clearInterval(b),t.innerHTML=e.cms.hero.slides.map((s,n)=>{const a=s.type==="video",r=`position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition: opacity 2s ease-in-out; opacity: ${n===0?1:0}; z-index:1;`;return a?`<video src="${p(s.url)}" class="hero-slide-item" style="${r}" muted loop playsinline></video>`:`<img src="${p(s.url)}" class="hero-slide-item" style="${r}">`}).join("");const o=t.querySelectorAll(".hero-slide-item");if(o[0]&&o[0].tagName==="VIDEO"&&o[0].play().catch(s=>console.warn("Hero video autoplay failed",s)),v=0,o.length>1){const s=(e.cms.hero.interval||5)*1e3;console.log(`[Hero] Carousel started with ${o.length} slides, interval: ${s}ms`),b=setInterval(()=>{const n=(v+1)%o.length;o[v].style.opacity=0,o[v].tagName==="VIDEO"&&setTimeout(()=>o[v].pause(),2e3),o[n].style.opacity=1,o[n].tagName==="VIDEO"&&o[n].play().catch(a=>console.warn("Hero video play failed",a)),v=n},s)}}$();
