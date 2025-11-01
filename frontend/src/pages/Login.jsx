import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple check for now
    if (email === "admin@example.com" && password === "admin123") {
      navigate("/"); // redirect to admin dashboard
    } else {
      setError("Invalid credentials");
    }

    // 🔜 Later replace with API call
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center">Admin Login</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded p-2 mt-1 focus:ring-2 focus:ring-gray-700 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded p-2 mt-1 focus:ring-2 focus:ring-gray-700 outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
