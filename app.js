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
    // Server side messages
    socket.on('send-message', (data) => {
        msgArray.push(data);
        if (msgArray.length > 200){
            msgArray.slice(1, 200);
        }
        console.log(msgArray);
        io.emit('message-received', data);
    });

});

server.listen(port,()=>{
    console.log('Listening on port ' + port);
});