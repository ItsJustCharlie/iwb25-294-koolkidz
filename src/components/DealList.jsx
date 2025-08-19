import DealCard from './DealCard';

function DealList({ deals }) {
  
  return (
    <div className="deal-list-container">
      {deals.map((deal, index) => (
        <DealCard key={`${deal.site || deal.platform}-${deal.price}-${index}`} deal={deal} />
      ))}
    </div>
  );
}

export default DealList;