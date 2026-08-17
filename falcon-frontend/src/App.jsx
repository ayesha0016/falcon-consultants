import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  MapPin, 
  Search, 
  Plus, 
  User, 
  LogOut, 
  X, 
  Upload, 
  LayoutDashboard, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Users, 
  Award,
  TrendingUp,
  Pencil,
  Trash2,
  Menu
} from 'lucide-react';
import Footer from './components/Footer';
import PropertyList from './components/PropertyList';
import AgentContactModal from './components/AgentContactModal';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('falcon_user')) || null;
    } catch {
      return null;
    }
  });
  
  const [properties, setProperties] = useState([]);
  const [userProperties, setUserProperties] = useState([]);
  
  // Navigation & Mobile Menu State
  const [activeTab, setActiveTab] = useState('home');
  const [dashboardSubTab, setDashboardSubTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Selected Property Modal State
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Forms
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [propForm, setPropForm] = useState({ 
    title: '', property_type: 'Residential', price: '', location: '', description: '', image_url: '', 
    agent_phone: '', agent_address: ''
  });
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  
  const [authError, setAuthError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Image Upload Handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPropForm(prev => ({ ...prev, image_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchAllProperties = useCallback(async () => {
    try {
      const res = await fetch('https://falcon-project-backend.vercel.app/api/properties');
      if (!res.ok) throw new Error('Failed to fetch public properties.');
      const data = await res.json();
      if (Array.isArray(data)) setProperties(data);
    } catch (err) {
      console.error('Fetch properties error:', err);
    }
  }, []);

  const fetchUserProperties = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const res = await fetch(`https://falcon-project-backend.vercel.app/api/user/properties/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user properties.');
      const data = await res.json();
      if (Array.isArray(data)) setUserProperties(data);
    } catch (err) {
      console.error('Fetch user properties error:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllProperties();
    if (user?.id) fetchUserProperties(user.id);
  }, [user?.id, fetchAllProperties, fetchUserProperties]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(`https://falcon-project-backend.vercel.app${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed.');
        return;
      }

      setUser(data);
      localStorage.setItem('falcon_user', JSON.stringify(data));
      setShowAuthModal(false);
      setActiveTab('dashboard');
      setAuthForm({ name: '', email: '', password: '', phone: '', address: '' });
    } catch (err) {
      setAuthError('Connection Error: Backend running status check karein.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('falcon_user');
    setActiveTab('home');
    setMobileMenuOpen(false);
  };

  const handlePostProperty = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: propForm.title,
        property_type: propForm.property_type,
        price: propForm.price,
        location: propForm.location,
        description: propForm.description,
        image_url: propForm.image_url,
        user_id: user?.id,
        agent_name: user?.name || 'N/A',
        agent_phone: propForm.agent_phone || user?.phone || 'N/A',
        agent_email: user?.email || 'N/A',
        agent_address: propForm.agent_address || user?.address || propForm.location || 'N/A'
      };

      const res = await fetch('https://falcon-project-backend.vercel.app/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowAddModal(false);
        setPropForm({ title: '', property_type: 'Residential', price: '', location: '', description: '', image_url: '', agent_phone: '', agent_address: '' });
        fetchAllProperties();
        if (user?.id) fetchUserProperties(user.id);
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.error || 'Server error'}`);
      }
    } catch (err) {
      alert(`Network Error: ${err.message}`);
    }
  };

  const handleOpenEditModal = (property) => {
    setEditingPropertyId(property.id);
    setPropForm({
      title: property.title || '',
      property_type: property.property_type || 'Residential',
      price: property.price || '',
      location: property.location || '',
      description: property.description || '',
      image_url: property.image_url || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateProperty = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: propForm.title,
        property_type: propForm.property_type,
        price: propForm.price,
        location: propForm.location,
        description: propForm.description,
        image_url: propForm.image_url,
        agent_name: user?.name || 'N/A',
        agent_phone: user?.phone || 'N/A',
        agent_email: user?.email || 'N/A',
        agent_address: user?.address || propForm.location || 'N/A'
      };

      const res = await fetch(`https://falcon-project-backend.vercel.app/api/properties/${editingPropertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowEditModal(false);
        setEditingPropertyId(null);
        setPropForm({ title: '', property_type: 'Residential', price: '', location: '', description: '', image_url: '' });
        fetchAllProperties();
        if (user?.id) fetchUserProperties(user.id);
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.error || 'Failed to update'}`);
      }
    } catch (err) {
      alert(`Network Error: ${err.message}`);
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;

    try {
      const res = await fetch(`https://falcon-project-backend.vercel.app/api/properties/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchAllProperties();
        if (user?.id) fetchUserProperties(user.id);
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.error || 'Failed to delete'}`);
      }
    } catch (err) {
      alert(`Network Error: ${err.message}`);
    }
  };

  const totalPortfolioValue = userProperties.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const avgPrice = userProperties.length ? Math.round(totalPortfolioValue / userProperties.length) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      
      {/* NAVBAR */}
      <header className="bg-white border-b border-slate-200 py-3 px-4 sm:px-10 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* LOGO */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}>
            <img 
              src="/logo.png" 
              alt="Falcon Consultants Logo" 
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-md" 
            />
            <div>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight block leading-none">FALCON</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-sky-600 tracking-wider">CONSULTANTS</span>
            </div>
          </div>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-7">
            <button onClick={() => setActiveTab('home')} className={`bg-transparent border-none font-medium cursor-pointer text-sm transition-colors ${activeTab === 'home' ? 'font-bold text-sky-600' : 'text-slate-600 hover:text-slate-900'}`}>Home</button>
            <button onClick={() => setActiveTab('about')} className={`bg-transparent border-none font-medium cursor-pointer text-sm transition-colors ${activeTab === 'about' ? 'font-bold text-sky-600' : 'text-slate-600 hover:text-slate-900'}`}>About Us</button>
            <button onClick={() => setActiveTab('contact')} className={`bg-transparent border-none font-medium cursor-pointer text-sm transition-colors ${activeTab === 'contact' ? 'font-bold text-sky-600' : 'text-slate-600 hover:text-slate-900'}`}>Contact</button>
            {user && (
              <button onClick={() => setActiveTab('dashboard')} className={`bg-transparent border-none font-medium cursor-pointer text-sm flex items-center gap-1.5 transition-colors ${activeTab === 'dashboard' ? 'font-bold text-sky-600' : 'text-slate-600 hover:text-slate-900'}`}>
                <LayoutDashboard size={16} /> Dashboard
              </button>
            )}
          </nav>

          {/* DESKTOP RIGHT ACTIONS */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5 bg-slate-100 py-1.5 px-3.5 rounded-full">
                <User size={14} className="text-slate-600" />
                <span className="text-xs font-semibold text-slate-700">{user.name}</span>
                <button onClick={handleLogout} className="border-none bg-transparent text-rose-500 cursor-pointer flex items-center hover:text-rose-700" title="Logout">
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="bg-transparent border border-slate-300 text-slate-900 py-2 px-4 rounded-lg font-semibold text-xs sm:text-sm cursor-pointer hover:bg-slate-50">
                Sign In
              </button>
            )}

            <button onClick={() => { 
              setPropForm({ title: '', property_type: 'Residential', price: '', location: '', description: '', image_url: '' });
              user ? setShowAddModal(true) : setShowAuthModal(true); 
            }} className="bg-sky-600 text-white border-none py-2 px-4 rounded-lg font-semibold text-xs sm:text-sm cursor-pointer flex items-center gap-1.5 shadow-sm hover:bg-sky-700">
              <Plus size={16} /> Post Listing
            </button>
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-700 hover:text-sky-600 focus:outline-none">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>

        {/* MOBILE DROPDOWN MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl px-4 py-4 flex flex-col gap-3">
            <button onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }} className={`text-left py-2 px-3 rounded-lg font-medium text-sm ${activeTab === 'home' ? 'bg-sky-50 text-sky-600 font-bold' : 'text-slate-700'}`}>Home</button>
            <button onClick={() => { setActiveTab('about'); setMobileMenuOpen(false); }} className={`text-left py-2 px-3 rounded-lg font-medium text-sm ${activeTab === 'about' ? 'bg-sky-50 text-sky-600 font-bold' : 'text-slate-700'}`}>About Us</button>
            <button onClick={() => { setActiveTab('contact'); setMobileMenuOpen(false); }} className={`text-left py-2 px-3 rounded-lg font-medium text-sm ${activeTab === 'contact' ? 'bg-sky-50 text-sky-600 font-bold' : 'text-slate-700'}`}>Contact</button>
            {user && (
              <button onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} className={`text-left py-2 px-3 rounded-lg font-medium text-sm flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-sky-50 text-sky-600 font-bold' : 'text-slate-700'}`}>
                <LayoutDashboard size={16} /> Dashboard
              </button>
            )}
            
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <div className="flex items-center justify-between bg-slate-100 py-2.5 px-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-600" />
                    <span className="text-xs font-semibold text-slate-700">{user.name}</span>
                  </div>
                  <button onClick={handleLogout} className="border-none bg-transparent text-rose-500 font-semibold text-xs flex items-center gap-1 cursor-pointer">
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              ) : (
                <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); setMobileMenuOpen(false); }} className="w-full bg-slate-100 text-slate-900 py-2.5 rounded-lg font-semibold text-sm cursor-pointer text-center">
                  Sign In
                </button>
              )}

              <button onClick={() => { 
                setPropForm({ title: '', property_type: 'Residential', price: '', location: '', description: '', image_url: '' });
                user ? setShowAddModal(true) : setShowAuthModal(true);
                setMobileMenuOpen(false);
              }} className="w-full bg-sky-600 text-white py-2.5 rounded-lg font-semibold text-sm cursor-pointer flex items-center justify-center gap-1.5 shadow-sm">
                <Plus size={16} /> Post Listing
              </button>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1">

        {/* HOME PAGE */}
        {activeTab === 'home' && (
          <div>
            <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-12 sm:py-20 px-4 text-center">
              <div className="max-w-2xl mx-auto">
                <span className="bg-white/10 text-sky-400 py-1.5 px-3.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider">Real Estate Marketplace</span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-4 mb-3 tracking-tight">Find Your Dream Property</h1>
                <p className="text-slate-400 text-sm sm:text-base mb-8">Explore properties listed directly by trusted agents and sellers.</p>
                
                <div className="bg-white rounded-xl p-2 flex items-center shadow-2xl max-w-lg mx-auto">
                  <Search size={20} className="text-slate-400 ml-2.5 flex-shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Search city, location, or title..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-2.5 px-3 border-none outline-none text-sm sm:text-base text-slate-900 bg-transparent"
                  />
                </div>
              </div>
            </section>

            <main className="max-w-7xl mx-auto my-8 sm:my-12 px-4 sm:px-6">
              <h2 className="text-xl sm:text-2xl font-extrabold mb-6 text-slate-900">Recent Listings</h2>
              
              <PropertyList 
                properties={properties}
                onPropertyClick={(prop) => setSelectedProperty(prop)}
                searchTerm={searchTerm}
              />
            </main>
          </div>
        )}

        {/* ABOUT US */}
        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto my-10 sm:my-16 px-4">
            <div className="text-center mb-10 sm:mb-12">
              <span className="text-sky-600 font-bold text-xs uppercase tracking-wider">About Our Platform</span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2">Connecting Buyers Directly With Sellers</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white p-6 rounded-xl border border-slate-200 text-center shadow-xs">
                <ShieldCheck size={36} className="text-sky-600 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-bold mb-2 text-slate-900">Direct Communication</h3>
                <p className="text-slate-500 text-xs sm:text-sm">Buyers contact real seller directly via phone or email.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 text-center shadow-xs">
                <Users size={36} className="text-sky-600 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-bold mb-2 text-slate-900">Agent Ecosystem</h3>
                <p className="text-slate-500 text-xs sm:text-sm">Registered agents get dedicated portal access to manage listings.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 text-center shadow-xs">
                <Award size={36} className="text-sky-600 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-bold mb-2 text-slate-900">Verified Contacts</h3>
                <p className="text-slate-500 text-xs sm:text-sm">Every listing reflects the poster account's official credentials.</p>
              </div>
            </div>
          </div>
        )}

        {/* CONTACT US */}
        {activeTab === 'contact' && (
          <div className="max-w-4xl mx-auto my-10 sm:my-16 px-4">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Platform Support</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex flex-col gap-4 md:col-span-1">
                <div>
                  <strong className="text-sm text-slate-900 block mb-1">Office Address</strong>
                  <p className="m-0 text-slate-500 text-xs sm:text-sm leading-relaxed">Raahim Emporium, Block G, Fazaia Housing Scheme, Islamabad</p>
                </div>
                <div>
                  <strong className="text-sm text-slate-900 block mb-1">Phone No.</strong>
                  <p className="m-0 text-slate-500 text-xs sm:text-sm">+92 320 0814584</p>
                </div>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); setContactForm({ name: '', email: '', message: '' }); }} className="flex flex-col gap-3.5 md:col-span-2">
                <input type="text" placeholder="Your Name" required value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} className="p-3 rounded-lg border border-slate-300 text-sm outline-none" />
                <input type="email" placeholder="Your Email" required value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} className="p-3 rounded-lg border border-slate-300 text-sm outline-none" />
                <textarea placeholder="Your Query" required rows="4" value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} className="p-3 rounded-lg border border-slate-300 text-sm outline-none"></textarea>
                <button type="submit" className="bg-sky-600 text-white border-none py-3 rounded-lg font-bold text-sm cursor-pointer hover:bg-sky-700 transition-colors">Send Message</button>
              </form>
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {user && activeTab === 'dashboard' && (
          <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
            {/* Sidebar menu on desktop, top bar on mobile */}
            <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 sm:p-6 flex md:flex-col gap-2">
              <div onClick={() => setDashboardSubTab('overview')} className={`flex-1 md:flex-none p-3 rounded-lg font-bold cursor-pointer flex items-center justify-center md:justify-start gap-2.5 text-xs sm:text-sm ${dashboardSubTab === 'overview' ? 'bg-sky-50 text-sky-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                <LayoutDashboard size={18} /> <span className="hidden sm:inline">Portfolio</span> Overview
              </div>
              <div onClick={() => setDashboardSubTab('listings')} className={`flex-1 md:flex-none p-3 rounded-lg font-bold cursor-pointer flex items-center justify-center md:justify-start gap-2.5 text-xs sm:text-sm ${dashboardSubTab === 'listings' ? 'bg-sky-50 text-sky-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                <Building2 size={18} /> My Listings ({userProperties.length})
              </div>
            </aside>

            <main className="flex-1 p-4 sm:p-8 max-w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold m-0 text-slate-900">Agent Dashboard</h1>
                  <p className="text-slate-500 text-xs sm:text-sm m-1">Welcome, {user.name}. Manage your account listings.</p>
                </div>
                <button onClick={() => { setPropForm({ title: '', property_type: 'Residential', price: '', location: '', description: '', image_url: '' }); setShowAddModal(true); }} className="w-full sm:w-auto bg-sky-600 text-white border-none py-2.5 px-4 rounded-lg font-semibold text-sm cursor-pointer flex items-center justify-center gap-2 shadow-xs hover:bg-sky-700">
                  <Plus size={16} /> Add Property
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 overflow-hidden">
                <h3 className="text-base font-bold mb-4 text-slate-900">Active Properties</h3>
                {userProperties.length === 0 ? (
                  <p className="text-slate-400 text-sm py-6 text-center">No properties uploaded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs sm:text-sm min-w-[600px]">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 text-[11px] uppercase tracking-wider">
                          <th className="p-3">Title</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Location</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userProperties.map((p) => (
                          <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-900">{p.title}</td>
                            <td className="p-3"><span className="bg-slate-100 py-1 px-2 rounded text-xs font-medium text-slate-700">{p.property_type || 'Residential'}</span></td>
                            <td className="p-3 font-bold text-sky-600">PKR {Number(p.price || 0).toLocaleString()}</td>
                            <td className="p-3 text-slate-500">{p.location}</td>
                            <td className="p-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button onClick={() => handleOpenEditModal(p)} className="border-none bg-sky-50 text-sky-600 py-1.5 px-2.5 rounded-md cursor-pointer flex items-center gap-1 text-xs font-semibold hover:bg-sky-100">
                                  <Pencil size={13} /> Edit
                                </button>
                                <button onClick={() => handleDeleteProperty(p.id)} className="border-none bg-rose-50 text-rose-500 py-1.5 px-2.5 rounded-md cursor-pointer flex items-center gap-1 text-xs font-semibold hover:bg-rose-100">
                                  <Trash2 size={13} /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </main>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <Footer setActiveTab={setActiveTab} />

      {/* PROPERTY DETAILS MODAL */}
      {selectedProperty && (
        <AgentContactModal 
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative my-auto">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 border-none bg-transparent cursor-pointer text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h2 className="text-lg sm:text-xl font-extrabold m-0 mb-1 text-slate-900">{authMode === 'login' ? 'Welcome Back' : 'Register as Agent'}</h2>
            
            {authError && <div className="bg-rose-50 text-rose-500 p-2.5 rounded-lg text-xs mb-4">{authError}</div>}

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3">
              {authMode === 'register' && (
                <>
                  <input type="text" placeholder="Full Name" required value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} className="p-2.5 rounded-lg border border-slate-300 text-sm outline-none" />
                  <input type="text" placeholder="Phone Number" required value={authForm.phone} onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })} className="p-2.5 rounded-lg border border-slate-300 text-sm outline-none" />
                  <input type="text" placeholder="Office Address" required value={authForm.address} onChange={(e) => setAuthForm({ ...authForm, address: e.target.value })} className="p-2.5 rounded-lg border border-slate-300 text-sm outline-none" />
                </>
              )}
              <input type="email" placeholder="Email Address" required value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} className="p-2.5 rounded-lg border border-slate-300 text-sm outline-none" />
              <input type="password" placeholder="Password" required value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} className="p-2.5 rounded-lg border border-slate-300 text-sm outline-none" />
              <button type="submit" className="bg-sky-600 text-white border-none py-3 rounded-lg font-bold text-sm cursor-pointer mt-1 hover:bg-sky-700 transition-colors">
                {authMode === 'login' ? 'Sign In' : 'Register Account'}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-4">
              {authMode === 'login' ? "Don't have an account? " : "Already registered? "}
              <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className="border-none bg-transparent text-sky-600 font-bold cursor-pointer">
                {authMode === 'login' ? 'Register' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* POST / EDIT MODAL */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
            <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="absolute top-4 right-4 border-none bg-transparent cursor-pointer text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h2 className="text-lg sm:text-xl font-extrabold m-0 mb-4 text-slate-900">{showEditModal ? 'Edit Property Listing' : 'Post New Property'}</h2>

            <form onSubmit={showEditModal ? handleUpdateProperty : handlePostProperty} className="flex flex-col gap-3">
              <input type="text" placeholder="Property Title (e.g., 5 Marla House)" required value={propForm.title} onChange={(e) => setPropForm({ ...propForm, title: e.target.value })} className="p-2.5 rounded-lg border border-slate-300 text-sm outline-none" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select value={propForm.property_type} onChange={(e) => setPropForm({ ...propForm, property_type: e.target.value })} className="p-2.5 rounded-lg border border-slate-300 text-sm bg-white outline-none">
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Plot">Plot / Land</option>
                </select>
                <input type="number" placeholder="Price (PKR)" required value={propForm.price} onChange={(e) => setPropForm({ ...propForm, price: e.target.value })} className="p-2.5 rounded-lg border border-slate-300 text-sm outline-none" />
              </div>
              <input type="text" placeholder="Location / Address" required value={propForm.location} onChange={(e) => setPropForm({ ...propForm, location: e.target.value })} className="p-2.5 rounded-lg border border-slate-300 text-sm outline-none" />
              <textarea placeholder="Property Description..." rows="3" value={propForm.description} onChange={(e) => setPropForm({ ...propForm, description: e.target.value })} className="p-2.5 rounded-lg border border-slate-300 text-sm outline-none"></textarea>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">PROPERTY IMAGE</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="text" placeholder="Image URL (Optional)" value={propForm.image_url} onChange={(e) => setPropForm({ ...propForm, image_url: e.target.value })} className="flex-1 p-2.5 rounded-lg border border-slate-300 text-sm outline-none" />
                  <label className="bg-slate-100 border border-slate-300 rounded-lg py-2.5 px-3.5 flex items-center justify-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600 hover:bg-slate-200">
                    <Upload size={15} /> Upload
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">📞 AGENT CONTACT INFORMATION</label>
                <input type="tel" placeholder="Agent Phone Number (e.g., +92 321 1234567)" value={propForm.agent_phone} onChange={(e) => setPropForm({ ...propForm, agent_phone: e.target.value })} className="w-full p-2.5 rounded-lg border border-slate-300 text-sm outline-none mb-2.5 bg-white" />
                <input type="text" placeholder="Agent Office Address" value={propForm.agent_address} onChange={(e) => setPropForm({ ...propForm, agent_address: e.target.value })} className="w-full p-2.5 rounded-lg border border-slate-300 text-sm outline-none bg-white" />
              </div>

              <button type="submit" className="bg-sky-600 text-white border-none py-3 rounded-lg font-bold text-sm cursor-pointer mt-2 hover:bg-sky-700 transition-colors">
                {showEditModal ? 'Update Listing' : 'Publish Property'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}