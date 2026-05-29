import React, { useEffect, useMemo, useState } from 'react';

const normalizeRole = (role) => (role || '').toUpperCase().trim();

const allModules = [
  {
    key: 'dashboard',
    icon: '📊',
    name: 'Dashboard',
    allowedRoles: ['ADMIN', 'ADMINISTRADOR'],
    summary: 'Resumen general de indicadores del sistema.',
  },
  {
    key: 'unidades',
    icon: '🚜',
    name: 'Gestión de Unidades',
    allowedRoles: ['ADMIN', 'ADMINISTRADOR', 'MAQUINARIAS'],
    summary: 'Registro y control de unidades (crear, editar y estado).',
  },
  {
    key: 'rutas-equipos',
    icon: '🛣️',
    name: 'Gestión de Rutas y Equipos',
    allowedRoles: ['ADMIN', 'ADMINISTRADOR', 'OPERADOR'],
    summary: 'Asignación de rutas con unidad, conductor y ayudante.',
  },
  {
    key: 'reclamos',
    icon: '📝',
    name: 'Gestión de Libro de Reclamos',
    allowedRoles: ['ADMIN', 'ADMINISTRADOR', 'OPERADOR DE NOTIFICACIONES'],
    summary: 'Atención y seguimiento de reclamos y reportes ciudadanos.',
  },
  {
    key: 'personal',
    icon: '👥',
    name: 'Gestión de Personal',
    allowedRoles: ['ADMIN', 'ADMINISTRADOR', 'RECURSOS'],
    summary: 'Alta y mantenimiento de personal (conductor, ayudante, limpieza).',
  },
];

const getBaseContentByModule = (moduleKey) => {
  const moduleContent = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Vista general de operación (contenido base).',
      bullets: ['Unidades activas (referencial)', 'Rutas del día (referencial)', 'Reclamos pendientes (referencial)'],
    },
    unidades: {
      title: 'Gestión de Unidades',
      subtitle: 'Módulo base: listado y acciones principales.',
      bullets: ['Crear unidad', 'Editar unidad', 'Cambiar estado: operativo / mantenimiento / inactivo'],
    },
    'rutas-equipos': {
      title: 'Gestión de Rutas y Equipos',
      subtitle: 'Módulo base: asignaciones de ruta.',
      bullets: ['Asignar unidad a ruta', 'Asignar conductor y ayudante', 'Programar fecha de asignación'],
    },
    reclamos: {
      title: 'Gestión de Libro de Reclamos',
      subtitle: 'Módulo base: bandeja de incidencias.',
      bullets: ['Ver reclamos/reportes', 'Cambiar estado: pendiente / en proceso / atendido', 'Registrar observación de atención'],
    },
    personal: {
      title: 'Gestión de Personal',
      subtitle: 'Módulo base: registro de colaboradores.',
      bullets: ['Crear personal', 'Editar personal', 'Clasificar tipo: conductor / ayudante / limpieza'],
    },
  };

  return moduleContent[moduleKey] || moduleContent.dashboard;
};

const AdminPanel = ({ onLogout, user }) => {
  const currentRole = normalizeRole(user?.rol);
  const isAdmin =
    ['ADMIN', 'ADMINISTRADOR'].includes(currentRole)
    || Number(user?.rol_id) === 1;

  const modules = useMemo(() => {
    if (isAdmin) return allModules;
    return allModules.filter((module) => module.allowedRoles.includes(currentRole));
  }, [currentRole, isAdmin]);

  const [activeModuleKey, setActiveModuleKey] = useState(() => modules[0]?.key || '');

  useEffect(() => {
    if (!modules.some((module) => module.key === activeModuleKey)) {
      setActiveModuleKey(modules[0]?.key || '');
    }
  }, [activeModuleKey, modules]);

  const activeModule = modules.find((module) => module.key === activeModuleKey) || modules[0];
  const currentContent = getBaseContentByModule(activeModule?.key || 'dashboard');

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">♻</div>
          <span>EcoQosqo</span>
        </div>

        <nav className="sidebar-nav">
          {modules.length > 0 ? (
            modules.map((module) => (
              <button
                key={module.key}
                className={`sidebar-item ${module.key === activeModule?.key ? 'active' : ''}`}
                onClick={() => setActiveModuleKey(module.key)}
                type="button"
              >
                {module.icon} {module.name}
              </button>
            ))
          ) : (
            <p className="sidebar-empty">Sin módulos asignados para este rol</p>
          )}
        </nav>

        <div className="sidebar-user">
          <p>{user?.usuario || 'Usuario'} ({currentRole || 'SIN ROL'})</p>
          <button onClick={onLogout}>Cerrar Sesión</button>
        </div>
      </aside>

      <main className="main-content">
        <header>
          <h2>Panel de Administrador - EcoQosqo</h2>
          <p>
            Acceso por rol habilitado.
            {isAdmin
              ? ' Tiene acceso completo a todos los módulos.'
              : ' Solo visualiza los módulos autorizados para su perfil.'}
          </p>
        </header>

        <section className="module-grid">
          {modules.map((module) => (
            <button
              key={module.key}
              className={`module-card module-card-button ${module.key === activeModule?.key ? 'active' : ''}`}
              onClick={() => setActiveModuleKey(module.key)}
              type="button"
            >
              <h3>{module.icon} {module.name}</h3>
              <p>{module.summary}</p>
            </button>
          ))}
        </section>

        {activeModule ? (
        <section className="module-card module-base-content">
          <h3>🧩 {currentContent.title}</h3>
          <p>{currentContent.subtitle}</p>
          <ul>
            {currentContent.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        ) : null}
      </main>
    </div>
  );
};

export default AdminPanel;
