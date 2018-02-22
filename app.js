const express = require('express');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

let msgArray = [];

const port = 4200;

app.use(express.static(path.join(__dirname, 'dist')));

// get chat logs
app.get('/api/chat',(req, res)=>{
    res.json(msgArray);
});

io.on('connection', (socket)=>{
    console.log('new user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    // Test Messages
    socket.on('send-message', (data) => {
        console.log(data.text);
        msgArray.push(JSON.stringify(data));
        msgArray.slice(0, 199);
        console.log(msgArray);
        io.emit('message-received', data);
    });

});

server.listen(port,()=>{
    console.log('Listening on port ' + port);
});