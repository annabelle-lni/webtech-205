export default function creerCompte() {
  return (

    <div className="Page création compte">
    {/* Section principale */}
      <main className="main-content" style ={{ marginTop: "130px" }}> {/* On décale le main pour pas qu'il soit caché par le header qui est maintenant fixé */}
        {/* Introduction */}

        <h2 className="titre"><em><strong>Création de compte</strong></em></h2>
        <p className="subtitle"><em>Heureux que vous rejoigniez la team cooking !</em>
        <br></br>
        <u>Veuillez remplir les informations suivantes</u> :</p>


        <form className="creationcompte-form"> {/* toutes les infos requises pour la création du compte */}

            <p style={{ textAlign: "left", margin: 0 }}>Votre civilité : </p> {/* menu déroulant pour la civilité de la personne */}
            <select id="choix_civilite" className="creationcompte-form" required>
                <option value="1">M.</option>
                <option value="2">Mme</option>
                <option value="3">Ne pas renseigner</option>
           </select>

            <p style={{ textAlign: "left", margin: 0 }}>Votre prénom : </p>
            <input type="prenom" required />

            <p style={{ textAlign: "left", margin: 0 }}>Votre nom : </p>
            <input type="nom" required />

            <p style={{ textAlign: "left", margin: 0 }}>Votre mail : </p>
            <input type="mail" required />
            
            <p style={{ textAlign: "left", margin: 0 }}>Votre mot de passe : </p>
            <input type="password" required /> {/* développer une politique de mdp */}

            <p style={{ textAlign: "left", margin: 0, fontStyle: "italic", fontSize: "0.9em" }}>Les informations reccuillies sur ce formulaire sont strictement confidentielles et ne seront partagées à des fins commerciales. </p>
            <button type="button" className="login-button">Créer le compte compte</button>

        </form>
      </main>
    </div>
    
    
  );
}