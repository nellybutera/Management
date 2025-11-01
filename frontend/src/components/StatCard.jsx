export default function StatCard({ title, value }) {
  return (
    <div className="bg-white shadow rounded p-4 text-center">
      <h2 className="text-gray-600 text-sm mb-2">{title}</h2>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
