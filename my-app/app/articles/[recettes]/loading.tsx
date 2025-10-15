export default function Loading() {
  // Add fallback UI that will be shown while the route is loading.
  return <LoadingSkeleton />
}

function LoadingSkeleton() {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f3f3f3',
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <p>Chargement en cours...</p>
    </div>
  );
}