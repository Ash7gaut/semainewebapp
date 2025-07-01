import React, { useState, useEffect } from "react";
import { Event } from "../types";
import { loadEvents, addEvent, deleteEvent } from "../utils/storage";
import { calculateDaysRemaining, formatDate } from "../utils/calculations";
import "./EventsScreen.css";

const EventsScreen = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [newEventDate, setNewEventDate] = useState("");

  useEffect(() => {
    loadEventsData();
  }, []);

  const loadEventsData = () => {
    const loadedEvents = loadEvents();
    setEvents(loadedEvents);
  };

  const isValidDate = (dateString: string): boolean => {
    // Format: DD/MM/YYYY
    const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateString.match(regex);

    if (!match) return false;

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    const date = new Date(year, month - 1, day);
    return (
      date.getDate() === day &&
      date.getMonth() === month - 1 &&
      date.getFullYear() === year &&
      date > new Date()
    );
  };

  const parseDate = (dateString: string): Date => {
    const [day, month, year] = dateString.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  const handleAddEvent = () => {
    if (newEventName.trim() === "") {
      alert("Veuillez entrer un nom pour l'événement");
      return;
    }

    if (!isValidDate(newEventDate)) {
      alert(
        "Veuillez entrer une date valide au format JJ/MM/AAAA dans le futur"
      );
      return;
    }

    const eventDate = parseDate(newEventDate);

    const newEvent: Event = {
      id: Date.now().toString(),
      name: newEventName.trim(),
      date: eventDate.toISOString(),
      createdAt: new Date().toISOString(),
    };

    addEvent(newEvent);
    setEvents([...events, newEvent]);
    setModalVisible(false);
    setNewEventName("");
    setNewEventDate("");
  };

  const handleDeleteEvent = (eventId: string, eventName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${eventName}" ?`)) {
      deleteEvent(eventId);
      setEvents(events.filter((event) => event.id !== eventId));
    }
  };

  const renderEventItem = (item: Event) => {
    const daysRemaining = calculateDaysRemaining(item.date);
    const isExpired = daysRemaining <= 0;

    return (
      <div key={item.id} className={`event-item ${isExpired ? "expired" : ""}`}>
        <div className="event-content">
          <h3 className="event-name">{item.name}</h3>
          <p className="event-date">{formatDate(item.date)}</p>
          <p className={`days-remaining ${isExpired ? "expired-text" : ""}`}>
            {isExpired
              ? "Événement passé"
              : `${daysRemaining} jour(s) restant(s)`}
          </p>
        </div>
        <button
          className="delete-button"
          onClick={() => handleDeleteEvent(item.id, item.name)}
        >
          ✕
        </button>
      </div>
    );
  };

  return (
    <div className="events-screen">
      <div className="header">
        <h1 className="title">Mes Événements</h1>
        <button className="add-button" onClick={() => setModalVisible(true)}>
          + Ajouter
        </button>
      </div>

      <div className="events-list">
        {events.length === 0 ? (
          <div className="empty-state">
            <p className="empty-text">
              Aucun événement ajouté.
              <br />
              Commencez par ajouter un événement futur !
            </p>
          </div>
        ) : (
          events.map(renderEventItem)
        )}
      </div>

      {modalVisible && (
        <div className="modal-overlay" onClick={() => setModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Nouvel Événement</h2>

            <div className="form-group">
              <label className="label">Nom de l'événement</label>
              <input
                type="text"
                className="input"
                placeholder="ex: Vacances à Rome"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label">Date (JJ/MM/AAAA)</label>
              <input
                type="text"
                className="input"
                placeholder="ex: 15/08/2024"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
              />
              <p className="helper-text">
                Entrez une date future au format jour/mois/année
              </p>
            </div>

            <div className="modal-buttons">
              <button
                className="modal-button cancel-button"
                onClick={() => {
                  setModalVisible(false);
                  setNewEventName("");
                  setNewEventDate("");
                }}
              >
                Annuler
              </button>
              <button
                className="modal-button save-button"
                onClick={handleAddEvent}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsScreen;
