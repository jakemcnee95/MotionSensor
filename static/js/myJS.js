

// Initialize Firebase
var config = {
    apiKey: "AIzaSyCSBF4VE_EzCD8wkIbw3oukCIDPA4rcBgo",
    authDomain: "fit3140team252018.firebaseapp.com",
    databaseURL: "https://fit3140team252018.firebaseio.com",
    projectId: "fit3140team252018",
    storageBucket: "fit3140team252018.appspot.com",
    messagingSenderId: "323608886628"
};
firebase.initializeApp(config);

var ref = firebase.database().ref("/motionSensorData");

//update the title

//@param: the title information
//@postcondition: the title will display the correct data.


//update the inputs
//@param: the input button information
//@postcondition: the boxes display last recorded inputs

//cells for inputs

/*
socket.on('queue_pos_0', function(data){
    document.getElementById('cell4').innerHTML=data});

socket.on('queue_pos_0', function(data){
    document.getElementById('cell3').innerHTML=data});

socket.on('queue_pos_0', function(data){
    document.getElementById('cell2').innerHTML=data});

socket.on('queue_pos_0', function(data){
    document.getElementById('cell1').innerHTML=data});
*/


//update the counters

//long counter

//@param; long variable
//@postcondition: long increases by 1

window.onload = function() {
    ref.on("value", function (snap) {
        var newPost = snap.val();
        document.getElementById("long").innerHTML = (newPost.long.num)
    });


//short counter

//@param; long variable
//@postcondition: long increases by 1

    ref.on("value", function (snap) {
        var newPost = snap.val();

        document.getElementById("short").innerHTML = (newPost.short.num)
    });


//visitor counter

//@param; long variable
//@postcondition: long increases by 1
    ref.on("value", function (snap) {
        var newPost = snap.val();
        document.getElementById("visitors").innerHTML = (newPost.visitor.num)
    });
};

//handle the reset button

//@param: the game ID to be restarted
//@postcondition: If server side client clicks reset, erase database
function reset_this(){
    var ref = firebase.database().ref("/motionSensorData");
    ref.set({
        visitor: {
            num:0,
            time:12346789},

        short: {
            num:0,
            time:12346789},

        long: {
            num:0,
            time:1236789
        }});
}

//handle the LED Toggle button

//@param: the game ID to be restarted
//@postcondition: If serverside client clicks toggle LED, turn LED ON/OFF
function toggle_LED(data){
    alert("gsdf");
    io.emit('LED_on', data)
}







