/* Initialising */

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const five = require('johnny-five');
const board = new five.Board();
var queue = require('queue');

var num_MovementSensor = 0;
var msg_MovementDuration = 'Short';
var lst_clients = [];
var lst_motion = [];

var count = 15
var countdown = setInterval(counter,1000)
function counter(){
    if (count == 0) {
        io.emit('LED_off')
        clearInterval(countdown)
    } else {
        --count
    }
}

/* Events */

//initialise firebase
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

// As an admin, the app has access to read and write all data, regardless of Security Rules
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fit3140team252018.firebaseio.com"
});

var db = admin.database();
var ref = db.ref("/motionSensorData"); // channel name
ref.on("value", function(snapshot) {   //this callback will be invoked with each new object
    console.log(snapshot.val());
}, function (errorObject) {             // if error
    console.log("The read failed: " + errorObject.code);
});

// The arduino board actions when ready.
board.on('ready', function () {

    //led for this board
    const led = new five.Led(13);
    var active = 0;

    //light logic
    io.on('LED_on',function(){
        console.log('Light is on');
        led.on();
        if (count > 1) {
            count += 5
        } else{
            count = 15
            countdown
        }
    })

    io.on('LED_off',function(){
        console.log('Light is off');
        clearInterval(countdown);
        led.off()
    })

    //motion sensor for this board
    const motion = new five.Motion(12);

    //When Motion is detected
    motion.on('motionstart', () => {
        num_MovementSensor = Date.now();
    console.log('motionstart', num_MovementSensor);
});

    motion.on('motionend', () => {
        //duration since the motion bagan in seconds
        num_MovementSensor = (Date.now() - num_MovementSensor)/1000;
    console.log('motionend', num_MovementSensor);

    //initialise input_queue as Q
    var Q = queue();

    //long movement longer than 8 seconds.
    if (num_MovementSensor > 8) {
        //duration is long
        ref.once("value", function(snap){
            var userRef = snap.val();
            var refChild = ref.child("long");
            refChild.update({"num": 1 + userRef.long.num})});
        Q.push('L');
    } else {
        //duration is short
            ref.once("value", function(snap){
                var userRef = snap.val();

                var refChild = ref.child("short");
                refChild.update({"num": 1 + userRef.short.num})});
            Q.push('S');}
    });
});


io.on('connection', function (socket) {
    lst_clients.push(socket);
    console.log('someone joined')
    socket.on('disconnect', function () {
        console.log('someone left')

    })
});
//firebase reset
io.on('reset',function(){
    console.log('needs work')
});


//code to initialize counters
var start_counters;
start_counters = (function () {
    var executed = false;
    return function () {
        if (!executed) {
            executed = true;
            ref.set({
                visitor: {
                    num: 0,
                    time: 12346789
                },

                short: {
                    num: 0,
                    time: 12346789
                },

                long: {
                    num: 0,
                    time: 1236789
                }
            });
        }
    };
})();
start_counters();


//initialise input_queue as Q
var Q = queue();

//If long movement is detected
Q.push('L');
Q.push('S');
Q.push('L');
Q.push('L');

//If queue of length 4 is observed, add to database and pop(serve) off queue
if (Q.length === 4) {
    if (Q.jobs[0] === 'L' && Q.jobs[1] === 'S' && Q.jobs[2] === 'L' && Q.jobs[3] === 'L') {
        console.log('Person');
        ref.once("value", function (snap) {
            var userRef = snap.val();
            var refChild = ref.child("visitor");
            refChild.update({"num": 1 + userRef.visitor.num})
        })
    }
    Q.pop();
}

//final database for reference
ref.on("value", function(snapshot) {
    var userRef = snapshot.val();
    console.log(userRef);});



/* Run Code */
app.use(express.static('.'));
app.get('/', function(req, res){
    res.sendFile(__dirname + '/templates/index.html');
});

http.listen(8000, () => {
    console.log('listening on *:8000');
});