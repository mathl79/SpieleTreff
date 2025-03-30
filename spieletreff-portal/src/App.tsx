import { Routes, Route } from 'react-router-dom'; // Removed BrowserRouter import
import SpieleTreffPortal from './components/SpieleTreffPortal';
import EvaluationPage from './components/EvaluationPage';
import DatenschutzPage from './components/DatenschutzPage'; // Import DatenschutzPage
import ImpressumPage from './components/ImpressumPage'; // Import ImpressumPage
// We will skip BarrierefreiheitPage for now
import './App.css';

function App() {
  return (
    // Removed BrowserRouter wrapper
    <div className="p-1 sm:p-2 md:p-4">
      <Routes>
        <Route path="/" element={<SpieleTreffPortal />} />
        <Route path="/evaluation" element={<EvaluationPage />} />
        <Route path="/datenschutz" element={<DatenschutzPage />} /> {/* Add Datenschutz route */}
        <Route path="/impressum" element={<ImpressumPage />} /> {/* Add Impressum route */}
        {/* <Route path="/barrierefreiheit" element={<BarrierefreiheitPage />} /> */} {/* Route for Barrierefreiheit (skipped) */}
      </Routes>
    </div>
    // Removed BrowserRouter wrapper
  );
}

export default App;
