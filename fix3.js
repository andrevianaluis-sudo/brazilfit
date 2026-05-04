const fs = require('fs');
const file = 'C:/Users/viana/BRAZILFIT/frontend/src/pages/client/ClientWellness.jsx';
let c = fs.readFileSync(file, 'utf8');

// Fix broken emoji in FALLBACK_MUSIC_TRACKS and add more tracks
const oldTracks = const FALLBACK_MUSIC_TRACKS = [
  { id:'tibetan', name:'Tibetan Bowls', artist:'DesiFreeMuzic', emoji:'\u00f0\u009f\u008e\u00b5', url:'https://cdn.pixabay.com/download/audio/2025/07/04/audio_56496453ec.mp3?filename=desifreemusic-minimalistic-meditation-soundscape-with-tibetan-singing-bowls-369761.mp3', attribution:'Tibetan Bowls by DesiFreeMuzic (Pixabay)' },
  { id:'piano',   name:'Peaceful Piano',artist:'HarumachiMusic',emoji:'\u00f0\u009f\u008e\u00b9', url:'https://cdn.pixabay.com/download/audio/2022/05/28/audio_b79a40aa49.mp3?filename=harumachimusic-peaceful-garden-healing-light-piano-for-meditation-zen-landscapes-112199.mp3', attribution:'Peaceful Piano by HarumachiMusic (Pixabay)' },
  { id:'flute',   name:'Nature & Flute',artist:'Siarhei_Korbut',emoji:'\u00f0\u009f\u008c\u00bf', url:'https://cdn.pixabay.com/download/audio/2025/08/10/audio_d7b8695825.mp3?filename=siarhei_korbut-elven-flute-meditation-nature-remix-387545.mp3', attribution:'Nature & Flute by Siarhei_Korbut (Pixabay)' },
  { id:'om',      name:'Deep Om',      artist:'kalsstockmedia', emoji:'\u00f0\u009f\u0095\u0089\u00ef\u00b8\u008f', url:'https://cdn.pixabay.com/download/audio/2024/08/04/audio_6729bddbf2.mp3?filename=kalsstockmedia-deep-om-chants-with-reverb-229614.mp3', attribution:'Deep Om by kalsstockmedia (Pixabay)' },
  { id:'binaural',name:'Binaural Beats',artist:'CHAKONG',       emoji:'\u00f0\u009f\u0094\u00ae', url:'https://cdn.pixabay.com/download/audio/2023/12/19/audio_1a5566c7ca.mp3?filename=chakong-binaural-beats-alpha-sinewaves-meditation-focus-relax-7-hz-182096.mp3', attribution:'Binaural Beats by CHAKONG (Pixabay)' },
];;

const newTracks = const FALLBACK_MUSIC_TRACKS = [
  { id:'tibetan', name:'Tibetan Bowls',  artist:'DesiFreeMuzic',  emoji:'\uD83C\uDFB5', url:'https://cdn.pixabay.com/download/audio/2025/07/04/audio_56496453ec.mp3?filename=desifreemusic-minimalistic-meditation-soundscape-with-tibetan-singing-bowls-369761.mp3', attribution:'Tibetan Bowls by DesiFreeMuzic (Pixabay)' },
  { id:'piano',   name:'Peaceful Piano', artist:'HarumachiMusic', emoji:'\uD83C\uDFB9', url:'https://cdn.pixabay.com/download/audio/2022/05/28/audio_b79a40aa49.mp3?filename=harumachimusic-peaceful-garden-healing-light-piano-for-meditation-zen-landscapes-112199.mp3', attribution:'Peaceful Piano by HarumachiMusic (Pixabay)' },
  { id:'flute',   name:'Nature & Flute', artist:'Siarhei_Korbut', emoji:'\uD83C\uDF3F', url:'https://cdn.pixabay.com/download/audio/2025/08/10/audio_d7b8695825.mp3?filename=siarhei_korbut-elven-flute-meditation-nature-remix-387545.mp3', attribution:'Nature & Flute by Siarhei_Korbut (Pixabay)' },
  { id:'om',      name:'Deep Om',        artist:'kalsstockmedia',  emoji:'\uD83D\uDD49', url:'https://cdn.pixabay.com/download/audio/2024/08/04/audio_6729bddbf2.mp3?filename=kalsstockmedia-deep-om-chants-with-reverb-229614.mp3', attribution:'Deep Om by kalsstockmedia (Pixabay)' },
  { id:'binaural',name:'Binaural Beats', artist:'CHAKONG',         emoji:'\uD83D\uDD2E', url:'https://cdn.pixabay.com/download/audio/2023/12/19/audio_1a5566c7ca.mp3?filename=chakong-binaural-beats-alpha-sinewaves-meditation-focus-relax-7-hz-182096.mp3', attribution:'Binaural Beats by CHAKONG (Pixabay)' },
  { id:'rain',    name:'Rain Sounds',    artist:'Relaxing Audio',  emoji:'\uD83C\uDF27', url:'https://cdn.pixabay.com/download/audio/2022/03/10/audio_2d80a78a26.mp3?filename=rain-and-thunder-16705.mp3', attribution:'Rain Sounds (Pixabay)' },
  { id:'ocean',   name:'Ocean Waves',    artist:'Nature Sounds',   emoji:'\uD83C\uDF0A', url:'https://cdn.pixabay.com/download/audio/2022/06/07/audio_b9e47e4a31.mp3?filename=ocean-waves-112906.mp3', attribution:'Ocean Waves (Pixabay)' },
  { id:'forest',  name:'Forest Birds',   artist:'Nature Sounds',   emoji:'\uD83C\uDF32', url:'https://cdn.pixabay.com/download/audio/2022/03/15/audio_f9f0f6af58.mp3?filename=birds-19624.mp3', attribution:'Forest Birds (Pixabay)' },
  { id:'crystal', name:'Crystal Bowls',  artist:'Meditation Mix',  emoji:'\u2728',        url:'https://cdn.pixabay.com/download/audio/2024/02/28/audio_4b2e0a49da.mp3?filename=crystal-singing-bowls-meditation-251062.mp3', attribution:'Crystal Bowls (Pixabay)' },
  { id:'lofi',    name:'Lo-Fi Chill',    artist:'Chill Beats',     emoji:'\uD83C\uDFA7', url:'https://cdn.pixabay.com/download/audio/2024/11/26/audio_0f6d0a0204.mp3?filename=lofi-study-112191.mp3', attribution:'Lo-Fi Chill (Pixabay)' },
];;

if (c.includes(oldTracks)) {
  c = c.replace(oldTracks, newTracks);
  console.log('Tracks replaced successfully');
} else {
  console.log('Track block not found exactly - trying partial fix...');
  // Fix just the broken emoji characters
  c = c.replace(/\u00f0\u009f\u008e\u00b5/g, '\uD83C\uDFB5');
  c = c.replace(/\u00f0\u009f\u008e\u00b9/g, '\uD83C\uDFB9');
  c = c.replace(/\u00f0\u009f\u008c\u00bf/g, '\uD83C\uDF3F');
  c = c.replace(/\u00f0\u009f\u0095\u0089\u00ef\u00b8\u008f/g, '\uD83D\uDD49');
  c = c.replace(/\u00f0\u009f\u0094\u00ae/g, '\uD83D\uDD2E');
  console.log('Partial emoji fix applied');
}

fs.writeFileSync(file, c, 'utf8');
console.log('Done');
