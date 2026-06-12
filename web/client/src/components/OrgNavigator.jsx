import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Home, ChevronRight } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const OrgNavigator = ({ currentUnitId, onNavigate, readOnly }) => {
  const [path, setPath] = useState([]);
  const [currentUnit, setCurrentUnit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  // Cargar breadcrumb
  useEffect(() => {
    if (!currentUnitId) {
      setPath([]);
      setCurrentUnit(null);
      return;
    }
    axios.get(`${API}/unidades-organicas/${currentUnitId}/arbol`, { headers: headers() })
      .then(res => setPath(res.data))
      .catch(() => setPath([]));
    axios.get(`${API}/unidades-organicas/${currentUnitId}`, { headers: headers() })
      .then(res => setCurrentUnit(res.data))
      .catch(() => setCurrentUnit(null));
  }, [currentUnitId]);

  // Buscar unidades
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(() => {
      axios.get(`${API}/unidades-organicas/buscar?q=${encodeURIComponent(searchQuery)}`, { headers: headers() })
        .then(res => setSearchResults(res.data))
        .catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSelect = (unidad) => {
    onNavigate(unidad.id);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
  };

  return (
    <div className="org-nav">
      {/* Breadcrumb */}
      <div className="org-breadcrumb">
        <button className="org-breadcrumb-link" onClick={() => onNavigate(null)}>
          <Home size={14} /> Inicio
        </button>
        {path.map((item) => (
          <span key={item.id} className="org-breadcrumb-sep">
            <ChevronRight size={14} />
            <button className="org-breadcrumb-link" onClick={() => onNavigate(item.id)}>
              {item.nombre}
            </button>
          </span>
        ))}
      </div>

      {/* Barra de búsqueda */}
      <div className="org-search-bar">
        <Search size={16} className="org-search-icon" />
        <input
          type="text"
          className="org-search-input"
          placeholder={readOnly ? "Buscar unidad para ver su personal..." : "Buscar unidad por nombre o sigla..."}
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
          onFocus={() => setShowSearch(true)}
          onBlur={() => setTimeout(() => setShowSearch(false), 200)}
        />
        {showSearch && searchResults.length > 0 && (
          <div className="org-search-dropdown">
            {searchResults.map(u => (
              <button key={u.id} className="org-search-item" onClick={() => handleSearchSelect(u)}>
                <span className="org-search-item-name">{u.nombre}</span>
                {u.sigla && <span className="org-search-item-sigla">{u.sigla}</span>}
                {u.padre_nombre && <span className="org-search-item-path">← {u.padre_nombre}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info de unidad actual (si estamos dentro de una) */}
      {currentUnit && (
        <div className="org-current-info">
          <h4>{currentUnit.nombre}</h4>
          {currentUnit.sigla && <span className="org-current-sigla">{currentUnit.sigla}</span>}
        </div>
      )}
    </div>
  );
};

export default OrgNavigator;
