const express = require('express');
const { set } = require('express/lib/application');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
let left_ready = false;
let middle_ready = false;
let right_ready = false;
let left_id = null;
let middle_id = null;
let right_id = null;

app.get('/left', (req, res) => {
  res.sendFile(__dirname + '/left.html');
});

app.get('/middle', (req, res) => {
  res.sendFile(__dirname + '/middle.html');
});

app.get('/right', (req, res) => {
  res.sendFile(__dirname + '/right.html');
});

io.on('connection', (socket) => {
  socket.on('server', (msg) => {
    if (msg == "left_ready") {
      left_ready = true;
      left_id = socket.id;
      console.log("左侧屏幕准备好了");
    } else if (msg == "middle_ready") {
      middle_ready = true;
      middle_id = socket.id;
      console.log("中间屏幕准备好了");
    } else if (msg == "right_ready") {
      right_ready = true;
      right_id = socket.id;
      console.log("右侧屏幕准备好了");
    }
    send_ready_state();
  });

  socket.on('disconnect', () => {
    if (socket.id == left_id) {
      left_ready = false;
      left_id = null;
      console.log("左侧屏幕断开连接");
    } else if (socket.id == middle_id) {
      middle_ready = false;
      console.log("中间屏幕断开连接");
      middle_id = null;
    } else if (socket.id == right_id) {
      right_ready = false;
      console.log("右侧屏幕断开连接");
      right_id = null;
    }
    send_ready_state();
  });
});


server.listen(3000, () => {
  console.log('listening on *:3000');
});

function if_all_ready() {
  if (left_ready && middle_ready && right_ready) {
    return true;
  } else {
    return false;
  }
}

function send_ready_state() {
  if (if_all_ready()) {
    io.emit('all', "all_ready");
    console.log("所有屏幕都准备好了");
  } else {
    io.emit('all', "not_all_ready");
  }
}