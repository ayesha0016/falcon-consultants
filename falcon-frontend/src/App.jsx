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
  Trash2
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
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('home');
  const [dashboardSubTab, setDashboardSubTab] = useState('overview');
  
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
      const res = await fetch('http://127.0.0.1:5000/api/properties');
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
      const res = await fetch(`http://127.0.0.1:5000/api/user/properties/${userId}`);
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
      const res = await fetch(`http://127.0.0.1:5000${endpoint}`, {
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
  };

  const handlePostProperty = async (e) => {
    e.preventDefault();
    try {
      console.log('📋 User object before posting property:', user);
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
      console.log('📤 Payload being sent to backend:', payload);

      const res = await fetch('http://127.0.0.1:5000/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        console.log('✅ Property posted successfully');
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

      const res = await fetch(`http://127.0.0.1:5000/api/properties/${editingPropertyId}`, {
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
      const res = await fetch(`http://127.0.0.1:5000/api/properties/${id}`, {
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", display: 'flex', flexDirection: 'column' }}>
      
      {/* NAVBAR */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 40px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
            {/* NAVBAR LOGO BRANDING */}
<div style={{ display: 'flex', alignItems: 'center', gap: '0px', cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
  
  {/* REPLACED ICON WITH YOUR IMAGE */}
  <img 
    src="/logo.png" 
    alt="Falcon Consultants Logo" 
    style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '6px' }} 
  />

  <div>
    <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px', display: 'block', lineHeight: '1' }}>FALCON</span>
    <span style={{ fontSize: '10px', fontWeight: '700', color: '#0284c7', letterSpacing: '1.2px' }}>CONSULTANTS</span>
  </div>
</div>
            
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', fontWeight: activeTab === 'home' ? '700' : '500', color: activeTab === 'home' ? '#0284c7' : '#475569', cursor: 'pointer', fontSize: '14px' }}>Home</button>
            <button onClick={() => setActiveTab('about')} style={{ background: 'none', border: 'none', fontWeight: activeTab === 'about' ? '700' : '500', color: activeTab === 'about' ? '#0284c7' : '#475569', cursor: 'pointer', fontSize: '14px' }}>About Us</button>
            <button onClick={() => setActiveTab('contact')} style={{ background: 'none', border: 'none', fontWeight: activeTab === 'contact' ? '700' : '500', color: activeTab === 'contact' ? '#0284c7' : '#475569', cursor: 'pointer', fontSize: '14px' }}>Contact</button>
            {user && (
              <button onClick={() => setActiveTab('dashboard')} style={{ background: 'none', border: 'none', fontWeight: activeTab === 'dashboard' ? '700' : '500', color: activeTab === 'dashboard' ? '#0284c7' : '#475569', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LayoutDashboard size={16} /> Dashboard
              </button>
            )}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f1f5f9', padding: '6px 14px', borderRadius: '30px' }}>
                <User size={14} style={{ color: '#475569' }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>{user.name}</span>
                <button onClick={handleLogout} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Logout">
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} style={{ backgroundColor: 'transparent', border: '1px solid #cbd5e1', color: '#0f172a', padding: '8px 18px', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                Sign In
              </button>
            )}

            <button onClick={() => { 
              setPropForm({ title: '', property_type: 'Residential', price: '', location: '', description: '', image_url: '' });
              user ? setShowAddModal(true) : setShowAuthModal(true); 
            }} style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)' }}>
              <Plus size={16} /> Post Listing
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div style={{ flex: 1 }}>

        {/* HOME PAGE */}
        {activeTab === 'home' && (
          <div>
            <section style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', color: '#fff', padding: '80px 20px', textAlign: 'center' }}>
              <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#38bdf8', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Real Estate Marketplace</span>
                <h1 style={{ fontSize: '42px', fontWeight: '800', marginTop: '16px', marginBottom: '12px', letterSpacing: '-0.8px' }}>Find Your Dream Property</h1>
                <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '32px' }}>Explore properties listed directly by trusted agents and sellers.</p>
                
                <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '8px', display: 'flex', alignItems: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', maxWidth: '600px', margin: '0 auto' }}>
                  <Search size={20} style={{ color: '#94a3b8', marginLeft: '12px' }} />
                  <input 
                    type="text" 
                    placeholder="Search by city, location, or property name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', border: 'none', outline: 'none', fontSize: '15px', color: '#0f172a' }}
                  />
                </div>
              </div>
            </section>

            <main style={{ maxWidth: '1200px', margin: '50px auto', padding: '0 24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '24px', color: '#0f172a' }}>Recent Listings</h2>
              
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
          <div style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span style={{ color: '#0284c7', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>About Our Platform</span>
              <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', marginTop: '8px' }}>Connecting Buyers Directly With Sellers</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <ShieldCheck size={36} style={{ color: '#0284c7', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Direct Communication</h3>
                <p style={{ color: '#64748b', fontSize: '14px' }}>Buyers contact real seller directly via phone or email.</p>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <Users size={36} style={{ color: '#0284c7', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Agent Ecosystem</h3>
                <p style={{ color: '#64748b', fontSize: '14px' }}>Registered agents get dedicated portal access to manage listings.</p>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <Award size={36} style={{ color: '#0284c7', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Verified Contacts</h3>
                <p style={{ color: '#64748b', fontSize: '14px' }}>Every listing reflects the poster account's official credentials.</p>
              </div>
            </div>
          </div>
        )}

        {/* CONTACT US */}
        {activeTab === 'contact' && (
          <div style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a' }}>Platform Support</h1>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', backgroundColor: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div><strong>Office Address</strong><p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Raahim Emporium, Block G, Fazaia Housing Scheme, Islamabad</p></div>
                <div><strong>Phone No.</strong><p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>+92 320 0814584</p></div>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); setContactForm({ name: '', email: '', message: '' }); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input type="text" placeholder="Your Name" required value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="email" placeholder="Your Email" required value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <textarea placeholder="Your Query" required rows="4" value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}></textarea>
                <button type="submit" style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Send Message</button>
              </form>
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {user && activeTab === 'dashboard' && (
          <div style={{ display: 'flex', minHeight: 'calc(100vh - 120px)' }}>
            <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div onClick={() => setDashboardSubTab('overview')} style={{ padding: '12px 16px', backgroundColor: dashboardSubTab === 'overview' ? '#f0f9ff' : 'transparent', borderRadius: '8px', color: dashboardSubTab === 'overview' ? '#0284c7' : '#64748b', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <LayoutDashboard size={18} /> Portfolio Overview
              </div>
              <div onClick={() => setDashboardSubTab('listings')} style={{ padding: '12px 16px', backgroundColor: dashboardSubTab === 'listings' ? '#f0f9ff' : 'transparent', borderRadius: '8px', color: dashboardSubTab === 'listings' ? '#0284c7' : '#64748b', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={18} /> My Listings ({userProperties.length})
              </div>
            </aside>

            <main style={{ flex: 1, padding: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Agent Dashboard</h1>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>Welcome, {user.name}. Manage your account listings.</p>
                </div>
                <button onClick={() => { setPropForm({ title: '', property_type: 'Residential', price: '', location: '', description: '', image_url: '' }); setShowAddModal(true); }} style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={16} /> Add Property
                </button>
              </div>

              <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Active Properties</h3>
                {userProperties.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '14px' }}>No properties uploaded yet.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px 16px' }}>Title</th>
                        <th style={{ padding: '12px 16px' }}>Type</th>
                        <th style={{ padding: '12px 16px' }}>Price</th>
                        <th style={{ padding: '12px 16px' }}>Location</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userProperties.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px', fontWeight: '600' }}>{p.title}</td>
                          <td style={{ padding: '16px' }}><span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{p.property_type || 'Residential'}</span></td>
                          <td style={{ padding: '16px', fontWeight: '700', color: '#0284c7' }}>PKR {Number(p.price || 0).toLocaleString()}</td>
                          <td style={{ padding: '16px', color: '#64748b' }}>{p.location}</td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                              <button onClick={() => handleOpenEditModal(p)} style={{ border: 'none', backgroundColor: '#e0f2fe', color: '#0284c7', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}>
                                <Pencil size={14} /> Edit
                              </button>
                              <button onClick={() => handleDeleteProperty(p.id)} style={{ border: 'none', backgroundColor: '#fef2f2', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}>
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </main>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <Footer setActiveTab={setActiveTab} />

      {/* 4. PROPERTY DETAILS MODAL - Using AgentContactModal Component */}
      {selectedProperty && (
        <AgentContactModal 
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', maxWidth: '420px', width: '100%', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 6px', color: '#0f172a' }}>{authMode === 'login' ? 'Welcome Back' : 'Register as Agent'}</h2>
            
            {authError && <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>{authError}</div>}

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {authMode === 'register' && (
                <>
                  <input type="text" placeholder="Full Name" required value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                  <input type="text" placeholder="Phone Number" required value={authForm.phone} onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                  <input type="text" placeholder="Office Address" required value={authForm.address} onChange={(e) => setAuthForm({ ...authForm, address: e.target.value })} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </>
              )}
              <input type="email" placeholder="Email Address" required value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
              <input type="password" placeholder="Password" required value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
              <button type="submit" style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', marginTop: '6px' }}>
                {authMode === 'login' ? 'Sign In' : 'Register Account'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '16px' }}>
              {authMode === 'login' ? "Don't have an account? " : "Already registered? "}
              <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} style={{ border: 'none', background: 'none', color: '#0284c7', fontWeight: '700', cursor: 'pointer' }}>
                {authMode === 'login' ? 'Register' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* POST / EDIT MODAL */}
      {(showAddModal || showEditModal) && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
            <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 16px', color: '#0f172a' }}>{showEditModal ? 'Edit Property Listing' : 'Post New Property'}</h2>

            <form onSubmit={showEditModal ? handleUpdateProperty : handlePostProperty} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Property Title (e.g., 5 Marla House)" required value={propForm.title} onChange={(e) => setPropForm({ ...propForm, title: e.target.value })} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <select value={propForm.property_type} onChange={(e) => setPropForm({ ...propForm, property_type: e.target.value })} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff' }}>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Plot">Plot / Land</option>
                </select>
                <input type="number" placeholder="Price (PKR)" required value={propForm.price} onChange={(e) => setPropForm({ ...propForm, price: e.target.value })} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
              </div>
              <input type="text" placeholder="Location / Address" required value={propForm.location} onChange={(e) => setPropForm({ ...propForm, location: e.target.value })} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
              <textarea placeholder="Property Description..." rows="3" value={propForm.description} onChange={(e) => setPropForm({ ...propForm, description: e.target.value })} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}></textarea>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>PROPERTY IMAGE</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="Image URL (Optional)" value={propForm.image_url} onChange={(e) => setPropForm({ ...propForm, image_url: e.target.value })} style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                  <label style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                    <Upload size={16} /> Upload
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>📞 AGENT CONTACT INFORMATION</label>
                <input type="tel" placeholder="Agent Phone Number (e.g., +92 321 1234567)" value={propForm.agent_phone} onChange={(e) => setPropForm({ ...propForm, agent_phone: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', marginBottom: '10px' }} />
                <input type="text" placeholder="Agent Office Address" value={propForm.agent_address} onChange={(e) => setPropForm({ ...propForm, agent_address: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
              </div>

              <button type="submit" style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', marginTop: '10px' }}>
                {showEditModal ? 'Update Listing' : 'Publish Property'}
              </button>
            </form>
          </div>
        </div>
      )}
      

    </div>
  );
}