// Defines the structure for manual links associated with a game
export interface ManualLink {
  type: 'www' | 'pdf' | 'video'; // Allowed types for links
  url: string;                   // URL of the manual/link
}

// Defines the structure for player count information
export interface PlayerCount {
  min: number;
  max: number;
}

// Defines the allowed difficulty levels
export type Difficulty = 1 | 2 | 3 | 4 | 5;

// Defines the main structure for a game object
export interface Game {
  id: number;
  name: string;
  imageUrl: string;
  popular?: boolean;              // Optional: Indicates if the game is currently popular
  popularityPercentage?: number;  // Optional: Percentage score for popularity
  playerCount?: PlayerCount;      // Optional: Minimum and maximum player count
  difficulty?: Difficulty;        // Optional: Difficulty rating (1-5)
  manualLinks?: ManualLink[];     // Optional: Array of links to manuals or resources
}
