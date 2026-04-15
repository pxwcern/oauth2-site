import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Bot, 
  Activity, 
  Plus, 
  ShieldCheck,
  Zap,
  ChevronRight,
  ExternalLink,
  Trash2,
  LogOut,
  ArrowRight,
  Globe,
  Lock,
  Cpu,
  Monitor,
  LayoutDashboard,
  BarChart3,
  Settings,
  ShieldAlert,
  Search,
  CheckCircle2,
  User,
  History
} from 'lucide-react';

const API_BASE = '/api';

// --- Restore Style UI Components ---

const Sidebar = ({ activeView, setView, onLogout }) => (
  <div className="sidebar">
    <div className="px-6 mb-12 flex items-center gap-3">
      <div className="w-10 h-10 bg-accent-primary rounded-xl flex items-center justify-center shadow-lg shadow-accent-primary/20">
        <Cpu className="w-6 h-6 text-white" />
      </div>
      <span className="font-heading font-black text-2xl tracking-tighter">OBSIDIAN</span>
    </div>

    <div className="space-y-1">
      <button className={`sidebar-item w-full ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
        <LayoutDashboard className="w-5 h-5" /> Dashboard
      </button>
      <button className="sidebar-item w-full opacity-50">
        <BarChart3 className="w-5 h-5" /> Analytics
      </button>
      <button className="sidebar-item w-full opacity-50">
        <ShieldAlert className="w-5 h-5" /> Logs
      </button>
      <button className="sidebar-item w-full opacity-50">
        <History className="w-5 h-5" /> Statistics
      </button>
    </div>

    <div className="mt-auto space-y-1">
      <button className="sidebar-item w-full opacity-50">
        <Settings className="w-5 h-5" /> Settings
      </button>
      <button onClick={onLogout} className="sidebar-item w-full text-red-500 hover:bg-red-500/10 active:bg-red-500/20">
        <LogOut className="w-5 h-5" /> Logout
      </button>
    </div>
  </div>
);

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 py-6 px-12 flex justify-between items-center animate-reveal">
    <div className="flex items-center gap-2">
      <Cpu className="w-6 h-6 text-accent-primary" />
      <span className="font-heading font-black text-2xl tracking-tighter">OBSIDIAN</span>
    </div>
    <div className="flex items-center gap-10">
      <a href="#features" className="text-sm font-bold text-text-secondary hover:text-white transition-colors">Features</a>
      <a href="#pricing" className="text-sm font-bold text-text-secondary hover:text-white transition-colors">Pricing</a>
      <a href="/api/auth/login" className="btn-restore py-3 px-8 text-sm">Login</a>
    </div>
  </nav>
);

const Hero = () => (
  <section className="min-h-screen container flex items-center pt-20">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center w-full">
      <div className="animate-reveal">
        <div className="flex flex-wrap gap-4 mb-10">
          <div className="badge-pill badge-green">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            124,592 Users Protected
          </div>
          <div className="badge-pill badge-purple">
            <Lock className="w-3 h-3" />
            Enterprise Infrastructure
          </div>
        </div>
        
        <h1 className="text-7xl font-black mb-8 leading-[1.05]">
          Don't let a simple <br/>
          mistake <span className="text-accent-primary underline decoration-4 underline-offset-8">destroy</span> <br/>
          your pool.
        </h1>
        
        <p className="text-xl text-text-secondary mb-12 max-w-lg leading-relaxed">
          The only authorization engine you will ever need to protect, scale and recover your Discord member pools with industrial-grade efficiency.
        </p>
        
        <div className="flex flex-wrap gap-6">
          <a href="/api/auth/login" className="btn-restore text-lg px-10 py-5">
            Get Started Now <ArrowRight className="w-5 h-5" />
          </a>
          <a href="#features" className="btn-outline-restore text-lg px-10 py-5">
            Explore Documentation
          </a>
        </div>
      </div>

      <div className="hidden lg:block animate-reveal [animation-delay:0.2s]">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-accent-primary to-accent-purple rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-bg-card border border-white/5 p-4 rounded-[32px] shadow-2xl overflow-hidden">
             {/* Virtual Dashboard Mockup */}
             <div className="rounded-[20px] bg-black/80 aspect-[4/3] flex overflow-hidden">
                <div className="w-1/4 h-full border-right border-white/5 p-4 space-y-3">
                  <div className="h-4 w-full bg-white/5 rounded"></div>
                  <div className="h-4 w-3/4 bg-white/5 rounded opacity-50"></div>
                  <div className="h-4 w-full bg-white/5 rounded"></div>
                </div>
                <div className="flex-1 p-6 space-y-6">
                  <div className="flex justify-between">
                    <div className="h-6 w-1/3 bg-white/10 rounded"></div>
                    <div className="h-6 w-1/4 bg-white/5 rounded"></div>
                  </div>
                  <div className="h-40 w-full bg-white/5 rounded-2xl relative overflow-hidden">
                     <div className="absolute bottom-0 left-0 w-full h-1/2 bg-accent-primary/5"></div>
                     <svg className="absolute bottom-0 left-0 w-full h-full" overflow="visible">
                        <path d="M0 100 Q 50 20 Q 100 80 T 200 60 T 300 120 T 400 30" fill="none" stroke="var(--accent-primary)" strokeWidth="3" opacity="0.5"/>
                     </svg>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 bg-white/5 rounded-xl"></div>
                    <div className="h-20 bg-white/5 rounded-xl"></div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// --- Main App ---

function App() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddBot, setShowAddBot] = useState(false);
  const [newBot, setNewBot] = useState({ client_id: '', client_secret: '', bot_token: '' });
  const [token, setToken] = useState(localStorage.getItem('vortex_token'));
  const [view, setView] = useState('dashboard');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('vortex_token', urlToken);
      setToken(urlToken);
      window.history.replaceState({}, document.title, "/");
    }

    if (token) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const botsRes = await axios.get(`${API_BASE}/bot`, { headers });
      setBots(botsRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vortex_token');
    setToken(null);
    setBots([]);
  };

  const handleAddBot = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API_BASE}/bot`, newBot, { headers });
      setShowAddBot(false);
      setNewBot({ client_id: '', client_secret: '', bot_token: '' });
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteBot = async (id) => {
    if (!confirm('Permanently delete this unit?')) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_BASE}/bot/${id}`, { headers });
      fetchData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-black">
      <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-accent-primary animate-[loading_1.5s_infinite] w-1/2 rounded-full"></div>
      </div>
      <style>{`@keyframes loading { 0% { transform: translateX(-100%) } 100% { transform: translateX(200%) } }`}</style>
      <p className="font-heading font-black tracking-widest uppercase mt-6 opacity-30 text-xs">Authenticating Session</p>
    </div>
  );

  if (!token) {
    return (
      <div className="min-h-screen">
        <div className="grid-bg" />
        <div className="glow-spot" />
        <Navbar />
        <Hero />
        <section className="py-24 container">
           <h2 className="text-center font-black text-5xl mb-20 animate-reveal">Your Infrastructure. <br/> <span className="opacity-20">Obsidian Controlled.</span></h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="restore-card animate-reveal">
                 <Zap className="text-accent-primary mb-6 w-10 h-10" />
                 <h3 className="text-2xl font-bold mb-4">Atomic Sync</h3>
                 <p className="text-text-secondary">Instant member pooling across distributed nodes with zero data loss.</p>
              </div>
              <div className="restore-card animate-reveal [animation-delay:0.1s]">
                 <ShieldCheck className="text-accent-primary mb-6 w-10 h-10" />
                 <h3 className="text-2xl font-bold mb-4">Hardened Vault</h3>
                 <p className="text-text-secondary">AES-256-GCM encryption for every token, rotated dynamically every 24h.</p>
              </div>
              <div className="restore-card animate-reveal [animation-delay:0.2s]">
                 <Monitor className="text-accent-primary mb-6 w-10 h-10" />
                 <h3 className="text-2xl font-bold mb-4">Audit Console</h3>
                 <p className="text-text-secondary">A unified command center for real-time fleet health and auth telemetry.</p>
              </div>
           </div>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-layout bg-[#050505]">
      <Sidebar activeView={view} setView={setView} onLogout={handleLogout} />
      
      <main className="main-content">
        <header className="flex justify-between items-center mb-16 animate-reveal">
           <div>
              <h1 className="text-4xl font-black mb-2">Good afternoon, Command</h1>
              <p className="text-text-secondary">Welcome back to your dashboard. Monitoring 14 active pools.</p>
           </div>
           <div className="flex items-center gap-6">
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                 <input className="bg-white/5 border border-white/5 py-3 pl-12 pr-6 rounded-xl w-64 outline-none focus:border-accent-primary/50 transition-all text-sm" placeholder="Search bot pools..." />
              </div>
              <div className="w-12 h-12 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
                 <User className="w-6 h-6" />
              </div>
           </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 animate-reveal [animation-delay:0.1s]">
           <div className="lg:col-span-2 stats-card">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-lg font-bold">Pool Statistics</h3>
                 <div className="text-xs bg-white/5 px-3 py-1 rounded-lg text-text-secondary font-bold">Last 30 days</div>
              </div>
              <div className="h-80 flex items-end gap-2 px-4 relative">
                 <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                    <svg className="w-full h-full" overflow="visible">
                       <path d="M0 100 Q 150 10 300 150 T 600 80 T 900 200" fill="none" stroke="var(--accent-primary)" strokeWidth="4" />
                    </svg>
                 </div>
                 {[40, 60, 45, 90, 65, 30, 80, 55, 70, 40].map((h, i) => (
                    <div key={i} className="flex-1 bg-white/5 rounded-t-lg transition-all hover:bg-accent-primary/20 group relative h-[100%]">
                       <div className="absolute bottom-0 left-0 w-full bg-accent-primary/10 transition-all group-hover:bg-accent-primary/30" style={{ height: `${h}%` }}></div>
                    </div>
                 ))}
              </div>
              <div className="flex justify-between mt-6 px-4 text-[10px] font-black tracking-widest opacity-20 uppercase">
                 <span>Mar 16</span><span>Mar 26</span><span>Apr 05</span><span>Apr 13</span>
              </div>
           </div>
           
           <div className="space-y-8">
              <div className="stats-card border-l-4 border-accent-primary">
                 <p className="text-xs font-black tracking-widest opacity-30 uppercase mb-2">Authenticated Units</p>
                 <div className="flex items-center justify-between">
                    <span className="text-4xl font-black">{bots.length}</span>
                    <Bot className="w-8 h-8 opacity-20" />
                 </div>
              </div>
              <div className="stats-card">
                 <p className="text-xs font-black tracking-widest opacity-30 uppercase mb-2">Total Pool Health</p>
                 <div className="flex items-center justify-between">
                    <span className="text-4xl font-black">99.2%</span>
                    <Activity className="w-8 h-8 opacity-20 text-emerald-500" />
                 </div>
              </div>
              <div className="bg-gradient-to-br from-accent-primary to-accent-secondary p-8 rounded-[24px] text-white shadow-xl shadow-accent-primary/10">
                 <h4 className="text-xl font-bold mb-4 leading-tight">Elite Tier <br/> Authentication</h4>
                 <p className="text-sm opacity-80 mb-6">Upgrade to Obsidian Business for unlimited units and sub-second pooling.</p>
                 <button className="bg-black text-white w-full py-3 rounded-xl text-sm font-bold">Upgrade Now</button>
              </div>
           </div>
        </section>

        <section className="animate-reveal [animation-delay:0.2s]">
           <div className="flex justify-between items-center mb-8">
             <h2 className="text-2xl font-black">Current Unit Fleet</h2>
             {!showAddBot && (
                <button onClick={() => setShowAddBot(true)} className="btn-restore py-3 px-8 text-sm">
                   <Plus className="w-4 h-4" /> New Unit
                </button>
             )}
           </div>

           {showAddBot && (
              <div className="restore-card mb-12 border-accent-primary/20 bg-[#0a0a0b] animate-reveal">
                 <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xl font-bold uppercase tracking-widest">Initialize Deployment</h3>
                    <button onClick={() => setShowAddBot(false)} className="p-2 hover:bg-white/5 rounded-full opacity-30 hover:opacity-100 transition-all"><Trash2 className="w-5 h-5"/></button>
                 </div>
                 <form onSubmit={handleAddBot} className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black tracking-widest opacity-30 uppercase">Client ID</label>
                       <input required value={newBot.client_id} onChange={e => setNewBot({...newBot, client_id: e.target.value})} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl outline-none focus:border-accent-primary/40 transition-all" placeholder="Enter ID..." />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black tracking-widest opacity-30 uppercase">Client Secret</label>
                       <input required type="password" value={newBot.client_secret} onChange={e => setNewBot({...newBot, client_secret: e.target.value})} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl outline-none focus:border-accent-primary/40 transition-all" placeholder="Enter Secret..." />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black tracking-widest opacity-30 uppercase">Auth Token</label>
                       <input required type="password" value={newBot.bot_token} onChange={e => setNewBot({...newBot, bot_token: e.target.value})} className="w-full bg-white/5 border border-white/5 p-4 rounded-xl outline-none focus:border-accent-primary/40 transition-all" placeholder="Enter Token..." />
                    </div>
                    <div className="md:col-span-3 flex justify-end gap-6 pt-6">
                       <button type="button" onClick={() => setShowAddBot(false)} className="btn-outline-restore px-10">Cancel</button>
                       <button type="submit" className="btn-restore px-16 bg-accent-primary text-white">Deploy</button>
                    </div>
                 </form>
              </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 xxl:grid-cols-3 gap-8">
              {bots.map(bot => (
                 <div key={bot.id} className="restore-card group hover:border-accent-primary/30 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-8">
                       <div className="w-14 h-14 bg-white/5 rounded-[18px] flex items-center justify-center border border-white/5 group-hover:bg-accent-primary transition-all duration-500">
                          <Bot className="w-7 h-7 group-hover:text-white" />
                       </div>
                       <div className="flex gap-2">
                          <a href={`https://discord.com/api/oauth2/authorize?client_id=${bot.client_id}&redirect_uri=${encodeURIComponent('https://csbl.lol/api/bot/callback')}&response_type=code&scope=identify+guilds.join&state=${bot.id}`} target="_blank" className="p-3 bg-white/5 rounded-xl opacity-40 hover:opacity-100 hover:bg-white/10 transition-all">
                             <ExternalLink className="w-4 h-4" />
                          </a>
                          <button onClick={() => handleDeleteBot(bot.id)} className="p-3 bg-red-500/5 text-red-500/30 hover:text-red-500 rounded-xl transition-all">
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                    <h4 className="text-2xl font-bold mb-1">{bot.client_id}</h4>
                    <p className="text-[10px] uppercase font-black tracking-widest opacity-20 mb-8">Uplink Code: {bot.id.slice(0, 12)}</p>
                    <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                       <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-40">System Synchronized</span>
                    </div>
                 </div>
              ))}
              {bots.length === 0 && (
                 <div className="md:col-span-2 py-20 text-center border-2 border-dashed border-white/5 rounded-[40px] opacity-20">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                       <Zap className="w-10 h-10" />
                    </div>
                    <p className="font-bold">No active units detected in your sector.</p>
                 </div>
              )}
           </div>
        </section>
      </main>
    </div>
  );
}

export default App;
