import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Route, Plus, Edit2, Trash2, Save, X, MapPin, Truck,
  Navigation, Clock, Calendar, ArrowLeft, Brush, Flag, Users, Check, AlertCircle,
} from 'lucide-react';
import RutaMapa from './RutaMapa';
import { MapContainer, TileLayer, Polyline, Popup, CircleMarker, Tooltip, useMap } from 'react-leaflet';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const TURNOS = ['mañana', 'tarde', 'noche'];
const TIPOS_PUNTO = [
  { value: 'origen', label: 'Origen', color: '#155724', bg: '#D4EDDA' },
  { value: 'parada', label: 'Parada', color: '#004085', bg: '#CCE5FF' },
  { value: 'destino', label: 'Destino', color: '#721C24', bg: '#F8D7DA' },
];

const DIAS_SEMANA = [
  { key: 'lun', label: 'Lun' }, { key: 'mar', label: 'Mar' }, { key: 'mie', label: 'Mié' },
  { key: 'jue', label: 'Jue' }, { key: 'vie', label: 'Vie' }, { key: 'sab', label: 'Sáb' }, { key: 'dom', label: 'Dom' },
];

const DIAS_NOMBRES = { lun: 'Lunes', mar: 'Martes', mie: 'Miércoles', jue: 'Jueves', vie: 'Viernes', sab: 'Sábado', dom: 'Domingo' };

const diasToText = (diasObj) => {
  const sel = Object.entries(diasObj || {}).filter(([, v]) => v).map(([k]) => DIAS_NOMBRES[k]);
  if (sel.length === 0) return 'Sin días';
  if (sel.length === 7) return 'Todos los días';
  return sel.join(', ');
};

const diasToFrecuencia = (diasObj) => {
  const sel = Object.entries(diasObj || {}).filter(([, v]) => v).map(([k]) => k);
  if (sel.length === 7) return 'diaria';
  if (sel.length === 0) return 'personalizada';
  const lmv = ['lun', 'mie', 'vie'].every(d => sel.includes(d)) && sel.length === 3;
  const mjs = ['mar', 'jue', 'sab'].every(d => sel.includes(d)) && sel.length === 3;
  if (lmv || mjs) return 'interdiaria';
  return 'personalizada';
};

const coloresRecoleccion = ['#4a001f', '#0d6b2e', '#b8860b', '#6c3483', '#943126', '#1f618d'];
const coloresBarrido = ['#1a5276', '#117a65', '#0e6251', '#1b4f72', '#154360', '#1c6ea4'];
const colorAleatorio = (tipo) => {
  const pool = tipo === 'barrido' ? coloresBarrido : coloresRecoleccion;
  return pool[Math.floor(Math.random() * pool.length)];
};

const rutaEmptyForm = (tipo) => ({
  nombre: '', tipo, zona: '',
  dias: { lun: true, mar: true, mie: true, jue: true, vie: true, sab: true, dom: false },
  horario_inicio: '06:00', color: colorAleatorio(tipo), descripcion: '',
});

const asigEmptyForm = { ruta_id: '', equipo_id: '' };
const nuevoPunto = (orden) => ({ latitud: '', longitud: '', orden, tipo: 'parada', nombre: '', direccion: '', tiempo_estimado: 5 });

// ─── Mapa General ──────────────────────────

const MapaGeneral = ({ rutas, servicioActivo }) => {
  const [rutasConPuntos, setRutasConPuntos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const filtradas = rutas.filter(r => r.tipo === servicioActivo);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const resultados = [];
      for (const r of filtradas) {
        try {
          const res = await axios.get(`${API}/rutas/${r.id}/puntos`, { headers: headers() });
          const pts = res.data.filter(p => p.latitud && p.longitud);
          if (pts.length > 0) resultados.push({ ...r, puntos: pts });
        } catch { /* skip */ }
      }
      setRutasConPuntos(resultados);
      setCargando(false);
    };
    cargar();
  }, [rutas, servicioActivo]);

  if (cargando) return <p className="crud-loading">Cargando mapa...</p>;

  const todas = rutasConPuntos.flatMap(r => r.puntos.map(p => [Number(p.latitud), Number(p.longitud)]));
  const titulo = servicioActivo === 'recoleccion' ? 'Mapa de Recolección' : 'Mapa de Barrido';

  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-light)', marginBottom: 16 }}>
      <MapContainer center={todas.length > 0 ? todas[0] : [-13.517, -71.978]} zoom={14} style={{ height: 460, width: '100%' }} scrollWheelZoom={true}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {rutasConPuntos.map(r => {
          const coords = r.puntos.map(p => [Number(p.latitud), Number(p.longitud)]);
          return (
            <React.Fragment key={r.id}>
              <Polyline positions={coords} color={r.color || '#4a001f'} weight={servicioActivo === 'barrido' ? 3 : 5} opacity={0.85} dashArray={servicioActivo === 'barrido' ? '8 6' : undefined}>
                <Tooltip sticky><strong>{r.nombre}</strong> — {r.zona} | {r.dias}</Tooltip>
              </Polyline>
              {coords.map((c, i) => (
                <CircleMarker key={i} center={c} radius={servicioActivo === 'barrido' ? 5 : 7}
                  pathOptions={{ color: r.color || '#4a001f', fillColor: servicioActivo === 'barrido' ? '#fff' : (r.color || '#4a001f'), fillOpacity: servicioActivo === 'barrido' ? 0.6 : 0.9, weight: 2 }}>
                  <Popup><div style={{ fontSize: 12 }}><strong>{r.nombre}</strong><br />{r.zona} | {r.dias}<br />Punto #{i + 1} de {coords.length}</div></Popup>
                </CircleMarker>
              ))}
            </React.Fragment>
          );
        })}
        {todas.length > 0 && <AjustarVista coords={todas} />}
      </MapContainer>
      <div style={{ padding: '8px 14px', background: 'var(--surface)', display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12 }}>
        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{titulo}</span>
        {rutasConPuntos.map(r => (
          <span key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: r.color, display: 'inline-block' }} />{r.nombre} ({r.puntos.length})</span>
        ))}
        {rutasConPuntos.length === 0 && <span style={{ color: 'var(--text-muted)' }}>No hay rutas con puntos GPS.</span>}
      </div>
    </div>
  );
};

const AjustarVista = ({ coords }) => { const map = useMap(); useEffect(() => { if (coords.length > 0) map.fitBounds(coords, { padding: [40, 40] }); }, [coords, map]); return null; };

// ─── Componente Principal ──────────────────

const RutasEquiposManager = () => {
  const [servicioActivo, setServicioActivo] = useState('recoleccion');
  const [rutas, setRutas] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('mapa');

  // Ruta form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(rutaEmptyForm('recoleccion'));
  const [saving, setSaving] = useState(false);
  const [puntos, setPuntos] = useState([]);
  const [showPuntos, setShowPuntos] = useState(false);
  const [selectedRuta, setSelectedRuta] = useState(null);

  // Asignacion form
  const [showAsigForm, setShowAsigForm] = useState(false);
  const [editingAsigId, setEditingAsigId] = useState(null);
  const [asigForm, setAsigForm] = useState(asigEmptyForm);
  const [savingAsig, setSavingAsig] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resRutas, resVeh, resPer, resAsig, resEquipos] = await Promise.all([
        axios.get(`${API}/rutas`, { headers: headers() }),
        axios.get(`${API}/vehiculos`, { headers: headers() }),
        axios.get(`${API}/personal`, { headers: headers() }),
        axios.get(`${API}/asignaciones-ruta`, { headers: headers() }),
        axios.get(`${API}/equipos`, { headers: headers() }),
      ]);
      setRutas(resRutas.data);
      setVehiculos(resVeh.data);
      setPersonal(resPer.data);
      setAsignaciones(resAsig.data);
      setEquipos(resEquipos.data);
      setError('');
    } catch (err) { setError('Error al cargar datos'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Recargar datos al cambiar de servicio
  useEffect(() => { setActiveTab('mapa'); setShowForm(false); setShowPuntos(false); setShowAsigForm(false); setError(''); setSuccess(''); loadData(); }, [servicioActivo]);

  // Recargar datos al cambiar de pestaña (sincronización entre módulos)
  useEffect(() => { loadData(); }, [activeTab]);

  // Datos filtrados por servicio activo
  const rutasFiltradas = rutas.filter(r => r.tipo === servicioActivo);
  const rutaIds = new Set(rutasFiltradas.map(r => r.id));
  const asignacionesFiltradas = asignaciones.filter(a => rutaIds.has(a.ruta_id));

  // ─── RUTAS CRUD ─────────────────────────

  const openCreate = () => {
    setForm(rutaEmptyForm(servicioActivo));
    setEditingId(null); setShowForm(true);
    setError(''); setSuccess('');
  };

  const openEdit = (ruta) => {
    const diasTexto = (ruta.dias || '').toLowerCase();
    const diasObj = {
      lun: diasTexto.includes('lunes'), mar: diasTexto.includes('martes'), mie: diasTexto.includes('miércoles') || diasTexto.includes('miercoles'),
      jue: diasTexto.includes('jueves'), vie: diasTexto.includes('viernes'), sab: diasTexto.includes('sábado') || diasTexto.includes('sabado'), dom: diasTexto.includes('domingo'),
    };
    setForm({ nombre: ruta.nombre || '', tipo: ruta.tipo || 'recoleccion', zona: ruta.zona || '', dias: diasObj, horario_inicio: ruta.horario_inicio ? ruta.horario_inicio.slice(0, 5) : '06:00', color: ruta.color || '#4a001f', descripcion: ruta.descripcion || '' });
    setEditingId(ruta.id); setShowForm(true);
    setError(''); setSuccess('');
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(rutaEmptyForm(servicioActivo)); setError(''); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    const J = 8; const [h, m] = (form.horario_inicio || '06:00').split(':').map(Number);
    const totalRuta = puntos.reduce((s, p) => s + (Number(p.tiempo_estimado) || 0), 0) + Math.max(puntos.length - 1, 0) * 5;
    const jornadaMin = Math.max(J * 60, totalRuta);
    const totalMin = h * 60 + m + jornadaMin;
    const hf = String(Math.floor(totalMin / 60) % 24).padStart(2, '0');
    const mf = String(totalMin % 60).padStart(2, '0');
    const payload = { ...form, dias: diasToText(form.dias), frecuencia: diasToFrecuencia(form.dias), horario_inicio: form.horario_inicio + ':00', horario_fin: `${hf}:${mf}:00` };
    try {
      if (editingId) { await axios.put(`${API}/rutas/${editingId}`, payload, { headers: headers() }); setSuccess('Ruta actualizada'); closeForm(); loadData(); }
      else {
        const result = await axios.post(`${API}/rutas`, payload, { headers: headers() });
        setSuccess('Ruta creada — ahora traza el recorrido en el mapa');
        closeForm(); await loadData();
        const nr = { id: result.data.id, nombre: payload.nombre, zona: payload.zona };
        setPuntos([nuevoPunto(1)]); setSelectedRuta(nr); setShowPuntos(true);
      }
    } catch (err) { setError(err?.response?.data?.message || 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (ruta) => {
    if (!window.confirm(`¿Eliminar "${ruta.nombre}"?`)) return;
    try { await axios.delete(`${API}/rutas/${ruta.id}`, { headers: headers() }); setSuccess('Ruta eliminada'); loadData(); }
    catch (err) { setError(err?.response?.data?.message || 'Error al eliminar'); }
  };

  const openPuntos = async (ruta) => {
    try {
      const res = await axios.get(`${API}/rutas/${ruta.id}/puntos`, { headers: headers() });
      setPuntos(res.data.length > 0 ? res.data : [nuevoPunto(1)]); setSelectedRuta(ruta); setShowPuntos(true); setError('');
    } catch (err) { setError('Error al cargar puntos'); }
  };

  const updatePunto = (idx, field, val) => setPuntos(puntos.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  const removePunto = (idx) => setPuntos(puntos.filter((_, i) => i !== idx).map((p, i) => ({ ...p, orden: i + 1 })));

  const savePuntos = async () => {
    if (!selectedRuta) return;
    const valid = puntos.filter(p => p.latitud && p.longitud);
    if (valid.length === 0) { setError('Se requiere al menos un punto con coordenadas'); return; }
    try { await axios.put(`${API}/rutas/${selectedRuta.id}/puntos`, { puntos: valid }, { headers: headers() }); setSuccess(`Puntos guardados: ${valid.length}`); setShowPuntos(false); loadData(); }
    catch (err) { setError(err?.response?.data?.message || 'Error al guardar puntos'); }
  };

  // ─── ASIGNACIONES CRUD ──────────────────

  const openCreateAsig = () => { setAsigForm({ ...asigEmptyForm }); setEditingAsigId(null); setShowAsigForm(true); setError(''); setSuccess(''); };
  const openEditAsig = (a) => { setAsigForm({ ruta_id: a.ruta_id || '', equipo_id: a.equipo_id || '' }); setEditingAsigId(a.id); setShowAsigForm(true); setError(''); setSuccess(''); };
  const closeAsigForm = () => { setShowAsigForm(false); setEditingAsigId(null); setAsigForm(asigEmptyForm); setError(''); };

  const handleDeleteAsig = async (a) => {
    if (!window.confirm(`¿Eliminar asignación de ${a.ruta_nombre}?`)) return;
    try { await axios.delete(`${API}/asignaciones-ruta/${a.id}`, { headers: headers() }); setSuccess('Asignación eliminada'); loadData(); }
    catch (err) { setError(err?.response?.data?.message || 'Error al eliminar'); }
  };

  // ─── EQUIPOS CRUD ────────────────────────


  const colorTema = servicioActivo === 'recoleccion' ? '#4a001f' : '#1a5276';
  const tituloServicio = servicioActivo === 'recoleccion' ? 'Recolección de Residuos' : 'Barrido de Calles';

  if (loading && rutas.length === 0) return <p className="crud-loading">Cargando...</p>;

  // Configuración de campos según servicio (evita duplicación)

  return (
    <div className="crud-container">
      {/* Selector de servicio — siempre visible en la parte superior */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-light)' }}>
        <button
          onClick={() => setServicioActivo('recoleccion')}
          style={{
            flex: 1, padding: '14px 20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 15, fontWeight: 700,
            background: servicioActivo === 'recoleccion' ? '#4a001f' : 'var(--surface)',
            color: servicioActivo === 'recoleccion' ? '#fff' : 'var(--text-secondary)',
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          <Truck size={22} /> Recolección
          <span style={{ fontSize: 11, opacity: 0.7, fontWeight: 400 }}>({rutas.filter(r => r.tipo === 'recoleccion').length})</span>
        </button>
        <button
          onClick={() => setServicioActivo('barrido')}
          style={{
            flex: 1, padding: '14px 20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 15, fontWeight: 700,
            borderLeft: '1px solid var(--border-light)',
            background: servicioActivo === 'barrido' ? '#1a5276' : 'var(--surface)',
            color: servicioActivo === 'barrido' ? '#fff' : 'var(--text-secondary)',
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          <Brush size={22} /> Barrido
          <span style={{ fontSize: 11, opacity: 0.7, fontWeight: 400 }}>({rutas.filter(r => r.tipo === 'barrido').length})</span>
        </button>
      </div>

      {/* Info del servicio activo */}
      <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontWeight: 600, color: colorTema }}>{tituloServicio}</span>
        <span>— {rutasFiltradas.length} ruta(s) | {asignacionesFiltradas.length} asignación(es)</span>
      </div>

      {/* Tabs */}
      <div className="veh-tabs">
        <button className={`veh-tab ${activeTab === 'mapa' ? 'active' : ''}`} onClick={() => setActiveTab('mapa')}><Navigation size={16} /> Mapa General</button>
        <button className={`veh-tab ${activeTab === 'rutas' ? 'active' : ''}`} onClick={() => setActiveTab('rutas')}><Route size={16} /> Rutas</button>
        <button className={`veh-tab ${activeTab === 'equipos' ? 'active' : ''}`} onClick={() => setActiveTab('equipos')}><Users size={16} /> Equipos</button>
        <button className={`veh-tab ${activeTab === 'asignaciones' ? 'active' : ''}`} onClick={() => setActiveTab('asignaciones')}><Calendar size={16} /> Asignaciones</button>
        <button className={`veh-tab ${activeTab === 'disponibilidad' ? 'active' : ''}`} onClick={() => setActiveTab('disponibilidad')}><Clock size={16} /> Disponibilidad</button>
      </div>

      {success && <p className="crud-success">{success}</p>}
      {error && <p className="crud-error">{error}</p>}

      {/* ─── MAPA GENERAL ─── */}
      {activeTab === 'mapa' && <MapaGeneral rutas={rutas} servicioActivo={servicioActivo} />}

      {/* ─── RUTAS ─── */}
      {activeTab === 'rutas' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="crud-btn-primary" onClick={openCreate}><Plus size={18} /> Nueva Ruta</button>
          </div>

          {showForm && (
            <form className="crud-form" onSubmit={handleSave}>
              <h4>{editingId ? 'Editar Ruta' : `Nueva Ruta — ${tituloServicio}`}</h4>
              <fieldset className="crud-fieldset">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div className="field-group"><label>Nombre *</label><input className="crud-input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required /></div>
                  <div className="field-group"><label>Zona *</label><input className="crud-input" value={form.zona} onChange={e => setForm({ ...form, zona: e.target.value })} required /></div>
                  <div className="field-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Días de recolección</label>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      {DIAS_SEMANA.map(d => {
                        const activo = form.dias && form.dias[d.key];
                        return (
                          <button key={d.key} type="button" onClick={() => setForm({ ...form, dias: { ...form.dias, [d.key]: !activo } })}
                            style={{ flex: 1, padding: '8px 4px', borderRadius: 8, border: activo ? `2px solid ${colorTema}` : '1px solid var(--border)', background: activo ? colorTema : 'var(--surface)', color: activo ? '#fff' : 'var(--text-secondary)', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                      <span>{diasToText(form.dias || {})}</span>
                      <span style={{ fontWeight: 600, color: colorTema }}>{(diasToFrecuencia(form.dias || {})).charAt(0).toUpperCase() + (diasToFrecuencia(form.dias || {})).slice(1)}</span>
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Hora de Inicio</label><input className="crud-input" type="time" value={form.horario_inicio} onChange={e => setForm({ ...form, horario_inicio: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label>Hora de fin (estimada)</label>
                    <div className="crud-input" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg)', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'monospace' }}>
                      <Clock size={14} style={{ marginRight: 6 }} />
                      {(() => { const [h, m] = (form.horario_inicio || '06:00').split(':').map(Number); const tf = Math.floor((h * 60 + m + 8 * 60) / 60) % 24; const mf = (h * 60 + m + 8 * 60) % 60; return `${String(tf).padStart(2, '0')}:${String(mf).padStart(2, '0')} (jornada de 8h)`; })()}
                    </div>
                  </div>
                  <div className="field-group"><label>Color</label><input className="crud-input" type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ height: 40, padding: 4 }} /></div>
                  <div className="field-group" style={{ gridColumn: '1 / -1' }}><label>Descripción</label><input className="crud-input" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
                </div>
              </fieldset>
              <div className="crud-form-actions">
                <button type="submit" className="crud-btn-primary" disabled={saving} style={{ background: colorTema }}><Save size={18} /> {saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear Ruta')}</button>
                <button type="button" className="crud-btn-secondary" onClick={closeForm}><X size={18} /> Cancelar</button>
              </div>
            </form>
          )}

          {/* Editor GPS */}
          {showPuntos && selectedRuta && (
            <div className="crud-form" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h4 style={{ margin: 0 }}><Navigation size={16} /> Trazado GPS — {selectedRuta.nombre}</h4>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{puntos.filter(p => p.latitud).length} punto(s)</span>
              </div>
              <RutaMapa puntos={puntos} onUpdatePuntos={setPuntos} zona={selectedRuta.zona || ''} />
              <div style={{ marginTop: 12 }}>
                {puntos.map((p, idx) => (
                  <div key={idx} style={{ marginBottom: 6, padding: '8px 10px', border: '1px solid var(--border-light)', borderRadius: 8, background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 13, minWidth: 24, textAlign: 'center', background: (TIPOS_PUNTO.find(t => t.value === p.tipo) || TIPOS_PUNTO[1]).bg, color: (TIPOS_PUNTO.find(t => t.value === p.tipo) || TIPOS_PUNTO[1]).color, borderRadius: 6, padding: '2px 6px' }}>#{idx + 1}</span>
                    <select value={p.tipo || 'parada'} onChange={e => updatePunto(idx, 'tipo', e.target.value)} style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', width: 80, background: (TIPOS_PUNTO.find(t => t.value === p.tipo) || TIPOS_PUNTO[1]).bg, color: (TIPOS_PUNTO.find(t => t.value === p.tipo) || TIPOS_PUNTO[1]).color }}>
                      {TIPOS_PUNTO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <input className="crud-input" style={{ flex: '1 1 100px', fontSize: 11, padding: '3px 6px' }} value={p.nombre || ''} onChange={e => updatePunto(idx, 'nombre', e.target.value)} placeholder="Nombre" />
                    <input className="crud-input" style={{ flex: '1 1 120px', fontSize: 11, padding: '3px 6px' }} value={p.direccion || ''} onChange={e => updatePunto(idx, 'direccion', e.target.value)} placeholder="Dirección" />
                    <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11 }}><Clock size={10} /><input className="crud-input" type="number" min="0" style={{ width: 40, fontSize: 11, padding: '3px 4px', textAlign: 'center' }} value={p.tiempo_estimado} onChange={e => updatePunto(idx, 'tiempo_estimado', e.target.value)} />min</span>
                    {p.latitud && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{Number(p.latitud).toFixed(5)}, {Number(p.longitud).toFixed(5)}</span>}
                    <button type="button" className="crud-btn-sm crud-btn-delete" onClick={() => removePunto(idx)}><X size={12} /></button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="crud-btn-primary" onClick={savePuntos} style={{ background: colorTema }}><Save size={14} /> Guardar trazado</button>
                <button className="crud-btn-secondary" onClick={() => setShowPuntos(false)}>Cerrar</button>
              </div>
            </div>
          )}

          {/* Tabla rutas */}
          <div className="crud-table-wrap">
            <table className="crud-table">
              <thead><tr><th>#</th><th>Nombre</th><th>Zona</th><th>Días</th><th>Jornada</th><th>Puntos</th><th>Acc</th></tr></thead>
              <tbody>
                {rutasFiltradas.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No hay rutas de {servicioActivo}.</td></tr>
                ) : rutasFiltradas.map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td><td className="crud-td-strong">{r.nombre}</td><td>{r.zona}</td>
                    <td style={{ fontSize: 11, maxWidth: 200 }}>{r.dias || '—'}</td>
                    <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{r.horario_inicio?.slice(0, 5)}{r.horario_fin && <span style={{ color: 'var(--text-muted)' }}> → {r.horario_fin?.slice(0, 5)}</span>}</td>
                    <td><span className="crud-tag" style={{ cursor: 'pointer' }} onClick={() => openPuntos(r)}><MapPin size={12} /> {r.puntos_count || 0}</span></td>
                    <td className="crud-td-actions">
                      <button className="crud-btn-sm crud-btn-edit" onClick={() => openEdit(r)}><Edit2 size={15} /></button>
                      <button className="crud-btn-sm crud-btn-delete" onClick={() => handleDelete(r)}><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}


      {/* ─── EQUIPOS ─── */}
      {activeTab === 'equipos' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="crud-btn-primary" onClick={() => {
              setAsigForm({ ruta_id: '', equipo_nombre: '', vehiculo_id: '', miembros: [{ personal_id: '', rol: servicioActivo === 'recoleccion' ? 'conductor' : 'barrendero' }] });
              setEditingAsigId(null); setShowAsigForm(true); setError(''); setSuccess('');
            }} style={{ background: colorTema }}><Plus size={18} /> Nuevo Equipo</button>
          </div>

          {showAsigForm && (
            <form className="crud-form" onSubmit={async (e) => {
              e.preventDefault(); setSavingAsig(true); setError('');
              try {
                const payload = { nombre: asigForm.equipo_nombre, tipo: servicioActivo, vehiculo_id: asigForm.vehiculo_id || null, miembros: asigForm.miembros.filter(m => m.personal_id) };
                if (editingAsigId) {
                  await axios.put(`${API}/equipos/${editingAsigId}`, payload, { headers: headers() });
                  setSuccess('Equipo actualizado');
                } else {
                  await axios.post(`${API}/equipos`, payload, { headers: headers() });
                  setSuccess('Equipo creado');
                }
                setShowAsigForm(false); setEditingAsigId(null); loadData();
              } catch (err) { setError(err?.response?.data?.message || 'Error al guardar equipo'); }
              finally { setSavingAsig(false); }
            }}>
              <h4>{editingAsigId ? 'Editar' : 'Nuevo'} Equipo — {tituloServicio}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
                <div className="field-group"><label>Nombre *</label><input className="crud-input" value={asigForm.equipo_nombre} onChange={e => setAsigForm({ ...asigForm, equipo_nombre: e.target.value })} required /></div>
                {servicioActivo === 'recoleccion' && (() => {
                  const SGRSS_ID = 7;
                  const vehiculosUtiles = vehiculos.filter(v => v.estado === 'operativo' && v.unidad_organica_id === SGRSS_ID);
                  return (
                  <div className="field-group"><label>Vehículo</label>
                    <select className="crud-input" value={asigForm.vehiculo_id} onChange={e => setAsigForm({ ...asigForm, vehiculo_id: e.target.value })}>
                      <option value="">Sin vehículo</option>
                      {vehiculosUtiles.length === 0 && (
                        <option value="" disabled>No hay vehículos operativos disponibles en SGRSS</option>
                      )}
                      {vehiculosUtiles.map(v => (
                        <option key={v.id} value={v.id}>{v.placa} — {v.marca} {v.modelo} [Operativo]</option>
                      ))}
                    </select>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                      Vehículos de SGRSS operativos. Total flota: {vehiculos.length} vehículos.
                    </div>
                  </div>
                  );
                })()}
              </div>
              <fieldset className="crud-fieldset" style={{ marginTop: 12 }}>
                <legend>Personal</legend>
                {asigForm.miembros.map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, minWidth: 24 }}>#{idx + 1}</span>
                    <select className="crud-input" style={{ width: 120 }} value={m.rol} onChange={e => {
                      const miembros = asigForm.miembros.map((mb, i) => i === idx ? { ...mb, rol: e.target.value } : mb);
                      setAsigForm({ ...asigForm, miembros });
                    }}>
                      {servicioActivo === 'recoleccion' ? (
                        <><option value="conductor">Conductor</option><option value="ayudante">Ayudante</option></>
                      ) : (<option value="barrendero">Barrendero</option>)}
                    </select>
                    <select className="crud-input" style={{ flex: 1 }} value={m.personal_id} onChange={e => {
                      const miembros = asigForm.miembros.map((mb, i) => i === idx ? { ...mb, personal_id: e.target.value } : mb);
                      setAsigForm({ ...asigForm, miembros });
                    }}>
                      <option value="">Seleccionar...</option>
                      {personal.filter(p => !asigForm.miembros.some((mb, i) => i !== idx && String(mb.personal_id) === String(p.id))).map(p => {
                        const enOtroEquipo = equipos.some(eq => {
                          // Verificar si esta persona ya está en otro equipo del mismo tipo
                          if (eq.tipo !== servicioActivo) return false;
                          // No podemos saber los miembros sin cargar el detalle, así que solo mostramos
                          return false; // Simplificado: solo filtrar por tipo en el selector
                        });
                        return (
                          <option key={p.id} value={p.id}>{p.apellidos}, {p.nombres} — {p.tipo_nombre || 'Personal'}</option>
                        );
                      })}
                    </select>
                    <button type="button" className="crud-btn-sm crud-btn-delete" onClick={() => {
                      const miembros = asigForm.miembros.filter((_, i) => i !== idx);
                      setAsigForm({ ...asigForm, miembros: miembros.length > 0 ? miembros : [{ personal_id: '', rol: servicioActivo === 'recoleccion' ? 'ayudante' : 'barrendero' }] });
                    }}><X size={14} /></button>
                  </div>
                ))}
                <button type="button" className="crud-btn-secondary" onClick={() => setAsigForm({ ...asigForm, miembros: [...asigForm.miembros, { personal_id: '', rol: servicioActivo === 'recoleccion' ? 'ayudante' : 'barrendero' }] })}>
                  <Plus size={14} /> Agregar persona</button>
              </fieldset>
              <div className="crud-form-actions" style={{ marginTop: 12 }}>
                <button type="submit" className="crud-btn-primary" disabled={savingAsig} style={{ background: colorTema }}><Save size={18} /> {savingAsig ? 'Guardando...' : (editingAsigId ? 'Actualizar' : 'Crear Equipo')}</button>
                <button className="crud-btn-secondary" onClick={() => { setShowAsigForm(false); setEditingAsigId(null); }}><X size={18} /> Cancelar</button>
              </div>
            </form>
          )}

          <div className="crud-table-wrap">
            <table className="crud-table">
              <thead><tr><th>#</th><th>Equipo</th>{servicioActivo === 'recoleccion' && <th>Vehículo</th>}<th>Miembros</th><th>Acc</th></tr></thead>
              <tbody>
                {equipos.filter(e => e.tipo === servicioActivo).length === 0 ? (
                  <tr><td colSpan={servicioActivo === 'recoleccion' ? 4 : 3} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No hay equipos de {servicioActivo}.</td></tr>
                ) : equipos.filter(e => e.tipo === servicioActivo).map(eq => (
                  <tr key={eq.id}>
                    <td>{eq.id}</td><td className="crud-td-strong">{eq.nombre}</td>
                    {servicioActivo === 'recoleccion' && (
                      <td style={{ fontSize: 12 }}>
                        {eq.placa ? (
                          <span>{eq.placa} <span style={{
                            display: 'inline-block', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                            background: (vehiculos.find(v => v.placa === eq.placa)?.estado === 'operativo') ? '#D4EDDA' : '#FFF3CD',
                            color: (vehiculos.find(v => v.placa === eq.placa)?.estado === 'operativo') ? '#155724' : '#856404',
                          }}>{(vehiculos.find(v => v.placa === eq.placa)?.estado || '?').replace('_',' ')}</span></span>
                        ) : '—'}
                      </td>
                    )}
                    <td style={{ fontSize: 12 }}>{eq.personas_count} persona(s)</td>
                    <td className="crud-td-actions">
                      <button className="crud-btn-sm crud-btn-edit" onClick={async () => {
                        try {
                          const res = await axios.get(`${API}/equipos/${eq.id}`, { headers: headers() });
                          const miembros = (res.data.miembros || []).map(m => ({ personal_id: String(m.personal_id), rol: m.rol }));
                          setAsigForm({ ruta_id: '', equipo_nombre: eq.nombre, vehiculo_id: eq.vehiculo_id || '', miembros: miembros.length > 0 ? miembros : [{ personal_id: '', rol: 'ayudante' }] });
                        } catch { setAsigForm({ ruta_id: '', equipo_nombre: eq.nombre, vehiculo_id: eq.vehiculo_id || '', miembros: [{ personal_id: '', rol: 'ayudante' }] }); }
                        setEditingAsigId(eq.id); setShowAsigForm(true); setError(''); setSuccess('');
                      }}><Edit2 size={15} /></button>
                      <button className="crud-btn-sm crud-btn-delete" onClick={async () => {
                        if (!window.confirm(`¿Eliminar equipo "${eq.nombre}"?`)) return;
                        try { await axios.delete(`${API}/equipos/${eq.id}`, { headers: headers() }); setSuccess('Equipo eliminado'); loadData(); }
                        catch (err) { setError(err?.response?.data?.message || 'Error al eliminar'); }
                      }}><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ─── ASIGNACIONES ─── */}
      {activeTab === 'asignaciones' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="crud-btn-primary" onClick={() => {
              setAsigForm({ ...asigEmptyForm });
              setEditingAsigId(null); setShowAsigForm(true); setError(''); setSuccess('');
            }} style={{ background: colorTema }}><Plus size={18} /> Nueva Asignación</button>
          </div>

          {showAsigForm && (
            <form className="crud-form" onSubmit={async (e) => {
              e.preventDefault(); setSavingAsig(true); setError('');
              try {
                const payload = { ruta_id: asigForm.ruta_id, equipo_id: asigForm.equipo_id || null };
                if (editingAsigId) {
                  await axios.put(`${API}/asignaciones-ruta/${editingAsigId}`, payload, { headers: headers() });
                  setSuccess('Asignación actualizada');
                } else {
                  await axios.post(`${API}/asignaciones-ruta`, payload, { headers: headers() });
                  setSuccess('Asignación creada');
                }
                setShowAsigForm(false); setEditingAsigId(null); loadData();
              } catch (err) { setError(err?.response?.data?.message || 'Error al guardar'); }
              finally { setSavingAsig(false); }
            }}>
              <h4>{editingAsigId ? 'Editar' : 'Nueva'} Asignación — {tituloServicio}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                <div className="field-group"><label>Ruta *</label>
                  <select className="crud-input" value={asigForm.ruta_id} onChange={e => setAsigForm({ ...asigForm, ruta_id: e.target.value })} required>
                    <option value="">Seleccione ruta...</option>
                    {rutasFiltradas.map(r => <option key={r.id} value={r.id}>{r.nombre} — {r.zona} ({r.dias})</option>)}
                  </select></div>
                <div className="field-group"><label>Equipo *</label>
                  <select className="crud-input" value={asigForm.equipo_id || ''} onChange={e => setAsigForm({ ...asigForm, equipo_id: e.target.value })} required>
                    <option value="">Seleccione equipo...</option>
                    {equipos.filter(e => e.tipo === servicioActivo).map(eq => {
                      const rutaSel = rutasFiltradas.find(r => r.id === Number(asigForm.ruta_id));
                      const parseDias = (txt) => {
                        const n = (txt || '').toLowerCase().replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i').replace(/ó/g,'o').replace(/ú/g,'u').trim();
                        const m = n.match(/^(\w+)\s+a\s+(\w+)$/);
                        if (m) {
                          const idx = { lunes:0, martes:1, miercoles:2, jueves:3, viernes:4, sabado:5, domingo:6 };
                          const ini = idx[m[1]], fin = idx[m[2]];
                          if (ini !== undefined && fin !== undefined && ini <= fin) return ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'].slice(ini, fin+1);
                        }
                        return n.split(',').map(d => d.trim()).filter(d => d);
                      };
                      const diasRuta = rutaSel ? parseDias(rutaSel.dias) : [];
                      const otrasAsig = asignaciones.filter(a => a.equipo_id === eq.id && a.ruta_id !== (asigForm.ruta_id ? Number(asigForm.ruta_id) : 0));
                      const diasOcupados = otrasAsig.flatMap(a => { const r = rutas.find(rr => rr.id === a.ruta_id); return r ? parseDias(r.dias) : []; });
                      const conflicto = diasRuta.some(d => diasOcupados.includes(d));
                      return (
                        <option key={eq.id} value={eq.id} disabled={conflicto && !editingAsigId}>
                          {eq.nombre} — {eq.personas_count} pers. {eq.placa ? '| ' + eq.placa : ''}{conflicto ? ' [OCUPADO]' : ''}
                        </option>
                      );
                    })}
                  </select></div>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '8px 0 0' }}>
                El equipo se crea en la pestaña "Equipos". Los días y horarios los hereda de la ruta.
              </p>
              <div className="crud-form-actions" style={{ marginTop: 12 }}>
                <button type="submit" className="crud-btn-primary" disabled={savingAsig} style={{ background: colorTema }}><Save size={18} /> {savingAsig ? 'Guardando...' : (editingAsigId ? 'Actualizar' : 'Crear Asignación')}</button>
                <button className="crud-btn-secondary" onClick={() => { setShowAsigForm(false); setEditingAsigId(null); }}><X size={18} /> Cancelar</button>
              </div>
            </form>
          )}

          <div className="crud-table-wrap">
            <table className="crud-table">
              <thead><tr><th>#</th><th>Ruta</th><th>Días</th><th>Horario</th><th>Equipo</th><th>Acc</th></tr></thead>
              <tbody>
                {asignacionesFiltradas.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No hay asignaciones.</td></tr>
                ) : asignacionesFiltradas.map(a => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td className="crud-td-strong">{a.ruta_nombre}</td>
                    <td style={{ fontSize: 11, maxWidth: 160 }}>{rutas.find(r => r.id === a.ruta_id)?.dias || '—'}</td>
                    <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{rutas.find(r => r.id === a.ruta_id)?.horario_inicio?.slice(0,5)} → {rutas.find(r => r.id === a.ruta_id)?.horario_fin?.slice(0,5)}</td>
                    <td style={{ fontSize: 12, fontWeight: 600 }}>{a.equipo_nombre || equipos.find(e => e.id === a.equipo_id)?.nombre || '—'}</td>
                    <td className="crud-td-actions">
                      <button className="crud-btn-sm crud-btn-edit" onClick={() => {
                        setAsigForm({ ruta_id: String(a.ruta_id), equipo_id: a.equipo_id || '' });
                        setEditingAsigId(a.id); setShowAsigForm(true); setError(''); setSuccess('');
                      }}><Edit2 size={15} /></button>
                      <button className="crud-btn-sm crud-btn-delete" onClick={() => handleDeleteAsig(a)}><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {/* ─── DISPONIBILIDAD ─── */}
      {activeTab === 'disponibilidad' && (() => {
        const eqs = equipos.filter(e => e.tipo === servicioActivo);
        const DIAS_ORDEN = ['lun','mar','mie','jue','vie','sab','dom'];
        const parseDias = (txt) => {
          const n = (txt || '').toLowerCase().replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i').replace(/ó/g,'o').replace(/ú/g,'u').trim();
          const m = n.match(/^(\w+)\s+a\s+(\w+)$/);
          if (m) {
            const idx = { lunes:0, martes:1, miercoles:2, jueves:3, viernes:4, sabado:5, domingo:6 };
            const ini = idx[m[1]], fin = idx[m[2]];
            if (ini !== undefined && fin !== undefined && ini <= fin) return new Set(DIAS_ORDEN.slice(ini, fin+1));
          }
          return new Set(n.split(',').map(d => d.trim()).filter(d => DIAS_ORDEN.includes(d)));
        };
        // Para cada equipo, mapear día → [{ruta, horario}]
        const getAgenda = (equipoId) => {
          const agenda = {};
          DIAS_ORDEN.forEach(d => agenda[d] = []);
          asignaciones.filter(a => a.equipo_id === equipoId).forEach(a => {
            const r = rutas.find(rr => rr.id === a.ruta_id);
            if (r) {
              const dias = parseDias(r.dias);
              dias.forEach(d => {
                if (agenda[d]) agenda[d].push({ ruta: r.nombre, inicio: r.horario_inicio?.slice(0,5), fin: r.horario_fin?.slice(0,5), color: r.color });
              });
            }
          });
          return agenda;
        };
        return (
          <div className="crud-table-wrap" style={{ overflowX: 'auto' }}>
            <table className="crud-table">
              <thead><tr>
                <th style={{ minWidth: 140 }}>Equipo</th>
                {DIAS_ORDEN.map(d => <th key={d} style={{ textAlign: 'center', minWidth: 100 }}>{d.charAt(0).toUpperCase()+d.slice(1)}</th>)}
              </tr></thead>
              <tbody>
                {eqs.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No hay equipos de {servicioActivo}.</td></tr>
                ) : eqs.map(eq => {
                  const agenda = getAgenda(eq.id);
                  return (
                    <tr key={eq.id}>
                      <td className="crud-td-strong" style={{ verticalAlign: 'top' }}>
                        {eq.nombre}
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{eq.placa || ''}{eq.personas_count ? ` | ${eq.personas_count} pers.` : ''}</div>
                      </td>
                      {DIAS_ORDEN.map(d => {
                        const ocupaciones = agenda[d];
                        return (
                          <td key={d} style={{ verticalAlign: 'top', padding: '6px 4px' }}>
                            {ocupaciones.length === 0 ? (
                              <span style={{ display: 'block', textAlign: 'center', padding: '8px 4px', borderRadius: 8, background: '#D4EDDA', color: '#155724', fontSize: 12, fontWeight: 600 }}>Libre</span>
                            ) : ocupaciones.map((o, i) => (
                              <div key={i} style={{ marginBottom: i < ocupaciones.length-1 ? 4 : 0, padding: '6px 8px', borderRadius: 6, background: '#F8D7DA', border: '1px solid #F0C0C5', fontSize: 11, lineHeight: 1.4 }}>
                                <div style={{ fontWeight: 700, color: '#721C24', fontSize: 12 }}>{o.ruta}</div>
                                <div style={{ color: '#721C24', fontFamily: 'monospace', marginTop: 2 }}>{o.inicio} → {o.fin}</div>
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 16 }}>
              <span><span style={{ display:'inline-block',width:12,height:12,borderRadius:4,background:'#D4EDDA',marginRight:4}} /> Libre</span>
              <span><span style={{ display:'inline-block',width:12,height:12,borderRadius:4,background:'#F8D7DA',marginRight:4}} /> Ocupado</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default RutasEquiposManager;
