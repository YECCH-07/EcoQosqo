import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Truck,
  Route,
  BookOpen,
  Users,
  LogOut,
  Puzzle,
} from 'lucide-react';

const normalizeRole = (role) => (role || '').toUpperCase().trim();

const allModules = [
  {
    key: 'dashboard',
    icon: LayoutDashboard,
    name: 'Dashboard',
    allowedRoles: ['ADMIN'],
    summary: 'Resumen general de indicadores del sistema.',
  },
  {
    key: 'unidades',
    icon: Truck,
    name: 'Gestión de Unidades',
    allowedRoles: ['ADMIN', 'MAQUINARIAS'],
    summary: 'Registro y control de unidades (crear, editar y estado).',
  },
  {
    key: 'rutas-equipos',
    icon: Route,
    name: 'Gestión de Rutas y Equipos',
    allowedRoles: ['ADMIN', 'OPERADOR'],
    summary: 'Asignación de rutas con unidad, conductor y ayudante.',
  },
  {
    key: 'reclamos',
    icon: BookOpen,
    name: 'Gestión de Libro de Reclamos',
    allowedRoles: ['ADMIN', 'OPERADOR DE NOTIFICACIONES'],
    summary: 'Atención y seguimiento de reclamos y reportes ciudadanos.',
  },
  {
    key: 'personal',
    icon: Users,
    name: 'Gestión de Personal',
    allowedRoles: ['ADMIN', 'RECURSOS'],
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
    ['ADMIN'].includes(currentRole)
    || Number(user?.rol_id) === 1;

  const modules = useMemo(() => {
    if (isAdmin) return allModules;
    return allModules.filter((module) => module.allowedRoles.includes(currentRole));
  }, [currentRole, isAdmin]);

  const [activeModuleKey, setActiveModuleKey] = useState(() => modules[0]?.key || '');
  const [inactivityWarning, setInactivityWarning] = useState(false);

  useEffect(() => {
    if (!modules.some((module) => module.key === activeModuleKey)) {
      setActiveModuleKey(modules[0]?.key || '');
    }
  }, [activeModuleKey, modules]);

  // Auto logout por inactividad (30 minutos)
  useEffect(() => {
    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 min
    const WARNING_BEFORE = 2 * 60 * 1000;     // avisar 2 min antes

    let logoutTimer;
    let warningTimer;

    const resetTimers = () => {
      setInactivityWarning(false);
      clearTimeout(logoutTimer);
      clearTimeout(warningTimer);

      warningTimer = setTimeout(() => {
        setInactivityWarning(true);
      }, INACTIVITY_LIMIT - WARNING_BEFORE);

      logoutTimer = setTimeout(() => {
        onLogout();
      }, INACTIVITY_LIMIT);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, resetTimers));

    resetTimers();

    return () => {
      clearTimeout(logoutTimer);
      clearTimeout(warningTimer);
      events.forEach((event) => window.removeEventListener(event, resetTimers));
    };
  }, [onLogout]);

  const activeModule = modules.find((module) => module.key === activeModuleKey) || modules[0];
  const currentContent = getBaseContentByModule(activeModule?.key || 'dashboard');

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <img src="/logo-cusco.svg" alt="EcoQosqo" className="brand-logo" />
          </div>
          <span>EcoQosqo</span>
        </div>

        <nav className="sidebar-nav">
          {modules.length > 0 ? (
            modules.map((module) => {
              const IconComponent = module.icon;
              return (
                <button
                  key={module.key}
                  className={`sidebar-item ${module.key === activeModule?.key ? 'active' : ''}`}
                  onClick={() => setActiveModuleKey(module.key)}
                  type="button"
                >
                  <IconComponent size={18} />
                  <span>{module.name}</span>
                </button>
              );
            })
          ) : (
            <p className="sidebar-empty">Sin módulos asignados para este rol</p>
          )}
        </nav>

        <div className="sidebar-user">
          <p>{user?.usuario || 'Usuario'} <span className="role-badge">{currentRole || 'SIN ROL'}</span></p>
          <button onClick={onLogout}>
            <LogOut size={14} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <h2>Panel de Administración &mdash; EcoQosqo</h2>
          <p>
            {isAdmin
              ? 'Acceso completo a todos los módulos del sistema.'
              : 'Visualiza los módulos autorizados para su perfil.'}
          </p>
        </header>

        {inactivityWarning && (
          <div className="inactivity-warning">
            Su sesión se cerrará por inactividad en 2 minutos. Realice alguna acción para mantenerla activa.
          </div>
        )}

        <section className="module-grid">
          {modules.map((module) => {
            const IconComponent = module.icon;
            const isActive = module.key === activeModule?.key;
            return (
              <button
                key={module.key}
                className={`module-card ${isActive ? 'module-card-active' : ''}`}
                onClick={() => setActiveModuleKey(module.key)}
                type="button"
              >
                <div className="module-card-icon">
                  <IconComponent size={24} />
                </div>
                <h3>{module.name}</h3>
                <p>{module.summary}</p>
              </button>
            );
          })}
        </section>

        {activeModule ? (
          <section className="module-detail">
            <div className="module-detail-header">
              <Puzzle size={20} />
              <h3>{currentContent.title}</h3>
            </div>
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
