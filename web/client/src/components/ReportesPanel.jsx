import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Send, MapPin, AlertTriangle, CheckCircle, Clock, User, RefreshCw, MessageSquare, Eye } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const ESTADOS = [
  { value: 'todos', label: 'Todos', color: '#383D41', bg: '#E2E3E5' },
  { value: 'pendiente', label: 'Pendientes', color: '#856404', bg: '#FFF3CD' },
  { value: 'en_proceso', label: 'En Proceso', color: '#004085', bg: '#CCE5FF' },
  { value: 'atendido', label: 'Atendidos', color: '#155724', bg: '#D4EDDA' },
];

const PRIORIDAD = {
  alta: { color: '#721C24', bg: '#F8D7DA', icon: <AlertTriangle size={12} /> },
  media: { color: '#856404', bg: '#FFF3CD', icon: <Clock size={12} /> },
  baja: { color: '#004085', bg: '#CCE5FF', icon: <CheckCircle size={12} /> },
};

const ReportesPanel = () => {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [selected, setSelected] = useState(null);
  const [respuesta, setRespuesta] = useState('');
  const [sending, setSending] = useState(false);

  // Form notificación general
  const [showNotifForm, setShowNotifForm] = useState(false);
  const [notifForm, setNotifForm] = useState({ titulo: '', mensaje: '', tipo: 'general', rol_id: '' });
  const [savingNotif, setSavingNotif] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const url = filtro !== 'todos' ? `${API}/reportes?estado=${filtro}` : `${API}/reportes`;
      const res = await axios.get(url, { headers: headers() });
      setReportes(res.data);
      setError('');
    } catch (err) { setError('Error al cargar reportes'); }
    finally { setLoading(false); }
  }, [filtro]);

  useEffect(() => { loadData(); }, [loadData]);

  const openDetail = async (r) => {
    try {
      const res = await axios.get(`${API}/reportes/${r.id}`, { headers: headers() });
      setSelected(res.data);
      setRespuesta('');
      setError(''); setSuccess('');
    } catch (err) { setError('Error al cargar detalle'); }
  };

  const changeStatus = async (estado) => {
    if (!selected) return;
    try {
      await axios.patch(`${API}/reportes/${selected.id}/estado`, { estado }, { headers: headers() });
      setSuccess(`Estado cambiado a "${estado.replace('_',' ')}"`);
      setSelected({ ...selected, estado });
      loadData();
    } catch (err) { setError(err?.response?.data?.message || 'Error al cambiar estado'); }
  };

  const handleResponder = async () => {
    if (!respuesta.trim() || !selected) return;
    setSending(true); setError('');
    try {
      const res = await axios.post(`${API}/reportes/${selected.id}/responder`, { respuesta: respuesta.trim() }, { headers: headers() });
      setSuccess(`Respuesta enviada al ciudadano. Notificación #${res.data.notificacion_id} creada.`);
      setSelected({ ...selected, estado: 'atendido', respuesta: respuesta.trim() });
      setRespuesta('');
      loadData();
    } catch (err) { setError(err?.response?.data?.message || 'Error al enviar respuesta'); }
    finally { setSending(false); }
  };

  const handleSendNotif = async (e) => {
    e.preventDefault();
    if (!notifForm.titulo.trim() || !notifForm.mensaje.trim()) return;
    setSavingNotif(true); setError('');
    try {
      await axios.post(`${API}/notificaciones`, {
        titulo: notifForm.titulo.trim(), mensaje: notifForm.mensaje.trim(),
        tipo: notifForm.tipo, rol_id: notifForm.rol_id || null,
      }, { headers: headers() });
      setSuccess('Notificación enviada');
      setNotifForm({ titulo: '', mensaje: '', tipo: 'general', rol_id: '' });
      setShowNotifForm(false);
    } catch (err) { setError(err?.response?.data?.message || 'Error'); }
    finally { setSavingNotif(false); }
  };

  return (
    <div className="crud-container">
      <div className="crud-header">
        <h3>Gestión de Reportes Ciudadanos</h3>
        <button className="crud-btn-secondary" onClick={() => { setShowNotifForm(!showNotifForm); setError(''); setSuccess(''); }}>
          <Send size={16} /> {showNotifForm ? 'Cerrar' : 'Enviar Aviso General'}
        </button>
      </div>

      {success && <p className="crud-success">{success}</p>}
      {error && <p className="crud-error">{error}</p>}

      {/* Formulario de notificación general */}
      {showNotifForm && (
        <form className="crud-form" onSubmit={handleSendNotif} style={{ marginBottom: 16 }}>
          <h4>Enviar Aviso General</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <div className="field-group"><label>Título *</label><input className="crud-input" value={notifForm.titulo} onChange={e => setNotifForm({ ...notifForm, titulo: e.target.value })} /></div>
            <div className="field-group"><label>Tipo</label>
              <select className="crud-input" value={notifForm.tipo} onChange={e => setNotifForm({ ...notifForm, tipo: e.target.value })}>
                <option value="general">General</option><option value="info">Informativa</option><option value="alerta">Alerta</option><option value="aviso">Aviso</option>
              </select></div>
            <div className="field-group"><label>Destino (rol)</label>
              <select className="crud-input" value={notifForm.rol_id} onChange={e => setNotifForm({ ...notifForm, rol_id: e.target.value })}>
                <option value="">Todos</option><option value="2">Ciudadanos</option><option value="8">Empresas</option>
              </select></div>
            <div className="field-group" style={{ gridColumn: '1 / -1' }}><label>Mensaje *</label><textarea className="crud-input" rows={2} value={notifForm.mensaje} onChange={e => setNotifForm({ ...notifForm, mensaje: e.target.value })} /></div>
          </div>
          <div className="crud-form-actions">
            <button type="submit" className="crud-btn-primary" disabled={savingNotif}><Send size={14} /> {savingNotif ? 'Enviando...' : 'Enviar'}</button>
          </div>
        </form>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {ESTADOS.map(e => (
          <button key={e.value} onClick={() => { setFiltro(e.value); setSelected(null); }}
            style={{
              padding: '8px 16px', borderRadius: 8, border: filtro === e.value ? `2px solid ${e.color}` : '1px solid var(--border)',
              background: filtro === e.value ? e.bg : 'var(--surface)', color: e.color,
              fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
            {e.label} ({e.value === 'todos' ? reportes.length : reportes.filter(r => r.estado === e.value).length})
          </button>
        ))}
      </div>

      {/* Vista dividida: lista + detalle */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 16 }}>
        {/* Lista de reportes */}
        <div>
          {loading ? <p className="crud-loading">Cargando reportes...</p> :
           reportes.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No hay reportes con filtro "{filtro}".</p> :
           reportes.map(r => {
             const p = PRIORIDAD[r.prioridad] || PRIORIDAD.media;
             const e = ESTADOS.find(s => s.value === r.estado) || ESTADOS[0];
             return (
               <div key={r.id} onClick={() => openDetail(r)} style={{
                 background: selected?.id === r.id ? 'var(--accent-soft)' : 'var(--surface)',
                 border: `1px solid ${selected?.id === r.id ? 'var(--primary-light)' : 'var(--border-light)'}`,
                 borderRadius: 10, padding: 14, marginBottom: 8, cursor: 'pointer',
               }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                   <div>
                     <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{r.titulo}</div>
                     <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{r.descripcion?.slice(0, 100)}{r.descripcion?.length > 100 ? '...' : ''}</div>
                     <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 11, alignItems: 'center' }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><MapPin size={10} /> {r.ubicacion || 'Sin ubicación'}</span>
                       {r.lat && <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>({Number(r.lat).toFixed(4)}, {Number(r.lng).toFixed(4)})</span>}
                       <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><User size={10} /> {r.ciudadano || 'Ciudadano'}</span>
                     </div>
                   </div>
                   <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                     <span style={{ background: p.bg, color: p.color, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>{p.icon} {r.prioridad}</span>
                     <span style={{ background: e.bg, color: e.color, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{e.label}</span>
                     <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.creado_en?.slice(0, 10)}</span>
                   </div>
                 </div>
               </div>
             );
           })}
        </div>

        {/* Detalle del reporte */}
        {selected && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 10, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h4 style={{ margin: 0 }}>{selected.titulo}</h4>
              <button className="crud-btn-sm crud-btn-secondary" onClick={() => setSelected(null)}>Cerrar</button>
            </div>

            {/* Info */}
            <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
              <p><strong>Descripción:</strong> {selected.descripcion}</p>
              <p><strong>Ubicación:</strong> {selected.ubicacion || 'No especificada'}</p>
              {selected.lat && <p><strong>Coordenadas:</strong> {Number(selected.lat).toFixed(6)}, {Number(selected.lng).toFixed(6)}</p>}
              <p><strong>Ciudadano:</strong> {selected.ciudadano || `ID #${selected.usuario_id}`}</p>
              <p><strong>Categoría:</strong> {selected.categoria}</p>
              <p>
                <strong>Prioridad:</strong>
                <span style={{ background: PRIORIDAD[selected.prioridad]?.bg, color: PRIORIDAD[selected.prioridad]?.color, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, marginLeft: 6, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  {PRIORIDAD[selected.prioridad]?.icon} {selected.prioridad}
                </span>
              </p>
              <p><strong>Estado:</strong>
                <span style={{ background: ESTADOS.find(e => e.value === selected.estado)?.bg, color: ESTADOS.find(e => e.value === selected.estado)?.color, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, marginLeft: 6 }}>
                  {ESTADOS.find(e => e.value === selected.estado)?.label}
                </span>
              </p>
              {selected.lat && selected.lng && (
                <div style={{ marginBottom: 12 }}>
                  <strong>Ubicación en mapa:</strong>
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(selected.lng)-0.005},${Number(selected.lat)-0.005},${Number(selected.lng)+0.005},${Number(selected.lat)+0.005}&layer=mapnik&marker=${Number(selected.lat)},${Number(selected.lng)}`}
                    style={{ width: '100%', height: 200, border: 'none', borderRadius: 8, marginTop: 6 }}
                    title="Ubicación del reporte"
                  />
                </div>
              )}
              {selected.foto_url && (
                <div style={{ marginBottom: 12 }}>
                  <strong>Evidencia fotográfica:</strong>
                  <img src={selected.foto_url?.startsWith('http') ? selected.foto_url : `http://localhost:5000${selected.foto_url}`} alt="Evidencia" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8, marginTop: 6 }} />
                </div>
              )}
              {selected.respuesta && (
                <div style={{ background: '#D4EDDA', padding: 10, borderRadius: 8, marginTop: 8 }}>
                  <strong>Respuesta enviada:</strong> {selected.respuesta}
                </div>
              )}
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {selected.estado === 'pendiente' && (
                <button className="crud-btn-primary" onClick={() => changeStatus('en_proceso')} style={{ background: '#004085' }}>
                  <RefreshCw size={14} /> En Proceso
                </button>
              )}
              {selected.estado === 'en_proceso' && (
                <button className="crud-btn-primary" onClick={() => changeStatus('atendido')} style={{ background: '#155724' }}>
                  <CheckCircle size={14} /> Marcar Atendido
                </button>
              )}
              {selected.estado !== 'atendido' && (
                <button className="crud-btn-primary" onClick={() => changeStatus('pendiente')}>
                  <Clock size={14} /> Volver a Pendiente
                </button>
              )}
            </div>

            {/* Responder */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 12 }}>
              <label style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, display: 'block' }}>
                <MessageSquare size={14} /> {selected.respuesta ? 'Enviar otra respuesta' : 'Responder al ciudadano'}
              </label>
              <textarea className="crud-input" rows={2} value={respuesta}
                onChange={e => setRespuesta(e.target.value)}
                placeholder={selected.respuesta ? 'Escriba un mensaje de seguimiento...' : 'Escriba la respuesta que recibirá el ciudadano como notificación...'} />
              <button className="crud-btn-primary" onClick={handleResponder} disabled={sending || !respuesta.trim()}
                style={{ marginTop: 8 }}>
                <Send size={14} /> {sending ? 'Enviando...' : 'Enviar Respuesta'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportesPanel;
