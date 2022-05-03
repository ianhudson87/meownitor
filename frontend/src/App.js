/* App.js */
import React, {Component, useEffect} from 'react';
import LineChartTemplate from './Components/LineChartTemplate'
import VideoPlayer from './Components/VideoPlayer'
import IsActive from './Components/IsActive'
import { LineChart } from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ENDPOINT } from './config'
import { socket } from './socket'
import FriendMeter from './Components/FriendMeter'
import AirQuality from './Components/AirQuality'

class App extends Component {
  constructor(props){
    super(props)
        this.state = {
      // "data": null,
      "steps_goal": null,
      "new_steps_goal": 0,
    }
    this.handleGoalInput = this.handleGoalInput.bind(this)
    this.handleGoalButton = this.handleGoalButton.bind(this)
  }

  handleGoalInput(event) {
    console.log("here")
    const value = event.target.value
    this.setState({
      "new_steps_goal": value,
    })
  }

  handleGoalButton() {
    socket.emit("change_goal_steps", {
      "goal": this.state.new_steps_goal
    })
  }

  componentDidMount(){
    // connect to socket

    socket.on("connect", () => {
      console.log("hi, i just connected to sock it")
      socket.emit("get_steps_goal")
    })

    socket.on("send_steps_goal", (data) => {
      console.log("got steps_goal")
      this.setState({
        "steps_goal": data.steps_goal,
        "new_steps_goal": data.steps_goal
      })
    })

    const script = document.createElement('script');
    script.src = "https://unpkg.com/amazon-kinesis-video-streams-webrtc/dist/kvs-webrtc.min.js";
    script.async = true;
    document.body.appendChild(script);
  }

	render() {
    // console.log(this.state.steps_history)
    // console.log(steps_data)

    // let steps_text = this.state.steps ? `Your kitty has taken ${this.state.steps} steps today!` : "no data today"

		return (
      <div class="container bg-light m-5 p-5">
        {/* <LineChartTemplate key={this.state.data} data={this.state.data} data_key={"pv"}/> */}
        <div class="row border m-5 p-5">
          <LineChartTemplate data_key={"steps"}/>
        </div>
        <div class="row border m-5 p-5">
          {/* <div class="center-block" style="width:400px;"> */}
          <div class="col-sm border border-primary rounded m-3 p-2">
            <IsActive />
          </div>
          <div class="col-sm border border-secondary rounded m-3 p-2">
          <div class="col-sm border border-warning rounded m-3 p-2">
            <input name="steps_goal" type="number" value={(this.state.new_steps_goal)} onChange={this.handleGoalInput}/>
            <button onClick={this.handleGoalButton}> Change Goal </button>
            <br/>
            current steps goal = {this.state.steps_goal}
          </div>
          </div>
          <div class="col-sm border border-secondary rounded m-3 p-2 bg-dark">
            <AirQuality />
          </div>
        </div>
        <div class="row border m-5 p-5">
          <FriendMeter />
        </div>
        <div class="row border m-5 p-5">
          <div style={{backgroundColor: "lightblue"}} class="bg-secondary border-success rounded p-5">
            <VideoPlayer />
          </div>
        </div>
      </div>
		);
	}
}
export default App;