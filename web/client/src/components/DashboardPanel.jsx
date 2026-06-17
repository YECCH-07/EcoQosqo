import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Truck, Users, Route, AlertTriangle, FileText, Bell, Shield, Wrench, Activity } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const DashboardPanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/dashboard`, { headers: headers() })
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="crud-loading">Cargando dashboard...</p>;
  if (!data) return <p className="crud-error">Error al cargar el dashboard.</p>;

  const cards = [
    { icon: <Truck size={24} />, label: 'Vehículos operativos', value: data.vehiculos?.operativo || 0, sub: `de ${data.vehiculos?.total || 0} totales`, color: '#155724', bg: '#D4EDDA' },
    { icon: <Users size={24} />, label: 'Personal activo', value: data.personal || 0, sub: 'registrados', color: '#004085', bg: '#CCE5FF' },
    { icon: <Route size={24} />, label: 'Rutas activas', value: data.rutas || 0, sub: 'en operación', color: '#0c5460', bg: '#D1ECF1' },
    { icon: <FileText size={24} />, label: 'Reportes pendientes', value: data.reportes || 0, sub: 'por atender', color: data.reportes > 0 ? '#721C24' : '#155724', bg: data.reportes > 0 ? '#F8D7DA' : '#D4EDDA' },
    { icon: <Shield size={24} />, label: 'Alertas SOAT (30 días)', value: data.soat || 0, sub: 'próximos o vencidos', color: data.soat > 0 ? '#856404' : '#155724', bg: data.soat > 0 ? '#FFF3CD' : '#D4EDDA' },
    { icon: <Wrench size={24} />, label: 'Alertas Rev. Técnica (30 días)', value: data.revision || 0, sub: 'próximas o vencidas', color: data.revision > 0 ? '#856404' : '#155724', bg: data.revision > 0 ? '#FFF3CD' : '#D4EDDA' },
    { icon: <Bell size={24} />, label: 'Notificaciones no leídas', value: data.notifNoLeidas || 0, sub: 'en el sistema', color: '#0c5460', bg: '#D1ECF1' },
    { icon: <Activity size={24} />, label: 'Asignaciones activas', value: data.asignaciones || 0, sub: 'equipos en ruta', color: '#155724', bg: '#D4EDDA' },
  ];

  return (
    <div className="crud-container">
      <div className="crud-header">
        <h3>Dashboard — EcoQosqo</h3>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
        {cards.map((card, i) => (
          <div key={i} style={{
            background: 'var(--surface)', borderRadius: 12, padding: 20, border: '1px solid var(--border-light)',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: card.color, background: card.bg, padding: 8, borderRadius: 8, display: 'flex' }}>{card.icon}</span>
              <span style={{ fontSize: 28, fontWeight: 800, color: card.color }}>{card.value}</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{card.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPanel;
