"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import { useRouter } from "next/navigation";

type PageProps = {
  params: {
    recettes: string;
  };
};

export default function RecettePage({ params }: any) {
  const { recettes } = params;
  const router = useRouter();
  
  const [recetteData, setRecetteData] = useState<any>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // États pour les notes et commentaires
  const [userRating, setUserRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchData();
  }, [recettes]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer l'utilisateur connecté
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      // Récupération de la recette
      const { data: recette, error } = await supabase
        .from("recette")
        .select("*")
        .eq("id", recettes)
        .single();

      if (error || !recette) {
        console.error("Erreur Supabase :", error?.message);
        return;
      }

      setRecetteData(recette);

      // Récupération des photos
      const { data: photos } = await supabase
        .from("photo")
        .select("url_photo")
        .eq("id_recette", recettes)
        .limit(1);

      setPhotoUrl(photos && photos.length > 0 ? photos[0].url_photo : null);

      // Récupération des commentaires
      await fetchComments(recettes);
      
      // Récupération de la note de l'utilisateur s'il est connecté
      if (currentUser) {
        await fetchUserRating(currentUser.id, recettes);
      }

    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (recetteId: string) => {
    const { data: commentsData, error } = await supabase
      .from("commentaire")
      .select(`
        *,
        profiles:proprietaire_id (
          prenom,
          nom
        )
      `)
      .eq("id_recette", recetteId)
      .order("created_at", { ascending: false });

    if (!error && commentsData) {
      setComments(commentsData);
    }
  };

  const fetchUserRating = async (userId: string, recetteId: string) => {
    // Dans un système complet, vous auriez une table "notes" séparée
    // Pour l'instant, on utilise le champ "note" de la recette
    // Vous devrez adapter cette logique selon votre structure de base de données
    const { data: userNote } = await supabase
      .from("recette")
      .select("note")
      .eq("id", recetteId)
      .single();

    if (userNote && userNote.note) {
      setUserRating(userNote.note);
    }
  };

  const handleRating = async (rating: number) => {
    if (!user) {
      alert("Veuillez vous connecter pour noter cette recette");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Mettre à jour la note dans la recette
      // NOTE: Dans un système complet, vous devriez avoir une table "notes" séparée
      const { error } = await supabase
        .from("recette")
        .update({ note: rating })
        .eq("id", recettes);

      if (error) throw error;

      setUserRating(rating);
      
      // Recalculer la moyenne (simplifié)
      const newAverage = rating; // Dans un vrai système, vous calculeriez la moyenne de toutes les notes
      setAverageRating(newAverage);
      
      alert("Note enregistrée !");

    } catch (error: any) {
      console.error("Erreur lors de la notation:", error);
      alert("Erreur lors de l'enregistrement de la note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      alert("Veuillez vous connecter pour commenter cette recette");
      return;
    }

    if (!newComment.trim()) {
      alert("Veuillez écrire un commentaire");
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from("commentaire")
        .insert([
          {
            id_recette: recettes,
            proprietaire_id: user.id,
            contenu: newComment.trim(),
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      setNewComment("");
      await fetchComments(recettes); // Recharger les commentaires
      
      alert("Commentaire ajouté !");

    } catch (error: any) {
      console.error("Erreur lors de l'ajout du commentaire:", error);
      alert("Erreur lors de l'ajout du commentaire");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) return;

    try {
      const { error } = await supabase
        .from("commentaire")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      await fetchComments(recettes); // Recharger les commentaires
      alert("Commentaire supprimé !");

    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du commentaire");
    }
  };

  if (isLoading) {
    return (
      <div className="my-[30px] min-h-screen">
        <main className="flex-1 text-left mx-[10%] my-10 bg-[#FFFCEE] flex flex-col items-center justify-center pb-[60px] rounded-[20px] mt-32">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f4a887] mx-auto"></div>
            <p className="mt-4 text-[#555]">Chargement de la recette...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!recetteData) {
    return (
      <div className="my-[30px] min-h-screen">
        <main className="flex-1 text-left mx-[10%] my-10 bg-[#FFFCEE] flex flex-col items-center justify-center pb-[60px] rounded-[20px] mt-32">
          <p className="text-lg text-[#555]">Recette non trouvée</p>
        </main>
      </div>
    );
  }

  return (
    <div className="my-[30px] min-h-screen">
      <main className="flex-1 text-left mx-[10%] my-10 bg-[#FFFCEE] flex flex-col pb-[60px] rounded-[20px] mt-32">
        
        {/* Titre centré */}
        <h1 className="text-[22px] font-bold mt-8 pt-8 mb-8 text-center">
          {recetteData.nom}
        </h1>

        {/* Container principal avec sidebar pour l'image */}
        <div className="flex flex-col lg:flex-row gap-8 px-8">
          
          {/* Sidebar pour l'image - visible à gauche sur grand écran */}
          <div className="lg:w-1/3 flex flex-col items-center">
            <div className="w-full max-w-[300px] bg-white rounded-lg shadow-md overflow-hidden">
              {photoUrl ? (
                <img 
                  src={photoUrl} 
                  alt={recetteData.nom}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                  <span className="text-gray-500">Image non disponible</span>
                </div>
              )}
            </div>
            
            {/* Section Notation */}
            <div className="mt-6 p-4 bg-white rounded-lg shadow-sm w-full max-w-[300px]">
              <h3 className="text-lg font-semibold text-center text-gray-800 mb-3">
                ⭐ Noter cette recette
              </h3>
              
              {/* Étoiles de notation */}
              <div className="flex justify-center space-x-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    disabled={isSubmitting}
                    className={`text-2xl ${
                      star <= userRating 
                        ? "text-yellow-500" 
                        : "text-gray-300"
                    } hover:text-yellow-400 transition-colors disabled:opacity-50`}
                  >
                    ★
                  </button>
                ))}
              </div>
              
              <p className="text-center text-sm text-gray-600">
                {userRating > 0 ? `Vous avez donné ${userRating}/5` : "Donnez votre avis"}
              </p>
            </div>

            {/* Informations temps de préparation */}
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm w-full max-w-[300px]">
              <p className="text-lg font-semibold text-center text-gray-800">
                ⏱️ Temps de préparation :{" "}
                <span className="text-[#f4a887] font-bold">
                  {recetteData.temps_preparation} minutes
                </span>
              </p>
            </div>

            {/* Note moyenne */}
            {averageRating > 0 && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow-sm w-full max-w-[300px]">
                <p className="text-lg font-semibold text-center text-gray-800">
                  📊 Note moyenne :{" "}
                  <span className="text-[#f4a887] font-bold">
                    {averageRating}/5
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Contenu principal de la recette */}
          <div className="lg:w-2/3 space-y-8">
            
            {/* Section Ingrédients */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f4a887]">
                🛒 Ingrédients
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {recetteData.ingredient}
              </div>
            </section>

            {/* Section Préparation */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f4a887]">
                👨‍🍳 Préparation
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {recetteData.preparation}
              </div>
            </section>

            {/* Section Commentaires */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#f4a887]">
                💬 Commentaires ({comments.length})
              </h2>
              
              {/* Formulaire d'ajout de commentaire */}
              {user && (
                <div className="mb-6">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Partagez votre avis sur cette recette..."
                    className="w-full px-4 py-3 border-2 border-[#e2e8f0] rounded-[6px] focus:border-[#f4a887] focus:outline-none resize-none"
                    rows={4}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={isSubmitting || !newComment.trim()}
                    className="mt-3 px-6 py-2 bg-[#f4a887] text-[#333] rounded-[5px] hover:bg-[#FFFCEE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Publication..." : "Publier le commentaire"}
                  </button>
                </div>
              )}

              {/* Liste des commentaires */}
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {comment.profiles?.prenom} {comment.profiles?.nom}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        {user && user.id === comment.proprietaire_id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700">{comment.contenu}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Aucun commentaire pour le moment. Soyez le premier à commenter !
                  </p>
                )}
              </div>

              {/* Message si non connecté */}
              {!user && (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-2">
                    Connectez-vous pour ajouter un commentaire
                  </p>
                  <button
                    onClick={() => router.push("/connexion")}
                    className="px-4 py-2 bg-[#f4a887] text-[#333] rounded-[5px] hover:bg-[#FFFCEE] transition-colors"
                  >
                    Se connecter
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}