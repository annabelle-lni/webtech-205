import Link from 'next/link';


export default function connexion() {
  return (

    <div className="Page connexion">
    {/* Section principale */}
      <main className="main-content">
        {/* Connexion au compte */}

          <h2 className="titre"><em><strong>Se connecter</strong></em></h2>
          <p className="subtitle"><em>Heureux de vous revoir !</em></p>

          <form className="connexion-form">
            <input type="email" placeholder="Entrez votre mail" required />
            <input type="password" placeholder="Entrez votre mot de passe" required />

          <div className="button-container">
            <Link href="/newcompte"><button type="button" className="left-button">Créer un compte</button></Link>

            <button type="submit" className="right-button">Se connecter</button>
          </div>
          </form>


      </main>
    </div>
    
    
  );
}