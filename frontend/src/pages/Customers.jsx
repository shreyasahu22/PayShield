import { useEffect, useState } from "react";
import { getCustomers, getCustomerRisk } from "../api";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [risks, setRisks] = useState({});

  async function loadCustomers() {
    try {
      setLoading(true);

      const data = await getCustomers();
      setCustomers(data);

      const riskResults = {};

      await Promise.all(
        data.map(async (customer) => {
          try {
            const risk = await getCustomerRisk(customer.id);
            riskResults[customer.id] = risk;
          } catch (error) {
            console.error(
              `Customer risk failed for ${customer.id}`,
              error
            );
          }
        })
      );

      setRisks(riskResults);

    } catch (error) {
      console.error("Customer loading error:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <div>

      <div className="page-header">
        <div>
          <h2>Customers</h2>
          <p>Customer transaction and risk overview</p>
        </div>

        <button
          className="refresh-button"
          onClick={loadCustomers}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      <section className="panel">

        <h2>Customer Risk Overview</h2>

        {loading ? (
          <p>Analyzing customers...</p>
        ) : customers.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          <div className="table-container">

            <table className="payments-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                </tr>
              </thead>

              <tbody>

                {customers.map((customer) => {

                  const risk = risks[customer.id];

                  return (
                    <tr key={customer.id}>

                      <td>#{customer.id}</td>

                      <td>
                        {customer.name || "-"}
                      </td>

                      <td>
                        {customer.email || "-"}
                      </td>

                      <td>
                        {customer.phone || "-"}
                      </td>

                      <td>
                        {risk
                          ? risk.risk_score
                          : "-"}
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

export default Customers;