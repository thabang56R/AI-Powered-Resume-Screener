// client/src/App.jsx

import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import UploadForm from './components/UploadForm';
import ScreeningResults from './components/ScreeningResults';
import History from './components/History';
import Footer from './components/Footer';
import Particles from '@tsparticles/react';               // Modern React wrapper
import { loadLinksPreset } from '@tsparticles/preset-links';  // For connecting particles (neon lines)
import ClipLoader from 'react-spinners/ClipLoader';
import './App.css';

function App() {
  const [screeningResult, setScreeningResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Futuristic neon particle options (links preset for connecting dots)
  const particlesOptions = useMemo(
    () => ({
      preset: 'links', // Connects particles with glowing lines
      background: {
        color: {
          value: 'transparent', // Keeps your gradient background visible
        },
      },
      fpsLimit: 60,
      particles: {
        color: {
          value: ['#00ffff', '#ff00ff', '#00ff00'], // Neon cyan, magenta, green
        },
        number: {
          value: 80,
          density: {
            enable: true,
            area: 800,
          },
        },
        opacity: {
          value: 0.6,
          random: true,
        },
        size: {
          value: { min: 1, max: 4 },
          random: true,
        },
        links: {
          enable: true,
          distance: 150,
          color: '#00ffff',
          opacity: 0.4,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.8,
          direction: 'none',
          random: true,
          straight: false,
          outModes: {
            default: 'bounce',
          },
        },
      },
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: 'repulse', // Particles move away from mouse
          },
        },
      },
      detectRetina: true,
      fullScreen: {
        enable: true,
        zIndex: -1, // Behind your content
      },
    }),
    []
  );

  useEffect(() => {
    // Fetch history on mount
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/screenings');
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error('History fetch error:', err);
    }
  };

  return (
    <div className="app-container">
      {/* Futuristic particle background */}
      <Particles id="tsparticles" options={particlesOptions} init={loadLinksPreset} />

      <Header />

      <main className="main-content">
        <UploadForm
          setScreeningResult={setScreeningResult}
          setLoading={setLoading}
          setError={setError}
          loading={loading}
          fetchHistory={fetchHistory}
        />

        {loading && (
          <div className="loader">
            <ClipLoader color="#00ffff" size={50} />
            <p>AI Analyzing...</p>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}

        {screeningResult && <ScreeningResults result={screeningResult} />}

        <History history={history} />
      </main>

      <Footer />
    </div>
  );
}

export default App;