import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3001; // Port for the backend server

// Define path for JSON data files
const dataFilePath = path.join(__dirname, '../data/submissions.json');
const gameStatsFilePath = path.join(__dirname, '../data/gameStats.json');

console.log(dataFilePath);
// Ensure data directory exists
const dataDirectory = path.dirname(dataFilePath);
if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

// Define the Submission type (should match the frontend)
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
  keepEmailForFuture: boolean; // Add the new field
}

// Define the game statistics type
interface GameStats {
  [gameId: number]: {
    count: number;
    percentage: number;
  };
  totalSubmissions: number;
}

// Function to load submissions from JSON file
function loadSubmissions(): Submission[] {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading submissions from file:', error);
  }
  return []; // Return empty array if file doesn't exist or error occurred
}

// Function to save submissions to JSON file
function saveSubmissions(submissions: Submission[]): void {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(submissions, null, 2), 'utf8');
    console.log(`Saved ${submissions.length} submissions to ${dataFilePath}`);
  } catch (error) {
    console.error('Error saving submissions to file:', error);
  }
}

// Function to calculate and save game popularity statistics
function updateGameStats(submissions: Submission[]): void {
  try {
    // Count only submissions with "ja" or "vielleicht" as teilnahmeStatus
    const validSubmissions = submissions.filter(
      (s) => s.teilnahmeStatus === 'ja' || s.teilnahmeStatus === 'vielleicht'
    );
    
    // Initialize game stats
    const gameStats: GameStats = {
      totalSubmissions: validSubmissions.length
    };
    
    // Count occurrences of each game
    validSubmissions.forEach((submission) => {
      submission.ausgewaehlteSpiele.forEach((gameId) => {
        if (!gameStats[gameId]) {
          gameStats[gameId] = { count: 0, percentage: 0 };
        }
        gameStats[gameId].count += 1;
      });
    });
    
    // Calculate percentages
    if (validSubmissions.length > 0) {
      Object.keys(gameStats).forEach((key) => {
        if (key !== 'totalSubmissions') {
          const gameId = parseInt(key);
          gameStats[gameId].percentage = Math.round((gameStats[gameId].count / validSubmissions.length) * 100);
        }
      });
    }
    
    // Save to file
    fs.writeFileSync(gameStatsFilePath, JSON.stringify(gameStats, null, 2), 'utf8');
    console.log(`Updated game statistics saved to ${gameStatsFilePath}`);
  } catch (error) {
    console.error('Error updating game statistics:', error);
  }
}

// Function to load game statistics from JSON file
function loadGameStats(): GameStats {
  try {
    if (fs.existsSync(gameStatsFilePath)) {
      const data = fs.readFileSync(gameStatsFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading game statistics from file:', error);
  }
  return { totalSubmissions: 0 }; // Return empty stats if file doesn't exist or error occurred
}

// Load initial submissions from file
let submissions: Submission[] = loadSubmissions();
let nextId = submissions.length > 0 ? Math.max(...submissions.map(s => s.id)) + 1 : 1;

// Calculate initial game statistics
updateGameStats(submissions);

// Middleware
app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(express.json()); // Parse JSON request bodies

// --- API Endpoints ---

// GET /api/submissions - Retrieve all submissions
app.get('/api/submissions', (req: Request, res: Response) => {
  console.log(`GET /api/submissions - Returning ${submissions.length} submissions`);  
  res.json(submissions);
});

// GET /api/game-stats - Retrieve game popularity statistics
app.get('/api/game-stats', (req: Request, res: Response) => {
  console.log(`GET /api/game-stats - Returning game statistics`);
  const gameStats = loadGameStats();
  res.json(gameStats);
});

// POST /api/submissions - Add a new submission
app.post('/api/submissions', (req: Request, res: Response): void => {
  // Define the expected body structure (excluding id and timestamp)
  type SubmissionInput = Omit<Submission, 'id' | 'timestamp'>;
  const submissionData: SubmissionInput = req.body;

  // Basic validation (add more robust validation as needed)
  if (!submissionData || typeof submissionData !== 'object' || !submissionData.name || !submissionData.email) {
     res.status(400).json({ error: 'Invalid submission data' });
     return; // Explicitly return after sending response
  }

  // Check if the email already exists in submissions
  const existingSubmissionIndex = submissions.findIndex(
    (s) => s.email.toLowerCase() === submissionData.email.toLowerCase()
  );

  // Create new submission object
  const newSubmission: Submission = {
    id: existingSubmissionIndex >= 0 ? submissions[existingSubmissionIndex].id : nextId++, // Use existing ID or get new one
    timestamp: new Date().toISOString(), // Ensure timestamp is set server-side
    name: submissionData.name,
    email: submissionData.email,
    teilnahmeStatus: submissionData.teilnahmeStatus || '', // Provide defaults if needed
    anzahlPersonen: submissionData.anzahlPersonen || 1,
    mitFahrgelegenheit: submissionData.mitFahrgelegenheit || '',
    ausgewaehlteSpiele: submissionData.ausgewaehlteSpiele || [],
    spieleWunschliste: submissionData.spieleWunschliste || [],
    alsHelfer: submissionData.alsHelfer || false,
    helferArt: submissionData.helferArt || [],
    kommentar: submissionData.kommentar || '',
    keepEmailForFuture: submissionData.keepEmailForFuture || false // Add the new field, default to false
  };

  // If the email already exists, replace the existing entry
  if (existingSubmissionIndex >= 0) {
    console.log(`POST /api/submissions - Updating existing submission for ${submissionData.email}`);
    submissions[existingSubmissionIndex] = newSubmission;
  } else {
    // Otherwise, add as a new entry
    console.log(`POST /api/submissions - Added new submission ID: ${newSubmission.id}`);
    submissions.push(newSubmission);
  }

  // Save updated submissions to file
  saveSubmissions(submissions);
  
  // Update game popularity statistics
  updateGameStats(submissions);

  res.status(201).json(newSubmission); // Return the created/updated submission
});

// --- Start Server ---
app.listen(port, '0.0.0.0', () => {
  console.log(`Spieletreff backend server listening on http://0.0.0.0:${port}`);
  console.log(`Access from other devices using your network IP and port ${port}`);
  console.log(`Loaded ${submissions.length} submissions from ${dataFilePath}`);
});
