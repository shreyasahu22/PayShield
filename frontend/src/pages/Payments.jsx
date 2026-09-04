import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updatePaymentStatus } from "../api";

function Payments() {
  const navigate = useNavigate();

  const [merchantId, setMerchantId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [paymentMethod, setPaymentMethod] = useState("card");

  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(true);

  async function loadPayments() {
    try {
      setLoadingPayments(true);

      const response = await fetch(
        "http://127.0.0.1:8000/payments/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }

      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error("Payment loading error:", error);
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

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

      await loadPayments();
    } catch (error) {
      setMessage(error.message);
    }

    setLoading(false);
  };

  const handleStatusChange = async (paymentId, status) => {
    try {
      await updatePaymentStatus(paymentId, status);

      setMessage("Payment status updated successfully.");

      await loadPayments();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="payments-page">

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>💳 Payments</h2>
          <p>Create and monitor payment transactions</p>
        </div>
      </div>

      {/* Create Payment */}
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
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
              >
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="netbanking">
                  Net Banking
                </option>
              </select>
            </div>

          </div>

          <button
            type="submit"
            className="create-button"
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : "Create Payment →"}
          </button>

        </form>

        {message && (
          <div className="form-message">
            {message}
          </div>
        )}

      </div>

      {/* Recent Transactions */}
      <div className="panel">

        <div className="panel-title">

          <h2>Recent Transactions</h2>

          <button
            className="refresh-button"
            onClick={loadPayments}
            disabled={loadingPayments}
          >
            {loadingPayments
              ? "Refreshing..."
              : "↻ Refresh"}
          </button>

        </div>

        {loadingPayments ? (
          <p>Loading transactions...</p>
        ) : payments.length === 0 ? (
          <p>No transactions found.</p>
        ) : (

          <div className="table-container">

            <table className="payments-table">

              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Investigation</th>
                </tr>
              </thead>

              <tbody>

                {payments.map((payment) => (

                  <tr key={payment.id}>

                    <td>
                      #{payment.id}
                    </td>

                    <td>
                      Customer #{payment.customer_id}
                    </td>

                    <td>
                      {payment.currency} {payment.amount}
                    </td>

                    <td>
                      {payment.payment_method}
                    </td>

                    <td>

                      <select
                        className="status-select"
                        value={payment.status}
                        onChange={(e) =>
                          handleStatusChange(
                            payment.id,
                            e.target.value
                          )
                        }
                      >
                        <option value="created">
                          Created
                        </option>

                        <option value="authorized">
                          Authorized
                        </option>

                        <option value="success">
                          Success
                        </option>

                        <option value="failed">
                          Failed
                        </option>
                      </select>

                    </td>

                    <td>

                      <button
                        className="view-button"
                        onClick={() =>
                          navigate(
                            `/transaction/${payment.id}`
                          )
                        }
                      >
                        View Details →
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Payments;