"use client"; 
import React, { useState, useEffect } from "react";

export const dynamic = "force-dynamic";

const AccountSettings = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // États pour les paramètres
  const [selectedTheme, setSelectedTheme] = useState('clair');
  const [selectedFont, setSelectedFont] = useState('Aptos');
  const [selectedBanner, setSelectedBanner] = useState('Pâtisserie');
  const [selectedExport, setSelectedExport] = useState('JSON');
  const [deleteOption, setDeleteOption] = useState<string>('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  // États pour l'édition des informations
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    civility: '',
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  // Simulation de la récupération des données utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        setTimeout(() => {
          const user = {
            civility: 'Monsieur',
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean.dupont@email.com',
            password: '••••••••'
          };
          setUserData(user);
          setEditedData(user);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Effet pour appliquer le thème
  useEffect(() => {
    if (selectedTheme === 'sombre') {
      document.documentElement.classList.add('dark-theme');
      document.body.style.backgroundColor = '#1a1a1a';
      document.body.style.color = '#ffffff';
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.body.style.backgroundColor = '#f5f8fc';
      document.body.style.color = '#333';
    }
  }, [selectedTheme]);

  // Effet pour appliquer la police
  useEffect(() => {
    document.body.style.fontFamily = selectedFont;
  }, [selectedFont]);

  const handleExportData = () => {
    console.log(`Export des données en ${selectedExport}`);
    alert(`Export des données en ${selectedExport} initié`);
  };

  const handleSaveProfile = async () => {
    try {
      console.log('Sauvegarde des données:', editedData);
      setUserData({ ...editedData });
      setIsEditing(false);
      alert('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la mise à jour du profil');
    }
  };

  const handleCancelEdit = () => {
    setEditedData(userData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="Page accueil">
        <main className="main-content" style={{ marginTop: "130px" }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des données...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="Page accueil">
      <div className="account-page-container">
        {/* Colonne Paramètres à gauche */}
        <div className="settings-column">
          <div className="settings-panel">
            <h2 className="settings-title">Paramètres</h2>
            
            {/* Personnalisation */}
            <div className="personalization-section">
              <h3 className="section-subtitle">Personnalisation</h3>
              
              {/* Thème du site */}
              <div className="setting-group">
                <h4 className="setting-label">Thème du site</h4>
                <div className="radio-options">
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="theme" 
                      value="clair" 
                      checked={selectedTheme === 'clair'}
                      onChange={(e) => setSelectedTheme(e.target.value)}
                    />
                    <span className="radio-custom"></span>
                    Clair
                  </label>
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="theme" 
                      value="sombre" 
                      checked={selectedTheme === 'sombre'}
                      onChange={(e) => setSelectedTheme(e.target.value)}
                    />
                    <span className="radio-custom"></span>
                    Sombre
                  </label>
                </div>
              </div>

              {/* Police préférée */}
              <div className="setting-group">
                <h4 className="setting-label">Police préférée</h4>
                <div className="radio-options">
                  {['Aptos', 'Century', 'Impact'].map((font) => (
                    <label key={font} className="radio-option">
                      <input 
                        type="radio" 
                        name="font" 
                        value={font} 
                        checked={selectedFont === font}
                        onChange={(e) => setSelectedFont(e.target.value)}
                      />
                      <span className="radio-custom"></span>
                      <span style={{ fontFamily: font }}>{font}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modifier la bannière */}
              <div className="setting-group">
                <h4 className="setting-label">Modifier la bannière</h4>
                <div className="radio-options">
                  {['Pâtisserie', 'Plat','International'].map((banner) => (
                    <label key={banner} className="radio-option">
                      <input 
                        type="radio" 
                        name="banner" 
                        value={banner} 
                        checked={selectedBanner === banner}
                        onChange={(e) => setSelectedBanner(e.target.value)}
                      />
                      <span className="radio-custom"></span>
                      {banner}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Données et confidentialité */}
            <div className="data-section">
              <h3 className="section-subtitle">Données et confidentialité</h3>
              
              <div className="setting-group">
                <h4 className="setting-label">Télécharger mes données</h4>
                <div className="radio-options">
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="export" 
                      value="JSON" 
                      checked={selectedExport === 'JSON'}
                      onChange={(e) => setSelectedExport(e.target.value)}
                    />
                    <span className="radio-custom"></span>
                    Exporter en JSON
                  </label>
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="export" 
                      value="CSV" 
                      checked={selectedExport === 'CSV'}
                      onChange={(e) => setSelectedExport(e.target.value)}
                    />
                    <span className="radio-custom"></span>
                    Exporter en CSV
                  </label>
                </div>
                <button 
                  className="export-btn"
                  onClick={handleExportData}
                >
                  Télécharger mes données
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content central - Informations du compte */}
        <main className="account-main-content">
          <div className="account-header">
            <h1>Les informations du compte</h1>
            {!isEditing ? (
              <button 
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Modifier
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="save-btn"
                  onClick={handleSaveProfile}
                >
                  💾 Sauvegarder
                </button>
                <button 
                  className="cancel-btn"
                  onClick={handleCancelEdit}
                >
                  ❌ Annuler
                </button>
              </div>
            )}
          </div>

          {userData && (
            <div className="account-info-content">
              {/* Civilité */}
              <div className="info-group">
                <h3 className="info-label">Votre civilité</h3>
                {isEditing ? (
                  <div className="civility-options">
                    {['Monsieur', 'Madame', 'Ne pas renseigner'].map((civility) => (
                      <label key={civility} className="civility-option">
                        <input 
                          type="radio" 
                          name="civility" 
                          value={civility} 
                          checked={editedData.civility === civility}
                          onChange={(e) => handleInputChange('civility', e.target.value)}
                        />
                        <span className="radio-custom"></span>
                        {civility}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="info-value">{userData.civility}</div>
                )}
              </div>

              {/* Prénom */}
              <div className="info-group">
                <h3 className="info-label">Votre prénom</h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <div className="info-value">{userData.firstName}</div>
                )}
              </div>

              {/* Nom */}
              <div className="info-group">
                <h3 className="info-label">Votre nom</h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <div className="info-value">{userData.lastName}</div>
                )}
              </div>

              {/* Email */}
              <div className="info-group">
                <h3 className="info-label">Votre mail</h3>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <div className="info-value">{userData.email}</div>
                )}
              </div>

              {/* Mot de passe */}
              <div className="info-group">
                <h3 className="info-label">Votre mot de passe</h3>
                {isEditing ? (
                  <input
                    type="password"
                    value={editedData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="edit-input"
                    placeholder="Nouveau mot de passe"
                  />
                ) : (
                  <div className="info-value">{userData.password}</div>
                )}
              </div>
            </div>
          )}

          {/* Ligne de séparation */}
          <div className="section-divider"></div>

          {/* Section Commentaires */}
          <section className="content-section">
            <h2 className="section-title">Vos commentaires</h2>
            <div className="no-comments">
              <p>Aucun commentaire trouvé</p>
            </div>
          </section>

          {/* Section Recettes publiées */}
          <section className="content-section">
            <div className="section-header">
              <h2 className="section-title">Vos recettes publiées</h2>
              <button className="add-recipe-btn">
                Ajouter une recette
              </button>
            </div>

            <div className="recipes-grid">
              {[1, 2, 3].map((item) => (
                <div key={item} className="recipe-item">
                  <div className="recipe-description">
                    <h3>Description du plat</h3>
                  </div>
                  <div className="recipe-actions">
                    <button className="action-btn delete-btn">Supprimer</button>
                    <button className="action-btn modify-btn">Modifier</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section Recettes enregistrées */}
          <section className="content-section">
            <h2 className="section-title">Vos recettes enregistrées</h2>
            <div className="recipes-grid">
              {[1, 2, 3].map((item) => (
                <div key={item} className="recipe-item">
                  <div className="recipe-description">
                    <h3>Description du plat</h3>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section Supprimer le compte */}
          <section className="content-section">
            <h2 className="section-title">Supprimer mon compte</h2>
            
            <div className="delete-confirmation">
              <h3 className="delete-subtitle">Supprimer ?</h3>
              <div className="delete-options">
                <label className="delete-option">
                  <input 
                    type="radio" 
                    name="delete" 
                    value="oui" 
                    onChange={(e) => setDeleteOption(e.target.value)}
                  />
                  <span className="radio-custom"></span>
                  Oui
                </label>
                <label className="delete-option">
                  <input 
                    type="radio" 
                    name="delete" 
                    value="non" 
                    onChange={(e) => setDeleteOption(e.target.value)}
                  />
                  <span className="radio-custom"></span>
                  Non
                </label>
              </div>

              <h3 className="delete-subtitle">Êtes-vous sûr ?</h3>
              <p className="confirmation-instruction">
                Réécrire la phrase suivante :<br />
                <em>Je veux supprimer mon compte</em>
              </p>
              
              <div className="confirmation-input">
                <input 
                  type="text" 
                  placeholder="Écrire ici" 
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="confirmation-field"
                />
              </div>

              <button 
                className="delete-account-btn"
                disabled={deleteConfirmation !== 'Je veux supprimer mon compte' || deleteOption !== 'oui'}
              >
                Supprimer mon compte
              </button>
            </div>
          </section>
        </main>
      </div>


    </div>
  );
};

export default AccountSettings;