(function(window) {
        var zMiner = function() {
			// this.worker.onmessage = this.onReady.bind(this);
            this.running = false;
            this.iMiner = 1;
            this.zMiners = [null, null, null, null];
            this.lastMessageTimestamp = Date.now();
        };

        zMiner.prototype.onReady = function(msg) {
            if (msg.data !== "ready" || this._isReady) {
                throw 'Expecting first message to be "ready", got ' + msg
            }
            this._isReady = true;
            this.worker.onmessage = this.onReceiveMsg.bind(this);
            if (this.currentJob) {
                this.running = true;
                this.worker.postMessage(this.currentJob)
            }

			console.log("init");
        };

        window.zMiner = zMiner
    }
)(window);
