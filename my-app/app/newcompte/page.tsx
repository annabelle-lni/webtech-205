"use client";

import { supabase } from "@/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreerCompte() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    //Création du compte dans Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          prenom,
          nom,
        }
      }
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setSuccessMsg("Compte créé ! Vérifiez vos emails.");
    
    // Redirection vers /connexion après 2 sec
    setTimeout(() => {
      router.push("/connexion");
    }, 2000);
  }

  return (
    <div className="Page creation-compte">
      <main className="main-content" style={{ marginTop: "130px" }}>
        <h2 className="titre">
          <em><strong>Création de compte</strong></em>
        </h2>
        <p className="subtitle">
          Heureux que vous rejoigniez la team cooking !  
          <br />
          <u>Veuillez remplir les informations suivantes</u> :
        </p>

        <form className="creationcompte-form" onSubmit={handleSignup}>

          <p style={{ textAlign: "left", margin: 0 }}>Prénom :</p>
          <input value={prenom} onChange={(e) => setPrenom(e.target.value)} required />

          <p style={{ textAlign: "left", margin: 0 }}>Nom :</p>
          <input value={nom} onChange={(e) => setNom(e.target.value)} required />

          <p style={{ textAlign: "left", margin: 0 }}>Email :</p>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <p style={{ textAlign: "left", margin: 0 }}>Mot de passe :</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {/* Affichage des messages */}
          {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
          {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}

          <button type="submit" className="login-button">
            Créer le compte
          </button>
        </form>
      </main>
    </div>
  );
}
