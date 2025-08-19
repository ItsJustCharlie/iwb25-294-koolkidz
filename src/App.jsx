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
  const [currentProduct, setCurrentProduct] = useState("");

  const handleFindDeals = async () => {
    setIsLoading(true);
    setShowResults(false);

    try {
      let productName = "sample laptop"; // Default fallback

      // Check if we're in a Chrome extension environment
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        try {
          // Get current tab URL and extract product name
          const urlInfo = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
              { action: "getCurrentUrl" },
              (response) => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                  return;
                }
                if (!response) {
                  reject(new Error("No response from background script"));
                  return;
                }
                resolve(response);
              }
            );
          });

          if (urlInfo.success) {
            productName = urlInfo.productName || "sample laptop";
          } else {
            console.warn("Could not get URL from extension:", urlInfo.error);
          }
        } catch (err) {
          console.warn("Extension URL extraction failed:", err.message);
          // Continue with default product name
        }
      } else {
        console.warn("Not running in extension environment, using fallback");
      }

      setCurrentProduct(productName);

      // First, try to get completed results
      try {
        const resultsResponse = await fetch(`http://localhost:8080/results?query=${encodeURIComponent(productName)}`);
        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json();
          if (resultsData.status === "completed" && resultsData.products && resultsData.products.length > 0) {
            // Transform scraped data to frontend format
            const transformedDeals = resultsData.products.map(product => ({
              site: product.platform || "Unknown",
              price: parseFloat(product.price?.toString().replace(/[Rs\.,]/g, '') || '0'),
              sales: product.sales || "0",
              link: product.link || product.url || "#"
            }));
            
            setDeals(transformedDeals);
            setShowResults(true);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.log("No completed results yet, starting new search");
      }

      // If no completed results, start new search
      const response = await fetch(`http://localhost:8080/search?query=${encodeURIComponent(productName)}`); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Handle the response format
      if (data.products && Array.isArray(data.products)) {
        // Transform scraped data to match original format
        const transformedDeals = data.products.map(product => ({
          site: product.platform || "Unknown",
          price: parseFloat(product.price?.toString().replace(/[Rs\.,]/g, '') || '0'),
          sales: product.sales || "0",
          link: product.link || product.url || "#"
        }));
        setDeals(transformedDeals);   
      } else {
        setDeals([]);
      }
      setShowResults(true);
    } catch (err) {
      console.error("Error fetching deals:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
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
                {currentProduct && (
                  <div className="current-search">
                    <p className="search-label">Searching for:</p>
                    <p className="search-term">{currentProduct}</p>
                  </div>
                )}
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