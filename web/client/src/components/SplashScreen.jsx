import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2200);
    const doneTimer = setTimeout(() => onFinish(), 2800);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-screen ${fadeOut ? 'splash-fade-out' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo">
          <img src="/logo-cusco.svg" alt="EcoQosqo" />
        </div>
        <h1 className="splash-title">EcoQosqo</h1>
        <p className="splash-subtitle">Gestión Ambiental Inteligente</p>
      </div>
    </div>
  );
};

export default SplashScreen;
