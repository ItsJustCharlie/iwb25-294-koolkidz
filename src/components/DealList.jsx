import DealCard from './DealCard';

function DealList({ deals }) {
  return (
    <div className="deal-list-container">
      {deals.map((deal) => (
        <DealCard key={`${deal.site}-${deal.price}`} deal={deal} />
      ))}
    </div>
  );
}

export default DealList;