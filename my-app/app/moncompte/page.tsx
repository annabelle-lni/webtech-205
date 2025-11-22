"use client"; 
import React, { useState, useEffect } from "react";
import { createClient } from "@/supabase/client"; 

export const dynamic = "force-dynamic";

const AccountSettings = () => {
  const supabase = createClient();
  
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
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

  // Récupération des données de supabase
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // On récupère l'utilisateur connecté
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.log("Utilisateur non connecté");
          setIsLoading(false);
          return;
        }

        setUserId(user.id);

        // On récupère les infos du profil: le nom, prenom...
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('nom, prenom, civilite')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Erreur récupération profil:", profileError.message);
        }

        // Affichage des données d'un utilisateur
        const userInfos = {
          civility: profile?.civilite || '', 
          firstName: profile?.prenom || '',
          lastName: profile?.nom || '',
          email: user.email || '', //email depuis users directement
          password: '••••••••' 
        };

        setUserData(userInfos);
        setEditedData(userInfos);
        
      } catch (error) {
        console.error("Erreur générale:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Sauvegarde des données
  const handleSaveProfile = async () => {
    if (!userId) return;

    try {
      // Update du profil d'un utilisateur: Nom, Prénom...
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nom: editedData.lastName,
          prenom: editedData.firstName,
          civilite: editedData.civility
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // 2. Update des accès d'authentification: mail et mdp
      const updates: { email?: string; password?: string } = {};
      
      if (editedData.email !== userData.email) {
        updates.email = editedData.email;
      }
      
      // On ne change le mot de passe que s'il n'est pas vide
      if (editedData.password && editedData.password !== '••••••••') {
        updates.password = editedData.password;
      }

      if (Object.keys(updates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(updates);
        if (authError) throw authError;
      }

      console.log('Sauvegarde réussie');
      
      setUserData({ 
        ...editedData, 
        password: '••••••••' 
      });
      setEditedData(prev => ({ ...prev, password: '••••••••' }));
      setIsEditing(false);
      
      alert('Profil mis à jour avec succès !');

    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert(`Erreur : ${error.message || "Impossible de mettre à jour le profil"}`);
    }
  };

  
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

  // Effet pour appliquer la bannière
  useEffect(() => {
    const header = document.querySelector('header');
    if (header) {
      let bannerImage = '';
      switch(selectedBanner) {
        case 'International':
          bannerImage = "url('/banniere-international.png')";
          break;
        case 'Plat':
          bannerImage = "url('/banniere-plat.png')";
          break;
        case 'Pâtisserie':
        default:
          bannerImage = "url('/banniere-patisserie.png')";
          break;
      }
      header.style.backgroundImage = bannerImage;
    }
  }, [selectedBanner]);


  const handleExportData = () => {
    console.log(`Export des données en ${selectedExport}`);
    alert(`Export des données en ${selectedExport} initié`);
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
      <div className="min-h-screen">
        <main className="flex-1 text-left mx-[10%] my-10 bg-[#FFFCEE] flex flex-col items-center text-center gap-2 pb-[60px] rounded-[20px] mt-32">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f4a887] mx-auto"></div>
            <p className="mt-4 text-[#555]">Chargement de votre profil...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className=" my-[30px]">
      <div className="flex gap-8 max-w-[1200px] mx-auto my-8 px-8 min-h-[calc(100vh-180px)] items-start">
        
        {/* Colonne Paramètres à gauche */}
        <div className=" mx-[10px] flex-shrink-0">
          <div className="bg-[#FFFCEE] p-6 rounded-[15px] shadow-[0_2px_10px_rgba(0,0,0,0.1)] sticky top-[150px] z-10">
            <h2 className="text-2xl font-bold text-[#333] mb-5">Paramètres</h2>
            
            {/* Personnalisation */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#333] mb-4">Personnalisation</h3>
              
              {/* Thème du site */}
              <div className="mb-5">
                <h4 className="text-base font-bold text-[#555] mb-2">Thème du site</h4>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer py-1">
                    <input 
                      type="radio" 
                      name="theme" 
                      value="clair" 
                      checked={selectedTheme === 'clair'}
                      onChange={(e) => setSelectedTheme(e.target.value)}
                      className="hidden"
                    />
                    <span className="w-[18px] h-[18px] border-2 border-[#ccc] rounded-full relative flex-shrink-0">
                      {selectedTheme === 'clair' && (
                        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] bg-[#f4a887] rounded-full"></span>
                      )}
                    </span>
                    Clair
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer py-1">
                    <input 
                      type="radio" 
                      name="theme" 
                      value="sombre" 
                      checked={selectedTheme === 'sombre'}
                      onChange={(e) => setSelectedTheme(e.target.value)}
                      className="hidden"
                    />
                    <span className="w-[18px] h-[18px] border-2 border-[#ccc] rounded-full relative flex-shrink-0">
                      {selectedTheme === 'sombre' && (
                        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] bg-[#f4a887] rounded-full"></span>
                      )}
                    </span>
                    Sombre
                  </label>
                </div>
              </div>

              {/* Police préférée */}
              <div className="mb-5">
                <h4 className="text-base font-bold text-[#555] mb-2">Police préférée</h4>
                <div className="flex flex-col gap-2">
                  {['Aptos', 'Century', 'Impact'].map((font) => (
                    <label key={font} className="flex items-center gap-2 cursor-pointer py-1">
                      <input 
                        type="radio" 
                        name="font" 
                        value={font} 
                        checked={selectedFont === font}
                        onChange={(e) => setSelectedFont(e.target.value)}
                        className="hidden"
                      />
                      <span className="w-[18px] h-[18px] border-2 border-[#ccc] rounded-full relative flex-shrink-0">
                        {selectedFont === font && (
                          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] bg-[#f4a887] rounded-full"></span>
                        )}
                      </span>
                      <span style={{ fontFamily: font }}>{font}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modifier la bannière */}
              <div className="mb-5">
                <h4 className="text-base font-bold text-[#555] mb-2">Modifier la bannière</h4>
                <div className="flex flex-col gap-2">
                  {['Pâtisserie', 'Plat', 'International'].map((banner) => (
                  <label key={banner} className="flex items-center gap-2 cursor-pointer py-1">
                    <input 
                      type="radio" 
                      name="banner" 
                      value={banner} 
                      checked={selectedBanner === banner}
                      onChange={(e) => setSelectedBanner(e.target.value)}
                      className="hidden"
                    />
                    <span className="w-[18px] h-[18px] border-2 border-[#ccc] rounded-full relative flex-shrink-0">
                      {selectedBanner === banner && (
                      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] bg-[#f4a887] rounded-full"></span>
                    )}
                   </span>
                  {banner}
                  </label>
                  ))}
                  </div>
                </div>
            </div>

            {/* Données et confidentialité */}
            <div>
              <h3 className="text-lg font-bold text-[#333] mb-4">Données et confidentialité</h3>
              
              <div className="mb-5">
                <h4 className="text-base font-bold text-[#555] mb-2">Télécharger mes données</h4>
                <div className="flex flex-col gap-2 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer py-1">
                    <input 
                      type="radio" 
                      name="export" 
                      value="JSON" 
                      checked={selectedExport === 'JSON'}
                      onChange={(e) => setSelectedExport(e.target.value)}
                      className="hidden"
                    />
                    <span className="w-[18px] h-[18px] border-2 border-[#ccc] rounded-full relative flex-shrink-0">
                      {selectedExport === 'JSON' && (
                        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] bg-[#f4a887] rounded-full"></span>
                      )}
                    </span>
                    Exporter en JSON
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer py-1">
                    <input 
                      type="radio" 
                      name="export" 
                      value="CSV" 
                      checked={selectedExport === 'CSV'}
                      onChange={(e) => setSelectedExport(e.target.value)}
                      className="hidden"
                    />
                    <span className="w-[18px] h-[18px] border-2 border-[#ccc] rounded-full relative flex-shrink-0">
                      {selectedExport === 'CSV' && (
                        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] bg-[#f4a887] rounded-full"></span>
                      )}
                    </span>
                    Exporter en CSV
                  </label>
                </div>
                <button 
                  className="w-full px-5 py-2 bg-[#f4a887] text-black border-none rounded-[5px] cursor-pointer font-bold mt-3"
                  onClick={handleExportData}
                >
                  Télécharger mes données
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content central - Informations du compte */}
        <main className="flex-1 mt-0 text-left bg-[#FFFCEE] p-6 rounded-[15px] shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
          <div className="flex justify-between items-center mb-8 border-b-2 border-[#f4a887] pb-4">
            <h1 className="m-0 text-[#333] text-3xl">Les informations du compte</h1>
            {!isEditing ? (
              <button 
                className="px-5 py-2 bg-[#f4a887] text-black border-none rounded-[5px] cursor-pointer font-bold text-sm"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Modifier
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  className="px-5 py-2 bg-[#f4a887] text-black border-none rounded-[5px] cursor-pointer font-bold text-sm"
                  onClick={handleSaveProfile}
                >
                  💾 Sauvegarder
                </button>
                <button 
                  className="px-5 py-2 bg-[#6c757d] text-white border-none rounded-[5px] cursor-pointer font-bold text-sm"
                  onClick={handleCancelEdit}
                >
                  ❌ Annuler
                </button>
              </div>
            )}
          </div>

          {userData && (
            <div className="mb-10">
              {/* Civilité */}
              <div className="mb-5 flex items-start gap-5">
                <h3 className="text-base font-bold text-[#333] w-[150px] flex-shrink-0 m-0 pt-2">Votre civilité</h3>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2 flex-1">
                    {['Monsieur', 'Madame', 'Ne pas renseigner'].map((civility) => (
                      <label key={civility} className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-white border-2 border-[#e2e8f0] rounded-[5px]">
                        <input 
                          type="radio" 
                          name="civility" 
                          value={civility} 
                          checked={editedData.civility === civility}
                          onChange={(e) => handleInputChange('civility', e.target.value)}
                          className="hidden"
                        />
                        <span className="w-[18px] h-[18px] border-2 border-[#ccc] rounded-full relative flex-shrink-0">
                          {editedData.civility === civility && (
                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] bg-[#f4a887] rounded-full"></span>
                          )}
                        </span>
                        {civility}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="py-2 text-[#555] text-base flex-1">{userData.civility}</div>
                )}
              </div>

              {/* Prénom */}
              <div className="mb-5 flex items-start gap-5">
                <h3 className="text-base font-bold text-[#333] w-[150px] flex-shrink-0 m-0 pt-2">Votre prénom</h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="px-3 py-2 border-2 border-[#e2e8f0] rounded-[5px] text-base bg-white flex-1 max-w-[300px] focus:border-[#f4a887] focus:outline-none"
                  />
                ) : (
                  <div className="py-2 text-[#555] text-base flex-1">{userData.firstName}</div>
                )}
              </div>

              {/* Nom */}
              <div className="mb-5 flex items-start gap-5">
                <h3 className="text-base font-bold text-[#333] w-[150px] flex-shrink-0 m-0 pt-2">Votre nom</h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="px-3 py-2 border-2 border-[#e2e8f0] rounded-[5px] text-base bg-white flex-1 max-w-[300px] focus:border-[#f4a887] focus:outline-none"
                  />
                ) : (
                  <div className="py-2 text-[#555] text-base flex-1">{userData.lastName}</div>
                )}
              </div>

              {/* Email */}
              <div className="mb-5 flex items-start gap-5">
                <h3 className="text-base font-bold text-[#333] w-[150px] flex-shrink-0 m-0 pt-2">Votre mail</h3>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="px-3 py-2 border-2 border-[#e2e8f0] rounded-[5px] text-base bg-white flex-1 max-w-[300px] focus:border-[#f4a887] focus:outline-none"
                  />
                ) : (
                  <div className="py-2 text-[#555] text-base flex-1">{userData.email}</div>
                )}
              </div>

              {/* Mot de passe */}
              <div className="mb-5 flex items-start gap-5">
                <h3 className="text-base font-bold text-[#333] w-[150px] flex-shrink-0 m-0 pt-2">Votre mot de passe</h3>
                {isEditing ? (
                  <input
                    type="password"
                    value={editedData.password === '••••••••' ? '' : editedData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="px-3 py-2 border-2 border-[#e2e8f0] rounded-[5px] text-base bg-white flex-1 max-w-[300px] focus:border-[#f4a887] focus:outline-none"
                    placeholder="Nouveau mot de passe"
                  />
                ) : (
                  <div className="py-2 text-[#555] text-base flex-1">{userData.password}</div>
                )}
              </div>
            </div>
          )}

          {/* Ligne de séparation */}
          <div className="h-px bg-[#ddd] my-8"></div>

          {/* Section Commentaires */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#333] mb-5">Vos commentaires</h2>
            <div className="text-center py-8 bg-[#f9f9f9] rounded-[10px] text-[#777]">
              <p>Aucun commentaire trouvé</p>
            </div>
          </section>

          {/* Section Recettes publiées */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-[#333]">Vos recettes publiées</h2>
              <button className="px-5 py-2 bg-[#f4a887] text-black border-none rounded-[5px] cursor-pointer font-bold">
                Ajouter une recette
              </button>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white p-5 rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-center">
                  <div className="mb-4">
                    <h3 className="text-[#333] mb-4">Description du plat</h3>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-[#ff6b6b] text-white border-none rounded-[5px] cursor-pointer text-sm">Supprimer</button>
                    <button className="flex-1 px-3 py-2 bg-[#4dabf7] text-white border-none rounded-[5px] cursor-pointer text-sm">Modifier</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section Recettes enregistrées */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#333] mb-5">Vos recettes enregistrées</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white p-5 rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-center">
                  <div>
                    <h3 className="text-[#333] mb-4">Description du plat</h3>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section Supprimer le compte */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#333] mb-5">Supprimer mon compte</h2>
            
            <div className="bg-[#FFFCEE] p-6 rounded-[15px]">
              <h3 className="text-lg font-bold text-[#333] mb-4">Supprimer ?</h3>
              <div className="flex gap-5 mb-5">
                <label className="flex items-center gap-2 cursor-pointer py-1">
                  <input 
                    type="radio" 
                    name="delete" 
                    value="oui" 
                    onChange={(e) => setDeleteOption(e.target.value)}
                    className="hidden"
                  />
                  <span className="w-[18px] h-[18px] border-2 border-[#ccc] rounded-full relative flex-shrink-0">
                    {deleteOption === 'oui' && (
                      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] bg-[#f4a887] rounded-full"></span>
                    )}
                  </span>
                  Oui
                </label>
                <label className="flex items-center gap-2 cursor-pointer py-1">
                  <input 
                    type="radio" 
                    name="delete" 
                    value="non" 
                    onChange={(e) => setDeleteOption(e.target.value)}
                    className="hidden"
                  />
                  <span className="w-[18px] h-[18px] border-2 border-[#ccc] rounded-full relative flex-shrink-0">
                    {deleteOption === 'non' && (
                      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] bg-[#f4a887] rounded-full"></span>
                    )}
                  </span>
                  Non
                </label>
              </div>

              <h3 className="text-lg font-bold text-[#333] mb-4">Êtes-vous sûr ?</h3>
              <p className="text-[#555] mb-4">
                Réécrire la phrase suivante :<br />
                <em className="text-[#333] italic">Je veux supprimer mon compte</em>
              </p>
              
              <div className="mb-5">
                <input 
                  type="text" 
                  placeholder="Écrire ici" 
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full max-w-[400px] px-3 py-2 border-2 border-[#ddd] rounded-[5px] text-base mb-5 focus:border-[#f4a887] focus:outline-none"
                />
              </div>

              <button 
                className="px-6 py-3 bg-[#ff6b6b] text-white border-none rounded-[5px] cursor-pointer font-bold text-base disabled:bg-[#ccc] disabled:cursor-not-allowed"
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