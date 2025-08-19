function DealCard({ deal }) {
  // Ensure price is a number for display
  const price = typeof deal.price === 'string' ? 
    parseFloat(deal.price.replace(/[Rs\.,]/g, '') || '0') : 
    deal.price;
  
  return (
    <div className="deal-card">
      <div className="deal-image-container">
        {deal.image && deal.image !== "" ? (
          <img 
            src={deal.image} 
            alt={deal.name || deal.site} 
            className="deal-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="deal-image-placeholder" style={{display: deal.image && deal.image !== "" ? 'none' : 'flex'}}>
          <span>{deal.site.charAt(0)}</span>
        </div>
      </div>
      <div className="deal-content">
        <h3 className="deal-title">{deal.name || deal.site}</h3>
        <div className="deal-platform">
          <span className="platform-label">From: {deal.site}</span>
        </div>
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