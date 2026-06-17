import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const COLORES = {
  origen: { bg: '#155724', border: '#0f3d18' },
  parada: { bg: '#004085', border: '#002752' },
  destino: { bg: '#721C24', border: '#4a1419' },
};

// Coordenadas centrales de cada zona/distrito del Cusco
const CENTROS_ZONA = {
  'santiago': [-13.5250, -71.9833],
  'wanchaq': [-13.5222, -71.9700],
  'san sebastián': [-13.5333, -71.9333],
  'san sebastian': [-13.5333, -71.9333],
  'san jerónimo': [-13.5500, -71.8833],
  'san jeronimo': [-13.5500, -71.8833],
  'cusco': [-13.5170, -71.9780],
  'cercado': [-13.5170, -71.9780],
  'centro histórico': [-13.5167, -71.9781],
  'centro historico': [-13.5167, -71.9781],
  'magisterio': [-13.5220, -71.9650],
  'larapa': [-13.5100, -71.9400],
  'ttio': [-13.5300, -71.9500],
};

const crearIcono = (tipo, numero) => {
  const c = COLORES[tipo] || COLORES.parada;
  return L.divIcon({
    className: 'ruta-marker',
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:${c.bg};border:3px solid ${c.border};color:white;
      display:flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:800;box-shadow:0 2px 6px rgba(0,0,0,0.3);
    ">${numero}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

// Obtener ruta sobre calles reales desde OSRM
const fetchOSRMRoute = async (puntos) => {
  if (puntos.length < 2) return null;
  // OSRM espera lng,lat;lng,lat;...
  const coords = puntos.map(p => `${p[1]},${p[0]}`).join(';');
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) return null;
    // Convertir GeoJSON coordinates [lng, lat] a Leaflet [lat, lng]
    return data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
  } catch {
    return null;
  }
};

// Ajusta el mapa para mostrar todos los puntos
const AjustarVista = ({ puntos }) => {
  const map = useMap();
  useEffect(() => {
    const validos = puntos
      .filter(p => p.latitud && p.longitud && !isNaN(Number(p.latitud)) && !isNaN(Number(p.longitud)))
      .map(p => [Number(p.latitud), Number(p.longitud)]);
    if (validos.length > 0) {
      if (validos.length === 1) {
        map.setView(validos[0], 16);
      } else {
        map.fitBounds(validos, { padding: [50, 50] });
      }
    }
  }, [puntos, map]);
  return null;
};

// Maneja clicks en el mapa
const ClickEnMapa = ({ onAddPoint }) => {
  useMapEvents({ click(e) { onAddPoint(e.latlng.lat, e.latlng.lng); } });
  return null;
};

const RutaMapa = ({ puntos, onUpdatePuntos, zona = '', readOnly = false }) => {
  const [rutaCalles, setRutaCalles] = useState(null);
  const [cargandoRuta, setCargandoRuta] = useState(false);

  const zonaKey = (zona || '').toLowerCase().trim();
  const centroZona = CENTROS_ZONA[zonaKey] || null;

  const puntosValidos = puntos.filter(
    p => p.latitud && p.longitud && !isNaN(Number(p.latitud)) && !isNaN(Number(p.longitud))
  );

  const defaultCenter = puntosValidos.length > 0
    ? [Number(puntosValidos[0].latitud), Number(puntosValidos[0].longitud)]
    : (centroZona || [-13.517, -71.978]);

  const latLngs = puntosValidos.map(p => [Number(p.latitud), Number(p.longitud)]);

  // Calcular ruta sobre calles cuando cambian los puntos
  useEffect(() => {
    if (latLngs.length < 2) {
      setRutaCalles(null);
      return;
    }
    let cancelado = false;
    setCargandoRuta(true);
    fetchOSRMRoute(latLngs).then(geometria => {
      if (!cancelado) {
        setRutaCalles(geometria);
        setCargandoRuta(false);
      }
    });
    return () => { cancelado = true; };
  }, [latLngs.map(p => `${p[0]},${p[1]}`).join(';')]);

  const handleAddPoint = useCallback((lat, lng) => {
    const nuevo = {
      latitud: String(lat.toFixed(8)),
      longitud: String(lng.toFixed(8)),
      orden: puntos.length + 1,
      tipo: puntos.length === 0 ? 'origen' : 'parada',
      nombre: '', direccion: '', tiempo_estimado: 5,
    };
    onUpdatePuntos([...puntos, nuevo]);
  }, [puntos, onUpdatePuntos]);

  const handleDragEnd = useCallback((idx, e) => {
    const { lat, lng } = e.target.getLatLng();
    const updated = puntos.map((p, i) =>
      i === idx ? { ...p, latitud: String(lat.toFixed(8)), longitud: String(lng.toFixed(8)) } : p
    );
    onUpdatePuntos(updated);
  }, [puntos, onUpdatePuntos]);

  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-light)', marginBottom: 16 }}>
      <MapContainer
        center={defaultCenter}
        zoom={15}
        style={{ height: 420, width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!readOnly && <ClickEnMapa onAddPoint={handleAddPoint} />}
        <AjustarVista puntos={latLngs} />

        {/* Línea recta punteada entre waypoints (referencia visual) */}
        {latLngs.length > 1 && (
          <Polyline
            positions={latLngs}
            color="#94a3b8"
            weight={2}
            opacity={0.5}
            dashArray="5 8"
          />
        )}

        {/* Ruta sobre calles reales (OSRM) */}
        {rutaCalles && rutaCalles.length > 1 && (
          <Polyline
            positions={rutaCalles}
            color="#4a001f"
            weight={5}
            opacity={0.85}
          />
        )}

        {/* Marcadores */}
        {puntos.map((p, idx) => {
          if (!p.latitud || !p.longitud || isNaN(Number(p.latitud)) || isNaN(Number(p.longitud))) return null;
          return (
            <Marker
              key={idx}
              position={[Number(p.latitud), Number(p.longitud)]}
              icon={crearIcono(p.tipo || 'parada', idx + 1)}
              draggable={!readOnly}
              eventHandlers={{ dragend: (e) => handleDragEnd(idx, e) }}
            >
              <Popup>
                <div style={{ fontSize: 12, minWidth: 120 }}>
                  <strong>#{idx + 1} — {(p.tipo || 'parada').toUpperCase()}</strong><br />
                  {p.nombre && <span>{p.nombre}<br /></span>}
                  {p.direccion && <span>{p.direccion}<br /></span>}
                  <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                    {Number(p.latitud).toFixed(6)}, {Number(p.longitud).toFixed(6)}
                  </span>
                  {p.tiempo_estimado > 0 && <span><br />Tiempo: {p.tiempo_estimado} min</span>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Barra de estado */}
      <div style={{
        padding: '6px 12px', background: 'var(--primary)', color: '#fff',
        fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4,
      }}>
        <span>
          {!readOnly ? 'Clic en el mapa para agregar puntos | Arrastre los marcadores para ajustar' : 'Vista de ruta programada'}
        </span>
        <span style={{ fontWeight: 600, opacity: cargandoRuta ? 0.7 : 1 }}>
          {cargandoRuta ? 'Calculando ruta sobre calles...' :
           rutaCalles ? 'Ruta trazada sobre calles reales' :
           latLngs.length >= 2 ? 'No se pudo calcular ruta sobre calles' :
           'Agregue al menos 2 puntos para trazar la ruta'}
        </span>
      </div>
    </div>
  );
};

export default RutaMapa;
