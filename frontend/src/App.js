/* App.js */
import React, {Component, useEffect} from 'react';
import LineChartTemplate from './Components/LineChartTemplate'
import VideoPlayer2 from './Components/VideoPlayer2'
import io from "socket.io-client";
import { LineChart } from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';
// import LiveFeedView from './Components/LiveFeedView';

console.log("node_env:", process.env.NODE_ENV)

let ENDPOINT
switch(process.env.NODE_ENV) {
  case 'production':
    ENDPOINT = 'http://ec2-52-204-45-92.compute-1.amazonaws.com:8080';
    break;
  case 'development':
  default:
    ENDPOINT = 'http://localhost:8080';
}

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      // "data": null,
      "steps": null,
      "steps_history": [],
      "isActive": false,
      "steps_goal": null,
      "new_steps_goal": 0,
    }
    this.handleGoalInput = this.handleGoalInput.bind(this)
    this.handleGoalButton = this.handleGoalButton.bind(this)
    this.socket = null
  }

  addData(){
    let current_data = this.state.data
    current_data.push({
      name: 'Page A',
      uv: 500,
      pv: 300,
      amt: 300,
    },)
    this.setState({
      "data": current_data
    })
    // console.log(this.state.data)
  }

  getSteps(){
    fetch(`${ENDPOINT}/data/steps`)
    .then(res => res.json())
    .then(
        (results) => {
          // console.log(results)
          results.data.sort((a, b) => {
            switch(parseInt(a.sort) < parseInt(b.sort)){
              case true:
                return -1
              case false:
              default:
                return 1
            }
            // oldest first
            // return a.sort < str(b.sort)
          })
          console.log(results.data)
          this.setState({
            "steps": results.data[results.data.length-1].payload,
            "steps_history": results.data.map((item) => {
              return ({
                name: item.sort,
                steps: item.payload,
              })
            })
          })
          console.log(this.state)
        },
        (error) => {
          console.log(error)
        }
    )
  }

  handleGoalInput(event) {
    console.log("here")
    const value = event.target.value
    this.setState({
      "new_steps_goal": value,
    })
  }

  handleGoalButton() {
    this.socket.emit("change_goal_steps", {
      "goal": this.state.new_steps_goal
    })
  }

  componentDidMount(){
    // connect to socket
    this.getSteps()
    this.socket = io(ENDPOINT);

    this.socket.on("connect", () => {
      console.log("hi, i just connected to sock it")
      this.socket.emit("get_steps_goal")
    })

    this.socket.on("became_active", () => {
      this.setState({
        "isActive": true
      })
    })

    this.socket.on("became_not_active", () => {
      this.setState({
        "isActive": false
      })
    })

    this.socket.on("send_steps_goal", (data) => {
      console.log("got steps_goal")
      this.setState({
        "steps_goal": data.steps_goal
      })
    })

    // get steps

    // get request for data
    fetch(`${ENDPOINT}/data/test/checkthisout`)
    .then(res => res.json())
    .then(
        (results) => {
          // this.setState({
          //   "data": results.data
          // })
          console.log(results)
        },
        (error) => {
          console.log(error)
        }
    )

    setInterval(() => {
      // this.addData()
      this.getSteps()
      /*
          Run any function or setState here
      */
    }, 10000);

    const script = document.createElement('script');
    script.src = "https://unpkg.com/amazon-kinesis-video-streams-webrtc/dist/kvs-webrtc.min.js";
    script.async = true;
    document.body.appendChild(script);
  }

  

	render() {
    console.log(this.state.steps_history)
    let steps_data = this.state.steps_history.map((elt) => {
      let d = new Date(parseInt(elt.name)*1000)
      return {"name": `${d.getHours()%12}:${d.getMinutes()}`, "steps": elt.steps}
    })
    console.log(steps_data)


		return (
      <div class="container">
        {/* <LineChartTemplate key={this.state.data} data={this.state.data} data_key={"pv"}/> */}
        <div class="row">
          <LineChartTemplate key={this.state.steps_history} data={steps_data.slice(-30)} data_key={"steps"}/>
        </div>
        <div class="row">
          {/* <div class="center-block" style="width:400px;"> */}
          <div class="col-sm">
            Your kitty has taken {this.state.steps} steps!
          </div>
          <div class="col-sm">
            Your kitty is currently {this.state.isActive ? <h1 style={{ color: 'green' }}>active</h1> : <h1 style={{ color: 'red' }}>sleeping or chilling</h1>}  
          </div>
          <div class="col-sm">
            <input name="steps_goal" type="number" value={(this.state.new_steps_goal)} onChange={this.handleGoalInput}/>
            <button onClick={this.handleGoalButton}> Change Goal </button>
            current steps goal = {this.state.steps_goal}
          </div>
        </div>
        <div class="row">
          <VideoPlayer2 />
        </div>
      </div>
		);
	}
}
export default App;