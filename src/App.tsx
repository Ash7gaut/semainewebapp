import React, { useState } from "react";
import EventsScreen from "./screens/EventsScreen";
import ExpensesScreen from "./screens/ExpensesScreen";
import "./App.css";

type TabType = "events" | "expenses";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("events");

  return (
    <div className="App">
      <header className="app-header">
        <h1 className="app-title">💰 Simulateur d'Économies</h1>
        <p className="app-subtitle">
          Calculez vos économies potentielles jusqu'à un événement futur
        </p>
      </header>

      <nav className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "events" ? "active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          <span className="tab-icon">📅</span>
          <span className="tab-label">Événements</span>
        </button>
        <button
          className={`tab-button ${activeTab === "expenses" ? "active" : ""}`}
          onClick={() => setActiveTab("expenses")}
        >
          <span className="tab-icon">💸</span>
          <span className="tab-label">Dépenses</span>
        </button>
      </nav>

      <main className="tab-content">
        {activeTab === "events" && <EventsScreen />}
        {activeTab === "expenses" && <ExpensesScreen />}
      </main>

      <footer className="app-footer">
        <p>Stockage local - Aucune donnée n'est envoyée sur Internet</p>
      </footer>
    </div>
  );
}

export default App;
