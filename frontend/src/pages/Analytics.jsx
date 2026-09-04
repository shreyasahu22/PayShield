import { useEffect, useState } from "react";
import { getPayments, assessRisk } from "../api";

function Analytics() {
  const [payments, setPayments] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await getPayments();
        setPayments(data);

        const assessments = [];

        for (const payment of data) {
          try {
            const risk = await assessRisk(payment.id);

            assessments.push({
              ...payment,
              risk_score: risk.risk_score,
              risk_level: risk.risk_level,
            });
          } catch (error) {
            console.error(
              `Risk assessment failed for payment ${payment.id}`
            );
          }
        }

        setRiskData(assessments);
      } catch (error) {
        console.error("Analytics loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return <p>Loading analytics...</p>;
  }

  const totalTransactions = payments.length;

  const totalAmount = payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  const highRisk = riskData.filter(
    (payment) => payment.risk_level === "HIGH"
  ).length;

  const mediumRisk = riskData.filter(
    (payment) => payment.risk_level === "MEDIUM"
  ).length;

  const lowRisk = riskData.filter(
    (payment) => payment.risk_level === "LOW"
  ).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Analytics</h2>
          <p>Payment and fraud risk insights</p>
        </div>
      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Transactions</h3>
          <div className="stat-value">
            {totalTransactions}
          </div>
          <p>All recorded payments</p>
        </div>

        <div className="stat-card">
          <h3>Total Payment Volume</h3>
          <div className="stat-value">
            ₹{totalAmount.toLocaleString()}
          </div>
          <p>Transaction value</p>
        </div>

        <div className="stat-card">
          <h3>High Risk</h3>
          <div className="stat-value">
            {highRisk}
          </div>
          <p>Transactions requiring attention</p>
        </div>

        <div className="stat-card">
          <h3>Medium Risk</h3>
          <div className="stat-value">
            {mediumRisk}
          </div>
          <p>Transactions under review</p>
        </div>

      </div>

      <div className="panel">
        <h2>Risk Distribution</h2>

        <div className="risk-distribution">

          <div className="risk-box">
            <span>HIGH</span>
            <strong>{highRisk}</strong>
          </div>

          <div className="risk-box">
            <span>MEDIUM</span>
            <strong>{mediumRisk}</strong>
          </div>

          <div className="risk-box">
            <span>LOW</span>
            <strong>{lowRisk}</strong>
          </div>

        </div>
      </div>

      <div className="panel">
        <h2>Risk Overview</h2>

        {riskData.length === 0 ? (
          <p>No risk assessments available.</p>
        ) : (
          <div className="table-container">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                </tr>
              </thead>

              <tbody>
                {riskData.map((payment) => (
                  <tr key={payment.id}>
                    <td>#{payment.id}</td>

                    <td>
                      {payment.currency} {payment.amount}
                    </td>

                    <td>
                      {payment.risk_score}/100
                    </td>

                    <td>
                      <span
                        className={`risk-badge ${payment.risk_level}`}
                      >
                        {payment.risk_level}
                      </span>
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

export default Analytics;