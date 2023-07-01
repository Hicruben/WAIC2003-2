const express = require('express');
const { set } = require('express/lib/application');
const app = express();

app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/imgs'));
app.use(express.static(__dirname + '/vids'));

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
let video_to_play = {
  "left": null,
  "middle": null,
  "right": null
}
// let obtained_knowleadge = {
//   1: false,
//   2: false,
//   3: false,
// }
app.get('/', (req, res) => {
  res.send('<h1>错误操作</h1>');
});

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
      if (left_ready == false) {
        left_ready = true;
        left_id = socket.id;
        console.log("左侧屏幕准备好了");
      } else {
        socket.emit('left_ready_acknowledge', "reject_repeat");
      }
    } else if (msg == "middle_ready") {
      if (middle_ready == false) {
        middle_ready = true;
        middle_id = socket.id;
        console.log("中间屏幕准备好了");
      } else {
        socket.emit('middle_ready_acknowledge', "reject_repeat");
      }
    } else if (msg == "right_ready") {
      if (right_ready == false) {
        right_ready = true;
        right_id = socket.id;
        console.log("右侧屏幕准备好了");
      } else {
        socket.emit('right_ready_acknowledge', "reject_repeat");
      }
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

  socket.on('notify_server_play_video', (msg) => {
    console.log("收到通知播放视频的请求");
    console.log(msg);
    io.emit('video_to_play', msg);
  });

  socket.on('notify_server_obtained_knowleadge', (msg) => {
    console.log("收到通知获得知识的请求");
    console.log(msg);
    // obtained_knowleadge[msg] = true;
    // if (obtained_knowleadge[1] && obtained_knowleadge[2] && obtained_knowleadge[3]) {
    video_to_play["left"] = 6;
    video_to_play["middle"] = 6;
    video_to_play["right"] = 6;
    io.emit('video_to_play', video_to_play);
    // }
  }
  );

  socket.on('notify_reset', (msg) => {
    console.log("收到重置的请求");
    console.log(msg);
    obtained_knowleadge = {
      1: false,
      2: false,
      3: false,
    }
    video_to_play["left"] = 1;
    video_to_play["middle"] = 1;
    video_to_play["right"] = 1;
    io.emit('video_to_play', video_to_play);
  }
  );

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
    io.emit('global_state', "all_ready");
    console.log("所有屏幕都准备好了");
    video_to_play["left"] = 1;
    video_to_play["middle"] = 1;
    video_to_play["right"] = 1;
    io.emit('video_to_play', video_to_play);
  } else {
    io.emit('global_state', "not_all_ready");
  }
}