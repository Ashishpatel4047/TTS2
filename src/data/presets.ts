import { VoiceOption, DialoguePreset } from '../types';

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'Charon',
    name: 'Charon',
    description: 'Deep, resonant, ancient & solemn baritone with gravity.',
    pitch: 'Very Deep',
    gender: 'Male',
    archetype: 'Elderly Time Guardian',
    badge: 'Best Match for Reference'
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    description: 'Menacing, gravelly, rough & intensely authoritative.',
    pitch: 'Deep / Rugged',
    gender: 'Male',
    archetype: 'Imposing Antagonist'
  },
  {
    id: 'Puck',
    name: 'Puck',
    description: 'Raspy, eerie, dynamic, textured & theatrical.',
    pitch: 'Mid / Textural',
    gender: 'Male',
    archetype: 'Mystic Oracle'
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    description: 'Balanced, steady, smooth, measured cinematic tone.',
    pitch: 'Neutral',
    gender: 'Balanced',
    archetype: 'Cosmic Narrator'
  },
  {
    id: 'Kore',
    name: 'Kore',
    description: 'Mysterious, poignant, somber & lingering atmosphere.',
    pitch: 'Warm',
    gender: 'Female',
    archetype: 'Fate Weaver'
  }
];

export const STYLE_DIRECTING_PRESETS = [
  {
    id: 'reference-raspy',
    label: 'Ancient Timekeeper (Reference)',
    prompt: 'Speak in a deep, ancient, raspy, dramatic cinematic voice with slow, heavy pauses and dark solemnity',
    tag: 'Reference Match'
  },
  {
    id: 'ominous-whisper',
    label: 'Ominous Raspy Whisper',
    prompt: 'Speak in an intimate, ominous, dry raspy whisper as if time is fading away',
    tag: 'Intimate'
  },
  {
    id: 'cinematic-trailer',
    label: 'Grand Cinematic Trailer',
    prompt: 'Deliver with massive cinematic gravity, slow thunderous resonance, and epic trailer intensity',
    tag: 'Blockbuster'
  },
  {
    id: 'weary-immortal',
    label: 'Weary Immortal Exhaustion',
    prompt: 'Speak with tired, weathered, heavy breaths like someone who has lived centuries too long',
    tag: 'Emotional'
  },
  {
    id: 'cold-menace',
    label: 'Cold Inevitable Doom',
    prompt: 'Speak with chilling calmness, slow calculating pace, and unyielding dark menace',
    tag: 'Villain'
  }
];

export const DIALOGUE_PRESETS: DialoguePreset[] = [
  {
    id: 'waqt-95-saal',
    title: 'Scene 1: Arlo L - Aakhri Saans (95 Saal)',
    category: 'Arlo L (95 Years Old)',
    hindi: 'मैंने 95 साल तक दुनिया के वक्त को रोका... लेकिन अब मेरा वक्त पूरा हो चुका है।',
    roman: 'Maine 95 saal tak duniya ke waqt ko roka... Lekin ab mera waqt poora ho chuka hai.',
    englishTranslation: 'For 95 years I held back the world’s time... But now, my time has come to an end.',
    suggestedVoice: 'Charon',
    suggestedStyle: 'Speak in a deep, ancient, raspy, dramatic cinematic voice with slow, heavy pauses and dark solemnity'
  },
  {
    id: 'vanguard-chief-strike',
    title: 'Scene 2: Vanguard Chief - 15 Din Ka Strike Order',
    category: 'Vanguard Task Force Chief',
    hindi: 'अटलांटिक बंकर ब्लास्ट होने से पहले एक पिंग लीक हुआ था... आर्लो एल ज़िंदा है! इंडिया के विजयवाड़ा के एक गांव में। 15 दिन के अंदर स्ट्राइक टीम असेंबल करो!',
    roman: 'Atlantic bunker blast hone se pehle ek ping leak hua tha... Arlo L zinda hai. India ke Vijayawada ke ek gaon mein. 15 din ke andar strike team assemble karo!',
    englishTranslation: 'A ping leaked before the Atlantic bunker detonated... Arlo L is alive! In a remote village in Vijayawada, India. Assemble the strike team within 15 days!',
    suggestedVoice: 'Fenrir',
    suggestedStyle: 'Speak with fierce, urgent military aggression, cold authority, and commanding grit'
  },
  {
    id: 'ace-system-pledge',
    title: 'Scene 3: ACE - Masterji Ka System',
    category: 'ACE / Kabir (Protege)',
    hindi: 'मास्टरजी चले गए... लेकिन उनका बनाया हुआ सिस्टम नहीं रुकेगा। 15 दिन... पूरा एम्पायर नई जगह शिफ्ट होगा।',
    roman: 'Masterji chale gaye... Lekin unka banaya hua system nahi rukega. 15 din... Poora empire nayi jagah shift hoga.',
    englishTranslation: 'Master has passed away... But the system he built will not stop. 15 days... The entire empire moves to a new realm.',
    suggestedVoice: 'Charon',
    suggestedStyle: 'Speak in a cold, emotionless, whisper-paced lethal resolve with absolute calm and dark depth'
  },
  {
    id: 'commander-trap-panic',
    title: 'Scene 4: Strike Commander - Yeh Trap Hai!',
    category: 'Breach Commander',
    hindi: 'सर, टारगेट यहां नहीं है! सेंटर टेबल पर सिर्फ एक मरी हुई चींटी, चॉकलेट और उल्टी घूमती रोलेक्स है... यह ट्रैप है! पीछे हटो!',
    roman: 'Sir, target yahan nahi hai! Center table par sirf ek dead red ant, chocolate aur ulti ghoomti Rolex hai... Yeh trap hai! Pull back!',
    englishTranslation: 'Sir, target is not here! On the center table there is only a dead red ant, chocolate and a reverse ticking Rolex... It is a trap! Pull back!',
    suggestedVoice: 'Fenrir',
    suggestedStyle: 'Deliver with frantic, breathless panic, shouting into a military comms radio amid impending doom'
  },
  {
    id: 'ace-trap-screen',
    title: 'Scene 5: ACE - 15 Din Pehle Waqt Badal Chuka Tha',
    category: 'ACE / Kabir (The Trap)',
    hindi: 'तुम एक 95 साल के बूढ़े को ढूंढने आए थे... लेकिन 15 दिन पहले ही वक्त बदल चुका है। खेल खत्म।',
    roman: 'Tum ek 95 saal ke budhe ko dhoondhne aaye the... Lekin 15 din pehle hi waqt badal chuka hai. Khel khatam.',
    englishTranslation: 'You came hunting a 95-year-old dying man... But fifteen days ago, time already shifted. Game over.',
    suggestedVoice: 'Puck',
    suggestedStyle: 'Speak in a chilling, dark, taunting, slow-motion whisper through an intercom speaker'
  },
  {
    id: 'ace-himalayan-takeover',
    title: 'Scene 6: Climax - Mera Shuru (Himalayan Base)',
    category: 'ACE / Kabir (The New Era)',
    hindi: 'आर्लो एल का शो खत्म हुआ... मेरा शुरू।',
    roman: 'Arlo L ka show khatam hua... Mera shuru.',
    englishTranslation: 'Arlo L’s reign has concluded... Mine begins.',
    suggestedVoice: 'Charon',
    suggestedStyle: 'Speak with cold calculated menace, sovereign dark authority, slow resonant baritone punch'
  },
  {
    id: 'arlo-three-symbols',
    title: 'Bonus Lore: Arlo L - Teen Nishaniyan',
    category: 'Arlo L (Flashback Lore)',
    hindi: 'लाल चींटी यानी खामोश सेना... चॉकलेट यानी दुनिया की लालच... और रोलेक्स... यानी वक्त पर मेरी हुकूमत।',
    roman: 'Laal cheenti yaani khamosh sena... Chocolate yaani duniya ki laalach... Aur Rolex... yaani waqt par meri hukoomat.',
    englishTranslation: 'The Red Ant: a silent army... The Chocolate: the greed of this world... And the Rolex: my absolute dominion over time.',
    suggestedVoice: 'Charon',
    suggestedStyle: 'Speak in a deep, ancient, raspy, dramatic cinematic voice with slow, heavy pauses'
  },
  {
    id: 'arlo-tees-saal',
    title: 'Arlo L: Tees Saal Lage (Passing the Torch)',
    category: 'Arlo L (Deathbed Monologue)',
    hindi: 'तीस साल लगे उन्हें मेरा नाम जानने में... और अगले साठ साल लगे मुझे ढूंढने में। लेकिन जब तक उनके हथियार मेरी देहलीज़ छुएंगे, मेरी रूह उनका सारा सिस्टम जला चुकी होगी।',
    roman: 'Tees saal lage unhe mera naam jaan ne mein... aur agle saath saal lage mujhe dhoondhne mein. Lekin jab tak unke hathiyar meri dehleez chhuenge, meri rooh unka sara system jala chuki hogi.',
    englishTranslation: 'It took them thirty years to learn my name... and sixty more to locate me. But before their weapons graze my threshold, my ghost will have incinerated their entire system.',
    suggestedVoice: 'Charon',
    suggestedStyle: 'Speak in an ancient, 95-year-old raspy dying whisper, slow cinematic breaths, and unflinching cold majesty',
    audioUrl: '/arlo_tees_saal.mp3',
    mp3Url: '/arlo_tees_saal.mp3',
    wavUrl: '/arlo_tees_saal.wav',
    duration: 18.14
  },
  {
    id: 'arlo-ghadi-ki-sui',
    title: 'Arlo L: Ghadi Ki Sui (Dominion Over Time)',
    category: 'Arlo L (Deathbed Monologue)',
    hindi: 'दुनिया समझती है वक्त घड़ी की सुई से चलता है... उन्हें नहीं पता, घड़ी की सुई मैंने रोक रखी थी।',
    roman: 'Duniya samajhti hai waqt ghadi ki sui se chalta hai... unhe nahi pata, ghadi ki sui maine rok rakhi thi.',
    englishTranslation: 'The world believes that time marches to the clock hands... They do not know, it was I who held those hands still.',
    suggestedVoice: 'Charon',
    suggestedStyle: 'Deliver with weary, gravelly baritone resonance, ancient authority, dramatic lingering pauses',
    audioUrl: '/arlo_ghadi_ki_sui.mp3',
    mp3Url: '/arlo_ghadi_ki_sui.mp3',
    wavUrl: '/arlo_ghadi_ki_sui.wav',
    duration: 15.24
  }
];

export const REFERENCE_QUOTE = {
  roman: "Maine 95 saal tak duniya ke waqt ko roka... Lekin ab mera waqt poora ho chuka hai.",
  hindi: "मैंने 95 साल तक दुनिया के वक्त को रोका... लेकिन अब मेरा वक्त पूरा हो चुका है।",
  english: "For 95 years I held back the world's time... But now, my time has come to an end.",
  audioUrl: "/reference_voice.mp3",
  mp3Url: "/reference_voice.mp3",
  wavUrl: "/reference_voice.wav",
  voice: "Charon (Directed: Ancient & Raspy)",
  model: "gemini-3.1-flash-tts-preview",
  timestamps: [
    { text: "Maine", start: 0.0, end: 1.8 },
    { text: "95 saal tak", start: 1.8, end: 4.8 },
    { text: "duniya ke waqt ko", start: 4.8, end: 7.6 },
    { text: "roka...", start: 7.6, end: 10.2 },
    { text: "Lekin ab", start: 10.2, end: 12.0 },
    { text: "mera waqt", start: 12.0, end: 13.8 },
    { text: "poora ho chuka hai.", start: 13.8, end: 16.5 }
  ]
};
