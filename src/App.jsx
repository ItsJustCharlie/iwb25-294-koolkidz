import './style.css'; 
import muffinLogo from './assets/muffin_logo.png';
import React, { useState, useEffect } from 'react';
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
  const [debugMsg, setDebugMsg] = useState("");

  useEffect(() => {
  console.log("script loaded");
                    }, []);

  const handleFindDeals = async () => {
    console.log("Find Deals button clicked!");
    console.log("Find Deals button clicked!");
    setIsLoading(true);
    setShowResults(false);


    try {
      let productName = "";
      let extractedUrl = "";
      console.log("Extracting product name from current tab URL...");
      // Check if we're in a Chrome extension environment
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        try {
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
            productName = urlInfo.productName;
            extractedUrl = urlInfo.url;
            console.log(`Extracted from URL: ${extractedUrl}\nProduct name: ${productName}`);
          } else {
            console.log(`Failed to extract product name: ${urlInfo.error}`);
            throw new Error(urlInfo.error);
          }
        } catch (err) {
          console.log(`Error extracting product name: ${err.message}`);
          throw err;
        }
      } else {
        console.log("Not running in extension environment, cannot extract product name from URL.");
        throw new Error("Not running in extension environment");
      }

      setCurrentProduct(productName);
      // Always call /search endpoint to trigger the scraper
      const url = `http://localhost:8080/search?q=${encodeURIComponent(productName)}`;
      console.log(`Extracted from URL: ${extractedUrl}\nProduct name: ${productName}\nCalling API: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        console.log(`HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`API response: ${JSON.stringify(data).slice(0, 200)}`);

      if (data.products && Array.isArray(data.products)) {
        const transformedDeals = data.products.map(product => ({
          site: product.platform || product.site || "Unknown",
          price: parseFloat(product.price?.toString().replace(/[Rs\.,]/g, '') || '0'),
          sales: product.sales || product.availability || "Available",
          link: product.link || product.url || "#",
          name: product.name || product.title || "Unknown Product",
          image: product.image_url || product.image || ""
        }));
        setDeals(transformedDeals);
      } else {
        setDeals([]);
      }
      setShowResults(true);
    } catch (err) {
      console.log(`Error: ${err.message}`);
      console.error("Error fetching deals:", err);
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
        <div style={{color: 'red', fontSize: '0.9em', marginBottom: 8}}>{debugMsg}</div>
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