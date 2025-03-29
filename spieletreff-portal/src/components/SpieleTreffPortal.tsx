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

  // Zurück zur expliziten Port-Angabe
  const API_URL = import.meta.env.PROD 
    ? 'https://mobile-tieraerztin-passau.de:3001/api'
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

  // Rest des Codes...
