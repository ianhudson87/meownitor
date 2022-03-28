// https://stackabuse.com/building-a-rest-api-with-node-and-express/
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const app = express();
const socketIo = require("socket.io");

let steps_goal = 10;
let steps_goal_reached = false;

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
const TIMER_UPDATE_PERIOD = 1

function updateTimer(){
  if (active_timer > 0 && active_timer - TIMER_UPDATE_PERIOD <= 0) {
    // going from active to not active
    io.emit("became_not_active")
  }
  active_timer = Math.max(0, active_timer - TIMER_UPDATE_PERIOD)
  setTimeout(updateTimer, TIMER_UPDATE_PERIOD * 1000)
}

updateTimer()

///////////////////// IOT CORE
var awsIot = require('aws-iot-device-sdk');
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
      console.log(current_steps)
    }
    // console.log('message', topic, payload.toString());
  });


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
});



const PORT = 8080;
server.listen(PORT, console.log(`Server started on port ${PORT}`));


// const test_data = [
//     {
//       name: 'Page A',
//       uv: 4000,
//       pv: 2400,
//       amt: 2400,
//     },
//     {
//       name: 'Page B',
//       uv: 3000,
//       pv: 1398,
//       amt: 2210,
//     },
//     {
//       name: 'Page C',
//       uv: 2000,
//       pv: 9800,
//       amt: 2290,
//     },
//     {
//       name: 'Page D',
//       uv: 2780,
//       pv: 3908,
//       amt: 2000,
//     },
//     {
//       name: 'Page E',
//       uv: 1890,
//       pv: 4800,
//       amt: 2181,
//     },
//     {
//       name: 'Page F',
//       uv: 2390,
//       pv: 3800,
//       amt: 2500,
//     },
//     {
//       name: 'Page G',
//       uv: 3490,
//       pv: 4300,
//       amt: 2100,
//     },
//   ];