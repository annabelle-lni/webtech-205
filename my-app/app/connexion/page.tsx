"use client";

import { supabase } from "@/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Connexion() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    // Redirection après login
    router.push("/");
  }

  return (
    <div className="Page connexion">
      <main className="main-content" style={{ marginTop: "130px" }}>
        <h2 className="titre"><strong>Se connecter</strong></h2>
        <p className="subtitle"><em>Heureux de vous revoir !</em></p>

        <form className="connexion-form" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Entrez votre mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

          <div className="button-container">
            <Link href="/newcompte">
              <button type="button" className="left-button">Créer un compte</button>
            </Link>

            <button type="submit" className="right-button">Se connecter</button>
          </div>
        </form>
      </main>
    </div>
  );
}
