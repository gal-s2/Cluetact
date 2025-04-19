const fetch = require('node-fetch');

//API Documentation: https://www.datamuse.com/api/
const DATAMUSE_API_URL = "https://api.datamuse.com/words";
const DEFAULT_WORD_COUNT = 5;

/**
 * Fetches noun words from Datamuse API based on a given meaning (ml param)
 */
async function getNounsByMeaning(meaning, count = DEFAULT_WORD_COUNT) {
    try {
        const response = await fetch(`${DATAMUSE_API_URL}?ml=${encodeURIComponent(meaning)}&md=p&max=${count}`);
        const data = await response.json();

        const nouns = data
            .filter(wordObj => wordObj.tags && wordObj.tags.includes('n'))
            .map(wordObj => wordObj.word);

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

        const nouns = data
            .filter(wordObj => wordObj.tags && wordObj.tags.includes('n'))
            .map(wordObj => wordObj.word);

        return nouns;
    } catch (error) {
        console.error("Error fetching nouns by prefix:", error);
        return [];
    }
}

async function testWordUtils() {
    try {
          const fruitWords = await getNounsByMeaning('fruit', 5);
          console.log('🍎 Nouns related to "fruit":');
          console.log(fruitWords.join(', '));
    
          const soccerWords = await getNounsByMeaning('soccer', 5);
          console.log('🍎 Nouns related to "soccer":');
          console.log(soccerWords.join(', '));
    
          const paWords = await getNounsByPrefix('pa', 5);
          console.log('\n🅿️ Nouns starting with "pa":');
          console.log(paWords.join(', '));
      } catch (err) {
          console.error('Something went wrong:', err);
      }
}

module.exports = {
    getNounsByMeaning,
    getNounsByPrefix,
    testWordUtils
};
