import { useState } from "react";
import Sidebar from  "../components/SideBar";

export default function Users() {
  const [users] = useState([
    { id: 1, name: "Nelly", accountNumber: "AC123", creditScore: 720 },
    { id: 2, name: "Alex", accountNumber: "AC124", creditScore: 650 },
  ]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-6">Users</h1>

        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full text-sm md:text-base">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="py-2 px-4">#</th>
                <th className="py-2 px-4">Full Name</th>
                <th className="py-2 px-4">Account Number</th>
                <th className="py-2 px-4">Credit Score</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4">{user.id}</td>
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.accountNumber}</td>
                  <td className="py-2 px-4">{user.creditScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
