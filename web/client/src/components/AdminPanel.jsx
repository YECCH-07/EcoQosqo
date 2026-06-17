import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Truck,
  Route,
  BookOpen,
  Users,
  LogOut,
  Puzzle,
  Shield,
} from 'lucide-react';
import PersonalManager from './PersonalManager';
import OrganigramaManager from './OrganigramaManager';
import VehiculoManager from './VehiculoManager';
import RutasEquiposManager from './RutasEquiposManager';
import DashboardPanel from './DashboardPanel';
import ReportesPanel from './ReportesPanel';
import UsuariosPanel from './UsuariosPanel';

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
    key: 'organigrama',
    icon: Building2,
    name: 'Organigrama',
    allowedRoles: ['ADMIN'],
    summary: 'Estructura orgánica de la municipalidad (gerencias, subgerencias, oficinas).',
  },
  {
    key: 'vehiculos',
    icon: Truck,
    name: 'Módulo de Vehículos',
    allowedRoles: ['ADMIN', 'MAQUINARIAS'],
    summary: 'Flota vehicular: SOAT, revisión técnica, mantenimientos y alertas.',
  },
  {
    key: 'rutas-equipos',
    icon: Route,
    name: 'Gestión de Rutas y Equipos',
    allowedRoles: ['ADMIN', 'OPERADOR'],
    summary: 'Asignación de rutas con unidad, conductor y ayudante.',
  },
  {
    key: 'notificaciones',
    icon: BookOpen,
    name: 'Gestión de Reportes',
    allowedRoles: ['ADMIN', 'OPERADOR DE NOTIFICACIONES'],
    summary: 'Atención de reportes ciudadanos: bandeja, cambio de estado y respuesta.',
  },
  {
    key: 'usuarios',
    icon: Shield,
    name: 'Gestión de Usuarios',
    allowedRoles: ['ADMIN'],
    summary: 'Administración de cuentas de acceso al sistema.',
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
    'rutas-equipos': {
      title: 'Gestión de Rutas y Equipos',
      subtitle: 'Módulo base: asignaciones de ruta.',
      bullets: ['Asignar unidad a ruta', 'Asignar conductor y ayudante', 'Programar fecha de asignación'],
    },
    notificaciones: {
      title: 'Gestión de Reportes Ciudadanos',
      subtitle: 'Atención de reportes: bandeja, estados y respuesta a ciudadanos.',
      bullets: ['Ver reportes pendientes', 'Cambiar estado: pendiente / en proceso / atendido', 'Responder al ciudadano (notificación push)'],
    },
    vehiculos: {
      title: 'Módulo de Vehículos',
      subtitle: 'Gestión de la flota vehicular municipal.',
      bullets: ['Registrar vehículos', 'Control de SOAT y revisión técnica', 'Historial de mantenimientos', 'Alertas de vencimientos'],
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
    || Number(user?.rol_id) === 1
    || Number(user?.rol_id) === 7;

  const modules = useMemo(() => {
    return allModules.filter((module) => module.allowedRoles.includes(currentRole));
  }, [currentRole]);

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
        {inactivityWarning && (
          <div className="inactivity-warning">
            Su sesión se cerrará por inactividad en 2 minutos. Realice alguna acción para mantenerla activa.
          </div>
        )}

        {activeModule?.key === 'dashboard' ? (
          <DashboardPanel key={activeModule.key} />
        ) : activeModule?.key === 'usuarios' ? (
          <UsuariosPanel key={activeModule.key} />
        ) : activeModule?.key === 'notificaciones' ? (
          <ReportesPanel key={activeModule.key} />
        ) : activeModule?.key === 'rutas-equipos' ? (
          <RutasEquiposManager key={activeModule.key} />
        ) : activeModule?.key === 'vehiculos' ? (
          <VehiculoManager key={activeModule.key} readOnly={isAdmin} />
        ) : activeModule?.key === 'personal' ? (
          <PersonalManager key={activeModule.key} readOnly={isAdmin} />
        ) : activeModule?.key === 'organigrama' ? (
          <OrganigramaManager key={activeModule.key} />
        ) : activeModule ? (
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
