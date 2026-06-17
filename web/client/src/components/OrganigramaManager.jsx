import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { Building2, Plus, Edit2, Trash2, Save, X, Users } from 'lucide-react';
import OrgNavigator from './OrgNavigator';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const NIVELES = ['Alta Dirección', 'Gerencia', 'Subgerencia'];
const emptyForm = { nombre: '', sigla: '', padre_id: '', nivel: '0', orden: '0' };

const OrganigramaManager = ({ readOnly = false }) => {
  const [currentUnitId, setCurrentUnitId] = useState(null);
  const [hijos, setHijos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Cargar hijos de la unidad actual (o raíces si null)
  const loadHijos = useCallback(async () => {
    setLoading(true);
    try {
      const url = currentUnitId
        ? `${API}/unidades-organicas/${currentUnitId}/hijos`
        : `${API}/unidades-organicas/raiz/hijos`;
      const res = await axios.get(url, { headers: headers() });
      setHijos(res.data);
      setError('');
    } catch (err) {
      setError('Error al cargar unidades');
    } finally {
      setLoading(false);
    }
  }, [currentUnitId]);

  useEffect(() => { loadHijos(); }, [loadHijos]);

  // Cargar todas las unidades y personal (para conteo recursivo)
  useEffect(() => {
    Promise.all([
      axios.get(`${API}/unidades-organicas`, { headers: headers() }),
      axios.get(`${API}/personal`, { headers: headers() }),
    ]).then(([resU, resP]) => {
      setUnidades(resU.data);
      setPersonal(resP.data);
    }).catch(() => {});
  }, []);

  // Mapa de personal por unidad (memoizado)
  const personalPorUnidad = useMemo(() => {
    const map = {};
    personal.forEach(p => {
      const uid = p.unidad_organica_id;
      if (!map[uid]) map[uid] = 0;
      map[uid]++;
    });
    return map;
  }, [personal]);

  // Contar personal directo en una unidad
  const countDirect = (id) => personalPorUnidad[id] || 0;

  // Mapa de hijos (memoizado)
  const childrenMap = useMemo(() => {
    const map = {};
    unidades.forEach(u => {
      const pid = u.padre_id || 'root';
      if (!map[pid]) map[pid] = [];
      map[pid].push(u.id);
    });
    return map;
  }, [unidades]);

  // Contar personal recursivo memoizado
  const countRecursive = useMemo(() => {
    const cache = {};
    const compute = (unitId) => {
      if (cache[unitId] !== undefined) return cache[unitId];
      let total = countDirect(unitId);
      const queue = [...(childrenMap[unitId] || [])];
      while (queue.length > 0) {
        const childId = queue.shift();
        total += countDirect(childId);
        if (childrenMap[childId]) queue.push(...childrenMap[childId]);
      }
      cache[unitId] = total;
      return total;
    };
    // Precomputar para todas las unidades
    unidades.forEach(u => compute(u.id));
    return compute;
  }, [personalPorUnidad, childrenMap, unidades]);

  const navigate = (id) => {
    setCurrentUnitId(id);
    setSuccess('');
  };

  const openCreate = () => {
    setForm({ ...emptyForm, padre_id: currentUnitId || '', nivel: currentUnitId ? '1' : '0' });
    setEditingId(null);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const openEdit = (unidad) => {
    setForm({
      nombre: unidad.nombre || '',
      sigla: unidad.sigla || '',
      padre_id: unidad.padre_id || '',
      nivel: String(unidad.nivel || 0),
      orden: String(unidad.orden || 0),
    });
    setEditingId(unidad.id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      nombre: form.nombre.trim(),
      sigla: form.sigla.trim(),
      padre_id: form.padre_id ? Number(form.padre_id) : null,
      nivel: Number(form.nivel),
      orden: Number(form.orden),
    };
    try {
      if (editingId) {
        await axios.put(`${API}/unidades-organicas/${editingId}`, payload, { headers: headers() });
        setSuccess('Unidad actualizada');
      } else {
        await axios.post(`${API}/unidades-organicas`, payload, { headers: headers() });
        setSuccess('Unidad creada');
      }
      closeForm();
      loadHijos();
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (unidad) => {
    const hijosCount = unidad.hijos_count || 0;
    const persCount = countRecursive(unidad.id);
    let msg = `¿Eliminar "${unidad.nombre}"?`;
    if (hijosCount > 0) msg += `\n${hijosCount} subunidad(es) quedarán sin padre.`;
    if (persCount > 0) msg += `\n${persCount} persona(s) quedarán sin unidad.`;
    if (!window.confirm(msg)) return;
    try {
      await axios.delete(`${API}/unidades-organicas/${unidad.id}`, { headers: headers() });
      setSuccess('Unidad eliminada');
      loadHijos();
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al eliminar');
    }
  };

  return (
    <div className="crud-container">
      <div className="crud-header">
        <h3>Organigrama Municipal</h3>
        {currentUnitId && !readOnly && (
          <button className="crud-btn-primary" onClick={openCreate}>
            <Plus size={18} /> Nueva Subunidad
          </button>
        )}
      </div>

      <OrgNavigator currentUnitId={currentUnitId} onNavigate={navigate} readOnly={false} />

      {success && <p className="crud-success">{success}</p>}
      {error && <p className="crud-error">{error}</p>}

      {showForm && (
        <form className="crud-form" onSubmit={handleSave}>
          <h4>{editingId ? 'Editar Unidad' : 'Nueva Unidad'}</h4>
          <div className="crud-form-grid">
            <div className="field-group" style={{ gridColumn: 'span 2' }}>
              <label>Nombre *</label>
              <input className="crud-input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required placeholder="Nombre de la unidad" />
            </div>
            <div className="field-group">
              <label>Sigla</label>
              <input className="crud-input" value={form.sigla} onChange={e => setForm({ ...form, sigla: e.target.value })} placeholder="Ej: GGA" />
            </div>
            <div className="field-group">
              <label>Nivel</label>
              <select className="crud-input" value={form.nivel} onChange={e => setForm({ ...form, nivel: e.target.value })}>
                {NIVELES.map((n, i) => <option key={i} value={String(i)}>{n}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label>Orden</label>
              <input className="crud-input" type="number" min="0" value={form.orden} onChange={e => setForm({ ...form, orden: e.target.value })} />
            </div>
          </div>
          <div className="crud-form-actions">
            <button type="submit" className="crud-btn-primary" disabled={saving}><Save size={18} /> {saving ? 'Guardando...' : 'Guardar'}</button>
            <button type="button" className="crud-btn-secondary" onClick={closeForm}><X size={18} /> Cancelar</button>
          </div>
        </form>
      )}

      {/* Estado: organigrama vacío */}
      {!currentUnitId && hijos.length === 0 && !loading && (
        <div className="org-empty">
          <Building2 size={48} color="var(--text-muted)" />
          <p>El organigrama está vacío</p>
          {!readOnly && (
          <button className="crud-btn-primary" onClick={openCreate} style={{ marginTop: 16 }}>
            <Plus size={18} /> Crear Primera Unidad
          </button>
          )}
        </div>
      )}

      {/* Vista raíz: Unidades de Alta Dirección */}
      {!currentUnitId && hijos.length > 0 && (
        <>
          <div className="org-section-header">
            <h4>Unidades de Alta Dirección</h4>
            <span className="org-section-count">{hijos.length} unidad(es) · {personal.length} servidores en total</span>
          </div>
          <div className="org-card-grid">
            {hijos.map(u => {
              const directCount = countDirect(u.id);
              const totalCount = countRecursive(u.id);
              const hasSubs = u.hijos_count > 0;
              return (
                <div key={u.id} className="org-unit-card" role="button" tabIndex={0} onClick={() => navigate(u.id)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), navigate(u.id))}>
                  <div className="org-unit-card-top">
                    <Building2 size={20} color="var(--primary-light)" />
                    <div className="org-unit-card-actions" onClick={e => e.stopPropagation()}>
                      <button className="org-act-btn" title="Editar" onClick={() => openEdit(u)}><Edit2 size={14} /></button>
                      {!readOnly && <button className="org-act-btn org-act-del" title="Eliminar" onClick={() => handleDelete(u)}><Trash2 size={14} /></button>}
                    </div>
                  </div>
                  <h4 className="org-unit-card-name">{u.nombre}</h4>
                  <div className="org-unit-card-meta">
                    {u.sigla && <span className="org-unit-card-sigla">{u.sigla}</span>}
                    <span className="org-unit-card-nivel">{NIVELES[u.nivel] || 'Nivel ' + u.nivel}</span>
                  </div>
                  <div className="org-unit-card-footer">
                    <span title={`${directCount} directo(s) + ${totalCount - directCount} en subunidades`}>
                      <Users size={12} />
                      {hasSubs ? ` ${totalCount} total (${directCount} directo)` : ` ${totalCount} persona(s)`}
                    </span>
                    <span className="org-enter-link">{hasSubs ? `${u.hijos_count} sub →` : 'Entrar →'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Vista interior: Subunidades de la unidad actual */}
      {currentUnitId && (
        <>
          <div className="org-section-header">
            <h4>{hijos.length > 0 ? `Subunidades (${hijos.length})` : 'Subunidades'}</h4>
            <span className="org-section-count">
              <Users size={12} /> {countDirect(currentUnitId)} directo(s) · {countRecursive(currentUnitId)} total (incluye subunidades)
            </span>
          </div>
          {hijos.length > 0 ? (
            <div className="org-card-grid">
              {hijos.map(u => {
                const directCount = countDirect(u.id);
                const totalCount = countRecursive(u.id);
                const hasSubs = u.hijos_count > 0;
                return (
                  <div key={u.id} className="org-unit-card" role="button" tabIndex={0} onClick={() => navigate(u.id)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), navigate(u.id))}>
                    <div className="org-unit-card-top">
                      <Building2 size={20} color="var(--primary-light)" />
                      <div className="org-unit-card-actions" onClick={e => e.stopPropagation()}>
                        <button className="org-act-btn" title="Editar" onClick={() => openEdit(u)}><Edit2 size={14} /></button>
                        {!readOnly && <button className="org-act-btn org-act-del" title="Eliminar" onClick={() => handleDelete(u)}><Trash2 size={14} /></button>}
                      </div>
                    </div>
                    <h4 className="org-unit-card-name">{u.nombre}</h4>
                    <div className="org-unit-card-meta">
                      {u.sigla && <span className="org-unit-card-sigla">{u.sigla}</span>}
                      <span className="org-unit-card-nivel">{NIVELES[u.nivel] || 'Nivel ' + u.nivel}</span>
                    </div>
                    <div className="org-unit-card-footer">
                      <span title={`${directCount} directo(s) + ${totalCount - directCount} en subunidades`}>
                        <Users size={12} />
                        {hasSubs ? ` ${totalCount} total (${directCount} dir.)` : ` ${totalCount} persona(s)`}
                      </span>
                      <span className="org-enter-link">{hasSubs ? `${u.hijos_count} sub →` : 'Entrar →'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="org-empty-sm">
              <p>Esta unidad no tiene subunidades. Use el botón "Nueva Subunidad" para crear una.</p>
            </div>
          )}
        </>
      )}

      {loading && <p className="crud-loading">Cargando...</p>}
    </div>
  );
};

export default OrganigramaManager;
