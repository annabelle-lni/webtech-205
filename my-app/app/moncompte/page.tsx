"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/supabase/client";
import Link from "next/link"; // AJOUT IMPORTANT

export const dynamic = "force-dynamic";

const AccountSettings = () => {
  const supabase = createClient();

  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // États pour les paramètres
  const [selectedTheme, setSelectedTheme] = useState("clair");
  const [selectedFont, setSelectedFont] = useState("Aptos");
  const [selectedBanner, setSelectedBanner] = useState("Pâtisserie");
  const [selectedExport, setSelectedExport] = useState("JSON");
  const [deleteOption, setDeleteOption] = useState<string>("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // États pour les données utilisateur
  const [publishedRecipes, setPublishedRecipes] = useState<any[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);

  // États pour l'édition des informations
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    civility: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  // États pour la gestion des recettes
  const [showAddRecipeForm, setShowAddRecipeForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<any>(null);
  const [newRecipe, setNewRecipe] = useState({
    nom: "",
    ingredient: "",
    temps_preparation: "",
    preparation: "",
    categorie: "",
    fete: "",
    origine: "",
    difficulte: "faible",
    image: null as File | null // Pour stocker le fichier avant upload
  });

  // Classe boutons (utiliser le style fourni)
  const primaryBtn =
    "px-[1.2rem] py-[0.7rem] bg-[#f4a887] border-none rounded-[3px] text-base cursor-pointer hover:bg-[#FFFCEE]";
  const secondaryBtn =
    "px-[1.2rem] py-[0.7rem] bg-[#6c757d] text-white border-none rounded-[3px] text-base cursor-pointer hover:opacity-90";
  const dangerBtn =
    "px-[1.2rem] py-[0.7rem] bg-[#ff6b6b] text-white border-none rounded-[3px] text-base cursor-pointer hover:opacity-90";

  // FONCTION POUR UPLOADER L'IMAGE
  const uploadRecipeImage = async (file: File) => {
    try {
      // Générer un nom de fichier unique
      const fileName = `recettes/${userId}/${Date.now()}-${file.name}`;
      
      // Uploader l'image vers Supabase Storage (Bucket 'photos-recettes')
      const { data, error } = await supabase.storage
        .from('photos-recettes')
        .upload(fileName, file);

      if (error) throw error;

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('photos-recettes')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erreur upload image:', error);
      return null;
    }
  };

  // Récupération des données de supabase
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.log("Utilisateur non connecté");
          setIsLoading(false);
          return;
        }

        setUserId(user.id);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("nom, prenom, civilite")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Erreur récupération profil:", profileError.message);
        }

        const userInfos = {
          civility: profile?.civilite || "",
          firstName: profile?.prenom || "",
          lastName: profile?.nom || "",
          email: user.email || "",
          password: "••••••••",
        };

        setUserData(userInfos);
        setEditedData(userInfos);

        // Charger les recettes publiées de l'utilisateur
        await fetchUserRecipes(user.id);

        // --- AJOUT : Charger les recettes SAUVEGARDÉES ---
        await fetchSavedRecipes(user.id);

        setComments([]); // Aucun commentaire

      } catch (error) {
        console.error("Erreur générale:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fonction pour récupérer les recettes de l'utilisateur (PUBLIÉES)
  const fetchUserRecipes = async (userId: string) => {
    try {
      const { data: userRecipes, error: recipesError } = await supabase
        .from("recette")
        .select("*") // On prend tout, y compris la colonne 'images'
        .eq("proprietaire_id", userId);

      if (recipesError) {
        console.error("Erreur récupération recettes:", recipesError.message);
        setPublishedRecipes([]);
      } else {
        setPublishedRecipes(userRecipes || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des recettes:", error);
    }
  };

  // --- AJOUT : Fonction pour récupérer les recettes SAUVEGARDÉES ---
  const fetchSavedRecipes = async (userId: string) => {
    try {
      // On demande la table de liaison ET la recette complète associée
      const { data: savedData, error } = await supabase
        .from("recettes_sauvegardees")
        .select(`
          recette ( * ) 
        `)
        .eq("user_id", userId);

      if (error) {
        console.error("Erreur SQL favoris:", error.message);
        return;
      }

      if (savedData) {
        // On "aplatit" le résultat pour n'avoir qu'une liste de recettes
        const formatted = savedData.map((item: any) => item.recette).filter(Boolean);
        setSavedRecipes(formatted);
      }
    } catch (error) {
      console.error("Erreur JS favoris:", error);
    }
  };

  // AJOUTER UNE RECETTE
  const handleAddRecipe = async () => {
    if (!userId) return;

    try {
      let imageUrl = null;
      
      // Uploader l'image d'abord si elle existe
      if (newRecipe.image) {
        imageUrl = await uploadRecipeImage(newRecipe.image);
      }

      // Insérer la recette avec l'URL de l'image
      const { data, error } = await supabase
        .from("recette")
        .insert([
          {
            nom: newRecipe.nom,
            ingredient: newRecipe.ingredient,
            temps_preparation: newRecipe.temps_preparation,
            preparation: newRecipe.preparation,
            categorie: newRecipe.categorie,
            fete: newRecipe.fete,
            origine: newRecipe.origine,
            difficulte: newRecipe.difficulte,
            proprietaire_id: userId,
            images: imageUrl // On stocke l'URL directement dans la table recette
          }
        ])
        .select();

      if (error) throw error;

      // Recharger les recettes
      await fetchUserRecipes(userId);
      
      // Réinitialiser le formulaire
      setNewRecipe({
        nom: "",
        ingredient: "",
        temps_preparation: "",
        preparation: "",
        categorie: "",
        fete: "",
        origine: "",
        difficulte: "faible",
        image: null
      });
      setShowAddRecipeForm(false);
      
      alert("Recette ajoutée avec succès !");

    } catch (error: any) {
      console.error("Erreur lors de l'ajout:", error);
      alert(`Erreur : ${error.message || "Impossible d'ajouter la recette"}`);
    }
  };

  // MODIFIER UNE RECETTE
  const handleEditRecipe = async () => {
    if (!editingRecipe) return;

    try {
      let imageUrl = editingRecipe.images; // On garde l'ancienne image par défaut
      
      // Si une nouvelle image est sélectionnée, l'uploader (si vous avez ajouté l'input dans le mode édition)
      // Pour l'instant on garde l'ancienne logique :
      
      const { error } = await supabase
        .from("recette")
        .update({
          nom: editingRecipe.nom,
          ingredient: editingRecipe.ingredient,
          temps_preparation: editingRecipe.temps_preparation,
          preparation: editingRecipe.preparation,
          categorie: editingRecipe.categorie,
          fete: editingRecipe.fete,
          origine: editingRecipe.origine,
          difficulte: editingRecipe.difficulte,
          images: imageUrl
        })
        .eq("id", editingRecipe.id);

      if (error) throw error;

      // Recharger les recettes
      if (userId) await fetchUserRecipes(userId);
      setEditingRecipe(null);
      
      alert("Recette modifiée avec succès !");

    } catch (error: any) {
      console.error("Erreur lors de la modification:", error);
      alert(`Erreur : ${error.message || "Impossible de modifier la recette"}`);
    }
  };

  // SUPPRIMER UNE RECETTE
  const handleDeleteRecipe = async (recipeId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette recette ?")) return;

    try {
      // On supprime la recette (Supabase gère la suppression en cascade si configuré, sinon on supprime juste la recette)
      const { error } = await supabase
        .from("recette")
        .delete()
        .eq("id", recipeId);

      if (error) throw error;

      // Recharger les recettes
      if (userId) await fetchUserRecipes(userId);
      
      alert("Recette supprimée avec succès !");

    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      alert(`Erreur : ${error.message || "Impossible de supprimer la recette"}`);
    }
  };

  // Sauvegarde des données du profil
  const handleSaveProfile = async () => {
    if (!userId) return;

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          nom: editedData.lastName,
          prenom: editedData.firstName,
          civilite: editedData.civility,
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      const updates: { email?: string; password?: string } = {};

      if (editedData.email !== userData.email) {
        updates.email = editedData.email;
      }

      if (editedData.password && editedData.password !== "••••••••") {
        updates.password = editedData.password;
      }

      if (Object.keys(updates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(updates);
        if (authError) throw authError;
      }

      setUserData({
        ...editedData,
        password: "••••••••",
      });
      setEditedData((prev) => ({ ...prev, password: "••••••••" }));
      setIsEditing(false);

      alert("Profil mis à jour avec succès !");
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert(`Erreur : ${error.message || "Impossible de mettre à jour le profil"}`);
    }
  };

  // Effet pour appliquer le thème
  useEffect(() => {
    if (selectedTheme === "sombre") {
      document.documentElement.classList.add("dark-theme");
      document.body.style.backgroundColor = "#1a1a1a";
      document.body.style.color = "#ffffff";
    } else {
      document.documentElement.classList.remove("dark-theme");
      document.body.style.backgroundColor = "#f5f8fc";
      document.body.style.color = "#333";
    }
  }, [selectedTheme]);

  // Effet pour appliquer la police
  useEffect(() => {
    document.body.style.fontFamily = selectedFont;
  }, [selectedFont]);

  // Effet pour appliquer la bannière
  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      let bannerImage = "";
      switch (selectedBanner) {
        case "International":
          bannerImage = "url('/banniere-international.png')";
          break;
        case "Plat":
          bannerImage = "url('/banniere-plat.png')";
          break;
        case "Pâtisserie":
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
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
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
    <div className="my-[30px] mx-[10%]">
      {/* Container en deux colonnes alignées */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-[minmax(320px,380px)_1fr] gap-8 items-start min-h-[calc(100vh-160px)]">
        
        {/* Colonne de gauche - paramètres */}
        <aside className="sticky top-24">
          <div className="bg-[#FFFCEE] p-6 rounded-[15px] shadow-[0_6px_20px_rgba(0,0,0,0.08)] mx-[10px] my-[10px]">
            <h2 className="text-3xl font-bold text-[#333] m-0 mx-[10px] my-[10px] pb-10">Paramètres</h2>

            <div className="space-y-6 mx-[10px]">
              {/* Personnalisation */}
              <div>
                <h3 className="text-lg font-semibold text-[#333] mb-3">Personnalisation</h3>

                <div className="space-y-4">
                  {/* Thème */}
                  <div>
                    <h4 className="text-base font-medium text-[#555] mb-2">Thème du site</h4>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-3 cursor-pointer py-1 mx-[5px]">
                        <input
                          type="radio"
                          name="theme"
                          value="clair"
                          checked={selectedTheme === "clair"}
                          onChange={(e) => setSelectedTheme(e.target.value)}
                          className="hidden"
                        />
                        <span className="w-[18px] h-[18px] border-2 border-[#ccc] rounded-full relative flex-shrink-0">
                          {selectedTheme === "clair" && (
                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] bg-[#f4a887] rounded-full"></span>
                          )}
                        </span>
                        Clair
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer py-1 mx-[5px]">
                        <input
                          type="radio"
                          name="theme"
                          value="sombre"
                          checked={selectedTheme === "sombre"}
                          onChange={(e) => setSelectedTheme(e.target.value)}
                          className="hidden"
                        />
                        <span className="w-[18px] h-[18px] border-2 border-[#ccc] rounded-full relative flex-shrink-0">
                          {selectedTheme === "sombre" && (
                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] bg-[#f4a887] rounded-full"></span>
                          )}
                        </span>
                        Sombre
                      </label>
                    </div>
                  </div>

                  {/* Police */}
                  <div>
                    <h4 className="text-base font-medium text-[#555] mb-2">Police préférée</h4>
                    <div className="flex flex-col gap-2">
                      {["Aptos", "Century", "Impact"].map((font) => (
                        <label key={font} className="flex items-center gap-3 cursor-pointer py-1 mx-[5px]">
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

                  {/* Bannière */}
                  <div>
                    <h4 className="text-base font-medium text-[#555] mb-2">Modifier la bannière</h4>
                    <div className="flex flex-col gap-2">
                      {["Pâtisserie", "Plat", "International"].map((banner) => (
                        <label key={banner} className="flex items-center gap-3 cursor-pointer py-1 mx-[5px]">
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
              </div>

              {/* Données et confidentialité */}
              <div>
                <h3 className="text-lg font-semibold text-[#333] mb-3">Données et confidentialité</h3>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-base font-medium text-[#555] mb-2 mx-[10px] my-[10px]">Télécharger mes données</h4>
                    <div className="flex flex-col gap-2 mb-3">
                      <label className="flex items-center gap-3 cursor-pointer py-1 mx-[5px]">
                        <input
                          type="radio"
                          name="export"
                          value="JSON"
                          checked={selectedExport === "JSON"}
                          onChange={(e) => setSelectedExport(e.target.value)}
                          className="hidden"
                        />
                        <span className="w-[18px] h-[18px] border-2 border-[#ccc] rounded-full relative flex-shrink-0">
                          {selectedExport === "JSON" && (
                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] bg-[#f4a887] rounded-full"></span>
                          )}
                        </span>
                        Exporter en JSON
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer py-1 mx-[5px]">
                        <input
                          type="radio"
                          name="export"
                          value="CSV"
                          checked={selectedExport === "CSV"}
                          onChange={(e) => setSelectedExport(e.target.value)}
                          className="hidden"
                        />
                        <span className="w-[18px] h-[18px] border-2 border-[#ccc] rounded-full relative flex-shrink-0">
                          {selectedExport === "CSV" && (
                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] bg-[#f4a887] rounded-full"></span>
                          )}
                        </span>
                        Exporter en CSV
                      </label>
                    </div>

                    <button className={`${primaryBtn}  my-[15px] mx-[10px]`} onClick={handleExportData}>
                      Télécharger mes données
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Colonne de droite - informations du compte */}
        <main className="bg-[#FFFCEE] p-8 rounded-[15px] shadow-[0_6px_20px_rgba(0,0,0,0.08)] mx-[10px] my-[10px]">
          <div className="flex justify-between items-start gap-4 mb-8 border-b-2 border-[#f4a887] pb-6 mx-[10px]">
            <h1 className="m-0 text-[#333] text-3xl">Les informations du compte</h1>
            <div className="my-[15px] flex items-start gap-2">
              {!isEditing ? (
                <button className={primaryBtn} onClick={() => setIsEditing(true)}>
                  ✏️ Modifier
                </button>
              ) : (
                <div className="flex gap-2">
                  <button className={primaryBtn} onClick={handleSaveProfile}>
                    💾 Sauvegarder
                  </button>
                  <button className={secondaryBtn} onClick={handleCancelEdit}>
                    ❌ Annuler
                  </button>
                </div>
              )}
            </div>
          </div>

          {userData && (
            <div className=" space-y-6 mx-[10px]">
              {/* Civilité */}
              <div className="flex items-start gap-6 py-2">
                <h3 className="text-base font-semibold text-[#333] w-[180px] m-0 pt-2">Votre civilité</h3>
                {isEditing ? (
                  <div className="flex flex-wrap gap-3 flex-1">
                    {["Monsieur", "Madame", "Ne pas renseigner"].map((civility) => (
                      <label
                        key={civility}
                        className="flex items-center gap-3 cursor-pointer px-4 py-3 bg-white border-2 border-[#e2e8f0] rounded-[6px] mx-[5px] my-[5px]"
                      >
                        <input
                          type="radio"
                          name="civility"
                          value={civility}
                          checked={editedData.civility === civility}
                          onChange={(e) => handleInputChange("civility", e.target.value)}
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
                  <div className="py-3 text-[#555] text-base flex-1 mx-[10px]">{userData.civility}</div>
                )}
              </div>

              {/* Prénom */}
              <div className="flex items-start gap-6 py-2">
                <h3 className="text-base font-semibold text-[#333] w-[180px] m-0 pt-2">Votre prénom</h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="px-4 py-3 border-2 border-[#e2e8f0] rounded-[6px] text-base bg-white flex-1 max-w-[420px] focus:border-[#f4a887] focus:outline-none mx-[10px]"
                  />
                ) : (
                  <div className="py-3 text-[#555] text-base flex-1 mx-[10px]">{userData.firstName}</div>
                )}
              </div>

              {/* Nom */}
              <div className="flex items-start gap-6 py-2">
                <h3 className="text-base font-semibold text-[#333] w-[180px] m-0 pt-2">Votre nom</h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="px-4 py-3 border-2 border-[#e2e8f0] rounded-[6px] text-base bg-white flex-1 max-w-[420px] focus:border-[#f4a887] focus:outline-none mx-[10px]"
                  />
                ) : (
                  <div className="py-3 text-[#555] text-base flex-1 mx-[10px]">{userData.lastName}</div>
                )}
              </div>

              {/* Email */}
              <div className="flex items-start gap-6 py-2">
                <h3 className="text-base font-semibold text-[#333] w-[180px] m-0 pt-2">Votre mail</h3>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="px-4 py-3 border-2 border-[#e2e8f0] rounded-[6px] text-base bg-white flex-1 max-w-[420px] focus:border-[#f4a887] focus:outline-none mx-[10px]"
                  />
                ) : (
                  <div className="py-3 text-[#555] text-base flex-1 mx-[10px]">{userData.email}</div>
                )}
              </div>

              {/* Mot de passe */}
              <div className="flex items-start gap-6 py-2">
                <h3 className="text-base font-semibold text-[#333] w-[180px] m-0 pt-2">Votre mot de passe</h3>
                {isEditing ? (
                  <input
                    type="password"
                    value={editedData.password === "••••••••" ? "" : editedData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="px-4 py-3 border-2 border-[#e2e8f0] rounded-[6px] text-base bg-white flex-1 max-w-[420px] focus:border-[#f4a887] focus:outline-none mx-[10px]"
                    placeholder="Nouveau mot de passe"
                  />
                ) : (
                  <div className="py-3 text-[#555] text-base flex-1 mx-[10px]">{userData.password}</div>
                )}
              </div>
            </div>
          )}

          {/* Ligne de séparation */}
          <div className="h-px bg-[#ddd] my-10 mx-[10px]"></div>

          {/* Commentaires */}
          <section className="mb-10 mx-[10px]">
            <h2 className="text-2xl font-semibold text-[#333] mb-6">Vos commentaires</h2>
            {comments.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {comments.map((comment, index) => (
                  <div key={index} className="bg-white p-5 rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    <p className="text-[#555]">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-[10px] text-[#777] shadow-[0_2px_8px_rgba(0,0,0,0.04)] mx-[10px]">
                <p className="text-lg">Aucun commentaire trouvé</p>
              </div>
            )}
          </section>

          {/* Recettes publiées */}
          <section className="mb-10 mx-[10px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-[#333]">Vos recettes publiées</h2>
              <button 
                className={primaryBtn} 
                onClick={() => setShowAddRecipeForm(true)}
              >
                Ajouter une recette
              </button>
            </div>

            {/* Formulaire d'ajout de recette */}
            {showAddRecipeForm && (
              <div className="bg-white p-6 rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] mb-6">
                <h3 className="text-xl font-semibold mb-4">Nouvelle recette</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nom de la recette"
                    value={newRecipe.nom}
                    onChange={(e) => setNewRecipe({...newRecipe, nom: e.target.value})}
                    className="px-4 py-2 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Temps de préparation (min)"
                    value={newRecipe.temps_preparation}
                    onChange={(e) => setNewRecipe({...newRecipe, temps_preparation: e.target.value})}
                    className="px-4 py-2 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                  />
                  <select
                    value={newRecipe.categorie}
                    onChange={(e) => setNewRecipe({...newRecipe, categorie: e.target.value})}
                    className="px-4 py-2 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                  >
                    <option value="">Catégorie</option>
                    <option value="apéro">Apéro</option>
                    <option value="entrée">Entrée</option>
                    <option value="plat">Plat</option>
                    <option value="dessert">Dessert</option>
                  </select>
                  <select
                    value={newRecipe.difficulte}
                    onChange={(e) => setNewRecipe({...newRecipe, difficulte: e.target.value})}
                    className="px-4 py-2 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                  >
                    <option value="faible">Facile</option>
                    <option value="modéré">Moyen</option>
                    <option value="difficile">Difficile</option>
                  </select>
                  
                  <select
                    value={newRecipe.fete}
                      onChange={(e) => setNewRecipe({...newRecipe, fete: e.target.value})}
                      className="px-4 py-2 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                  >
                    <option value="">Fête associée</option>
                    <option value="Nouvel an">Nouvel an</option>
                    <option value="Noël">Noël</option>
                    <option value="Anniversaire">Anniversaire</option>
                    <option value="Pâques">Pâques</option>
                  </select> 

                  <select
                    value={newRecipe.origine}
                    onChange={(e) => setNewRecipe({...newRecipe, origine: e.target.value})}
                    className="px-4 py-2 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                  >
                    <option value="">Origine</option>
                    <option value="Français">Français</option>
                    <option value="Japonais">Japonais</option>
                    <option value="Italien">Italien</option>
                    <option value="Indien">Indien</option>
                  </select>

                  <div className="md:col-span-2">
                    <label className="block text-base font-medium mb-2">
                      Image de la recette
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewRecipe({
                        ...newRecipe, 
                        image: e.target.files?.[0] || null
                      })}
                      className="w-full px-4 py-2 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                    />
                    {newRecipe.image && (
                      <p className="text-sm mt-2">
                        Image sélectionnée : {newRecipe.image.name}
                      </p>
                    )}
                  </div>

                  <textarea
                    placeholder="Ingrédients"
                    value={newRecipe.ingredient}
                    onChange={(e) => setNewRecipe({...newRecipe, ingredient: e.target.value})}
                    className="px-4 py-2 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none md:col-span-2"
                    rows={3}
                  />
                  <textarea
                    placeholder="Préparation"
                    value={newRecipe.preparation}
                    onChange={(e) => setNewRecipe({...newRecipe, preparation: e.target.value})}
                    className="px-4 py-2 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none md:col-span-2"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button className={primaryBtn} onClick={handleAddRecipe}>
                    Ajouter
                  </button>
                  <button className={secondaryBtn} onClick={() => {
                    setShowAddRecipeForm(false);
                    setNewRecipe({
                      nom: "",
                      ingredient: "",
                      temps_preparation: "",
                      preparation: "",
                      categorie: "",
                      fete: "",
                      origine: "",
                      difficulte: "faible",
                      image: null
                    });
                  }}>
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Formulaire de modification de recette */}
            {editingRecipe && (
              <div className="bg-white p-6 rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] mb-6">
                <h3 className="text-xl font-semibold mb-4">Modifier la recette</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nom de la recette"
                    value={editingRecipe.nom}
                    onChange={(e) => setEditingRecipe({...editingRecipe, nom: e.target.value})}
                    className="px-4 py-2 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Temps de préparation (min)"
                    value={editingRecipe.temps_preparation}
                    onChange={(e) => setEditingRecipe({...editingRecipe, temps_preparation: e.target.value})}
                    className="px-4 py-2 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                  />
                  <select
                    value={editingRecipe.categorie}
                    onChange={(e) => setEditingRecipe({...editingRecipe, categorie: e.target.value})}
                    className="px-4 py-2 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                  >
                    <option value="">Catégorie</option>
                    <option value="apéro">Apéro</option>
                    <option value="entrée">Entrée</option>
                    <option value="plat">Plat</option>
                    <option value="dessert">Dessert</option>
                  </select>
                  <select
                    value={editingRecipe.difficulte}
                    onChange={(e) => setEditingRecipe({...editingRecipe, difficulte: e.target.value})}
                    className="px-4 py-2 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                  >
                    <option value="faible">Facile</option>
                    <option value="modéré">Moyen</option>
                    <option value="difficile">Difficile</option>
                  </select>
                  
                  <select
                    value={editingRecipe.fete}
                    onChange={(e) => setEditingRecipe({...editingRecipe, fete: e.target.value})}
                    className="px-4 py-2 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                  >
                    <option value="">Fête associée</option>
                    <option value="Nouvel an">Nouvel an</option>
                    <option value="Noël">Noël</option>
                    <option value="Anniversaire">Anniversaire</option>
                    <option value="Pâques">Pâques</option>
                  </select>

                  <select
                    value={editingRecipe.origine}
                    onChange={(e) => setEditingRecipe({...editingRecipe, origine: e.target.value})}
                    className="px-4 py-2 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                  >
                    <option value="">Origine</option>
                    <option value="Français">Français</option>
                    <option value="Japonais">Japonais</option>
                    <option value="Italien">Italien</option>
                    <option value="Indien">Indien</option>
                  </select>

                  <div className="md:col-span-2">
                    <label className="block text-base font-medium mb-2">
                      Image de la recette
                    </label>
                    {/* Note: l'édition d'image demande plus de logique, ici on affiche juste l'état */}
                    {editingRecipe.images ? (
                      <p className="text-sm text-green-600 mb-2">Image actuelle présente</p>
                    ) : (
                      <p className="text-sm text-gray-500 mb-2">Pas d'image</p>
                    )}
                  </div>

                  <textarea
                    placeholder="Ingrédients"
                    value={editingRecipe.ingredient}
                    onChange={(e) => setEditingRecipe({...editingRecipe, ingredient: e.target.value})}
                    className="px-4 py-2 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none md:col-span-2"
                    rows={3}
                  />
                  <textarea
                    placeholder="Préparation"
                    value={editingRecipe.preparation}
                    onChange={(e) => setEditingRecipe({...editingRecipe, preparation: e.target.value})}
                    className="px-4 py-2 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none md:col-span-2"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button className={primaryBtn} onClick={handleEditRecipe}>
                    Modifier
                  </button>
                  <button className={secondaryBtn} onClick={() => setEditingRecipe(null)}>
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Liste des recettes publiées */}
            {publishedRecipes.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
                {publishedRecipes.map((recipe) => (
                  <div key={recipe.id} className="bg-white p-6 rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] text-center mx-[5px] my-[5px]">
                    {/* Image de la recette */}
                    <div className="bg-[#FFFFFF] h-[140px] mb-4">
                      {recipe.images ? (
                        <img 
                          src={recipe.images} 
                          alt={recipe.nom}
                          className="w-full h-full object-cover rounded-[5px]"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center rounded-[5px]">
                          <span className="text-gray-500 text-sm">Pas d'image</span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-[#333] mb-3">{recipe.nom}</h3>
                    <p className="text-[13px] text-[#555] mb-3">
                      Temps : {recipe.temps_preparation} min
                    </p>
                    {recipe.categorie && (
                      <p className="text-[12px] text-[#777] mb-2">Catégorie: {recipe.categorie}</p>
                    )}
                    <div className="flex gap-3 mt-4">
                      <button 
                        className={`${dangerBtn} flex-1`} 
                        onClick={() => handleDeleteRecipe(recipe.id)}
                      >
                        Supprimer
                      </button>
                      <button 
                        className={`${primaryBtn} flex-1`} 
                        onClick={() => setEditingRecipe(recipe)}
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-[10px] text-[#777] shadow-[0_2px_8px_rgba(0,0,0,0.04)] mx-[10px]">
                <p className="text-lg">Aucune recette publiée</p>
              </div>
            )}
          </section>

          {/* --- AJOUT : SECTION RECETTES SAUVEGARDÉES --- */}
          <section className="mb-10 mx-[10px]">
            <h2 className="text-2xl font-semibold text-[#333] mb-6">Vos recettes enregistrées</h2>
            
            {savedRecipes.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
                {savedRecipes.map((recipe) => (
                  <div key={recipe.id} className="bg-white p-6 rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] text-center mx-[5px] my-[5px]">
                    {/* Image de la recette */}
                    <div className="bg-[#FFFFFF] h-[140px] mb-4">
                      {recipe.images ? (
                        <img 
                          src={recipe.images} 
                          alt={recipe.nom}
                          className="w-full h-full object-cover rounded-[5px]"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center rounded-[5px]">
                          <span className="text-gray-500 text-sm">Pas d'image</span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-[#333] mb-3">{recipe.nom}</h3>
                    <p className="text-[13px] text-[#555] mb-3">
                      Temps : {recipe.temps_preparation} min
                    </p>
                    
                    <Link href={`/articles/${recipe.id}`}>
                      <button className={`${primaryBtn} w-full`}>
                        Voir la recette
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-[10px] text-[#777] shadow-[0_2px_8px_rgba(0,0,0,0.04)] mx-[10px]">
                <p className="text-lg">Aucune recette enregistrée</p>
                <Link href="/articles" className="text-[#f4a887] underline mt-2 block">
                  Découvrir des recettes
                </Link>
              </div>
            )}
          </section>

          {/* Supprimer le compte */}
          <section className="mb-8 mx-[10px] my-[10px]">
            <h2 className="text-2xl font-semibold text-[#333] mb-6">Supprimer mon compte</h2>

            <div className="bg-[#FFFCEE] p-6 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] mx-[10px]">
              <h3 className="text-lg font-medium text-[#333] mb-4">Supprimer ?</h3>
              <div className="flex gap-5 mb-5">
                <label className="flex items-center gap-2 cursor-pointer py-1 mx-[5px]">
                  <input
                    type="radio"
                    name="delete"
                    value="oui"
                    onChange={(e) => setDeleteOption(e.target.value)}
                    className="hidden"
                  />
                  <span className="w-[18px] h-[18px] border-2 border-[#ccc] rounded-full relative flex-shrink-0">
                    {deleteOption === "oui" && (
                      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] bg-[#f4a887] rounded-full"></span>
                    )}
                  </span>
                  Oui
                </label>
                <label className="flex items-center gap-2 cursor-pointer py-1 mx-[5px]">
                  <input
                    type="radio"
                    name="delete"
                    value="non"
                    onChange={(e) => setDeleteOption(e.target.value)}
                    className="hidden"
                  />
                  <span className="w-[18px] h-[18px] border-2 border-[#ccc] rounded-full relative flex-shrink-0">
                    {deleteOption === "non" && (
                      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] bg-[#f4a887] rounded-full"></span>
                    )}
                  </span>
                  Non
                </label>
              </div>

              <h3 className="text-lg font-medium text-[#333] mb-2">Êtes-vous sûr ?</h3>
              <p className="text-[#555] mb-4 mx-[5px]">
                Réécrire la phrase suivante : <br />
                <em className="text-[#333] italic">Je veux supprimer mon compte</em>
              </p>

              <div className="mb-5 mx-[5px]">
                <input
                  type="text"
                  placeholder="Écrire ici"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full max-w-[480px] px-4 py-3 border-2 border-[#ddd] rounded-[6px] text-base focus:border-[#f4a887] focus:outline-none"
                />
              </div>

              <button
                className={`${dangerBtn} disabled:bg-[#ccc] disabled:cursor-not-allowed mx-[5px] my-[10px]`}
                disabled={deleteConfirmation !== "Je veux supprimer mon compte" || deleteOption !== "oui"}
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