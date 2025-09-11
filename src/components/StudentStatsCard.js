import React from 'react';
import { AppConstants } from '../utils/constants';

const StudentStatsCard = ({ title, value, icon, color }) => {
  return (
    <div style={{
      padding: '20px',
      background: AppConstants.colors.cardBg,
      borderRadius: '16px',
      border: `1px solid ${color}33`,
      boxShadow: `0 2px 8px ${color}1A`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      minHeight: '140px'
    }}>
      {/* Icono */}
      <div style={{
        width: '40px',
        height: '40px',
        background: `${color}26`,
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px'
      }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
      </div>
      
      {/* Valor principal */}
      <div style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: AppConstants.colors.textPrimary,
        marginBottom: '4px'
      }}>
        {value}
      </div>
      
      {/* Título */}
      <div style={{
        fontSize: '0.875rem',
        color: AppConstants.colors.greyLight,
        fontWeight: '500'
      }}>
        {title}
      </div>
    </div>
  );
};

export default StudentStatsCard;
