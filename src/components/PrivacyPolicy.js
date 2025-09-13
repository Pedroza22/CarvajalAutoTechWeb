import React from 'react';
import { getColor } from '../utils/constants';

const PrivacyPolicy = ({ onBack }) => {
  const safeColor = (colorName) => getColor(colorName) || '#ffffff';

  return (
    <div style={{
      minHeight: '100vh',
      background: safeColor('background'),
      color: safeColor('textPrimary'),
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.6'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: `1px solid ${safeColor('border')}`
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: `1px solid ${safeColor('primary')}`,
            color: safeColor('primary'),
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginRight: '20px',
            fontSize: '0.9rem'
          }}
        >
          ← Volver
        </button>
        <h1 style={{
          margin: 0,
          fontSize: '1.8rem',
          color: safeColor('textPrimary')
        }}>
          Políticas de Privacidad
        </h1>
      </div>

      {/* Content */}
      <div style={{ fontSize: '0.95rem' }}>
        <p><strong>Última actualización:</strong> 13 de septiembre de 2025</p>

        <h2 style={{ color: safeColor('primary'), marginTop: '30px' }}>1. Información que Recopilamos</h2>
        <p>Recopilamos información que nos proporcionas directamente, como:</p>
        <ul>
          <li>Información de cuenta (nombre, email, tipo de usuario)</li>
          <li>Respuestas a cuestionarios y evaluaciones</li>
          <li>Datos de progreso y estadísticas de aprendizaje</li>
          <li>Comunicaciones que nos envías</li>
        </ul>

        <h2 style={{ color: safeColor('primary'), marginTop: '30px' }}>2. Cómo Utilizamos tu Información</h2>
        <p>Utilizamos tu información para:</p>
        <ul>
          <li>Proporcionar y mejorar nuestros servicios educativos</li>
          <li>Personalizar tu experiencia de aprendizaje</li>
          <li>Generar reportes de progreso y estadísticas</li>
          <li>Comunicarnos contigo sobre el servicio</li>
          <li>Cumplir con obligaciones legales</li>
        </ul>

        <h2 style={{ color: safeColor('primary'), marginTop: '30px' }}>3. Compartir Información</h2>
        <p>No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto:</p>
        <ul>
          <li>Con tu consentimiento explícito</li>
          <li>Para cumplir con la ley</li>
          <li>Con proveedores de servicios que nos ayudan a operar la plataforma</li>
        </ul>

        <h2 style={{ color: safeColor('primary'), marginTop: '30px' }}>4. Seguridad de Datos</h2>
        <p>Implementamos medidas de seguridad técnicas y organizativas para proteger tu información:</p>
        <ul>
          <li>Cifrado de datos en tránsito y en reposo</li>
          <li>Acceso restringido a información personal</li>
          <li>Monitoreo regular de seguridad</li>
          <li>Capacitación del personal en privacidad</li>
        </ul>

        <h2 style={{ color: safeColor('primary'), marginTop: '30px' }}>5. Tus Derechos</h2>
        <p>Tienes derecho a:</p>
        <ul>
          <li>Acceder a tu información personal</li>
          <li>Corregir información inexacta</li>
          <li>Eliminar tu cuenta y datos</li>
          <li>Portabilidad de datos</li>
          <li>Oponerte al procesamiento</li>
          <li>Retirar tu consentimiento</li>
        </ul>

        <h2 style={{ color: safeColor('primary'), marginTop: '30px' }}>6. Retención de Datos</h2>
        <p>Conservamos tu información personal solo durante el tiempo necesario para:</p>
        <ul>
          <li>Proporcionar nuestros servicios</li>
          <li>Cumplir con obligaciones legales</li>
          <li>Resolver disputas</li>
          <li>Hacer cumplir nuestros acuerdos</li>
        </ul>

        <h2 style={{ color: safeColor('primary'), marginTop: '30px' }}>7. Cookies y Tecnologías Similares</h2>
        <p>Utilizamos cookies y tecnologías similares para:</p>
        <ul>
          <li>Mantener tu sesión activa</li>
          <li>Recordar tus preferencias</li>
          <li>Analizar el uso de la plataforma</li>
          <li>Mejorar la funcionalidad</li>
        </ul>

        <h2 style={{ color: safeColor('primary'), marginTop: '30px' }}>8. Contacto</h2>
        <p>Para preguntas sobre esta política de privacidad:</p>
        <ul>
          <li><strong>Email:</strong> privacidad@carvajalautotech.com</li>
          <li><strong>Dirección:</strong> [Dirección de la empresa]</li>
          <li><strong>Teléfono:</strong> [Número de contacto]</li>
        </ul>
        
        <p><strong>Tiempo de respuesta:</strong> Respondemos dentro de 48 horas y resolvemos completamente dentro de 30 días.</p>

        <h2 style={{ color: safeColor('primary'), marginTop: '30px' }}>9. Cumplimiento Legal</h2>
        <p>Esta política cumple con:</p>
        <ul>
          <li><strong>GDPR</strong> (Reglamento General de Protección de Datos)</li>
          <li><strong>CCPA</strong> (Ley de Privacidad del Consumidor de California)</li>
          <li><strong>Ley de Protección de Datos</strong> de Colombia</li>
          <li><strong>Otras regulaciones</strong> aplicables según la jurisdicción</li>
        </ul>

        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: safeColor('dark'),
          borderRadius: '8px',
          border: `1px solid ${safeColor('border')}`
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: safeColor('textSecondary') }}>
            <strong>Nota:</strong> Esta política de privacidad es efectiva a partir del 13 de septiembre de 2025 y se aplica a todos los usuarios de la aplicación CarvajalAutoTech.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
