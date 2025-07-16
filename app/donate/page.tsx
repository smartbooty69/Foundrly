"use client";
import { useState } from "react";

export default function DonatePage() {
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Failed to create Stripe session.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-4">Support Foundrly</h1>
      <form onSubmit={handleDonate} className="flex flex-col items-center gap-4 w-full max-w-xs">
        <label className="w-full">
          <span className="block mb-1 font-medium">Donation Amount (INR)</span>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            className="w-full border rounded px-3 py-2 text-lg"
            required
          />
        </label>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-full"
          disabled={loading}
        >
          {loading ? "Redirecting..." : `Donate ₹${amount}`}
        </button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </form>
    </div>
  );
} 