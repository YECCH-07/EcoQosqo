import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Save, X, Key, Users, Shield } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const emptyForm = { nombre: '', usuario: '', correo: '', password: '', rol_id: '' };

const UsuariosPanel = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [contador, setContador] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showPassForm, setShowPassForm] = useState(null);
  const [newPass, setNewPass] = useState('');
  const [filtro, setFiltro] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resUsuarios, resContador] = await Promise.all([
        axios.get(`${API}/usuarios`, { headers: headers() }),
        axios.get(`${API}/usuarios/contador`, { headers: headers() }),
      ]);
      setUsuarios(resUsuarios.data);
      setContador(resContador.data);
      setError('');
    } catch (err) { setError('Error al cargar usuarios'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); setError(''); setSuccess(''); };
  const openEdit = (u) => { setForm({ nombre: u.nombre || '', usuario: u.usuario || '', correo: u.correo || '', password: '', rol_id: u.rol_id || '', activo: u.activo }); setEditingId(u.id); setShowForm(true); setError(''); setSuccess(''); };
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); setError(''); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    const payload = { nombre: form.nombre, usuario: form.usuario, correo: form.correo, rol_id: Number(form.rol_id), activo: form.activo !== false };
    try {
      if (editingId) {
        await axios.put(`${API}/usuarios/${editingId}`, payload, { headers: headers() });
        setSuccess('Usuario actualizado');
      } else {
        payload.password = form.password;
        await axios.post(`${API}/usuarios`, payload, { headers: headers() });
        setSuccess('Usuario creado');
      }
      closeForm(); loadData();
    } catch (err) { setError(err?.response?.data?.message || 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const handleChangePass = async (id) => {
    if (!newPass || newPass.length < 6) return setError('Mínimo 6 caracteres');
    try {
      await axios.patch(`${API}/usuarios/${id}/password`, { password: newPass }, { headers: headers() });
      setSuccess('Contraseña actualizada');
      setShowPassForm(null); setNewPass('');
    } catch (err) { setError(err?.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`¿Desactivar a "${u.usuario}"?`)) return;
    try {
      await axios.delete(`${API}/usuarios/${u.id}`, { headers: headers() });
      setSuccess('Usuario desactivado'); loadData();
    } catch (err) { setError(err?.response?.data?.message || 'Error'); }
  };

  const rolesUnicos = [...new Set(usuarios.map(u => u.rol).filter(Boolean))];
  const usuariosFiltrados = filtro ? usuarios.filter(u => u.rol === filtro) : usuarios;

  return (
    <div className="crud-container">
      <div className="crud-header">
        <h3>Gestión de Usuarios</h3>
        <button className="crud-btn-primary" onClick={openCreate}><Plus size={18} /> Nuevo Usuario</button>
      </div>

      {success && <p className="crud-success">{success}</p>}
      {error && <p className="crud-error">{error}</p>}

      {/* Dashboard de conteo */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        {contador.map(c => (
          <div key={c.rol} style={{
            background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10, minWidth: 140,
          }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary-light)' }}>{c.cnt}</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.rol}</span>
          </div>
        ))}
      </div>

      {/* Formulario */}
      {showForm && (
        <form className="crud-form" onSubmit={handleSave}>
          <h4>{editingId ? 'Editar Usuario' : 'Nuevo Usuario'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <div className="field-group"><label>Nombre *</label><input className="crud-input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required /></div>
            <div className="field-group"><label>Usuario *</label><input className="crud-input" value={form.usuario} onChange={e => setForm({ ...form, usuario: e.target.value })} required /></div>
            <div className="field-group"><label>Correo</label><input className="crud-input" type="email" value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })} /></div>
            <div className="field-group"><label>Rol *</label>
              <select className="crud-input" value={form.rol_id} onChange={e => setForm({ ...form, rol_id: e.target.value })} required>
                <option value="">Seleccione...</option>
                {[...new Set(usuarios.map(u => u.rol))].map(r => {
                  const u = usuarios.find(x => x.rol === r);
                  return <option key={r} value={u?.rol_id}>{r}</option>;
                })}
              </select></div>
            {!editingId && <div className="field-group"><label>Contraseña *</label><input className="crud-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>}
            {editingId && <div className="field-group"><label>Activo</label>
              <select className="crud-input" value={form.activo ? '1' : '0'} onChange={e => setForm({ ...form, activo: e.target.value === '1' })}>
                <option value="1">Activo</option><option value="0">Inactivo</option>
              </select></div>}
          </div>
          <div className="crud-form-actions">
            <button type="submit" className="crud-btn-primary" disabled={saving}><Save size={18} /> {saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear Usuario')}</button>
            <button type="button" className="crud-btn-secondary" onClick={closeForm}><X size={18} /> Cancelar</button>
          </div>
        </form>
      )}

      {/* Filtros por rol */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        <button className={`crud-btn-sm ${!filtro ? 'crud-btn-primary' : 'crud-btn-secondary'}`} onClick={() => setFiltro('')}>Todos ({usuarios.length})</button>
        {rolesUnicos.map(r => (
          <button key={r} className={`crud-btn-sm ${filtro === r ? 'crud-btn-primary' : 'crud-btn-secondary'}`} onClick={() => setFiltro(r)}>
            {r} ({usuarios.filter(u => u.rol === r).length})
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="crud-table-wrap">
        <table className="crud-table">
          <thead><tr><th>#</th><th>Usuario</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acc</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>Cargando...</td></tr> :
             usuariosFiltrados.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No hay usuarios.</td></tr> :
             usuariosFiltrados.map(u => (
              <tr key={u.id} style={{ opacity: u.activo ? 1 : 0.5 }}>
                <td>{u.id}</td>
                <td className="crud-td-strong">{u.usuario}</td>
                <td>{u.nombre}</td>
                <td style={{ fontSize: 12 }}>{u.correo || '—'}</td>
                <td><span className="crud-tag">{u.rol}</span></td>
                <td>{u.activo ? <span style={{ color: '#155724', fontSize: 12, fontWeight: 600 }}>Activo</span> : <span style={{ color: '#721C24', fontSize: 12 }}>Inactivo</span>}</td>
                <td className="crud-td-actions">
                  <button className="crud-btn-sm crud-btn-edit" onClick={() => openEdit(u)}><Edit2 size={15} /></button>
                  <button className="crud-btn-sm" onClick={() => setShowPassForm(u.id)} title="Cambiar contraseña" style={{ background: '#FFF3CD', color: '#856404', border: 'none', cursor: 'pointer', borderRadius: 6, padding: 4 }}><Key size={15} /></button>
                  <button className="crud-btn-sm crud-btn-delete" onClick={() => handleDelete(u)}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal cambiar contraseña */}
      {showPassForm && (
        <div className="crud-form" style={{ marginTop: 16 }}>
          <h4>Cambiar Contraseña — Usuario #{showPassForm}</h4>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input className="crud-input" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Nueva contraseña (mín 6 caracteres)" style={{ flex: 1 }} />
            <button className="crud-btn-primary" onClick={() => handleChangePass(showPassForm)}><Save size={14} /> Cambiar</button>
            <button className="crud-btn-secondary" onClick={() => { setShowPassForm(null); setNewPass(''); }}><X size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosPanel;
