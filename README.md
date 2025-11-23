![Bannière](./my-app/public/banniere-plat.png)

# Web technologie — Équipe 205


## Introduction

Bienvenue dans le projet **Web technologie - Équipe 205** !  
Ce dépôt regroupe notre travail collaboratif autour du développement web de notre siteweb "COOKING.COM".  
Notre objectif : créer un siteweb qui contiendrait un ensemble de recettes allant du salé au sucré.

---

## Pile Technologique 

* **Framework :** [Next.js 15] (App Router, Server Components).
* **Langage :** TypeScript.
* **Base de données et Authentification :** [Supabase] (PostgreSQL, Authentication, Storage).
* **Style :** [Tailwind CSS].

---

## Prérequis


| Outil            | Version recommandée |
|------------------|---------------------|
| Supabase         | ≥ 2.78.0            |
| Next             | ≥ 15.5.4            |
| Git              | ≥ 2.x               |
| Navigateur web   | Chrome / Firefox    |

---

## Instructions d’installation

```bash
# Clone le projet
git clone https://github.com/ton-utilisateur/web-technologie-equipe205.git

# Va dans le dossier
cd web-technologie-equipe205

# Installe les dépendances
npm install
```
---

## Variables d'environnement

Le projet nécessite une connexion à Supabase pour fonctionner, les clées pour y avoir accès se trouvent dans le fichier .env.local.

---

## Instructions d’utilisation

```bash
# Va dans le dossier de l'application
cd my-app

# Lance le serveur local
npm run dev
```

Ensuite, ouvre ton navigateur à l’adresse suivante :
```
http://localhost:3000 : la page d'accueil
```

---

## Guide d'utilisation

1) Pour les visiteurs
Recherche des recettes existantes, filtrage par catégorie, période et origine. 

2) Pour les membres
S'inscrire ou se connecter à son compte. Publier modifier ou supprimer des recettes. Enregistrement de vos recettes préférées.

---

## Auto évaluation

### Points forts
Architecture distingué entre les composants serveurs et clients.
Utilisation des politiques RLS
Utilisation de Triger pour calculer des moyennes

### Piste d'amélioration
Intégrer une API externe 
Mise en place d'un système social entre les utilisateurs et les chefs

---

## 👥 Liste des contributeurs
   
| Prénom        | Nom          |  Mail                                |
|---------------|--------------|--------------------------------------|
| Pierre-Louis  | Charbonnier  | pierrelouis.charbonnier@edu.ece.fr   |
| Annabelle     | Leoni        | annabelle.leoni@edu.ece.fr           |
