/**
 * Utility functions for handling form submissions
 */

import submissionsData from '../data/submissions.json';

// Type definition for a submission
export interface Submission {
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

// In-memory storage for submissions (simulating a database)
let submissions: Submission[] = [...submissionsData];

/**
 * Get all submissions
 * @returns Array of all submissions
 */
export const getAllSubmissions = (): Submission[] => {
  return submissions;
};

/**
 * Add a new submission
 * @param submission The submission data to add
 * @returns The added submission with generated ID
 */
export const addSubmission = (submission: Omit<Submission, 'id'>): Submission => {
  // Generate a new ID (in a real app, this would be handled by the database)
  const newId = submissions.length > 0 
    ? Math.max(...submissions.map(s => s.id)) + 1 
    : 1;
  
  // Create the new submission with ID
  const newSubmission: Submission = {
    ...submission,
    id: newId
  };
  
  // Add to our in-memory storage
  submissions = [...submissions, newSubmission];
  
  // Log the submission (in a real app, this would be saved to a database)
  console.log('New submission saved:', newSubmission);
  
  // In a real application, we would save to a database or API here
  // For this demo, we're just keeping it in memory
  
  return newSubmission;
};

/**
 * Get a submission by ID
 * @param id The ID of the submission to retrieve
 * @returns The submission or undefined if not found
 */
export const getSubmissionById = (id: number): Submission | undefined => {
  return submissions.find(s => s.id === id);
};
