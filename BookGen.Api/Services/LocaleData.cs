namespace BookGen.Api.Services;

public class LocaleData
{
    public LocalePack GetRegion(string region)
    {
        return region.ToLowerInvariant() switch
        {
            "fr" or "fr-fr" or "france" => Fr,
            "tr" or "tr-tr" or "turkiye" or "turkey" => Tr,
            _ => En
        };
    }

    public readonly LocalePack En = new(
        FirstNames: new() { "John","Mary","Alex","Lily","Noah","Emma","James","Olivia","Ethan","Ava","Mason","Sophia","Henry","Mia","Lucas","Charlotte","Daniel","Amelia","Samuel","Harper","Leo","Eleanor","Jack","Scarlett" },
        LastNames:  new() { "Smith","Johnson","Taylor","Clark","Baker","Hughes","Miller","Davis","Anderson","Parker","Moore","Hernandez","Lee","Walker","Young","King","Wright","Hill","Green" },
        Publishers: new() { "Roebuck Press","Harbor & Co.","Lang–Hahn","Little & Lowe","Midnight House","Bluefin Books","Cedar & Pine","Northbridge" },
        Nouns:      new() { "Dreams","Rivers","Secrets","Cities","Hearts","Skies","Stars","Echoes","Journeys","Mirrors","Trains","Tides","Fireflies","Maps" },
        Adj:        new() { "Silent","Hidden","Golden","Fading","Endless","Broken","Lonely","Waking","Midnight","Borrowed","Restless" },
        VerbsImperative: new() { "Chasing","Breaking","Finding","Remembering","Crossing","Leaving" },
        Connectors: new() { "of","in","beyond","under","through" },
        Places:     new() { "New York","the Valley","the Shore","Winterfield","Harbor Town","Silver Creek","Redwood" },
        Phrases:    new() { "Head In The Clouds","Feel Something","After Midnight","The Long Way Home","A Minor Miracle" },
        ReviewStarters: new() { "A captivating read.","Unexpectedly brilliant.","Beautifully written.","Sharp and moving.","Pitch-perfect pacing." },
        ReviewBodies:   new() { "Highly recommended.","Couldn’t put it down.","Characters felt alive.","The ending surprised me.","A haunting finale." }
    );

    // ---- Français (FR) richer ----
    public readonly LocalePack Fr = new(
        FirstNames: new() { "Julien","Camille","Léa","Antoine","Élise","Hugo","Chloé","Lucas","Manon","Clara","Nina","Guy","Marc","Amandine","Sophie","Baptiste","Paul","Élodie","Noé","Jeanne","Théo","Maëlle","Romain","Lucie","Armand","Anaïs","Yasmine","Céleste" },
        LastNames:  new() { "Dupont","Martin","Lefèvre","Moreau","Rousseau","Garnier","Robin","Noël","Fabre","Faure","Briand","Vernes","Durand","Bernard","Petit","Robert","Richard","Simon","Leroy","Girard","Renard","Bonnet" },
        Publishers: new() { "Éditions Lavrous","Presses de la Rive","Gallard & Cie","Maison du Quai","Éditions Montparnasse","Clair-Obscur","Atelier du Livre" },
        Nouns:      new() { "été","mer","souvenirs","ville","secrets","roses","ombre","rêves","rivage","chemin","orages","étoiles","silence" },
        Adj:        new() { "grand","bleu","silencieux","caché","éternel","fragile","lointain","brisé","doux" },
        VerbsImperative: new() { "Chercher","Retrouver","Briser","Suivre","Oser","Rêver" },
        Connectors: new() { "de","dans","au-delà de","sous","près de" },
        Places:     new() { "Paris","Marseille","Lyon","Bordeaux","la Provence","la forêt","la Rive Gauche","Annecy" },
        Phrases:    new() { "La librairie des livres interdits","Il suffit parfois d'un été","Le grand arbre","Les heures pâles","Au bord des saisons" },
        ReviewStarters: new() { "Un livre envoûtant.","Surprenant et sensible.","Écriture élégante.","Un beau roman.","Une voix singulière." },
        ReviewBodies:   new() { "Je le recommande vivement.","Difficile à lâcher.","Des personnages vivants.","Une fin inattendue.","Une atmosphère inoubliable." }
    );

    // ---- Türkçe (TR) richer ----
    public readonly LocalePack Tr = new(
        FirstNames: new() { "Ahmet","Ayşe","Mehmet","Elif","Can","Zeynep","Burak","Ece","Mert","Selin","Hakan","Deniz","Cem","Buse","İrem","Emre","Melis","Onur","Gökhan","Naz","Seda","Barış","Pelin","Tuna" },
        LastNames:  new() { "Yılmaz","Demir","Kaya","Çelik","Şahin","Eren","Koç","Aydın","Öztürk","Arslan","Yıldız","Kurt","Polat","Bozkurt","Güneş","Aksoy" },
        Publishers: new() { "Derya Yayınları","Güverte Kitap","Anka Basım","Günebakan","Sahil Yayın","Kum Saati","Lal Kitabevi" },
        Nouns:      new() { "rüya","şehir","yol","sır","gölge","deniz","yıldız","iz","rüzgâr","zaman" },
        Adj:        new() { "sessiz","gizli","sonsuz","kırık","mavi","yalnız","solgun","derin" },
        VerbsImperative: new() { "Bulmak","Kırmak","Aramak","Hatırlamak","Geçmek","Uyanmak" },
        Connectors: new() { "ile","üzerine","altında","ötesinde","boyunca" },
        Places:     new() { "İstanbul","Ankara","İzmir","Karadeniz","Kapadokya","Beyoğlu","Gölyazı","Mardin" },
        Phrases:    new() { "Gece Yarısından Sonra","Rüzgârın Arasında","Yolun Sonu","Kayan Işıklar","Kıyıda Kalanlar" },
        ReviewStarters: new() { "Sürükleyici bir roman.","Duygusal ve etkileyici.","Akıcı bir dil.","Harika bir hikâye.","Sarsıcı bir anlatım." },
        ReviewBodies:   new() { "Kesinlikle tavsiye ederim.","Elden bırakılmıyor.","Karakterler çok canlı.","Finali şaşırtıcı.","Atmosferine hayran kaldım." }
    );
}

public record LocalePack(
    List<string> FirstNames,
    List<string> LastNames,
    List<string> Publishers,
    List<string> Nouns,
    List<string> Adj,
    List<string> VerbsImperative,
    List<string> Connectors,
    List<string> Places,
    List<string> Phrases,
    List<string> ReviewStarters,
    List<string> ReviewBodies
);