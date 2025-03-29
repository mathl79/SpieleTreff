import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const ImpressumPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg my-4 sm:my-8">
      <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 text-sm sm:text-base">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Zurück zum Portal
      </Link>
      <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center">
        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-700" />
        Impressum
      </h1>
      <div className="prose prose-sm sm:prose-base max-w-none">
        <h2>Angaben gemäß § 5 TMG</h2>
        <p>
          [im Namen der Gemeinde Salzweg]<br />
          [Vertreten durch, z.B. Bürgermeister/in Vorname Nachname]<br />
          [Straße und Hausnummer]<br />
          [PLZ Ort]
        </p>

        <h2>Kontakt</h2>
        <p>
          Telefon: [Telefonnummer]<br />
          E-Mail: [E-Mail-Adresse]
        </p>

        <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
        <p>
          [Vorname Nachname des Verantwortlichen]<br />
          [Anschrift wie oben oder abweichend]
        </p>

        {/* Optional: Hinweis auf Streitschlichtung */}
        {/*
        <h2>Streitschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>.<br />
          Unsere E-Mail-Adresse finden Sie oben im Impressum.
        </p>
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>
        */}

        <h2>Haftungsausschluss</h2>
        <p>
          [Standard-Haftungsausschluss für Inhalte, Links etc. hier einfügen oder anpassen]
        </p>
        <p>
          Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
        </p>
        {/* ... weiterer Haftungsausschluss Text ... */}

        <h2>Urheberrecht</h2>
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
        </p>
        <p>
          [letzte Änderung 29.03.2025]
        </p>
      </div>
    </div>
  );
};

export default ImpressumPage;
