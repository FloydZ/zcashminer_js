(function(window) {
        var zMinerThread = function() {
            this.worker = new Worker("nheqminer.js");
            this.worker.onmessage = this.onReady.bind(this);
            // this.module = Module;
            this.currentJob = null;
            this.jobCallback = function() {};
            this.verifyCallback = function() {};
            this._isReady = false;
            this.hashesPerSecond = 0;
            this.hashesTotal = 0;
            this.running = false;
            this.lastMessageTimestamp = Date.now()
        };

        zMinerThread.prototype.onReady = function(msg) {
            if (msg.data !== "ready" || this._isReady) {
                throw 'Expecting first message to be "ready", got ' + msg
            }
            this._isReady = true;
            this.worker.onmessage = this.onReceiveMsg.bind(this);
            if (this.currentJob) {
                this.running = true;
                this.worker.postMessage(this.currentJob)
            }
        };

        zMinerThread.prototype.onReceiveMsg = function(msg) {
            if (msg.data.verify_id) {
                this.verifyCallback(msg.data);
                return
            }
            if (msg.data.result) {
                this.jobCallback(msg.data)
            }

            this.hashesPerSecond = this.hashesPerSecond * .5 + msg.data.hashesPerSecond * .5;
            this.hashesTotal += msg.data.hashes;
            this.lastMessageTimestamp = Date.now();
            if (this.running) {
                this.worker.postMessage(this.currentJob)
            }
        };

        zMinerThread.prototype.setJob = function(job, callback) {
            this.currentJob = job;
            this.jobCallback = callback;
            if (this._isReady && !this.running) {
                this.running = true;
                this.worker.postMessage(this.currentJob)
            }
        };

        zMinerThread.prototype.verify = function(job, callback) {
            if (!this._isReady) {
                return
            }
            this.verifyCallback = callback;
            this.worker.postMessage(job)
        };

        zMinerThread.prototype.stop = function() {
            if (this.worker) {
                this.worker.terminate();
                this.worker = null
            }
            this.running = false
        };

        zMinerThread.prototype.start = function() {
            if (this.worker) {
            	return;
			}

			if (this.running) {
				return;
			}

            this.running = true;
        };


        //window.zminer.thread = zMinerThread
        window.zMiner = new zMinerThread();
    }
)(window);
