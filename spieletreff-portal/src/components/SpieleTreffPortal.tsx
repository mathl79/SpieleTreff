import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import CrossfadingBackground from './CrossfadingBackground';
import ImpressumPage from './ImpressumPage';
import DatenschutzPage from './DatenschutzPage';
import EvaluationPage from './EvaluationPage';
import SpieleKarussell from './SpieleKarussell';
import { Card, CardContent } from "@/components/ui/card"

export default function SpieleTreffPortal() {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  // API URL ohne Port 3001 - lasse den Browser den Standard-HTTPS-Port verwenden
  const API_URL = import.meta.env.PROD 
    ? 'https://mobile-tieraerztin-passau.de/api'
    : 'http://localhost:3001/api';
  
  // Test API Verbindung beim Komponenten-Laden
  const [apiStatus, setApiStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        console.log('Testing API connection to:', API_URL);
        const response = await fetch(`${API_URL}/game-stats`);
        if (response.ok) {
          setApiStatus('connected');
          console.log('API Verbindung erfolgreich hergestellt');
        } else {
          setApiStatus('error');
          console.error('API Verbindung fehlgeschlagen, Status:', response.status);
        }
      } catch (error) {
        setApiStatus('error');
        console.error('API Verbindungsfehler:', error);
      }
    };
    
    testApiConnection();
  }, [API_URL]);

  // Verwenden Sie import.meta.env.BASE_URL für alle Bildpfade
  const backgrounds = [
    import.meta.env.BASE_URL + 'images/pizza.jpg',
    import.meta.env.BASE_URL + 'images/games1.jpg',
    import.meta.env.BASE_URL + 'images/getränke.jpg',
    import.meta.env.BASE_URL + 'images/games2.jpg',
    import.meta.env.BASE_URL + 'images/snacks2.jpg',
    import.meta.env.BASE_URL + 'images/games3.jpg',
    import.meta.env.BASE_URL + 'images/pizza.jpg',
    import.meta.env.BASE_URL + 'images/games4.jpg',
    import.meta.env.BASE_URL + 'images/pizza.jpg',
    import.meta.env.BASE_URL + 'images/games4.jpg',
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* API-Status-Anzeige (immer sichtbar für Debugging) */}
      <div className={`fixed bottom-0 right-0 p-2 m-4 rounded-md z-50 text-white ${
        apiStatus === 'connected' ? 'bg-green-500' : 
        apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
      }`}>
        API: {apiStatus === 'connected' ? 'Verbunden' : 
             apiStatus === 'error' ? 'Fehler' : 'Verbindung...'}
      </div>
    
      {/* Rest des Codes ... */}
