import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Building2, Plus, Edit2, Trash2, Save, X, UserPlus, Search, Users } from 'lucide-react';
import OrgNavigator from './OrgNavigator';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// Catálogos fijos para servidores públicos Perú
const REGIMENES = ['CAS', 'D.L. 728', 'D.L. 276', 'SERVIR', 'Locación', 'Otro'];
const CONDICIONES = ['Contratado CAS', 'Contratado Permanente', 'Contratado Temporal', 'Nombrado', 'Locador', 'Otro'];
const NIVELES = ['Profesional', 'Técnico', 'Auxiliar', 'Funcionario', 'Directivo', 'Otro'];
const ESTADOS = ['activo', 'inactivo', 'suspendido'];

const emptyForm = {
  nombres: '', apellidos: '', dni: '', telefono: '', direccion: '',
  tipo_id: '', unidad_organica_id: '', fecha_contratacion: '', fecha_fin_contrato: '',
  honorarios: '', estado: 'activo',
  regimen_laboral: 'CAS', condicion: 'Contratado CAS', nivel: 'Profesional',
  nro_resolucion: '', correo_institucional: '',
};

const PersonalManager = ({ readOnly = false }) => {
  const [currentUnitId, setCurrentUnitId] = useState(null);
  const [personal, setPersonal] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [hijos, setHijos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showNewTipo, setShowNewTipo] = useState(false);
  const [newTipo, setNewTipo] = useState('');
  const [unidadSearch, setUnidadSearch] = useState('');
  const [unidadResults, setUnidadResults] = useState([]);
  const [selectedUnidadNombre, setSelectedUnidadNombre] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resPersonal, resTipos, resUnidades] = await Promise.all([
        axios.get(`${API}/personal`, { headers: headers() }),
        axios.get(`${API}/tipos-personal`, { headers: headers() }),
        axios.get(`${API}/unidades-organicas`, { headers: headers() }),
      ]);
      setPersonal(resPersonal.data);
      setTipos(resTipos.data);
      setUnidades(resUnidades.data);
      setError('');
    } catch (err) { setError('Error al cargar datos'); }
    finally { setLoading(false); }
  }, []);

  const loadHijos = useCallback(async () => {
    try {
      const url = currentUnitId ? `${API}/unidades-organicas/${currentUnitId}/hijos` : `${API}/unidades-organicas/raiz/hijos`;
      const res = await axios.get(url, { headers: headers() });
      setHijos(res.data);
    } catch (err) { /* ignore */ }
  }, [currentUnitId]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { loadHijos(); }, [loadHijos]);

  // Búsqueda global de personas
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(() => {
      axios.get(`${API}/personal/buscar?q=${encodeURIComponent(searchQuery)}`, { headers: headers() })
        .then(res => setSearchResults(res.data)).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Búsqueda de unidad en el formulario
  useEffect(() => {
    if (unidadSearch.length < 2) { setUnidadResults([]); return; }
    const timer = setTimeout(() => {
      axios.get(`${API}/unidades-organicas/buscar?q=${encodeURIComponent(unidadSearch)}`)
        .then(res => setUnidadResults(res.data)).catch(() => {});
    }, 200);
    return () => clearTimeout(timer);
  }, [unidadSearch]);

  const navigate = (id) => { setCurrentUnitId(id); setSuccess(''); setSearchQuery(''); setSearchResults([]); };

  const personalEnUnidad = currentUnitId ? personal.filter(p => p.unidad_organica_id === currentUnitId) : personal;

  const openCreate = () => {
    const nombreUnidad = currentUnitId ? unidades.find(u => u.id === currentUnitId)?.nombre || '' : '';
    setForm({ ...emptyForm, unidad_organica_id: currentUnitId || '' });
    setSelectedUnidadNombre(nombreUnidad);
    setUnidadSearch('');
    setEditingId(null);
    setShowForm(true);
    setError(''); setSuccess('');
  };

  const openEdit = (item) => {
    setForm({
      nombres: item.nombres || '', apellidos: item.apellidos || '',
      dni: item.dni || '', telefono: item.telefono || '', direccion: item.direccion || '',
      tipo_id: item.tipo_id || '', unidad_organica_id: item.unidad_organica_id || '',
      fecha_contratacion: item.fecha_contratacion ? item.fecha_contratacion.slice(0,10) : '',
      fecha_fin_contrato: item.fecha_fin_contrato ? item.fecha_fin_contrato.slice(0,10) : '',
      honorarios: item.honorarios || '', estado: item.estado || 'activo',
      regimen_laboral: item.regimen_laboral || 'CAS',
      condicion: item.condicion || 'Contratado CAS',
      nivel: item.nivel || 'Profesional',
      nro_resolucion: item.nro_resolucion || '',
      correo_institucional: item.correo_institucional || '',
    });
    setSelectedUnidadNombre(item.unidad_nombre || '');
    setUnidadSearch('');
    setEditingId(item.id);
    setShowForm(true);
    setError(''); setSuccess('');
  };

  const selectUnidad = (u) => {
    setForm({ ...form, unidad_organica_id: u.id });
    setSelectedUnidadNombre(u.nombre);
    setUnidadSearch('');
    setUnidadResults([]);
  };

  const clearUnidad = () => {
    setForm({ ...form, unidad_organica_id: '' });
    setSelectedUnidadNombre('');
  };

  const closeForm = () => {
    setShowForm(false); setEditingId(null); setForm(emptyForm);
    setSelectedUnidadNombre(''); setUnidadSearch(''); setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    const payload = {
      ...form,
      tipo_id: Number(form.tipo_id),
      unidad_organica_id: form.unidad_organica_id ? Number(form.unidad_organica_id) : null,
      honorarios: form.honorarios ? Number(form.honorarios) : 0,
      fecha_fin_contrato: form.fecha_fin_contrato || null,
    };
    try {
      if (editingId) {
        await axios.put(`${API}/personal/${editingId}`, payload, { headers: headers() });
        setSuccess('Personal actualizado correctamente');
      } else {
        await axios.post(`${API}/personal`, payload, { headers: headers() });
        setSuccess('Personal creado correctamente');
      }
      closeForm(); loadData();
    } catch (err) { setError(err?.response?.data?.message || 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`¿Eliminar a ${item.nombres} ${item.apellidos}?`)) return;
    try {
      await axios.delete(`${API}/personal/${item.id}`, { headers: headers() });
      setSuccess('Personal eliminado'); loadData();
    } catch (err) { setError(err?.response?.data?.message || 'Error al eliminar'); }
  };

  const handleAddTipo = async () => {
    if (!newTipo.trim()) return;
    try { await axios.post(`${API}/tipos-personal`, { nombre: newTipo.trim() }); setNewTipo(''); setShowNewTipo(false); loadData(); }
    catch (err) { setError(err?.response?.data?.message || 'Error al crear tipo'); }
  };

  const handleJumpToPerson = (persona) => {
    if (persona.unidad_organica_id) navigate(persona.unidad_organica_id);
    setSearchQuery(''); setSearchResults([]);
  };

  const badge = (text, color) => (
    <span style={{ background: color[0], color: color[1], padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{text}</span>
  );

  const estadoBadge = (estado) => {
    const m = { activo: ['#D4EDDA','#155724'], inactivo: ['#E2E3E5','#383D41'], suspendido: ['#FFF3CD','#856404'] };
    const s = m[estado] || m.activo;
    return <span style={{ background: s[0], color: s[1], padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{(estado||'').charAt(0).toUpperCase()+(estado||'').slice(1)}</span>;
  };

  const regimenColor = (r) => {
    const m = { 'CAS': ['#D4EDDA','#155724'], 'D.L. 728': ['#CCE5FF','#004085'], 'D.L. 276': ['#FFF3CD','#856404'], 'SERVIR': ['#F8D7DA','#721C24'], 'Locación': ['#E2E3E5','#383D41'] };
    return m[r] || ['#E2E3E5','#383D41'];
  };

  if (loading && personal.length === 0) return <p className="crud-loading">Cargando personal...</p>;

  return (
    <div className="crud-container">
      {/* Cabecera global */}
      <div className="crud-header">
        <h3>Gestión de Personal {readOnly && <span className="readonly-badge">Vista</span>}</h3>
        {!readOnly && (
          <button className="crud-btn-primary" onClick={openCreate}>
            <UserPlus size={18} /> Nuevo Personal
          </button>
        )}
      </div>

      <OrgNavigator currentUnitId={currentUnitId} onNavigate={navigate} readOnly={true} />

      {success && <p className="crud-success">{success}</p>}
      {error && <p className="crud-error">{error}</p>}

      {/* Buscador global de personas */}
      <div className="org-search-bar" style={{ marginBottom: 16 }}>
        <Search size={16} className="org-search-icon" />
        <input type="text" className="org-search-input" placeholder="Buscar persona por nombre, apellido o DNI..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        {searchResults.length > 0 && (
          <div className="org-search-dropdown">
            {searchResults.map(p => (
              <button key={p.id} className="org-search-item" onClick={() => handleJumpToPerson(p)}>
                <span className="org-search-item-name">{p.nombres} {p.apellidos}</span>
                <span className="org-search-item-sigla">{p.dni}</span>
                <span className="org-search-item-path">← {p.unidad_nombre || 'Sin unidad'}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Formulario con secciones */}
      {showForm && (
        <form className="crud-form" onSubmit={handleSave}>
          <h4>{editingId ? 'Editar Servidor Público' : 'Nuevo Servidor Público'}</h4>

          {/* Sección 1: Datos Personales */}
          <fieldset className="crud-fieldset">
            <legend>Datos Personales</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div className="field-group"><label>Nombres *</label><input className="crud-input" value={form.nombres} onChange={e => setForm({ ...form, nombres: e.target.value })} required /></div>
              <div className="field-group"><label>Apellidos *</label><input className="crud-input" value={form.apellidos} onChange={e => setForm({ ...form, apellidos: e.target.value })} required /></div>
              <div className="field-group"><label>DNI * (8 dígitos)</label><input className="crud-input" value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value.replace(/\D/g, '').slice(0,8) })} required maxLength={8} /></div>
              <div className="field-group"><label>Teléfono</label><input className="crud-input" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} /></div>
              <div className="field-group"><label>Correo Institucional</label><input className="crud-input" type="email" value={form.correo_institucional} onChange={e => setForm({ ...form, correo_institucional: e.target.value })} placeholder="nombre@muni.gob.pe" /></div>
              <div className="field-group" style={{ gridColumn: '1 / -1' }}><label>Dirección</label><input className="crud-input" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} /></div>
            </div>
          </fieldset>

          {/* Sección 2: Ubicación Orgánica */}
          <fieldset className="crud-fieldset">
            <legend>Ubicación Orgánica</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
              <div className="field-group">
                <label>Unidad Orgánica (buscar por nombre)</label>
                {selectedUnidadNombre ? (
                  <div className="crud-unidad-selected">
                    <Building2 size={16} />
                    <span>{selectedUnidadNombre}</span>
                    <button type="button" className="crud-btn-icon" onClick={clearUnidad}><X size={14} /></button>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <input className="crud-input" value={unidadSearch} onChange={e => setUnidadSearch(e.target.value)} placeholder="Escriba el nombre de la oficina..." />
                    {unidadResults.length > 0 && (
                      <div className="org-search-dropdown">
                        {unidadResults.map(u => (
                          <button key={u.id} type="button" className="org-search-item" onClick={() => selectUnidad(u)}>
                            <span className="org-search-item-name">{u.nombre}</span>
                            {u.sigla && <span className="org-search-item-sigla">{u.sigla}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="field-group">
                <label>Tipo de Personal *</label>
                <div className="crud-select-row">
                  <select className="crud-input" value={form.tipo_id} onChange={e => setForm({ ...form, tipo_id: e.target.value })} required>
                    <option value="">Seleccione...</option>
                    {tipos.map(t => <option key={t.id} value={String(t.id)}>{t.nombre}</option>)}
                  </select>
                  {!showNewTipo ? (
                    <button type="button" className="crud-btn-icon" onClick={() => setShowNewTipo(true)}><Plus size={16} /></button>
                  ) : (
                    <span className="crud-newtipo">
                      <input className="crud-input crud-input-sm" value={newTipo} onChange={e => setNewTipo(e.target.value)} placeholder="Nuevo tipo" autoFocus />
                      <button type="button" className="crud-btn-icon crud-btn-ok" onClick={handleAddTipo}><Save size={14} /></button>
                      <button type="button" className="crud-btn-icon" onClick={() => { setShowNewTipo(false); setNewTipo(''); }}><X size={14} /></button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </fieldset>

          {/* Sección 3: Datos Laborales (Servidor Público Perú) */}
          <fieldset className="crud-fieldset">
            <legend>Datos Laborales — Servidor Público</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div className="field-group">
                <label>Régimen Laboral</label>
                <select className="crud-input" value={form.regimen_laboral} onChange={e => setForm({ ...form, regimen_laboral: e.target.value })}>
                  {REGIMENES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>Condición</label>
                <select className="crud-input" value={form.condicion} onChange={e => setForm({ ...form, condicion: e.target.value })}>
                  {CONDICIONES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>Nivel</label>
                <select className="crud-input" value={form.nivel} onChange={e => setForm({ ...form, nivel: e.target.value })}>
                  {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>N° Resolución / Contrato</label>
                <input className="crud-input" value={form.nro_resolucion} onChange={e => setForm({ ...form, nro_resolucion: e.target.value })} placeholder="Ej: R.A. N° 123-2025-MPC" />
              </div>
              <div className="field-group">
                <label>Fecha Contratación *</label>
                <input className="crud-input" type="date" value={form.fecha_contratacion} onChange={e => setForm({ ...form, fecha_contratacion: e.target.value })} required />
              </div>
              <div className="field-group">
                <label>Fecha Fin Contrato</label>
                <input className="crud-input" type="date" value={form.fecha_fin_contrato} onChange={e => setForm({ ...form, fecha_fin_contrato: e.target.value })} />
              </div>
              <div className="field-group">
                <label>Honorarios (S/)</label>
                <input className="crud-input" type="number" step="0.01" min="0" value={form.honorarios} onChange={e => setForm({ ...form, honorarios: e.target.value })} />
              </div>
              <div className="field-group">
                <label>Estado</label>
                <select className="crud-input" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                  {ESTADOS.map(e => <option key={e} value={e}>{(e||'').charAt(0).toUpperCase()+(e||'').slice(1)}</option>)}
                </select>
              </div>
            </div>
          </fieldset>

          <div className="crud-form-actions">
            <button type="submit" className="crud-btn-primary" disabled={saving}>
              <Save size={18} /> {saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear Servidor')}
            </button>
            <button type="button" className="crud-btn-secondary" onClick={closeForm}><X size={18} /> Cancelar</button>
          </div>
        </form>
      )}

      {/* Subunidades navegables */}
      {hijos.length > 0 && (
        <>
          <div className="org-section-header">
            <h4>{currentUnitId ? 'Subunidades' : 'Unidades'}</h4>
            <span className="org-section-count">clic para ver su personal</span>
          </div>
          <div className="org-card-grid">
            {hijos.map(u => {
              const count = personal.filter(p => p.unidad_organica_id === u.id).length;
              return (
                <div key={u.id} className="org-unit-card" onClick={() => navigate(u.id)}>
                  <div className="org-unit-card-top"><Building2 size={20} color="var(--primary-light)" /></div>
                  <h4 className="org-unit-card-name">{u.nombre}</h4>
                  <div className="org-unit-card-meta">{u.sigla && <span className="org-unit-card-sigla">{u.sigla}</span>}</div>
                  <div className="org-unit-card-footer">
                    <span><Users size={12} /> {count} persona(s)</span>
                    <span className="org-enter-link">Ver personal →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Tabla de personal */}
      <div className="org-section-header" style={{ marginTop: 8 }}>
        <h4>{currentUnitId ? 'Personal en esta unidad' : 'Todo el personal'}</h4>
        <span className="org-section-count">{(currentUnitId ? personalEnUnidad : personal).length} persona(s)</span>
      </div>
      <div className="crud-table-wrap">
        <table className="crud-table">
          <thead><tr>
            <th>#</th><th>Apellidos y Nombres</th><th>DNI</th><th>Tipo</th>
            {!currentUnitId && <th>Unidad</th>}
            <th>Régimen</th><th>Condición</th><th>Contrato</th><th>Honorarios</th><th>Estado</th><th>Acc</th>
          </tr></thead>
          <tbody>
            {(currentUnitId ? personalEnUnidad : personal).length === 0 ? (
              <tr><td colSpan={currentUnitId ? 11 : 10} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                {readOnly ? 'Esta unidad no tiene personal asignado.' : (currentUnitId ? 'Esta unidad no tiene personal. Use "Nuevo Personal" para agregar.' : 'Seleccione una unidad o use "Nuevo Personal" para agregar.')}
              </td></tr>
            ) : (currentUnitId ? personalEnUnidad : personal).map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td><span className="crud-td-strong">{item.apellidos}, {item.nombres}</span></td>
                <td className="crud-td-mono">{item.dni}</td>
                <td><span className="crud-tag">{item.tipo_nombre}</span></td>
                {!currentUnitId && <td className="crud-td-strong" style={{fontSize:12}}>{item.unidad_nombre || '—'}</td>}
                <td>{badge(item.regimen_laboral || 'CAS', regimenColor(item.regimen_laboral))}</td>
                <td style={{fontSize:12,color:'var(--text-secondary)'}}>{item.condicion || '—'}</td>
                <td className="crud-td-date">{item.fecha_contratacion ? item.fecha_contratacion.slice(0,10) : '—'}</td>
                <td className="crud-td-number">S/ {Number(item.honorarios||0).toFixed(2)}</td>
                <td>{estadoBadge(item.estado)}</td>
                <td className="crud-td-actions">
                  {!readOnly && (
                    <>
                      <button className="crud-btn-sm crud-btn-edit" title="Editar" onClick={() => openEdit(item)}><Edit2 size={15} /></button>
                      <button className="crud-btn-sm crud-btn-delete" title="Eliminar" onClick={() => handleDelete(item)}><Trash2 size={15} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PersonalManager;
