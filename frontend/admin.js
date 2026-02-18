const API_URL = 'https://shashiniphotogrphy-production.up.railway.app/api';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwQTkkUUH6KSrajQCD4WLJ3uRT8ddBDqr-dQFIDwMAkFsAB9PXBZxnYmzo6SaHMP9iF/exec';
const CMS_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwQTkkUUH6KSrajQCD4WLJ3uRT8ddBDqr-dQFIDwMAkFsAB9PXBZxnYmzo6SaHMP9iF/exec';

// --- SECURE SHIELD ---
window.onerror = function (msg) { console.error('[Admin Shield]', msg); return true; };
window.onunhandledrejection = function (e) { console.error('[Admin Shield] Rejection', e.reason); };

function getImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    if (url.startsWith('./') || url.startsWith('../')) return url; // Handle local relative paths
    if (url.startsWith('/')) return API_URL + url;
    return API_URL + '/' + url;
}

// Utility: Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)' : 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)'};
        color: white;
        padding: 16px 24px;
        border-radius: 15px;
        font-size: 13px;
        font-weight: 600;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Utility: Copy to Clipboard
window.copyToClipboard = (text, label = 'Content') => {
    navigator.clipboard.writeText(text).then(() => {
        showToast(`✓ ${label} copied!`, 'success');
    }).catch(err => {
        showToast('Failed to copy', 'error');
    });
};

// State
let state = {
    activeTab: 'overview',
    vaults: [],
    selections: [],
    bookings: [],
    eventTypes: [],
    cms: { items: [], hero: { slides: [], interval: 5 }, graphics: {} },
    messages: [],
    vaultSearch: '',
    vaultFilter: 'all',
    vaultDateFilter: 'all',
    viewMode: 'list', // 'list' or 'cards'
    currentPage: 1,
    itemsPerPage: 9,
    bookingSearch: '',
    bookingFilter: 'all',
    messageSearch: '',
    messageFilter: 'all'
};

// --- CORE DASHBOARD LOGIC ---

async function init() {
    // ENFORCE MANDATORY LOGIN
    if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = './index.html';
        return;
    }

    setupTabSwitching();
    setupGlobalListeners();

    // Force Card View on Mobile for better UX
    if (window.innerWidth < 768) {
        state.viewMode = 'cards';
    }

    await refreshData();
    renderAll();
    setupMobileMenu();

    // Auto-refresh data every 30 seconds for "real-time" sync
    setInterval(async () => {
        console.log('[Admin] Auto-refreshing data...');
        await refreshData();
        renderAll();
    }, 30000);

    // Header scroll listener
    window.addEventListener('scroll', () => {
        document.body.classList.toggle('scrolled', window.scrollY > 50);
    });
}

function setupMobileMenu() {
    console.log('[Admin] Setting up mobile menu...');
    const ham = document.getElementById('hamburger-btn');
    const close = document.getElementById('close-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const links = document.querySelectorAll('.mobile-nav-link');
    const themeToggle = document.getElementById('mobile-theme-toggle');

    if (themeToggle) {
        themeToggle.onclick = (e) => {
            e.stopPropagation();
            window.toggleTheme();
            // Optional: Close menu after toggle? Maybe not.
        };
    }

    if (ham && menu) {
        ham.onclick = (e) => {
            e.stopPropagation();
            console.log('[Admin] Hamburger clicked');
            menu.classList.add('active');
        };
    } else {
        console.warn('[Admin] Hamburger or menu element missing:', { ham, menu });
    }

    if (close && menu) {
        close.onclick = () => menu.classList.remove('active');
    }

    if (links && menu) {
        links.forEach(link => {
            link.onclick = (e) => {
                const tab = e.currentTarget.dataset.tab;
                if (tab) {
                    switchTab(tab);
                    menu.classList.remove('active');
                }
            };
        });
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (menu && menu.classList.contains('active') && !menu.contains(e.target) && e.target !== ham) {
            menu.classList.remove('active');
        }
    });
}

async function refreshData() {
    // Helper to fetch with better error context
    const safeFetch = async (url, name) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // Increased to 20s for Google Scripts

        try {
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            clearTimeout(timeoutId);
            const isTimeout = e.name === 'AbortError';
            console.error(`[Admin Sync] ${name} failed:`, isTimeout ? 'Timeout' : e.message);

            // Only show toast for critical failures, or make it more descriptive
            if (isTimeout) {
                showToast(`Sync delayed: ${name} (Google is slow)`, 'error');
            } else {
                showToast(`Sync issue: ${name}`, 'error');
            }
            return [];
        }
    };

    try {
        const t = Date.now(); // Cache buster
        const [v, s, c, b, et, m] = await Promise.all([
            safeFetch(`${API_URL}/vaults?sync=true&t=${t}`, 'Vaults'),
            safeFetch(`${API_URL}/vaults/selections?t=${t}`, 'Selections'),
            fetch(`${CMS_SHEET_URL}?action=getCMS&t=${t}`).then(r => r.json()).catch(err => {
                console.warn('[CMS] Sheet fetch failed, falling back to local:', err);
                return safeFetch(`${API_URL}/cms?t=${t}`, 'CMS (Local Fallback)');
            }),
            safeFetch(`${API_URL}/bookings?sync=true&t=${t}`, 'Bookings'),
            safeFetch(`${API_URL}/bookings/event-types?t=${t}`, 'EventTypes'),
            safeFetch(`${API_URL}/messages?sync=true&t=${t}`, 'Messages')
        ]);

        state.vaults = Array.isArray(v) ? v : [];
        state.selections = Array.isArray(s) ? s : [];

        // Handle Object-based CMS
        if (c && c.items && c.hero) {
            state.cms = {
                items: c.items || [],
                hero: c.hero || { slides: [], interval: 5 },
                graphics: c.graphics || {}
            };
        } else {
            // Fallback: merge if partial data
            state.cms = {
                items: (c && c.items) ? c.items : (Array.isArray(c) ? c : (state.cms?.items || [])),
                hero: (c && c.hero) ? c.hero : (state.cms?.hero || { slides: [], interval: 5 }),
                graphics: (c && c.graphics) ? c.graphics : (state.cms?.graphics || {})
            };
        }

        state.bookings = Array.isArray(b) ? b : [];
        state.eventTypes = Array.isArray(et) ? et : [];
        state.messages = Array.isArray(m) ? m : [];
        state.sheetVaults = Array.isArray(v) ? v : [];
    } catch (err) {
        console.error('Data refresh failed:', err);
        // Alert with specific error detail
        alert(`Backend Connection Error: ${err.message}. Ensure backend is running on port 5001.`);
    }
}

function setupTabSwitching() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const target = tab.dataset.tab;
            state.activeTab = target;

            document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === target));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === target));

            renderAll();
        });
    });
}

function setupGlobalListeners() {
    // Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') document.body.classList.add('dark-mode');

    if (themeToggle) {
        // Theme Toggle Logic
        window.toggleTheme = () => {
            document.body.classList.toggle('dark-mode');
            const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', theme);

            // Update both buttons icon/state if needed, though CSS handles most
        };

        if (themeToggle) {
            themeToggle.onclick = window.toggleTheme;
        }
    }

    // Vault Save
    const saveVaultBtn = document.getElementById('save-link');
    if (saveVaultBtn) saveVaultBtn.onclick = saveVault;

    // CMS Add
    const cmsAddBtn = document.getElementById('cms-add');
    if (cmsAddBtn) cmsAddBtn.onclick = addCMS;

    const cmsAddYoutubeBtn = document.getElementById('cms-add-youtube');
    if (cmsAddYoutubeBtn) cmsAddYoutubeBtn.onclick = window.addYouTubeCMS;

    // Initialize file upload
    initFileUpload();

    // Modal Open
    const openVaultBtn = document.getElementById('open-link_vault_btn');
    if (openVaultBtn) {
        openVaultBtn.onclick = () => {
            document.getElementById('vault-modal').style.display = 'flex';
        };
    }

    // Modal Close
    window.onclick = (e) => {
        if (e.target.className === 'modal-overlay') e.target.style.display = 'none';
    };

    // Vault Filters
    const vaultSearch = document.getElementById('vault-search');
    if (vaultSearch) {
        vaultSearch.oninput = (e) => {
            state.vaultSearch = e.target.value.toLowerCase();
            renderVaults();
        };
    }
    const vaultStatusFilter = document.getElementById('vault-status-filter');
    if (vaultStatusFilter) {
        vaultStatusFilter.onchange = (e) => {
            state.vaultFilter = e.target.value;
            renderVaults();
        };
    }

    const vaultDateFilter = document.getElementById('vault-date-filter');
    if (vaultDateFilter) {
        vaultDateFilter.onchange = (e) => {
            state.vaultDateFilter = e.target.value;
            renderVaults();
        };
    }

    // Booking Filters
    const bookingSearch = document.getElementById('booking-search');
    if (bookingSearch) {
        bookingSearch.oninput = (e) => {
            state.bookingSearch = e.target.value.toLowerCase();
            renderBookings();
        };
    }
    const bookingStatusFilter = document.getElementById('booking-status-filter');
    if (bookingStatusFilter) {
        bookingStatusFilter.onchange = (e) => {
            state.bookingFilter = e.target.value;
            renderBookings();
        };
    }

    // Message Filters
    const messageSearch = document.getElementById('message-search');
    if (messageSearch) {
        messageSearch.oninput = (e) => {
            state.messageSearch = e.target.value.toLowerCase();
            renderMessages();
        };
    }
    const messageStatusFilter = document.getElementById('message-status-filter');
    if (messageStatusFilter) {
        messageStatusFilter.onchange = (e) => {
            state.messageFilter = e.target.value;
            renderMessages();
        };
    }
}

function renderAll() {
    renderOverview();
    renderVaults();
    renderBookings();
    renderCMS();
    renderMessages();
    renderDynamicSelects();
}

function renderDynamicSelects() {
    const selects = [
        'link-session-type',
        'edit-vault-type',
        'edit-booking-type'
    ];

    selects.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const currentVal = el.value;
            // Filter out any empty/null/undefined types just in case
            const validTypes = state.eventTypes.filter(t => t);

            el.innerHTML = validTypes.map(t => `<option value="${t}">${t}</option>`).join('');

            // If previous selection still exists, keep it. Otherwise default to first.
            if (validTypes.includes(currentVal)) {
                el.value = currentVal;
            } else if (validTypes.length > 0) {
                el.value = validTypes[0];
            }
        }
    });

    // Also update the filter dropdown in Vaults if it exists
    const vaultFilter = document.getElementById('vault-status-filter');
    if (vaultFilter) {
        // We keep the first 4 standard options and then add dynamic types as data filters
        // For simplicity, we just leave status filter as is for now as it's for status, not type.
    }
}

// --- TAB: OVERVIEW ---

function renderOverview() {
    // 1. Render Stats Grid
    const statsGrid = document.getElementById('overview-stats-grid');
    if (statsGrid) {
        const stats = [
            { label: 'Active Vaults', value: state.vaults.length, icon: '🎞️', sub: `${new Set(state.vaults.map(v => v.customerMobile)).size} Clients`, tab: 'vaults' },
            { label: 'New Enquiries', value: state.messages.filter(m => !m.read).length, icon: '✉️', sub: 'Inbox Activity', tab: 'messages' },
            { label: 'Studio CMS', value: state.cms.length, icon: '📸', sub: 'Active Photos', tab: 'cms' }
        ];

        statsGrid.innerHTML = stats.map(s => `
            <div class="stat-card" onclick="window.switchTab('${s.tab}')" style="cursor: pointer; padding: 25px; border-radius: 25px; background: var(--white); border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.02); transition: all 0.3s;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <span style="font-size: 10px; font-weight: 800; color: var(--accent); letter-spacing: 2px; text-transform: uppercase;">${s.label}</span>
                    <span style="font-size: 20px;">${s.icon}</span>
                </div>
                <div class="stat-value" style="font-size: 32px; font-weight: 800; margin: 0 0 5px 0;">${s.value}</div>
                <p style="font-size: 11px; color: #aaa; font-weight: 600; margin: 0;">${s.sub}</p>
            </div>
        `).join('');
    }

    // 2. Render Activity Feed
    const activityFeed = document.getElementById('recent-activity-feed');
    if (activityFeed) {
        const activities = [
            ...state.messages.map(m => ({ ...m, type: 'Message', icon: '✉️', color: 'rgba(184, 156, 125, 0.1)', view: 'messages', title: m.sender, sub: m.text, date: m.timestamp })),
            ...state.cms.hero.slides.map(s => ({ ...s, type: 'Hero Slide', icon: '🖼️', color: 'rgba(52, 152, 219, 0.1)', view: 'cms', title: s.title || 'New Hero Media', sub: 'Updated Home Banner', date: parseInt(s.id) })),
            ...state.cms.items.slice(0, 10).map(i => ({ ...i, type: 'Gallery', icon: '🎨', color: 'rgba(46, 204, 113, 0.1)', view: 'cms', title: i.title, sub: 'New Master Exhibition Piece', date: parseInt(i.id) }))
        ].sort((a, b) => new Date(b.date || b.timestamp || b.createdAt) - new Date(a.date || a.timestamp || a.createdAt)).slice(0, 8);

        if (activities.length === 0) {
            activityFeed.innerHTML = `<div style="text-align:center; padding: 40px; color: #ccc;">No current studio activity logged.</div>`;
        } else {
            activityFeed.innerHTML = activities.map(item => {
                const dateObj = new Date(item.timestamp || item.createdAt || Date.now());
                const dateStr = isNaN(dateObj.getTime()) ? 'Recently' : dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

                return `
                <div onclick="window.switchTab('${item.view}')" style="display: flex; align-items: center; gap: 20px; padding: 20px; border-radius: 20px; background: #fafafa; border: 1px solid #f0f0f0; cursor: pointer; transition: all 0.3s;">
                    <div style="width: 45px; height: 45px; border-radius: 12px; background: ${item.color}; color: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">${item.icon}</div>
                    <div style="flex:1; min-width: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                            <span style="font-weight: 800; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-primary);">${item.title || 'Unknown'}</span>
                            <span style="font-size: 9px; font-weight: 700; color: #bbb; text-transform: uppercase; white-space: nowrap;">${dateStr}</span>
                        </div>
                        <span style="display: block; font-size: 11px; color: #777; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${(item.type || 'Activity').toUpperCase()} • "${item.sub || '...'}"</span>
                    </div>
                </div>
            `}).join('');
        }
    }

    // 3. Render Next Session Focus
    const focusContainer = document.getElementById('next-session-focus');
    if (focusContainer) {
        const next = state.bookings
            .filter(b => b.status === 'confirmed' && new Date(b.date) >= new Date().setHours(0, 0, 0, 0))
            .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

        focusContainer.innerHTML = `
            <div class="card" style="padding: 40px; border-radius: 40px; background: linear-gradient(135deg, #2c3e50 0%, #000000 100%); color: white; border: none; box-shadow: 0 30px 60px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; text-align: center;">
                <div>
                    <span style="display: inline-block; padding: 6px 15px; background: rgba(255,255,255,0.1); border-radius: 20px; font-size: 9px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 25px;">STUDIO MANAGEMENT</span>
                    <h3 style="font-family: 'Metropolis', sans-serif; font-size: 24px; margin: 0 0 20px 0;">External Scheduling Active</h3>
                    <p style="font-size: 13px; opacity: 0.7; max-width: 300px;">Manage all upcoming studio sessions and availability in the Cal.com dashboard.</p>
                </div>
            </div>
        `;
    }

    // 4. Render Studio Quick Summary
    const summary = document.getElementById('studio-quick-summary');
    if (summary) {
        const vaultPending = state.vaults.filter(v => v.workflowStatus === 'pending' || !v.workflowStatus).length;
        const msgUnread = state.messages.filter(m => !m.read).length;
        const bookingReq = state.bookings.filter(b => b.status === 'pending').length;

        summary.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: rgba(231, 76, 60, 0.05); border-radius: 15px; border: 1px solid rgba(231, 76, 60, 0.1);">
                    <span style="font-size: 12px; font-weight: 700; color: #E74C3C;">Unread Enquiries</span>
                    <span style="font-size: 14px; font-weight: 800; color: #E74C3C;">${msgUnread}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: rgba(184, 156, 125, 0.05); border-radius: 15px; border: 1px solid rgba(184, 156, 125, 0.1);">
                    <span style="font-size: 12px; font-weight: 700; color: var(--accent);">Active Vaults</span>
                    <span style="font-size: 14px; font-weight: 800; color: var(--accent);">${vaultPending}</span>
                </div>
            </div>
        `;
    }
}

// Global Tab Switching Helper
window.switchTab = (tabName) => {
    state.activeTab = tabName;

    // Update active state in navigation
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === tabName));

    renderAll();

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// --- TAB: VAULTS ---

window.setViewMode = (mode) => {
    state.viewMode = mode;
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.toLowerCase() === mode);
    });
    renderVaults();
};

function renderVaults() {
    const container = document.getElementById('vaults-container');
    if (!container) return;

    let filteredVaults = state.vaults;

    // Filter by search
    if (state.vaultSearch) {
        filteredVaults = filteredVaults.filter(v =>
            v.customerMobile.includes(state.vaultSearch) ||
            v.sessionTitle.toLowerCase().includes(state.vaultSearch) ||
            (v.customerName && v.customerName.toLowerCase().includes(state.vaultSearch)) ||
            v.vaultId.toLowerCase().includes(state.vaultSearch)
        );
    }

    // Filter by status
    if (state.vaultFilter !== 'all') {
        filteredVaults = filteredVaults.filter(v => {
            const selection = state.selections.find(s => s.vaultId === v.vaultId && s.mobile === v.customerMobile);
            const isFinalized = selection && selection.finalized;
            let currentStatus = v.workflowStatus || (isFinalized ? 'finalized' : v.status);
            if (currentStatus === 'active') currentStatus = 'pending'; // Align with filter value
            return currentStatus === state.vaultFilter;
        });
    }

    // Sorting
    if (state.vaultDateFilter === 'newest') {
        filteredVaults.sort((a, b) => new Date(b.id * 1 || 0) - new Date(a.id * 1 || 0));
    } else if (state.vaultDateFilter === 'oldest') {
        filteredVaults.sort((a, b) => new Date(a.id * 1 || 0) - new Date(b.id * 1 || 0));
    }

    // Pagination Logic
    const totalPages = Math.ceil(filteredVaults.length / state.itemsPerPage);
    if (state.currentPage > totalPages) state.currentPage = totalPages || 1;
    const start = (state.currentPage - 1) * state.itemsPerPage;
    const paginatedVaults = filteredVaults.slice(start, start + state.itemsPerPage);

    if (filteredVaults.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 100px; color: #999; background: #fff; border-radius: 20px;">
                <p style="font-size: 48px; margin-bottom: 20px;">📂</p>
                <p style="font-size: 14px; font-weight: 700;">No collections found matching your criteria</p>
            </div>
        `;
        return;
    }

    let contentHTML = '';

    if (state.viewMode === 'list') {
        // TABLE VIEW
        contentHTML = `
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
                ${paginatedVaults.map(v => {
            const selection = state.selections.find(s => s.vaultId === v.vaultId && s.mobile === v.customerMobile);
            const isFinalized = selection && selection.finalized;
            const statusType = isFinalized ? 'finalized' : (v.status === 'active' ? 'pending' : v.status);
            const currentWorkflow = v.workflowStatus || statusType;
            const dateStr = new Date(parseInt(v.id)).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
            const timeStr = new Date(parseInt(v.id)).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

            return `
                        <tr>
                            <td><input type="checkbox" class="admin-checkbox"></td>
                            <td>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="width: 36px; height: 36px; border-radius: 8px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                        <span style="font-size: 16px;">🖼️</span>
                                    </div>
                                    <div style="display: flex; flex-direction: column;">
                                        <div style="display: flex; align-items: center; gap: 5px;">
                                            <span style="font-weight: 800; color: #111;">${v.customerName || 'No Name'}</span>
                                            <span style="font-size: 9px; font-weight: 800; color: var(--accent); background: #FFF4E5; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">${v.sessionType || 'Portrait'}</span>
                                        </div>
                                        <span style="font-size: 11px; font-weight: 600; color: #333;">${v.sessionTitle}</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div style="font-size: 12px; font-weight: 600; color: #111;">${dateStr}</div>
                                <div style="font-size: 10px; color: #555;">${timeStr}</div>
                            </td>
                            <td>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-weight: 600; color: #111;">${v.customerMobile}</span>
                                    <button class="copy-btn-mini" onclick="window.copyToClipboard('${v.customerMobile}', 'Mobile Number')" title="Copy Mobile">📋</button>
                                </div>
                            </td>
                            <td>
                                <a href="javascript:void(0)" onclick="window.viewSelection('${v.vaultId}', '${v.customerMobile}')" class="manage-link">Manage</a>
                            </td>
                            <td>
                                <select class="status-pill ${currentWorkflow}" 
                                        onchange="this.className='status-pill ' + this.value; window.updateWorkflowStatus('${v.id}', this.value)"
                                        style="font-family: 'Metropolis', sans-serif; padding-right: 30px;">
                                    <option value="pending" ${currentWorkflow === 'pending' ? 'selected' : ''}>Selection in Progress</option>
                                    <option value="finalized" ${currentWorkflow === 'finalized' ? 'selected' : ''}>Finalized</option>
                                    <option value="albumpending" ${currentWorkflow === 'albumpending' ? 'selected' : ''}>Album in Progress</option>
                                    <option value="albumcompleted" ${currentWorkflow === 'albumcompleted' ? 'selected' : ''}>Album Completed</option>
                                    <option value="delivered" ${currentWorkflow === 'delivered' ? 'selected' : ''}>Delivered</option>
                                </select>
                            </td>
                            <td style="text-align: right;">
                                <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
                                    <button onclick="window.toggleVaultLock('${v.id}')" 
                                            style="padding: 6px 12px; border-radius: 8px; border: none; font-size: 9px; font-weight: 800; cursor: pointer; background: ${v.status === 'locked' ? '#FFEBEE' : '#E8F5E9'}; color: ${v.status === 'locked' ? '#F44336' : '#4CAF50'};">
                                        ${v.status === 'locked' ? 'LOCKED' : 'ACTIVE'}
                                    </button>
                                    <div class="dot-menu">
                                        <button class="action-dot-btn">•••</button>
                                        <div class="dot-menu-content">
                                            <div class="dot-menu-item" onclick="window.editVault('${v.id}')"><span>✏️</span> Edit Details</div>
                                            <div class="dot-menu-item delete" onclick="window.deleteVault('${v.id}')"><span>🗑️</span> Delete Collection</div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    `;
        }).join('')}
            </tbody>
        </table>`;
    } else {
        // CARD VIEW
        contentHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
            ${paginatedVaults.map(v => {
            const selection = state.selections.find(s => s.vaultId === v.vaultId && s.mobile === v.customerMobile);
            const isFinalized = selection && selection.finalized;
            const currentWorkflow = v.workflowStatus || (isFinalized ? 'finalized' : 'pending');
            const dateStr = new Date(parseInt(v.id)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            return `
                <div class="card" style="padding: 20px; border-radius: 20px; background: white; border: 1px solid var(--border-color); transition: all 0.3s ease;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                        <span style="font-size: 10px; font-weight: 800; color: var(--accent); background: #FFF4E5; padding: 4px 10px; border-radius: 6px; text-transform: uppercase;">${v.sessionType || 'Portrait'}</span>
                        <div class="dot-menu">
                             <button class="action-dot-btn">•••</button>
                             <div class="dot-menu-content">
                                 <div class="dot-menu-item" onclick="window.editVault('${v.id}')"><span>✏️</span> Edit Details</div>
                                 <div class="dot-menu-item delete" onclick="window.deleteVault('${v.id}')"><span>🗑️</span> Delete Collection</div>
                             </div>
                        </div>
                    </div>
                    
                    <h3 style="font-size: 18px; margin-bottom: 5px;">${v.sessionTitle}</h3>
                    <p style="color: #666; font-size: 13px; margin-bottom: 20px;">${v.customerName}</p>
                    
                    <div style="display: flex; gap: 15px; margin-bottom: 20px; font-size: 12px; color: #888; align-items: center;">
                        <span style="display: flex; align-items: center; gap: 5px;">📅 ${dateStr}</span>
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <span>📱 ${v.customerMobile}</span>
                            <button class="copy-btn-mini" onclick="window.copyToClipboard('${v.customerMobile}', 'Mobile Number')" title="Copy Mobile">📋</button>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                        <select class="status-pill ${currentWorkflow}" 
                                onchange="this.className='status-pill ' + this.value; window.updateWorkflowStatus('${v.id}', this.value)"
                                style="font-size: 11px; padding: 6px 12px;">
                            <option value="pending" ${currentWorkflow === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="finalized" ${currentWorkflow === 'finalized' ? 'selected' : ''}>Finalized</option>
                            <option value="albumpending" ${currentWorkflow === 'albumpending' ? 'selected' : ''}>In Progress</option>
                            <option value="albumcompleted" ${currentWorkflow === 'albumcompleted' ? 'selected' : ''}>Done</option>
                            <option value="delivered" ${currentWorkflow === 'delivered' ? 'selected' : ''}>Delivered</option>
                        </select>
                        <button onclick="window.viewSelection('${v.vaultId}', '${v.customerMobile}')" 
                                style="background: var(--text-primary); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;">
                            Manage
                        </button>
                    </div>
                </div>
            `;
        }).join('')}
        </div>
        `;
    }

    // Pagination Controls
    let paginationHTML = '';
    if (totalPages > 1) {
        paginationHTML = `
        <div style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 30px; padding-bottom: 10px;">
            <button onclick="changePage(${state.currentPage - 1})" ${state.currentPage === 1 ? 'disabled' : ''} 
                    style="border:none; background:none; color:${state.currentPage === 1 ? '#ccc' : '#999'}; font-size:12px; font-weight:700; cursor:${state.currentPage === 1 ? 'default' : 'pointer'};">
                Previous
            </button>
            
            ${Array.from({ length: totalPages }, (_, i) => i + 1).map(page => `
                <div onclick="changePage(${page})" 
                     style="width: 30px; height: 30px; background: ${state.currentPage === page ? 'var(--accent)' : 'transparent'}; color: ${state.currentPage === page ? '#fff' : '#999'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; cursor: pointer;">
                    ${page}
                </div>
            `).join('')}

            <button onclick="changePage(${state.currentPage + 1})" ${state.currentPage === totalPages ? 'disabled' : ''}
                    style="border:none; background:none; color:${state.currentPage === totalPages ? '#ccc' : '#999'}; font-size:12px; font-weight:700; cursor:${state.currentPage === totalPages ? 'default' : 'pointer'};">
                Next
            </button>
        </div>
        `;
    }

    container.innerHTML = contentHTML + paginationHTML;
}

// Helper for pagination
window.changePage = (page) => {
    state.currentPage = page;
    renderVaults();
    // Scroll to top of container
    document.getElementById('vaults-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

async function saveVault() {
    const link = document.getElementById('link-url').value;
    const mobile = document.getElementById('link-mobile').value;
    const name = document.getElementById('link-name').value;
    const type = document.getElementById('link-session-type').value;
    const title = document.getElementById('link-title').value;

    // VALIDATION: Clean mobile and check length
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) return alert('Please enter a valid 10-digit mobile number');

    if (!link || !mobile) return alert('Folder link and mobile are required');

    const btn = document.getElementById('save-link');
    btn.disabled = true;
    btn.innerText = 'SAVING...';

    try {
        const res = await fetch(`${API_URL}/vaults/link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folderLink: link, mobile, customerName: name, sessionType: type, sessionTitle: title })
        });

        if (res.ok) {
            document.getElementById('vault-modal').style.display = 'none';
            document.getElementById('link-url').value = '';
            document.getElementById('link-mobile').value = '';
            document.getElementById('link-name').value = '';
            document.getElementById('link-title').value = '';
            // No hardcoded reset to "Wedding" - let it stay at whatever is first in the dynamic list
            showToast('✓ Vault linked successfully!', 'success');
            await refreshData();
            renderAll();
        } else {
            showToast('Failed to save vault', 'error');
        }
    } catch (e) { alert('Network error'); }
    finally {
        btn.disabled = false;
        btn.innerText = 'SAVE VAULT';
    }
}

window.toggleVaultLock = async (id) => {
    // Optimistic UI: find the vault in local state and toggle immediately
    const vault = state.vaults.find(v => String(v.id) === String(id));
    if (vault) {
        vault.status = (vault.status === 'locked' ? 'active' : 'locked');
        renderAll(); // Immediate visual feedback
    }

    try {
        const res = await fetch(`${API_URL}/vaults/${id}/toggle-lock`, { method: 'PATCH' });
        if (!res.ok) throw new Error('Update failed');
    } catch (e) {
        // Rollback on failure
        if (vault) {
            vault.status = (vault.status === 'locked' ? 'active' : 'locked');
            renderAll();
        }
        showToast('Failed to toggle lock', 'error');
    }
};

// Edit Vault Modal Logic
window.editVault = (id) => {
    // FIX: Type-safe comparison (String vs Number)
    const v = state.vaults.find(v => String(v.id) === String(id));
    if (!v) {
        console.error('Edit Vault: ID not found in state:', id);
        return;
    }

    document.getElementById('edit-vault-id').value = v.id;
    document.getElementById('edit-vault-name').value = v.customerName || '';
    document.getElementById('edit-vault-mobile').value = v.customerMobile || '';
    document.getElementById('edit-vault-type').value = v.sessionType || 'Wedding';
    document.getElementById('edit-vault-title').value = v.sessionTitle || '';
    document.getElementById('edit-vault-drive-id').value = v.vaultId || '';

    // Convert timestamp/string to YYYY-MM-DD for input[type=date]
    const dateObj = new Date(v.createdAt || parseInt(v.id));
    const dateStr = dateObj.toISOString().split('T')[0];
    document.getElementById('edit-vault-date').value = dateStr;

    document.getElementById('edit-vault-modal').style.display = 'flex';
};

// Update Vault Handler
document.getElementById('update-vault-btn').onclick = async () => {
    const id = document.getElementById('edit-vault-id').value;
    const name = document.getElementById('edit-vault-name').value;
    const mobile = document.getElementById('edit-vault-mobile').value;
    const type = document.getElementById('edit-vault-type').value;
    const title = document.getElementById('edit-vault-title').value;
    const dateValue = document.getElementById('edit-vault-date').value;
    const driveId = document.getElementById('edit-vault-drive-id').value;

    // VALIDATION
    if (mobile.length !== 10) return alert('Please enter a valid 10-digit mobile number');

    const btn = document.getElementById('update-vault-btn');
    btn.disabled = true;
    btn.innerText = 'SAVING...';

    try {
        const res = await fetch(`${API_URL}/vaults/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerName: name,
                customerMobile: mobile,
                sessionType: type,
                sessionTitle: title,
                createdAt: dateValue ? new Date(dateValue).toISOString() : undefined,
                vaultId: driveId
            })
        });

        if (res.ok) {
            showToast('Changes saved successfully!');
            document.getElementById('edit-vault-modal').style.display = 'none';
            await refreshData();
            renderAll();
        } else {
            showToast('Failed to update vault', 'error');
        }
    } catch (e) {
        showToast('Network error', 'error');
    } finally {
        btn.disabled = false;
        btn.innerText = 'SAVE CHANGES';
    }
};

window.updateWorkflowStatus = async (id, status) => {
    try {
        const response = await fetch(`${API_URL}/vaults/${id}/workflow-status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workflowStatus: status })
        });

        if (!response.ok) throw new Error('Failed to update status');

        await refreshData();
        renderVaults(); // Immediate update for the table
        showToast('Workflow status updated!');
    } catch (e) {
        console.error('Workflow update error:', e);
        showToast('Update failed: ' + e.message, 'error');
        renderVaults(); // Revert UI on failure
    }
};

window.deleteVault = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this vault? This action cannot be undone.')) return;

    try {
        const response = await fetch(`${API_URL}/vaults/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Delete failed');
        }
        showToast('✓ Vault deleted successfully', 'success');
        await refreshData();
        renderAll();
    } catch (e) {
        showToast('Failed to delete vault: ' + e.message, 'error');
    }
};

// ... existing code ...

// Inside init() or global listeners setup, we don't strictly need it if we put onclick in HTML, 
// but for consistency with the design, we can inject the button via JS if strictly needed, 
// or the user modifies HTML. Since `admin.js` controls the render, let's look for where the header buttons are 
window.viewSelection = async (vaultId, mobile) => {
    const selection = state.selections.find(s => s.vaultId === vaultId && s.mobile === mobile);
    const vault = state.vaults.find(v => String(v.id) === String(vaultId)) || {};
    const isFinalized = selection && selection.finalized;

    // Create a temporary loader that doesn't destroy the app content
    const loader = document.createElement('div');
    loader.className = 'modal-overlay';
    loader.style.cssText = 'display:flex; z-index: 9000;';
    loader.innerHTML = `<div class="login-modal" style="text-align:center;"><p style="font-weight:700;">Accessing Vault...</p><p style="font-size:12px; opacity:0.6;">Checking for updates and fetching collections.</p></div>`;
    document.body.appendChild(loader);

    try {
        const photoResp = await fetch(`${API_URL}/vaults/${vaultId}/photos`);
        if (!photoResp.ok) throw new Error('Could not fetch photos');
        const photoData = await photoResp.json();
        const allPhotos = photoData.photos || [];

        // Remove the loader before showing the grid
        loader.remove();

        // Store for global access
        window.currentVaultPhotos = allPhotos;
        window.currentSelections = new Set(selection ? selection.selections : []);
        window.currentViewFilter = (window.currentSelections.size > 0) ? 'selected' : 'all';
        window.currentVaultId = vaultId;
        window.currentMobile = mobile;
        window.isFinalizedView = isFinalized;

        // Render Function
        window.renderSelectionGrid = () => {
            const grid = document.getElementById('selection-grid');
            if (!grid) return;

            let filteredPhotos = [];
            if (window.currentViewFilter === 'selected') {
                filteredPhotos = window.currentVaultPhotos.filter(p => window.currentSelections.has(p.id));
            } else if (window.currentViewFilter === 'unselected') {
                filteredPhotos = window.currentVaultPhotos.filter(p => !window.currentSelections.has(p.id));
            } else {
                filteredPhotos = window.currentVaultPhotos; // 'all'
            }

            // Update lightbox context to filtered set
            window.adminLightboxPhotos = filteredPhotos;

            if (filteredPhotos.length === 0) {
                grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #999;">
                    <p style="font-size: 48px; margin-bottom: 20px;">📭</p>
                    <p style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">No photos found in this view</p>
                </div>`;
            } else {
                grid.className = 'premium-grid';
                grid.innerHTML = filteredPhotos.map((photo, idx) => {
                    const inDelivery = window.currentSelections.has(photo.id);
                    return `
                    <div class="premium-card ${inDelivery ? 'selected' : ''}" 
                            id="photo-card-${photo.id}" style="animation-delay: ${idx * 0.05}s">
                        
                        <div class="card-badge">#${idx + 1}</div>
                        
                        <div class="premium-card-image-wrapper" onclick="openAdminLightbox(${idx}, window.adminLightboxPhotos)">
                            <img src="${photo.googleUrl || getImageUrl(photo.url)}" loading="lazy">
                            <div class="premium-card-overlay">
                                ${inDelivery ? `
                                    <div class="selection-indicator">
                                        <span style="font-size: 18px;">✨</span> SELECTED
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        ${window.isFinalizedView ? `
                            <div class="card-action-bar">
                                <button class="premium-action-btn ${inDelivery ? 'remove' : 'add'} action-btn-${photo.id}" 
                                        onclick="window.toggleDeliveryPhoto('${vaultId}', '${mobile}', '${photo.id}')">
                                    ${inDelivery ? 'Remove Selection' : 'Add Selection'}
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `}).join('');
            }

            // Update Tab Counts
            if (document.getElementById('cnt-selected')) document.getElementById('cnt-selected').innerText = window.currentSelections.size;
            if (document.getElementById('cnt-unselected')) document.getElementById('cnt-unselected').innerText = window.currentVaultPhotos.length - window.currentSelections.size;
            if (document.getElementById('cnt-all')) document.getElementById('cnt-all').innerText = window.currentVaultPhotos.length;
        };

        // Store photos for lightbox
        window.adminLightboxPhotos = allPhotos;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="premium-modal">
                <button onclick="this.closest('.modal-overlay').remove(); document.body.style.overflow = '';" 
                        style="position: absolute; top: 30px; right: 30px; z-index: 1001; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); font-size: 18px;">✕</button>

                <div class="premium-header">
                    <div class="premium-header-content">
                        <div class="premium-title-group">
                            <span class="premium-subtitle">${isFinalized ? 'DELIVERY MANAGER' : 'CURATION PREVIEW'}</span>
                            <h2>${vault.title || selection?.vaultName || 'Vault Photos'}</h2>
                            <div style="margin-top: 15px; color: rgba(255,255,255,0.6); font-size: 13px; font-weight: 500;">
                                <span style="color: #4CAF50;">●</span> ${mobile}
                                <span style="margin: 0 10px; opacity: 0.3;">|</span>
                                ${new Date().toLocaleDateString()}
                            </div>
                        </div>

                        <div>
                            ${vault.driveUrl ? `
                                <a href="${vault.driveUrl}" target="_blank" class="drive-btn-premium">
                                    <span>📂</span> Open Drive Folder
                                </a>
                            ` : ''}
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
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        window.renderSelectionGrid();

    } catch (e) {
        if (typeof loader !== 'undefined') loader.remove();
        showToast('Error loading vault photos', 'error');
        console.error(e);
    }
}

window.switchViewFilter = (filter) => {
    window.currentViewFilter = filter;

    // Update Tab Styles
    document.querySelectorAll('.glass-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${filter}`).classList.add('active');

    window.renderSelectionGrid();
}

window.toggleDeliveryPhoto = async (vaultId, mobile, photoId) => {
    const btn = document.querySelector(`.action-btn-${photoId}`);
    const originalText = btn.innerHTML;

    // Determine action based on current state in our Set
    const isInDelivery = window.currentSelections.has(photoId);
    const endpoint = isInDelivery ? 'remove' : 'add';

    btn.disabled = true;
    btn.innerHTML = 'Wait...';

    try {
        const res = await fetch(`${API_URL}/vaults/delivery/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vaultId, mobile, photoId })
        });

        if (res.ok) {
            // Update Local State
            if (isInDelivery) {
                window.currentSelections.delete(photoId);
            } else {
                window.currentSelections.add(photoId);
            }

            showToast(`Delivery updated!`, 'success');

            // Re-render grid to reflect changes
            window.renderSelectionGrid();

            // Background refresh
            refreshData();
        } else {
            const err = await res.json();
            alert(`Error: ${err.error}`);
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    } catch (e) {
        alert('Network error');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}







// Move card to the other grid









window.openAdminLightbox = (index, photosData) => {
    const photos = typeof photosData === 'string' ? JSON.parse(photosData) : photosData;
    const lightbox = document.createElement('div');
    lightbox.id = 'admin-lightbox';
    lightbox.className = 'lightbox-overlay';
    lightbox.innerHTML = `
        <div class="lightbox-container">
            <button class="lightbox-close" onclick="closeAdminLightbox()">✕</button>
            <button class="lightbox-nav lightbox-prev" onclick="navigateAdminLightbox(-1)">‹</button>
            <button class="lightbox-nav lightbox-next" onclick="navigateAdminLightbox(1)">›</button>
            <div class="lightbox-content">
                <img id="admin-lightbox-image" src="${photos[index].googleUrl || getImageUrl(photos[index].url)}">
                <div class="lightbox-info">
                    <span class="lightbox-counter">${index + 1} / ${photos.length}</span>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(lightbox);
    window.adminLightboxPhotos = photos;
    window.adminLightboxIndex = index;
    window.adminLightboxKeyHandler = (e) => {
        if (e.key === 'ArrowLeft') navigateAdminLightbox(-1);
        if (e.key === 'ArrowRight') navigateAdminLightbox(1);
        if (e.key === 'Escape') closeAdminLightbox();
    };
    document.addEventListener('keydown', window.adminLightboxKeyHandler);
};

window.navigateAdminLightbox = (direction) => {
    window.adminLightboxIndex += direction;
    const photos = window.adminLightboxPhotos;
    if (window.adminLightboxIndex < 0) window.adminLightboxIndex = photos.length - 1;
    if (window.adminLightboxIndex >= photos.length) window.adminLightboxIndex = 0;
    const img = document.getElementById('admin-lightbox-image');
    const counter = document.querySelector('#admin-lightbox .lightbox-counter');
    img.style.opacity = '0';
    setTimeout(() => {
        img.src = getImageUrl(photos[window.adminLightboxIndex].url);
        counter.textContent = `${window.adminLightboxIndex + 1} / ${photos.length}`;
        img.style.opacity = '1';
    }, 200);
};

window.closeAdminLightbox = () => {
    const lightbox = document.getElementById('admin-lightbox');
    if (lightbox) {
        lightbox.style.opacity = '0';
        setTimeout(() => lightbox.remove(), 300);
    }
    document.removeEventListener('keydown', window.adminLightboxKeyHandler);
};

// --- TAB: BOOKINGS ---

function renderBookings() {
    // This is now just a placeholder render since the HTML is static or simplified
    console.log('[Cal.com] Admin Booking View Active');
}

// Removing legacy calendar/availability functions as Cal.com is now Source of Truth
// --- LEGACY BOOKING REMOVALS ---
window.renderCalendar = () => { };
window.updateBookingStatus = () => { };
window.bulkBlock = () => { };
window.toggleDate = () => { };
window.cancelBooking = () => { };
window.deleteBooking = () => { };
window.editBooking = () => { };
window.addEventType = () => { };
window.removeEventType = () => { };
window.editEventType = () => { };
function renderEventTypes() { }

// Global Legacy Removals for Event Types
window.addEventType = () => { alert('Add new event types in your Cal.com Dashboard'); };
window.removeEventType = () => { alert('Event types must be removed in Cal.com'); };
window.editEventType = () => { alert('Event types must be edited in Cal.com'); };

// --- TAB: CMS ---

function renderCMS() {
    renderHeroSettings();
    renderGraphicsSettings();

    const gallery = document.getElementById('cms-gallery');
    if (!gallery) return;

    // Sort by ID (Timestamp) Descending - Newest First
    const sortedCMS = [...state.cms.items].sort((a, b) => b.id - a.id);

    gallery.innerHTML = sortedCMS.map(item => {
        const isVideo = (item.url && (item.url.startsWith('data:video/') || item.url.endsWith('.mp4')));
        const isYouTube = (item.url && (item.url.includes('youtube.com') || item.url.includes('youtu.be')));

        let mediaHtml = '';
        if (isYouTube) {
            const videoId = item.url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)?.[1];
            mediaHtml = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; position:relative;">
                <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" style="width:100%; height:100%; object-fit:cover; opacity:0.6;">
                <div style="position:absolute; color:white; font-size:24px;">🎬</div>
            </div>`;
        } else if (isVideo) {
            mediaHtml = `<video src="${getImageUrl(item.url)}" style="width:100%; height:100%; object-fit: cover;" muted></video><div style="position:absolute; bottom:5px; right:5px; color:white; font-size:10px;">🎞️</div>`;
        } else {
            mediaHtml = `<img src="${getImageUrl(item.url)}" style="width:100%; height:100%; object-fit: cover;">`;
        }

        const date = new Date(parseInt(item.id)).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric'
        });

        return `
        <div class="card" style="padding: 0; margin-bottom:0; overflow: hidden; border-radius: 18px; background: var(--white); border: 1px solid var(--border-color); display: flex; flex-direction: column; transition: transform 0.2s;">
            <div onclick="window.previewCMS('${item.id}')" style="position: relative; width: 100%; aspect-ratio: 1; overflow: hidden; background: #000; cursor: pointer;">
                ${mediaHtml}
                <div style="position: absolute; top: 10px; right: 10px;">
                    <button onclick="event.stopPropagation(); window.deleteCMS('${item.id}')" title="Remove" style="background: rgba(0,0,0,0.6); border: none; color: white; width: 26px; height: 26px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 11px; backdrop-filter: blur(10px);">✕</button>
                </div>
            </div>
            <div style="padding: 12px 15px; background: #fff;">
                <span style="font-weight: 700; font-size: 13px; color: var(--text-primary); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;">${item.title}</span>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 9px; color: var(--accent); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">${isYouTube ? 'YOUTUBE' : (isVideo ? 'VIDEO' : 'IMAGE')}</span>
                    <span style="font-size: 9px; color: #bbb;">${date}</span>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function renderGraphicsSettings() {
    const graphics = state.cms.graphics || {};
    const artistImg = document.querySelector('#graphic-artist-preview img');
    const whoImg = document.querySelector('#graphic-whoWeAre-preview img');
    const readyImg = document.querySelector('#graphic-readyToBegin-preview img');

    if (artistImg && graphics.artist) {
        artistImg.src = getImageUrl(graphics.artist);
        artistImg.style.opacity = "1";
    }
    if (whoImg && graphics.whoWeAre) {
        whoImg.src = getImageUrl(graphics.whoWeAre);
        whoImg.style.opacity = "1";
    }
    if (readyImg && graphics.readyToBegin) {
        readyImg.src = getImageUrl(graphics.readyToBegin);
        readyImg.style.opacity = "1";
    }

    console.log('[Admin] Graphics settings rendered.');
}

window.uploadGraphic = async (key, e) => {
    const file = e.target.files[0];
    if (!file) return;

    showToast(`Uploading ${key} image...`, 'info');
    try {
        const base64 = await fileToBase64(file);

        // 1. Sync to local backend if available (don't block if failed)
        try {
            await fetch(`${API_URL}/cms/graphics`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, url: base64 })
            });
        } catch (localErr) {
            console.warn('[Local Sync] Local backend unreachable, skipping local sync.');
        }

        // 2. Sync to Google Sheets
        console.log(`[Admin] Uploading graphic '${key}' to Sheet...`);
        const res = await fetch(CMS_SHEET_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'saveGraphic',
                key: key,
                url: base64
            })
        });
        const result = await res.json();
        console.log('[Admin] Sheet upload result:', result);

        if (result.success && result.url) {
            // Update local state with the returned URL (Drive Link)
            if (!state.cms.graphics) state.cms.graphics = {};
            state.cms.graphics[key] = result.url;
            showToast(`✓ ${key.toUpperCase()} updated!`, 'success');
        } else {
            // Fallback to base64 if cloud failed but didn't throw
            console.warn('[Admin] Cloud sync weirdness, using local base64');
            if (!state.cms.graphics) state.cms.graphics = {};
            state.cms.graphics[key] = base64;
            showToast(`Saved locally (Cloud: ${result.error || 'Unknown'})`, 'warning');
        }

        renderGraphicsSettings();

    } catch (err) {
        console.error('Graphic Upload Error:', err);
        showToast('Upload failed: ' + err.message, 'error');
        // Still try to show the image if we have base64
        if (state.cms.graphics && !state.cms.graphics[key]) {
            state.cms.graphics[key] = await fileToBase64(file);
            renderGraphicsSettings();
        }
    } finally {
        e.target.value = '';
    }
};



window.saveHeroConfig = async () => {
    const input = document.getElementById('hero-interval-input');
    if (!input) return;

    const val = parseInt(input.value);
    if (!val || val < 1) return alert('Invalid interval');

    // Show loading state on button
    const btn = document.querySelector('.cta-btn[onclick="saveHeroConfig()"]');
    const originalText = btn ? btn.innerText : 'SAVE CONFIG';
    if (btn) btn.innerText = 'SAVING...';

    try {
        await fetch(CMS_SHEET_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'saveHeroConfig',
                interval: val
            })
        });

        // Update local state and toast
        if (!state.cms.hero) state.cms.hero = {};
        state.cms.hero.interval = val;
        showToast('Interval saved to Cloud!', 'success');
    } catch (err) {
        console.error('Failed to save config:', err);
        showToast('Failed to save config', 'error');
    } finally {
        if (btn) btn.innerText = originalText;
    }
};

function renderHeroSettings() {
    const container = document.getElementById('hero-slides-container');
    const intervalInput = document.getElementById('hero-interval-input');
    if (!container || !intervalInput) return;

    // Only update if not typing
    if (document.activeElement !== intervalInput) {
        intervalInput.value = state.cms.hero.interval || 5;
    }

    if (state.cms.hero.slides.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: #999; border: 2px dashed #eee; border-radius: 12px; font-size: 12px;">No custom hero media set. Using default background.</div>`;
        return;
    }

    container.innerHTML = state.cms.hero.slides.map(slide => {
        const isVideo = slide.type === 'video';
        const mediaTag = isVideo ? `<video src="${getImageUrl(slide.url)}" muted style="width:100%; height:100%; object-fit:cover;"></video>` : `<img src="${getImageUrl(slide.url)}" style="width:100%; height:100%; object-fit:cover;">`;
        return `
            <div style="position: relative; aspect-ratio: 16/9; border-radius: 10px; overflow: hidden; background: #000; border: 1px solid #eee;">
                ${mediaTag}
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 15px 10px 5px; pointer-events: none;">
                    <span style="color: white; font-size: 10px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">${slide.title || 'Untitled Banner'}</span>
                </div>
                <button onclick="deleteHeroSlide('${slide.id}')" style="position: absolute; top: 5px; right: 5px; width: 22px; height: 22px; border-radius: 50%; border: none; background: rgba(0,0,0,0.7); color: white; cursor: pointer; font-size: 10px; z-index: 2;">✕</button>
            </div>
        `;
    }).join('');
}


window.previewHeroUpload = async (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    let successCount = 0;
    try {
        for (let i = 0; i < files.length; i++) {
            showToast(`Uploading ${i + 1}/${files.length}...`, 'info');
            const file = files[i];
            const type = file.type.startsWith('video') ? 'video' : 'image';
            const base64 = await fileToBase64(file);
            const name = file.name.split('.').slice(0, -1).join('.'); // Remove extension
            const res = await fetch(CMS_SHEET_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'addMedia',
                    section: 'HeroSlide',
                    type: type,
                    title: name,
                    url: base64
                })
            });

            // Wait for JSON response to verify save actually happened
            const result = await res.json();
            if (!result || !result.success) {
                throw new Error(result?.error || 'Spreadsheet rejected the upload');
            }
            successCount++;
        }
        showToast(`✓ ${successCount} media added to hero!`, 'success');
        showToast('Refreshing gallery...', 'info');
        await new Promise(resolve => setTimeout(resolve, 1500));

    } catch (err) {
        console.error('Upload Error:', err);
        showToast('Upload failed: ' + err.message, 'error');
    } finally {
        e.target.value = '';
        await refreshData();
        renderAll();
    }
};


window.deleteHeroSlide = async (id) => {
    if (!confirm('Remove this slide from the hero section?')) return;
    try {
        const res = await fetch(CMS_SHEET_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'deleteMedia', id: id })
        });
        if (!res.ok) throw new Error('Delete request failed');
        showToast('Hero slide removed', 'success');
        await refreshData();
        renderAll();
    } catch (e) {
        showToast('Failed to remove slide', 'error');
    }
};

async function addCMS() {
    const url = document.getElementById('cms-url').value;
    const title = document.getElementById('cms-title').value;
    if (!url || !title) return;

    const btn = document.getElementById('cms-add');
    btn.disabled = true;
    btn.innerText = 'ADDING...';

    await fetch(CMS_SHEET_URL, {
        method: 'POST',
        body: JSON.stringify({
            action: 'addMedia',
            section: 'Gallery',
            type: 'image',
            title: title,
            url: url
        })
    });
    document.getElementById('cms-url').value = '';
    document.getElementById('cms-title').value = '';
    showToast('Photo added to gallery!', 'success');
    await refreshData();
    renderAll();
    btn.disabled = false;
    btn.innerText = 'ADD PHOTO';
}

window.switchUploadTab = (method) => {
    // Update tab styles
    const tabs = ['url', 'file', 'youtube'];
    tabs.forEach(t => {
        const el = document.getElementById(`tab-${t}`);
        if (el) {
            el.style.borderBottom = method === t ? '3px solid var(--accent)' : '3px solid transparent';
            el.style.color = method === t ? 'var(--accent)' : '#999';
        }

        const methodDiv = document.getElementById(`upload-${t}`);
        if (methodDiv) {
            methodDiv.style.display = method === t ? (t === 'file' ? 'block' : 'flex') : 'none';
        }
    });
};

window.addYouTubeCMS = async () => {
    const url = document.getElementById('cms-youtube-url').value;
    const title = document.getElementById('cms-youtube-title').value;
    if (!url || !title) return showToast('Please enter both URL and Title', 'error');

    // Basic YouTube URL Validation
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        return showToast('Invalid YouTube URL', 'error');
    }

    const btn = document.getElementById('cms-add-youtube');
    btn.disabled = true;
    btn.innerText = 'ADDING...';

    try {
        await fetch(CMS_SHEET_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'addMedia',
                section: 'Gallery',
                type: 'image', // YouTube is treated as an image link for preview purposes usually, or handled by type in logic
                title: title,
                url: url
            })
        });
        document.getElementById('cms-youtube-url').value = '';
        document.getElementById('cms-youtube-title').value = '';
        showToast('YouTube Video added to gallery!');
        await refreshData();
        renderAll();
    } catch (e) {
        showToast('Failed to add video', 'error');
    } finally {
        btn.disabled = false;
        btn.innerText = 'ADD VIDEO';
    }
};

// File Upload Functionality
let selectedFiles = [];

function initFileUpload() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-files-btn');

    if (!dropZone || !fileInput) return;

    // Click to browse
    dropZone.onclick = () => fileInput.click();

    // File selection
    fileInput.onchange = (e) => handleFiles(e.target.files);

    // Drag and drop
    dropZone.ondragover = (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--accent)';
        dropZone.style.background = 'rgba(184, 156, 125, 0.1)';
    };

    dropZone.ondragleave = () => {
        dropZone.style.borderColor = 'var(--border-color)';
        dropZone.style.background = 'var(--card-bg)';
    };

    dropZone.ondrop = (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border-color)';
        dropZone.style.background = 'var(--card-bg)';
        handleFiles(e.dataTransfer.files);
    };

    // Upload button
    if (uploadBtn) {
        uploadBtn.onclick = uploadSelectedFiles;
    }
}

function handleFiles(files) {
    selectedFiles = Array.from(files).filter(file => {
        // Validate file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            showToast(`${file.name} is not an image or video`, 'error');
            return false;
        }
        // Validate file size (50MB)
        if (file.size > 50 * 1024 * 1024) {
            showToast(`${file.name} exceeds 50MB`, 'error');
            return false;
        }
        return true;
    });

    if (selectedFiles.length === 0) return;

    // Show preview
    const previewContainer = document.getElementById('preview-container');
    const previewGrid = document.getElementById('preview-grid');

    previewContainer.style.display = 'block';
    previewGrid.innerHTML = '';

    selectedFiles.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.createElement('div');
            preview.style.cssText = 'position: relative; border-radius: 15px; overflow: hidden; border: 2px solid var(--border-color);';

            const isVideo = file.type.startsWith('video/');
            const mediaHtml = isVideo
                ? `<video src="${e.target.result}" style="width: 100%; height: 120px; object-fit: cover;" muted playsinline></video><div style="position:absolute; top:4px; left:4px; padding:2px 6px; background:black; color:white; font-size:8px; border-radius:4px;">VIDEO</div>`
                : `<img src="${e.target.result}" style="width: 100%; height: 120px; object-fit: cover;">`;

            preview.innerHTML = `
                ${mediaHtml}
                <div style="padding: 8px; background: var(--card-bg);">
                    <input type="text" id="file-title-${idx}" placeholder="Title" style="width: 100%; border: 1px solid var(--border-color); padding: 5px; border-radius: 8px; font-size: 10px;">
                </div>
                <button onclick="removeFilePreview(${idx})" style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 12px;">✕</button>
            `;
            previewGrid.appendChild(preview);
        };
        reader.readAsDataURL(file);
    });
}

window.removeFilePreview = (idx) => {
    selectedFiles.splice(idx, 1);
    if (selectedFiles.length === 0) {
        document.getElementById('preview-container').style.display = 'none';
    } else {
        handleFiles(selectedFiles);
    }
};

async function uploadSelectedFiles() {
    if (selectedFiles.length === 0) return;

    const btn = document.getElementById('upload-files-btn');
    btn.disabled = true;
    btn.innerText = 'UPLOADING...';

    try {
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const titleInput = document.getElementById(`file-title-${i}`);
            const title = titleInput ? titleInput.value.trim() : file.name.replace(/\.[^/.]+$/, '');

            // Convert to base64
            const base64 = await fileToBase64(file);

            // Upload to Google Sheet Apps Script
            const type = file.type.startsWith('video') ? 'video' : 'image';
            const res = await fetch(CMS_SHEET_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'addMedia',
                    section: 'Gallery',
                    type: type,
                    title: title || `Photo ${Date.now()}`,
                    url: base64
                })
            });
            const result = await res.json();
            if (!result.success) throw new Error(result.error || 'Upload failed');
        }

        showToast(`✓ ${selectedFiles.length} photo${selectedFiles.length > 1 ? 's' : ''} uploaded!`, 'success');
        selectedFiles = [];
        document.getElementById('preview-container').style.display = 'none';
        document.getElementById('file-input').value = '';
        await refreshData();
        renderAll();
    } catch (e) {
        console.error('Upload Error:', e);
        showToast('Upload failed', 'error');
    } finally {
        btn.disabled = false;
        btn.innerText = 'UPLOAD SELECTED';
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

window.deleteCMS = async (id) => {
    if (!confirm('Remove this photo from gallery?')) return;
    try {
        await fetch(CMS_SHEET_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'deleteMedia', id: id })
        });
        showToast('Item removed from gallery', 'success');
    } catch (e) {
        showToast('Failed to remove item', 'error');
    }
    await refreshData();
    renderAll();
}

window.previewCMS = (id) => {
    const item = state.cms.items.find(i => String(i.id) === String(id));
    if (!item) return;

    const lightbox = document.getElementById('admin-lightbox');
    const img = document.getElementById('admin-lightbox-image');
    const video = document.getElementById('admin-lightbox-video');
    const youtube = document.getElementById('admin-lightbox-youtube');
    const title = document.getElementById('admin-lightbox-title');

    // Reset
    img.style.display = 'none';
    video.style.display = 'none';
    youtube.style.display = 'none';
    youtube.innerHTML = '';
    title.innerText = item.title || 'Untitled Work';

    const isVideo = (item.url && (item.url.startsWith('data:video/') || item.url.endsWith('.mp4')));
    const isYouTube = (item.url && (item.url.includes('youtube.com') || item.url.includes('youtu.be')));

    if (isYouTube) {
        const videoId = item.url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)?.[1];
        youtube.style.display = 'block';
        youtube.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" style="width:100%; height:100%; border:none; border-radius:15px;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    } else if (isVideo) {
        video.style.display = 'block';
        video.src = item.googleUrl || getImageUrl(item.url);
        video.play();
    } else {
        img.style.display = 'block';
        img.src = item.googleUrl || getImageUrl(item.url);
    }

    lightbox.style.display = 'flex';
};

// --- TAB: MESSAGES ---

function renderMessages() {
    const container = document.getElementById('messages-container');
    if (!container) return;

    if (state.messages.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px; color: #ccc;">
                <p style="font-size: 48px; margin-bottom: 20px;">✉️</p>
                <h3>Your inbox is empty</h3>
                <p>New enquiries will appear here in a table format.</p>
            </div>
        `;
        return;
    }

    // Filter and Sort messages
    let filteredMessages = [...state.messages];

    // Filter by search
    if (state.messageSearch) {
        filteredMessages = filteredMessages.filter(m =>
            (m.sender && m.sender.toLowerCase().includes(state.messageSearch)) ||
            (m.mobile && m.mobile.toLowerCase().includes(state.messageSearch))
        );
    }

    // Filter by status
    if (state.messageFilter !== 'all') {
        filteredMessages = filteredMessages.filter(m => m.status === state.messageFilter);
    }

    const sortedMessages = filteredMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (sortedMessages.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 40px; color: #999;">No messages match your search.</div>`;
        return;
    }

    container.innerHTML = `
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
                    ${sortedMessages.map(m => {
        const statusConfig = {
            'received': { color: '#FF4136', bg: 'rgba(255, 65, 54, 0.05)', label: 'RECEIVED' },
            'in progress': { color: '#FF851B', bg: 'rgba(255, 133, 27, 0.05)', label: 'PROGRESS' },
            'cleared': { color: '#2ECC40', bg: 'rgba(46, 204, 64, 0.05)', label: 'CLEARED' }
        };
        const config = statusConfig[m.status || 'received'] || { color: '#999', bg: 'transparent', label: 'UNKNOWN' };
        const color = config.color;
        const initials = m.sender ? m.sender.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';

        return `
                            <tr id="msg-row-${m.id}" class="admin-table-row" style="transition: all 0.3s; background: ${config.bg};">
                                <td style="padding: 15px 30px; border-bottom: 1px solid #f0f0f0; border-right: 1px solid #f8f8f8;">
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <div style="width: 38px; height: 38px; flex-shrink: 0; border-radius: 12px; background: #faf9f8; color: var(--accent); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; border: 1px solid #f0f0f0; position: relative;">
                                            ${initials}
                                            ${!m.read ? `<div style="position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; background: #E74C3C; border: 2px solid #fff; border-radius: 50%;"></div>` : ''}
                                        </div>
                                        <div style="overflow: hidden;">
                                            <span style="display: block; font-weight: 800; font-size: 13px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${m.sender}</span>
                                            <span style="display: block; font-size: 9px; color: #bbb; font-weight: 700; text-transform: uppercase;">${new Date(m.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                                        </div>
                                    </div>
                                </td>
                                <td style="padding: 20px 15px; border-bottom: 1px solid #f0f0f0; border-right: 1px solid #f8f8f8;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="font-size: 12px; font-weight: 700; color: var(--text-secondary); white-space: nowrap;">${m.mobile}</span>
                                        <button onclick="window.copyToClipboard('${m.mobile}', 'Phone')" 
                                                style="border: none; background: #f8f8f8; width: 24px; height: 24px; flex-shrink: 0; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 10px; transition: all 0.2s;"
                                                onmouseover="this.style.background='#eee'" onmouseout="this.style.background='#f8f8f8'">📋</button>
                                    </div>
                                </td>
                                <td style="padding: 20px 15px; border-bottom: 1px solid #f0f0f0; border-right: 1px solid #f8f8f8;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="font-size: 11px; font-weight: 700; color: var(--accent); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 120px;">${m.email || '<span style="color:#eee">N/A</span>'}</span>
                                        ${m.email ? `
                                            <button onclick="window.copyToClipboard('${m.email}', 'Email')" 
                                                    style="border: none; background: #f8f8f8; width: 24px; height: 24px; flex-shrink: 0; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 10px; transition: all 0.2s;"
                                                    onmouseover="this.style.background='#eee'" onmouseout="this.style.background='#f8f8f8'">📋</button>
                                        ` : ''}
                                    </div>
                                </td>
                                <td style="padding: 20px 15px; border-bottom: 1px solid #f0f0f0; border-right: 1px solid #f8f8f8; cursor: pointer;" onclick="window.toggleMessage('${m.id}')">
                                    <div style="max-width: 180px; font-size: 12px; color: #777; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-style: italic;">
                                        "${m.text}"
                                    </div>
                                    <span style="font-size: 9px; color: var(--accent); font-weight: 800; text-transform: uppercase;">DETAILS</span>
                                </td>
                                <td style="padding: 20px 15px; border-bottom: 1px solid #f0f0f0; border-right: 1px solid #f8f8f8;">
                                    <div style="position: relative; width: 120px;">
                                        <select onchange="window.updateMessageStatus('${m.id}', this.value)" 
                                                style="border: none; background: ${color}; color: white; font-size: 9px; font-weight: 800; cursor: pointer; text-transform: uppercase; outline: none; padding: 10px 15px; border-radius: 10px; width: 100%; appearance: none; text-align: center; box-shadow: 0 4px 15px ${color}33;">
                                            <option value="received" ${m.status === 'received' ? 'selected' : ''} style="background: white; color: black;">RECEIVED</option>
                                            <option value="in progress" ${m.status === 'in progress' ? 'selected' : ''} style="background: white; color: black;">PROGRESS</option>
                                            <option value="cleared" ${m.status === 'cleared' ? 'selected' : ''} style="background: white; color: black;">CLEARED</option>
                                        </select>
                                    </div>
                                </td>
                                <td style="padding: 20px 30px; border-bottom: 1px solid #f0f0f0; text-align: right;">
                                    <button onclick="window.toggleMessage('${m.id}')" class="cta-btn" style="padding: 10px 18px; font-size: 9px; border-radius: 10px; white-space: nowrap;">VIEW</button>
                                </td>
                            </tr>
                            <tr id="msg-detail-${m.id}" style="display: none; background: #faf9f8;">
                                <td colspan="6" style="padding: 0; border-bottom: 1px solid #eee;">
                                    <div style="padding: 40px 60px; animation: slideDown 0.4s ease-out;">
                                        <div style="background: white; border-radius: 30px; border: 1px solid var(--border-color); padding: 35px; box-shadow: 0 30px 60px rgba(0,0,0,0.06); display: grid; grid-template-columns: 1.5fr 1fr; gap: 30px;">
                                            <div>
                                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                                    <h4 style="margin:0; font-family: 'Metropolis', sans-serif; font-size: 16px; color: var(--text-primary);">Enquiry Content</h4>
                                                    <span style="font-size: 10px; font-weight: 700; color: #999; text-transform: uppercase;">ID: #${String(m.id).slice(-6)}</span>
                                                </div>
                                                <div style="background: #fdfdfd; padding: 20px; border-radius: 15px; font-size: 14px; color: #444; line-height: 1.7; border: 1px solid #f0f0f0; margin-bottom: 25px;">
                                                    "${m.text}"
                                                </div>
                                                
                                                <div style="display: flex; gap: 10px;">
                                                    <input type="text" id="reply-input-${m.id}" class="login-input" style="flex:1; margin-bottom:0; border-radius: 12px; padding: 15px; font-size: 13px;" placeholder="Message to client...">
                                                    <button onclick="window.sendMessageReply('${m.id}')" class="cta-btn" style="padding: 0 25px; border-radius: 12px; font-size: 10px;">SEND REPLY</button>
                                                </div>
                                            </div>

                                            <div style="border-left: 1px solid #eee; padding-left: 30px;">
                                                <h4 style="margin-bottom: 15px; font-family: 'Metropolis', sans-serif; font-size: 15px;">Interaction Logs</h4>
                                                <div id="replies-${m.id}" style="max-height: 250px; overflow-y: auto; padding-right: 10px;">
                                                    ${m.replies.length > 0 ? m.replies.map(r => `
                                                        <div style="margin-bottom: 12px; padding: 12px; background: rgba(184, 156, 125, 0.05); border-radius: 12px; border: 1px solid rgba(184, 156, 125, 0.08);">
                                                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                                                <span style="font-weight: 800; font-size: 8px; color: var(--accent); letter-spacing: 1px;">STUDIO REPLY</span>
                                                                <span style="font-size: 8px; color: #bbb;">${new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                            <p style="font-size: 11px; margin: 0; color: #555; line-height: 1.4;">${r.text}</p>
                                                        </div>
                                                    `).join('') : `
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
                        `;
    }).join('')}
                </tbody>
            </table>
        </div>

    `;
}

window.toggleMessage = (id) => {
    const detailRow = document.getElementById(`msg-detail-${id}`);
    const mainRow = document.getElementById(`msg-row-${id}`);
    const isVisible = detailRow.style.display === 'table-row';

    // Close all others
    document.querySelectorAll('[id^="msg-detail-"]').forEach(detail => {
        detail.style.display = 'none';
        const mId = detail.id.replace('msg-detail-', '');
        const mRow = document.getElementById(`msg-row-${mId}`);
        if (mRow) {
            // Find message and re-apply its status background
            const msg = state.messages.find(m => m.id === mId);
            if (msg) {
                const statusConfig = {
                    'received': 'rgba(255, 65, 54, 0.05)',
                    'in progress': 'rgba(255, 133, 27, 0.05)',
                    'cleared': 'rgba(46, 204, 64, 0.1)'
                };
                mRow.style.background = statusConfig[msg.status] || 'white';
            }
        }
    });

    if (!isVisible) {
        detailRow.style.display = 'table-row';
        mainRow.style.background = 'rgba(184, 156, 125, 0.05)';
    }
};

window.updateMessageStatus = async (id, status) => {
    // 1. Optimistic UI Update (Immediate response)
    const row = document.getElementById(`msg-row-${id}`);
    const originalStyle = row ? row.style.background : '';
    const statusConfig = {
        'received': { bg: 'rgba(255, 65, 54, 0.05)' },
        'in progress': { bg: 'rgba(255, 133, 27, 0.05)' },
        'cleared': { bg: 'rgba(46, 204, 64, 0.1)' }
    };

    if (row && statusConfig[status]) {
        row.style.background = statusConfig[status].bg;
    }

    try {
        // 2. Parallel Update: Local Backend & Google Sheets (Fastest possible)
        const response = await fetch(`${API_URL}/messages/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        if (!response.ok) throw new Error('Sync failed');

        showToast(`✓ Sync Complete: ${status.toUpperCase()}`, 'success');

        // 3. Background Refresh (Silent)
        await refreshData();
        renderMessages();
    } catch (e) {
        console.error('Status update error:', e);
        showToast('Update failed!', 'error');
        if (row) row.style.background = originalStyle; // Revert on failure
        renderMessages();
    }
};

window.sendMessageReply = async (id) => {
    const input = document.getElementById(`reply-input-${id}`);
    const text = input.value.trim();
    if (!text) return;

    const btn = document.activeElement;
    btn.disabled = true;
    btn.innerText = 'SENDING...';

    try {
        await fetch(`${API_URL}/messages/${id}/reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        input.value = '';
        showToast('Reply logged and synced', 'success');

        setTimeout(async () => {
            await refreshData();
            renderMessages();
            if (window.toggleMessage) window.toggleMessage(id);
        }, 1500);
    } catch (e) {
        showToast('Reply failed', 'error');
    } finally {
        btn.disabled = false;
        btn.innerText = 'SEND REPLY';
    }
};

window.copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
        showToast(`${label} copied to clipboard`, 'success');
    }).catch(err => {
        showToast('Failed to copy', 'error');
    });
};

// Start
init();
