<h1>iwb25-294-koolkidz</h1>
<h1>Muffins browser extension </h1>

A comprehensive extension that aggregates product deals from multiple online marketplaces. Built with a modern tech stack featuring Ballerina backend, React frontend, and Python web scrapers.

# Features
    Multi-platform Product Aggregation: Scrapes and combines deals from Daraz, ikman.lk, and Wasi.lk
    Real-time Deal Search: Fast, concurrent scraping across multiple platforms
    Modern React Frontend: Clean, responsive UI with loading states and animations
    RESTful API: Ballerina-powered backend with CORS support
    Product Details: Display prices and product images
    Direct Links: Quick access to original product pages

# Architecture
Frontend (React + Vite) --> Port 5173
Backend (Ballerina) --> Port 8080
Data Scrapers (Python) 

## Components Overview

# Frontend 
    App.jsx: Main application component with state management
    Components:
        `DealCard.jsx`: Individual product card display
        `DealList.jsx`: Collection of deal cards
        `OptionsPanel.jsx`: User preference settings
        `Loader.jsx`: Loading animation component

# Backend (`main.bal`)
    Ballerina HTTP Service: RESTful API on port 8080
    Product Model: Structured data types for products
    CORS Configuration: Cross-origin resource sharing enabled
    Data Handling: JSON file reading and parsing with error handling

# Data Scrapers (`Scraping/`)
    main_scraper.py: Unified scraper orchestrating all platforms
    daraz_scraper.py: Daraz.lk product scraper
    ikman_scraper.py: ikman.lk marketplace scraper  
    wasi_scraper.py: Wasi.lk platform scraper



# Prerequisites
    Node.js (v18+)
    Ballerina (2201.12.7)
    Python (3.8+)
    Selenium WebDriver (for web scraping)


# Installation

1. Clone the repository
   ```bash
   git clone https://github.com/ItsJustCharlie/iwb25-294-koolkidz.git
   cd iwb25-294-koolkidz
   ```

2. Install frontend dependencies
   ```bash
   npm install
   ```

3. Install Python scraper dependencies
   ```bash
   cd Scraping
   pip install selenium requests beautifulsoup4
   cd ..
   ```


# Accessing the Application
    Frontend: http://localhost:5173
    Backend API: http://localhost:8080
    API Endpoint: http://localhost:8080/search


# Project Structure

```
├── main.bal                 # Ballerina backend service
├── Config.toml             # Backend configuration
├── Ballerina.toml          # Package definition
├── Dependencies.toml       # Ballerina dependencies
├── data.json              # Sample product data
├── package.json           # Frontend dependencies
├── vite.config.js         # Vite configuration
├── index.html             # HTML entry point
├── src/
│   ├── App.jsx            # Main React component
│   ├── main.jsx           # React entry point
│   ├── style.css          # Application styles
│   ├── components/        # React components
│   └── assets/            # Static assets
├── Scraping/
│   ├── main_scraper.py    # Unified scraper
│   ├── daraz_scraper.py   # Daraz scraper
│   ├── ikman_scraper.py   # ikman scraper
│   ├── wasi_scraper.py    # Wasi scraper
│   └── search_results_*.json # Scraped data samples
├── public/                # Public assets
└── target/                # Build outputs
```


# Development

Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

Backend Development
```bash
bal run              # Run Ballerina service
bal build            # Build the project
bal test             # Run tests
```
