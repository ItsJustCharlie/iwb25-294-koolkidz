import './style.css'; 
import muffinLogo from './assets/muffin_logo.png';
import React, { useState } from 'react';
import OptionsPanel from './components/OptionsPanel';
import DealList from './components/DealList';
import { Loader } from './components/Loader';

function App() {
  const [showOptions, setShowOptions] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    includeSecondHand: false,
    localOnly: true
  });

  const [deals, setDeals] = useState([]);

  const handleFindDeals = async () => {
    setIsLoading(true);
    setShowResults(false);

    try {

      const response = await fetch("http://localhost:8080/search"); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      setDeals(data);   
      setShowResults(true);
    } catch (err) {
      console.error("Error fetching deals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    setShowOptions(false);
  };



  return (
    <div className={`app-container ${isLoading ? 'loading-state' : ''}`}>
      <div className={`card ${isLoading ? 'loading-card' : ''}`}>
        {!isLoading ? (
          <>
            {!showResults && (
              <>
                <div>
                  <img src={muffinLogo} alt="Muffin Logo" className="logo" />
                  <h1 className="header-title">Muffins</h1>
                </div>
                <button className="find-button" onClick={handleFindDeals}>
                  Find Deals
                </button>
                <br/>
                <button
                  className="options-link"
                  onClick={() => setShowOptions(!showOptions)}
                >
                  More Options
                </button>
                {showOptions && (
                  <OptionsPanel
                    currentSettings={settings}
                    onSave={handleSaveSettings}
                  />
                )}
              </>
            )}

            {showResults && (
              <DealList deals={deals} />
            )}
          </>
        ) : (
          <div className="full-screen-loader">
            <Loader />
            <p className="loading-text">Cooking up deals...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;