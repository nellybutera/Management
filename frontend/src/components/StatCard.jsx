export default function StatCard({ title, value }) {
  return (
    <div className="bg-white shadow rounded p-4 text-center">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
