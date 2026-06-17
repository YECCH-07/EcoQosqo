const vehiculoModel = require('../models/vehiculoModel');
const mantenimientoModel = require('../models/mantenimientoModel');
const notificationModel = require('../models/notificationModel');

const TIPOS_VALIDOS = ['camion_recolector', 'compactador', 'volquete', 'camioneta', 'sedan', 'moto', 'otro'];
const COMBUSTIBLES_VALIDOS = ['diesel', 'gasolina', 'gnv', 'electrico'];
const ESTADOS_VALIDOS = ['operativo', 'mantenimiento', 'fuera_servicio', 'baja'];
const DIAS_ALERTA = 30;

// ─── Helpers ────────────────────────────────────────

const notificarSiAlerta = (vehiculo) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (vehiculo.vigencia_soat) {
    const diff = Math.ceil((new Date(vehiculo.vigencia_soat) - hoy) / (1000 * 60 * 60 * 24));
    if (diff <= DIAS_ALERTA && diff >= -90) {
      const estado = diff < 0 ? 'VENCIDO' : `en ${diff} dias`;
      notificationModel.findRecentSimilar('vencimiento_soat', vehiculo.placa, 24, (err, exists) => {
        if (!err && !exists) {
          notificationModel.create({
            titulo: 'SOAT — Alerta de vencimiento',
            mensaje: `El SOAT del vehiculo ${vehiculo.placa} ${estado} (${vehiculo.vigencia_soat.slice(0, 10)}).`,
            tipo: 'vencimiento_soat',
            rol_id: 3,
          }, () => {});
        }
      });
    }
  }

  if (vehiculo.vigencia_revision_tecnica) {
    const diff = Math.ceil((new Date(vehiculo.vigencia_revision_tecnica) - hoy) / (1000 * 60 * 60 * 24));
    if (diff <= DIAS_ALERTA && diff >= -90) {
      const estado = diff < 0 ? 'VENCIDA' : `en ${diff} dias`;
      notificationModel.findRecentSimilar('vencimiento_revision', vehiculo.placa, 24, (err, exists) => {
        if (!err && !exists) {
          notificationModel.create({
            titulo: 'Revision Tecnica — Alerta de vencimiento',
            mensaje: `La revision tecnica del vehiculo ${vehiculo.placa} vence ${estado} (${vehiculo.vigencia_revision_tecnica.slice(0, 10)}).`,
            tipo: 'vencimiento_revision',
            rol_id: 3,
          }, () => {});
        }
      });
    }
  }
};

// ─── CRUD Vehículos ─────────────────────────────────

const listar = (req, res) => {
  vehiculoModel.findAll((err, vehiculos) => {
    if (err) return res.status(500).json({ message: 'Error al obtener vehiculos' });
    return res.json(vehiculos);
  });
};

const obtener = (req, res) => {
  const { id } = req.params;
  vehiculoModel.findById(id, (err, vehiculo) => {
    if (err) return res.status(500).json({ message: 'Error al obtener el vehiculo' });
    if (!vehiculo) return res.status(404).json({ message: 'Vehiculo no encontrado' });
    return res.json(vehiculo);
  });
};

const buscar = (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) return res.json([]);
  vehiculoModel.search(q.trim(), (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al buscar vehiculos' });
    return res.json(results);
  });
};

const listarPorUnidad = (req, res) => {
  const { id } = req.params;
  vehiculoModel.findByUnidad(id, (err, vehiculos) => {
    if (err) return res.status(500).json({ message: 'Error al obtener vehiculos de la unidad' });
    return res.json(vehiculos);
  });
};

const crear = (req, res) => {
  const {
    placa, tipo, marca, modelo, anio, color, nro_motor, nro_chasis,
    capacidad, tipo_combustible, unidad_organica_id, responsable_id,
    estado, kilometraje_actual, fecha_adquisicion, observaciones,
    nro_soat, vigencia_soat, aseguradora_soat,
    nro_revision_tecnica, vigencia_revision_tecnica,
  } = req.body;

  if (!placa || !placa.trim()) {
    return res.status(400).json({ message: 'La placa es obligatoria' });
  }
  if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
    return res.status(400).json({ message: 'El tipo de vehiculo no es valido' });
  }
  if (!marca || !marca.trim()) {
    return res.status(400).json({ message: 'La marca es obligatoria' });
  }
  if (!modelo || !modelo.trim()) {
    return res.status(400).json({ message: 'El modelo es obligatorio' });
  }
  if (!anio || isNaN(Number(anio)) || Number(anio) < 1900 || Number(anio) > new Date().getFullYear() + 1) {
    return res.status(400).json({ message: 'El ano no es valido' });
  }

  const data = {
    placa: placa.trim(), tipo, marca: marca.trim(), modelo: modelo.trim(),
    anio: Number(anio), color: color || '', nro_motor: nro_motor || '', nro_chasis: nro_chasis || '',
    capacidad: isNaN(Number(capacidad)) ? 0 : Number(capacidad),
    tipo_combustible: COMBUSTIBLES_VALIDOS.includes(tipo_combustible) ? tipo_combustible : 'diesel',
    unidad_organica_id: unidad_organica_id ? Number(unidad_organica_id) : null,
    responsable_id: responsable_id ? Number(responsable_id) : null,
    estado: ESTADOS_VALIDOS.includes(estado) ? estado : 'operativo',
    kilometraje_actual: isNaN(Number(kilometraje_actual)) ? 0 : Number(kilometraje_actual),
    fecha_adquisicion: fecha_adquisicion || null,
    observaciones: observaciones || '',
    nro_soat: nro_soat || '', vigencia_soat: vigencia_soat || null,
    aseguradora_soat: aseguradora_soat || '',
    nro_revision_tecnica: nro_revision_tecnica || '',
    vigencia_revision_tecnica: vigencia_revision_tecnica || null,
  };

  vehiculoModel.create(data, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Ya existe un vehiculo con esa placa' });
      }
      return res.status(500).json({ message: 'Error al crear el vehiculo' });
    }
    notificarSiAlerta({ placa: data.placa, vigencia_soat: data.vigencia_soat, vigencia_revision_tecnica: data.vigencia_revision_tecnica });
    return res.status(201).json(result);
  });
};

const actualizar = (req, res) => {
  const { id } = req.params;
  const {
    placa, tipo, marca, modelo, anio, color, nro_motor, nro_chasis,
    capacidad, tipo_combustible, unidad_organica_id, responsable_id,
    estado, kilometraje_actual, fecha_adquisicion, observaciones,
    nro_soat, vigencia_soat, aseguradora_soat,
    nro_revision_tecnica, vigencia_revision_tecnica,
  } = req.body;

  if (!placa || !placa.trim() || !marca || !marca.trim() || !modelo || !modelo.trim() || !tipo) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  const data = {
    placa: placa.trim(), tipo, marca: marca.trim(), modelo: modelo.trim(),
    anio: isNaN(Number(anio)) ? new Date().getFullYear() : Number(anio),
    color: color || '', nro_motor: nro_motor || '', nro_chasis: nro_chasis || '',
    capacidad: isNaN(Number(capacidad)) ? 0 : Number(capacidad),
    tipo_combustible: COMBUSTIBLES_VALIDOS.includes(tipo_combustible) ? tipo_combustible : 'diesel',
    unidad_organica_id: unidad_organica_id ? Number(unidad_organica_id) : null,
    responsable_id: responsable_id ? Number(responsable_id) : null,
    estado: ESTADOS_VALIDOS.includes(estado) ? estado : 'operativo',
    kilometraje_actual: isNaN(Number(kilometraje_actual)) ? 0 : Number(kilometraje_actual),
    fecha_adquisicion: fecha_adquisicion || null,
    observaciones: observaciones || '',
    nro_soat: nro_soat || '', vigencia_soat: vigencia_soat || null,
    aseguradora_soat: aseguradora_soat || '',
    nro_revision_tecnica: nro_revision_tecnica || '',
    vigencia_revision_tecnica: vigencia_revision_tecnica || null,
  };

  vehiculoModel.update(id, data, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Ya existe otro vehiculo con esa placa' });
      }
      return res.status(500).json({ message: 'Error al actualizar el vehiculo' });
    }
    if (!result) return res.status(404).json({ message: 'Vehiculo no encontrado' });
    notificarSiAlerta({ placa: data.placa, vigencia_soat: data.vigencia_soat, vigencia_revision_tecnica: data.vigencia_revision_tecnica });
    return res.json(result);
  });
};

const eliminar = (req, res) => {
  const { id } = req.params;
  vehiculoModel.remove(id, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar el vehiculo' });
    if (!result) return res.status(404).json({ message: 'Vehiculo no encontrado' });
    return res.json({ message: 'Vehiculo dado de baja correctamente' });
  });
};

// ─── Alertas ────────────────────────────────────────

const alertas = (req, res) => {
  vehiculoModel.findExpiringSOAT(DIAS_ALERTA, (errSoat, soatProximos) => {
    if (errSoat) {
      return res.status(500).json({ message: 'Error al consultar alertas SOAT' });
    }
    vehiculoModel.findExpiringRevision(DIAS_ALERTA, (errRev, revProximos) => {
      if (errRev) {
        return res.status(500).json({ message: 'Error al consultar alertas de revision tecnica' });
      }
      // SOAT vencidos (fecha < hoy pero dentro del rango)
      const soatVencidos = soatProximos.filter(v => Number(v.dias_restantes) < 0);
      const soatActivos = soatProximos.filter(v => Number(v.dias_restantes) >= 0);
      const revVencidos = revProximos.filter(v => Number(v.dias_restantes) < 0);
      const revActivos = revProximos.filter(v => Number(v.dias_restantes) >= 0);

      mantenimientoModel.findVencidos((errMantVenc, mantVencidos) => {
        if (errMantVenc) {
          return res.status(500).json({ message: 'Error al consultar mantenimientos' });
        }
        mantenimientoModel.findProximos(DIAS_ALERTA, (errMantProx, mantProximos) => {
          if (errMantProx) {
            return res.status(500).json({ message: 'Error al consultar mantenimientos' });
          }
          return res.json({
            soat_vencidos: soatVencidos,
            soat_proximos: soatActivos,
            revision_vencidos: revVencidos,
            revision_proximos: revActivos,
            mantenimientos_vencidos: mantVencidos,
            mantenimientos_proximos: mantProximos,
          });
        });
      });
    });
  });
};

// ─── Generar notificaciones ─────────────────────────

const generarNotificaciones = (req, res) => {
  let creadas = 0;

  const notificarLote = (lista, tipo, armarMensaje, done) => {
    let pend = lista.length;
    if (pend === 0) return done();
    lista.forEach((item) => {
      notificationModel.findRecentSimilar(tipo, item.placa, 24, (err, exists) => {
        if (err || exists) {
          pend--;
          if (pend === 0) done();
          return;
        }
        notificationModel.create(armarMensaje(item), () => {
          creadas++;
          pend--;
          if (pend === 0) done();
        });
      });
    });
  };

  vehiculoModel.findExpiringSOAT(DIAS_ALERTA, (errSoat, soatList) => {
    if (errSoat) return res.status(500).json({ message: 'Error al consultar SOAT' });

    notificarLote(soatList, 'vencimiento_soat', (v) => {
      const diff = Number(v.dias_restantes);
      const estado = diff < 0 ? 'VENCIDO' : `en ${diff} dias`;
      return {
        titulo: 'SOAT — Alerta de vencimiento',
        mensaje: `El SOAT del vehiculo ${v.placa} ${estado} (${String(v.vigencia_soat).slice(0, 10)}).`,
        tipo: 'vencimiento_soat',
        rol_id: 3,
      };
    }, () => {
      vehiculoModel.findExpiringRevision(DIAS_ALERTA, (errRev, revList) => {
        if (errRev) return res.status(500).json({ message: 'Error al consultar revision' });

        notificarLote(revList, 'vencimiento_revision', (v) => {
          const diff = Number(v.dias_restantes);
          const estado = diff < 0 ? 'VENCIDA' : `en ${diff} dias`;
          return {
            titulo: 'Revision Tecnica — Alerta de vencimiento',
            mensaje: `La revision tecnica del vehiculo ${v.placa} vence ${estado} (${String(v.vigencia_revision_tecnica).slice(0, 10)}).`,
            tipo: 'vencimiento_revision',
            rol_id: 3,
          };
        }, () => {
          mantenimientoModel.findVencidos((errMant, mantVencidos) => {
            if (errMant) return res.status(500).json({ message: `Error al consultar mantenimientos. Notificaciones parciales: ${creadas}`, creadas });

            notificarLote(mantVencidos, 'mantenimiento_vencido', (m) => ({
              titulo: 'Mantenimiento vencido',
              mensaje: `El mantenimiento del vehiculo ${m.placa} programado para ${String(m.fecha_programada).slice(0, 10)} esta vencido (${m.dias_vencido} dias).`,
              tipo: 'mantenimiento_vencido',
              rol_id: 3,
            }), () => {
              return res.json({ message: `Notificaciones generadas: ${creadas}`, creadas });
            });
          });
        });
      });
    });
  });
};

module.exports = {
  listar, obtener, buscar, listarPorUnidad,
  crear, actualizar, eliminar,
  alertas, generarNotificaciones,
};
