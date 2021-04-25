var trackers = JSON.parse(localStorage.getItem('trackers'))
if(trackers == null){
    trackers = []
} else{
    updateListView()
}

$("#saveNew").click(function(){
    let inputedID = $("#trackerIDInput").val().toUpperCase()
    let inputedName = $("#trackerNameInput").val()
    if(inputedID == ""){
        $("#addMessage").text("ID is required")
    } else {
        if(inputedName == "") {inputedName = inputedID}
        trackers.push({id: inputedID, name: inputedName, active: true})
        updateListView()

        $("#myModal").modal('hide')
        clearInputFields()
    }
})

$("#saveEdited").click(function(){
    let inputedID = $("#trackerIDInput2").val().toUpperCase()
    let inputedName = $("#trackerNameInput2").val()
    if(inputedID == ""){
        $("#addMessage2").text("ID is required")
    } else {
        if(inputedName == "") {inputedName = inputedID}
        trackers[currentlyEditing] = ({id: inputedID, name: inputedName, active: true})
        updateListView()

        $("#editModal").modal('hide')
        clearInputFields()
    }
})

function clearInputFields(){
    $("#trackerIDInput").val("")
    $("#trackerNameInput").val("")
    $("#addMessage").text("")
    $("#trackerIDInput2").val("")
    $("#trackerNameInput2").val("")
    $("#addMessage2").text("")
}

function updateListView(){
    $("#listView").html("")
    for (const tracker of trackers) {
        $("#listView").append(listItem(tracker.name, tracker.active, trackers.indexOf(tracker)))
    }
    localStorage.setItem("trackers", JSON.stringify(trackers))
}

let currentlyEditing = 0
function listItem(name, active, id){
    let name2 = name
    if(!active) {name += " (Deactivated)"}
    return(
        $("<li class='clickable'>").addClass((active) ? "active" : "").append([
            $("<a/>").text(name).append([
                $("<i class='fas fa-ellipsis-h' style='float:right;'>").click(function(e){
                    e.stopPropagation()
                    $("#editModal").modal('show')
                    $("#trackerIDInput2").val(trackers[id].id)
                    $("#trackerNameInput2").val(name2)
                    currentlyEditing = id
                })
            ]).click(function(){
                trackers[id].active = !trackers[id].active
                updateListView()
            })
        ])
    )
}

function setAllActive(activate){
    for(const tracker of trackers){
        tracker.active = activate
    }
    updateListView()
}

function deleteTracker(){
    trackers.splice(currentlyEditing, 1)
    clearInputFields()
    updateListView()
    $("#editModal").modal('hide')
}
