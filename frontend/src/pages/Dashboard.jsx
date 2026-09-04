import { useEffect, useState } from "react";
import { getPayments, getAlerts, assessRisk } from "../api";

function Dashboard() {
  const [payments, setPayments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      setLoading(true);

      const paymentData = await getPayments();
      setPayments(paymentData);

      const riskData = await Promise.all(
        paymentData.map(async (payment) => {
          try {
            return await assessRisk(payment.id);
          } catch {
            return null;
          }
        })
      );

      setRisks(riskData.filter(Boolean));

      try {
        const alertData = await getAlerts();
        setAlerts(alertData);
      } catch {
        setAlerts([]);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const successful = payments.filter(
    (payment) => payment.status === "success"
  ).length;

  const failed = payments.filter(
    (payment) => payment.status === "failed"
  ).length;

  const highRisk = risks.filter(
    (risk) => risk.risk_level === "HIGH"
  ).length;

  const openAlerts = alerts.filter(
    (alert) => alert.status === "open"
  ).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Real-time payment and fraud monitoring</p>
        </div>

        <button
          className="refresh-button"
          onClick={loadDashboard}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      <div className="cards">

        <div className="card">
          <h3>Total Payments</h3>
          <p>{loading ? "..." : payments.length}</p>
        </div>

        <div className="card">
          <h3>Successful Payments</h3>
          <p>{loading ? "..." : successful}</p>
        </div>

        <div className="card">
          <h3>Failed Payments</h3>
          <p>{loading ? "..." : failed}</p>
        </div>

        <div className="card">
          <h3>High Risk</h3>
          <p>{loading ? "..." : highRisk}</p>
        </div>

      </div>

      <div className="cards">

        <div className="card">
          <h3>Open Fraud Alerts</h3>
          <p>{loading ? "..." : openAlerts}</p>
        </div>

        <div className="card">
          <h3>Risk Assessments</h3>
          <p>{loading ? "..." : risks.length}</p>
        </div>

      </div>

      <section className="panel">
        <h2>Fraud Monitoring</h2>

        <p>
          PayShield continuously analyzes transactions using
          transaction amount, payment velocity, failed payments
          and duplicate payment activity.
        </p>
      </section>

      <section className="panel">
        <h2>Recent Payments</h2>

        {payments.length === 0 ? (
          <p>No payments found.</p>
        ) : (
          <div className="table-container">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Risk</th>
                </tr>
              </thead>

              <tbody>
                {payments.slice(0, 5).map((payment) => {
                  const risk = risks.find(
                    (item) =>
                      item.payment_id === payment.id
                  );

                  return (
                    <tr key={payment.id}>
                      <td>#{payment.id}</td>

                      <td>
                        ₹{payment.amount}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${payment.status}`}
                        >
                          {payment.status}
                        </span>
                      </td>

                      <td>
                        {risk ? (
                          <span
                            className={`risk-badge ${risk.risk_level}`}
                          >
                            {risk.risk_level}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;