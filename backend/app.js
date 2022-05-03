// https://stackabuse.com/building-a-rest-api-with-node-and-express/
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const app = express();
const socketIo = require("socket.io");

const COLD_TEMP = 20
let kitty_is_cold = false
const HUMID_THRESH = 27
let kitty_is_humid = false

let steps_goal = 40;
let steps_goal_reached = false;
let hls_stream_url = null;

const server = http.createServer(app);
var io = socketIo(server,{
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let active_timer = 0
const ACTIVE_TIMER_CUSHION = 5
let friendship_timer = 0
const FRIENDSHIP_TIMER_CUSHION = 5
let friendship_meter = 0

const TIMER_UPDATE_PERIOD = 1

function updateTimers(){
  if(friendship_timer > 0){
    friendship_meter += 1
  }

  io.emit("send_friendship_meter", {
    "friendship_meter": friendship_meter
  })

  if (active_timer > 0 && active_timer - TIMER_UPDATE_PERIOD <= 0) {
    // going from active to not active
    io.emit("became_not_active")
  }

  if (friendship_timer > 0 && friendship_timer - TIMER_UPDATE_PERIOD <= 0) {
    // going from active to not active
    console.log("became_not_social")
    io.emit("became_not_social")
  }

  active_timer = Math.max(0, active_timer - TIMER_UPDATE_PERIOD)
  friendship_timer = Math.max(0, friendship_timer - TIMER_UPDATE_PERIOD)
  setTimeout(updateTimers, TIMER_UPDATE_PERIOD * 1000)
}

updateTimers()

///////////////////// IOT CORE
var awsIot = require('aws-iot-device-sdk');
// import {mqtt} from 'aws-iot-device-sdk'
const iot_config = require('./config/iot_config.js')
var device = awsIot.device(iot_config);

function steps_goal_reached_notify(){
  device.publish('steps_goal_sms_topic', `your kitty has reached the steps goal of: ${steps_goal} steps`)
}

// steps_goal_reached_notify()

device
  .on('connect', function() {
    // console.log('connect');
    device.subscribe('active_topic'); // tells us if cat is active
    device.subscribe('step_topic');
    device.subscribe('bme_topic')
    // device.publish('topic_2', JSON.stringify({ test_data: 1}));
  });

device
  .on('message', function(topic, payload) {
    if (topic == "active_topic"){
      console.log("I took a step!")
      if(active_timer == 0){
        io.emit("became_active")
      }
      active_timer = ACTIVE_TIMER_CUSHION
    }
    else if(topic == "step_topic"){
      console.log(payload.toString())
      let payload_json = JSON.parse(payload.toString())
      let current_steps = payload_json["payload"]
      if(current_steps < steps_goal && steps_goal_reached == true){
        steps_goal_reached = false
      }
      else if(current_steps >= steps_goal && steps_goal_reached == false) {
        steps_goal_reached = true
        steps_goal_reached_notify()
      }
      device.publish('latency_topic', JSON.stringify({
          "send_time": payload_json["sort"]
        })
      )

      console.log(current_steps)
    }
    else if(topic == "bme_topic"){
      console.log("got bme_topic")
      let payload_json = JSON.parse(payload.toString())
      io.emit("send_air_quality", {
          "temp": payload_json.payload.temp,
          "humidity": payload_json.payload.humidity,
          "pressure": payload_json.payload.pressure
      })

      checkIfCold(payload_json)
      checkIfHumid(payload_json)
    }
  });


function checkIfCold(payload_json){
  if(payload_json.payload.temp <= COLD_TEMP){
    if(!kitty_is_cold){
      // we didn't know kitty is cold
      kitty_is_cold = true
      // we know kitty is cold
      device.publish('steps_goal_sms_topic', `your kitty might be cold. BRRRRRRR. Your kitty is in an area less than ${COLD_TEMP} degrees celsius`)
    }
  }

  if(payload_json.payload.temp > COLD_TEMP){
    if(kitty_is_cold){
      // kitty was cold
      kitty_is_cold = false
      // kitty is not cold anymore
      device.publish('steps_goal_sms_topic', `your kitty is back to a warmer area`)
    }
  }
}

function checkIfHumid(payload_json){
  if(payload_json.payload.humidity <= HUMID_THRESH){
    if(kitty_is_humid){
      // we didn't know kitty is cold
      kitty_is_humid = false
      // we know kitty is cold
      device.publish('steps_goal_sms_topic', `much humidity no longer`)
    }
  }

  if(payload_json.payload.humidity > HUMID_THRESH){
    if(!kitty_is_humid){
      // kitty was cold
      kitty_is_humid = true
      // kitty is not cold anymore
      device.publish('steps_goal_sms_topic', `much humidity now`)
    }
  }
}
///////////////////// Dynamo
var AWS = require("aws-sdk");
const dynamo_config = require('./config/dynamo_config.js');
const { emit } = require("process");

function getSteps(req, res){
  AWS.config.update(dynamo_config.aws_remote_config);
  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: dynamo_config.aws_table_name
  };
  console.log(params)

  docClient.scan(params, function (err, data) {

    if (err) {
        console.log("ERR")
        console.log(err)
    } else {
        const { Items } = data;
        console.log(data.Items.length + "ITEMS")
        res.json({
          data: Items
        })
    }
  });
}


// API STUFF//////////////////////////
app.get("/data/test/:testvar", (req, res) => {
    // console.log(req)
    const testvar = req.params.testvar
    console.log(testvar + "asdf")

    res.json({
        message: "Hello from server!" + testvar,
        // data: test_data,
    });
});

app.get("/data/steps", (req, res) => {
  getSteps(req, res)
});

app.get("/data/hls_url", (req, res) => {
  console.log("I'M HERE")
  res.json({
    url: hls_stream_url,
  });
});

app.post("/data/is_looking_at_friend", (req, res) => {
  // console.log("here")
  // if(friendship_timer == 0){
  friendship_timer = FRIENDSHIP_TIMER_CUSHION
  // }
  io.emit("became_social")
  res.json({
    status: "success"
  })
})

//////////////////////////////////////
// SOCKET STUFF
function sendStepsGoal(socket){
  socket.emit("send_steps_goal", {
    "steps_goal": steps_goal
  })
}

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    // clearInterval(interval);
  });

  socket.on("get_steps_goal", () => {
    console.log("get steps goal")
    sendStepsGoal(socket)
  })

  socket.on("change_goal_steps", (data) => {
    steps_goal = data.goal
    sendStepsGoal(socket)
    steps_goal_reached = false
  })

  socket.on("set_stream_url", (data) => {
    console.log("got url")
    hls_stream_url = data['url']
  })

  socket.on("latency_test", ()=>{
    // device.publish('latency_topic', JSON.stringify({"payload": "hi"}))
  })
});



const PORT = 8080;
server.listen(PORT, console.log(`Server started on port ${PORT}`));