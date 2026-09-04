import { useState } from "react";

function Payments() {
  const [merchantId, setMerchantId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const url =
        `http://127.0.0.1:8000/payments/` +
        `?merchant_id=${merchantId}` +
        `&customer_id=${customerId}` +
        `&amount=${amount}` +
        `&currency=${currency}` +
        `&payment_method=${paymentMethod}`;

      const response = await fetch(url, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Payment failed");
      }

      setMessage("Payment created successfully.");

      setMerchantId("");
      setCustomerId("");
      setAmount("");
      setCurrency("INR");
      setPaymentMethod("card");

    } catch (error) {
      setMessage(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="payments-page">

      <div className="page-header">
        <div>
          <h2>💳 Payments</h2>
          <p>Create and monitor payment transactions</p>
        </div>
      </div>

      <div className="panel payment-panel">

        <div className="panel-title">
          <h2>Create New Payment</h2>
          <span className="secure-badge">🔒 Secure</span>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="payment-form">

            <div className="form-group">
              <label>Merchant ID</label>

              <input
                type="number"
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                placeholder="Enter merchant ID"
                required
              />
            </div>

            <div className="form-group">
              <label>Customer ID</label>

              <input
                type="number"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Enter customer ID"
                required
              />
            </div>

            <div className="form-group">
              <label>Amount</label>

              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>

            <div className="form-group">
              <label>Currency</label>

              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div className="form-group">
              <label>Payment Method</label>

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="netbanking">Net Banking</option>
              </select>
            </div>

          </div>

          <button
            type="submit"
            className="create-button"
            disabled={loading}
          >
            {loading ? "Processing..." : "Create Payment →"}
          </button>

        </form>

        {message && (
          <div className="form-message">
            {message}
          </div>
        )}

      </div>

    </div>
  );
}

export default Payments;