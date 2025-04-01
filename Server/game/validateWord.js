const fetch = require('node-fetch');

async function isValidEnglishWord(word) {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`;
    try {
        const response = await fetch(url);
        return response.ok;
    } catch (err) {
        console.error('Dictionary API error:', err);
        return false;
    }
}

module.exports = isValidEnglishWord;

