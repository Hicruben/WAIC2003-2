const express = require('express');
const { set } = require('express/lib/application');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/gong', (req, res) => {
  res.sendFile(__dirname + '/gong.html');
});

app.get('/zhan', (req, res) => {
  res.sendFile(__dirname + '/zhan.html');
});

app.get('/fang', (req, res) => {
  res.sendFile(__dirname + '/fang.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    socket.on('fight', (msg) => {
      console.log('fight: ' + msg);
      if(msg == "1"){
        io.emit('fightback', "第一轮开始了");
        setTimeout(() => {
          io.emit('watch', "开始观战：第一轮");
        }, 500);
        setTimeout(() => { 
          io.emit('defense', "开始防守：第一轮");
        }, 1000);
      }else if(msg == "2"){
        io.emit('fightback', "第二轮开始了");
        setTimeout(() => {
          io.emit('watch', "开始观战：第二轮");
        }, 500);
        setTimeout(() => {
          io.emit('defense', "开始防守：第二轮");
        }, 1000);
      }else if(msg == "3"){
        io.emit('fightback', "第三轮开始了");
        setTimeout(() => {
          io.emit('watch', "开始观战：第三轮");
        }, 500);
        setTimeout(() => {
          io.emit('defense', "开始防守：第三轮");
        }, 1000);
      }
    });
  });

server.listen(3000, () => {
  console.log('listening on *:3000');
});