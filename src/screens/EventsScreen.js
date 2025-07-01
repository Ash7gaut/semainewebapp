import React, { useState, useEffect } from 'react';
import { loadEvents, saveEvents } from '../utils/storage';
import './EventsScreen.css';

const EventsScreen = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    date: ''
  });
  const [validation, setValidation] = useState({
    name: null,
    date: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const steps = [
    { icon: '📝', title: 'Nom de l\'événement' },
    { icon: '📅', title: 'Date cible' },
    { icon: '✅', title: 'Confirmation' }
  ];

  const eventSuggestions = [
    'Voyage en Espagne',
    'Nouvel iPhone',
    'Voiture',
    'Mariage',
    'Ordinateur portable',
    'Vacances d\'été'
  ];

  useEffect(() => {
    loadStoredEvents();
  }, []);

  const loadStoredEvents = async () => {
    try {
      const storedEvents = await loadEvents();
      setEvents(storedEvents);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    }
  };

  const validateField = (field, value) => {
    switch (field) {
      case 'name':
        if (!value || value.trim().length < 2) {
          return { valid: false, message: 'Le nom doit contenir au moins 2 caractères' };
        }
        return { valid: true, message: 'Parfait ! 👍' };
      
      case 'date':
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (!value) {
          return { valid: false, message: 'Veuillez sélectionner une date' };
        }
        if (selectedDate <= today) {
          return { valid: false, message: 'La date doit être dans le futur' };
        }
        return { valid: true, message: 'Date valide ! 📅' };
      
      default:
        return { valid: true, message: '' };
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validation en temps réel
    const validationResult = validateField(field, value);
    setValidation(prev => ({ ...prev, [field]: validationResult }));
  };

  const handleSuggestionClick = (suggestion) => {
    handleInputChange('name', suggestion);
  };

  const nextStep = () => {
    const currentField = currentStep === 0 ? 'name' : 'date';
    const validationResult = validateField(currentField, formData[currentField]);
    
    if (validationResult.valid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      setValidation(prev => ({ ...prev, [currentField]: validationResult }));
    }
  };

  const previousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    // Validation finale
    const nameValidation = validateField('name', formData.name);
    const dateValidation = validateField('date', formData.date);
    
    if (!nameValidation.valid || !dateValidation.valid) {
      setValidation({
        name: nameValidation,
        date: dateValidation
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulation d'une requête
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newEvent = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        date: formData.date,
        createdAt: new Date().toISOString()
      };

      const updatedEvents = [...events, newEvent];
      await saveEvents(updatedEvents);
      setEvents(updatedEvents);

      // Animation de succès
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        resetModal();
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'événement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setCurrentStep(0);
    setFormData({ name: '', date: '' });
    setValidation({ name: null, date: null });
    setIsLoading(false);
    setShowSuccess(false);
  };

  const deleteEvent = async (eventId) => {
    try {
      const updatedEvents = events.filter(event => event.id !== eventId);
      await saveEvents(updatedEvents);
      setEvents(updatedEvents);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    
    const timeDiff = eventDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff;
  };

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className={`form-step ${currentStep === 0 ? 'active' : ''}`}>
            <label className="label">
              <span className="label-icon">📝</span>
              Quel est le nom de votre événement ?
            </label>
            <div className="input-container">
              <input
                type="text"
                className={`input ${validation.name && !validation.name.valid ? 'error' : ''}`}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Voyage en Espagne"
                autoFocus
              />
              {validation.name && (
                <span className={`validation-icon ${validation.name.valid ? 'success' : 'error'}`}>
                  {validation.name.valid ? '✅' : '❌'}
                </span>
              )}
            </div>
            <div className={`helper-text ${validation.name ? 'show' : ''}`}>
              <span className="helper-icon">💡</span>
              {validation.name ? validation.name.message : 'Donnez un nom descriptif à votre événement'}
            </div>
            
            {formData.name.length < 2 && (
              <div className="suggestions-container">
                <div className="suggestions-title">
                  <span>💭</span>
                  Suggestions populaires
                </div>
                {eventSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className={`form-step ${currentStep === 1 ? 'active' : ''}`}>
            <label className="label">
              <span className="label-icon">📅</span>
              Quand voulez-vous atteindre cet objectif ?
            </label>
            <div className="input-container">
              <input
                type="date"
                className={`input ${validation.date && !validation.date.valid ? 'error' : ''}`}
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={getTodayString()}
              />
              {validation.date && (
                <span className={`validation-icon ${validation.date.valid ? 'success' : 'error'}`}>
                  {validation.date.valid ? '✅' : '❌'}
                </span>
              )}
            </div>
            <div className={`helper-text ${validation.date ? 'show' : ''}`}>
              <span className="helper-icon">⏰</span>
              {validation.date ? validation.date.message : 'Choisissez une date future pour planifier vos économies'}
            </div>
          </div>
        );

      case 2:
        const daysRemaining = formData.date ? getDaysRemaining(formData.date) : 0;
        return (
          <div className={`form-step ${currentStep === 2 ? 'active' : ''}`}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
              <h3 style={{ color: '#667eea', marginBottom: '12px' }}>
                {formData.name}
              </h3>
              <p style={{ color: '#64748b', marginBottom: '8px' }}>
                Prévu pour le {formatDate(formData.date)}
              </p>
              <p style={{ color: '#10b981', fontWeight: '600', fontSize: '18px' }}>
                Dans {daysRemaining} jours
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="events-screen">
      <div className="header">
        <h1 className="title">Mes Événements</h1>
        <button className="add-button" onClick={() => setShowModal(true)}>
          + Ajouter
        </button>
      </div>

      <div className="events-list">
        {events.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📅</div>
            <p className="empty-text">
              Aucun événement planifié.
              <br />
              Ajoutez votre premier objectif !
            </p>
          </div>
        ) : (
          events.map(event => {
            const daysRemaining = getDaysRemaining(event.date);
            const isExpired = daysRemaining < 0;

            return (
              <div key={event.id} className={`event-item ${isExpired ? 'expired' : ''}`}>
                <div className="event-content">
                  <h3 className="event-name">{event.name}</h3>
                  <p className="event-date">{formatDate(event.date)}</p>
                  <p className={`days-remaining ${isExpired ? 'expired-text' : ''}`}>
                    {isExpired ? 'Événement passé' : `Dans ${daysRemaining} jours`}
                  </p>
                </div>
                <button 
                  className="delete-button"
                  onClick={() => deleteEvent(event.id)}
                  aria-label="Supprimer l'événement"
                >
                  ×
                </button>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && resetModal()}>
          <div className="modal-content">
            {showSuccess ? (
              <div className="success-animation">
                <div className="success-icon">✅</div>
                <div className="success-title">Événement ajouté !</div>
                <div className="success-message">
                  Votre objectif "{formData.name}" a été enregistré avec succès.
                </div>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <h2 className="modal-title">Nouvel Événement</h2>
                  <button className="close-button" onClick={resetModal}>
                    ×
                  </button>
                </div>

                <div className="progress-indicator">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`progress-dot ${
                        index < currentStep ? 'completed' : 
                        index === currentStep ? 'active' : ''
                      }`}
                    />
                  ))}
                </div>

                <div className="modal-scroll">
                  {renderStepContent()}
                </div>

                <div className="modal-buttons">
                  {currentStep > 0 && (
                    <button className="cancel-button" onClick={previousStep}>
                      ← Retour
                    </button>
                  )}
                  
                  {currentStep < steps.length - 1 ? (
                    <button className="save-button" onClick={nextStep}>
                      Suivant →
                    </button>
                  ) : (
                    <button 
                      className={`save-button ${isLoading ? 'loading' : ''}`}
                      onClick={handleSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? '' : '✨ Créer l\'événement'}
                    </button>
                  )}
                  
                  {currentStep === 0 && (
                    <button className="cancel-button" onClick={resetModal}>
                      Annuler
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsScreen; 