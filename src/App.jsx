import './style.css'; 
import muffinLogo from './assets/muffin_logo.png';
import React, { useState } from 'react';
import OptionsPanel from './components/OptionsPanel';
import SortOptions from './components/SortOptions';
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
  const [sortBy, setSortBy] = useState("sales");

  const [deals, setDeals] = useState([]);

  const handleFindDeals = () => {
    setIsLoading(true);
    setShowResults(false);
    
    // Simulate API call
    setTimeout(() => {
      setDeals([
        { site: "Daraz", price: 3200, sales: 100, link: "#" },
        { site: "MyDeal.lk", price: 2950, sales: 200, link: "#" },
        { site: "AliExpress", price: 2700, sales: 50, link: "#" },
      ]);
      setIsLoading(false);
      setShowResults(true);
    }, 8000); //loader time
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    setShowOptions(false);
  };

  const sortedDeals = [...deals].sort((a, b) => {
    return sortBy === "sales" ? b.sales - a.sales : a.price - b.price;
  });

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
              <>
                <SortOptions sortBy={sortBy} setSortBy={setSortBy} />
                <DealList deals={sortedDeals} />
              </>
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