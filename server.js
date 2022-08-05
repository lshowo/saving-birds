
const cors = require('cors')

const express = require('express');

const app = express();

let clients = 0;

app.use(cors())
app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

var PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => { //80 🌟🌟🌟🌟🌟🌟
    console.log("My socket server is running");
  })

function listen() {
    const host = server.address().address;
    const port = server.address().port;
    console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));

var io = require('socket.io')(server);

io.sockets.on('connection', newConnection);

io.sockets.on('connection',
    // We are given a websocket object in our function
    function (socket) {
        clients = clients+0.5;

        console.log("We have clients: " + Math.ceil(clients));


        // When this user emits, client side: socket.emit('otherevent',some data);
        socket.on('mouse',
            function (data) {
                // Data comes in as whatever was sent, including objects
                console.log("Received: 'mouse' " + data.x + " " + data.y);
                
                // Send it to all other clients
                socket.broadcast.emit('mouse', data);

                // This is a way to send to everyone including sender
                // io.sockets.emit('message', "this goes to everyone");

            }
        );

        socket.on('gameState', function(temp){
            //console.log(temp);
            socket.broadcast.emit('gameState', temp);
        });
        socket.on('sendScores', function(scores0){
            socket.broadcast.emit('sendScores', scores0);
        });

        socket.on('disconnect', function () {
            clients = clients-0.5;
            console.log("We have clients: ", Math.floor(clients));
        });
    }
);

function newConnection(socket){
	//console.log('new connection: ' + socket.id);
	//console.log(socket.id);
	socket.on('mouse', mouseMsg);

	function mouseMsg(data) {
		socket.broadcast.emit('mouse', data);
		console.log(data);
    }

}