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

// 3 clients: alice bob charlie 
// alice is the keeper 
// bob and charlie are seekers
// alice need to choose a word
// alice choose 'dog'
// the letter d revealed to all clients
// bob and charlie need to give a word starts with 'd' (the first one who does that)
// bob try first 'dry'
// bob need to give a clue/definition for 'dry'
// bob give the clue 'not wet'
// charlie and alice have a race, the first one who guess 'dry' will get the points , if charlie guess 'dry' the game will move to the next letter 
// otherwise the game will stay with this letter and somebody else will need to give a word start with 'd'
// if all the letters are revealed the round will end and the next client will be the keeper
// after all clients were keepers the game will end and the winner declared.