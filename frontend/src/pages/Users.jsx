import Sidebar from "../components/SideBar";

const users = [
  { id: 1, name: "Nelly Butera", accountNumber: "ACC123456", email: "nelly@example.com" },
  { id: 2, name: "Jane Doe", accountNumber: "ACC987654", email: "jane@example.com" },
];

export default function Users() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-semibold mb-6">Users</h1>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded text-sm md:text-base">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4">#</th>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Account Number</th>
                <th className="py-2 px-4">Email</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4">{u.id}</td>
                  <td className="py-2 px-4">{u.name}</td>
                  <td className="py-2 px-4">{u.accountNumber}</td>
                  <td className="py-2 px-4">{u.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
