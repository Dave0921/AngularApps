const express = require('express');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io', { rememberTransport: false, transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'] })(server);

let msgArray = [];
let userArray = [];
let noDupUserArray = [];

const port = process.env.PORT || 4200;

app.use(express.static(path.join(__dirname, 'dist')));

// TODO: Implement a database and store messages in the database; eg. MongoDB 
// TODO: Move random name generator to serverside

io.on('connection', (socket) => {
    let user;
    socket.on('disconnect', () => {
        let index = userArray.indexOf(user);
        if(index !== -1) userArray.splice(index, 1);
        noDupUserArray = userArray.filter((item, index, inputArray) => {
            return inputArray.indexOf(item) === index;
        });
        io.emit('user-disconnect', noDupUserArray);
    });
    socket.on('user-connected', (data) => {
        user = data;
            userArray.push(data);
            noDupUserArray = userArray.filter((item, index, inputArray) => {
                return inputArray.indexOf(item) === index;
            });
        io.emit('user-connected-received', {messagearray: msgArray, userarray: noDupUserArray});
    });
    // Server receiving messages
    socket.on('send-message', (data) => {
        // check if user wants to change nickname color
        if (data.text.startsWith('/nickcolor')) {
            let result = data.text.split(' ')[1];
            if (result === undefined || result === '' || result === null) return io.emit('display-error', 'Error: color cannot be blank');
            if (result.match(/[0-9A-Fa-f]/g) === null || ((result.length !== 6 && result.length !== 3) || result.match(/[0-9A-Fa-f]/g).length < result.length)) {
                return io.emit('display-error', 'Error: Entered text must be a valid HEX color');
            } 
            let nickNameColor = '#' + result;
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
            let newNickName = data.text.substring((data.text.indexOf(' ') + 1)).trim();
            let newNickNameLower = newNickName.toLowerCase();
            let newNickNameUpper = newNickName.toUpperCase();
            if (newNickName === '' || newNickName === null || newNickName === undefined) return io.emit('display-error', 'Error: nickname cannot be blank');
            for (let i =0; i<newNickName.length; i++) {
                if (newNickNameLower[i] === newNickNameUpper[i] && isNaN(newNickNameLower[i]) === true) {
                    return io.emit('display-error', 'Error: nickname cannot contain special characters');
                }
            };
            if (userArray.includes(newNickName)) {
                return io.emit('display-error', 'Error: nickname already exists');
            }
            msgArray.forEach((msg) => {
                if (msg.nickname === data.nickname) {
                    msg.nickname = newNickName;
                }
            });
            userArray.forEach((useritem, i) => {
                if (useritem === data.nickname) {
                    userArray[i] = newNickName;
                }
            });
            noDupUserArray = userArray.filter((item, index, inputArray) => {
                return inputArray.indexOf(item) === index;
            });
            user = newNickName;
            io.emit('change-nick', {nick: newNickName, messagearray: msgArray, userarray: noDupUserArray});
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