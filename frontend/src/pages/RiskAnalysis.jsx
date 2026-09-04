import { useEffect, useState } from "react";
import { getPayments, assessRisk } from "../api";

function RiskAnalysis() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadRisks() {
    try {
      setLoading(true);

      const payments = await getPayments();

      const riskData = await Promise.all(
        payments.map(async (payment) => {
          try {
            const risk = await assessRisk(payment.id);

            return {
              ...risk,
              amount: payment.amount,
              status: payment.status,
              payment_method: payment.payment_method,
            };
          } catch (error) {
            console.error(
              `Risk assessment failed for payment ${payment.id}`,
              error
            );

            return null;
          }
        })
      );

      setRisks(riskData.filter(Boolean));
    } catch (error) {
      console.error("Risk loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRisks();
  }, []);

  const highRisk = risks.filter(
    (risk) => risk.risk_level === "HIGH"
  ).length;

  const mediumRisk = risks.filter(
    (risk) => risk.risk_level === "MEDIUM"
  ).length;

  const lowRisk = risks.filter(
    (risk) => risk.risk_level === "LOW"
  ).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Risk Analysis</h2>
          <p>Transaction-level fraud risk assessment</p>
        </div>

        <button
          className="refresh-button"
          onClick={loadRisks}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* RISK SUMMARY */}

      <div className="cards">

        <div className="card">
          <h3>High Risk</h3>
          <p>{loading ? "..." : highRisk}</p>
        </div>

        <div className="card">
          <h3>Medium Risk</h3>
          <p>{loading ? "..." : mediumRisk}</p>
        </div>

        <div className="card">
          <h3>Low Risk</h3>
          <p>{loading ? "..." : lowRisk}</p>
        </div>

        <div className="card">
          <h3>Total Assessed</h3>
          <p>{loading ? "..." : risks.length}</p>
        </div>

      </div>

      {/* RISK TABLE */}

      <section className="panel">
        <h2>Transaction Risk Analysis</h2>

        {loading ? (
          <p>Analyzing transactions...</p>
        ) : risks.length === 0 ? (
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
                  <th>Reason</th>
                </tr>
              </thead>

              <tbody>
                {risks.map((risk) => (
                  <tr key={risk.payment_id}>

                    <td>
                      #{risk.payment_id}
                    </td>

                    <td>
                      ₹{risk.amount}
                    </td>

                    <td>
                      <strong>
                        {risk.risk_score}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`risk-badge ${risk.risk_level}`}
                      >
                        {risk.risk_level}
                      </span>
                    </td>

                    <td>
                      {risk.reasons &&
                      risk.reasons.length > 0
                        ? risk.reasons.join(", ")
                        : "No major risk factors"}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}
      </section>

      {/* HOW IT WORKS */}

      <section className="panel">

        <h2>How Risk Scoring Works</h2>

        <p>
          PayShield evaluates transaction amount,
          payment velocity, failed payment history
          and duplicate payment activity.
        </p>

        <div className="risk-list">

          <div className="risk-item">
            <div>
              <strong>HIGH</strong>
              <p>
                Score of 70 or above — transaction
                requires immediate attention.
              </p>
            </div>

            <span className="risk-badge HIGH">
              HIGH
            </span>
          </div>

          <div className="risk-item">
            <div>
              <strong>MEDIUM</strong>
              <p>
                Score between 30 and 69 — transaction
                should be monitored.
              </p>
            </div>

            <span className="risk-badge MEDIUM">
              MEDIUM
            </span>
          </div>

          <div className="risk-item">
            <div>
              <strong>LOW</strong>
              <p>
                Score below 30 — transaction has
                relatively low risk.
              </p>
            </div>

            <span className="risk-badge LOW">
              LOW
            </span>
          </div>

        </div>

      </section>
    </div>
  );
}

export default RiskAnalysis;