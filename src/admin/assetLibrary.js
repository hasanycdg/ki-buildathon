export const LEARNING_ASSETS = [
  {
    id: "coffee-machine", name: "Kaffeemaschine", category: "Frühstück", scene: "buffet",
    keywords: ["kaffee", "kaffeemaschine", "vollautomat", "bohnen", "trester", "brühgruppe"],
    visual: "/assets/learning-objects/coffee-machine/closed.png",
    states: {
      closed: "/assets/learning-objects/coffee-machine/closed.png",
      open: "/assets/learning-objects/coffee-machine/open.png",
      clean: "/assets/learning-objects/coffee-machine/closed.png"
    },
    actions: ["ausschalten", "serviceklappe öffnen", "tresterbehälter herausziehen", "abtropfschale entnehmen", "reinigen", "wieder schließen"]
  },
  { id: "breakfast-buffet", name: "Frühstücksbuffet", category: "Frühstück", scene: "buffet", keywords: ["buffet", "frühstück"], actions: ["kontrollieren", "auffüllen", "beschriften"] },
  { id: "juice-dispenser", name: "Saftspender", category: "Frühstück", scene: "buffet", keywords: ["saft", "spender"], actions: ["öffnen", "auffüllen", "reinigen"] },
  { id: "dishwasher", name: "Spülmaschine", category: "Frühstück", scene: "buffet", keywords: ["spülmaschine", "geschirr"], actions: ["beladen", "starten", "entleeren"] },
  { id: "toaster", name: "Toaster", category: "Frühstück", scene: "buffet", keywords: ["toaster", "toast"], actions: ["ausschalten", "krümelschublade öffnen", "reinigen"] },
  { id: "hotel-bed", name: "Hotelbett", category: "Zimmer", scene: "room", keywords: ["bett", "bettwäsche", "matratze"], actions: ["abziehen", "beziehen", "glattziehen", "kontrollieren"] },
  { id: "linen-cart", name: "Wäschewagen", category: "Zimmer", scene: "room", keywords: ["wäschewagen", "reinigungswagen"], actions: ["bestücken", "sortieren", "abschließen"] },
  { id: "minibar", name: "Minibar", category: "Zimmer", scene: "room", keywords: ["minibar", "kühlschrank"], actions: ["öffnen", "prüfen", "auffüllen", "schließen"] },
  { id: "safe", name: "Zimmersafe", category: "Zimmer", scene: "room", keywords: ["safe", "tresor"], actions: ["öffnen", "prüfen", "zurücksetzen"] },
  { id: "vacuum", name: "Staubsauger", category: "Reinigung", scene: "room", keywords: ["staubsauger", "saugen"], actions: ["vorbereiten", "saugen", "filter leeren"] },
  { id: "mop-bucket", name: "Wischsystem", category: "Reinigung", scene: "room", keywords: ["mopp", "eimer", "wischen"], actions: ["dosieren", "auswringen", "wischen"] },
  { id: "cleaning-bottle", name: "Reinigungsmittel", category: "Reinigung", scene: "bath", keywords: ["reiniger", "sprühflasche"], actions: ["prüfen", "dosieren", "anwenden"] },
  { id: "bathroom-sink", name: "Waschbecken", category: "Bad", scene: "bath", keywords: ["waschbecken", "armatur"], actions: ["einsprühen", "wischen", "polieren"] },
  { id: "shower", name: "Dusche", category: "Bad", scene: "bath", keywords: ["dusche", "duschwand"], actions: ["einsprühen", "abziehen", "kontrollieren"] },
  { id: "toilet", name: "Toilette", category: "Bad", scene: "bath", keywords: ["toilette", "wc"], actions: ["reinigen", "desinfizieren", "versiegeln"] },
  { id: "reception-terminal", name: "Rezeptions-PC", category: "Rezeption", scene: "reception", keywords: ["computer", "rezeption", "check-in"], actions: ["anmelden", "gast suchen", "buchung öffnen"] },
  { id: "key-card", name: "Zimmerkarte", category: "Rezeption", scene: "reception", keywords: ["zimmerkarte", "schlüsselkarte"], actions: ["codieren", "prüfen", "übergeben"] },
  { id: "payment-terminal", name: "Kartenterminal", category: "Rezeption", scene: "reception", keywords: ["kartenterminal", "bezahlen"], actions: ["betrag prüfen", "zahlung starten", "beleg ausgeben"] },
  { id: "luggage-cart", name: "Gepäckwagen", category: "Rezeption", scene: "reception", keywords: ["gepäck", "koffer"], actions: ["beladen", "sichern", "transportieren"] },
  { id: "fire-extinguisher", name: "Feuerlöscher", category: "Sicherheit", scene: "reception", keywords: ["feuerlöscher", "brand"], actions: ["sicherung ziehen", "zielen", "löschen"] },
  { id: "wet-floor-sign", name: "Warnschild", category: "Sicherheit", scene: "room", keywords: ["warnschild", "rutschgefahr"], actions: ["aufstellen", "sichtbarkeit prüfen", "entfernen"] },
  { id: "first-aid-kit", name: "Erste-Hilfe-Koffer", category: "Sicherheit", scene: "reception", keywords: ["erste hilfe", "verband"], actions: ["öffnen", "material wählen", "bestand prüfen"] }
];

export function findAssetsForDescription(description = "") {
  const value = description.toLocaleLowerCase("de");
  const matches = LEARNING_ASSETS.filter((asset) => asset.keywords.some((keyword) => value.includes(keyword)));
  return matches.length ? matches.slice(0, 4) : [LEARNING_ASSETS.find((asset) => asset.id === "hotel-bed")];
}

export function getAsset(id) {
  return LEARNING_ASSETS.find((asset) => asset.id === id);
}

export function getAssetVisual(id, state = "closed") {
  const asset = getAsset(id);
  return asset?.states?.[state] || asset?.visual || null;
}

export const ASSET_PROMPT_CATALOG = LEARNING_ASSETS.map(({ id, name, scene, actions }) => ({ id, name, scene, actions }));
