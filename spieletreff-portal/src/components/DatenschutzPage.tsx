import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const DatenschutzPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg my-4 sm:my-8">
      <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 text-sm sm:text-base">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Zurück zum Portal
      </Link>
      <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center">
        <Shield className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-700" />
        Datenschutzerklärung
      </h1>
      <div className="prose prose-sm sm:prose-base max-w-none">
        <p>
          Hier steht die ausführliche Datenschutzerklärung für den Spieletreff.
        </p>
        <p>
          Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Nachfolgend informieren wir Sie über die Erhebung, Verarbeitung und Nutzung Ihrer Daten im Rahmen des Spieletreffs.
        </p>
        <h2>Verantwortliche Stelle</h2>
        <p>
          [Name und Kontaktdaten des Verantwortlichen einfügen, z.B. Gemeinde Salzweg, Adresse, E-Mail]
        </p>
        <h2>Zweck der Datenverarbeitung</h2>
        <p>
          Die bei der Anmeldung erhobenen Daten (Name, E-Mail, Telefonnummer, Teilnahmestatus, etc.) werden ausschließlich für die Organisation und Durchführung des Spieletreffs verwendet. Dies umfasst:
        </p>
        <ul>
          <li>Planung der Teilnehmerzahl und Ressourcen.</li>
          <li>Koordination von Fahrgemeinschaften (falls angegeben).</li>
          <li>Berücksichtigung von Spielwünschen und Helferangeboten.</li>
          <li>Kontaktmöglichkeit bei Rückfragen oder Änderungen.</li>
          <li>optional Kontaktmöglichkeit zur Mitteilung weiterer Veranstaltungstermine.</li>
        </ul>
        <h2>Rechtsgrundlage</h2>
        <p>
          Die Verarbeitung Ihrer Daten erfolgt auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie durch das Akzeptieren des Datenschutzhinweises bei der Anmeldung erteilen.
        </p>
        <h2>Speicherdauer</h2>
        <p>
          Ihre Daten werden nur so lange gespeichert, wie es für die Organisation des Spieletreffs notwendig ist. Nach Abschluss der Veranstaltung und der damit verbundenen Abwicklung werden Ihre personenbezogenen Daten gelöscht.
        </p>
        <h2>Weitergabe von Daten</h2>
        <p>
          Eine Weitergabe Ihrer Daten an Dritte erfolgt nicht, es sei denn, dies ist zur Organisation zwingend erforderlich (z.B. bei expliziter Zustimmung zur Weitergabe von Kontaktdaten für Fahrgemeinschaften) oder wir sind gesetzlich dazu verpflichtet.
        </p>
        <h2>Ihre Rechte</h2>
        <p>
          Sie haben jederzeit das Recht auf Auskunft über die bei uns gespeicherten Daten, deren Berichtigung, Löschung oder Einschränkung der Verarbeitung. Sie können Ihre Einwilligung jederzeit widerrufen. Bitte wenden Sie sich dazu an die oben genannte verantwortliche Stelle.
        </p>
        <p>
          [letzte Änderung 29.03.2025]
        </p>
      </div>
    </div>
  );
};

export default DatenschutzPage;
