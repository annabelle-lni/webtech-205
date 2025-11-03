import path from 'path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Charger le .env.local à la racine du projet
const envPath = path.resolve(process.cwd(), '.env.local')
dotenv.config({ path: envPath })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variables Supabase manquantes (.env.local)')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function run() {
  console.log('🔗 Connexion Supabase réussie :', SUPABASE_URL)

  // Lecture de la table recettes
  const { data, error } = await supabase.from('recette').select('*').limit(5)

  if (error) {
    console.error('❌ Erreur lors de la lecture de la table :', error.message)
    return
  }

  if (data.length === 0) {
    console.warn('⚠️ Table vide. Utilise --insert pour ajouter des exemples.')
  } else {
    console.log('📋 Recettes trouvées :', data)
  }

  // Insertion d'exemples si option --insert
  if (process.argv.includes('--insert')) {
    const samples = [
      {
        nom: 'Crêpes sucrées',
        ingredient: 'farine, oeufs, lait, sucre, beurre',
        temps_preparation: 15,
        preparation: 'Mélanger tous les ingrédients puis cuire à la poêle.'
      },
      {
        nom: 'Gâteau au chocolat',
        ingredient: 'chocolat, beurre, oeufs, sucre, farine',
        temps_preparation: 45,
        preparation: 'Faire fondre le chocolat, mélanger puis enfourner 30 min à 180°C.'
      }
    ]

    const { error: insertError } = await supabase.from('recette').insert(samples)
    if (insertError) {
      console.error('❌ Erreur d’insertion :', insertError.message)
    } else {
      console.log('✅ Exemples insérés avec succès.')
    }
  }
}

run().catch((err) => console.error('Erreur inattendue :', err))
