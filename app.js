const express = require('express');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const port = 4300;

app.use(express.static(path.join(__dirname, 'dist')));

io.on('connection', (socket)=>{
    console.log('new user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    // Test Messages
    // socket.on('send-message', (data) => {
    //     console.log(data.text);
    //     io.emit('message-received', data);
    // });

});

server.listen(port,()=>{
    console.log('Listening on port ' + port);
});