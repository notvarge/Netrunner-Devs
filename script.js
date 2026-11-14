// UTC Clock
setInterval(() => {
    const now = new Date();
    document.getElementById('utcClock').innerText = now.toUTCString().slice(17, 25) + ' UTC';
}, 1000);

// Initial setup for default admin account
function initAdminUser() {
    let users = JSON.parse(localStorage.getItem('cyber_users_db') || '[]');
    if(!users.find(u => u.username === 'admin')) {
        users.push({
            username: 'admin',
            password: 'Password12345',
            banned: false,
            censoredCount: 0,
            badWordsLog: []
        });
        localStorage.setItem('cyber_users_db', JSON.stringify(users));
    }
}
initAdminUser();

// View Switcher
function switchMainView(view) {
    const hubView = document.getElementById('hubViewContainer');
    const chatView = document.getElementById('chatViewContainer');
    
    const btnHubDesktop = document.getElementById('toggleHubBtn');
    const btnChatDesktop = document.getElementById('toggleChatBtn');
    const btnHubMobile = document.getElementById('mobileToggleHubBtn');
    const btnChatMobile = document.getElementById('mobileToggleChatBtn');

    if(view === 'hub') {
        hubView.classList.remove('hidden');
        chatView.classList.add('hidden');
        
        btnHubDesktop.className = "px-3 py-1 rounded-lg text-xs font-bold bg-cyber-neonCyan text-slate-950 transition-all shadow";
        btnChatDesktop.className = "px-3 py-1 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all";
        if(btnHubMobile) {
            btnHubMobile.className = "flex-1 py-1 rounded-lg text-xs font-bold bg-cyber-neonCyan text-slate-950 transition-all";
            btnChatMobile.className = "flex-1 py-1 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all";
        }
    } else {
        const currentUser = localStorage.getItem('cyber_current_user');
        hubView.classList.add('hidden');
        chatView.classList.remove('hidden');

        btnChatDesktop.className = "px-3 py-1 rounded-lg text-xs font-bold bg-cyber-neonCyan text-slate-950 transition-all shadow";
        btnHubDesktop.className = "px-3 py-1 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all";
        if(btnHubMobile) {
            btnChatMobile.className = "flex-1 py-1 rounded-lg text-xs font-bold bg-cyber-neonCyan text-slate-950 transition-all";
            btnHubMobile.className = "flex-1 py-1 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all";
        }

        if(!currentUser) {
            document.getElementById('chatAuthGuard').classList.remove('hidden');
            document.getElementById('chatInterfaceMain').classList.add('hidden');
        } else {
            document.getElementById('chatAuthGuard').classList.add('hidden');
            document.getElementById('chatInterfaceMain').classList.remove('hidden');
            loadConversations();
        }
    }
}

// Project Filters
function filterProjects(category) {
    document.querySelectorAll('.project-filter-btn').forEach(btn => {
        if(btn.getAttribute('data-filter') === category) {
            btn.className = "project-filter-btn px-4 py-2 rounded-lg text-xs font-mono bg-cyber-neonCyan text-slate-950 font-bold transition-all shadow-lg shadow-cyber-neonCyan/20";
        } else {
            btn.className = "project-filter-btn px-4 py-2 rounded-lg text-xs font-mono bg-slate-900 border border-slate-700 text-slate-300 hover:border-cyber-neonCyan transition-all";
        }
    });

    document.querySelectorAll('.project-card').forEach(card => {
        if(category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Notifications
function showNotification(msg) {
    const container = document.getElementById('toastContainer');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = 'bg-slate-900 border border-cyber-neonCyan text-cyber-neonCyan px-4 py-3 rounded-xl shadow-lg shadow-cyber-neonCyan/20 text-xs font-mono flex items-center space-x-3 animate-fade-in pointer-events-auto';
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-base"></i><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Access Guard
function checkAccess() {
    const currentUser = localStorage.getItem('cyber_current_user');
    if(!currentUser) {
        showNotification('Access Denied: Please log in to unlock this module.');
        openAuthModal('login');
    } else {
        showNotification('Module access granted.');
    }
}

// Speed Checker logic
let speedTestInterval = null;
let speedTestSamples = { pings: [], dls: [], uls: [] };

function openPingModal() {
    document.getElementById('pingModal').classList.remove('hidden');
    document.getElementById('pingModal').classList.add('flex');
    resetSpeedTestUI();
}

function closePingModal() {
    document.getElementById('pingModal').classList.add('hidden');
    document.getElementById('pingModal').classList.remove('flex');
    if(speedTestInterval) clearInterval(speedTestInterval);
}

function resetSpeedTestUI() {
    if(speedTestInterval) clearInterval(speedTestInterval);
    speedTestSamples = { pings: [], dls: [], uls: [] };
    document.getElementById('pingVal').innerText = '-- ms';
    document.getElementById('dlVal').innerText = '-- Mbps';
    document.getElementById('ulVal').innerText = '-- Mbps';
    document.getElementById('testStatus').innerText = 'READY';
    document.getElementById('timerLabel').innerText = 'TEST PROGRESS (0s / 5s)';
    document.getElementById('progressPct').innerText = '0%';
    document.getElementById('testProgressBar').style.width = '0%';
    document.getElementById('runBtn').disabled = false;
    document.getElementById('showResultsBtn').classList.add('hidden');
}

function startSpeedTest() {
    resetSpeedTestUI();
    document.getElementById('runBtn').disabled = true;
    document.getElementById('testStatus').innerText = 'RUNNING...';

    let elapsed = 0;
    speedTestInterval = setInterval(() => {
        elapsed += 0.5;
        const pct = Math.min(100, Math.floor((elapsed / 5) * 100));
        document.getElementById('timerLabel').innerText = `TEST PROGRESS (${elapsed.toFixed(1)}s / 5.0s)`;
        document.getElementById('progressPct').innerText = pct + '%';
        document.getElementById('testProgressBar').style.width = pct + '%';

        const p = Math.floor(Math.random() * 12) + 8;
        const d = Math.floor(Math.random() * 150) + 350;
        const u = Math.floor(Math.random() * 60) + 120;

        speedTestSamples.pings.push(p);
        speedTestSamples.dls.push(d);
        speedTestSamples.uls.push(u);

        document.getElementById('pingVal').innerText = p + ' ms';
        document.getElementById('dlVal').innerText = d + ' Mbps';
        document.getElementById('ulVal').innerText = u + ' Mbps';

        if(elapsed >= 5) {
            clearInterval(speedTestInterval);
            document.getElementById('testStatus').innerText = 'COMPLETE';
            document.getElementById('runBtn').disabled = false;
            document.getElementById('showResultsBtn').classList.remove('hidden');
            showNotification('Speed diagnostic completed successfully.');
        }
    }, 500);
}

function openReportPopup() {
    const pings = speedTestSamples.pings;
    const dls = speedTestSamples.dls;
    const uls = speedTestSamples.uls;

    if(pings.length === 0) return;

    const minPing = Math.min(...pings);
    const maxPing = Math.max(...pings);
    const avgPing = (pings.reduce((a, b) => a + b, 0) / pings.length).toFixed(1);

    const minDl = Math.min(...dls);
    const maxDl = Math.max(...dls);
    const avgDl = (dls.reduce((a, b) => a + b, 0) / dls.length).toFixed(1);

    const minUl = Math.min(...uls);
    const maxUl = Math.max(...uls);
    const avgUl = (uls.reduce((a, b) => a + b, 0) / uls.length).toFixed(1);

    document.getElementById('rptPingAvg').innerText = `Avg: ${avgPing} ms`;
    document.getElementById('rptPingLow').innerText = `${minPing} ms`;
    document.getElementById('rptPingHigh').innerText = `${maxPing} ms`;

    document.getElementById('rptDlAvg').innerText = `Avg: ${avgDl} Mbps`;
    document.getElementById('rptDlLow').innerText = `${minDl} Mbps`;
    document.getElementById('rptDlHigh').innerText = `${maxDl} Mbps`;

    document.getElementById('rptUlAvg').innerText = `Avg: ${avgUl} Mbps`;
    document.getElementById('rptUlLow').innerText = `${minUl} Mbps`;
    document.getElementById('rptUlHigh').innerText = `${maxUl} Mbps`;

    let rec = '';
    if (avgPing < 15 && avgDl > 400) {
        rec = "⚡ OPTIMAL CONNECTION: Your network connection is ultra-fast with pristine latency. Ideal for high-frequency neural link transfers, real-time matrix streaming, and competitive low-latency netrunning.";
    } else if (avgPing < 30) {
        rec = "✅ STABLE CONNECTION: Latency and bandwidth are well within recommended cybernetic bounds. No immediate action needed. For optimal speed during peak hours, consider switching your proxy node to Tokyo or Berlin.";
    } else {
        rec = "⚠️ HIGH LATENCY DETECTED: Ping fluctuations observed. We recommend rerouting through the Global Server Switcher module to connect to a closer cyber proxy node or resetting your network interface card.";
    }

    document.getElementById('rptRecommendation').innerText = rec;

    document.getElementById('pingReportModal').classList.remove('hidden');
    document.getElementById('pingReportModal').classList.add('flex');
}

function closeReportPopup() {
    document.getElementById('pingReportModal').classList.add('hidden');
    document.getElementById('pingReportModal').classList.remove('flex');
}

// ==========================================
// 50 GLOBAL SERVERS & REAL-TIME PING LOOP
// ==========================================
const serverNodes = [
    // ASIA (12)
    { id: 'tokyo-1', region: 'Asia', country: 'Japan', city: 'Tokyo', flag: '🇯🇵', ping: 4, load: '24%', status: 'OPTIMAL' },
    { id: 'osaka-1', region: 'Asia', country: 'Japan', city: 'Osaka', flag: '🇯🇵', ping: 7, load: '31%', status: 'OPTIMAL' },
    { id: 'seoul-1', region: 'Asia', country: 'South Korea', city: 'Seoul', flag: '🇰🇷', ping: 9, load: '18%', status: 'OPTIMAL' },
    { id: 'singapore-1', region: 'Asia', country: 'Singapore', city: 'Singapore', flag: '🇸🇬', ping: 12, load: '45%', status: 'STABLE' },
    { id: 'hongkong-1', region: 'Asia', country: 'Hong Kong', city: 'Hong Kong', flag: '🇭🇰', ping: 15, load: '52%', status: 'STABLE' },
    { id: 'taipei-1', region: 'Asia', country: 'Taiwan', city: 'Taipei', flag: '🇹🇼', ping: 14, load: '29%', status: 'OPTIMAL' },
    { id: 'mumbai-1', region: 'Asia', country: 'India', city: 'Mumbai', flag: '🇮🇳', ping: 38, load: '64%', status: 'STABLE' },
    { id: 'bangalore-1', region: 'Asia', country: 'India', city: 'Bangalore', flag: '🇮🇳', ping: 41, load: '38%', status: 'OPTIMAL' },
    { id: 'bangkok-1', region: 'Asia', country: 'Thailand', city: 'Bangkok', flag: '🇹🇭', ping: 25, load: '40%', status: 'STABLE' },
    { id: 'kualalumpur-1', region: 'Asia', country: 'Malaysia', city: 'Kuala Lumpur', flag: '🇲🇾', ping: 19, load: '33%', status: 'OPTIMAL' },
    { id: 'jakarta-1', region: 'Asia', country: 'Indonesia', city: 'Jakarta', flag: '🇮🇩', ping: 28, load: '48%', status: 'STABLE' },
    { id: 'manila-1', region: 'Asia', country: 'Philippines', city: 'Manila', flag: '🇵🇭', ping: 31, load: '55%', status: 'STABLE' },

    // NORTH AMERICA (12)
    { id: 'nyc-1', region: 'North America', country: 'United States', city: 'New York', flag: '🇺🇸', ping: 32, load: '59%', status: 'STABLE' },
    { id: 'la-1', region: 'North America', country: 'United States', city: 'Los Angeles', flag: '🇺🇸', ping: 16, load: '62%', status: 'STABLE' },
    { id: 'chicago-1', region: 'North America', country: 'United States', city: 'Chicago', flag: '🇺🇸', ping: 28, load: '41%', status: 'OPTIMAL' },
    { id: 'dallas-1', region: 'North America', country: 'United States', city: 'Dallas', flag: '🇺🇸', ping: 24, load: '37%', status: 'OPTIMAL' },
    { id: 'seattle-1', region: 'North America', country: 'United States', city: 'Seattle', flag: '🇺🇸', ping: 12, load: '28%', status: 'OPTIMAL' },
    { id: 'miami-1', region: 'North America', country: 'United States', city: 'Miami', flag: '🇺🇸', ping: 35, load: '44%', status: 'STABLE' },
    { id: 'ashburn-1', region: 'North America', country: 'United States', city: 'Ashburn', flag: '🇺🇸', ping: 30, load: '71%', status: 'STABLE' },
    { id: 'toronto-1', region: 'North America', country: 'Canada', city: 'Toronto', flag: '🇨🇦', ping: 34, load: '30%', status: 'OPTIMAL' },
    { id: 'vancouver-1', region: 'North America', country: 'Canada', city: 'Vancouver', flag: '🇨🇦', ping: 15, load: '22%', status: 'OPTIMAL' },
    { id: 'montreal-1', region: 'North America', country: 'Canada', city: 'Montreal', flag: '🇨🇦', ping: 36, load: '26%', status: 'OPTIMAL' },
    { id: 'mexicocity-1', region: 'North America', country: 'Mexico', city: 'Mexico City', flag: '🇲🇽', ping: 48, load: '58%', status: 'STABLE' },
    { id: 'queretaro-1', region: 'North America', country: 'Mexico', city: 'Queretaro', flag: '🇲🇽', ping: 51, load: '34%', status: 'STABLE' },

    // EUROPE (14)
    { id: 'berlin-1', region: 'Europe', country: 'Germany', city: 'Berlin', flag: '🇩🇪', ping: 18, load: '41%', status: 'STABLE' },
    { id: 'frankfurt-1', region: 'Europe', country: 'Germany', city: 'Frankfurt', flag: '🇩🇪', ping: 16, load: '65%', status: 'STABLE' },
    { id: 'london-1', region: 'Europe', country: 'United Kingdom', city: 'London', flag: '🇬🇧', ping: 22, load: '35%', status: 'OPTIMAL' },
    { id: 'paris-1', region: 'Europe', country: 'France', city: 'Paris', flag: '🇫🇷', ping: 20, load: '49%', status: 'STABLE' },
    { id: 'amsterdam-1', region: 'Europe', country: 'Netherlands', city: 'Amsterdam', flag: '🇳🇱', ping: 15, load: '50%', status: 'OPTIMAL' },
    { id: 'zurich-1', region: 'Europe', country: 'Switzerland', city: 'Zurich', flag: '🇨🇭', ping: 21, load: '27%', status: 'OPTIMAL' },
    { id: 'stockholm-1', region: 'Europe', country: 'Sweden', city: 'Stockholm', flag: '🇸🇪', ping: 26, load: '31%', status: 'OPTIMAL' },
    { id: 'madrid-1', region: 'Europe', country: 'Spain', city: 'Madrid', flag: '🇪🇸', ping: 29, load: '42%', status: 'STABLE' },
    { id: 'milan-1', region: 'Europe', country: 'Italy', city: 'Milan', flag: '🇮🇹', ping: 24, load: '38%', status: 'OPTIMAL' },
    { id: 'warsaw-1', region: 'Europe', country: 'Poland', city: 'Warsaw', flag: '🇵🇱', ping: 27, load: '33%', status: 'OPTIMAL' },
    { id: 'vienna-1', region: 'Europe', country: 'Austria', city: 'Vienna', flag: '🇦🇹', ping: 23, load: '29%', status: 'OPTIMAL' },
    { id: 'oslo-1', region: 'Europe', country: 'Norway', city: 'Oslo', flag: '🇳🇴', ping: 28, load: '20%', status: 'OPTIMAL' },
    { id: 'helsinki-1', region: 'Europe', country: 'Finland', city: 'Helsinki', flag: '🇫🇮', ping: 30, load: '25%', status: 'OPTIMAL' },
    { id: 'dublin-1', region: 'Europe', country: 'Ireland', city: 'Dublin', flag: '🇮🇪', ping: 25, load: '43%', status: 'STABLE' },

    // SOUTH AMERICA (6)
    { id: 'saopaulo-1', region: 'South America', country: 'Brazil', city: 'São Paulo', flag: '🇧🇷', ping: 68, load: '55%', status: 'STABLE' },
    { id: 'riodejaneiro-1', region: 'South America', country: 'Brazil', city: 'Rio de Janeiro', flag: '🇧🇷', ping: 72, load: '47%', status: 'STABLE' },
    { id: 'buenosaires-1', region: 'South America', country: 'Argentina', city: 'Buenos Aires', flag: '🇦🇷', ping: 75, load: '39%', status: 'STABLE' },
    { id: 'santiago-1', region: 'South America', country: 'Chile', city: 'Santiago', flag: '🇨🇱', ping: 70, load: '32%', status: 'OPTIMAL' },
    { id: 'bogota-1', region: 'South America', country: 'Colombia', city: 'Bogotá', flag: '🇨🇴', ping: 62, load: '41%', status: 'STABLE' },
    { id: 'lima-1', region: 'South America', country: 'Peru', city: 'Lima', flag: '🇵🇪', ping: 78, load: '29%', status: 'STABLE' },

    // OCEANIA (6)
    { id: 'sydney-1', region: 'Oceania', country: 'Australia', city: 'Sydney', flag: '🇦🇺', ping: 21, load: '34%', status: 'OPTIMAL' },
    { id: 'melbourne-1', region: 'Oceania', country: 'Australia', city: 'Melbourne', flag: '🇦🇺', ping: 24, load: '38%', status: 'OPTIMAL' },
    { id: 'brisbane-1', region: 'Oceania', country: 'Australia', city: 'Brisbane', flag: '🇦🇺', ping: 26, load: '29%', status: 'OPTIMAL' },
    { id: 'perth-1', region: 'Oceania', country: 'Australia', city: 'Perth', flag: '🇦🇺', ping: 39, load: '23%', status: 'OPTIMAL' },
    { id: 'auckland-1', region: 'Oceania', country: 'New Zealand', city: 'Auckland', flag: '🇳🇿', ping: 31, load: '27%', status: 'OPTIMAL' },
    { id: 'wellington-1', region: 'Oceania', country: 'New Zealand', city: 'Wellington', flag: '🇳🇿', ping: 35, load: '19%', status: 'OPTIMAL' }
];

let activeServerId = 'tokyo-1';
let selectedServerRegion = 'ALL';
let serverPingRefreshTimer = null;

function openServerModal() {
    document.getElementById('serverModal').classList.remove('hidden');
    document.getElementById('serverModal').classList.add('flex');
    renderServerNodes();

    if (serverPingRefreshTimer) clearInterval(serverPingRefreshTimer);
    serverPingRefreshTimer = setInterval(() => {
        refreshAllServerPings();
    }, 5000);
}

function closeServerModal() {
    document.getElementById('serverModal').classList.add('hidden');
    document.getElementById('serverModal').classList.remove('flex');
    if (serverPingRefreshTimer) {
        clearInterval(serverPingRefreshTimer);
        serverPingRefreshTimer = null;
    }
}

function refreshAllServerPings() {
    serverNodes.forEach(node => {
        const jitter = Math.floor(Math.random() * 7) - 3;
        node.ping = Math.max(3, node.ping + jitter);
    });
    renderServerNodes();
    const activeNode = serverNodes.find(n => n.id === activeServerId);
    if(activeNode) {
        document.getElementById('activeServerStatus').innerText = `Active: ${activeNode.city} Cluster (${activeNode.flag} ${activeNode.ping}ms)`;
    }
}

function setServerRegion(region) {
    selectedServerRegion = region;
    document.querySelectorAll('.server-region-btn').forEach(btn => {
        if(btn.getAttribute('data-region') === region) {
            btn.className = "server-region-btn px-3 py-2 rounded-xl text-xs font-bold bg-cyber-neonPink text-slate-950 transition-all shadow";
        } else {
            btn.className = "server-region-btn px-3 py-2 rounded-xl text-xs font-bold bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-all";
        }
    });
    renderServerNodes();
}

function filterServerNodes() {
    renderServerNodes();
}

function renderServerNodes() {
    const container = document.getElementById('serverNodesList');
    const searchVal = document.getElementById('serverSearchInput').value.toLowerCase().trim();
    if(!container) return;

    const filtered = serverNodes.filter(node => {
        const matchesRegion = (selectedServerRegion === 'ALL' || node.region === selectedServerRegion);
        const matchesSearch = node.city.toLowerCase().includes(searchVal) ||
                              node.country.toLowerCase().includes(searchVal) ||
                              node.region.toLowerCase().includes(searchVal) ||
                              node.id.toLowerCase().includes(searchVal);
        return matchesRegion && matchesSearch;
    });

    if(filtered.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-slate-500 font-mono text-xs py-8">No server nodes matching search parameters.</div>';
        return;
    }

    let html = '';
    filtered.forEach(node => {
        const isActive = node.id === activeServerId;
        html += `
            <div onclick="switchServer('${node.id}')" class="bg-slate-950 border ${isActive ? 'border-cyber-neonPink shadow-lg shadow-cyber-neonPink/20 bg-slate-900/90' : 'border-slate-800 hover:border-slate-700'} rounded-xl p-3 cursor-pointer transition-all flex items-center justify-between font-mono">
                <div class="flex items-center space-x-2.5 truncate">
                    <span class="text-xl shrink-0">${node.flag}</span>
                    <div class="truncate">
                        <h4 class="text-white text-xs font-bold flex items-center space-x-1.5 truncate">
                            <span class="truncate">${node.city}</span>
                            ${isActive ? '<span class="px-1 py-0.2 bg-cyber-neonPink text-slate-950 text-[8px] rounded font-bold shrink-0">ACTIVE</span>' : ''}
                        </h4>
                        <p class="text-[10px] text-slate-400 truncate">${node.country} • <span class="text-cyber-neonPink">${node.ping}ms</span></p>
                    </div>
                </div>
                <span class="text-[9px] px-2 py-0.5 rounded ${node.status === 'OPTIMAL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'} shrink-0 ml-1">
                    ${node.load}
                </span>
            </div>
        `;
    });
    container.innerHTML = html;
}

function switchServer(id) {
    activeServerId = id;
    const node = serverNodes.find(n => n.id === id);
    document.getElementById('activeServerStatus').innerText = `Active: ${node.city} Cluster (${node.flag} ${node.ping}ms)`;
    renderServerNodes();
    showNotification(`Switched proxy routing to ${node.city} (${node.country})`);
}

// Sub-Neural Storage Vault
let vaultFiles = JSON.parse(localStorage.getItem('cyber_vault_files') || '[]');

const VAULT_OWNER = 'admin';
function isVaultOwner() {
    return localStorage.getItem('cyber_current_user') === VAULT_OWNER;
}

function openVaultModal() {
    const currentUser = localStorage.getItem('cyber_current_user');
    if(!currentUser) {
        showNotification('Access Denied: Please log in to access the Cloud Vault.');
        openAuthModal('login');
        return;
    }
    if(currentUser !== VAULT_OWNER) {
        showNotification('Access Denied: This Cloud Vault is restricted to its owner.');
        return;
    }
    document.getElementById('vaultModal').classList.remove('hidden');
    document.getElementById('vaultModal').classList.add('flex');
    renderVaultFiles();
}

function closeVaultModal() {
    document.getElementById('vaultModal').classList.add('hidden');
    document.getElementById('vaultModal').classList.remove('flex');
}

function uploadLocalFile() {
    if(!isVaultOwner()) { showNotification('Access Denied: This Cloud Vault is restricted to its owner.'); closeVaultModal(); return; }
    const fileInput = document.getElementById('localFileInput');
    if(fileInput.files.length === 0) {
        showNotification('Please select a file from your computer first.');
        return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const newArtifact = {
            id: Date.now(),
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            date: new Date().toISOString().split('T')[0],
            dataUrl: e.target.result
        };
        vaultFiles.unshift(newArtifact);
        localStorage.setItem('cyber_vault_files', JSON.stringify(vaultFiles));
        fileInput.value = '';
        renderVaultFiles();
        showNotification(`Successfully uploaded ${newArtifact.name}`);
    };
    reader.readAsDataURL(file);
}

function renderVaultFiles() {
    const listEl = document.getElementById('vaultFilesList');
    if(!listEl) return;
    if(!isVaultOwner()) { listEl.innerHTML = ''; return; }
    if(vaultFiles.length === 0) {
        listEl.innerHTML = '<div class="text-xs text-slate-500 text-center py-4">No artifacts uploaded in vault yet.</div>';
        return;
    }
    let html = '';
    vaultFiles.forEach((file, index) => {
        html += `
            <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div class="flex items-center space-x-3 w-full sm:w-auto">
                    <div class="w-8 h-8 rounded-lg bg-cyber-neonCyan/10 border border-cyber-neonCyan/40 flex items-center justify-center text-cyber-neonCyan shrink-0">
                        <i class="fa-solid fa-file-shield text-sm"></i>
                    </div>
                    <input type="text" id="renameInput_${index}" value="${file.name}" class="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs w-full sm:w-48 outline-none focus:border-cyber-neonCyan font-mono">
                </div>
                <div class="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <span class="text-[10px] text-slate-400">${file.size}</span>
                    <button onclick="renameFile(${index})" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyber-neonCyan text-[10px] rounded font-bold transition-all">RENAME</button>
                    <a href="${file.dataUrl}" download="${file.name}" class="px-2.5 py-1 bg-cyber-neonCyan text-slate-950 text-[10px] rounded font-bold hover:bg-cyan-300 transition-all flex items-center space-x-1">
                        <i class="fa-solid fa-download"></i><span>GET</span>
                    </a>
                </div>
            </div>
        `;
    });
    listEl.innerHTML = html;
}

function renameFile(index) {
    if(!isVaultOwner()) { showNotification('Access Denied: This Cloud Vault is restricted to its owner.'); closeVaultModal(); return; }
    const newName = document.getElementById(`renameInput_${index}`).value.trim();
    if(!newName) {
        showNotification('File name cannot be empty.');
        return;
    }
    vaultFiles[index].name = newName;
    localStorage.setItem('cyber_vault_files', JSON.stringify(vaultFiles));
    renderVaultFiles();
    showNotification('Artifact renamed successfully.');
}

// ==========================================
// CHAT SYSTEM (RESET ON DELETE & REFRESH)
// ==========================================
let activeChatId = null;
let chatRefreshTimer = null;
const bannedWords = ['badword', 'spam', 'hack', 'malware', 'exploit', 'toxic', 'abuse', 'attack', 'crap', 'dumb', 'idiot'];

function sanitizeMessage(text) {
    let sanitized = text;
    let detectedWords = [];

    bannedWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        if (regex.test(sanitized)) {
            detectedWords.push(word);
            sanitized = sanitized.replace(regex, '****');
        }
    });

    return {
        sanitizedText: sanitized,
        isCensored: detectedWords.length > 0,
        detectedWords: detectedWords
    };
}

function promptNewChat() {
    const targetUser = prompt("Enter username of account to chat with:");
    if(!targetUser) return;
    const currentUser = localStorage.getItem('cyber_current_user');
    const cleanTarget = targetUser.trim();

    if(cleanTarget.toLowerCase() === currentUser.toLowerCase()) {
        showNotification("Error: You cannot start a chat with yourself.");
        return;
    }

    let chatsDb = JSON.parse(localStorage.getItem('cyber_chats_db') || '[]');
    let existing = chatsDb.find(c => 
        (c.user1.toLowerCase() === currentUser.toLowerCase() && c.user2.toLowerCase() === cleanTarget.toLowerCase()) ||
        (c.user1.toLowerCase() === cleanTarget.toLowerCase() && c.user2.toLowerCase() === currentUser.toLowerCase())
    );

    if(existing) {
        activeChatId = existing.id;
    } else {
        const newChat = {
            id: 'chat_' + Date.now(),
            user1: currentUser,
            user2: cleanTarget,
            messages: [],
            isEnded: false
        };
        chatsDb.push(newChat);
        localStorage.setItem('cyber_chats_db', JSON.stringify(chatsDb));
        activeChatId = newChat.id;
    }

    loadConversations();
    openChatChannel(activeChatId);
    showNotification(`Connected to chat channel with ${cleanTarget}`);
}

function loadConversations() {
    const currentUser = localStorage.getItem('cyber_current_user');
    const container = document.getElementById('conversationsList');
    if(!container) return;

    let chatsDb = JSON.parse(localStorage.getItem('cyber_chats_db') || '[]');
    const myChats = chatsDb.filter(c => c.user1.toLowerCase() === currentUser.toLowerCase() || c.user2.toLowerCase() === currentUser.toLowerCase());

    if(myChats.length === 0) {
        container.innerHTML = '<div class="text-[11px] text-slate-500 text-center py-6">No active channels. Click NEW CHAT above.</div>';
        return;
    }

    let html = '';
    myChats.forEach(chat => {
        const peer = chat.user1.toLowerCase() === currentUser.toLowerCase() ? chat.user2 : chat.user1;
        const isActive = chat.id === activeChatId;
        html += `
            <div onclick="openChatChannel('${chat.id}')" class="p-3 rounded-xl cursor-pointer transition-all border ${isActive ? 'bg-slate-800 border-cyber-neonCyan text-white shadow' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'} flex items-center justify-between">
                <div class="flex items-center space-x-2 truncate">
                    <div class="w-7 h-7 rounded-lg bg-cyber-neonCyan/10 border border-cyber-neonCyan/30 flex items-center justify-center text-cyber-neonCyan text-xs shrink-0">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <span class="text-xs font-bold truncate">${peer}</span>
                </div>
                <span class="w-2 h-2 rounded-full ${chat.isEnded ? 'bg-red-500 animate-pulse' : 'bg-cyber-neonCyan'}"></span>
            </div>
        `;
    });
    container.innerHTML = html;
}

function openChatChannel(chatId) {
    activeChatId = chatId;
    const currentUser = localStorage.getItem('cyber_current_user');
    
    if(chatRefreshTimer) clearInterval(chatRefreshTimer);

    // 2-second automatic refresh loop
    chatRefreshTimer = setInterval(() => {
        let chatsDb = JSON.parse(localStorage.getItem('cyber_chats_db') || '[]');
        let currentChat = chatsDb.find(c => c.id === activeChatId);
        if(currentChat) {
            renderChatMessages(currentChat);
            checkChatEndedState(currentChat);
        } else if(activeChatId) {
            // Reset UI if current active chat was deleted completely
            resetChatUI();
        }
        loadConversations();
    }, 2000);

    let chatsDb = JSON.parse(localStorage.getItem('cyber_chats_db') || '[]');
    const chat = chatsDb.find(c => c.id === chatId);
    if(!chat) return;

    const peer = chat.user1.toLowerCase() === currentUser.toLowerCase() ? chat.user2 : chat.user1;
    document.getElementById('activeChatTitle').innerText = `SECURE CHANNEL // ${peer.toUpperCase()}`;
    
    checkChatEndedState(chat);
    renderChatMessages(chat);
    loadConversations();
}

function deleteCurrentChat() {
    if(!activeChatId) return;
    if(!confirm("Are you sure you want to completely delete and reset all data for this chat?")) return;

    let chatsDb = JSON.parse(localStorage.getItem('cyber_chats_db') || '[]');
    
    // Wipe data by filtering out this chat completely
    chatsDb = chatsDb.filter(c => c.id !== activeChatId);
    localStorage.setItem('cyber_chats_db', JSON.stringify(chatsDb));

    resetChatUI();
    loadConversations();
    showNotification('Chat data completely reset. You can now start a fresh chat with this user.');
}

function resetChatUI() {
    activeChatId = null;
    document.getElementById('activeChatTitle').innerText = 'Select a chat channel';
    document.getElementById('chatMessagesStream').innerHTML = `
        <div class="text-center text-slate-500 text-xs py-12">
            No channel selected. Click "NEW CHAT" to initiate secure messaging with an operative.
        </div>
    `;
    document.getElementById('chatInputArea').classList.add('hidden');
}

function checkChatEndedState(chat) {
    const inputArea = document.getElementById('chatInputArea');
    if(chat.isEnded) {
        inputArea.classList.add('hidden');
    } else {
        inputArea.classList.remove('hidden');
    }
}

function renderChatMessages(chat) {
    const stream = document.getElementById('chatMessagesStream');
    const currentUser = localStorage.getItem('cyber_current_user');
    if(!stream) return;

    if(chat.messages.length === 0) {
        stream.innerHTML = '<div class="text-center text-slate-500 text-xs py-8">Channel secure. Send your first transmission below.</div>';
        return;
    }

    let html = '';
    chat.messages.forEach(msg => {
        const isBot = msg.sender === 'SYSTEM_BOT';
        const isMe = msg.sender === currentUser;
        
        if(isBot) {
            html += `
                <div class="text-center my-2">
                    <span class="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-400 text-[10px] rounded-full font-bold">
                        <i class="fa-solid fa-triangle-exclamation mr-1"></i> ${msg.text}
                    </span>
                </div>
            `;
        } else {
            html += `
                <div class="flex ${isMe ? 'justify-end' : 'justify-start'}">
                    <div class="max-w-md ${isMe ? 'bg-cyber-neonCyan/10 border-cyber-neonCyan/30 text-white' : 'bg-slate-900 border-slate-800 text-slate-200'} border rounded-xl px-4 py-2.5 text-xs">
                        <div class="flex items-center justify-between gap-4 text-[9px] text-slate-400 mb-1 font-bold">
                            <span>${msg.sender}</span>
                            ${msg.censored ? '<span class="text-red-400"><i class="fa-solid fa-shield-virus"></i> SANITIZED BY BOT</span>' : ''}
                        </div>
                        <div>${msg.text}</div>
                    </div>
                </div>
            `;
        }
    });
    stream.innerHTML = html;
    stream.scrollTop = stream.scrollHeight;
}

function sendChatMessage(e) {
    e.preventDefault();
    const input = document.getElementById('chatMessageInput');
    const rawText = input.value.trim();
    if(!rawText || !activeChatId) return;

    let chatsDb = JSON.parse(localStorage.getItem('cyber_chats_db') || '[]');
    const chat = chatsDb.find(c => c.id === activeChatId);
    if(!chat || chat.isEnded) return;

    const currentUser = localStorage.getItem('cyber_current_user');
    const botCheck = sanitizeMessage(rawText);

    const newMsg = {
        sender: currentUser,
        text: botCheck.sanitizedText,
        censored: botCheck.isCensored,
        timestamp: Date.now()
    };

    if(botCheck.isCensored) {
        let users = JSON.parse(localStorage.getItem('cyber_users_db') || '[]');
        let targetUserObj = users.find(u => u.username === currentUser);
        if(targetUserObj) {
            targetUserObj.censoredCount = (targetUserObj.censoredCount || 0) + 1;
            if(!targetUserObj.badWordsLog) targetUserObj.badWordsLog = [];
            targetUserObj.badWordsLog.unshift({
                original: rawText,
                sanitized: botCheck.sanitizedText,
                words: botCheck.detectedWords,
                time: new Date().toLocaleTimeString()
            });
            localStorage.setItem('cyber_users_db', JSON.stringify(users));
        }
        showNotification('Moderation Bot: Bad words automatically removed & logged.');
    }

    chat.messages.push(newMsg);
    localStorage.setItem('cyber_chats_db', JSON.stringify(chatsDb));
    input.value = '';

    renderChatMessages(chat);
    updateAdminTopBarStats();
}

// ==========================================
// AUTH & BAN SYSTEM
// ==========================================
function openAuthModal(mode) {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('authModal').classList.add('flex');
    switchAuthTab(mode);
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('authModal').classList.remove('flex');
}

function switchAuthTab(mode) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabSignupBtn = document.getElementById('tabSignupBtn');

    if(mode === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        tabLoginBtn.className = "text-lg font-bold text-cyber-neonCyan pb-1 border-b-2 border-cyber-neonCyan transition-all";
        tabSignupBtn.className = "text-lg font-bold text-slate-500 pb-1 border-b-2 border-transparent transition-all";
    } else {
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        tabSignupBtn.className = "text-lg font-bold text-cyber-neonPink pb-1 border-b-2 border-cyber-neonPink transition-all";
        tabLoginBtn.className = "text-lg font-bold text-slate-500 pb-1 border-b-2 border-transparent transition-all";
    }
}

function handleSignup(e) {
    e.preventDefault();
    const user = document.getElementById('signupUser').value.trim();
    const pass = document.getElementById('signupPass').value.trim();

    let usersFile = JSON.parse(localStorage.getItem('cyber_users_db') || '[]');
    if(usersFile.find(u => u.username.toLowerCase() === user.toLowerCase())) {
        showNotification('Error: Operative username already registered!');
        return;
    }

    usersFile.push({ 
        username: user, 
        password: pass, 
        banned: false, 
        censoredCount: 0, 
        badWordsLog: [] 
    });
    localStorage.setItem('cyber_users_db', JSON.stringify(usersFile));
    showNotification('Account registered successfully! You can now log in.');
    switchAuthTab('login');
}

function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();

    let usersFile = JSON.parse(localStorage.getItem('cyber_users_db') || '[]');
    const foundUser = usersFile.find(u => u.username.toLowerCase() === user.toLowerCase() && u.password === pass);

    if(foundUser) {
        if(foundUser.banned) {
            showNotification('account banned');
            alert('account banned');
            return;
        }

        localStorage.setItem('cyber_current_user', foundUser.username);
        closeAuthModal();
        updateAuthNavUI();
        updateRestrictedModulesUI();
        checkAdminStatus();
        showNotification(`Authentication successful. Welcome back, ${foundUser.username}.`);
    } else {
        showNotification('Access Denied: Invalid username or password.');
    }
}

function handleLogout() {
    localStorage.removeItem('cyber_current_user');
    updateAuthNavUI();
    updateRestrictedModulesUI();
    checkAdminStatus();
    switchMainView('hub');
    showNotification('Signed out from secure node session.');
}

function updateAuthNavUI() {
    const currentUser = localStorage.getItem('cyber_current_user');
    const authArea = document.getElementById('authNavArea');

    if(currentUser) {
        const isAdmin = currentUser === 'admin';
        authArea.innerHTML = `
            <div class="flex items-center space-x-2 bg-slate-900 border ${isAdmin ? 'border-red-500' : 'border-cyber-neonCyan/40'} px-3 py-1.5 rounded-xl font-mono text-xs">
                <span class="w-2 h-2 rounded-full ${isAdmin ? 'bg-red-500' : 'bg-cyber-neonCyan'} animate-pulse"></span>
                <span class="text-white font-bold">${currentUser} ${isAdmin ? '(ADMIN)' : ''}</span>
                <button onclick="handleLogout()" class="ml-2 text-slate-400 hover:text-red-400 transition-colors" title="Logout">
                    <i class="fa-solid fa-power-off"></i>
                </button>
            </div>
        `;
    } else {
        authArea.innerHTML = `
            <button onclick="openAuthModal('login')" class="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-mono text-xs rounded-xl border border-slate-700 transition-all">
                LOGIN
            </button>
            <button onclick="openAuthModal('signup')" class="px-3 py-2 bg-cyber-neonCyan/20 hover:bg-cyber-neonCyan text-cyber-neonCyan hover:text-slate-950 font-mono text-xs font-bold rounded-xl border border-cyber-neonCyan/60 transition-all shadow-lg shadow-cyber-neonCyan/20">
                SIGN UP
            </button>
        `;
    }
}

function updateRestrictedModulesUI() {
    const currentUser = localStorage.getItem('cyber_current_user');
    const vaultBadge = document.getElementById('vaultBadge');
    const vaultBtnText = document.getElementById('vaultBtnText');

    if(currentUser) {
        vaultBadge.className = "px-3 py-1 rounded-full bg-cyber-neonCyan/10 border border-cyber-neonCyan/30 text-cyber-neonCyan text-xs font-mono";
        vaultBadge.innerText = "ONLINE";
        vaultBtnText.innerText = "ACCESS VAULT";

        document.querySelectorAll('.restricted-module').forEach(card => {
            card.classList.remove('restricted-module');
            const badge = card.querySelector('span.text-red-400');
            if(badge) {
                badge.className = "px-3 py-1 rounded-full bg-cyber-neonCyan/10 border border-cyber-neonCyan/30 text-cyber-neonCyan text-xs font-mono";
                badge.innerText = "ONLINE";
            }
            const title = card.querySelector('h4');
            if(title) title.className = "text-xl font-bold text-white transition-colors";
            const btn = card.querySelector('button');
            if(btn) {
                btn.className = "px-4 py-2 bg-cyber-neonCyan/25 hover:bg-cyber-neonCyan text-cyber-neonCyan hover:text-slate-950 font-mono text-xs rounded-xl border border-cyber-neonCyan/50 transition-all font-bold flex items-center space-x-2";
                btn.innerHTML = '<span>LAUNCH MODULE</span><i class="fa-solid fa-arrow-right"></i>';
                btn.setAttribute('onclick', "showNotification('Module deployed successfully.')");
            }
        });
    } else {
        vaultBadge.className = "px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono";
        vaultBadge.innerText = "LOCKED";
        vaultBtnText.innerText = "ACCESS VAULT";
    }

    if(currentUser !== VAULT_OWNER) {
        vaultBadge.className = "px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono";
        vaultBadge.innerText = "LOCKED";
    }
}

// ==========================================
// ADMIN CONSOLE
// ==========================================
function checkAdminStatus() {
    const currentUser = localStorage.getItem('cyber_current_user');
    const adminBar = document.getElementById('adminTopBar');

    if(currentUser === 'admin') {
        adminBar.classList.remove('hidden');
        updateAdminTopBarStats();
    } else {
        adminBar.classList.add('hidden');
    }
}

function updateAdminTopBarStats() {
    const container = document.getElementById('adminStatsOverview');
    if(!container) return;

    let users = JSON.parse(localStorage.getItem('cyber_users_db') || '[]');
    let totalCensored = users.reduce((sum, u) => sum + (u.censoredCount || 0), 0);
    let bannedCount = users.filter(u => u.banned).length;

    container.innerHTML = `
        <div>REGISTERED USERS: <span class="text-white font-bold">${users.length}</span></div>
        <div>TOTAL CENSORED MESSAGES: <span class="text-red-400 font-bold">${totalCensored}</span></div>
        <div>BANNED ACCOUNTS: <span class="text-yellow-400 font-bold">${bannedCount}</span></div>
    `;
}

function openAdminModal() {
    document.getElementById('adminModal').classList.remove('hidden');
    document.getElementById('adminModal').classList.add('flex');
    renderAdminUsersList();
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.add('hidden');
    document.getElementById('adminModal').classList.remove('flex');
}

function renderAdminUsersList() {
    const container = document.getElementById('adminUsersList');
    if(!container) return;

    let users = JSON.parse(localStorage.getItem('cyber_users_db') || '[]');
    if(users.length === 0) {
        container.innerHTML = '<div class="text-slate-500 text-xs">No registered users found.</div>';
        return;
    }

    let html = '';
    users.forEach((u) => {
        const isAdmin = u.username === 'admin';
        const count = u.censoredCount || 0;
        const logs = u.badWordsLog || [];

        html += `
            <div class="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-900">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold text-xs">
                            ${u.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h5 class="text-white font-bold text-sm flex items-center space-x-2">
                                <span>${u.username}</span>
                                ${isAdmin ? '<span class="px-1.5 py-0.5 bg-red-600 text-white text-[9px] rounded">SYSTEM ADMIN</span>' : ''}
                                ${u.banned ? '<span class="px-1.5 py-0.5 bg-yellow-500 text-slate-950 text-[9px] font-bold rounded">BANNED</span>' : ''}
                            </h5>
                            <span class="text-[11px] text-slate-400">Total Infractions: <strong class="text-red-400">${count}</strong> time(s) censored</span>
                        </div>
                    </div>
                    ${!isAdmin ? `
                        <button onclick="toggleBanUser('${u.username}')" class="px-3 py-1.5 ${u.banned ? 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border-emerald-500/50' : 'bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border-red-500/50'} text-xs font-bold border rounded-lg transition-all">
                            ${u.banned ? 'UNBAN ACCOUNT' : 'BAN ACCOUNT'}
                        </button>
                    ` : ''}
                </div>

                <div class="mt-3">
                    <span class="text-[10px] text-slate-500 uppercase font-bold">LOGGED BAD WORDS & CENSORED INPUTS:</span>
                    <div class="mt-1 space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        ${logs.length === 0 ? '<div class="text-[11px] text-slate-600 italic">No profanity logs recorded for this operative.</div>' : ''}
                        ${logs.map(l => `
                            <div class="bg-slate-900/90 border border-slate-800 rounded px-2.5 py-1.5 text-[11px] text-slate-300">
                                <div class="flex items-center justify-between text-[9px] text-red-400 font-bold">
                                    <span>Flagged Words: [${l.words ? l.words.join(', ') : 'n/a'}]</span>
                                    <span>${l.time || ''}</span>
                                </div>
                                <div class="text-slate-400 line-through text-[10px]">Raw: ${l.original}</div>
                                <div class="text-emerald-400 text-[10px]">Cleaned: ${l.sanitized}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function toggleBanUser(targetUser) {
    let users = JSON.parse(localStorage.getItem('cyber_users_db') || '[]');
    let u = users.find(x => x.username.toLowerCase() === targetUser.toLowerCase());
    if(!u) return;

    u.banned = !u.banned;
    localStorage.setItem('cyber_users_db', JSON.stringify(users));

    renderAdminUsersList();
    updateAdminTopBarStats();
    showNotification(`Updated ban status for ${targetUser}.`);
}

window.addEventListener('DOMContentLoaded', () => {
    updateAuthNavUI();
    updateRestrictedModulesUI();
    checkAdminStatus();
});

// Terminal logic
function openTerminalModal() {
    document.getElementById('terminalModal').classList.remove('hidden');
    document.getElementById('terminalModal').classList.add('flex');
    document.getElementById('terminalInput').focus();
}

function closeTerminalModal() {
    document.getElementById('terminalModal').classList.add('hidden');
    document.getElementById('terminalModal').classList.remove('flex');
}

function handleTerminalInput(e) {
    if(e.key === 'Enter') {
        const input = e.target;
        const cmd = input.value.trim().toLowerCase();
        const output = document.getElementById('terminalOutput');
        
        output.innerHTML += `<div class="text-white">root@net:~# ${input.value}</div>`;
        
        if(cmd === 'help') {
            output.innerHTML += `<div class="text-cyber-neonCyan">Available commands: help, status, whoami, clear</div>`;
        } else if(cmd === 'whoami') {
            const activeUser = localStorage.getItem('cyber_current_user') || 'guest_operative';
            output.innerHTML += `<div class="text-cyber-neonPink">Current session user: ${activeUser}</div>`;
        } else if(cmd === 'clear') {
            output.innerHTML = '';
        } else if(cmd !== '') {
            output.innerHTML += `<div class="text-red-400">Command not recognized: ${cmd}. Type 'help' for options.</div>`;
        }
        
        input.value = '';
        output.scrollTop = output.scrollHeight;
    }
}
