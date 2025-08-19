function DealCard({ deal }) {
  // Ensure price is a number for display
  const price = typeof deal.price === 'string' ? 
    parseFloat(deal.price.replace(/[Rs\.,]/g, '') || '0') : 
    deal.price;
  
  return (
    <div className="deal-card">
      <div className="deal-image-container">
        <div className="deal-image-placeholder">
          <span>{deal.site.charAt(0)}</span>
        </div>
      </div>
      <div className="deal-content">
        <h3 className="deal-title">{deal.site}</h3>
        <div className="deal-stats">
          <div className="deal-stat">
            <span className="stat-label">Price</span>
            <span className="stat-value">Rs. {price.toLocaleString()}</span>
          </div>
          <div className="deal-stat">
            <span className="stat-label">Sales</span>
            <span className="stat-value">{deal.sales}+</span>
          </div>
        </div>
        <a 
          href={deal.link || "#"} 
          className="deal-link"
          target="_blank" 
          rel="noopener noreferrer"
        >
          View Deal →
        </a>
      </div>
    </div>
  );
}

export default DealCard;