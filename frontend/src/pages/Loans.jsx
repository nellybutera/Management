import { useState } from "react";
import Sidebar from  "../components/SideBar";

export default function Loans() {
  const [loans, setLoans] = useState([
    {
      id: 1,
      accountNumber: "AC123",
      user: "Nelly",
      amount: 500,
      description: "Small business loan",
      status: "Pending",
    },
    {
      id: 2,
      accountNumber: "AC124",
      user: "Alex",
      amount: 300,
      description: "Tuition support",
      status: "Approved",
    },
  ]);

  const updateStatus = (id, newStatus) => {
    setLoans((prev) =>
      prev.map((loan) => (loan.id === id ? { ...loan, status: newStatus } : loan))
    );

    // 🔜 later replace with:
    // await fetch(`/api/loans/${id}`, { method: "PUT", body: JSON.stringify({ status: newStatus }) })
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-6">Loans</h1>

        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full text-sm md:text-base">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="py-2 px-4">#</th>
                <th className="py-2 px-4">Account Number</th>
                <th className="py-2 px-4">Account Name</th>
                <th className="py-2 px-4">Amount</th>
                <th className="py-2 px-4">Description</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4">{loan.id}</td>
                  <td className="py-2 px-4">{loan.accountNumber}</td>
                  <td className="py-2 px-4">{loan.user}</td>
                  <td className="py-2 px-4">${loan.amount}</td>
                  <td className="py-2 px-4">{loan.description}</td>
                  <td className="py-2 px-4">{loan.status}</td>
                  <td className="py-2 px-4 space-x-2">
                    {loan.status === "Pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(loan.id, "Approved")}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(loan.id, "Rejected")}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
