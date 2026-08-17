import React from 'react';
import { X, Phone, Mail } from 'lucide-react';

const AgentContactModal = ({ property, onClose }) => {
  if (!property) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      backgroundColor: 'rgba(15, 23, 42, 0.6)', 
      backdropFilter: 'blur(4px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 100, 
      padding: '20px' 
    }}>
      <div style={{ 
        backgroundColor: '#fff', 
        borderRadius: '16px', 
        maxWidth: '550px', 
        width: '100%', 
        overflow: 'hidden', 
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', 
        position: 'relative', 
        maxHeight: '90vh', 
        overflowY: 'auto' 
      }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', 
            top: '12px', 
            right: '12px', 
            border: 'none', 
            backgroundColor: '#fff', 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer', 
            zIndex: 10, 
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)' 
          }}
        >
          <X size={18} />
        </button>

        {/* Property Image Section */}
        <div style={{ 
          height: '220px', 
          backgroundColor: '#e2e8f0', 
          position: 'relative' 
        }}>
          <img 
            src={property.image_url && property.image_url.startsWith('data:image') ? property.image_url : (property.image_url || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80')} 
            alt={property.title} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <span style={{ 
            position: 'absolute', 
            bottom: '12px', 
            left: '12px', 
            backgroundColor: '#0284c7', 
            color: '#fff', 
            padding: '4px 10px', 
            borderRadius: '6px', 
            fontSize: '11px', 
            fontWeight: '700', 
            textTransform: 'uppercase' 
          }}>
            {property.property_type || 'Residential'}
          </span>
        </div>

        {/* Property Details Section */}
        <div style={{ padding: '24px' }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '800', 
            margin: '0 0 4px', 
            color: '#0f172a' 
          }}>
            {property.title}
          </h2>
          <p style={{ 
            fontSize: '18px', 
            fontWeight: '800', 
            color: '#0284c7', 
            margin: '0 0 12px' 
          }}>
            PKR {Number(property.price || 0).toLocaleString()}
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: '#64748b', 
            marginBottom: '20px', 
            lineHeight: '1.5' 
          }}>
            {property.description || 'No description provided.'}
          </p>
          
          {/* Agent/Seller Contact Details Card */}
          <div style={{ 
            backgroundColor: '#f0f9ff', 
            border: '1px solid #bae6fd', 
            borderRadius: '12px', 
            padding: '16px' 
          }}>
            <h4 style={{ 
              fontSize: '12px', 
              fontWeight: '800', 
              color: '#0369a1', 
              textTransform: 'uppercase', 
              margin: '0 0 12px' 
            }}>
              CONTACT AGENT / SELLER
            </h4>
            
            {/* Agent Info Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '12px', 
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              <div>
                <span style={{ 
                  color: '#64748b', 
                  display: 'block', 
                  fontSize: '11px', 
                  fontWeight: '700',
                  marginBottom: '4px'
                }}>
                  AGENT NAME
                </span>
                <strong style={{ color: '#0f172a' }}>
                  {property.agent_name || 'N/A'}
                </strong>
              </div>
              <div>
                <span style={{ 
                  color: '#64748b', 
                  display: 'block', 
                  fontSize: '11px', 
                  fontWeight: '700',
                  marginBottom: '4px'
                }}>
                  PHONE NUMBER
                </span>
                {property.agent_phone ? (
                  <a 
                    href={`tel:${property.agent_phone}`} 
                    style={{ 
                      color: '#0284c7', 
                      textDecoration: 'none', 
                      fontWeight: '700',
                      display: 'block'
                    }}
                  >
                    {property.agent_phone}
                  </a>
                ) : (
                  <span style={{ color: '#0f172a', fontWeight: '600' }}>N/A</span>
                )}
              </div>
              <div>
                <span style={{ 
                  color: '#64748b', 
                  display: 'block', 
                  fontSize: '11px', 
                  fontWeight: '700',
                  marginBottom: '4px'
                }}>
                  EMAIL ADDRESS
                </span>
                {property.agent_email ? (
                  <a 
                    href={`mailto:${property.agent_email}`} 
                    style={{ 
                      color: '#0284c7', 
                      textDecoration: 'none', 
                      fontWeight: '700', 
                      wordBreak: 'break-all',
                      display: 'block',
                      fontSize: '12px'
                    }}
                  >
                    {property.agent_email}
                  </a>
                ) : (
                  <span style={{ color: '#0f172a', fontWeight: '600' }}>N/A</span>
                )}
              </div>
              <div>
                <span style={{ 
                  color: '#64748b', 
                  display: 'block', 
                  fontSize: '11px', 
                  fontWeight: '700',
                  marginBottom: '4px'
                }}>
                  OFFICE / LOCATION
                </span>
                <span style={{ color: '#0f172a', fontWeight: '600' }}>
                  {property.agent_address || property.location || 'N/A'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '10px' 
            }}>
              <a 
                href={property.agent_phone ? `tel:${property.agent_phone}` : '#'}
                style={{ 
                  backgroundColor: '#0284c7', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '10px', 
                  borderRadius: '8px', 
                  fontWeight: '700', 
                  fontSize: '13px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '6px', 
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = '#0369a1'; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = '#0284c7'; }}
              >
                <Phone size={15} /> Call Agent
              </a>
              <a 
                href={property.agent_email ? `mailto:${property.agent_email}` : '#'}
                style={{ 
                  backgroundColor: '#0f172a', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '10px', 
                  borderRadius: '8px', 
                  fontWeight: '700', 
                  fontSize: '13px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '6px', 
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = '#1e293b'; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = '#0f172a'; }}
              >
                <Mail size={15} /> Send Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentContactModal;