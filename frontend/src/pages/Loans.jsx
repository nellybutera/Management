import Sidebar from "../components/SideBar";
import { useState } from "react";

const sampleLoans = [
  { id: 1, accountNumber: "ACC123456", name: "Nelly Butera", amount: 2000, description: "Tuition Loan", status: "Pending" },
  { id: 2, accountNumber: "ACC987654", name: "Jane Doe", amount: 1000, description: "Medical Loan", status: "Pending" },
];

export default function Loans() {
  const [loans, setLoans] = useState(sampleLoans);

  const updateStatus = (id, newStatus) => {
    setLoans(loans.map(l => (l.id === id ? { ...l, status: newStatus } : l)));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-semibold mb-6">Loans</h1>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded text-sm md:text-base">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4">#</th>
                <th className="py-2 px-4">Account</th>
                <th className="py-2 px-4">Name</th>
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
                  <td className="py-2 px-4">{loan.name}</td>
                  <td className="py-2 px-4">${loan.amount}</td>
                  <td className="py-2 px-4">{loan.description}</td>
                  <td className="py-2 px-4">{loan.status}</td>
                  <td className="py-2 px-4 space-x-1">
                    {loan.status === "Pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(loan.id, "Approved")}
                          className="bg-green-500 text-white px-2 py-1 rounded text-xs md:text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(loan.id, "Rejected")}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs md:text-sm"
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
