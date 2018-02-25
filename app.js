const express = require('express');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io', { rememberTransport: false, transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'] })(server);

let msgArray = [];
let userArray = [];

const port = 4200;

app.use(express.static(path.join(__dirname, 'dist')));

// get chat logs
app.get('/api/chat',(req, res) => {
    res.json(msgArray);
});
app.get('/api/users',(req, res) => {
    res.json(userArray);
})

io.on('connection', (socket) => {
    let user;
    socket.on('disconnect', () => {
        console.log(user + ' has disconnected');
        let index = userArray.indexOf(user);
        if(index !== -1) userArray.splice(index, 1);
        io.emit('user-disconnect', userArray);
        // console.log(userArray);
    });
    socket.on('user-connected', (data) => {
        user = data;
        console.log(data + ' has connected');
        userArray.push(data);
        io.emit('user-connected-received', data);
        // console.log(userArray);
    });
    // Server receiving messages
    socket.on('send-message', (data) => {
        msgArray.push(data);
        if (msgArray.length > 200){
            msgArray.shift();
        }
        // console.log(msgArray);
        io.emit('message-received', data);
    });

});

server.listen(port,() => {
    console.log('Listening on port ' + port);
});