import { useState, useEffect } from 'react';
import type { Submission } from '@/types/game';

// Zurück zur expliziten Port-Angabe
const API_URL = import.meta.env.PROD 
  ? 'https://mobile-tieraerztin-passau.de:3001/api'
  : 'http://localhost:3001/api';

// Rest des Codes...
