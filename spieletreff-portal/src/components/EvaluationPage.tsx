import { useState, useEffect } from 'react';
import type { Submission } from '@/types/game';

// API URL ohne Port 3001
const API_URL = import.meta.env.PROD 
  ? 'https://mobile-tieraerztin-passau.de/api'
  : 'http://localhost:3001/api';

// Sorting types
type SortDirection = 'asc' | 'desc';
type SortField = '' | 'name' | 'date' | 'helping' | 'status';

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
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // API-Status zur Überprüfung der Verbindung
  const [apiStatus, setApiStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  
  useEffect(() => {
    // API-Verbindung testen
    const testApiConnection = async () => {
      try {
        console.log('Testing API connection to:', API_URL);
        const response = await fetch(`${API_URL}/submissions`);
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
    
    if (isAuthenticated) {
      testApiConnection();
    }
  }, [isAuthenticated]);

  // Rest des Codes...
