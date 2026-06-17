import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Plus, Send, Bell, Users, Info, AlertTriangle, CheckCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const TIPOS_NOTIF = [
  { value: 'general', label: 'General', icon: <Bell size={14} />, color: '#0c5460', bg: '#D1ECF1' },
  { value: 'info', label: 'Informativa', icon: <Info size={14} />, color: '#004085', bg: '#CCE5FF' },
  { value: 'alerta', label: 'Alerta', icon: <AlertTriangle size={14} />, color: '#856404', bg: '#FFF3CD' },
  { value: 'aviso', label: 'Aviso', icon: <CheckCircle size={14} />, color: '#155724', bg: '#D4EDDA' },
];

const ROLES_DESTINO = [
  { value: '', label: 'Todos (global)' },
  { value: '2', label: 'Ciudadanos' },
  { value: '3', label: 'Maquinarias' },
  { value: '4', label: 'Operadores' },
  { value: '8', label: 'Empresas' },
];

const NotificacionesPanel = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titulo: '', mensaje: '', tipo: 'general', rol_id: '' });
  const [saving, setSaving] = useState(false);
  const [filtro, setFiltro] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const url = filtro ? `${API}/notificaciones?tipo=${filtro}` : `${API}/notificaciones`;
      const res = await axios.get(url, { headers: headers() });
      setNotificaciones(res.data);
      setError('');
    } catch (err) { setError('Error al cargar notificaciones'); }
    finally { setLoading(false); }
  }, [filtro]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.mensaje.trim()) return setError('Título y mensaje son obligatorios');
    setSaving(true); setError('');
    try {
      await axios.post(`${API}/notificaciones`, {
        titulo: form.titulo.trim(),
        mensaje: form.mensaje.trim(),
        tipo: form.tipo,
        rol_id: form.rol_id || null,
      }, { headers: headers() });
      setSuccess('Notificación enviada correctamente');
      setForm({ titulo: '', mensaje: '', tipo: 'general', rol_id: '' });
      setShowForm(false);
      loadData();
    } catch (err) { setError(err?.response?.data?.message || 'Error al enviar'); }
    finally { setSaving(false); }
  };

  return (
    <div className="crud-container">
      <div className="crud-header">
        <h3>Panel de Notificaciones</h3>
        <button className="crud-btn-primary" onClick={() => { setShowForm(true); setError(''); setSuccess(''); }}>
          <Plus size={18} /> Nueva Notificación
        </button>
      </div>

      {success && <p className="crud-success">{success}</p>}
      {error && <p className="crud-error">{error}</p>}

      {showForm && (
        <form className="crud-form" onSubmit={handleSend}>
          <h4><Send size={16} /> Enviar Notificación</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <div className="field-group"><label>Título *</label><input className="crud-input" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} required /></div>
            <div className="field-group"><label>Tipo</label>
              <select className="crud-input" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                {TIPOS_NOTIF.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select></div>
            <div className="field-group"><label>Destino (rol)</label>
              <select className="crud-input" value={form.rol_id} onChange={e => setForm({ ...form, rol_id: e.target.value })}>
                {ROLES_DESTINO.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select></div>
            <div className="field-group" style={{ gridColumn: '1 / -1' }}><label>Mensaje *</label>
              <textarea className="crud-input" rows={3} value={form.mensaje} onChange={e => setForm({ ...form, mensaje: e.target.value })} required /></div>
          </div>
          <div className="crud-form-actions">
            <button type="submit" className="crud-btn-primary" disabled={saving}><Send size={16} /> {saving ? 'Enviando...' : 'Enviar'}</button>
            <button type="button" className="crud-btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button className={`crud-btn-sm ${!filtro ? 'crud-btn-primary' : 'crud-btn-secondary'}`} onClick={() => setFiltro('')}>Todas</button>
        {TIPOS_NOTIF.map(t => (
          <button key={t.value} className={`crud-btn-sm ${filtro === t.value ? 'crud-btn-primary' : 'crud-btn-secondary'}`} onClick={() => setFiltro(t.value)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="crud-table-wrap">
        <table className="crud-table">
          <thead><tr><th>#</th><th>Título</th><th>Tipo</th><th>Mensaje</th><th>Destino</th><th>Leído</th><th>Fecha</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>Cargando...</td></tr>
            ) : notificaciones.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No hay notificaciones.</td></tr>
            ) : notificaciones.map(n => {
              const tipoInfo = TIPOS_NOTIF.find(t => t.value === n.tipo) || TIPOS_NOTIF[0];
              return (
                <tr key={n.id}>
                  <td>{n.id}</td>
                  <td className="crud-td-strong">{n.titulo}</td>
                  <td><span style={{ background: tipoInfo.bg, color: tipoInfo.color, padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>{tipoInfo.icon} {tipoInfo.label}</span></td>
                  <td style={{ fontSize: 12, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.mensaje}</td>
                  <td style={{ fontSize: 11 }}>{n.rol_id ? `Rol #${n.rol_id}` : n.usuario_id ? `Usuario #${n.usuario_id}` : 'Global'}</td>
                  <td>{n.leido ? <span style={{ color: '#155724', fontSize: 11 }}>Leído</span> : <span style={{ color: '#856404', fontWeight: 600, fontSize: 11 }}>No leído</span>}</td>
                  <td className="crud-td-date">{n.creado_en ? n.creado_en.slice(0, 10) : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificacionesPanel;
