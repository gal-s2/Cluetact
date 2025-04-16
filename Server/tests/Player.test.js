const Player = require('../game/Player');

describe('Player class', () => {
    test('should initialize player correctly', () => {
        const player = new Player('Name');
        expect(player.username).toBe('Name');
        expect(player.gameScore).toBe(0);
    });

    test('should add score correctly', () => {
        const player = new Player('Bob');
        player.addScore(10);
        expect(player.gameScore).toBe(10);
      });
});