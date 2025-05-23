// THE MIDDLE-------------------------------------------------------------------------------------------

// engine only version:
// class Room {
//     constructor(roomId, status, keeperUsername, seekersUsernames) {
//         this.roomId = roomId;
//         this.status = status;
//         this.keeperUsername = keeperUsername;
//         this.players = {};
//         this.currentSession = new GameSession();
//         this.turnQueue = seekersUsernames.slice();
//         this.usedWords = new Set();

//         // Keeper Creation
//         const keeper = new Player(keeperUsername);
//         keeper.setRole("keeper");
//         this.players[keeperUsername] = keeper;

//         // Seekers Creation
//         seekersUsernames.forEach((username) => {
//             const seeker = new Player(username);
//             seeker.setRole("seeker");
//             this.players[username] = seeker;
//         });

//         this.pastKeepers = new Set();
//         this.pastKeepers.add(keeperUsername);
//     }

//     /**
//      * Get the part of the word that is currently revealed to all players in room
//      * @returns {string}
//      */
//     getRevealedLetters() {
//         return this.currentSession.revealedLetters;
//     }

//     /**
//      * returns player object by username
//      * @param {string} username
//      * @returns {Player}
//      */
//     getPlayerByUsername(username) {
//         return this.players[username];
//     }

//     // async setKeeperWordWithValidation(word) {
//     //     const valid = await isValidEnglishWord(word);
//     //     if (!valid) {
//     //         Logger.logInvalidKeeperWord(this.roomId, word);
//     //         return false;
//     //
//     //     }
//     // }
//     async setKeeperWordWithValidation(word) {
//         const valid = true; // החלפת isValidEnglishWord(word)

//         this.currentSession.setKeeperWord(word);
//         Logger.logKeeperWordSet(this.roomId, word);
//         return true;
//     }
//     startNewClueRound(clueGiverId, clueWord, clueDefinition) {
//         if (!this.currentSession.keeperWord) {
//             Logger.logCannotClueWithoutKeeperWord(this.roomId);
//             return false;
//         }

//         if (clueGiverId === this.keeperUsername) {
//             Logger.logClueNotAllowed(this.roomId);
//             return false;
//         }

//         const lastLetter =
//             this.currentSession.revealedLetters.slice(-1)[0]?.toLowerCase() ||
//             this.currentSession.keeperWord[0].toLowerCase();

//         if (!clueWord.toLowerCase().startsWith(lastLetter)) {
//             Logger.logInvalidClue(this.roomId, clueWord, lastLetter);
//             return false;
//         }

//         if (this.usedWords.has(clueWord.toLowerCase())) {
//             Logger.logClueWordAlreadyUsed(this.roomId, clueWord);
//             return false;
//         }

//         this.usedWords.add(clueWord.toLowerCase());

//         this.currentSession.setClue(clueGiverId, clueWord, clueDefinition);
//         Logger.logClueSet(this.roomId, clueGiverId, clueDefinition);

//         // this.raceTimer = setTimeout(() => {
//         //     this.handleClueTimeout();
//         // }, MAX_RACE_TIME);

//         return true;
//     }
//     async submitGuess(userId, guessWord) {
//         const session = this.currentSession;
//         const revealed = session.revealedLetters;
//         const lastLetter =
//             revealed[revealed.length - 1]?.toLowerCase() ||
//             session.keeperWord[0].toLowerCase();

//         const guessFirstLetter = guessWord[0].toLowerCase();
//         const valid = true; // בינתיים נניח שהמילה תקפה לבדיקה ידנית

//         if (!valid) {
//             Logger.logInvalidSeekerWord(this.roomId, guessWord);
//             return { correct: false };
//         }

//         if (guessFirstLetter !== lastLetter) {
//             Logger.logInvalidGuess(this.roomId, guessWord, lastLetter);
//             return { correct: false };
//         }

//         if (
//             session.guesses.find(
//                 (g) => g.word.toLowerCase() === guessWord.toLowerCase()
//             )
//         ) {
//             Logger.logDuplicateGuess(this.roomId, guessWord);
//             return { correct: false };
//         }

//         session.addGuess(userId, guessWord);
//         this.usedWords.add(guessWord.toLowerCase());

//         if (guessWord.toLowerCase() === session.clueTargetWord?.toLowerCase()) {
//             const timeElapsed = (new Date() - session.raceStartTime) / 1000;

//             const isKeeper = userId === this.keeperUsername;
//             if (isKeeper) {
//                 this.handleKeeperClueGuess(userId);
//                 clearTimeout(this.raceTimer);
//                 return { correct: true, revealed: false };
//             } else {
//                 this.handleCorrectGuess(userId, timeElapsed);
//                 clearTimeout(this.raceTimer);
//                 return { correct: true, revealed: true };
//             }
//         }

//         if (guessWord.toLowerCase() === session.keeperWord?.toLowerCase()) {
//             this.handleKeeperWordGuess(userId, guessWord);
//             return { correct: true, revealed: false };
//         }

//         return { correct: false };
//     }
//     getNextKeeper() {
//         const currentIndex = this.turnQueue.indexOf(this.keeperUsername);
//         const nextIndex = (currentIndex + 1) % this.turnQueue.length;
//         return this.turnQueue[nextIndex];
//     }
//     async endGame() {
//         console.log("ending now");
//         this.status = "ended";

//         let maxScore = -Infinity;
//         let winners = [];

//         for (const player of Object.values(this.players)) {
//             if (player.gameScore > maxScore) {
//                 maxScore = player.gameScore;
//                 winners = [player];
//             } else if (player.gameScore === maxScore) {
//                 winners.push(player);
//             }
//         }

//         Logger.logGameOver(
//             this.roomId,
//             winners.map((p) => p.username)
//         );

//         const winnerUsernames = new Set(winners.map((p) => p.username));

//         for (const player of Object.values(this.players)) {
//             try {
//                 const isWinner = winnerUsernames.has(player.username);
//                 const increment = {
//                     "statistics.totalGames": 1,
//                     [`statistics.${isWinner ? "Wins" : "Losses"}`]: 1,
//                 };
//                 console.log(`Updating stats for ${player.username}`, increment);

//                 const user = await User.findOneAndUpdate(
//                     { username: player.username },
//                     { $inc: increment },
//                     { new: true }
//                 );

//                 if (user) {
//                     const { Wins, totalGames } = user.statistics;
//                     const newWinRate = ((Wins / totalGames) * 100).toFixed(2);
//                     await User.updateOne(
//                         { username: player.username },
//                         { $set: { "statistics.winRate": newWinRate } }
//                     );
//                 }
//             } catch (err) {
//                 console.error(
//                     `Failed to update stats for ${player.username}:`,
//                     err
//                 );
//             }
//         }
//     }

//     getPlayerByUsername(username) {
//         return this.players[username];
//     }
//     handleCorrectGuess(guesserId, timeElapsed) {
//         const session = this.currentSession;
//         const clueGiverId = session.clueGiverId;

//         let pointsEarned = Math.ceil(BASE_POINTS - timeElapsed * PENALTY_RATE);
//         if (pointsEarned < 1) pointsEarned = 1;

//         let guesserPoints = Math.ceil(BASE_POINTS - timeElapsed * PENALTY_RATE);
//         if (guesserPoints < 1) guesserPoints = 1;

//         let clueGiverPoints = guesserPoints + CLUE_BONUS;

//         this.players[guesserId].addScore(guesserPoints);
//         this.players[clueGiverId].addScore(clueGiverPoints);

//         const isWordFullyRevealed = session.revealNextLetter();

//         Logger.logGuessCorrect(this.roomId, guesserId, pointsEarned);
//         Logger.logRevealedLetters(this.roomId, session.revealedLetters);

//         session.clueGiverId = null;
//         session.clueTargetWord = null;
//         session.status = "waiting";

//         if (isWordFullyRevealed) {
//             const currentKeeper = this.keeperUsername;
//             this.pastKeepers.add(currentKeeper);

//             const nextKeeper = this.getNextKeeper();
//             this.keeperUsername = nextKeeper;
//             this.players[nextKeeper].setRole("keeper");

//             Object.keys(this.players).forEach((id) => {
//                 if (id !== nextKeeper) this.players[id].setRole("seeker");
//             });

//             this.currentSession = new GameSession();
//             Logger.logNextKeeper(this.roomId, nextKeeper);

//             if (this.isGameOver()) {
//                 return;
//             }
//         }
//     }

//     updateStatus(status) {
//         this.status = status;
//     }

//     async waitForKeeperWord(prompt) {
//         while (!this.currentSession.keeperWord) {
//             const word = await prompt(
//                 ` ${this.keeperUsername}, enter your secret word: `
//             );
//             await this.setKeeperWordWithValidation(word);
//         }
//     }

//     async runGame(prompt) {
//         while (!this.isGameOver()) {
//             Logger.logCurrentKeeper(this.roomId, this.keeperUsername);

//             while (!this.currentSession.keeperWord) {
//                 await this.waitForKeeperWord(prompt);
//             }

//             let roundOver = false;

//             while (!roundOver) {
//                 if (!this.currentSession.keeperWord) break;

//                 let clueAccepted = false;
//                 let clueGiverId = null;
//                 while (!clueAccepted) {
//                     const seekers = Object.keys(this.players).filter(
//                         (id) => id !== this.keeperUsername
//                     );
//                     clueGiverId = await prompt(
//                         ` Who gives the clue? (${seekers.join("/")}) : `
//                     );
//                     const lastLetter =
//                         this.currentSession.revealedLetters
//                             .slice(-1)[0]
//                             ?.toLowerCase() ||
//                         this.currentSession.keeperWord[0].toLowerCase();
//                     const clueWord = await prompt(
//                         ` Clue word (starts with '${lastLetter}'): `
//                     );
//                     const clueDef = await prompt(
//                         ` Definition for "${clueWord}": `
//                     );
//                     clueAccepted = await this.startNewClueRound(
//                         clueGiverId,
//                         clueWord,
//                         clueDef
//                     );
//                     if (!clueAccepted) clueGiverId = null;
//                 }

//                 let guessAccepted = false;
//                 while (!guessAccepted) {
//                     const eligibleGuessers = Object.keys(this.players).filter(
//                         (id) => id !== clueGiverId
//                     );
//                     const guesserId = await prompt(
//                         ` Who guesses first? (${eligibleGuessers.join("/")}) : `
//                     );
//                     const lastLetter =
//                         this.currentSession.revealedLetters
//                             .slice(-1)[0]
//                             ?.toLowerCase() ||
//                         this.currentSession.keeperWord[0].toLowerCase();
//                     const guess = await prompt(
//                         ` What does ${guesserId} guess? (starts with '${lastLetter}'): `
//                     );

//                     const result = await this.submitGuess(guesserId, guess);
//                     guessAccepted = result.correct;

//                     if (result.correct && !result.revealed) {
//                         Logger.logCorrectGuessNoReveal(this.roomId, guesserId);
//                     }
//                 }

//                 if (
//                     this.currentSession.keeperWord &&
//                     this.currentSession.revealedLetters.length ===
//                         this.currentSession.keeperWord.length
//                 ) {
//                     roundOver = true;
//                     const nextKeeper = this.getNextKeeper();
//                     this.keeperUsername = nextKeeper;
//                     this.players[nextKeeper].setRole("keeper");

//                     Object.keys(this.players).forEach((id) => {
//                         if (id !== nextKeeper)
//                             this.players[id].setRole("seeker");
//                     });

//                     this.pastKeepers.add(nextKeeper);
//                     this.currentSession = new GameSession();
//                 }
//             }
//         }
//         await this.endGame();

//         for (const username in this.players) {
//             Logger.logFinalScore(username, this.players[username].gameScore);
//         }

//         Logger.logManualTestComplete();
//     }
// }
