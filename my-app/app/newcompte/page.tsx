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
  const [adresse, setAdresse] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          prenom,
          nom,
          adresse,
          phone,
          gender
        }
      }
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setSuccessMsg("Compte créé avec succès !");

    setTimeout(() => {
      router.push("/connexion");
    }, 1500);
  }

  return (
    <div className="Page creation-compte">
      <main className="main-content" style={{ marginTop: "130px" }}>
        <h2 className="titre"><strong>Création de compte</strong></h2>

        <form className="creationcompte-form" onSubmit={handleSignup}>

          <p>Prénom :</p>
          <input value={prenom} onChange={(e) => setPrenom(e.target.value)} required />

          <p>Nom :</p>
          <input value={nom} onChange={(e) => setNom(e.target.value)} required />

          <p>Email :</p>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <p>Mot de passe :</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <p>Adresse :</p>
          <input value={adresse} onChange={(e) => setAdresse(e.target.value)} />

          <p>Téléphone :</p>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />

          <p>Genre :</p>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">—</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
            <option value="Autre">Autre</option>
          </select>

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
