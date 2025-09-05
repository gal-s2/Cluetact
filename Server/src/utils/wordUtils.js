const fetch = require("node-fetch");
const datamuse = require("datamuse");

//API Documentation: https://www.datamuse.com/api/
const DEFAULT_WORD_COUNT = 3;

async function isValidEnglishWord(word) {
    const result = {};
    try {
        const data = await datamuse.request(`words?sp=${word.toLowerCase()}&md=d&max=1`);
        if (data.length > 0 && data[0].word.toLowerCase() === word.toLowerCase()) {
            const defs = data[0].defs || [];
            if (defs.length > 0) {
                // defs are like "n\tdefinition", so split by tab
                const firstDef = defs[0].split("\t")[1];
                result.isValid = true;
                result.definitionFromApi = firstDef;
            } else {
                result.isValid = false;
            }
        } else {
            result.isValid = false;
        }
    } catch (error) {
        result.isValid = false;
    }

    return result;
}

/**
 * Fetches words that start with a given prefix (sp param), but excludes forbiddenWord
 */
async function getWordsByPrefix(prefix, forbiddenWord, count = DEFAULT_WORD_COUNT) {
    try {
        const data = await datamuse.request(`words?sp=${encodeURIComponent(prefix)}*&max=${count + 1}`);

        const allWords = data.filter((wordObj) => wordObj.word.toLowerCase() !== forbiddenWord.toLowerCase()).map((wordObj) => wordObj.word);
        if (allWords.length === count + 1) allWords.pop();
        return allWords;
    } catch (error) {
        return [];
    }
}

module.exports = {
    getWordsByPrefix,
    isValidEnglishWord,
};
