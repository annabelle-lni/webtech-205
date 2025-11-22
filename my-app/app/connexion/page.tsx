import Link from 'next/link';


export default function connexion() {
  return (
    <div className=" my-[30px] min-h-screen">
      {/* Main content avec les mêmes styles que .main-content */}
      <main className="flex-1 text-left mx-[10%] my-10 bg-[#FFFCEE] flex flex-col items-center text-center gap-2 pb-[60px] rounded-[20px] mt-32">
        
        {/* Titre avec les mêmes styles que .titre */}
        <h2 className="text-[22px] font-bold mt-8 pt-8 mb-0">
          <strong>Se connecter</strong>
        </h2>

        {/* Sous-titre avec les mêmes styles que .subtitle */}
        <p className="text-[#555] py-5 w-4/5 text-center leading-relaxed text-lg mb-4 italic">
          <em>Heureux de vous revoir !</em>
        </p>

        {/* Formulaire avec les mêmes styles que .connexion-form */}
        <form 
          className=" my-[10px] flex flex-col gap-4 w-[300px]" 
          onSubmit={handleLogin}
        >
          {/* Input avec les mêmes styles que .connexion-form input */}
          <input
            type="email"
            placeholder="Entrez votre mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="my-[20px] px-[0.7rem] py-[0.7rem] text-base border border-[#ccc] rounded-[3px]"
            required
          />

          <input
            type="password"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-[0.7rem] py-[0.7rem] text-base border border-[#ccc] rounded-[3px]"
            required
          />

          {/* Message d'erreur */}
          {errorMsg && <p className="text-red-500">{errorMsg}</p>}

          {/* Container boutons avec les mêmes styles que .button-container */}
          <div className="my-[30px] flex justify-between mt-4">
            {/* Bouton Créer un compte avec les mêmes styles que .left-button */}
            <Link href="/newcompte">
              <button 
                type="button" 
                className="px-[1.2rem] py-[0.7rem] bg-[#f4a887] text-black border-none rounded-[3px] text-base cursor-pointer hover:bg-[#FFFCEE]"
              >
                Créer un compte
              </button>
            </Link>

            {/* Lien Se connecter */}
            <Link 
              href="/moncompte" 
              className="px-[1.2rem] py-[0.7rem] bg-[#f4a887] text-black border-none rounded-[3px] text-base cursor-pointer hover:bg-[#FFFCEE] no-underline flex items-center"
            >
              Se connecter
            </Link>
          </div>
          </form>


      </main>
    </div>
    
  );
}