const express = require('express');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io', { rememberTransport: false, transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'] })(server);

let msgArray = [];
let userArray = [];

const port = process.env.PORT || 4200;

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
        io.emit('user-connected-received', {messagearray: msgArray, userarray: userArray});
    });
    // Server receiving messages
    socket.on('send-message', (data) => {
        // check if user wants to change nickname color
        if (data.text.startsWith('/nickcolor')) {
            let nickNameColor = '#' + data.text.split(' ')[1];
            msgArray.forEach((msg) => {
                if (msg.nickname === data.nickname) {
                    msg.nicknamecolor = nickNameColor;
                }
            });
            data.nicknamecolor = nickNameColor;
            io.emit('change-nick-color', {msg: data, messagearray: msgArray});
        }
        // check if user wants to change nickname
        else if (data.text.startsWith('/nick')) {
            let newNickName = data.text.substring((data.text.indexOf('<') + 1), data.text.indexOf('>'));
            if (userArray.includes(newNickName)) {
                return console.log('Error: nickname already exists');
            }
            msgArray.forEach((msg) => {
                if (msg.nickname === data.nickname) {
                    msg.nickname = newNickName;
                }
            });
            let index = userArray.indexOf(data.nickname);
            if (index !== -1) {
                userArray[index] = newNickName;
            }
            user = newNickName;
            io.emit('change-nick', {nick: newNickName, messagearray: msgArray, userarray: userArray});
        }
        // else store message in array of messages
        else {
            msgArray.push(data);
            if (msgArray.length > 200){
                msgArray.shift();
            }
            io.emit('message-received', data);
        }
    });

});

server.listen(port,() => {
    console.log('Listening on port ' + port);
});