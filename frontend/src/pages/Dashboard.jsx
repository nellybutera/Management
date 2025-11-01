import Sidebar from "../components/SideBar";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-semibold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Users" value="120" />
          <StatCard title="Active Loans" value="34" />
          <StatCard title="Pending Requests" value="5" />
        </div>
      </div>
    </div>
  );
}
