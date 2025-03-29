// SpieleKarussell.tsx
import React, { useRef, useState } from 'react';
import { HelpCircle, TrendingUp, ChevronLeft, ChevronRight, FileText, Globe, Users, BarChart2, CirclePlay } from 'lucide-react';
import { Game } from '@/types/game'; // Import Game type (ManualLink is implicitly used via Game)

// Interface für einen Anleitungslink (kann entfernt werden, da aus types/game importiert)
// interface ManualLink {
//   type: 'www' | 'pdf' | 'video';
//   url: string;
// }

interface SpieleKarussellProps {  
  gamesData: Game[]; // Use the imported Game type
  ausgewaehlteSpiele: number[];
  isGameSelected: (gameId: number) => boolean;
  toggleGameSelection: (gameId: number) => void;
  getGameName: (gameId: number) => string;
}

const SpieleKarussell: React.FC<SpieleKarussellProps> = ({
  gamesData,
  ausgewaehlteSpiele,
  isGameSelected,
  toggleGameSelection,
  getGameName,
}) => {
  // Sort games by popularity (handle optional popular flag)
  const sortedGames = [...gamesData].sort((a, b) => {
    const aIsPopular = a.popular ?? false; // Default to false if undefined
    const bIsPopular = b.popular ?? false; // Default to false if undefined

    // First, sort by "popular" flag
    if (aIsPopular && !bIsPopular) return -1;
    if (!aIsPopular && bIsPopular) return 1;
    
    // If both are popular or both are not, sort by popularity percentage if available
    if (aIsPopular && bIsPopular) {
      const aPercentage = a.popularityPercentage || 0;
      const bPercentage = b.popularityPercentage || 0;
      return bPercentage - aPercentage; // Higher percentage first
    }
    
    // If no other sorting criteria apply, maintain original order
    return 0;
  });
  
  // Duplicate games for seamless loop
  const duplicatedGames = [...sortedGames, ...sortedGames];
  
  // Refs and state for manual scrolling
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Helfer-Funktion für Anleitung-Icons
  const getManualIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'www':
        return <Globe className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'video':
        return <CirclePlay className="w-3 h-3 sm:w-4 sm:h-4" />;
      default:
        return <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  // Helfer-Funktion für Schwierigkeitsgrad-Anzeige (Type already defined in Game)
  const renderDifficultyLevel = (level?: Game['difficulty']) => {
    if (!level) return null;
    
    return (
      <div className="flex items-center mt-0.5 sm:mt-1" title={`Schwierigkeitsgrad: ${level}/5`}>
        <BarChart2 className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 text-gray-600" />
        <div className="flex space-x-0.5">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${i < level ? 'bg-blue-600' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    );
  };

  // Scroll handlers
  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const scrollAmount = direction === 'left' ? -300 : 300;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Mouse event handlers for drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    if (scrollRef.current) {
      setScrollLeft(scrollRef.current.scrollLeft);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    
    const x = e.clientX;
    const distance = x - dragStart;
    scrollRef.current.scrollLeft = scrollLeft - distance;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
    if (scrollRef.current) {
      setScrollLeft(scrollRef.current.scrollLeft);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;
    
    const x = e.touches[0].clientX;
    const distance = x - dragStart;
    scrollRef.current.scrollLeft = scrollLeft - distance;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Helfer-Funktion um zu prüfen, ob ein Spiel Anleitungen hat (Type already defined in Game)
  const hasManuals = (game: Game) => {
    return game.manualLinks && game.manualLinks.length > 0;
  };

  return (
    <div className="mb-4 sm:mb-8 overflow-hidden">
      <div className="flex justify-between items-center mb-2 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-blue-700">Spieleangebot</h2>
        <div className="flex items-center text-blue-600">
          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="text-xs sm:text-sm font-medium">Beliebte Spiele</span>
        </div>
      </div>
      {/* Added relative for scroll buttons positioning */}
      <div className="relative">
        {/* Container for scrollable content with ref */}
        <div 
          ref={scrollRef}
          className="flex space-x-2 sm:space-x-4 pb-3 sm:pb-4 overflow-x-auto scrollbar-hide"
          id="spieleGalerie"
          style={{ scrollBehavior: 'smooth' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Map over duplicated games */}
          {duplicatedGames.map((spiel, index) => (
            // Use index as part of the key for duplicated items
            <div key={`${spiel.id}-${index}`}
                className={`flex-shrink-0 w-28 sm:w-40 h-60 sm:h-84 rounded-lg flex flex-col items-center justify-end p-2 sm:p-4 border-2 transition-all relative overflow-hidden group
                              ${isGameSelected(spiel.id) ? 'border-gray-300 bg-gray-0 hover:border-blue-300' : 'border-gray-200 hover:border-blue-300'}`}
                style={{
                  backgroundImage: `url(${spiel.imageUrl || `https://picsum.photos/seed/${index + 10}/300/300`})`,
                  backgroundSize: '100%',
                  backgroundPositionY: '15%',                  
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'top'
                }}>

              {/* Anleitung-Buttons (oben rechts) */}
              {hasManuals(spiel) && (
                <div className="absolute top-1 right-1 z-20 flex space-x-1">
                  {spiel.manualLinks?.map((manual, idx) => (
                    <a 
                      key={`manual-${spiel.id}-${idx}`}
                      href={manual.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-1 rounded-full bg-white/90 hover:bg-white shadow-sm 
                                  ${manual.type === 'pdf' ? 'text-red-600 hover:text-red-700' : 
                                     manual.type === 'www' ? 'text-blue-600 hover:text-blue-700' : 
                                     'text-gray-600 hover:text-gray-700'}`}
                      title={`${spiel.name} Anleitung (${manual.type.toUpperCase()})`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {getManualIcon(manual.type)}
                    </a>
                  ))}
                </div>
              )}

              <div className="relative z-10 flex flex-col items-center text-gray-800 bg-white/80 backdrop-blur-sm p-1.5 sm:p-2 rounded-md w-full">
                <p className="text-center font-semibold text-xs sm:text-sm truncate w-full">{spiel.name}</p>
                
                {/* Player count info */}
                {spiel.playerCount && (
                  <div className="mt-0.5 sm:mt-1 flex items-center text-gray-700 text-[10px] sm:text-xs">
                    <Users className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                    <span>{spiel.playerCount.min === spiel.playerCount.max 
                        ? `${spiel.playerCount.min} Spieler` 
                        : `${spiel.playerCount.min}-${spiel.playerCount.max} Spieler`}
                    </span>
                  </div>
                )}
                
                {/* Difficulty level display */}
                {renderDifficultyLevel(spiel.difficulty)}
                
                {/* Popular badge mit Prozentanzeige, wenn verfügbar (handle optional popular) */}
                {(spiel.popular ?? false) && ( // Check popular flag, default to false
                  <div className="mt-0.5 sm:mt-1 bg-yellow-300/80 text-yellow-900 px-1 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs flex items-center font-medium">
                    <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" /> 
                    {spiel.popularityPercentage 
                      ? `${spiel.popularityPercentage}% beliebt` 
                      : 'Beliebt'}
                  </div>
                )}
                
                {/* Button logic remains the same */}
                <button
                  type="button"
                  className={`mt-1 sm:mt-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs transition-colors ${isGameSelected(spiel.id) ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700 hover:bg-blue-500 hover:text-white'}`}
                  onClick={() => toggleGameSelection(spiel.id)}
                >
                  {isGameSelected(spiel.id) ? 'Ausgewählt' : 'Gefällt mir'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        <button
          type="button"
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-1 sm:p-2 text-blue-700 z-10"
          onClick={() => handleScroll('left')}
          aria-label="Nach links scrollen"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        
        <button
          type="button"
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-1 sm:p-2 text-blue-700 z-10"
          onClick={() => handleScroll('right')}
          aria-label="Nach rechts scrollen"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className="flex justify-between items-center mt-1 sm:mt-2">
        <p className="text-xs sm:text-sm text-gray-600">...und viele weitere Spiele!</p>
        <div className="text-xs sm:text-sm text-blue-600 flex items-center">
          <span className="mr-1">Anleitungen verfügbar</span>
          <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
        </div>
      </div>

      {ausgewaehlteSpiele.length > 0 && (
        <div className="mt-2 sm:mt-4 p-2 sm:p-3 bg-gray-100 rounded-lg">
          <h3 className="font-medium text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2">Deine ausgewählten Spiele:</h3>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {ausgewaehlteSpiele.map(spielId => (
              <div key={spielId} className="bg-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-gray-700 border border-gray-200 flex items-center text-xs sm:text-sm">
                {getGameName(spielId)}
                <button
                  type="button"
                  className="ml-1 sm:ml-2 text-gray-500 hover:text-gray-700"
                  onClick={() => toggleGameSelection(spielId)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpieleKarussell;
