const API_URL = 'https://shashiniphotogrphy-production.up.railway.app/api';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbymHcV4JOdFk5geINGLBPe0SUPV3quv2TL0yKs8nX2AzAGuf0Ika-0WY8A8wkWzV06Y/exec';
const CMS_SHEET_URL = 'https://script.google.com/macros/s/AKfycbymHcV4JOdFk5geINGLBPe0SUPV3quv2TL0yKs8nX2AzAGuf0Ika-0WY8A8wkWzV06Y/exec';

const app = document.getElementById('app');
const loginBtn = document.querySelector('.profile-btn');

function getImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    if (url.startsWith('./') || url.startsWith('../')) return url; // Handle local relative paths
    if (url.startsWith('/')) return API_URL + url;
    return API_URL + '/' + url;
}

// --- SECURE & STABLE UTILITIES ---
window.onerror = function (msg) { console.error('[App Shield]', msg); return true; };
window.onunhandledrejection = function (e) { console.error('[App Shield] Rejection', e.reason); };

async function secureFetch(url, opts = {}, timeout = 20000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const r = await fetch(url, { ...opts, signal: controller.signal });
        clearTimeout(id);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return await r.json();
    } catch (err) {
        clearTimeout(id);
        console.warn(`[SecureFetch] Error: ${url}`, err.message);
        return null;
    }
}

// State
let state = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    view: 'home',
    vaults: [],
    currentVault: null,
    photos: [],
    selectedPhotos: new Set(),
    cms: { items: [], hero: { slides: [], interval: 5 }, graphics: {} },
    messages: []
};

// --- INITIALIZATION ---

async function init() {
    // Inject Global Loader
    if (!document.getElementById('global-loader')) {
        const loaderHtml = `
        <div id="global-loader" class="global-loader-overlay">
            <div class="burst-loader">
                <div></div><div></div><div></div><div></div><div></div><div></div>
                <div></div><div></div><div></div><div></div><div></div><div></div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', loaderHtml);
    }
    const loaderEl = document.getElementById('global-loader');
    window.showLoader = () => loaderEl.classList.add('active');
    window.hideLoader = () => loaderEl.classList.remove('active');

    window.state = state;
    window.render = render;

    // Add scroll listener for header transitions
    window.onscroll = () => {
        document.body.classList.toggle('scrolled', window.scrollY > 50);
    };

    // Set initial home-view class for header styling
    if (state.view === 'home') document.body.classList.add('home-view');
    window.setView = (view, photoIndex = null, pushState = true) => {
        if (state.view === view && photoIndex === null) return;
        state.view = view;

        // Force Card View on Mobile (Tables are too messy)
        if (window.innerWidth < 768) {
            state.viewMode = 'cards';
        }

        // Toggle home-view class for transparent header
        document.body.classList.toggle('home-view', view === 'home');

        // Update menu active state
        document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.view === view));
        document.querySelectorAll('.mobile-nav-link').forEach(l => l.classList.toggle('active', l.dataset.view === view));

        if (pushState) {
            history.pushState({ view }, "", `#${view}`);
        }

        render();

        // Background data sync
        fetchGlobalData().then(() => {
            if (view === 'home' || view === 'gallery') render();
        });
    };
    // --- BROWSER NAVIGATION HANDLING ---
    const handleHashSync = () => {
        const hashView = window.location.hash.substring(1);
        const validViews = ['home', 'gallery', 'bookings', 'vault', 'messages', 'profile'];
        if (hashView && validViews.includes(hashView)) {
            window.setView(hashView, null, false);
        }
    };

    window.onpopstate = (e) => {
        if (e.state && e.state.view) {
            window.setView(e.state.view, null, false);
        } else {
            handleHashSync() || window.setView('home', null, false);
        }
    };

    // Set initial history state if not set
    if (!history.state) {
        history.replaceState({ view: state.view }, "", `#${state.view}`);
    } else {
        handleHashSync();
    }

    setupTheme();
    setupNavigation();

    // Initial Load - Race to show UI content faster (Max 1.5s wait)
    window.showLoader();
    const dataPromise = fetchGlobalData().catch(e => console.warn('Background fetch failed', e));
    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 1500));

    await Promise.race([dataPromise, timeoutPromise]);
    window.hideLoader();

    // Only force render if we are still on the same view we started with to prevent nav flickering
    const initialView = state.view;
    dataPromise.finally(() => {
        if (state.view === initialView) render();
    });

    // Mobile Menu Toggle
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    // Auto-Sync background data every 60 seconds (Real-time update)
    setInterval(async () => {
        const hashView = window.location.hash.substring(1) || 'home';
        await fetchGlobalData();
        // Only refresh UI if we are on a page that heavily depends on CMS data
        if (state.view === 'home' || state.view === 'gallery' || hashView === 'home') {
            render();
            if (state.view === 'home') initHeroCarousel();
        }
    }, 60000);

    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.onclick = () => mobileMenu.classList.add('active');
    }
    if (closeMenuBtn && mobileMenu) {
        closeMenuBtn.onclick = () => mobileMenu.classList.remove('active');
    }

    if (loginBtn) {
        // Backend is now on Railway, so Auth works everywhere!
        loginBtn.onclick = () => {
            if (state.user) {
                state.view = 'profile';
                render();
            } else {
                window.showLoginModal();
            }
        };
    }

    // --- GLOBAL AUTH MODAL ---
    window.showLoginModal = () => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
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
        `;
        document.body.appendChild(modal);

        // Focus
        setTimeout(() => document.getElementById('login-mobile').focus(), 100);

        // Submit Handler
        document.getElementById('login-submit').onclick = async () => {
            const mobile = document.getElementById('login-mobile').value;
            const name = document.getElementById('login-name').value;

            if (mobile.length !== 10) return alert('Please enter a valid 10-digit mobile number.');
            if (!name) return alert('Please enter your name.');

            window.showLoader();

            // Save User Locally
            const user = { mobile, name };
            localStorage.setItem('user', JSON.stringify(user));
            state.user = user;

            // Log Login to Google Sheets
            try {
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'logLogin', mobile, name })
                });
            } catch (err) {
                console.error('Cloud log failed:', err);
            }

            window.hideLoader();
            modal.remove();
            render();

            if (state.view === 'vault' || state.view === 'profile') {
                setView(state.view);
            } else {
                alert('Welcome, ' + name + '!');
            }
        };
    };

    window.logout = () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('user');
            state.user = null;
            state.vaults = [];
            setView('home');
        }
    };


    // Close menu when clicking a link
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const view = link.dataset.view;
            if (view === 'profile') {
                renderProfileView();
            } else {
                setView(view);
            }
            mobileMenu.classList.remove('active');
        };
    });

    render();

    // Auto-refresh data every 60 seconds for client side
    setInterval(async () => {
        if (state.view === 'home' || state.view === 'gallery') {
            await fetchGlobalData();
            render();
        }
    }, 60000);
}

async function fetchGlobalData() {
    try {
        // 1. Fetch local CMS data first (Initial cache)
        const localData = await secureFetch(`${API_URL}/cms`);
        if (localData) {
            state.cms = {
                items: localData.items || [],
                hero: localData.hero || { slides: [], interval: 5 },
                graphics: localData.graphics || {}
            };
            console.log('[CMS Sync] Local cache loaded.');
        }

        // 2. Fetch CMS data from Google Sheet Apps Script (MASTER SOURCE)
        // We use a cache buster 't' to ensure we get live data from Google
        const sheetData = await fetch(`${CMS_SHEET_URL}?action=getCMS&t=${Date.now()}`).then(r => r.json()).catch(() => null);

        if (sheetData) {
            // SHEET IS MASTER: If sheet data arrives, it OVERWRITES local items/hero entirely.
            // This allows users to truly "empty" the gallery from the sheet.
            state.cms.items = sheetData.items || [];
            if (sheetData.hero) {
                state.cms.hero = sheetData.hero;
            }

            // Graphics merging logic
            if (sheetData.graphics) {
                const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');

                Object.keys(sheetData.graphics).forEach(key => {
                    // Update if local doesn't have it OR if we are on the public hosted site
                    if (!state.cms.graphics[key] || !isLocal) {
                        state.cms.graphics[key] = sheetData.graphics[key];
                    }
                });
            }
            console.log('[CMS Sync] Sheet data merged (Master).');
            return;
        }
    } catch (err) {
        console.error('[CMS Sync] Sync process had issues:', err);
    }
}

function setupTheme() {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') document.body.classList.add('dark-mode');

    window.toggleTheme = () => {
        document.body.classList.toggle('dark-mode');
        const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
    };
}

function setupNavigation() {
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // 1. Handle Anchor Links (e.g. #about-section)
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const targetId = href.substring(1); // remove #

                // If not on home, switch to home first
                if (state.view !== 'home') {
                    setView('home');
                    // Wait for render, then scroll
                    setTimeout(() => {
                        const target = document.getElementById(targetId);
                        if (target) target.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                } else {
                    // Already on home, just scroll
                    const target = document.getElementById(targetId);
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                }

                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu) mobileMenu.classList.remove('active');
                return;
            }

            // 2. Handle View Switching (existing logic)
            const view = link.dataset.view;
            if (!view) return; // Ignore if no view and no anchor

            if (view === 'vault' && !state.user) return showLoginModal();

            if (state.view !== view) {
                setView(view);

                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu) mobileMenu.classList.remove('active');
            }
        });
    });
}

// --- ADMIN AUTH ---
window.showAdminLoginModal = () => {
    // 1. Close mobile menu if it's open
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) mobileMenu.classList.remove('active');

    // 2. Create and show the modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.zIndex = '4000'; // Ensure it's above the mobile menu
    modal.innerHTML = `
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
    `;
    document.body.appendChild(modal);

    // Focus initial input
    setTimeout(() => {
        const input = document.getElementById('admin-user');
        if (input) input.focus();
    }, 100);

    // Submit Handler
    document.getElementById('admin-submit').onclick = () => {
        const u = document.getElementById('admin-user').value;
        const p = document.getElementById('admin-pass').value;

        if (u === 'admin123' && p === '098765') {
            sessionStorage.setItem('adminLoggedIn', 'true');
            window.location.href = './admin.html';
        } else {
            alert('Invalid Credentials');
        }
    };
};

// --- RENDERING ---

function render() {
    window.scrollTo(0, 0);

    // Toggle home-view class for transparent header
    document.body.classList.toggle('home-view', state.view === 'home');


    if (loginBtn) {
        if (state.user) {
            // Logged In State
            const userName = state.user.name || 'User';
            const initial = userName.charAt(0).toUpperCase();
            loginBtn.innerHTML = `
                <div class="profile-icon">
                    <span>${initial}</span>
                </div>
                <div class="profile-text-group">
                    <span class="profile-label">WELCOME,</span>
                    <span class="profile-name">${userName}</span>
                </div>
            `;
        } else {
            // Logged Out State
            loginBtn.innerHTML = `
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
            `;
        }
    }

    switch (state.view) {
        case 'home': renderHome(); break;
        case 'gallery': renderGallery(); break;
        case 'bookings': renderBookings(); break;
        case 'vault': renderVault(); break;
        case 'messages': renderMessagesView(); break;
        case 'profile': renderProfileView(); break;
    }
}

function renderHome() {
    app.innerHTML = `

        <section class="new-hero fade-in">
            <!-- Dynamic Hero Content (Video / Image) -->
            <div id="hero-media-container" style="position: absolute; inset:0; z-index:1;">
                ${state.cms.hero.slides.length > 0 ? (
            state.cms.hero.slides[0].type === 'video'
                ? `<video src="${getImageUrl(state.cms.hero.slides[0].url)}" class="hero-slide-item" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:1; z-index:1;" muted loop playsinline autoplay></video>`
                : `<img src="${getImageUrl(state.cms.hero.slides[0].url)}" class="hero-slide-item" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:1; z-index:1;">`
        ) : `
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
                     <img src="${state.cms.graphics?.artist ? getImageUrl(state.cms.graphics.artist) : './logo.png'}" alt="The Artist" class="story-img-zoom" style="width: 100%; height: 100%; object-fit: contain; background: var(--card-bg); position: absolute; inset: 0; transition: transform 0.8s cubic-bezier(0.19, 1, 0.22, 1); opacity: 0.6;">
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
             ${renderGalleryPreview()}
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
                    <img src="${state.cms.graphics?.whoWeAre ? getImageUrl(state.cms.graphics.whoWeAre) : './logo.png'}" alt="Our Story" class="story-img-zoom" style="width: 100%; height: 100%; object-fit: contain; background: var(--card-bg); position: absolute; inset: 0; transition: transform 0.8s cubic-bezier(0.19, 1, 0.22, 1); opacity: 0.6;">
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
                     <img src="${state.cms.graphics?.readyToBegin ? getImageUrl(state.cms.graphics.readyToBegin) : './logo.png'}" alt="Enquiry" class="story-img-zoom" style="width: 100%; height: 100%; object-fit: contain; background: var(--card-bg); position: absolute; inset: 0; transition: transform 0.8s cubic-bezier(0.19, 1, 0.22, 1); opacity: 0.6;">
                </div>
            </div>
        </section>
    `;


    // Ensure initial call sets the body class if we landed directly on home
    if (state.view === 'home') {
        document.body.classList.add('home-view');
        initHeroCarousel();
    }
}

function renderGalleryPreview() {
    // Standard uniform grid classes only
    const getLayoutClass = (idx) => '';

    return `
        <div class="section-header" style="flex-direction: column; align-items: center; text-align: center; gap: 10px;">
            <div>
                <span class="section-subtitle">STUDIO HIGHLIGHTS</span>
                <h2 class="section-title">The Master Exhibition</h2>
            </div>
            <button class="cta-btn" style="padding: 12px 25px; font-size: 11px; margin: 10px 0; border-radius: 12px;" onclick="setView('gallery')">EXPLORE EXHIBITION ➔</button>
        </div>
        
        <div class="exhibition-grid">
             ${state.cms.items.length === 0 ? `
                <div style="grid-column: 1/-1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                    <div style="aspect-ratio: 1; border-radius: 20px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 40px;">⌛</div>
                    <div style="aspect-ratio: 1; border-radius: 20px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 40px;">📸</div>
                    <div style="aspect-ratio: 1; border-radius: 20px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 40px;">✨</div>
                </div>
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                   <p style="color: #999; font-size: 12px; font-weight: 600; letter-spacing: 1px;">CURATING THE MASTERPIECES...</p>
                </div>
            ` : state.cms.items.slice(0, 4).map((item, idx) => {
        const isVideo = (item.url && (item.url.startsWith('data:video/') || item.url.endsWith('.mp4')));
        const isYouTube = (item.url && (item.url.includes('youtube.com') || item.url.includes('youtu.be')));
        const layoutClass = getLayoutClass(idx);

        let mediaHtml = '';
        if (isYouTube) {
            const videoId = item.url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)?.[1];
            mediaHtml = `<iframe src="https://www.youtube.com/embed/${videoId}" 
                            style="width: 100%; height: 100%; border: none;" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen></iframe>`;
        } else if (isVideo) {
            mediaHtml = `<video src="${getImageUrl(item.url)}" muted loop playsinline onmouseover="this.play()" onmouseout="this.pause()"></video>`;
        } else {
            mediaHtml = `<img src="${getImageUrl(item.url)}" alt="${item.title || 'Exhibition Image'}">`;
        }

        return `
                    <div class="exhibition-item ${layoutClass} fade-in-up" 
                         style="animation-delay: ${0.2 + (0.1 * idx)}s; cursor: pointer;" onclick="window.openGalleryLightbox(${idx})">
                         ${mediaHtml}
                    </div>
                `;
    }).join('')}
        </div>
        <div style="text-align: center; margin-top: 40px;">
             <button class="cta-btn" style="padding: 16px 40px; font-size: 13px; letter-spacing: 2px; border-radius: 50px;" onclick="setView('gallery')">
                VIEW FULL GALLERY ➔
             </button>
        </div>
    `;
}


function renderGallery() {
    app.innerHTML = `
        <div class="container slide-up" style="margin-top: 60px;">
            <div class="section-header" style="flex-direction: column; align-items: center; text-align: center;">
                <div>
                    <span class="section-subtitle">PORTFOLIO</span>
                    <h2 class="section-title">Visual Narratives</h2>
                </div>
            </div>
            <div class="photo-grid stagger-mobile" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px;">
                ${state.cms.items.length === 0 ? `
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #999;">
                        <p>No gallery items found.</p>
                    </div>
                ` : state.cms.items.map((item, idx) => {
        const isVideo = (item.url && (item.url.startsWith('data:video/') || item.url.endsWith('.mp4')));
        const isYouTube = (item.url && (item.url.includes('youtube.com') || item.url.includes('youtu.be')));

        let mediaHtml = '';
        if (isYouTube) {
            const videoId = item.url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)?.[1];
            mediaHtml = `<iframe src="https://www.youtube.com/embed/${videoId}" 
                            style="width: 100%; height: 100%; border: none;" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen></iframe>`;
        } else if (isVideo) {
            mediaHtml = `<video src="${getImageUrl(item.url)}" style="width:100%; height:100%; object-fit:cover;" muted controls playsinline></video>`;
        } else {
            mediaHtml = `<img src="${getImageUrl(item.url)}" alt="${item.title}" loading="lazy" style="width:100%; height:100%; object-fit:cover;">`;
        }

        return `
                    <div class="photo-item" style="border-radius: 20px; overflow: hidden; position: relative; aspect-ratio: 1; cursor: pointer;" onclick="window.openGalleryLightbox(${idx})">
                        ${mediaHtml}
                    </div>
                `}).join('')}
            </div>
        </div>
        `;
}

function renderBookings() {
    app.innerHTML = `
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
        `;

    // Execute Cal.com script provided by user
    (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");

    Cal("init", "shashiniphotography", { origin: "https://app.cal.com" });

    Cal.ns["shashiniphotography"]("inline", {
        elementOrSelector: "#my-cal-inline-shashini-studio",
        config: { "layout": "month_view", "useSlotsViewOnSmallScreen": "true" },
        calLink: "indresh-j2lwto/shashiniphotography",
    });

    Cal.ns["shashiniphotography"]("ui", { "hideEventTypeDetails": false, "layout": "month_view" });
}

async function renderVault() {
    if (!state.user) return showLoginModal();
    app.innerHTML = `<div class="container" style="text-align:center; padding: 100px;"><p>Checking your photography vaults...</p></div>`;

    try {
        const resp = await fetch(`${API_URL}/vaults?mobile=${state.user.mobile}`);
        state.vaults = await resp.json();

        app.innerHTML = `
            <div class="container slide-up" style="margin-top: 60px;">
                <div class="section-header" style="flex-direction: column; align-items: center; text-align: center;">
                    <div>
                        <span class="section-subtitle">PRIVATE COLLECTION</span>
                        <h2 class="section-title">Your Photography Vaults</h2>
                    </div>
                </div>
                ${state.vaults.length === 0 ? `
                    <div style="text-align: center; padding: 100px; width: 100%; max-width: 500px; margin: 0 auto; background: var(--card-bg); border-radius: 30px; border: 1px solid var(--border-color);">
                        <div style="font-size: 50px; margin-bottom: 20px;">📂</div>
                        <h3 style="margin-bottom: 10px; font-family: 'Playfair Display', serif;">No Collections Found</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 25px; line-height: 1.6;">
                            It seems there are no active photography collections linked to this mobile number yet. If you recently had a session, please allow 24-48 hours for your vault to be created.
                        </p>
                        <button class="cta-btn" onclick="setView('messages')">CONTACT SUPPORT</button>
                    </div>
                ` : `
                    <div class="vault-sessions-container">
                        ${state.vaults.map(v => `
                            <div class="vault-session-card" onclick="window.enterVault('${v.vaultId}', '${v.id}')">
                                <h3>${v.sessionTitle}</h3>
                                <div class="vault-status-badge ${v.status}">${v.status.toUpperCase()}</div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    } catch (e) {
        console.error('[Vault Access Error]', e);
        app.innerHTML = `<div class="container" style="text-align:center; padding: 100px;">
            <h3>Could not connect to your vault.</h3>
            <p style="color: #888; margin-top: 10px; font-size: 12px;">Error: ${e.message}</p>
            <p style="color: #ccc; font-size: 11px;">Please check if the backend is running.</p>
        </div>`;
    }
}

window.enterVault = async (driveId, localId) => {
    // Ensure vaults are loaded if user is logged in
    if ((!state.vaults || state.vaults.length === 0) && state.user) {
        try {
            const resp = await fetch(`${API_URL}/vaults?mobile=${state.user.mobile}`);
            state.vaults = await resp.json();
        } catch (e) {
            console.error('Failed to lazy load vaults:', e);
        }
    }

    // Fix: Type-safe lookup
    state.currentVault = state.vaults?.find(v => (v.id && String(v.id) === String(localId)) || (v.vaultId === driveId));

    if (!state.currentVault) {
        console.error('Vault not found locally:', localId);
        // Fallback: If not found in current list (maybe direct link?), try to construct or re-fetch?
        // For now, show error with more detail
        app.innerHTML = `<div class="container" style="text-align:center; padding: 100px;">
            <p>Vault access error: Vault #${localId} not found in your list.</p>
            <p style="font-size: 11px; color: #999;">Please ensure you are logged in with the correct mobile number.</p>
            <button class="cta-btn" onclick="state.view='vault'; render();" style="margin-top: 20px;">BACK TO VAULTS</button>
        </div>`;
        return;
    }

    app.innerHTML = `<div class="container" style="text-align:center; padding: 100px;"><p>Accessing photos...</p></div>`;

    try {
        const [sels, photoData] = await Promise.all([
            fetch(`${API_URL}/vaults/selections`).then(r => r.json()),
            fetch(`${API_URL}/vaults/${driveId}/photos`).then(r => r.json())
        ]);

        if (photoData.error) throw new Error(photoData.error);

        const mySelection = sels.find(s => s.vaultId === driveId && s.mobile === state.user.mobile);
        state.selectedPhotos = new Set(mySelection ? mySelection.selections : []);
        state.photos = photoData.photos || [];

        if (state.photos.length === 0) {
            app.innerHTML = `
                <div class="container" style="text-align:center; padding: 100px;">
                    <h3>Vault empty or inaccessible</h3>
                    <p style="color: #666; margin-top: 10px;">We haven't added photos to this folder or permissions are missing.</p>
                    <button class="cta-btn" style="margin-top: 20px;" onclick="state.view='vault'; render();">BACK TO VAULTS</button>
                </div>
            `;
            return;
        }

        renderVaultPhotos();
    } catch (e) {
        app.innerHTML = `
            <div class="container" style="text-align:center; padding: 100px;">
                <h3>Access Error</h3>
                <p style="color: #666; margin-top: 10px;">${e.message || 'We could not verify your folder.'}</p>
                <button class="cta-btn" style="margin-top: 20px;" onclick="state.view='vault'; render();">BACK TO VAULTS</button>
            </div>
        `;
    }
}

function renderVaultPhotos() {
    const isLocked = state.currentVault.status === 'locked';
    app.innerHTML = `
        <div class="container slide-up" style="margin-top: 60px;">
            <div class="section-header" style="margin-bottom: 30px; flex-direction: column; align-items: center; text-align: center;">
                <div>
                    <span class="section-subtitle">${isLocked ? '🔒 LOCKED' : '📸 ACTIVE'} COLLECTION</span>
                    <h2 class="section-title">${state.currentVault.sessionTitle}</h2>
                    <p style="font-size: 12px; color: #999; margin-top: 8px;">
                        ${state.photos.length} photos • ${state.selectedPhotos.size} selected
                        ${!isLocked ? ' • Click to select, tap image to preview' : ''}
                    </p>
                </div>
                ${!isLocked ? `
                    <div style="display: flex; gap: 15px; align-items: center;">
                        <button class="cta-btn" id="save-selection" style="padding: 12px 30px; font-size: 13px; background: rgba(184, 156, 125, 0.2); color: var(--accent); border: 2px solid var(--accent);">
                            💾 SAVE SELECTION (${state.selectedPhotos.size})
                        </button>
                        <button class="cta-btn" id="finalize-selection" style="padding: 12px 30px; font-size: 13px; box-shadow: 0 4px 15px rgba(184, 156, 125, 0.3);">
                            ✓ FINALIZE & SUBMIT (${state.selectedPhotos.size})
                        </button>
                    </div>
                ` : `<div style="padding: 12px 24px; background: rgba(231, 76, 60, 0.1); border-radius: 15px; color: #E74C3C; font-weight: 700; font-size: 12px;">SELECTION FINALIZED</div>`}
            </div>
            
            ${!isLocked ? `
                <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; padding: 15px 20px; margin-bottom: 30px; backdrop-filter: blur(10px);">
                    <p style="font-size: 12px; color: var(--text-secondary); margin: 0; line-height: 1.6;">
                        <strong style="color: var(--accent);">💡 Note:</strong> 
                        Use <strong>SAVE SELECTION</strong> to temporarily save your choices. 
                        Click <strong>FINALIZE & SUBMIT</strong> when you're done - this will create a delivery folder and lock your selection.
                    </p>
                </div>
            ` : ''}
            
            <!-- Masonry Grid -->
            <div class="vault-grid">
                ${state.photos.map((p, idx) => {
        const isSelected = state.selectedPhotos.has(p.id);
        return `
                        <div class="vault-photo-card ${isSelected ? 'vault-selected' : ''}" 
                             data-photo-id="${p.id}"
                             data-photo-index="${idx}">
                            <img src="${getImageUrl(p.url)}" 
                                 loading="lazy" 
                                 referrerpolicy="no-referrer"
                                 onerror="if(!this.dataset.backup1) { this.dataset.backup1=true; this.src='https://lh3.googleusercontent.com/d/${p.id}'; } else if(!this.dataset.backup2) { this.dataset.backup2=true; this.src='https://drive.google.com/uc?export=view&id=${p.id}'; }"
                                 onclick="window.openLightbox(${idx})">
                            ${!isLocked ? `
                                <div class="selection-overlay" onclick="event.stopPropagation(); window.togglePhoto('${p.id}')" 
                                     style="position: absolute; top: 15px; right: 15px; width: 40px; height: 40px; background: ${isSelected ? 'var(--accent)' : 'rgba(0,0,0,0.5)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; border: 3px solid white;">
                                    <span style="font-size: 18px; color: white;">${isSelected ? '✓' : '○'}</span>
                                </div>
                            ` : ''}
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
    `;

    if (!isLocked) {
        const saveBtn = document.getElementById('save-selection');
        const finalizeBtn = document.getElementById('finalize-selection');

        if (saveBtn) saveBtn.onclick = saveSelection;
        if (finalizeBtn) finalizeBtn.onclick = finalizeSelection;
    }
}

// Lightbox Viewer
window.openLightbox = (index) => {
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox-overlay';
    lightbox.innerHTML = `
        <div class="lightbox-container">
            <button class="lightbox-close" onclick="closeLightbox()">✕</button>
            <button class="lightbox-nav lightbox-prev" onclick="navigateLightbox(-1)">‹</button>
            <button class="lightbox-nav lightbox-next" onclick="navigateLightbox(1)">›</button>
            
            <div class="lightbox-content">
                <img id="lightbox-image" src="${getImageUrl(state.photos[index].url)}" 
                     referrerpolicy="no-referrer"
                     onerror="if(!this.dataset.backup1) { this.dataset.backup1=true; this.src='https://lh3.googleusercontent.com/d/${state.photos[index].id}'; } else if(!this.dataset.backup2) { this.dataset.backup2=true; this.src='https://drive.google.com/uc?export=view&id=${state.photos[index].id}'; }"
                     alt="Photo ${index + 1}">
                <div class="lightbox-info">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="lightbox-counter">${index + 1} / ${state.photos.length}</span>
                        ${state.currentVault.status !== 'locked' ? `
                            <button class="lightbox-select-btn ${state.selectedPhotos.has(state.photos[index].id) ? 'selected' : ''}" 
                                    onclick="togglePhotoInLightbox(${index})">
                                <span class="select-icon">${state.selectedPhotos.has(state.photos[index].id) ? '✓ SELECTED' : '+ SELECT'}</span>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';

    // Store current index
    window.currentLightboxIndex = index;

    // Keyboard navigation
    window.lightboxKeyHandler = (e) => {
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
        if (e.key === 'Escape') closeLightbox();
        if (e.key === ' ') {
            e.preventDefault();
            togglePhotoInLightbox(window.currentLightboxIndex);
        }
    };
    document.addEventListener('keydown', window.lightboxKeyHandler);

    // Touch swipe
    let touchStartX = 0;
    let touchEndX = 0;

    const lightboxImg = document.getElementById('lightbox-image');
    lightboxImg.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    lightboxImg.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) navigateLightbox(1);
        if (touchEndX > touchStartX + 50) navigateLightbox(-1);
    }
};

window.navigateLightbox = (direction) => {
    window.currentLightboxIndex += direction;
    if (window.currentLightboxIndex < 0) window.currentLightboxIndex = state.photos.length - 1;
    if (window.currentLightboxIndex >= state.photos.length) window.currentLightboxIndex = 0;

    const img = document.getElementById('lightbox-image');
    const counter = document.querySelector('.lightbox-counter');
    const selectBtn = document.querySelector('.lightbox-select-btn');

    img.style.opacity = '0';
    setTimeout(() => {
        // Reset backup flags for new image
        delete img.dataset.backup1;
        delete img.dataset.backup2;
        img.src = getImageUrl(state.photos[window.currentLightboxIndex].url);
        counter.textContent = `${window.currentLightboxIndex + 1} / ${state.photos.length}`;

        if (selectBtn) {
            const isSelected = state.selectedPhotos.has(state.photos[window.currentLightboxIndex].id);
            selectBtn.className = `lightbox-select-btn ${isSelected ? 'selected' : ''}`;
            selectBtn.querySelector('.select-icon').textContent = isSelected ? '✓ SELECTED' : '+ SELECT';
        }

        img.style.opacity = '1';
    }, 200);
};

window.togglePhotoInLightbox = (index) => {
    window.togglePhoto(state.photos[index].id);
    const selectBtn = document.querySelector('.lightbox-select-btn');
    if (selectBtn) {
        const isSelected = state.selectedPhotos.has(state.photos[index].id);
        selectBtn.className = `lightbox-select-btn ${isSelected ? 'selected' : ''}`;
        selectBtn.querySelector('.select-icon').textContent = isSelected ? '✓ SELECTED' : '+ SELECT';
    }

    // Update both button counts
    const saveBtn = document.getElementById('save-selection');
    const finalizeBtn = document.getElementById('finalize-selection');

    if (saveBtn) {
        saveBtn.innerHTML = `💾 SAVE SELECTION (${state.selectedPhotos.size})`;
    }
    if (finalizeBtn) {
        finalizeBtn.innerHTML = `✓ FINALIZE & SUBMIT (${state.selectedPhotos.size})`;
    }
};

window.closeLightbox = () => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.opacity = '0';
        setTimeout(() => {
            lightbox.remove();
            document.body.style.overflow = '';
        }, 300);
    }
    document.removeEventListener('keydown', window.lightboxKeyHandler);
    renderVaultPhotos(); // Refresh to show updated selections
};

window.togglePhoto = (id) => {
    if (state.selectedPhotos.has(id)) state.selectedPhotos.delete(id);
    else state.selectedPhotos.add(id);
    renderVaultPhotos();
};

// --- GALLERY LIGHTBOX (CMS items) ---
window.openGalleryLightbox = (index) => {
    const items = state.cms.items;
    if (!items || !items[index]) return;

    const item = items[index];
    const isVideo = (item.url && (item.url.startsWith('data:video/') || item.url.endsWith('.mp4')));
    const isYouTube = (item.url && (item.url.includes('youtube.com') || item.url.includes('youtu.be')));

    const lightbox = document.createElement('div');
    lightbox.id = 'gallery-lightbox';
    lightbox.className = 'lightbox-overlay';

    let mediaHtml = '';
    if (isYouTube) {
        const videoId = item.url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)?.[1];
        mediaHtml = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" style="width: 100%; aspect-ratio: 16/9; border: none; border-radius: 15px;" allow="autoplay" allowfullscreen></iframe>`;
    } else if (isVideo) {
        mediaHtml = `<video src="${getImageUrl(item.url)}" style="max-height: 80vh; max-width: 90vw; border-radius: 15px;" controls autoplay></video>`;
    } else {
        mediaHtml = `<img src="${getImageUrl(item.url)}" alt="${item.title}" style="max-height: 80vh; max-width: 90vw; object-fit: contain; border-radius: 15px;">`;
    }

    lightbox.innerHTML = `
        <div class="lightbox-container">
            <button class="lightbox-close" onclick="window.closeGalleryLightbox()">✕</button>
            <button class="lightbox-nav lightbox-prev" onclick="window.navigateGalleryLightbox(-1)">‹</button>
            <button class="lightbox-nav lightbox-next" onclick="window.navigateGalleryLightbox(1)">›</button>
            
            <div class="lightbox-content" style="width: 95%; max-width: 1200px; display: flex; flex-direction: column; align-items: center;">
                <div class="media-wrapper" style="width: 100%; display: flex; justify-content: center; align-items: center;">
                    ${mediaHtml}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';
    window.currentGalleryIndex = index;

    // --- Keyboard Navigation ---
    window.galleryKeyHandler = (e) => {
        if (e.key === 'ArrowLeft') window.navigateGalleryLightbox(-1);
        if (e.key === 'ArrowRight') window.navigateGalleryLightbox(1);
        if (e.key === 'Escape') window.closeGalleryLightbox();
    };
    document.addEventListener('keydown', window.galleryKeyHandler);

    // --- Touch Swipe (Good UX for Mobile) ---
    let touchStartX = 0;
    let touchEndX = 0;
    lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    lightbox.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 50) window.navigateGalleryLightbox(1);
        if (touchEndX > touchStartX + 50) window.navigateGalleryLightbox(-1);
    }, { passive: true });
};

window.navigateGalleryLightbox = (direction) => {
    const items = state.cms.items;
    window.currentGalleryIndex += direction;
    if (window.currentGalleryIndex < 0) window.currentGalleryIndex = items.length - 1;
    if (window.currentGalleryIndex >= items.length) window.currentGalleryIndex = 0;

    // Update content instead of re-creating lightbox for smoothness
    const lb = document.getElementById('gallery-lightbox');
    if (!lb) return;

    const item = items[window.currentGalleryIndex];
    const isVideo = (item.url && (item.url.startsWith('data:video/') || item.url.endsWith('.mp4')));
    const isYouTube = (item.url && (item.url.includes('youtube.com') || item.url.includes('youtu.be')));
    const content = lb.querySelector('.lightbox-content');

    let mediaHtml = '';
    if (isYouTube) {
        const videoId = item.url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)?.[1];
        mediaHtml = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" style="width: 100%; aspect-ratio: 16/9; border: none; border-radius: 15px;" allow="autoplay" allowfullscreen></iframe>`;
    } else if (isVideo) {
        mediaHtml = `<video src="${getImageUrl(item.url)}" style="max-height: 80vh; max-width: 90vw; border-radius: 15px;" controls autoplay></video>`;
    } else {
        mediaHtml = `<img src="${getImageUrl(item.url)}" alt="${item.title}" style="max-height: 80vh; max-width: 90vw; object-fit: contain; border-radius: 15px;">`;
    }

    content.innerHTML = `
        <div class="media-wrapper" style="width: 100%; display: flex; justify-content: center; align-items: center;">
            ${mediaHtml}
        </div>
    `;
};

window.closeGalleryLightbox = () => {
    const lb = document.getElementById('gallery-lightbox');
    if (lb) {
        lb.style.opacity = '0';
        setTimeout(() => {
            lb.remove();
            document.body.style.overflow = '';
            document.removeEventListener('keydown', window.galleryKeyHandler);
        }, 300);
    }
};

// Save selection temporarily (does not lock vault)
async function saveSelection() {
    if (state.selectedPhotos.size === 0) {
        return alert('Please select at least one photo before saving.');
    }

    const btn = document.getElementById('save-selection');
    btn.disabled = true;
    btn.innerHTML = '💾 SAVING...';

    try {
        await fetch(`${API_URL}/vaults/select`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mobile: state.user.mobile,
                vaultId: state.currentVault.vaultId,
                vaultName: state.currentVault.sessionTitle,
                selections: Array.from(state.selectedPhotos)
            })
        });

        alert('✓ Selection saved! You can continue making changes or finalize when ready.');
    } catch (error) {
        alert('Failed to save selection. Please try again.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = `💾 SAVE SELECTION (${state.selectedPhotos.size})`;
    }
}

// Finalize selection (creates delivery folder, copies photos, locks vault)
async function finalizeSelection() {
    if (state.selectedPhotos.size === 0) {
        return alert('Please select at least one photo before finalizing.');
    }

    const confirmMsg = `⚠️ IMPORTANT: Finalizing will:\n\n` +
        `✓ Create a delivery folder: "${state.user.mobile}_selected_pics"\n` +
        `✓ Copy ${state.selectedPhotos.size} selected photo(s) to that folder\n` +
        `✓ Lock this vault (no more changes allowed)\n\n` +
        `Are you sure you want to finalize your selection?`;

    if (!confirm(confirmMsg)) return;

    const btn = document.getElementById('finalize-selection');
    btn.disabled = true;
    btn.innerHTML = '⏳ FINALIZING...';

    try {
        const response = await fetch(`${API_URL}/vaults/finalize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mobile: state.user.mobile,
                vaultId: state.currentVault.vaultId,
                selections: Array.from(state.selectedPhotos),
                customerId: state.user.mobile
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            const successMsg = `🎉 Selection Finalized Successfully!\n\n` +
                `📁 Delivery Folder: ${result.deliveryFolder.name}\n` +
                `📸 Photos Copied: ${result.copyResults.copied} of ${result.copyResults.total}\n` +
                `${result.copyResults.failed > 0 ? `⚠️ Failed: ${result.copyResults.failed}\n` : ''}` +
                `\nYour vault is now locked. We will process your selected photos.`;

            alert(successMsg);

            // Update vault status locally
            state.currentVault.status = 'locked';

            // Refresh the vault view
            state.view = 'vault';
            render();
        } else {
            throw new Error(result.error || 'Finalization failed');
        }
    } catch (error) {
        alert(`❌ Finalization Error:\n\n${error.message}\n\nPlease contact us for assistance.`);
        btn.disabled = false;
        btn.innerHTML = `✓ FINALIZE & SUBMIT (${state.selectedPhotos.size})`;
    }
}

window.renderProfileView = async function () {
    if (!state.user) return showLoginModal();
    app.innerHTML = `<div class="container" style="text-align:center; padding: 100px;"><p>Loading your profile...</p></div>`;

    try {
        // Fetch data from both Backend (Vaults) and Google Sheets (Profile)
        const [vaults, cloudProfile] = await Promise.all([
            fetch(`${API_URL}/vaults?mobile=${state.user.mobile}`).then(r => r.json()),
            fetch(`${GOOGLE_SCRIPT_URL}?action=getProfile&mobile=${state.user.mobile}`).then(r => r.json())
        ]);

        // Merge cloud data if found
        if (cloudProfile && cloudProfile.found) {
            state.user.name = cloudProfile.name || state.user.name;
            state.user.email = cloudProfile.email || state.user.email;
            state.user.loginCount = cloudProfile.loginCount;
            state.user.lastLogin = cloudProfile.lastLogin;
            state.user.collectionSummary = cloudProfile.collectionSummary;
        } else {
            state.user.collectionSummary = vaults.length + ' Sessions';
        }

        app.innerHTML = `
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
                            <input type="tel" class="login-input" value="${state.user.mobile}" disabled style="opacity: 0.7; padding: 15px; border-radius: 12px; margin-bottom: 0; background: #f5f5f5; font-weight: 700; color: #555;">
                            <p style="font-size: 9px; color: #999; margin-top: 6px; font-style: italic;">* Unique Client Identifier (Cannot be changed)</p>
                        </div>

                        <div class="input-group" style="margin-bottom: 20px;">
                            <label style="font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: 1px; display: block; margin-bottom: 8px;">FULL NAME</label>
                            <input type="text" id="profile-name" class="login-input" value="${state.user.name || ''}" placeholder="Enter your full name" style="padding: 15px; border-radius: 12px; margin-bottom: 0;">
                        </div>

                        <div class="input-group" style="margin-bottom: 30px;">
                            <label style="font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: 1px; display: block; margin-bottom: 8px;">EMAIL ADDRESS <span style="font-weight: 400; color: #ccc; text-transform: lowercase;">(Optional)</span></label>
                            <input type="email" id="profile-email" class="login-input" value="${state.user.email || ''}" placeholder="e.g. name@example.com" style="padding: 15px; border-radius: 12px; margin-bottom: 0;">
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
                                    <p style="font-size: 24px; font-weight: 800; color: var(--accent);">${state.user.loginCount || 1}</p>
                                    <p style="font-size: 8px; font-weight: 800; color: #999; text-transform: uppercase;">Logins</p>
                                </div>
                                <div style="padding: 20px; background: rgba(0,0,0,0.02); border-radius: 20px; text-align: center;">
                                    <p style="font-size: 24px; font-weight: 800; color: var(--accent);">${vaults.length}</p>
                                    <p style="font-size: 8px; font-weight: 800; color: #999; text-transform: uppercase;">Vaults</p>
                                </div>
                            </div>
                            <div style="margin-top: 20px; padding: 15px; border-top: 1px solid #eee;">
                                <p style="font-size: 10px; color: #999;">LAST LOGIN: <span style="color: #333; font-weight: 700;">${state.user.lastLogin ? new Date(state.user.lastLogin).toLocaleString() : 'Just now'}</span></p>
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
                        ${vaults.length === 0 ? `
                            <div style="grid-column: 1/-1; padding: 40px; text-align: center; background: rgba(0,0,0,0.01); border-radius: 20px;">
                                <p style="color: #999; font-size: 13px;">No private gallery vaults linked to this number yet.</p>
                            </div>
                        ` : vaults.map(v => `
                            <div class="card" style="margin-bottom: 0; padding: 25px; border: 1px solid rgba(0,0,0,0.05); cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);" 
                                 onclick="window.enterVault('${v.vaultId}', '${v.id}')"
                                 onmouseover="this.style.transform='translateY(-5px)'; this.style.borderColor='var(--accent)'; this.style.boxShadow='0 10px 30px rgba(0,0,0,0.05)';"
                                 onmouseout="this.style.transform='none'; this.style.borderColor='rgba(0,0,0,0.05)'; this.style.boxShadow='none';">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                                    <span style="font-size: 9px; font-weight: 900; color: ${v.status === 'locked' ? '#000000' : 'var(--accent)'}; text-transform: uppercase; letter-spacing: 1px; background: ${v.status === 'locked' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(184, 156, 125, 0.1)'}; padding: 4px 10px; border-radius: 10px;">
                                        ${v.status === 'locked' ? 'Locked' : 'Active'}
                                    </span>
                                    <span style="font-size: 10px; color: #999;">${new Date(v.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h4 style="margin: 0; font-family: 'Playfair Display', serif; font-size: 18px; margin-bottom: 20px;">${v.sessionTitle}</h4>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 11px; font-weight: 700; color: var(--accent);">VIEW PHOTOS ➔</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

    } catch (e) {
        console.error("Profile load error:", e);
        // If it's a 401/403 or network error that implies auth failure
        if (!state.user) return showLoginModal();

        app.innerHTML = `
            <div class="container" style="text-align:center; padding: 100px;">
                <h3 style="font-family: 'Playfair Display', serif; margin-bottom: 20px;">Profile Error</h3>
                <p style="color: #666; margin-bottom: 30px;">Could not load profile data. Please check your connection.</p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button class="cta-btn" onclick="window.renderProfileView()" style="padding: 12px 25px;">TRY AGAIN</button>
                    <button class="cta-btn" onclick="window.logout()" style="padding: 12px 25px; background: #fff; color: #E74C3C; border: 1px solid #E74C3C;">LOG OUT</button>
                </div>
            </div>`;
    }
}




// --- CONTACT / MESSAGES ---

async function renderMessagesView() {
    app.innerHTML = `
        <div class="container slide-up" style="margin-top: 60px; margin-bottom: 80px;">
            <div class="section-header" style="flex-direction: column; align-items: center; text-align: center;">
                <div>
                    <span class="section-subtitle">GET IN TOUCH</span>
                    <h2 class="section-title">Send an Enquiry</h2>
                </div>
            </div>
            <div style="max-width: 800px; margin: 0 auto;">
                ${renderEnquiryFormCard()}
            </div>
        </div>
    `;
}

function renderEnquiryFormCard() {
    return `
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
                    <input type="text" id="msg-name" class="login-input" value="${state.user?.name || ''}" style="padding: 18px; border-radius: 15px;" placeholder="e.g. John Doe">
                </div>
                <div class="input-row-multi">
                    <div class="input-group">
                        <label class="input-label-premium" style="margin-bottom: 8px;">MOBILE NUMBER</label>
                        <input type="tel" id="msg-mobile" class="login-input" value="${state.user?.mobile || ''}" maxlength="10" oninput="this.value = this.value.replace(/\\D/g, '').slice(0, 10)" style="padding: 18px; border-radius: 15px;" placeholder="9876543210">
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
    `;
}

window.requestCallback = async () => {
    const text = document.getElementById('direct-msg-text').value.trim();
    const name = document.getElementById('msg-name').value.trim();
    const mobile = document.getElementById('msg-mobile').value.trim();
    const email = document.getElementById('msg-email').value.trim();

    if (!text || !name || !mobile) {
        return alert('Please fill in your name, mobile number, and message.');
    }
    if (mobile.length !== 10) {
        return alert('Please enter a valid 10-digit mobile number');
    }

    const btn = document.activeElement;
    btn.disabled = true;
    btn.innerText = 'SENDING...';

    try {
        const payload = {
            action: 'add',
            sender: name,
            mobile: mobile,
            email: email,
            text: text,
            timestamp: new Date().toISOString()
        };

        // Send to local API (Backend handles sheet sync)
        const res = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('Message sent! We will get back to you soon.');
            document.getElementById('direct-msg-text').value = '';
            await renderMessagesView();
        } else {
            alert('Failed to send message');
        }
    } catch (e) {
        alert('Network error');
    } finally {
        btn.disabled = false;
        btn.innerText = 'SUBMIT ENQUIRY';
    }
};

window.showMessageModal = () => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="login-modal" style="max-width: 450px; padding: 35px; border-radius: 25px;">
            <h2 style="font-family: 'Playfair Display', serif; margin-bottom: 5px;">Send a Message</h2>
            <p style="margin-bottom: 25px; color: #666; font-size: 14px;">How can we help you today?</p>
            <div style="display: grid; gap: 15px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="input-group">
                        <label style="font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: 1px; display: block; margin-bottom: 8px;">FULL NAME</label>
                        <input type="text" id="modal-msg-name" class="login-input" placeholder="Your Name" value="${state.user?.name || ''}" style="margin-bottom:0; border-radius: 12px;">
                    </div>
                    <div class="input-group">
                        <label style="font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: 1px; display: block; margin-bottom: 8px;">MOBILE NUMBER</label>
                        <input type="tel" id="modal-msg-mobile" class="login-input" placeholder="Your Mobile" value="${state.user?.mobile || ''}" maxlength="10" oninput="this.value = this.value.replace(/\D/g, '').slice(0, 10)" style="margin-bottom:0; border-radius: 12px;">
                    </div>
                </div>
                <div class="input-group">
                    <label style="font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: 1px; display: block; margin-bottom: 8px;">EMAIL (OPTIONAL)</label>
                    <input type="email" id="modal-msg-email" class="login-input" placeholder="e.g. john@example.com" value="${state.user?.email || ''}" style="margin-bottom:0; border-radius: 12px;">
                </div>
                <div class="input-group">
                    <label style="font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: 1px; display: block; margin-bottom: 8px;">YOUR MESSAGE</label>
                    <textarea id="modal-msg-text" class="login-input" style="height: 120px; padding: 15px; resize: none; margin-bottom: 0; border-radius: 12px;" placeholder="How can we help?"></textarea>
                </div>
                <button class="cta-btn" style="width: 100%; padding: 18px;" id="send-modal-msg-btn">SEND MESSAGE</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    document.getElementById('send-modal-msg-btn').onclick = async () => {
        const name = document.getElementById('modal-msg-name').value.trim();
        const mobile = document.getElementById('modal-msg-mobile').value.trim();
        const email = document.getElementById('modal-msg-email').value.trim();
        const text = document.getElementById('modal-msg-text').value.trim();

        if (!name || !mobile || !text) return alert('Please fill in Name, Mobile, and Message');
        if (mobile.length !== 10) return alert('Please enter a valid 10-digit mobile number');

        const btn = document.getElementById('send-modal-msg-btn');
        btn.disabled = true;
        btn.innerText = 'SENDING...';

        try {
            const payload = {
                action: 'add',
                sender: name,
                mobile: mobile,
                email: email,
                text: text,
                timestamp: new Date().toISOString()
            };

            // Local backend
            await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Google Sheets Sync
            try {
                fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } catch (err) {
                console.error('Google Sheets sync failed:', err);
            }

            btn.style.background = '#2ECC71';
            btn.innerText = '✨ MESSAGE SENT!';
            setTimeout(() => modal.remove(), 1500);
            if (state.view === 'messages') renderMessagesView();
        } catch (e) {
            alert('Encountered an error sending message.');
            btn.disabled = false;
            btn.innerText = 'SUBMIT ENQUIRY';
        }
    };
};

window.updateProfile = async () => {
    const name = document.getElementById('profile-name').value;
    const email = document.getElementById('profile-email').value;

    if (!name) return alert('Please enter your full name.');

    const btn = document.getElementById('save-profile-btn');
    btn.innerText = 'SAVING...';
    btn.disabled = true;

    try {
        const updatedUser = { ...state.user, name, email };

        // Sync to Google Sheets
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'updateProfile',
                mobile: state.user.mobile,
                name: name,
                email: email
            })
        });

        localStorage.setItem('user', JSON.stringify(updatedUser));
        state.user = updatedUser;

        render();
        alert('✨ Profile updated successfully and synced to Google Sheets!');
        window.renderProfileView(); // Redraw
    } catch (err) {
        console.error('Update failed:', err);
        alert('Failed to sync changes to cloud.');
    } finally {
        if (btn) {
            btn.innerText = 'SAVE CHANGES';
            btn.disabled = false;
        }
    }
};

// --- DYNAMIC HERO CAROUSEL ---

let heroTimer = null;
let currentHeroIndex = 0;
let lastHeroContent = ""; // To prevent re-rendering same slides

function initHeroCarousel() {
    const container = document.getElementById('hero-media-container');
    if (!container || !state.cms.hero.slides.length) {
        if (heroTimer) clearInterval(heroTimer);
        lastHeroContent = "";
        return;
    }

    // Hash slides and interval to see if they changed
    const currentContentHash = JSON.stringify(state.cms.hero);
    if (currentContentHash === lastHeroContent) return;
    lastHeroContent = currentContentHash;

    if (heroTimer) clearInterval(heroTimer);

    // Initial Render of all slides (hidden)
    container.innerHTML = state.cms.hero.slides.map((slide, idx) => {
        const isVideo = slide.type === 'video';
        // Note: Faster transition for smoother feel
        const style = `position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition: opacity 2s ease-in-out; opacity: ${idx === 0 ? 1 : 0}; z-index:1;`;
        return isVideo
            ? `<video src="${getImageUrl(slide.url)}" class="hero-slide-item" style="${style}" muted loop playsinline></video>`
            : `<img src="${getImageUrl(slide.url)}" class="hero-slide-item" style="${style}">`;
    }).join('');

    const slides = container.querySelectorAll('.hero-slide-item');
    if (slides[0] && slides[0].tagName === 'VIDEO') slides[0].play().catch(e => console.warn('Hero video autoplay failed', e));

    currentHeroIndex = 0;

    // ONLY start interval if more than 1 slide
    if (slides.length > 1) {
        const interval = (state.cms.hero.interval || 5) * 1000;
        console.log(`[Hero] Carousel started with ${slides.length} slides, interval: ${interval}ms`);

        heroTimer = setInterval(() => {
            const nextIndex = (currentHeroIndex + 1) % slides.length;

            // Switch slides
            slides[currentHeroIndex].style.opacity = 0;
            if (slides[currentHeroIndex].tagName === 'VIDEO') {
                setTimeout(() => slides[currentHeroIndex].pause(), 2000); // Pause after fade
            }

            slides[nextIndex].style.opacity = 1;
            if (slides[nextIndex].tagName === 'VIDEO') {
                slides[nextIndex].play().catch(e => console.warn('Hero video play failed', e));
            }

            currentHeroIndex = nextIndex;
        }, interval);
    }
}

init();
