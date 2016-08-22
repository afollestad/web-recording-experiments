var method = SFAudioRecorder.prototype;

/**
 * @param {Object} settings
 * @constructor
 */
function SFAudioRecorder(settings) {
    if (!settings) {
        settings = {};
    }
    if (!settings.onerror) {
        settings.onerror = function (err) {
            console.log('Error: ' + err)
        };
    }
    if (!settings.onready) {
        settings.onready = function () {
            console.log('Ready!');
        };
    }
    if (!settings.onstarted) {
        settings.onstarted = function () {
            console.log('Started!');
        };
    }
    if (!settings.onstopped) {
        settings.onstopped = function (blob) {
            console.log('Stopped. ' + blob);
        };
    }
    method._settings = settings;

    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;
    if (!navigator.getUserMedia) {
        this._settings.onerror('The media recorder API isn\'t supported in this browser!');
        return;
    }

    navigator.getUserMedia(
        // constraints - only audio needed for this app
        {
            audio: true
        },

        // Success callback
        function (stream) {
            method._mediaRecorder = new MediaRecorder(stream);
            if (!method._mediaRecorder) {
                this._settings.onerror('The media recorder API isn\'t supported in this browser!');
                return;
            }
            method._settings.onready();
        },

        // Error callback
        function (err) {
            method._settings.onerror('getUserMedia failed: ' + err);
        }
    );
}

function setupMediaRecorder() {
    method._chunks = [];
    var recorder = method._mediaRecorder;
    recorder.ondataavailable = function (e) {
        method._chunks.push(e.data);
    };
    recorder.onstop = function (e) {
        var blob = new Blob(method._chunks, {'type': 'audio/mp3'});
        method._chunks = [];
        method._settings.onstopped(blob);
    };
}

method.start = function () {
    setupMediaRecorder();
    method._mediaRecorder.start();
    console.log(method._mediaRecorder.state);
    this._settings.onstarted();
};

method.stop = function () {
    method._mediaRecorder.stop();
    console.log(method._mediaRecorder.state);
};

// module.exports = SFAudioRecorder;