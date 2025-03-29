"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { Calendar, Clock, MapPin, Coffee, Share2, Phone, Send, Shield, AlertCircle, HandHelping } from 'lucide-react';
import CrossfadingBackground from './CrossfadingBackground';
import SpieleKarussell from './SpieleKarussell';
import { Game } from '@/types/game'; // Import the Game type

// Importiere die Spiele-Daten und Submissions-Daten
import initialGamesData from '@/data/games.json';

// Backend API URL
const API_URL = 'http://192.168.100.85:3001/api';

// Interface für die GameStats vom Backend (behalten für die API-Antwortstruktur)
interface GameStats {
  [gameId: string]: { // gameId ist ein String im JSON-Objekt, kann auch 'totalSubmissions' sein
    count: number;
    percentage: number;
  } | number; // Allow number for totalSubmissions
  totalSubmissions: number; // Explicitly define totalSubmissions
}

// Helper type guard to check if a value is a stat object
function isGameStatEntry(value: unknown): value is { count: number; percentage: number } {
  return typeof value === 'object' && value !== null && 'count' in value && 'percentage' in value;
} // Correctly placed closing brace

const SpieleTreffPortal = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [teilnahmeStatus, setTeilnahmeStatus] = useState('');
  const [anzahlPersonen, setAnzahlPersonen] = useState(1);
  const [mitFahrgelegenheit, setMitFahrgelegenheit] = useState('');
  const [kommentar, setKommentar] = useState('');
  const [alsHelfer, setAlsHelfer] = useState(false);
  const [helferArt, setHelferArt] = useState<string[]>([]);
  const [datenschutzAkzeptiert, setDatenschutzAkzeptiert] = useState(false);
  const [keepEmailForFuture, setKeepEmailForFuture] = useState(false); // State for the new checkbox
  const [showDatenschutz, setShowDatenschutz] = useState(false);
  const [spieleWunschliste, setSpieleWunschliste] = useState<string[]>([]);
  const [neuerSpielWunsch, setNeuerSpielWunsch] = useState('');
  const [ausgewaehlteSpiele, setAusgewaehlteSpiele] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  // Use the imported Game type and assert the initial data type
  const [processedGamesData, setProcessedGamesData] = useState<Game[]>(initialGamesData as Game[]); // State for processed games
  // Removed unused gameStats state

  // Funktion zum Abrufen der GameStats vom Backend
  const fetchGameStats = async (): Promise<GameStats | null> => { // Return type added
    try {
      const response = await fetch(`${API_URL}/game-stats`);
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Spielstatistiken');
      }
      const data: GameStats = await response.json();
      // Removed setGameStats(data);
      return data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Spielstatistiken:', error);
      return null;
    }
  };

  // Daten bei Komponenten-Mount laden
  useEffect(() => {
    const loadData = async () => {
      // GameStats vom Backend abrufen
      const stats = await fetchGameStats();
      if (stats) {
        const updatedGames = updatePopularGames(stats, initialGamesData as Game[]);
        setProcessedGamesData(updatedGames);
      } else {
        // Fallback zur lokalen Berechnung, wenn API-Abruf fehlschlägt
        setProcessedGamesData(initialGamesData as Game[]);
      }
    };

    loadData();
    
    // Optionale Vorauswahl von Spielen
    setAusgewaehlteSpiele([2, 4]);
  }, []); // Nur beim ersten Rendering ausführen

  // Nach jeder erfolgreichen Anmeldung die GameStats aktualisieren
  useEffect(() => {
    if (submitted) {
      fetchGameStats().then(stats => {
        if (stats) {
          const updatedGames = updatePopularGames(stats, initialGamesData as Game[]);
          setProcessedGamesData(updatedGames);
        }
      });
    }
  }, [submitted]);

  // Funktion zur Aktualisierung der beliebten Spiele basierend auf den GameStats
  // Takes current games data as input and returns the updated array
  const updatePopularGames = (stats: GameStats, currentGames: Game[]): Game[] => {
    // Ignoriere totalSubmissions und sortiere die Spiele nach Prozentsatz
    // Filter keys, ensuring they represent game stats and convert to numbers
    const gameIds = Object.keys(stats)
      .filter(id => id !== 'totalSubmissions' && isGameStatEntry(stats[id]))
      .map(id => parseInt(id, 10));

    // Sortiere nach Prozentsatz oder Anzahl, handle potential undefined stats
    const sortedGameIds = gameIds.sort((a, b) => {
        const statA = stats[String(a)];
        const statB = stats[String(b)];

        // Use type guard before accessing properties
        const percentageA = isGameStatEntry(statA) ? statA.percentage : 0;
        const percentageB = isGameStatEntry(statB) ? statB.percentage : 0;
        const countA = isGameStatEntry(statA) ? statA.count : 0;
        const countB = isGameStatEntry(statB) ? statB.count : 0;

        const percentageDiff = percentageB - percentageA;
        if (percentageDiff !== 0) return percentageDiff;
        return countB - countA;
    });
    
    // Nehme die Top 3 oder weniger, falls weniger verfügbar sind
    const topGameIds = sortedGameIds.slice(0, Math.min(3, sortedGameIds.length));

    // Update gamesData with popular flag using the currentGames array
    const updatedGamesData = currentGames.map(game => ({
      ...game,
      popular: topGameIds.includes(game.id),
      // Füge den Prozentwert hinzu, wenn verfügbar, access stats with string key after type guard
      popularityPercentage: isGameStatEntry(stats[String(game.id)]) ? (stats[String(game.id)] as { percentage: number }).percentage : undefined
    }));

    return updatedGamesData; // Return the updated array
  };

  // Effect for smooth scrolling (kept from previous implementation, might need adjustment with CSS animation)
  useEffect(() => {
    const scrollSmoothly = (element: HTMLElement, distance: number, duration: number) => {
      let start: number | null = null;
      const startPosition = element.scrollLeft;

      const easeInOutCubic = (t: number) => {
        return t < 0.5
          ? 4 * t * t * t
          : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      };

      const step = (timestamp: number) => {
        if (start === null) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);

        element.scrollLeft = startPosition + distance * easeInOutCubic(progress);

        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);
    };

    const leftBtn = document.getElementById('scrollLeftBtn');
    const rightBtn = document.getElementById('scrollRightBtn');
    const spieleGalerie = document.getElementById('spieleGalerie');

    const handleLeftScroll = () => {
      if (spieleGalerie) scrollSmoothly(spieleGalerie, -200, 800);
    };
    const handleRightScroll = () => {
      if (spieleGalerie) scrollSmoothly(spieleGalerie, 200, 800);
    };

    if (leftBtn) leftBtn.addEventListener('click', handleLeftScroll);
    if (rightBtn) rightBtn.addEventListener('click', handleRightScroll);

    return () => {
      if (leftBtn) leftBtn.removeEventListener('click', handleLeftScroll);
      if (rightBtn) rightBtn.removeEventListener('click', handleRightScroll);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setSubmitError('Bitte gib deinen Namen ein');
      return;
    }

    if (!email.trim()) {
      setSubmitError('Bitte gib deine E-Mail-Adresse ein');
      return;
    }

    if (!teilnahmeStatus) {
      setSubmitError('Bitte wähle deinen Teilnahmestatus aus');
      return;
    }

    if (teilnahmeStatus !== 'nein' && !datenschutzAkzeptiert) {
      setSubmitError('Bitte akzeptiere die Datenschutzhinweise');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const submissionData = {
        name,
        email,
        teilnahmeStatus,
        anzahlPersonen: teilnahmeStatus === 'ja' ? anzahlPersonen : 0,
        mitFahrgelegenheit,
        ausgewaehlteSpiele,
        spieleWunschliste,
        alsHelfer,
        helferArt: alsHelfer ? helferArt : [],
        kommentar,
        keepEmailForFuture // Add the new field here
      };

      const response = await fetch(`${API_URL}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const savedSubmission = await response.json();
      console.log('Submission successful:', savedSubmission);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Share Functionality ---
  const handleShare = async () => {
    const shareData = {
      title: 'Einladung zum Spieletreff!',
      text: 'Hallo! Lust auf einen gemütlichen Spieletreff? Hier findest du alle Infos:',
      url: window.location.href
    };
  
    // Prüfen, ob der Browser die Web Share API unterstützt und ob wir in einer unterstützten Umgebung sind
    if (navigator.share && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
      try {
        await navigator.share(shareData);
        console.log('Spieletreff erfolgreich geteilt!');
      } catch (err) {
        console.error('Fehler beim Teilen:', err);
        fallbackShare();
      }
    } else {
      fallbackShare();
    }
  };
  
  // Fallback-Methode mit manuellem Kopieren
  const fallbackShare = () => {
    // URL in Zwischenablage kopieren
    const textArea = document.createElement('textarea');
    textArea.value = window.location.href;
    textArea.style.position = 'fixed';  // Versteckt das Textelement
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        alert('Link in die Zwischenablage kopiert! Du kannst ihn jetzt einfügen und teilen.');
      } else {
        alert('Dein Browser unterstützt die Teilen-Funktion nicht direkt. Bitte kopiere den Link manuell: ' + window.location.href);
      }
    } catch (err) {
      document.body.removeChild(textArea);
      console.log(err)
      alert('Dein Browser unterstützt die Teilen-Funktion nicht direkt. Bitte kopiere den Link manuell: ' + window.location.href);
    }
  };

  const isGameSelected = (gameId: number) => {
    return ausgewaehlteSpiele.includes(gameId);
  };

  const toggleGameSelection = (gameId: number) => {
    if (isGameSelected(gameId)) {
      setAusgewaehlteSpiele(ausgewaehlteSpiele.filter((id: number) => id !== gameId));
    } else {
      setAusgewaehlteSpiele([...ausgewaehlteSpiele, gameId]);
    }
  };

  const getGameName = (gameId: number) => {
    // Use processedGamesData to find the game name
    const game = processedGamesData.find(g => g.id === gameId);
    return game ? game.name : '';
  };

  const backgroundImages = [
    '/images/pizza.jpg',
    '/images/games1.jpg',
    '/images/getränke.jpg',
    '/images/games2.jpg',
    '/images/snacks2.jpg',
    '/images/games3.jpg',
    '/images/pizza.jpg',
    '/images/games4.jpg',
    '/images/pizza.jpg',
    '/images/games4.jpg',
  ];

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden text-left">
      {/* Header mit Animation */}
      <div className="relative bg-gray-700 text-white p-3 sm:p-6 overflow-hidden text-left">
        <div className="absolute top-0 left-0 w-full h-full">
        <svg className="absolute" width="100%" height="100%" preserveAspectRatio="none">
          <defs>
            <pattern id="boardgame" patternUnits="userSpaceOnUse" width="50" height="50" patternTransform="rotate(60) skewX(1) scale(1)">
            <text x="25" y="25" font-size="45" fill="rgba(255,255,255,0.1)" text-anchor="middle" dominant-baseline="middle">⚅
            <animateTransform 
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              from="0 25 25"
              to="360 25 25"
              dur="10s"
              repeatCount="indefinite" />
            </text>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#boardgame)" />
</svg>
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Gemeinde Salzweg</h1>
          <p className="text-lg sm:text-xl">digital detox Spieletreff</p>
        </div>
      </div>

      {/* Hauptinhalt */}
      <div className="p-2 sm:p-4">
        <div className="relative z-10">
          {/* Conditional Rendering */}
          {!submitted ? (
            <> 
              {/* Veranstaltungsdetails */}
              <div className="mb-4 sm:mb-8 bg-gray-50 p-3 sm:p-4 rounded-lg relative overflow-hidden event-details-bg">
                {/* Crossfading Hintergrund */}
                <CrossfadingBackground images={backgroundImages} interval={5000} />
                
                {/* Inhalt */}
                <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-blue-700 text-left relative z-10">Nächster Spieletreff</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-1 sm:gap-4 relative z-10">
                  <div className="flex items-center">
                    <Calendar className="text-blue-500 mr-2 w-4 h-4 sm:w-5 sm:h-5 sm:mr-3" />
                    <div>
                      <p className="font-medium text-sm sm:text-base">Datum</p>
                      <p className="text-sm sm:text-base">Freitag, 12. Mai 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="text-blue-500 mr-2 w-4 h-4 sm:w-5 sm:h-5 sm:mr-3" />
                    <div>
                      <p className="font-medium text-sm sm:text-base">Uhrzeit</p>
                      <p className="text-sm sm:text-base">14:00 - 21:00 Uhr</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="text-blue-500 mr-2 w-4 h-4 sm:w-5 sm:h-5 sm:mr-3" />
                    <div>
                      <p className="font-medium text-sm sm:text-base">Ort</p>
                      <p className="text-sm sm:text-base">Hof in der Au, Kinzing</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Coffee className="text-blue-500 mr-2 w-4 h-4 sm:w-5 sm:h-5 sm:mr-3" />
                    <div>
                      <p className="font-medium text-sm sm:text-base">Verpflegung</p>
                      <p className="text-sm sm:text-base">Pizza & Snacks, Getränke</p>
                    </div>
                  </div>
                </div>

                <a
                  href="/spieletreff.ics" // Link to the ICS file in the public folder
                  download="spieletreff.ics" // Suggest filename for download
                  className="mt-3 sm:mt-4 flex items-center text-blue-600 hover:text-blue-800 text-sm sm:text-base relative z-10"
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Termin in Kalender speichern (.ics)
                </a>
              </div>

              {/* Spieleauswahl Komponente */}
              <SpieleKarussell
                gamesData={processedGamesData} // Pass processed data with popular flags
                ausgewaehlteSpiele={ausgewaehlteSpiele}
                isGameSelected={isGameSelected}
                toggleGameSelection={toggleGameSelection}
                getGameName={getGameName}
              />
              <h2 className="text-lg sm:text-xl font-bold text-blue-700">Anmeldung</h2>
              {/* === FORM START === */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Error Message */}
                {submitError && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    <AlertCircle className="inline w-4 h-4 mr-1" /> {submitError}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block mb-1 sm:mb-2 font-medium text-sm sm:text-base">Name:</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-1.5 sm:p-2 border rounded text-sm sm:text-base"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block mb-1 sm:mb-2 font-medium text-sm sm:text-base">E-Mail:</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-1.5 sm:p-2 border rounded text-sm sm:text-base"
                    required
                  />
                </div>

                {/* Keep Email Checkbox */}
                <div className="flex items-start mt-2">
                  <input
                    type="checkbox"
                    id="keepEmailCheckbox"
                    checked={keepEmailForFuture}
                    onChange={(e) => setKeepEmailForFuture(e.target.checked)}
                    className="mt-1 mr-2"
                  />
                  <label htmlFor="keepEmailCheckbox" className="text-xs sm:text-sm text-gray-600">
                    Meine E-Mail darf für Einladungen zu zukünftigen Spieletreffen gespeichert werden. (Optional)
                  </label>
                </div>

                {/* Teilnahme */}
                <div>
                  <label className="block mb-1 sm:mb-2 font-medium text-sm sm:text-base">Teilnahme:</label>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <label className="flex items-center">
                      <input type="radio" name="teilnahme" value="ja" checked={teilnahmeStatus === 'ja'} onChange={(e) => setTeilnahmeStatus(e.target.value)} className="mr-1 sm:mr-2" />
                      <span className="text-sm sm:text-base">Ja, ich komme</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="teilnahme" value="vielleicht" checked={teilnahmeStatus === 'vielleicht'} onChange={(e) => setTeilnahmeStatus(e.target.value)} className="mr-1 sm:mr-2" />
                      <span className="text-sm sm:text-base">Vielleicht</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="teilnahme" value="nein" checked={teilnahmeStatus === 'nein'} onChange={(e) => setTeilnahmeStatus(e.target.value)} className="mr-1 sm:mr-2" />
                      <span className="text-sm sm:text-base">Nein, diesmal nicht</span>
                    </label>
                  </div>
                </div>

                {/* Anzahl Personen (conditional) */}
                {teilnahmeStatus === 'ja' && (
                  <div>
                    <label htmlFor="anzahlPersonen" className="block mb-1 sm:mb-2 font-medium text-sm sm:text-base">Anzahl Personen (inkl. dir):</label>
                    <input
                      type="number"
                      id="anzahlPersonen"
                      value={anzahlPersonen}
                      onChange={(e) => setAnzahlPersonen(Math.max(1, parseInt(e.target.value, 10) || 1))} // Ensure at least 1
                      min="1"
                      className="w-20 p-1.5 sm:p-2 border rounded text-sm sm:text-base"
                    />
                  </div>
                )}

                {/* Fahrgemeinschaft */}
                <div>
                  <label className="block mb-1 sm:mb-2 font-medium text-sm sm:text-base">Fahrgemeinschaft:</label>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => setMitFahrgelegenheit(mitFahrgelegenheit === 'biete' ? '' : 'biete')}
                      className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm ${mitFahrgelegenheit === 'biete' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      Ich biete Mitfahrgelegenheit
                    </button>
                    <button
                      type="button"
                      onClick={() => setMitFahrgelegenheit(mitFahrgelegenheit === 'suche' ? '' : 'suche')}
                      className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm ${mitFahrgelegenheit === 'suche' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      Ich suche Mitfahrgelegenheit
                    </button>
                  </div>
                </div>

                {/* Spiele Wunschliste */}
                <div>
                  <label className="block mb-1 sm:mb-2 font-medium text-sm sm:text-base">Welches Spiel würdest Du gerne spielen?</label>
                  <div className="flex gap-1 sm:gap-2 mb-1 sm:mb-2">
                    <input
                      type="text"
                      value={neuerSpielWunsch}
                      onChange={(e) => setNeuerSpielWunsch(e.target.value)}
                      className="flex-grow p-1.5 sm:p-2 border rounded text-sm sm:text-base"
                      placeholder="Spielewunsch eingeben"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (neuerSpielWunsch.trim()) {
                          setSpieleWunschliste([...spieleWunschliste, neuerSpielWunsch.trim()]);
                          setNeuerSpielWunsch('');
                        }
                      }}
                      className="px-3 sm:px-4 py-1 sm:py-2 bg-blue-600 text-white rounded text-xs sm:text-sm hover:bg-blue-700"
                    >
                      Hinzufügen
                    </button>
                  </div>
                  {spieleWunschliste.length > 0 && (
                    <div className="mt-1 sm:mt-2">
                      <p className="text-xs sm:text-sm font-medium mb-1">Deine Wunschliste:</p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {spieleWunschliste.map((spiel, index) => (
                          <div key={index} className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex items-center text-xs sm:text-sm">
                            <span>{spiel}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newList = [...spieleWunschliste];
                                newList.splice(index, 1);
                                setSpieleWunschliste(newList);
                              }}
                              className="ml-1 sm:ml-2 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Helfer */}
                <div>
                  <label className="block mb-1 sm:mb-2 font-medium text-sm sm:text-base">Möchtest du als Helfer/in mitmachen?</label>
                  <div className="flex items-center mb-1 sm:mb-2">
                    <input
                      type="checkbox"
                      id="helferCheckbox"
                      checked={alsHelfer}
                      onChange={(e) => setAlsHelfer(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="helferCheckbox" className="text-sm sm:text-base">Ja, ich möchte unterstützen</label>
                  </div>

                  {alsHelfer && (
                    <div className="ml-4 sm:ml-6 mt-1 sm:mt-2 space-y-1 sm:space-y-2">
                      <p className="text-xs sm:text-sm font-medium">Wie möchtest du helfen?</p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {['Spielanleiter/in', 'Aufbau/Abbau', 'Verpflegung', 'Kinderbetreuung'].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              if (helferArt.includes(option)) {
                                setHelferArt(helferArt.filter((item: string) => item !== option));
                              } else {
                                setHelferArt([...helferArt, option]);
                              }
                            }}
                            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border text-xs sm:text-sm ${
                              helferArt.includes(option)
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100' // Added hover
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Kommentar */}
                <div>
                  <label htmlFor="kommentar" className="block mb-1 sm:mb-2 font-medium text-sm sm:text-base">Kommentar oder Fragen:</label>
                  <textarea
                    id="kommentar"
                    value={kommentar}
                    onChange={(e) => setKommentar(e.target.value)}
                    className="w-full p-1.5 sm:p-2 border rounded text-sm sm:text-base"
                    rows={3}
                    placeholder="Deine Nachricht (optional)"
                  ></textarea>
                </div>

                {/* Datenschutz (only if attending or maybe) */}
                {teilnahmeStatus !== 'nein' && (
                  <div className="mt-3 sm:mt-4">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="datenschutzCheckbox"
                        checked={datenschutzAkzeptiert}
                        onChange={(e) => setDatenschutzAkzeptiert(e.target.checked)}
                        className="mt-1 mr-2"
                        required
                      />
                      <div>
                        <label htmlFor="datenschutzCheckbox" className="font-medium text-sm sm:text-base">Datenschutzhinweis</label>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Ich stimme zu, dass meine Daten zum Zweck der Organisation des Spieletreffs verarbeitet werden.
                          Die Daten werden nur für diesen Zweck verwendet und nach der Veranstaltung gelöscht.{' '}
                          <button
                            type="button"
                            className="text-blue-600 underline"
                            onClick={() => setShowDatenschutz(!showDatenschutz)}
                          >
                            Mehr erfahren
                          </button>
                        </p>
                      </div>
                    </div>

                    {showDatenschutz && (
                      <div className="mt-2 p-2 sm:p-3 bg-gray-50 rounded-lg border text-xs sm:text-sm">
                        <div className="flex items-center text-blue-700 mb-1 sm:mb-2">
                          <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <h3 className="font-bold">Datenschutz beim Spieletreff</h3>
                        </div>
                        <p className="mb-1 sm:mb-2">
                          Wir erheben nur die für die Organisation des Spieletreffs notwendigen Daten:
                        </p>
                        <ul className="list-disc ml-4 sm:ml-5 mb-1 sm:mb-2">
                          <li>Teilnahmestatus und Personenanzahl (für Planung)</li>
                          <li>Fahrgemeinschaftsinformationen (optional, nur zur Koordination)</li>
                          <li>Spielwünsche und Helferinformationen (zur Planung der Angebote)</li>
                        </ul>
                        <p className="mb-1 sm:mb-2">
                          Alle Daten werden nur für die Planung und Durchführung der Veranstaltung verwendet,
                          nicht an Dritte weitergegeben, sicher aufbewahrt und nach Abschluss der Veranstaltung gelöscht.
                        </p>
                        <a href="#" className="text-blue-600 underline">Vollständige Datenschutzerklärung</a>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed" // Added disabled styles
                  disabled={submitting || !teilnahmeStatus || (teilnahmeStatus !== 'nein' && !datenschutzAkzeptiert)}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Wird gesendet...
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Anmeldung absenden
                    </>
                  )}
                </button>
              </form>
              {/* === FORM END === */}

              {/* Teilen Section (Moved outside form) */}
              <div className="mt-6 sm:mt-8 mb-4 sm:mb-8"> {/* Added top margin */}
                <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-blue-700">Freunde einladen</h2>
                <div className="flex space-x-3 sm:space-x-4 items-center"> {/* Added items-center */}
                  <button
                    type="button"
                    onClick={handleShare} // Added onClick handler
                    className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors" // Added transition
                    aria-label="Spieletreff teilen" // Added aria-label
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Teile den Spieletreff</p>
                    <p className="text-xs sm:text-sm text-gray-600">Lade Freunde und Familie ein!</p>
                  </div>
                </div>
              </div>

              {/* Kontakt Section (Moved outside form) */}
              <div className="mb-4 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-blue-700">Fragen?</h2>
                <div className="flex items-center">
                  <Phone className="text-blue-500 mr-2 w-4 h-4 sm:w-5 sm:h-5 sm:mr-3" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Ruf uns an</p>
                    <p className="text-sm sm:text-base">0152/29502598 oder 0171/1004971</p> {/* Update Phone? */}
                  </div>
                </div>
              </div>

            </> // End Fragment for Form View
          ) : (
            // Success Message View
            <div className="text-center py-6 sm:py-8">
              <div className="bg-green-100 text-green-800 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4 inline-block"> {/* Made inline-block */}
                <h2 className="text-lg sm:text-xl font-bold">Vielen Dank!</h2>
                <p className="text-sm sm:text-base">Deine Anmeldung wurde erfolgreich übermittelt.</p>
              </div>
              <br /> {/* Added line break */}
              <button
                onClick={() => setSubmitted(false)} // Consider resetting form fields here too
                className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Zurück zur Anmeldung
              </button>
            </div>
          )} {/* End Conditional Rendering */}
        </div> {/* End relative z-10 div */}
      </div> {/* End Hauptinhalt div */}

      {/* Footer */}
      <div className="bg-gray-100 p-4 sm:p-6 text-center border-t"> {/* Added border-t */}
        <div className="flex justify-center space-x-3 sm:space-x-6 mb-3 sm:mb-4">
          <Link to="/datenschutz" className="text-blue-600 hover:underline flex items-center text-xs sm:text-sm">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Datenschutzerklärung
          </Link>
          <Link to="/impressum" className="text-blue-600 hover:underline flex items-center text-xs sm:text-sm">
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Impressum
          </Link>
          {/* Keep Barrierefreiheit as a placeholder link for now */}
          <a href="#" className="text-blue-600 hover:underline flex items-center text-xs sm:text-sm">
            <HandHelping className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Barrierefreiheit
          </a>
        </div>
        <p className="text-center text-gray-600 text-xs sm:text-sm">© 2025 Gemeinde Spieletreff - Digital Detox & Chill</p>
      </div>
    </div>
  );
};

export default SpieleTreffPortal;
