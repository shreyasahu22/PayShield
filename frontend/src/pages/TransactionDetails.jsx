import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPayments, assessRisk } from "../api";

function TransactionDetails() {
  const { paymentId } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetails() {
      try {
        const payments = await getPayments();

        const selectedPayment = payments.find(
          (p) => p.id === Number(paymentId)
        );

        if (!selectedPayment) {
          setPayment(null);
          return;
        }

        setPayment(selectedPayment);

        const riskResult = await assessRisk(paymentId);
        setRisk(riskResult);
      } catch (error) {
        console.error("Transaction details error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [paymentId]);

  if (loading) {
    return <p>Loading transaction details...</p>;
  }

  if (!payment) {
    return (
      <div className="panel">
        <h2>Transaction Not Found</h2>
        <button onClick={() => navigate("/payments")}>
          ← Back to Payments
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Transaction Investigation</h2>
          <p>Detailed payment and risk analysis</p>
        </div>

        <button
          className="refresh-button"
          onClick={() => navigate("/payments")}
        >
          ← Back to Payments
        </button>
      </div>

      <div className="panel">
        <h2>Transaction Details</h2>

        <div className="payment-form">
          <div>
            <strong>Payment ID</strong>
            <p>#{payment.id}</p>
          </div>

          <div>
            <strong>Merchant ID</strong>
            <p>{payment.merchant_id}</p>
          </div>

          <div>
            <strong>Customer ID</strong>
            <p>{payment.customer_id}</p>
          </div>

          <div>
            <strong>Amount</strong>
            <p>
              {payment.currency} {payment.amount}
            </p>
          </div>

          <div>
            <strong>Payment Method</strong>
            <p>{payment.payment_method}</p>
          </div>

          <div>
            <strong>Status</strong>
            <p>{payment.status}</p>
          </div>
        </div>
      </div>

      {risk && (
        <div className="panel">
          <h2>Risk Assessment</h2>

          <div className="payment-form">
            <div>
              <strong>Risk Score</strong>
              <p>{risk.risk_score}/100</p>
            </div>

            <div>
              <strong>Risk Level</strong>
              <p>
                <span className={`risk-badge ${risk.risk_level}`}>
                  {risk.risk_level}
                </span>
              </p>
            </div>

            <div>
              <strong>Amount Anomaly</strong>
              <p>{risk.amount_anomaly}</p>
            </div>

            <div>
              <strong>Velocity Score</strong>
              <p>{risk.velocity_score}</p>
            </div>

            <div>
              <strong>Failure Score</strong>
              <p>{risk.failure_score}</p>
            </div>

            <div>
              <strong>Behaviour Score</strong>
              <p>{risk.behaviour_score}</p>
            </div>
          </div>

          <div className="risk-explanation">
            <h3>Why was this transaction flagged?</h3>

            {risk.reasons && risk.reasons.length > 0 ? (
              <ul>
                {risk.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            ) : (
              <p>No major risk indicators detected.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionDetails;