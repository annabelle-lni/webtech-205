"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/supabase/client";
import Link from "next/link";

export const dynamic = "force-dynamic";

// données utilisateur
interface UserData {
  civility: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// données recette
interface Recipe {
  id: string;
  nom: string;
  temps_preparation: string;
  categorie: string;
  fete: string;
  origine: string;
  difficulte: string;
  ingredient: string;
  preparation: string;
  images?: string | null; //peut être null
  image?: File | null; //pour l'upload
}

// données sauvegardées pour recette sauvegardée
interface SavedRecipe {
  id: string;
  created_at: string;
  recette: Recipe;
}

// données commentaire
interface Comment {
  id: string;
  contenu: string;
  created_at: string;
  recette: {
    id: number | string;
    nom: string;
  };
}

const AccountSettings = () => {
  const supabase = createClient();

  // États pour les données utilisateur
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // États pour les paramètres avec valeurs par défaut
  const [selectedTheme, setSelectedTheme] = useState("clair");
  const [selectedFont, setSelectedFont] = useState("Aptos");
  const [selectedBanner, setSelectedBanner] = useState("Pâtisserie");
  const [selectedExport, setSelectedExport] = useState("JSON");
  const [deleteOption, setDeleteOption] = useState<string>("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // États pour les données utilisateur
  const [publishedRecipes, setPublishedRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

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
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [newRecipe, setNewRecipe] = useState({
    nom: "",
    ingredient: "",
    temps_preparation: "",
    preparation: "",
    categorie: "",
    fete: "",
    origine: "",
    difficulte: "faible",
    image: null as File | null
  });

  // Classe boutons
  const primaryBtn = "px-[1.2rem] py-[0.7rem] bg-[#f4a887] border-none rounded-[3px] text-base hover:bg-[#e8976f] transition-colors";
  const secondaryBtn = "px-[1.2rem] py-[0.7rem] bg-[#6c757d] border-none rounded-[3px] text-base hover:opacity-90 transition-colors";
  const dangerBtn = "px-[1.2rem] py-[0.7rem] bg-[#ff6b6b] border-none rounded-[3px] text-base hover:opacity-90 transition-colors";

  // Fonction pour réinitialiser les paramètres aux valeurs par défaut
  const resetSettingsToDefault = useCallback(() => {
    console.log("Réinitialisation des paramètres aux valeurs par défaut");
    
    setSelectedTheme("clair");
    setSelectedFont("Aptos");
    setSelectedBanner("Pâtisserie");
    setSelectedExport("JSON");
    
    // Réappliquer les styles par défaut
    document.documentElement.classList.remove("dark-theme");
    document.body.style.backgroundColor = "#f5f8fc";
    document.body.style.color = "#333";
    document.body.style.fontFamily = "Aptos, sans-serif";
    
    // Réinitialiser la bannière
    const header = document.querySelector("header");
    if (header) {
      header.style.backgroundImage = "url('/banniere-patisserie.png')";
    }

    // Nettoyer le localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedTheme');
      localStorage.removeItem('selectedFont');
      localStorage.removeItem('selectedBanner');
    }
  }, []);

  // Fonction pour sauvegarder les paramètres de l'user dans la bdd
  const saveSettingsToDatabase = useCallback(async () => {
    if (!userId) return;

    // Sauvegarde dans la table user_settings
    try {
      const settings = {
        theme: selectedTheme,
        font: selectedFont,
        banner: selectedBanner,
        export_format: selectedExport,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: userId,
          settings: settings
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      
      console.log("Paramètres sauvegardés dans la base de données");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des paramètres:", error);
    }
  }, [userId, selectedTheme, selectedFont, selectedBanner, selectedExport, supabase]);

  // Fonction pour charger les paramètres depuis la bdd
  const loadSettingsFromDatabase = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("settings")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Erreur récupération paramètres:", error);
        return;
      }

      // Applique les paramètres obtenus
      if (data && data.settings) {
        const settings = data.settings;
        
        if (settings.theme) {
          setSelectedTheme(settings.theme);
        }
        if (settings.font) {
          setSelectedFont(settings.font);
        }
        if (settings.banner) {
          setSelectedBanner(settings.banner);
        }
        if (settings.export_format) {
          setSelectedExport(settings.export_format);
        }
        
        console.log("Paramètres chargés depuis la base de données:", settings);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des paramètres:", error);
    }
  }, []);

  // Fonction pour charger les recettes sauvegardées
  const loadSavedRecipes = useCallback(async (userId: string) => {
    try {
      const { data: savedRecipesData, error: savedRecipesError } = await supabase
        .from("recettes_sauvegardees")
        .select(`
          id,
          created_at,
          recette:recette_id(
            id,
            nom,
            temps_preparation,
            categorie,
            fete,
            origine,
            difficulte,
            images
          )
        `)
        .eq("user_id", userId);

      if (savedRecipesError) {
        console.error("Erreur récupération recettes enregistrées:", savedRecipesError.message);
        setSavedRecipes([]);
      } else {
        const normalized = (savedRecipesData || []).map((s: any) => {
          const recetteObj = Array.isArray(s.recette) ? s.recette[0] : s.recette;
          return {
            id: s.id,
            created_at: s.created_at,
            recette: recetteObj
          } as SavedRecipe;
        }).filter((s: SavedRecipe) => !!s.recette);
        setSavedRecipes(normalized);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des recettes enregistrées:", error);
    }
  }, []);

  // Fonction pour charger les commentaires écrits par l'user
const loadUserComments = useCallback(async (userId: string) => {
  try {
    console.log("Chargement des commentaires écrits PAR l'utilisateur:", userId);

    const { data: userComments, error: commentsError } = await supabase
      .from("commentaire")
      .select(`
        id, 
        contenu, 
        created_at, 
        recette:id_recette(
          id,
          nom
        )
      `)
      .eq("proprietaire_id", userId)
      .order("created_at", { ascending: false });

    console.log("Commentaires écrits PAR l'utilisateur:", userComments);
    console.log("Erreur commentaires:", commentsError);

    if (!commentsError && userComments) {
      const normalized: Comment[] = (userComments || []).map((c: any) => {
        const recetteObj = Array.isArray(c.recette) ? c.recette[0] : c.recette;
        console.log("Commentaire normalisé:", c.id, recetteObj);
        return {
          id: c.id,
          contenu: c.contenu,
          created_at: c.created_at,
          recette: recetteObj || { id: "", nom: "Recette inconnue" },
        } as Comment;
      });
      setComments(normalized);
      console.log("Commentaires normalisés:", normalized);
    } else {
      console.error("Erreur récupération commentaires:", commentsError);
      setComments([]);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des commentaires:", error);
    setComments([]);
  }
}, [supabase]);


  // Fonction pour uploader l'image de la recette
  const uploadRecipeImage = useCallback(async (file: File) => {
    if (!userId) return null;

    try {
      const fileName = `recettes/${userId}/${Date.now()}-${file.name}`;
      
      const { error } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erreur upload image:', error);
      return null;
    }
  }, [userId, supabase]);

  // Fonction utilitaire pour convertir les données en CSV
  const convertToCSV = useCallback((data: any) => {
    const sections = [];
    
    // Section --- Informations personnelles
    sections.push("INFORMATIONS PERSONNELLES");
    sections.push("Clé,Valeur");
    Object.entries(data.informations_personnelles).forEach(([key, value]) => {
      sections.push(`"${key}","${value}"`);
    });
    sections.push(""); // Ligne vide entre les sections

    // Section --- Commentaires
    if (data.commentaires.length > 0) {
      sections.push("COMMENTAIRES");
      sections.push("ID,Contenu,Date de création,Recette associée");
      data.commentaires.forEach((comment: any) => {
        sections.push(`"${comment.id}","${comment.contenu.replace(/"/g, '""')}","${comment.date_creation}","${comment.recette_associee}"`);
      });
      sections.push("");
    }

    // Section --- Recettes publiées
    if (data.recettes_publiées.length > 0) {
      sections.push("RECETTES PUBLIÉES");
      sections.push("ID,Nom,Temps de préparation,Catégorie,Fête,Origine,Difficulté,Ingrédients,Préparation");
      data.recettes_publiées.forEach((recipe: any) => {
        sections.push(`"${recipe.id}","${recipe.nom}","${recipe.temps_preparation}","${recipe.categorie}","${recipe.fete}","${recipe.origine}","${recipe.difficulte}","${recipe.ingredients.replace(/"/g, '""')}","${recipe.preparation.replace(/"/g, '""')}"`);
      });
      sections.push("");
    }

    // Section --- Recettes enregistrées
    if (data.recettes_enregistrées.length > 0) {
      sections.push("RECETTES ENREGISTRÉES");
      sections.push("ID sauvegarde,Date de sauvegarde,ID recette,Nom recette,Temps de préparation,Catégorie,Fête,Origine,Difficulté");
      data.recettes_enregistrées.forEach((saved: any) => {
        sections.push(`"${saved.id}","${saved.date_sauvegarde}","${saved.recette.id}","${saved.recette.nom}","${saved.recette.temps_preparation}","${saved.recette.categorie}","${saved.recette.fete}","${saved.recette.origine}","${saved.recette.difficulte}"`);
      });
    }

    return sections.join("\n");
  }, []);

  // Fonction pour exporter les données user
  const handleExportData = useCallback(async () => {
    if (!userId) {
      alert("Vous devez être connecté pour exporter vos données");
      return;
    }

    try {
      const exportData: {
        informations_personnelles: any;
        commentaires: any[];
        recettes_publiées: any[];
        recettes_enregistrées: any[];
      } = {
        informations_personnelles: {
          civilité: userData?.civility || "",
          prénom: userData?.firstName || "",
          nom: userData?.lastName || "",
          email: userData?.email || "",
          date_export: new Date().toISOString()
        },
        commentaires: [],
        recettes_publiées: [],
        recettes_enregistrées: []
      };

      // Récupérer les commentaires de l'utilisateur
      const { data: userComments, error: commentsError } = await supabase
        .from("commentaire")
        .select(`
          id,
          contenu,
          created_at,
          recette:recette_id(nom)
        `)
        .eq("proprietaire_id", userId);

      if (!commentsError && userComments) {
        exportData.commentaires = userComments.map((comment: any) => ({
          id: comment.id,
          contenu: comment.contenu,
          date_creation: comment.created_at,
          recette_associee: (Array.isArray(comment.recette) ? comment.recette[0]?.nom : comment.recette?.nom) || "Recette inconnue"
        }));
      }

      // Récupérer les recettes publiées
      if (publishedRecipes.length > 0) {
        exportData.recettes_publiées = publishedRecipes.map((recipe: any) => ({
          id: recipe.id,
          nom: recipe.nom,
          temps_preparation: recipe.temps_preparation,
          categorie: recipe.categorie,
          fete: recipe.fete,
          origine: recipe.origine,
          difficulte: recipe.difficulte,
          ingredients: recipe.ingredient,
          preparation: recipe.preparation,
          image_url: recipe.images || null
        }));
      }

      // Récupérer les recettes enregistrées
      const { data: savedRecipesData, error: savedRecipesError } = await supabase
        .from("recettes_sauvegardees")
        .select(`
          id,
          created_at,
          recette:recette_id(
            id,
            nom,
            temps_preparation,
            categorie,
            fete,
            origine,
            difficulte,
            images
          )
        `)
        .eq("user_id", userId);

      // Ajouter les recettes enregistrées au format approprié
      if (!savedRecipesError && savedRecipesData) {
        exportData.recettes_enregistrées = savedRecipesData.map((saved: any) => {
          const recetteObj = Array.isArray(saved.recette) ? saved.recette[0] : saved.recette;
          return {
            id: saved.id,
            date_sauvegarde: saved.created_at,
            recette: {
              id: recetteObj?.id,
              nom: recetteObj?.nom,
              temps_preparation: recetteObj?.temps_preparation,
              categorie: recetteObj?.categorie,
              fete: recetteObj?.fete,
              origine: recetteObj?.origine,
              difficulte: recetteObj?.difficulte,
              image_url: recetteObj?.images || null
            }
          };
        });
      }

      // Générer le fichier selon le format sélectionné
      let fileContent: string = "";
      let mimeType: string = "application/octet-stream";
      let fileExtension: string = "txt";

      if (selectedExport === "JSON") {
        fileContent = JSON.stringify(exportData, null, 2);
        mimeType = "application/json";
        fileExtension = "json";
      } else if (selectedExport === "CSV") {
        const csvData = convertToCSV(exportData);
        fileContent = csvData;
        mimeType = "text/csv";
        fileExtension = "csv";
      }

      // Créer et télécharger le fichier
      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mes_donnees_cooking_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(`Vos données ont été exportées avec succès en format ${selectedExport} !`);

    } catch (error) {
      console.error("Erreur lors de l'export des données:", error);
      alert("Une erreur est survenue lors de l'export de vos données");
    }
  }, [userId, userData, publishedRecipes, selectedExport, convertToCSV, supabase]);

  // Fonction pour récupérer les recettes de l'utilisateur
  const fetchUserRecipes = useCallback(async (userId: string) => {
    try {
      const { data: userRecipes, error: recipesError } = await supabase
        .from("recette")
        .select("id, nom, temps_preparation, categorie, fete, origine, ingredient, preparation, difficulte, images")
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
  }, [supabase]);

  // Ajouter une nouvelle recette
  const handleAddRecipe = useCallback(async () => {
    if (!userId) return;

    try {
      let imageUrl = null;
      
      if (newRecipe.image) {
        imageUrl = await uploadRecipeImage(newRecipe.image);
      }

      const { error } = await supabase
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
            images: imageUrl
          }
        ])
        .select();

      if (error) throw error;

      await fetchUserRecipes(userId);
      
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
  }, [userId, newRecipe, uploadRecipeImage, supabase, fetchUserRecipes]);

  // Modifier une recette existante
  const handleEditRecipe = useCallback(async () => {
    if (!editingRecipe) return;

    try {
      let imageUrl = editingRecipe.images;
      
      if (editingRecipe.image) {
        imageUrl = await uploadRecipeImage(editingRecipe.image);
      }

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

      if (userId) await fetchUserRecipes(userId);
      setEditingRecipe(null);
      
      alert("Recette modifiée avec succès !");

    } catch (error: any) {
      console.error("Erreur lors de la modification:", error);
      alert(`Erreur : ${error.message || "Impossible de modifier la recette"}`);
    }
  }, [editingRecipe, uploadRecipeImage, supabase, userId, fetchUserRecipes]);

  // Supprimer une recette
  const handleDeleteRecipe = useCallback(async (recipeId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette recette ?")) return;

    try {
      const { error } = await supabase
        .from("recette")
        .delete()
        .eq("id", recipeId);

      if (error) throw error;

      if (userId) await fetchUserRecipes(userId);
      alert("Recette supprimée avec succès !");

    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      alert(`Erreur : ${error.message || "Impossible de supprimer la recette"}`);
    }
  }, [supabase, userId, fetchUserRecipes]);

  // Supprimer un commentaire
  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) return;

    try {
      const { error } = await supabase
        .from("commentaire")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      if (userId) await loadUserComments(userId);
      alert("Commentaire supprimé avec succès !");

    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      alert(`Erreur : ${error.message || "Impossible de supprimer le commentaire"}`);
    }
  }, [supabase, userId, loadUserComments]);

  // Sauvegarde des données du profil
  const handleSaveProfile = useCallback(async () => {
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

      if (editedData.email !== userData?.email) {
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
  }, [userId, editedData, userData, supabase]);

  // Récupération des données de supabase
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          console.log("Utilisateur non connecté - réinitialisation des paramètres");
          resetSettingsToDefault();
          setIsLoading(false);
          return;
        }

        setUserId(user.id);

        // Charger les paramètres depuis la base de données
        await loadSettingsFromDatabase(user.id);

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

        // Charger les recettes de l'utilisateur
        await fetchUserRecipes(user.id);

        // Charger les recettes enregistrées
        await loadSavedRecipes(user.id);

        // Charger les commentaires
        await loadUserComments(user.id);

      } catch (error) {
        console.error("Erreur générale:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [supabase, resetSettingsToDefault, loadSettingsFromDatabase, fetchUserRecipes, loadSavedRecipes, loadUserComments]);

  // Sauvegarde automatique des paramètres dans la base de données
  useEffect(() => {
    if (userId) {
      const timeoutId = setTimeout(() => {
        saveSettingsToDatabase();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedTheme, selectedFont, selectedBanner, selectedExport, userId, saveSettingsToDatabase]);

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

  const handleCancelEdit = useCallback(() => {
    setEditedData(userData || {
      civility: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    });
    setIsEditing(false);
  }, [userData]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // FONCTIONS POUR MODIFIER LES PARAMÈTRES AVEC SAUVEGARDE
  const handleThemeChange = useCallback((theme: string) => {
    setSelectedTheme(theme);
  }, []);

  const handleFontChange = useCallback((font: string) => {
    setSelectedFont(font);
  }, []);

  const handleBannerChange = useCallback((banner: string) => {
    setSelectedBanner(banner);
  }, []);

  const handleExportChange = useCallback((exportFormat: string) => {
    setSelectedExport(exportFormat);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <main className="flex-1 text-left mx-[10%] my-10 bg-[#FFFCEE] flex flex-col items-center text-center gap-2 pb-[60px] rounded-[20px] mt-32">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f4a887] mx-auto"></div>
            <p className="mt-4">Chargement de votre profil...</p>
          </div>
        </main>
      </div>
    );
  }

  {/* Bloc principal */}
  return (
    <div className="my-[30px] mx-[10%]">
      <div className="max-w-[1400px] mx-auto grid grid-cols-[minmax(320px,380px)_1fr] gap-8 items-start min-h-[calc(100vh-160px)]">
        
        {/* Espace --- Colonne de gauche : paramètres */}
        <aside className="sticky">
          <div className={`rounded-[15px] shadow-[0_6px_20px_rgba(0,0,0,0.08)] mx-[10px] transition-colors duration-300 ${
            selectedTheme === "sombre" ? "bg-[#1F2937]" : "bg-[#FFFCEE]"}`}>
            
            <div className="mx-[10px] my-[15px] p-[15px]">
              {/*le p-[15px] permet de séparer le contenu du bord du conteneur*/}
              <h2>Paramètres</h2>

              {/* Espace --- Personnalisation */}
              <div>
                <h3>Personnalisation</h3>

                <div className="space-y-4">
                  {/* Espace --- Thème : on peut sélectionner mode sombre ou clair */}
                  <div>
                    <h4 className="text-base font-medium mb-2">Thème du site</h4>
                    <div className="flex flex-col gap-2">
                      {/*si etat clair est sélectionné*/}
                      <label className="flex items-center mx-[5px]">
                        <input
                          type="radio"
                          name="theme"
                          value="clair"
                          checked={selectedTheme === "clair"} 
                          onChange={(e) => handleThemeChange(e.target.value)}
                          className="hidden"
                        />
                        <span className="w-[18px] h-[18px] border-2 border-[#ccc] rounded-full relative flex-shrink-0">
                          {selectedTheme === "clair" && (
                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] bg-[#f4a887] rounded-full"></span>
                          )}
                        </span>
                        Clair
                      </label>
                      
                      {/*si etat sombre est sélectionné*/}
                      <label className="flex items-center mx-[5px]">
                        <input
                          type="radio"
                          name="theme"
                          value="sombre"
                          checked={selectedTheme === "sombre"}
                          onChange={(e) => handleThemeChange(e.target.value)}
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

                  {/* Espace --- Police : aptos, century ou impact */}
                  <div>
                    <h4>Police préférée</h4>
                    <div className="flex flex-col">
                      {["Aptos", "Century", "Impact"].map((font) => (
                        <label key={font} className="flex items-center mx-[5px]">
                          <input
                            type="radio"
                            name="font"
                            value={font}
                            checked={selectedFont === font}
                            onChange={(e) => handleFontChange(e.target.value)}
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

                  {/* Espace --- Bannière : pâtisserie, plat ou international */}
                  <div>
                    <h4 className="text-base font-medium">Modifier la bannière</h4>
                    <div className="flex flex-col">
                      {["Pâtisserie", "Plat", "International"].map((banner) => (
                        <label key={banner} className="flex items-center mx-[5px]">
                          <input
                            type="radio"
                            name="banner"
                            value={banner}
                            checked={selectedBanner === banner}
                            onChange={(e) => handleBannerChange(e.target.value)}
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

              {/* Espace --- Données et confidentialité */}
              <div>
                <h3>Données et confidentialité</h3>

                <div className="space-y-3">
                  <div>
                    <h4>Télécharger mes données</h4>

                    {/* Espace --- Télécharger les données JSON ou CSV */}
                    <div className="flex flex-col">
                      <label className="flex items-center mx-[5px]">
                        <input
                          type="radio"
                          name="export"
                          value="JSON"
                          checked={selectedExport === "JSON"}
                          onChange={(e) => handleExportChange(e.target.value)}
                          className="hidden"
                        />
                        <span className="w-[18px] h-[18px] border-2 border-[#ccc] rounded-full relative flex-shrink-0">
                          {selectedExport === "JSON" && (
                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] bg-[#f4a887] rounded-full"></span>
                          )}
                        </span>
                        Exporter en JSON
                      </label>

                      <label className="flex items-center mx-[5px]">
                        <input
                          type="radio"
                          name="export"
                          value="CSV"
                          checked={selectedExport === "CSV"}
                          onChange={(e) => handleExportChange(e.target.value)}
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

        {/* Espace --- Colonne de droite : informations du compte */}
        <main className={`rounded-[15px] shadow-[0_6px_20px_rgba(0,0,0,0.08)] mx-[10px] my-[10px] ${
          selectedTheme === "sombre" ? "bg-[#1F2937] text-white" : "bg-[#FFFCEE]"}`}>          
          <div className="flex justify-between items-start border-[#f4a887] mx-[10px]">
            
            <h1>Les informations du compte</h1>
            <div className="my-[15px] flex items-start">
              
              {/*Espace --- Bouton modifier / sauvegarder / annuler */}
              {!isEditing ? (
                <button className={primaryBtn} onClick={() => setIsEditing(true)}>
                  Modifier
                </button>
              ) : (
                <div className="flex">
                  <button className={primaryBtn} onClick={handleSaveProfile}>
                    Sauvegarder
                  </button>
                  <button className={secondaryBtn} onClick={handleCancelEdit}>
                    Annuler
                  </button>
                </div>
              )}
            </div>
          </div>

          {userData && (
            <div className="mx-[10px]">
              {/* Description --- Civilité */}
              <div className="flex items-start">
                <h3 className="font-semibold w-[180px]">Votre civilité</h3>
                {isEditing ? (
                  <div className="flex flex-wrap">
                    {["Monsieur", "Madame", "Ne pas renseigner"].map((civility) => (
                      <label
                        key={civility}
                        className="flex items-center border-[#e2e8f0] rounded-[6px] mx-[5px] my-[5px]"
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
                  <div className="italic py-3 text-base flex-1 mx-[10px] my-[20px]">{userData.civility}</div>
                )}
              </div>

              {/* Description --- Prénom */}
              <div className="flex items-start">
                <h3 className="font-semibold w-[180px]">Votre prénom</h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="border-[#e2e8f0] rounded-[6px] max-w-[420px] focus:border-[#f4a887] focus:outline-none mx-[10px]"
                  />
                ) : (
                  <div className="italic mx-[10px] my-[20px]">{userData.firstName}</div>
                )}
              </div>

              {/* Description --- Nom */}
              <div className="flex items-start">
                <h3 className="font-semibold w-[180px]">Votre nom</h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="border-[#e2e8f0] rounded-[6px] max-w-[420px] focus:border-[#f4a887] focus:outline-none mx-[10px]"
                  />
                ) : (
                  <div className="italic mx-[10px] my-[20px]">{userData.lastName}</div>
                )}
              </div>

              {/* Description --- Email */}
              <div className="flex items-start">
                <h3 className="font-semibold w-[180px]">Votre mail</h3>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="border-[#e2e8f0] rounded-[6px] max-w-[420px] focus:border-[#f4a887] focus:outline-none mx-[10px]"
                  />
                ) : (
                  <div className="italic mx-[10px] my-[20px]">{userData.email}</div>
                )}
              </div>

              {/* Description --- Mot de passe */}
              <div className="flex items-start">
                <h3 className="font-semibold w-[180px]">Votre mot de passe</h3>
                {isEditing ? (
                  <input
                    type="password"
                    value={editedData.password === "••••••••" ? "" : editedData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="border-[#e2e8f0] rounded-[6px] max-w-[420px] focus:border-[#f4a887] focus:outline-none mx-[10px]"
                    placeholder="Nouveau mot de passe"
                  />
                ) : (
                  <div className="italic mx-[10px] my-[20px]">{userData.password}</div>
                )}
              </div>
            </div>
          )}

          {/* Description --- Ligne de séparation */}
          <div className="h-px bg-[#ddd] my-10 mx-[10px]"></div>

          {/* Espace --- Commentaires */}
          <section className="mx-[10px]">
            <h2>Vos commentaires ({comments.length})</h2>
            {comments.length > 0 ? (
              <div className="grid grid-cols-1">
                {comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className={`rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${
                      selectedTheme === "sombre" ? "bg-[#374151] border border-[#4B5563]" : "border border-[#E5E7EB]"
                    }`}
                  >
                    <p className={`leading-relaxed ${
                      selectedTheme === "sombre" ? "text-[#E5E7EB]" : "text-[#1F2937]"
                    }`}>
                      {comment.contenu}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className={`text-sm ${
                        selectedTheme === "sombre" ? "text-[#9CA3AF]" : "text-[#6B7280]"
                      }`}>
                        Posté le {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <div className="mb-4">
</div>
                      {comment.recette && (
  <Link 
    href={`/articles/${comment.recette.id}`} 
    className={`text-sm font-medium transition-colors ${
      selectedTheme === "sombre" 
        ? "text-[#f4a887] hover:text-[#e8976f]" 
        : "text-[#f4a887] hover:text-[#e8976f]"
    }`}
  >
    Voir la recette: {comment.recette.nom} →
  </Link>
)}
                    </div>
                    {/* Bouton pour supprimer le commentaire depuis le compte */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className={`text-sm rounded transition-colors ${
                          selectedTheme === "sombre"
                            ? "text-[#F87171] hover:bg-[#F87171] hover:text-white"
                            : "text-[#EF4444] hover:bg-[#EF4444] hover:text-white"
                        }`}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] mx-[10px] ${
                selectedTheme === "sombre" ? "bg-[#374151] text-[#9CA3AF]" : "bg-[#F9FAFB] text-[#6B7280]"
              }`}>
                <p>Vous n'avez pas encore publié de commentaires</p>
                <p>Vos commentaires apparaîtront ici après avoir partagé votre avis sur des recettes.</p>
              </div>
            )}
          </section>

          {/* Section --- Recettes publiées */}
          <section className="mx-[10px]">
            <div className="flex justify-between items-center">
              <h2>Vos recettes publiées</h2>
              <button 
                className={primaryBtn} 
                onClick={() => setShowAddRecipeForm(true)}
              >
                Ajouter une recette
              </button>
            </div>

            {/* Espace --- Formulaire d'ajout de recette */}
            {showAddRecipeForm && (
              <div className={`rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] ${
                selectedTheme === "sombre" ? "bg-[#374151]" : "bg-white"}`}>
                <h3>Nouvelle recette</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nom de la recette"
                    value={newRecipe.nom}
                    onChange={(e) => setNewRecipe({...newRecipe, nom: e.target.value})}
                    className="border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Temps de préparation (min)"
                    value={newRecipe.temps_preparation}
                    onChange={(e) => setNewRecipe({...newRecipe, temps_preparation: e.target.value})}
                    className="border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                  />
                  <select
                    value={newRecipe.categorie}
                    onChange={(e) => setNewRecipe({...newRecipe, categorie: e.target.value})}
                    className="border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
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
                  
                  {/*champ pour la fete*/}
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

                  {/* AJOUT: Champ pour l'origine */}
                  <select
                    value={newRecipe.origine}
                    onChange={(e) => setNewRecipe({...newRecipe, origine: e.target.value})}
                    className="px-4 py-2 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                  >
                    {/*fix : bien faire attention a ce que ca corresponde a ce qu'on a dans la bdd*/}
                    <option value="">Origine</option>
                    <option value="française">Français</option>
                    <option value="japonaise">Japonais</option>
                    <option value="italienne">Italien</option>
                    <option value="indienne">Indien</option>
                  </select>

                  {/* Champ pour l'image */}
                  <div className="md:col-span-2">
                    <label className="block text-base font-medium">
                      Image de la recette
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewRecipe({
                        ...newRecipe, 
                        image: e.target.files?.[0] || null
                      })}
                      className="w-full border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                    />
                    {newRecipe.image && (
                      <p>
                        Image sélectionnée : {newRecipe.image.name}
                      </p>
                    )}
                  </div>

                  <textarea
                    placeholder="Ingrédients"
                    value={newRecipe.ingredient}
                    onChange={(e) => setNewRecipe({...newRecipe, ingredient: e.target.value})}
                    className="border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none md:col-span-2"
                    rows={3}
                  />
                  <textarea
                    placeholder="Préparation"
                    value={newRecipe.preparation}
                    onChange={(e) => setNewRecipe({...newRecipe, preparation: e.target.value})}
                    className="border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none md:col-span-2"
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
              <div className={`rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] mb-6 transition-colors duration-300 ${
                selectedTheme === "sombre" ? "bg-[#374151]" : "bg-white"}`}>                
                
                <h3>Modifier la recette</h3>
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
                    className="border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                  />
                  <select
                    value={editingRecipe.categorie}
                    onChange={(e) => setEditingRecipe({...editingRecipe, categorie: e.target.value})}
                    className="border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
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
                    className="border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                  >
                    <option value="faible">Facile</option>
                    <option value="modéré">Moyen</option>
                    <option value="difficile">Difficile</option>
                  </select>
                  
                  {/* Champ pour la fête */}
                  <select
                    value={editingRecipe.fete}
                    onChange={(e) => setEditingRecipe({...editingRecipe, fete: e.target.value})}
                    className="border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                  >
                    <option value="">Fête associée</option>
                    <option value="Nouvel an">Nouvel an</option>
                    <option value="Noël">Noël</option>
                    <option value="Anniversaire">Anniversaire</option>
                    <option value="Pâques">Pâques</option>
                  </select>

                  {/* AJOUT: Champ pour l'origine */}
                  <select
                    value={editingRecipe.origine}
                    onChange={(e) => setEditingRecipe({...editingRecipe, origine: e.target.value})}
                    className="border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                  >
                    <option value="">Origine</option>
                    <option value="française">Français</option>
                    <option value="japonaise">Japonais</option>
                    <option value="italienne">Italien</option>
                    <option value="indienne">Indien</option>
                  </select>

                  {/* Champ pour l'image */}
                  <div className="md:col-span-2">
                    <label className="block text-base font-medium mb-2">
                      Image de la recette
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditingRecipe({
                        ...editingRecipe, 
                        image: e.target.files?.[0] || null
                      })}
                      className="w-full px-4 py-2 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none"
                    />
                    {editingRecipe.image ? (
                      <p className="text-sm mt-2">
                        Nouvelle image sélectionnée : {editingRecipe.image.name}
                      </p>
                    ) : editingRecipe.images ? (
                      <p className="text-sm mt-2">
                        Image actuelle conservée
                      </p>
                    ) : (
                      <p className="text-sm mt-2">
                        Aucune image actuelle
                      </p>
                    )}
                  </div>

                  <textarea
                    placeholder="Ingrédients"
                    value={editingRecipe.ingredient}
                    onChange={(e) => setEditingRecipe({...editingRecipe, ingredient: e.target.value})}
                    className="border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none md:col-span-2"
                    rows={3}
                  />
                  <textarea
                    placeholder="Préparation"
                    value={editingRecipe.preparation}
                    onChange={(e) => setEditingRecipe({...editingRecipe, preparation: e.target.value})}
                    className="border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none md:col-span-2"
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

            {/* Liste des recettes */}
            {publishedRecipes.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
                {publishedRecipes.map((recipe) => (
                  <div key={recipe.id} className="p-6 rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] text-center mx-[5px] my-[5px]">
                    {/* Image de la recette */}
                    <div className="bg-[#FFFFFF] h-[140px] mb-4">
                      {recipe.images ? (
                        <img 
                          src={recipe.images} 
                          alt={recipe.nom}
                          className="w-full h-full object-cover rounded-[5px]"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#FFFFFF] to-[#EEEEEE] flex items-center justify-center">
                          <span className="italic">Pas d'image</span>
                        </div>
                      )}
                    </div>
                    
                    <h3>{recipe.nom}</h3>
                    <p>
                      Temps : {recipe.temps_preparation} min
                    </p>
                    <p>
                      Difficulté : {recipe.difficulte}
                    </p>
                  

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
              <div className="text-center py-12 rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] mx-[10px]">
                <p>Aucune recette publiée</p>
              </div>
            )}
          </section>

          {/* Recettes enregistrées */}
          <section className="mb-10 mx-[10px]">
            <h2>Vos recettes enregistrées</h2>
            
            <div className="my-12 mx-auto grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-8 items-start w-[calc(100%-80px)] max-w-[1100px] box-border justify-items-center">
            {savedRecipes.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
                {savedRecipes.map((savedRecipe) => (
                  <div key={savedRecipe.id} className="p-6 rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] text-center mx-[5px] my-[5px]">
                    {/* Image de la recette */}
                    <div className={`h-[140px] transition-colors duration-300 bg-[#FFFFFF]}`}>
                      {savedRecipe.recette.images ? (
                        <img 
                          src={savedRecipe.recette.images} 
                          alt={savedRecipe.recette.nom}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br flex items-center justify-center transition-colors duration-300 from-[#FFFFFF] to-[#EEEEEE]}`}>
                      <span className={`italic text-[#6B7280]"}`}>
                        Pas d'image</span>
                    </div>
                      )}
                    </div>
                    
                    <h3>{savedRecipe.recette.nom}</h3>
                    <p>
                      Temps : {savedRecipe.recette.temps_preparation} min
                    </p>
                    <p>
                      Difficulté : {savedRecipe.recette.difficulte}
                    </p>
                    <p>
                      Enregistrée le : {new Date(savedRecipe.created_at).toLocaleDateString('fr-FR')}
                    </p>
                    
                    <Link 
                      href={`/articles/${savedRecipe.recette.id}`}
                      className="inline-block mt-4 text-[13px] text-[#f4a887] no-underline hover:underline"
                    >
                      Voir la recette →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] mx-[10px]">
                <p>Aucune recette enregistrée</p>
              </div>
            )}
            </div>
          </section>
        

          {/* Supprimer le compte */}
          <section className="mb-8 mx-[10px] my-[10px]">
            <h2>Supprimer mon compte</h2>

              <div className={`p-6 rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] mx-[5px] my-[5px] transition-colors duration-300 ${
                selectedTheme === "sombre" ? "bg-[#374151] text-white" : "bg-white"}`}>              
              <h3>Supprimer ?</h3>
              <div className="flex gap-5 mb-5">
                <label className="flex items-center mx-[5px]">
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
                <label className="flex items-center mx-[5px]">
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

              <h3>Êtes-vous sûr ?</h3>
              <p>
                Réécrire la phrase suivante : <br />
                <em className="italic">Je veux supprimer mon compte</em>
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