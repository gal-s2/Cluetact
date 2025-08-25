// Server: src/utils/dailyWords.js
const dailyWords = [
    {
        word: "Serendipity",
        meaning:
            "The occurrence of events by chance in a happy or beneficial way",
        origin: "Coined by Horace Walpole in 1754, from the Persian fairy tale 'The Three Princes of Serendip' who made fortunate discoveries by accident",
        pronunciation: "ser-uhn-DIP-i-tee",
        partOfSpeech: "noun",
    },
    {
        word: "Petrichor",
        meaning: "The pleasant, distinctive smell of earth after rain",
        origin: "From Greek 'petros' (stone) and 'ichor' (the fluid that flows in the veins of the gods in Greek mythology). Coined by researchers in 1964",
        pronunciation: "PET-ri-kawr",
        partOfSpeech: "noun",
    },
    {
        word: "Saudade",
        meaning:
            "A deep emotional state of nostalgic longing for something absent",
        origin: "Portuguese word with no direct English translation, originating from Latin 'solitatem' (solitude)",
        pronunciation: "sah-oo-DAH-deh",
        partOfSpeech: "noun",
    },
    {
        word: "Apricity",
        meaning: "The warmth of the sun in winter",
        origin: "From Latin 'apricus' meaning 'having lots of sunshine'. A rare but beautiful English word that captures a specific feeling",
        pronunciation: "uh-PRIS-i-tee",
        partOfSpeech: "noun",
    },
    {
        word: "Ephemeral",
        meaning: "Lasting for a very short time; transitory",
        origin: "From Greek 'ephēmeros' meaning 'lasting only a day', from 'epi' (upon) + 'hēmera' (day)",
        pronunciation: "ih-FEM-er-uhl",
        partOfSpeech: "adjective",
    },
    {
        word: "Bibliophile",
        meaning: "A person who collects or has a great love of books",
        origin: "From Greek 'biblion' (book) + 'philos' (loving). First used in French in 1820, then adopted into English",
        pronunciation: "BIB-lee-uh-fahyl",
        partOfSpeech: "noun",
    },
    {
        word: "Wanderlust",
        meaning: "A strong desire to travel and explore the world",
        origin: "German compound word: 'wandern' (to wander) + 'lust' (desire). Adopted into English in the early 1900s",
        pronunciation: "WON-der-luhst",
        partOfSpeech: "noun",
    },
    {
        word: "Mellifluous",
        meaning: "Sweet or musical; pleasant to hear",
        origin: "From Latin 'mellifluus': 'mel' (honey) + 'fluere' (to flow), literally meaning 'flowing with honey'",
        pronunciation: "muh-LIF-loo-uhs",
        partOfSpeech: "adjective",
    },
    {
        word: "Quixotic",
        meaning:
            "Extremely idealistic and unrealistic; pursuing impossible goals",
        origin: "Named after Don Quixote, the idealistic knight from Cervantes' 1605 novel who fought windmills thinking they were giants",
        pronunciation: "kwik-SOT-ik",
        partOfSpeech: "adjective",
    },
    {
        word: "Limerence",
        meaning:
            "The state of being infatuated with another person; obsessive romantic attraction",
        origin: "Coined by psychologist Dorothy Tennov in 1979 in her book 'Love and Limerence' to describe intense romantic obsession",
        pronunciation: "LIM-er-uhns",
        partOfSpeech: "noun",
    },
    {
        word: "Hiraeth",
        meaning:
            "A Welsh word for homesickness tinged with grief or sadness for the lost or departed",
        origin: "Ancient Welsh word with no direct English equivalent, expressing longing for a homeland that may not exist anymore",
        pronunciation: "HEER-eyeth",
        partOfSpeech: "noun",
    },
    {
        word: "Scintilla",
        meaning: "A tiny trace or spark of a specified quality or feeling",
        origin: "Latin word meaning 'spark' or 'glimmer'. Used in English since the 1600s to mean the smallest possible amount",
        pronunciation: "sin-TIL-uh",
        partOfSpeech: "noun",
    },
    {
        word: "Vellichor",
        meaning: "The strange wistfulness of used bookstores",
        origin: "A neologism created by John Koenig for 'The Dictionary of Obscure Sorrows', combining Latin and Greek roots",
        pronunciation: "VEL-i-kawr",
        partOfSpeech: "noun",
    },
    {
        word: "Mamihlapinatapai",
        meaning:
            "A look shared by two people wishing the other would initiate something they both desire but are reluctant to start",
        origin: "From the Yaghan language of Tierra del Fuego. Listed in Guinness Book of Records as the 'most succinct word'",
        pronunciation: "mah-me-hlah-pee-nah-tah-pie",
        partOfSpeech: "noun",
    },
    {
        word: "Sonorous",
        meaning:
            "Deep, full, and reverberating in sound; impressively deep and full",
        origin: "From Latin 'sonorus' from 'sonor' (sound). First used in English in the 1600s to describe rich, resonant sounds",
        pronunciation: "suh-NAWR-uhs",
        partOfSpeech: "adjective",
    },
    {
        word: "Ethereal",
        meaning:
            "Extremely delicate and light in a way that seems too perfect for this world",
        origin: "From Latin 'aethereus' meaning 'of the upper air', from Greek 'aither' (upper air breathed by the gods)",
        pronunciation: "ih-THEER-ee-uhl",
        partOfSpeech: "adjective",
    },
    {
        word: "Luminous",
        meaning: "Full of or shedding light; bright or shining",
        origin: "From Latin 'luminosus' from 'lumen' (light). Originally used to describe divine or spiritual enlightenment",
        pronunciation: "LOO-muh-nuhs",
        partOfSpeech: "adjective",
    },
    {
        word: "Euphoria",
        meaning: "A feeling or state of intense excitement and happiness",
        origin: "From Greek 'euphoros' meaning 'bearing well', from 'eu' (well) + 'pherein' (to bear). Originally a medical term",
        pronunciation: "yoo-FAWR-ee-uh",
        partOfSpeech: "noun",
    },
    {
        word: "Resplendent",
        meaning:
            "Attractive and impressive through being richly colorful or sumptuous",
        origin: "From Latin 'resplendens' meaning 'shining back', from 're' (back) + 'splendere' (to shine)",
        pronunciation: "ri-SPLEN-duhnt",
        partOfSpeech: "adjective",
    },
    {
        word: "Iridescent",
        meaning:
            "Showing luminous colors that seem to change from different angles",
        origin: "From Latin 'iris' (rainbow) + suffix '-escent'. First used to describe the rainbow-like colors in soap bubbles",
        pronunciation: "ir-i-DES-uhnt",
        partOfSpeech: "adjective",
    },
];

// Function to get today's word based on date
function getTodaysWord() {
    const today = new Date();
    // Create a seed based on year and day of year to ensure consistency
    const dayOfYear = Math.floor(
        (today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
    );
    const index = (dayOfYear + today.getFullYear()) % dailyWords.length;

    return {
        ...dailyWords[index],
        date: today.toDateString(),
    };
}

module.exports = {
    dailyWords,
    getTodaysWord,
};
