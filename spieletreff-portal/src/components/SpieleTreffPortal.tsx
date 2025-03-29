import { useState } from 'react';
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

  // Verwenden Sie import.meta.env.BASE_URL für alle Bildpfade
  const backgrounds = [
    import.meta.env.BASE_URL + 'images/pizza.jpg',
    import.meta.env.BASE_URL + 'images/games1.jpg',
    import.meta.env.BASE_URL + 'images/getränke.jpg',
    import.meta.env.BASE_URL + 'images/games2.jpg',
    import.meta.env.BASE_URL + 'images/snacks2.jpg',
    import.meta.env.BASE_URL + 'images/games3.jpg',
    import.meta.env.BASE_URL + 'images/pizza.jpg',
    import.meta.env.BASE_URL + 'images/games4.jpg',
    import.meta.env.BASE_URL + 'images/pizza.jpg',
    import.meta.env.BASE_URL + 'images/games4.jpg',
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Rest des Codes bleibt unverändert... */}
