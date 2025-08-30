const { Mutex } = require("async-mutex");

class GlobalLock {
    constructor() {
        this._mutex = new Mutex();
        this.isSeekerTurnLockAcquired = false;
        this.isRaceLockAcquired = false;
        this.isKeeperWordLockAcquired = false;
    }

    acquire() {
        return this._mutex.acquire();
    }

    get mutex() {
        return this._mutex;
    }
}

module.exports = new GlobalLock();
