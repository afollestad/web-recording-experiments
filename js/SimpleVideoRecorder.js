var method = SimpleVideoRecorder.prototype;

/**
 * @param {Object} settings
 * @constructor
 */
function SimpleVideoRecorder(settings) {
    if (!settings) {
        settings = {};
    }
    if (!settings.contentType) {
        settings.contentType = 'video/webm';
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
            video: true,
            audio: true
        },

        // Success callback
        function (stream) {
            showPreview(stream);
            try {
                var options = {mimeType: method._settings.contentType};
                method._mediaRecorder = new MediaRecorder(stream, options);
            } catch (e) {
                method._settings.onerror(e);
                return;
            }
            if (!method._mediaRecorder) {
                method._settings.onerror('The media recorder API isn\'t supported in this browser!');
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

function showPreview(stream) {
    if (!method._settings.previewView) {
        console.log('WARNING: No previewView provided to display the camera preview.');
        return;
    }

    if (window.URL) {
        method._settings.previewView.src = window.URL.createObjectURL(stream);
    } else {
        method._settings.previewView.src = stream;
    }
}

function setupMediaRecorder() {
    method._chunks = [];
    var recorder = method._mediaRecorder;
    recorder.ondataavailable = function (e) {
        method._chunks.push(e.data);
    };
    recorder.onstop = function (e) {
        var blob = new Blob(method._chunks, {'type': method._settings.contentType});
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

// module.exports = SimpleVideoRecorder;