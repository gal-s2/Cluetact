const fetch = require("node-fetch");

//API Documentation: https://www.datamuse.com/api/
const DATAMUSE_API_URL = "https://api.datamuse.com/words";
const DEFAULT_WORD_COUNT = 5;

async function isValidEnglishWord(word) {
    const url = `https://api.datamuse.com/words?sp=${word.toLowerCase()}&md=d&max=1`;
    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.length > 0 && data[0].word.toLowerCase() === word.toLowerCase()) {
            const defs = data[0].defs || [];
            if (defs.length > 0) {
                // defs are like "n\tdefinition", so split by tab
                const firstDef = defs[0].split("\t")[1];
                return { isValid: true, definitionFromApi: firstDef };
            }
        }
        return { isValid: false };
    } catch (err) {
        console.error("Datamuse API error:", err);
        return { isValid: false };
    }
}

/**
 * Fetches noun words from Datamuse API based on a given meaning (ml param)
 */
async function getNounsByMeaning(meaning, count = DEFAULT_WORD_COUNT) {
    try {
        const response = await fetch(`${DATAMUSE_API_URL}?ml=${encodeURIComponent(meaning)}&md=p&max=${count}`);
        const data = await response.json();

        const nouns = data.filter((wordObj) => wordObj.tags && wordObj.tags.includes("n")).map((wordObj) => wordObj.word);

        return nouns;
    } catch (error) {
        console.error("Error fetching nouns by meaning:", error);
        return [];
    }
}

/**
 * Fetches noun words that start with a given prefix (sp param)
 */
async function getNounsByPrefix(prefix, count = DEFAULT_WORD_COUNT) {
    try {
        const response = await fetch(`${DATAMUSE_API_URL}?sp=${encodeURIComponent(prefix)}*&md=p&max=${count}`);
        const data = await response.json();

        const nouns = data.filter((wordObj) => wordObj.tags && wordObj.tags.includes("n")).map((wordObj) => wordObj.word);

        return nouns;
    } catch (error) {
        console.error("Error fetching nouns by prefix:", error);
        return [];
    }
}

async function testWordUtils() {
    try {
        const fruitWords = await getNounsByMeaning("fruit", 5);
        console.log('🍎 Nouns related to "fruit":');
        console.log(fruitWords.join(", "));

        const soccerWords = await getNounsByMeaning("soccer", 5);
        console.log('🍎 Nouns related to "soccer":');
        console.log(soccerWords.join(", "));

        const paWords = await getNounsByPrefix("pa", 5);
        console.log('\n🅿️ Nouns starting with "pa":');
        console.log(paWords.join(", "));
    } catch (err) {
        console.error("Something went wrong:", err);
    }
}

module.exports = {
    getNounsByMeaning,
    getNounsByPrefix,
    testWordUtils,
    isValidEnglishWord,
};
