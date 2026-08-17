import React from 'react';
import { MapPin } from 'lucide-react';

const PropertyList = ({ properties, onPropertyClick, searchTerm = '' }) => {
  const filteredProperties = properties.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredProperties.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
        <p style={{ fontSize: '16px' }}>No properties found matching your search.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
      {filteredProperties.map((prop) => (
        <div 
          key={prop.id}
          style={{ 
            backgroundColor: '#fff', 
            borderRadius: '14px', 
            overflow: 'hidden', 
            border: '1px solid #e2e8f0', 
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', 
            cursor: 'pointer', 
            transition: 'transform 0.2s, box-shadow 0.2s',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 24px -1px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.03)';
          }}
        >
          
          {/* Image Section */}
          <div style={{ position: 'relative', height: '180px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
            <img 
              src={prop.image_url && prop.image_url.startsWith('data:image') ? prop.image_url : (prop.image_url || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80')} 
              alt={prop.title} 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                transition: 'transform 0.3s'
              }}
              onError={(e) => { 
                e.target.onerror = null; 
                e.target.src = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'; 
              }}
              onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; }}
              onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
            />
            <span style={{ 
              position: 'absolute', 
              top: '12px', 
              left: '12px', 
              backgroundColor: 'rgba(15, 23, 42, 0.8)', 
              backdropFilter: 'blur(4px)', 
              color: '#fff', 
              padding: '4px 10px', 
              borderRadius: '6px', 
              fontSize: '11px', 
              fontWeight: '700', 
              textTransform: 'uppercase' 
            }}>
              {prop.property_type || 'Residential'}
            </span>
          </div>

          {/* Content Section */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <p style={{ fontSize: '20px', fontWeight: '800', color: '#0284c7', margin: '0 0 6px' }}>
              PKR {Number(prop.price || 0).toLocaleString()}
            </p>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '700', 
              margin: '0 0 10px', 
              color: '#0f172a', 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}>
              {prop.title}
            </h3>
            <p style={{ 
              fontSize: '13px', 
              color: '#64748b', 
              margin: '0 0 16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              flex: 1
            }}>
              <MapPin size={14} style={{ color: '#0284c7', flexShrink: 0 }} /> 
              {prop.location}
            </p>

            {/* Browse Properties Button */}
            <button
              onClick={() => onPropertyClick(prop)}
              style={{
                backgroundColor: '#0284c7',
                color: '#fff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                width: '100%'
              }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#0369a1'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = '#0284c7'; }}
            >
              Browse & View Agent Info
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PropertyList;
