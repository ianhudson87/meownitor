/* App.js */
import React, {Component} from 'react'
import LineChartTemplate from './Components/LineChartTemplate'

console.log("node_env:", process.env.NODE_ENV)

let api_url
switch(process.env.NODE_ENV) {
  case 'production':
    api_url = 'http://ec2-52-204-45-92.compute-1.amazonaws.com:8080';
    break;
  case 'development':
  default:
    api_url = 'http://localhost:8080';
}

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      "data": null,
    }
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

  componentDidMount(){
    // get request for data
    fetch(`${api_url}/data/checkthisout`)
    .then(res => res.json())
    .then(
        (results) => {
          this.setState({
            "data": results.data
          })
          console.log(results)
        },
        (error) => {
          console.log(error)
        }

    )

    setInterval(() => {
      this.addData()
      /*
          Run any function or setState here
      */
    }, 1000);
  }

	render() {
		return (
      <div>
        <LineChartTemplate key={this.state.data} data={this.state.data}/>
        <text>{JSON.stringify(this.state.data)}</text>
      </div>
		);
	}
}
export default App;