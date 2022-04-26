/* App.js */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import React, {Component} from 'react'
import { ENDPOINT } from '../config'

class LineChartTemplate extends Component {
  // Props:
  // data: data to display
  // data_key: the key of the data to display

  constructor(props){
    super(props)
    let d = new Date()
    let epoch_beginning_of_day = Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0).getTime() / 1000)
    let epoch_end_of_day = Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).getTime() / 1000)

    this.state = {
      "steps_history": [],
      "display_data_range": [epoch_beginning_of_day, epoch_end_of_day], // range in utc of time to show (in seconds)
    }
  }

  getSteps(){
    fetch(`${ENDPOINT}/data/steps`)
    .then(res => res.json())
    .then(
        (results) => {

          // sort items by date
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

          // move data into the state
          this.setState({
            // "steps": results.data[results.data.length-1].payload,
            "steps_history": results.data.map((item) => {
              return ({
                date: item.sort,
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

  componentDidMount(){
    this.getSteps()
    setInterval(() => {
      // this.addData()
      this.getSteps()
      console.log("get steps")
    }, 1000000);
  }

  crementDateInterval(de){
    let delta = de ? -3600*24 : 3600*24
    this.setState({
      "display_data_range": this.state.display_data_range.map(time => time + delta)
    })
  }

	render() {
    // results.data = results.data
    let steps_data = this.state.steps_history.filter((item) => {
      // ONLY GET THIS DAY
      return this.state.display_data_range[0] <= item.date && item.date <= this.state.display_data_range[1]
    }).map((elt) => {
      // TURN EPOCH INTO READABLE DATES
      let d = new Date(parseInt(elt.date)*1000)
      return {"date": `${(d.getHours()%12).toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`, "steps": elt.steps}
    })

    // console.log("render", this.state.display_data_range[0])

    let d = new Date(this.state.display_data_range[0] * 1000)
    let title = `Steps data on ${d.getMonth()+1}/${d.getDate()}`

		return (
      <div>
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
          <div><button onClick={ () => this.crementDateInterval(true) }>Back</button> </div>
          {title}
          <div><button onClick={ () => this.crementDateInterval(false) }>Forward</button></div>
        </div>
        <div>
        <ResponsiveContainer key={steps_data} width="100%" height={400}>
          <LineChart
            width={500}
            height={300}
            data={steps_data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" angle={315}/>
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={"steps"} stroke="#8884d8" activeDot={{ r: 8 }} isAnimationActive={false}/>
            {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
          </LineChart>
        </ResponsiveContainer>
        <button onClick={ () => this.getSteps() }>Refresh</button>
        </div>
      </div>
		);
	}
}
export default LineChartTemplate;