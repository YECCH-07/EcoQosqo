import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Truck, Plus, Edit2, Trash2, Save, X, Search, Wrench, AlertTriangle,
  Shield, FileCheck, Calendar, Clock, Activity, Gauge, Building2, Users,
} from 'lucide-react';
import OrgNavigator from './OrgNavigator';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const TIPOS_VEHICULO = [
  { value: 'camion_recolector', label: 'Camión Recolector' },
  { value: 'compactador', label: 'Compactador' },
  { value: 'volquete', label: 'Volquete' },
  { value: 'camioneta', label: 'Camioneta' },
  { value: 'sedan', label: 'Sedán' },
  { value: 'moto', label: 'Moto' },
  { value: 'otro', label: 'Otro' },
];

const COMBUSTIBLES = ['diesel', 'gasolina', 'gnv', 'electrico'];
const ESTADOS_VEHICULO = ['operativo', 'mantenimiento', 'fuera_servicio', 'baja'];
const TIPOS_MANTENIMIENTO = ['preventivo', 'correctivo', 'predictivo'];
const ESTADOS_MANTENIMIENTO = ['programado', 'en_proceso', 'completado', 'cancelado'];

const tipoLabel = (v) => TIPOS_VEHICULO.find(t => t.value === v)?.label || v;

const emptyForm = {
  placa: '', tipo: 'camion_recolector', marca: '', modelo: '', anio: '',
  color: '', nro_motor: '', nro_chasis: '', capacidad: '',
  tipo_combustible: 'diesel', unidad_organica_id: '', responsable_id: '',
  estado: 'operativo', kilometraje_actual: '0',
  fecha_adquisicion: '', observaciones: '',
  nro_soat: '', vigencia_soat: '', aseguradora_soat: '',
  nro_revision_tecnica: '', vigencia_revision_tecnica: '',
};

const mantEmptyForm = {
  tipo: 'preventivo', descripcion: '', taller: '', costo: '',
  fecha_programada: '', fecha_realizada: '', kilometraje_actual: '',
  estado: 'programado', observaciones: '',
};

const estadoBadge = (estado) => {
  const m = {
    operativo: ['#D4EDDA', '#155724'],
    mantenimiento: ['#FFF3CD', '#856404'],
    fuera_servicio: ['#E2E3E5', '#383D41'],
    baja: ['#F8D7DA', '#721C24'],
  };
  const s = m[estado] || m.operativo;
  return <span style={{ background: s[0], color: s[1], padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{(estado || '').charAt(0).toUpperCase() + (estado || '').slice(1).replace('_', ' ')}</span>;
};

const mantEstadoBadge = (estado) => {
  const m = {
    programado: ['#CCE5FF', '#004085'],
    en_proceso: ['#FFF3CD', '#856404'],
    completado: ['#D4EDDA', '#155724'],
    cancelado: ['#E2E3E5', '#383D41'],
  };
  const s = m[estado] || m.programado;
  return <span style={{ background: s[0], color: s[1], padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{(estado || '').charAt(0).toUpperCase() + (estado || '').slice(1).replace('_', ' ')}</span>;
};

const expiryBadge = (dateStr) => {
  if (!dateStr) return <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>;
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const diff = Math.ceil((new Date(dateStr) - hoy) / (1000 * 60 * 60 * 24));
  if (diff < 0) return <span className="veh-expiry-badge expired">Vencido ({Math.abs(diff)}d)</span>;
  if (diff <= 15) return <span className="veh-expiry-badge danger">{diff}d</span>;
  if (diff <= 30) return <span className="veh-expiry-badge warning">{diff}d</span>;
  return <span className="veh-expiry-badge ok">{dateStr.slice(0, 10)}</span>;
};

const VehiculoManager = ({ readOnly = false }) => {
  const [vehiculos, setVehiculos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('vehiculos');
  const [alertas, setAlertas] = useState(null);
  const [alertasLoading, setAlertasLoading] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [mantLoading, setMantLoading] = useState(false);
  const [showMantForm, setShowMantForm] = useState(false);
  const [mantForm, setMantForm] = useState(mantEmptyForm);
  const [editingMantId, setEditingMantId] = useState(null);
  const [savingMant, setSavingMant] = useState(false);
  const [unidadSearch, setUnidadSearch] = useState('');
  const [unidadResults, setUnidadResults] = useState([]);
  const [selectedUnidadNombre, setSelectedUnidadNombre] = useState('');

  // Navegacion por organigrama
  const [currentUnitId, setCurrentUnitId] = useState(null);
  const [hijos, setHijos] = useState([]);

  // Busqueda de responsable (personal)
  const [responsableSearch, setResponsableSearch] = useState('');
  const [responsableResults, setResponsableResults] = useState([]);
  const [selectedResponsableNombre, setSelectedResponsableNombre] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resVeh, resUni] = await Promise.all([
        axios.get(`${API}/vehiculos`, { headers: headers() }),
        axios.get(`${API}/unidades-organicas`, { headers: headers() }),
      ]);
      setVehiculos(resVeh.data);
      setUnidades(resUni.data);
      setError('');
    } catch (err) { setError('Error al cargar datos'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Cargar subunidades del organigrama
  const loadHijos = useCallback(async () => {
    try {
      const url = currentUnitId
        ? `${API}/unidades-organicas/${currentUnitId}/hijos`
        : `${API}/unidades-organicas/raiz/hijos`;
      const res = await axios.get(url, { headers: headers() });
      setHijos(res.data);
    } catch (err) { /* las subunidades no bloquean la vista principal */ }
  }, [currentUnitId]);

  useEffect(() => { loadHijos(); }, [loadHijos]);

  const navigate = (id) => {
    setCurrentUnitId(id);
    setSuccess('');
    setSearchQuery('');
    setSearchResults([]);
  };

  // Buscador global de vehículos
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(() => {
      axios.get(`${API}/vehiculos/buscar?q=${encodeURIComponent(searchQuery)}`, { headers: headers() })
        .then(res => setSearchResults(res.data)).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Buscador de unidad en form
  useEffect(() => {
    if (unidadSearch.length < 2) { setUnidadResults([]); return; }
    const timer = setTimeout(() => {
      axios.get(`${API}/unidades-organicas/buscar?q=${encodeURIComponent(unidadSearch)}`, { headers: headers() })
        .then(res => setUnidadResults(res.data)).catch(() => {});
    }, 200);
    return () => clearTimeout(timer);
  }, [unidadSearch]);

  // Buscador de responsable (personal)
  useEffect(() => {
    if (responsableSearch.length < 2) { setResponsableResults([]); return; }
    const timer = setTimeout(() => {
      axios.get(`${API}/personal/buscar?q=${encodeURIComponent(responsableSearch)}`, { headers: headers() })
        .then(res => setResponsableResults(res.data)).catch(() => {});
    }, 200);
    return () => clearTimeout(timer);
  }, [responsableSearch]);

  const loadAlertas = async () => {
    setAlertasLoading(true);
    try {
      const res = await axios.get(`${API}/vehiculos/alertas`, { headers: headers() });
      setAlertas(res.data);
      setError('');
    } catch (err) { setError('Error al cargar alertas'); }
    finally { setAlertasLoading(false); }
  };

  const loadMantenimientos = async (vehiculoId) => {
    setMantLoading(true);
    try {
      const res = await axios.get(`${API}/vehiculos/${vehiculoId}/mantenimientos`, { headers: headers() });
      setMantenimientos(res.data);
      setError('');
    } catch (err) { setError('Error al cargar mantenimientos'); }
    finally { setMantLoading(false); }
  };

  const openCreate = () => {
    const unidadNombre = currentUnitId ? unidades.find(u => u.id === currentUnitId)?.nombre || '' : '';
    setForm({ ...emptyForm, unidad_organica_id: currentUnitId || '' });
    setSelectedUnidadNombre(unidadNombre);
    setUnidadSearch('');
    setSelectedResponsableNombre('');
    setResponsableSearch('');
    setEditingId(null);
    setShowForm(true);
    setError(''); setSuccess('');
  };

  const openEdit = (item) => {
    setForm({
      placa: item.placa || '', tipo: item.tipo || 'camion_recolector',
      marca: item.marca || '', modelo: item.modelo || '',
      anio: item.anio ? String(item.anio) : '', color: item.color || '',
      nro_motor: item.nro_motor || '', nro_chasis: item.nro_chasis || '',
      capacidad: item.capacidad ? String(item.capacidad) : '',
      tipo_combustible: item.tipo_combustible || 'diesel',
      unidad_organica_id: item.unidad_organica_id || '',
      responsable_id: item.responsable_id || '',
      estado: item.estado || 'operativo',
      kilometraje_actual: item.kilometraje_actual ? String(item.kilometraje_actual) : '0',
      fecha_adquisicion: item.fecha_adquisicion ? item.fecha_adquisicion.slice(0, 10) : '',
      observaciones: item.observaciones || '',
      nro_soat: item.nro_soat || '', vigencia_soat: item.vigencia_soat ? item.vigencia_soat.slice(0, 10) : '',
      aseguradora_soat: item.aseguradora_soat || '',
      nro_revision_tecnica: item.nro_revision_tecnica || '',
      vigencia_revision_tecnica: item.vigencia_revision_tecnica ? item.vigencia_revision_tecnica.slice(0, 10) : '',
    });
    setSelectedUnidadNombre(item.unidad_nombre || '');
    setSelectedResponsableNombre(item.responsable_nombre ? item.responsable_nombre.trim() : '');
    setUnidadSearch('');
    setResponsableSearch('');
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

  const selectResponsable = (p) => {
    setForm({ ...form, responsable_id: p.id });
    setSelectedResponsableNombre(`${p.nombres} ${p.apellidos}`);
    setResponsableSearch('');
    setResponsableResults([]);
  };

  const clearResponsable = () => {
    setForm({ ...form, responsable_id: '' });
    setSelectedResponsableNombre('');
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
      anio: Number(form.anio) || new Date().getFullYear(),
      capacidad: form.capacidad ? Number(form.capacidad) : 0,
      unidad_organica_id: form.unidad_organica_id ? Number(form.unidad_organica_id) : null,
      responsable_id: form.responsable_id ? Number(form.responsable_id) : null,
      kilometraje_actual: form.kilometraje_actual ? Number(form.kilometraje_actual) : 0,
      vigencia_soat: form.vigencia_soat || null,
      vigencia_revision_tecnica: form.vigencia_revision_tecnica || null,
      fecha_adquisicion: form.fecha_adquisicion || null,
    };
    try {
      if (editingId) {
        await axios.put(`${API}/vehiculos/${editingId}`, payload, { headers: headers() });
        setSuccess('Vehículo actualizado correctamente');
      } else {
        await axios.post(`${API}/vehiculos`, payload, { headers: headers() });
        setSuccess('Vehículo creado correctamente');
      }
      closeForm(); loadData();
    } catch (err) { setError(err?.response?.data?.message || 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`¿Dar de baja al vehículo ${item.placa}?`)) return;
    try {
      await axios.delete(`${API}/vehiculos/${item.id}`, { headers: headers() });
      setSuccess('Vehículo dado de baja'); loadData();
    } catch (err) { setError(err?.response?.data?.message || 'Error al eliminar'); }
  };

  // ─── Mantenimientos ──────────────────────────
  const selectVehiculoForMant = (v) => {
    setSelectedVehiculo(v);
    setShowMantForm(false);
    setEditingMantId(null);
    setMantForm(mantEmptyForm);
    loadMantenimientos(v.id);
  };

  const openCreateMant = () => {
    if (!selectedVehiculo) return;
    setMantForm({ ...mantEmptyForm, kilometraje_actual: String(selectedVehiculo.kilometraje_actual || 0) });
    setEditingMantId(null);
    setShowMantForm(true);
    setError(''); setSuccess('');
  };

  const openEditMant = (m) => {
    setMantForm({
      tipo: m.tipo || 'preventivo',
      descripcion: m.descripcion || '',
      taller: m.taller || '',
      costo: m.costo ? String(m.costo) : '',
      fecha_programada: m.fecha_programada ? m.fecha_programada.slice(0, 10) : '',
      fecha_realizada: m.fecha_realizada ? m.fecha_realizada.slice(0, 10) : '',
      kilometraje_actual: m.kilometraje_actual ? String(m.kilometraje_actual) : '0',
      estado: m.estado || 'programado',
      observaciones: m.observaciones || '',
    });
    setEditingMantId(m.id);
    setShowMantForm(true);
    setError(''); setSuccess('');
  };

  const closeMantForm = () => {
    setShowMantForm(false); setEditingMantId(null); setMantForm(mantEmptyForm); setError('');
  };

  const handleSaveMant = async (e) => {
    e.preventDefault();
    if (!selectedVehiculo) return;
    setSavingMant(true); setError('');
    const payload = {
      ...mantForm,
      costo: mantForm.costo ? Number(mantForm.costo) : 0,
      kilometraje_actual: mantForm.kilometraje_actual ? Number(mantForm.kilometraje_actual) : 0,
      fecha_realizada: mantForm.fecha_realizada || null,
    };
    try {
      if (editingMantId) {
        await axios.put(`${API}/mantenimientos/${editingMantId}`, payload, { headers: headers() });
        setSuccess('Mantenimiento actualizado');
      } else {
        await axios.post(`${API}/vehiculos/${selectedVehiculo.id}/mantenimientos`, payload, { headers: headers() });
        setSuccess('Mantenimiento registrado');
      }
      closeMantForm();
      loadMantenimientos(selectedVehiculo.id);
      loadData();
    } catch (err) { setError(err?.response?.data?.message || 'Error al guardar mantenimiento'); }
    finally { setSavingMant(false); }
  };

  const handleDeleteMant = async (mant) => {
    if (!window.confirm('¿Eliminar este mantenimiento?')) return;
    try {
      await axios.delete(`${API}/mantenimientos/${mant.id}`, { headers: headers() });
      setSuccess('Mantenimiento eliminado');
      loadMantenimientos(selectedVehiculo?.id);
    } catch (err) { setError(err?.response?.data?.message || 'Error al eliminar mantenimiento'); }
  };

  const handleGenerarAlertas = async () => {
    try {
      const res = await axios.post(`${API}/vehiculos/generar-alertas`, {}, { headers: headers() });
      setSuccess(res.data.message || 'Alertas generadas');
    } catch (err) { setError(err?.response?.data?.message || 'Error al generar alertas'); }
  };

  // ─── Render ──────────────────────────────────

  if (loading && vehiculos.length === 0) return <p className="crud-loading">Cargando vehículos...</p>;

  // Vehiculos filtrados por oficina seleccionada
  const vehiculosEnUnidad = currentUnitId
    ? vehiculos.filter(v => v.unidad_organica_id === currentUnitId)
    : vehiculos;

  // Calcular totales de alertas
  const totalAlertas = alertas
    ? (alertas.soat_vencidos?.length || 0) + (alertas.soat_proximos?.length || 0)
      + (alertas.revision_vencidos?.length || 0) + (alertas.revision_proximos?.length || 0)
      + (alertas.mantenimientos_vencidos?.length || 0) + (alertas.mantenimientos_proximos?.length || 0)
    : 0;

  return (
    <div className="crud-container">
      <div className="crud-header">
        <h3>Módulo de Vehículos {readOnly && <span className="readonly-badge">Vista</span>}</h3>
        {!readOnly && activeTab === 'vehiculos' && (
          <button className="crud-btn-primary" onClick={openCreate}>
            <Plus size={18} /> Nuevo Vehículo
          </button>
        )}
      </div>

      {/* Pestañas */}
      <div className="veh-tabs">
        <button className={`veh-tab ${activeTab === 'vehiculos' ? 'active' : ''}`} onClick={() => setActiveTab('vehiculos')}>
          <Truck size={16} /> Vehículos
        </button>
        <button className={`veh-tab ${activeTab === 'alertas' ? 'active' : ''}`} onClick={() => { setActiveTab('alertas'); loadAlertas(); }}>
          <AlertTriangle size={16} /> Alertas
          {totalAlertas > 0 && <span className="veh-tab-badge danger">{totalAlertas}</span>}
        </button>
        <button className={`veh-tab ${activeTab === 'mantenimientos' ? 'active' : ''}`} onClick={() => setActiveTab('mantenimientos')}>
          <Wrench size={16} /> Mantenimientos
        </button>
      </div>

      {success && <p className="crud-success">{success}</p>}
      {error && <p className="crud-error">{error}</p>}

      {/* ─── TAB: VEHÍCULOS ──────────────────────── */}
      {activeTab === 'vehiculos' && (
        <>
          {/* Buscador */}
          <div className="org-search-bar" style={{ marginBottom: 16 }}>
            <Search size={16} className="org-search-icon" />
            <input type="text" className="org-search-input" placeholder="Buscar por placa, marca, modelo..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            {searchResults.length > 0 && (
              <div className="org-search-dropdown">
                {searchResults.map(v => (
                  <button key={v.id} className="org-search-item" onClick={() => {
                    if (v.unidad_organica_id) navigate(v.unidad_organica_id);
                    setSearchQuery(''); setSearchResults([]);
                  }}>
                    <span className="org-search-item-name">{v.placa} — {v.marca} {v.modelo}</span>
                    <span className="org-search-item-sigla">{tipoLabel(v.tipo)}</span>
                    <span className="org-search-item-path">← {v.unidad_nombre || 'Sin unidad'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navegador de organigrama */}
          <OrgNavigator currentUnitId={currentUnitId} onNavigate={navigate} readOnly={true} />

          {/* Tarjetas de subunidades */}
          {hijos.length > 0 && (
            <>
              <div className="org-section-header">
                <h4>{currentUnitId ? 'Subunidades' : 'Unidades'}</h4>
                <span className="org-section-count">clic para ver sus vehículos</span>
              </div>
              <div className="org-card-grid">
                {hijos.map(u => {
                  const count = vehiculos.filter(v => v.unidad_organica_id === u.id).length;
                  return (
                    <div key={u.id} className="org-unit-card" role="button" tabIndex={0} onClick={() => navigate(u.id)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), navigate(u.id))}>
                      <div className="org-unit-card-top"><Building2 size={20} color="var(--primary-light)" /></div>
                      <h4 className="org-unit-card-name">{u.nombre}</h4>
                      <div className="org-unit-card-meta">{u.sigla && <span className="org-unit-card-sigla">{u.sigla}</span>}</div>
                      <div className="org-unit-card-footer">
                        <span><Truck size={12} /> {count} vehículo(s)</span>
                        <span className="org-enter-link">Ver vehículos →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Formulario */}
          {showForm && (
            <form className="crud-form" onSubmit={handleSave}>
              <h4>{editingId ? 'Editar Vehículo' : 'Nuevo Vehículo'}</h4>

              <fieldset className="crud-fieldset">
                <legend>Datos del Vehículo</legend>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div className="field-group"><label>Placa *</label><input className="crud-input" value={form.placa} onChange={e => setForm({ ...form, placa: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') })} required maxLength={10} placeholder="ABC-123" /></div>
                  <div className="field-group"><label>Tipo *</label><select className="crud-input" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>{TIPOS_VEHICULO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                  <div className="field-group"><label>Marca *</label><input className="crud-input" value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })} required /></div>
                  <div className="field-group"><label>Modelo *</label><input className="crud-input" value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })} required /></div>
                  <div className="field-group"><label>Año *</label><input className="crud-input" type="number" min="1900" max={new Date().getFullYear() + 1} value={form.anio} onChange={e => setForm({ ...form, anio: e.target.value })} required /></div>
                  <div className="field-group"><label>Color</label><input className="crud-input" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></div>
                  <div className="field-group"><label>N° Motor</label><input className="crud-input" value={form.nro_motor} onChange={e => setForm({ ...form, nro_motor: e.target.value })} /></div>
                  <div className="field-group"><label>N° Chasis</label><input className="crud-input" value={form.nro_chasis} onChange={e => setForm({ ...form, nro_chasis: e.target.value })} /></div>
                </div>
              </fieldset>

              <fieldset className="crud-fieldset">
                <legend>Capacidad y Combustible</legend>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div className="field-group"><label>Capacidad (m³ o ton)</label><input className="crud-input" type="number" step="0.1" min="0" value={form.capacidad} onChange={e => setForm({ ...form, capacidad: e.target.value })} /></div>
                  <div className="field-group"><label>Combustible</label><select className="crud-input" value={form.tipo_combustible} onChange={e => setForm({ ...form, tipo_combustible: e.target.value })}>{COMBUSTIBLES.map(c => <option key={c} value={c}>{(c || '').charAt(0).toUpperCase() + (c || '').slice(1)}</option>)}</select></div>
                </div>
              </fieldset>

              <fieldset className="crud-fieldset">
                <legend>Ubicación Orgánica</legend>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
                  <div className="field-group">
                    <label>Unidad Orgánica (buscar por nombre)</label>
                    {selectedUnidadNombre ? (
                      <div className="crud-unidad-selected">
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
                    <label>Conductor / Responsable</label>
                    {selectedResponsableNombre ? (
                      <div className="crud-unidad-selected">
                        <span>{selectedResponsableNombre}</span>
                        <button type="button" className="crud-btn-icon" onClick={clearResponsable}><X size={14} /></button>
                      </div>
                    ) : (
                      <div style={{ position: 'relative' }}>
                        <input className="crud-input" value={responsableSearch} onChange={e => setResponsableSearch(e.target.value)} placeholder="Buscar persona por nombre o DNI..." />
                        {responsableResults.length > 0 && (
                          <div className="org-search-dropdown">
                            {responsableResults.map(p => (
                              <button key={p.id} type="button" className="org-search-item" onClick={() => selectResponsable(p)}>
                                <span className="org-search-item-name">{p.nombres} {p.apellidos}</span>
                                <span className="org-search-item-sigla">{p.dni}</span>
                                <span className="org-search-item-path">← {p.tipo_nombre || 'Personal'}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </fieldset>

              <fieldset className="crud-fieldset">
                <legend>Estado y Kilometraje</legend>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div className="field-group"><label>Estado</label><select className="crud-input" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>{ESTADOS_VEHICULO.map(e => <option key={e} value={e}>{(e || '').charAt(0).toUpperCase() + (e || '').slice(1).replace('_', ' ')}</option>)}</select></div>
                  <div className="field-group"><label>Kilometraje Actual</label><input className="crud-input" type="number" min="0" value={form.kilometraje_actual} onChange={e => setForm({ ...form, kilometraje_actual: e.target.value })} /></div>
                  <div className="field-group"><label>Fecha Adquisición</label><input className="crud-input" type="date" value={form.fecha_adquisicion} onChange={e => setForm({ ...form, fecha_adquisicion: e.target.value })} /></div>
                  <div className="field-group" style={{ gridColumn: '1 / -1' }}><label>Observaciones</label><textarea className="crud-input" rows={2} value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} /></div>
                </div>
              </fieldset>

              <fieldset className="crud-fieldset">
                <legend>SOAT / Seguro</legend>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div className="field-group"><label>N° Póliza SOAT</label><input className="crud-input" value={form.nro_soat} onChange={e => setForm({ ...form, nro_soat: e.target.value })} /></div>
                  <div className="field-group"><label>Vigencia SOAT</label><input className="crud-input" type="date" value={form.vigencia_soat} onChange={e => setForm({ ...form, vigencia_soat: e.target.value })} /></div>
                  <div className="field-group"><label>Aseguradora</label><input className="crud-input" value={form.aseguradora_soat} onChange={e => setForm({ ...form, aseguradora_soat: e.target.value })} placeholder="Rimac, Pacifico, Mapfre..." /></div>
                </div>
              </fieldset>

              <fieldset className="crud-fieldset">
                <legend>Revisión Técnica</legend>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div className="field-group"><label>N° Certificado</label><input className="crud-input" value={form.nro_revision_tecnica} onChange={e => setForm({ ...form, nro_revision_tecnica: e.target.value })} /></div>
                  <div className="field-group"><label>Vigencia Rev. Técnica</label><input className="crud-input" type="date" value={form.vigencia_revision_tecnica} onChange={e => setForm({ ...form, vigencia_revision_tecnica: e.target.value })} /></div>
                </div>
              </fieldset>

              <div className="crud-form-actions">
                <button type="submit" className="crud-btn-primary" disabled={saving}>
                  <Save size={18} /> {saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear Vehículo')}
                </button>
                <button type="button" className="crud-btn-secondary" onClick={closeForm}><X size={18} /> Cancelar</button>
              </div>
            </form>
          )}

          {/* Tabla */}
          <div className="org-section-header" style={{ marginTop: 8 }}>
            <h4>{currentUnitId ? 'Vehículos en esta unidad' : 'Todos los vehículos'}</h4>
            <span className="org-section-count">{vehiculosEnUnidad.length} vehículo(s)</span>
          </div>
          <div className="crud-table-wrap">
            <table className="crud-table">
              <thead><tr>
                <th>#</th><th>Placa</th><th>Tipo</th><th>Marca / Modelo</th>
                {!currentUnitId && <th>Unidad</th>}
                <th>Responsable</th><th>Estado</th><th>SOAT</th><th>Rev. Técnica</th><th>Km</th><th>Acc</th>
              </tr></thead>
              <tbody>
                {vehiculosEnUnidad.length === 0 ? (
                  <tr><td colSpan={currentUnitId ? 10 : 11} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                    {currentUnitId ? 'Esta unidad no tiene vehículos asignados.' : 'No hay vehículos registrados.'}
                  </td></tr>
                ) : vehiculosEnUnidad.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td><span className="crud-td-strong" style={{ fontFamily: 'monospace' }}>{item.placa}</span></td>
                    <td><span className="crud-tag">{tipoLabel(item.tipo)}</span></td>
                    <td><span className="crud-td-strong">{item.marca} {item.modelo}</span> <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.anio}</span></td>
                    {!currentUnitId && <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.unidad_nombre || '—'}</td>}
                    <td style={{ fontSize: 12 }}>{item.responsable_nombre ? item.responsable_nombre.trim() : '—'}</td>
                    <td>{estadoBadge(item.estado)}</td>
                    <td>{expiryBadge(item.vigencia_soat)}</td>
                    <td>{expiryBadge(item.vigencia_revision_tecnica)}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{Number(item.kilometraje_actual).toLocaleString()}</td>
                    <td className="crud-td-actions">
                      <button className="crud-btn-sm crud-btn-edit" title="Ver mantenimientos" onClick={() => { selectVehiculoForMant(item); setActiveTab('mantenimientos'); }}><Wrench size={15} /></button>
                      {!readOnly && (
                        <>
                          <button className="crud-btn-sm crud-btn-edit" title="Editar" onClick={() => openEdit(item)}><Edit2 size={15} /></button>
                          <button className="crud-btn-sm crud-btn-delete" title="Dar de baja" onClick={() => handleDelete(item)}><Trash2 size={15} /></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ─── TAB: ALERTAS ────────────────────────── */}
      {activeTab === 'alertas' && (
        <>
          <div className="crud-header" style={{ marginBottom: 12 }}>
            <h4 style={{ margin: 0 }}>Panel de Alertas</h4>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>Ventana: 30 días</span>
              {!readOnly && (
                <button className="crud-btn-primary" onClick={handleGenerarAlertas}>
                  <AlertTriangle size={16} /> Generar Notificaciones
                </button>
              )}
            </div>
          </div>
          {alertasLoading ? (
            <p className="crud-loading">Cargando alertas...</p>
          ) : alertas ? (
            <div className="veh-alert-grid">
              {/* SOAT vencidos */}
              <div className="veh-alert-card">
                <div className="veh-alert-card-header">
                  <h4><Shield size={14} /> SOAT Vencidos</h4>
                  <span className={`veh-alert-card-count ${alertas.soat_vencidos.length > 0 ? 'danger' : 'ok'}`}>{alertas.soat_vencidos.length}</span>
                </div>
                {alertas.soat_vencidos.length === 0 ? (
                  <p className="veh-alert-empty">Sin SOAT vencidos</p>
                ) : alertas.soat_vencidos.map(v => (
                  <div key={v.id} className="veh-alert-item">
                    <span className="veh-alert-item-placa">{v.placa}</span>
                    <span className="veh-alert-item-date">{v.vigencia_soat.slice(0, 10)}</span>
                    <span className="veh-alert-item-days danger">Vencido {Math.abs(v.dias_restantes)}d</span>
                  </div>
                ))}
              </div>

              {/* SOAT próximos */}
              <div className="veh-alert-card">
                <div className="veh-alert-card-header">
                  <h4><Shield size={14} /> SOAT Próximos a Vencer</h4>
                  <span className={`veh-alert-card-count ${alertas.soat_proximos.length > 0 ? 'warning' : 'ok'}`}>{alertas.soat_proximos.length}</span>
                </div>
                {alertas.soat_proximos.length === 0 ? (
                  <p className="veh-alert-empty">Sin SOAT próximos a vencer</p>
                ) : alertas.soat_proximos.map(v => (
                  <div key={v.id} className="veh-alert-item">
                    <span className="veh-alert-item-placa">{v.placa}</span>
                    <span className="veh-alert-item-date">{v.vigencia_soat.slice(0, 10)}</span>
                    <span className={`veh-alert-item-days ${v.dias_restantes <= 15 ? 'danger' : 'warning'}`}>{v.dias_restantes}d</span>
                  </div>
                ))}
              </div>

              {/* Revisión vencidos */}
              <div className="veh-alert-card">
                <div className="veh-alert-card-header">
                  <h4><FileCheck size={14} /> Rev. Técnica Vencidas</h4>
                  <span className={`veh-alert-card-count ${alertas.revision_vencidos.length > 0 ? 'danger' : 'ok'}`}>{alertas.revision_vencidos.length}</span>
                </div>
                {alertas.revision_vencidos.length === 0 ? (
                  <p className="veh-alert-empty">Sin revisiones vencidas</p>
                ) : alertas.revision_vencidos.map(v => (
                  <div key={v.id} className="veh-alert-item">
                    <span className="veh-alert-item-placa">{v.placa}</span>
                    <span className="veh-alert-item-date">{v.vigencia_revision_tecnica.slice(0, 10)}</span>
                    <span className="veh-alert-item-days danger">Vencida {Math.abs(v.dias_restantes)}d</span>
                  </div>
                ))}
              </div>

              {/* Revisión próximos */}
              <div className="veh-alert-card">
                <div className="veh-alert-card-header">
                  <h4><FileCheck size={14} /> Rev. Técnica Próximas</h4>
                  <span className={`veh-alert-card-count ${alertas.revision_proximos.length > 0 ? 'warning' : 'ok'}`}>{alertas.revision_proximos.length}</span>
                </div>
                {alertas.revision_proximos.length === 0 ? (
                  <p className="veh-alert-empty">Sin revisiones próximas</p>
                ) : alertas.revision_proximos.map(v => (
                  <div key={v.id} className="veh-alert-item">
                    <span className="veh-alert-item-placa">{v.placa}</span>
                    <span className="veh-alert-item-date">{v.vigencia_revision_tecnica.slice(0, 10)}</span>
                    <span className={`veh-alert-item-days ${v.dias_restantes <= 15 ? 'danger' : 'warning'}`}>{v.dias_restantes}d</span>
                  </div>
                ))}
              </div>

              {/* Mantenimientos vencidos */}
              <div className="veh-alert-card">
                <div className="veh-alert-card-header">
                  <h4><Wrench size={14} /> Mantenimientos Vencidos</h4>
                  <span className={`veh-alert-card-count ${alertas.mantenimientos_vencidos.length > 0 ? 'danger' : 'ok'}`}>{alertas.mantenimientos_vencidos.length}</span>
                </div>
                {alertas.mantenimientos_vencidos.length === 0 ? (
                  <p className="veh-alert-empty">Sin mantenimientos vencidos</p>
                ) : alertas.mantenimientos_vencidos.map(m => (
                  <div key={m.id} className="veh-alert-item">
                    <span className="veh-alert-item-placa">{m.placa}</span>
                    <span className="veh-alert-item-date">{m.fecha_programada.slice(0, 10)}</span>
                    <span className="veh-alert-item-days danger">{m.dias_vencido}d vencido</span>
                  </div>
                ))}
              </div>

              {/* Mantenimientos próximos */}
              <div className="veh-alert-card">
                <div className="veh-alert-card-header">
                  <h4><Calendar size={14} /> Mantenimientos Próximos</h4>
                  <span className={`veh-alert-card-count ${alertas.mantenimientos_proximos.length > 0 ? 'warning' : 'ok'}`}>{alertas.mantenimientos_proximos.length}</span>
                </div>
                {alertas.mantenimientos_proximos.length === 0 ? (
                  <p className="veh-alert-empty">Sin mantenimientos próximos</p>
                ) : alertas.mantenimientos_proximos.map(m => (
                  <div key={m.id} className="veh-alert-item">
                    <span className="veh-alert-item-placa">{m.placa}</span>
                    <span className="veh-alert-item-date">{m.fecha_programada.slice(0, 10)}</span>
                    <span className={`veh-alert-item-days ${m.dias_restantes <= 7 ? 'danger' : 'warning'}`}>{m.dias_restantes}d</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="veh-alert-empty">Haga clic en la pestaña Alertas para cargar.</p>
          )}
        </>
      )}

      {/* ─── TAB: MANTENIMIENTOS ──────────────────── */}
      {activeTab === 'mantenimientos' && (
        <>
          <div className="veh-mant-header">
            <h4>Historial de Mantenimientos</h4>
            <select
              className="crud-input veh-mant-vehiculo-selector"
              value={selectedVehiculo?.id || ''}
              onChange={e => {
                const v = vehiculos.find(x => x.id === Number(e.target.value));
                if (v) selectVehiculoForMant(v);
              }}
            >
              <option value="">Seleccione un vehículo...</option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>{v.placa} — {v.marca} {v.modelo}</option>
              ))}
            </select>
            {!readOnly && selectedVehiculo && (
              <button className="crud-btn-primary" onClick={openCreateMant}>
                <Plus size={16} /> Nuevo Mantenimiento
              </button>
            )}
          </div>

          {!selectedVehiculo ? (
            <p className="org-empty-sm">Seleccione un vehículo para ver su historial de mantenimientos.</p>
          ) : mantLoading ? (
            <p className="crud-loading">Cargando mantenimientos...</p>
          ) : (
            <>
              {/* Vehículo info */}
              <div className="org-current-info" style={{ marginBottom: 12 }}>
                <Gauge size={16} />
                <span>{selectedVehiculo.placa} — {selectedVehiculo.marca} {selectedVehiculo.modelo} ({selectedVehiculo.anio})</span>
                <span className="org-current-sigla">{selectedVehiculo.kilometraje_actual?.toLocaleString()} km</span>
                {estadoBadge(selectedVehiculo.estado)}
              </div>

              {/* Form mantenimiento */}
              {showMantForm && (
                <form className="crud-form" onSubmit={handleSaveMant}>
                  <h4>{editingMantId ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'}</h4>
                  <fieldset className="crud-fieldset">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                      <div className="field-group"><label>Tipo *</label><select className="crud-input" value={mantForm.tipo} onChange={e => setMantForm({ ...mantForm, tipo: e.target.value })}>{TIPOS_MANTENIMIENTO.map(t => <option key={t} value={t}>{(t || '').charAt(0).toUpperCase() + (t || '').slice(1)}</option>)}</select></div>
                      <div className="field-group"><label>Estado</label><select className="crud-input" value={mantForm.estado} onChange={e => setMantForm({ ...mantForm, estado: e.target.value })}>{ESTADOS_MANTENIMIENTO.map(e => <option key={e} value={e}>{(e || '').charAt(0).toUpperCase() + (e || '').slice(1).replace('_', ' ')}</option>)}</select></div>
                      <div className="field-group"><label>Fecha Programada *</label><input className="crud-input" type="date" value={mantForm.fecha_programada} onChange={e => setMantForm({ ...mantForm, fecha_programada: e.target.value })} required /></div>
                      <div className="field-group"><label>Fecha Realizada</label><input className="crud-input" type="date" value={mantForm.fecha_realizada} onChange={e => setMantForm({ ...mantForm, fecha_realizada: e.target.value })} /></div>
                      <div className="field-group"><label>Kilometraje</label><input className="crud-input" type="number" min="0" value={mantForm.kilometraje_actual} onChange={e => setMantForm({ ...mantForm, kilometraje_actual: e.target.value })} /></div>
                      <div className="field-group"><label>Taller</label><input className="crud-input" value={mantForm.taller} onChange={e => setMantForm({ ...mantForm, taller: e.target.value })} /></div>
                      <div className="field-group"><label>Costo (S/)</label><input className="crud-input" type="number" step="0.01" min="0" value={mantForm.costo} onChange={e => setMantForm({ ...mantForm, costo: e.target.value })} /></div>
                      <div className="field-group" style={{ gridColumn: '1 / -1' }}><label>Descripción *</label><textarea className="crud-input" rows={2} value={mantForm.descripcion} onChange={e => setMantForm({ ...mantForm, descripcion: e.target.value })} required /></div>
                      <div className="field-group" style={{ gridColumn: '1 / -1' }}><label>Observaciones</label><textarea className="crud-input" rows={2} value={mantForm.observaciones} onChange={e => setMantForm({ ...mantForm, observaciones: e.target.value })} /></div>
                    </div>
                  </fieldset>
                  <div className="crud-form-actions">
                    <button type="submit" className="crud-btn-primary" disabled={savingMant}><Save size={18} /> {savingMant ? 'Guardando...' : (editingMantId ? 'Actualizar' : 'Registrar Mantenimiento')}</button>
                    <button type="button" className="crud-btn-secondary" onClick={closeMantForm}><X size={18} /> Cancelar</button>
                  </div>
                </form>
              )}

              {mantenimientos.length === 0 ? (
                <p className="org-empty-sm">Sin mantenimientos registrados para este vehículo.</p>
              ) : (
                <div className="crud-table-wrap">
                  <table className="crud-table">
                    <thead><tr>
                      <th>#</th><th>Tipo</th><th>Descripción</th><th>Taller</th><th>Fecha Prog.</th><th>Fecha Real.</th><th>Km</th><th>Costo</th><th>Estado</th><th>Acc</th>
                    </tr></thead>
                    <tbody>
                      {mantenimientos.map(m => (
                        <tr key={m.id}>
                          <td>{m.id}</td>
                          <td><span className="crud-tag">{(m.tipo || '').charAt(0).toUpperCase() + (m.tipo || '').slice(1)}</span></td>
                          <td className="crud-td-strong" style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.descripcion}</td>
                          <td style={{ fontSize: 12 }}>{m.taller || '—'}</td>
                          <td className="crud-td-date">{m.fecha_programada ? m.fecha_programada.slice(0, 10) : '—'}</td>
                          <td className="crud-td-date">{m.fecha_realizada ? m.fecha_realizada.slice(0, 10) : '—'}</td>
                          <td className="crud-td-number">{Number(m.kilometraje_actual).toLocaleString()}</td>
                          <td className="crud-td-number">S/ {Number(m.costo || 0).toFixed(2)}</td>
                          <td>{mantEstadoBadge(m.estado)}</td>
                          <td className="crud-td-actions">
                            {!readOnly && (
                              <>
                                <button className="crud-btn-sm crud-btn-edit" title="Editar" onClick={() => openEditMant(m)}><Edit2 size={15} /></button>
                                <button className="crud-btn-sm crud-btn-delete" title="Eliminar" onClick={() => handleDeleteMant(m)}><Trash2 size={15} /></button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default VehiculoManager;
