const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
// Pour ce script admin, idéalement vous utiliseriez le SERVICE_ROLE_KEY
// Mais on va utiliser la clé anonyme car c'est ce qu'on a configuré dans le RLS (auth users can insert)
const supabaseKey = process.env.SUPABASE_ANON_KEY; 

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Les clés Supabase sont introuvables dans le fichier .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log("\n🎵 --- MBOATUNE: UPLOAD DE MUSIQUE --- 🎵\n");

  try {
    // 1. Demander les infos
    const title = await question("Titre de la chanson : ");
    const artistName = await question("Nom de l'artiste : ");
    const filePath = await question("Chemin absolu vers le fichier .mp3 local : ");

    if (!fs.existsSync(filePath)) {
      throw new Error(`Le fichier n'existe pas : ${filePath}`);
    }

    console.log("\n⏳ Upload en cours...");

    // 2. Créer ou récupérer l'artiste
    let artistId;
    const { data: artists } = await supabase.from('artists').select('id').eq('name', artistName).limit(1);
    
    if (artists && artists.length > 0) {
      artistId = artists[0].id;
      console.log(`✅ Artiste existant trouvé (ID: ${artistId})`);
    } else {
      const { data: newArtist, error: artistErr } = await supabase.from('artists').insert({ name: artistName }).select().single();
      if (artistErr) throw new Error("Erreur création artiste : " + artistErr.message);
      artistId = newArtist.id;
      console.log(`✅ Nouvel artiste créé (ID: ${artistId})`);
    }

    // 3. Uploader le fichier sur Supabase Storage
    const fileName = `${Date.now()}_${path.basename(filePath).replace(/\s+/g, '_')}`;
    const fileBuffer = fs.readFileSync(filePath);
    
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('media')
      .upload(`music/${fileName}`, fileBuffer, {
        contentType: 'audio/mpeg',
        upsert: false
      });

    if (uploadErr) throw new Error("Erreur upload Storage : " + uploadErr.message);
    
    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(`music/${fileName}`);
    console.log(`✅ Fichier uploadé avec succès: ${publicUrl}`);

    // 4. Ajouter la chanson dans la table tracks
    const { data: trackData, error: trackErr } = await supabase.from('tracks').insert({
      title: title,
      artist_id: artistId,
      duration_ms: 180000, // Durée factice de 3 minutes pour l'exemple
      file_path: publicUrl,
      is_public: true
    }).select().single();

    if (trackErr) throw new Error("Erreur ajout chanson : " + trackErr.message);

    console.log(`\n🎉 SUCCÈS ! La chanson "${title}" a été ajoutée à l'application.`);
    console.log(`   ID de la track: ${trackData.id}`);

  } catch (error) {
    console.error(`\n❌ ERREUR: ${error.message}`);
  } finally {
    rl.close();
  }
}

// Note: Pour que ce script fonctionne avec la clé anonyme, 
// l'utilisateur doit être connecté. 
// Autrement, veuillez utiliser votre SERVICE_ROLE_KEY de Supabase.

main();
