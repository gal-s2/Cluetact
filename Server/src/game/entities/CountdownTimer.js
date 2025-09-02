const DEBUG = true;

class CountdownTimer {
    constructor(durationSeconds = 0, onComplete = () => {}) {
        this.duration = durationSeconds;
        this.interval = null;
        this.endTime = null;
        this.name = null;
        this.onComplete = onComplete;
    }

    setNewTimerDetails(durationSeconds, onComplete, name) {
        this.stop();
        this.duration = durationSeconds;
        this.onComplete = onComplete;
        this.name = name;
    }

    start() {
        if (DEBUG) console.log("Countdown Timer - starting coundtown of ", this.duration, " seconds for ", this.name);

        this.endTime = Date.now() + this.duration * 1000;

        this.interval = setInterval(() => {
            const secondsLeft = Math.max(0, Math.round((this.endTime - Date.now()) / 1000));

            if (secondsLeft <= 0) {
                this.stop();
                this.onComplete?.();
            }
        }, 1000);
    }

    getTimeLeft() {
        if (!this.endTime) return 0;
        const msLeft = this.endTime - Date.now();
        return Math.max(0, Math.round(msLeft / 1000));
    }

    stop() {
        if (this.interval) {
            if (DEBUG) console.log("Countdown Timer - stopping coundtown for ", this.name);
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

module.exports = CountdownTimer;
