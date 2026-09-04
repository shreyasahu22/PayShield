import "./App.css";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Payments from "./pages/Payments";
import RiskAnalysis from "./pages/RiskAnalysis";
import Alerts from "./pages/Alerts";
import Customers from "./pages/Customers";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">

        {/* SIDEBAR */}

        <aside className="sidebar">

          <div className="logo-section">
            <div className="logo-icon">🛡️</div>

            <div>
              <h1>PayShield</h1>
              <p>Risk Intelligence</p>
            </div>
          </div>

          <nav className="navigation">

            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span>📊</span>
              Dashboard
            </NavLink>

            <NavLink
              to="/payments"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span>💳</span>
              Payments
            </NavLink>

            <NavLink
              to="/risk"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span>🔍</span>
              Risk Analysis
            </NavLink>

            <NavLink
              to="/alerts"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span>🚨</span>
              Fraud Alerts
            </NavLink>

            <NavLink
              to="/customers"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span>👥</span>
              Customers
            </NavLink>

          </nav>

          <div className="sidebar-bottom">

            <div className="system-status">
              <span className="online-dot"></span>
              System Online
            </div>

            <p>PayShield v1.0</p>

          </div>

        </aside>

        {/* MAIN CONTENT */}

        <main className="main-content">

          <header className="topbar">

            <div>
              <h2>Payment Intelligence Platform</h2>

              <p>
                Monitor transactions and detect fraud in real time.
              </p>
            </div>

            <div className="topbar-status">
              ● Live Monitoring
            </div>

          </header>

          <div className="page-content">

            <Routes>

              {/* DASHBOARD */}

              <Route
                path="/"
                element={<Dashboard />}
              />

              {/* PAYMENTS */}

              <Route
                path="/payments"
                element={<Payments />}
              />

              {/* RISK ANALYSIS */}

              <Route
                path="/risk"
                element={<RiskAnalysis />}
              />

              {/* FRAUD ALERTS */}

              <Route
                path="/alerts"
                element={<Alerts />}
              />

              {/* CUSTOMERS */}

              <Route
                path="/customers"
                element={<Customers />}
              />

            </Routes>

          </div>

        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;