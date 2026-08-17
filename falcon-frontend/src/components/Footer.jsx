import React from 'react';
import { MapPin, Mail, Phone, Share2, MessageCircle, Heart } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  const handleNavigate = (tabName) => {
    // 1. First, scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 2. If setActiveTab prop exists, use it directly
    if (setActiveTab) {
      setActiveTab(tabName);
    }

    // 3. Dispatch custom event for state listeners
    window.dispatchEvent(new CustomEvent('changeTab', { detail: tabName }));

    // 4. Fallback: Programmatically click navbar elements
    const navButtons = Array.from(document.querySelectorAll('button, a'));
    const targetBtn = navButtons.find(btn => 
      btn.textContent.trim().toLowerCase() === tabName.toLowerCase()
    );
    if (targetBtn) {
      targetBtn.click();
    }
  };

  return (
    <footer style={{ backgroundColor: '#0f172a', color: '#e2e8f0', marginTop: 'auto' }}>
      {/* Main Footer Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '50px 24px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
        
        {/* Brand Section */}
        <div>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', cursor: 'pointer' }}
            onClick={() => handleNavigate('home')}
          >
            <img 
              src="/logo.png" 
              alt="Falcon Consultants Logo" 
              style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '6px' }} 
            />
            <div>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1' }}>FALCON</span>
              <span style={{ fontSize: '9px', fontWeight: '700', color: '#0284c7', letterSpacing: '1.2px' }}>CONSULTANTS</span>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
            Your trusted real estate marketplace connecting buyers directly with verified agents and sellers.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Links</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => handleNavigate('home')} 
              style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', fontSize: '13px', color: '#94a3b8', transition: 'color 0.2s', cursor: 'pointer' }} 
              onMouseEnter={(e) => e.target.style.color = '#0284c7'} 
              onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
            >
              Home
            </button>
            <button 
              onClick={() => handleNavigate('home')} 
              style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', fontSize: '13px', color: '#94a3b8', transition: 'color 0.2s', cursor: 'pointer' }} 
              onMouseEnter={(e) => e.target.style.color = '#0284c7'} 
              onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
            >
              Browse Properties
            </button>
            <button 
              onClick={() => handleNavigate('contact')} 
              style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', fontSize: '13px', color: '#94a3b8', transition: 'color 0.2s', cursor: 'pointer' }} 
              onMouseEnter={(e) => e.target.style.color = '#0284c7'} 
              onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
            >
              Contact Us
            </button>
            <button 
              onClick={() => handleNavigate('dashboard')} 
              style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', fontSize: '13px', color: '#94a3b8', transition: 'color 0.2s', cursor: 'pointer' }} 
              onMouseEnter={(e) => e.target.style.color = '#0284c7'} 
              onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
            >
              Agent Dashboard
            </button>
          </div>
        </div>

        {/* Company Info */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => handleNavigate('about')} 
              style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', fontSize: '13px', color: '#94a3b8', transition: 'color 0.2s', cursor: 'pointer' }} 
              onMouseEnter={(e) => e.target.style.color = '#0284c7'} 
              onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
            >
              About Us
            </button>
            <button 
              onClick={() => handleNavigate('about')} 
              style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', fontSize: '13px', color: '#94a3b8', transition: 'color 0.2s', cursor: 'pointer' }} 
              onMouseEnter={(e) => e.target.style.color = '#0284c7'} 
              onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
            >
              Blog & News
            </button>
            <button 
              onClick={() => handleNavigate('about')} 
              style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', fontSize: '13px', color: '#94a3b8', transition: 'color 0.2s', cursor: 'pointer' }} 
              onMouseEnter={(e) => e.target.style.color = '#0284c7'} 
              onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
            >
              Careers
            </button>
            <button 
              onClick={() => handleNavigate('about')} 
              style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', fontSize: '13px', color: '#94a3b8', transition: 'color 0.2s', cursor: 'pointer' }} 
              onMouseEnter={(e) => e.target.style.color = '#0284c7'} 
              onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
            >
              Terms & Privacy
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Get in Touch</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <MapPin size={18} style={{ color: '#0284c7', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>OFFICE</span>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0' }}>Raahim Emporium Block G, Fazaia Housing Scheme, Islamabad</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Phone size={18} style={{ color: '#0284c7', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>PHONE</span>
                <a href="tel:+923200814584" style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'none', margin: '4px 0 0', display: 'block' }}>+92 320 0814584</a>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Mail size={18} style={{ color: '#0284c7', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>EMAIL</span>
                <a href="mailto:info@falconconsultants.com" style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'none', margin: '4px 0 0', display: 'block' }}>info@falconconsultants.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Links & Copyright */}
      <div style={{ borderTop: '1px solid #334155', padding: '24px', marginTop: '32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
            © 2024 Falcon Consultants. All rights reserved. | Powered by Falcon Real Estate Platform
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a href="#facebook" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#0284c7'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
              <Share2 size={18} />
            </a>
            <a href="#twitter" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#0284c7'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
              <MessageCircle size={18} />
            </a>
            <a href="#linkedin" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#0284c7'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
              <Heart size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}