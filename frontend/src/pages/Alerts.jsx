import { useEffect, useState } from "react";
import {
  getAlerts,
  resolveAlert,
  reopenAlert,
} from "../api";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadAlerts() {
    try {
      setLoading(true);

      const data = await getAlerts();

      setAlerts(data);
    } catch (error) {
      console.error("Alert loading error:", error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, []);


  // =========================
  // RESOLVE ALERT
  // =========================

  async function handleResolve(alertId) {
    try {
      await resolveAlert(alertId);

      await loadAlerts();
    } catch (error) {
      console.error(
        "Resolve alert error:",
        error
      );
    }
  }


  // =========================
  // REOPEN ALERT
  // =========================

  async function handleReopen(alertId) {
    try {
      await reopenAlert(alertId);

      await loadAlerts();
    } catch (error) {
      console.error(
        "Reopen alert error:",
        error
      );
    }
  }


  const openAlerts = alerts.filter(
    (alert) => alert.status === "open"
  ).length;

  const resolvedAlerts = alerts.filter(
    (alert) => alert.status === "resolved"
  ).length;


  return (
    <div>

      {/* PAGE HEADER */}

      <div className="page-header">

        <div>
          <h2>Fraud Alerts</h2>

          <p>
            Monitor and manage suspicious
            transactions
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadAlerts}
          disabled={loading}
        >
          {loading
            ? "Refreshing..."
            : "↻ Refresh"}
        </button>

      </div>


      {/* ALERT SUMMARY */}

      <div className="cards">

        <div className="card">
          <h3>Total Alerts</h3>

          <p>
            {loading
              ? "..."
              : alerts.length}
          </p>
        </div>


        <div className="card">
          <h3>Open Alerts</h3>

          <p>
            {loading
              ? "..."
              : openAlerts}
          </p>
        </div>


        <div className="card">
          <h3>Resolved Alerts</h3>

          <p>
            {loading
              ? "..."
              : resolvedAlerts}
          </p>
        </div>

      </div>


      {/* ALERT MANAGEMENT */}

      <section className="panel">

        <h2>Alert Management</h2>


        {loading ? (
          <p>Loading alerts...</p>
        ) : alerts.length === 0 ? (
          <p>No fraud alerts found.</p>
        ) : (

          <div className="risk-list">

            {alerts.map((alert) => (

              <div
                className="risk-item"
                key={alert.id}
              >

                {/* ALERT INFORMATION */}

                <div>

                  <strong>
                    Alert #{alert.id}
                  </strong>

                  <p>
                    Payment ID: #{alert.payment_id}
                  </p>

                  <p>
                    {alert.message}
                  </p>

                  <p>
                    Status: {alert.status}
                  </p>

                </div>


                {/* ALERT ACTIONS */}

                <div>

                  {/* SEVERITY */}

                  <span
                    className={`risk-badge ${
                      alert.severity === "high"
                        ? "HIGH"
                        : alert.severity === "medium"
                        ? "MEDIUM"
                        : "LOW"
                    }`}
                  >
                    {alert.severity?.toUpperCase()}
                  </span>


                  {/* ACTION BUTTON */}

                  {alert.status === "open" ? (

                    <button
                      className="resolve-button"
                      onClick={() =>
                        handleResolve(alert.id)
                      }
                    >
                      Resolve
                    </button>

                  ) : (

                    <button
                      className="resolve-button"
                      onClick={() =>
                        handleReopen(alert.id)
                      }
                    >
                      Reopen
                    </button>

                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default Alerts;