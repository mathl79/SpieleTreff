import React, { useState, useEffect } from 'react';
import gamesData from '../data/games.json';
import { ArrowUpDown, Download, Filter, Search, Eye, EyeOff, LogOut, Heart } from 'lucide-react'; // Added Heart
// Removed import { getAllSubmissions, type Submission } from '../utils/submissionService';

// Define the Submission type locally or import from a shared types file
interface Submission {
  id: number;
  name: string;
  email: string;
  timestamp: string;
  teilnahmeStatus: string;
  anzahlPersonen: number;
  mitFahrgelegenheit: string;
  ausgewaehlteSpiele: number[];
  spieleWunschliste: string[];
  alsHelfer: boolean;
  helferArt: string[];
  kommentar: string;
}

type SortField = keyof Submission | '';
type SortDirection = 'asc' | 'desc';

const API_URL = import.meta.env.PROD 
  ? 'https://mobile-tieraerztin-passau.de:3001/api'
  : 'http://localhost:3001/api';


const EvaluationPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [helperFilter, setHelperFilter] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showPassword, setShowPassword] = useState(false);

  // Hardcoded password for simplicity. In a real app, use a more secure method.
  const correctPassword = 'admin123'; // TODO: Change this or use environment variables

  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoading(true);
      setFetchError('');
      try {
        const response = await fetch(`${API_URL}/submissions`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Submission[] = await response.json();
        setSubmissions(data);
        setFilteredSubmissions(data); // Initialize filtered list
      } catch (error) {
        console.error("Failed to fetch submissions:", error);
        setFetchError('Fehler beim Laden der Anmeldungen.');
      } finally {
        setIsLoading(false);
      }
    };

    // Load submissions if authenticated
    if (isAuthenticated) {
      fetchSubmissions();
    } else {
      // Clear data if not authenticated
      setSubmissions([]);
      setFilteredSubmissions([]);
    }
  }, [isAuthenticated]); // Re-fetch when authentication status changes

  // Re-fetch data when the page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        // Refetch data when tab becomes visible again and user is authenticated
        const fetchSubmissions = async () => {
          setIsLoading(true);
          setFetchError('');
          try {
            const response = await fetch(`${API_URL}/submissions`);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: Submission[] = await response.json();
            setSubmissions(data);
            setFilteredSubmissions(data);
          } catch (error) {
            console.error("Failed to refetch submissions:", error);
            setFetchError('Fehler beim Aktualisieren der Anmeldungen.');
          } finally {
            setIsLoading(false);
          }
        };
        fetchSubmissions();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup listener on component unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]); // Dependency ensures the correct auth state is used in the handler


  useEffect(() => {
    if (submissions.length > 0) {
      // --- Filter for latest submission per email ---
      const latestSubmissionsMap = new Map<string, Submission>();
      // Sort by timestamp descending to process latest first
      [...submissions]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .forEach(sub => {
          const emailLower = sub.email.toLowerCase();
          if (!latestSubmissionsMap.has(emailLower)) {
            latestSubmissionsMap.set(emailLower, sub);
          }
        });
      const uniqueLatestSubmissions = Array.from(latestSubmissionsMap.values());
      // --- End Filter ---

      let result = uniqueLatestSubmissions; // Start processing with unique entries

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(
          (sub) =>
            sub.name.toLowerCase().includes(term) ||
            sub.email.toLowerCase().includes(term) ||
            sub.kommentar.toLowerCase().includes(term) ||
            sub.spieleWunschliste.some(game => game.toLowerCase().includes(term))
        );
      }

      // Apply status filter
      if (statusFilter) {
        result = result.filter((sub) => sub.teilnahmeStatus === statusFilter);
      }

      // Apply helper filter
      if (helperFilter === 'yes') {
        result = result.filter((sub) => sub.alsHelfer);
      } else if (helperFilter === 'no') {
        result = result.filter((sub) => !sub.alsHelfer);
      }

      // Apply sorting
      if (sortField) {
        result.sort((a, b) => {
          const aValue = a[sortField];
          const bValue = b[sortField];

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc'
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
          } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
            return sortDirection === 'asc'
              ? aValue === bValue ? 0 : aValue ? 1 : -1
              : aValue === bValue ? 0 : aValue ? -1 : 1;
          }
          return 0;
        });
      }

      setFilteredSubmissions(result);
    }
  }, [submissions, searchTerm, statusFilter, helperFilter, sortField, sortDirection]);

  const handlePasswordSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (password === correctPassword) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
      setPassword('');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getGameName = (gameId: number) => {
    const game = gamesData.find(g => g.id === gameId);
    return game ? game.name : `Game ${gameId}`;
  };

  const exportToCSV = () => {
    const headers = [
      'ID', 'Name', 'Email', 'Timestamp', 'Status', 'Personen', 
      'Fahrgemeinschaft', 'Ausgewählte Spiele', 'Spielwünsche', 
      'Helfer', 'Helfer Art', 'Kommentar'
    ];

    const csvRows = [
      headers.join(','),
      ...filteredSubmissions.map(sub => {
        const ausgewaehlteSpiele = sub.ausgewaehlteSpiele.map(id => getGameName(id)).join('; ');
        const spieleWunschliste = sub.spieleWunschliste.join('; ');
        const helferArt = sub.helferArt.join('; ');
        
        return [
          sub.id,
          `"${sub.name}"`,
          `"${sub.email}"`,
          new Date(sub.timestamp).toLocaleString(),
          sub.teilnahmeStatus,
          sub.anzahlPersonen,
          sub.mitFahrgelegenheit || '-',
          `"${ausgewaehlteSpiele}"`,
          `"${spieleWunschliste}"`,
          sub.alsHelfer ? 'Ja' : 'Nein',
          `"${helferArt}"`,
          `"${sub.kommentar.replace(/"/g, '""')}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `spieletreff-anmeldungen-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4 max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-blue-700 text-center">Admin Zugang</h1>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="password" className="block mb-2 font-medium">Passwort:</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border p-2 rounded"
                  required
                />
                <button 
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition-colors"
            >
              Anmelden
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
          <h1 className="text-2xl font-bold">Spieletreff Anmeldungen</h1>
          <button 
            onClick={handleLogout}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <LogOut size={18} className="mr-2" />
            Abmelden
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 pl-10 border rounded"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">Alle Status</option>
                <option value="bestimmt">Bestimmt</option>
                <option value="vielleicht">Vielleicht</option>
                <option value="nein">Nein</option>
              </select>
              
              <select
                value={helperFilter}
                onChange={(e) => setHelperFilter(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">Alle Helfer</option>
                <option value="yes">Nur Helfer</option>
                <option value="no">Keine Helfer</option>
              </select>
              
              <button
                onClick={exportToCSV}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
              >
                <Download size={18} className="mr-2" />
                Export
              </button>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h2 className="font-bold text-blue-800 mb-2 flex items-center">
              <Filter size={18} className="mr-2" />
              Zusammenfassung
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded shadow">
                <p className="text-gray-600">Anmeldungen gesamt</p>
                <p className="text-2xl font-bold">{submissions.length}</p>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <p className="text-gray-600">Bestätigte Teilnehmer</p>
                <p className="text-2xl font-bold">
                {submissions
                    .filter(s => s.teilnahmeStatus === 'ja')
                    .reduce((sum, s) => sum + s.anzahlPersonen, 0)}                
                <span className="text-sm">{" "}±{submissions
                    .filter(s => s.teilnahmeStatus === 'vielleicht')
                    .reduce((sum, s) => sum + s.anzahlPersonen, 0)/2
                    }</span>
                </p>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <p className="text-gray-600">Helfer</p>
                <p className="text-2xl font-bold">
                  {submissions.filter(s => s.alsHelfer).length}
                </p>
              </div>
            </div>
          </div>

          {/* Game Statistics Section */}
          {!isLoading && !fetchError && filteredSubmissions.length > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg mb-6">
              <h2 className="font-bold text-yellow-800 mb-3 flex items-center">
                <Heart size={18} className="mr-2" />
                Spiele-Statistik (basierend auf gefilterten Anmeldungen)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 text-yellow-700">Ausgewählte Spiele (Galerie):</h3>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {(() => {
                      const selectedCounts: { [key: number]: number } = {};
                      filteredSubmissions.forEach(sub => {
                        sub.ausgewaehlteSpiele.forEach(gameId => {
                          selectedCounts[gameId] = (selectedCounts[gameId] || 0) + 1;
                        });
                      });
                      return Object.entries(selectedCounts)
                        .sort(([, countA], [, countB]) => countB - countA) // Sort descending by count
                        .map(([gameId, count]) => (
                          <li key={gameId}>
                            {getGameName(parseInt(gameId))}: <span className="font-medium">{count}</span> Mal
                          </li>
                        ));
                    })()}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-yellow-700">Gewünschte Spiele (Freitext):</h3>
                   <ul className="list-disc pl-5 text-sm space-y-1">
                    {(() => {
                      const wishlistCounts: { [key: string]: number } = {};
                      filteredSubmissions.forEach(sub => {
                        sub.spieleWunschliste.forEach(gameName => {
                          const normalizedName = gameName.trim().toLowerCase();
                          if (normalizedName) {
                             wishlistCounts[normalizedName] = (wishlistCounts[normalizedName] || 0) + 1;
                          }
                        });
                      });
                      return Object.entries(wishlistCounts)
                        .sort(([, countA], [, countB]) => countB - countA) // Sort descending by count
                        .map(([gameName, count]) => (
                          <li key={gameName}>
                            {/* Capitalize first letter for display */}
                            {gameName.charAt(0).toUpperCase() + gameName.slice(1)}: <span className="font-medium">{count}</span> Mal
                          </li>
                        ));
                    })()}
                  </ul>
                </div>
              </div>
            </div>
          )}
          {/* End Game Statistics Section */}


          {isLoading && (
            <div className="text-center py-8">
              <svg className="animate-spin mx-auto h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-gray-600">Lade Anmeldungen...</p>
            </div>
          )}

          {fetchError && (
            <div className="text-center py-8 text-red-600 bg-red-50 p-4 rounded-lg">
              <p>{fetchError}</p>
            </div>
          )}

          {!isLoading && !fetchError && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">
                    <button 
                      className="flex items-center font-semibold"
                      onClick={() => handleSort('id')}
                    >
                      ID
                      {sortField === 'id' && (
                        <ArrowUpDown size={16} className="ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="py-2 px-4 border-b text-left">
                    <button 
                      className="flex items-center font-semibold"
                      onClick={() => handleSort('name')}
                    >
                      Name
                      {sortField === 'name' && (
                        <ArrowUpDown size={16} className="ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="py-2 px-4 border-b text-left">
                    <button 
                      className="flex items-center font-semibold"
                      onClick={() => handleSort('email')}
                    >
                      Email
                      {sortField === 'email' && (
                        <ArrowUpDown size={16} className="ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="py-2 px-4 border-b text-left">
                    <button 
                      className="flex items-center font-semibold"
                      onClick={() => handleSort('teilnahmeStatus')}
                    >
                      Status
                      {sortField === 'teilnahmeStatus' && (
                        <ArrowUpDown size={16} className="ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="py-2 px-4 border-b text-left">
                    <button 
                      className="flex items-center font-semibold"
                      onClick={() => handleSort('anzahlPersonen')}
                    >
                      Personen
                      {sortField === 'anzahlPersonen' && (
                        <ArrowUpDown size={16} className="ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="py-2 px-4 border-b text-left">Fahrgemeinschaft</th>
                  <th className="py-2 px-4 border-b text-left">Spiele</th>
                  <th className="py-2 px-4 border-b text-left">
                    <button 
                      className="flex items-center font-semibold"
                      onClick={() => handleSort('alsHelfer')}
                    >
                      Helfer
                      {sortField === 'alsHelfer' && (
                        <ArrowUpDown size={16} className="ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="py-2 px-4 border-b text-left">Kommentar</th>
                  <th className="py-2 px-4 border-b text-left">
                    <button 
                      className="flex items-center font-semibold"
                      onClick={() => handleSort('timestamp')}
                    >
                      Datum
                      {sortField === 'timestamp' && (
                        <ArrowUpDown size={16} className="ml-1" />
                      )}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{submission.id}</td>
                      <td className="py-2 px-4 border-b font-medium">{submission.name}</td>
                      <td className="py-2 px-4 border-b">{submission.email}</td>
                      <td className="py-2 px-4 border-b">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          submission.teilnahmeStatus === 'bestimmt' 
                            ? 'bg-green-100 text-green-800' 
                            : submission.teilnahmeStatus === 'vielleicht'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {submission.teilnahmeStatus}
                        </span>
                      </td>
                      <td className="py-2 px-4 border-b">{submission.anzahlPersonen}</td>
                      <td className="py-2 px-4 border-b">
                        {submission.mitFahrgelegenheit === 'biete' && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            Bietet
                          </span>
                        )}
                        {submission.mitFahrgelegenheit === 'suche' && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                            Sucht
                          </span>
                        )}
                        {!submission.mitFahrgelegenheit && '-'}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <div>
                          {submission.ausgewaehlteSpiele.length > 0 && (
                            <div className="mb-1">
                              <span className="text-xs font-medium text-gray-500">Ausgewählt:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {submission.ausgewaehlteSpiele.map(gameId => (
                                  <span key={gameId} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                                    {getGameName(gameId)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {submission.spieleWunschliste.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-gray-500">Wünsche:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {submission.spieleWunschliste.map((game, idx) => (
                                  <span key={idx} className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs">
                                    {game}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-4 border-b">
                        {submission.alsHelfer ? (
                          <div>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                              Ja
                            </span>
                            {submission.helferArt.length > 0 && (
                              <div className="mt-1">
                                {submission.helferArt.map((art, idx) => (
                                  <span key={idx} className="inline-block bg-gray-100 text-gray-800 mr-1 mt-1 px-2 py-0.5 rounded text-xs">
                                    {art}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                            Nein
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <div className="max-w-xs truncate">
                          {submission.kommentar || '-'}
                        </div>
                      </td>
                      <td className="py-2 px-4 border-b whitespace-nowrap">
                        {new Date(submission.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="py-4 text-center text-gray-500">
                      Keine Anmeldungen gefunden
                    </td>
                  </tr>
                )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 text-gray-500 text-sm">
                {filteredSubmissions.length} von {submissions.length} Anmeldungen angezeigt
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluationPage;
