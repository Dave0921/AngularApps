const express = require('express');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io', { rememberTransport: false, transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'] })(server);
const MongoClient = require('mongodb').MongoClient;
const crypto = require('crypto');

let msgArray = [];
let userArray = [];

const port = process.env.PORT || 4200;

app.use(express.static(path.join(__dirname, 'dist')));

// TODO: Implement a database and store messages in the database; eg. MongoDB 
const mongodbUrl = 'mongodb://localhost:27017/db';
// TODO: Move random name/id generator to serverside

io.on('connection', (socket) => {
    let user;
    console.log(`client id: ${socket.id}`);
    socket.on('disconnect', () => {
        let index = userArray.indexOf(user);
        if(index !== -1) userArray.splice(index, 1);
        userArray = userArray.filter((item, index, inputArray) => {
            return inputArray.indexOf(item) === index;
        });
        io.emit('user-disconnect', userArray);
    });
    socket.on('user-connected', (data) => {
        user = data;
        if (userArray.indexOf(user) === -1) userArray.push(user);
        // Store messages in local MongoDB messages collection
        let database;
        MongoClient.connect(mongodbUrl).then((db) => {
            database = db;
            const dbo = db.db('db');
            return dbo.collection('messages').find({}).toArray();
        }).then((items) => {
            msgArray = items;
            io.emit('user-connected-received', {messageArray: items, userArray: userArray});
        }).then(() => {
            database.close(true);
        }).catch(err => {
            database.close(true);
            console.log('Unable to connect to server', err);
        });
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
            // Store nickname color change into local MongoDB messages collection
            const query = { nickname: data.nickname};
            const newNickNameColor = { $set: {nicknamecolor: nickNameColor} };
            let database;
            MongoClient.connect(mongodbUrl).then((db) => {
                database = db;
                const dbo = db.db('db');
                return dbo.collection('messages');
            }).then((items) => {
                return items.updateMany(query, newNickNameColor);
            }).then(() => {
                database.close(true);
            }).catch(err => {
                database.close(true);
                console.log('Unable to connect to server', err);
            });
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
            user = newNickName;
            io.emit('change-nick', {nick: newNickName, messagearray: msgArray, userarray: userArray});
            // Store nickname change into local MongoDB messages collection
            const query = { nickname: data.nickname};
            const newNickNameValue = { $set: {nickname: newNickName} };
            let database;
            MongoClient.connect(mongodbUrl).then((db) => {
                database = db;
                const dbo = db.db('db');
                return dbo.collection('messages');
            }).then((items) => {
                return items.updateMany(query, newNickNameValue);
            }).then(() => {
                database.close(true);
            }).catch(err => {
                database.close(true);
                console.log('Unable to connect to server', err);
            });
        }
        // else store message in array of messages
        else {
            msgArray.push(data);
            if (msgArray.length > 200){
                msgArray.shift();
            }
            let database;
            // Push sent message by client to local MongoDB messages collection
            MongoClient.connect(mongodbUrl).then((db) => {
                database = db;
                const dbo = db.db('db');
                return dbo.collection('messages');
            }).then((items) => {
                return items.insertOne(data);
            }).then((res) => {
                database.close(true);
            }).catch(err => {
                database.close(true);
                console.log('Unable to connect to server', err);
            });
            io.emit('message-received', data);
        }
    });

});

server.listen(port,() => {
    console.log('Listening on port ' + port);
});

function generateRandomId() {
    return crypto.randomBytes(16).toString('hex');
}