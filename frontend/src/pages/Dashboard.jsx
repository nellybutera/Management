import { useState } from "react";
import Sidebar from  "../components/SideBar";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [users] = useState([
    { id: 1, name: "Nelly", accountNumber: "AC123", activeLoans: 1 },
    { id: 2, name: "Alex", accountNumber: "AC124", activeLoans: 0 },
  ]);

  const [loans] = useState([
    { id: 1, user: "Nelly", amount: 500, status: "Pending" },
    { id: 2, user: "Alex", amount: 300, status: "Approved" },
  ]);

  const totalUsers = users.length;
  const totalActiveLoans = loans.filter((l) => l.status === "Approved").length;
  const pendingRequests = loans.filter((l) => l.status === "Pending").length;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Users" value={totalUsers} />
          <StatCard title="Active Loans" value={totalActiveLoans} />
          <StatCard title="Pending Requests" value={pendingRequests} />
        </div>
      </div>
    </div>
  );
}
