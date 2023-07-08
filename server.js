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

const five = require("johnny-five");
const pixel = require("node-pixel");

const opts = {};
opts.port = process.argv[2] || "";

const board = new five.Board(opts);
let strip = null;
let ledStyle = 1;
led_move = false;

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


server.listen(3200, () => {
  console.log('listening on *:3200');
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
    led_all_white_ready();
    video_to_play["left"] = 1;
    video_to_play["middle"] = 1;
    video_to_play["right"] = 1;
    io.emit('video_to_play', video_to_play);
  } else {
    io.emit('global_state', "not_all_ready");
  }
}

function led_one_move_forward() {
  let colors = ["red", "green", "blue"];
  let current_color = 0;
  let current_pixel = 0;

  setInterval(function () {

    strip.color("#000"); // Turn off all LEDs
    strip.pixel(current_pixel).color(colors[current_color]); // Turn on the current pixel with the selected color

    strip.show();

    // Move to the next pixel and color
    current_pixel++;
    if (current_pixel >= strip.length) {
      current_pixel = 0;
      current_color++;
      if (current_color >= colors.length) {
        current_color = 0;
      }
    }
  }, 1000 / 5);
}

function led_12_move_on_white() {
  const numLeds = strip.length;
  const ballColors = ["#000080", "#000080", "#000080", "#000080", "#000080", "#000080", "#000080", "#000080"]; // 深海蓝
  // const ballColors = ["#40E0D0", "#40E0D0", "#40E0D0", "#40E0D0", "#40E0D0", "#40E0D0", "#40E0D0", "#40E0D0"]; // 珊瑚蓝

  const ballSize = 16; // Number of LEDs for each ball
  let currentPosition = 0;

  setInterval(function () {
    strip.color("#FFFFFF"); // Set all LEDs to off

    // Set the current position LEDs to the respective colors
    for (let i = 0; i < ballSize; i++) {
      const ledIndex = (currentPosition + i) % numLeds;
      const ballIndex = Math.floor(i / ballSize * ballColors.length);
      strip.pixel(ledIndex).color(ballColors[ballIndex]);
    }

    strip.show();

    // Move the position forward
    currentPosition = (currentPosition + 1) % numLeds;
  }, 50); // Adjust the interval as per your preference
}

function led_12_move_on_white_backwards() {
  const numLeds = strip.length;
  const ballColors = ["#000080", "#000080", "#000080", "#000080", "#000080", "#000080", "#000080", "#000080"]; // 深海蓝
  // const ballColors = ["#40E0D0", "#40E0D0", "#40E0D0", "#40E0D0", "#40E0D0", "#40E0D0", "#40E0D0", "#40E0D0"]; // 珊瑚蓝

  const ballSize = 8; // Number of LEDs for each ball
  let currentPosition = 0;

  setInterval(function () {
    strip.color("#FFFFFF"); // Set all LEDs to off

    // Set the current position LEDs to the respective colors
    for (let i = 0; i < ballSize; i++) {
      const ledIndex = (currentPosition + i) % numLeds;
      const ballIndex = Math.floor(i / ballSize * ballColors.length);
      strip.pixel(ledIndex).color(ballColors[ballIndex]);
    }

    strip.show();

    // Move the position backward
    currentPosition = (currentPosition - 1) % numLeds;
  }, 100); // Adjust the interval as per your preference


}

function led_all_white_ready() {
  strip.color("#FFFFFF");
  strip.show();
}


board.on("ready", function () {

  console.log("Board ready, lets add light");

  strip = new pixel.Strip({
    data: 6,
    length: 144, // 这个数量应该和你的LED灯数量一样
    board: this,
    controller: "FIRMATA",
  });

  strip.on("ready", function () {
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
        if (msg["left"] == 3 || msg["left"] == 4 || msg["left"] == 5) {
          if(!led_move){
            led_12_move_on_white();
            led_move=!led_move;
          }
        } else {
          // led_all_white_ready();
        }
      });

      socket.on('notify_server_obtained_knowleadge', (msg) => {
        console.log("收到通知获得知识的请求");
        console.log(msg);
        // obtained_knowleadge[msg] = true;
        // if (obtained_knowleadge[1] && obtained_knowleadge[2] && obtained_knowleadge[3]) {
        if (msg == 1) {
          video_to_play["left"] = 3;
          video_to_play["middle"] = 6;
        } else if (msg == 2) {
          video_to_play["left"] = 4;
          video_to_play["middle"] = 7;
        } else if (msg == 3) {
          video_to_play["left"] = 5;
          video_to_play["middle"] = 8;
        }
        video_to_play["right"] = 6;
        io.emit('showbtn', 'complete');
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
        if(led_move){
          led_all_white_ready();
          led_move=!led_move;
        }
      }
      );

      socket.on('notify_show_complete', (msg) => {
        console.log("要求查看完整报告");
        video_to_play["left"] = msg;
        video_to_play["middle"] = 9;
        video_to_play["right"] = 6;
        io.emit('video_to_play', video_to_play);
      }
      );

    });

  });
});