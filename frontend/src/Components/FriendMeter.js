import {React, Component } from 'react';
import {socket} from '../socket';
import {socialImages} from '../assets/images'

const num_gifs = 3

class FriendMeter extends Component {
    constructor(props){
      super(props)
      this.state = {
          'isSocial': false,
          'gif_index': 0,
          'friendship_meter': 0
      }
    }

    randomize_gif(){
        this.setState({
            'gif_index': Math.floor(Math.random()*num_gifs),
        })
    }

    componentDidMount(){
        // connect to socket
        this.randomize_gif()

        socket.on("became_social", () => {
            this.randomize_gif()
            this.setState({
              "isSocial": true
            })
        })
      
        socket.on("became_not_social", () => {
            this.randomize_gif()
            this.setState({
              "isSocial": false
            })
        })

        socket.on("send_friendship_meter", (data)=>{
            this.setState({
                'friendship_meter': data.friendship_meter
            })
        })
    }

    render(){
        let text = this.state.isSocial ? <h1 style={{ color: 'green' }}>being social</h1> : <h1 style={{ color: 'red' }}>social distancing</h1>
        let image = this.state.isSocial ? socialImages['social'][this.state.gif_index] : socialImages['alone'][this.state.gif_index]
        console.log("kitty is:", this.state.isSocial)
        console.log("social image", image)
        
        return(
            <div>
                <div>
                    Your kitty is currently {text}
                    Your kitty's friendship points {this.state.friendship_meter} 🐈
                </div>
                <div>
                    <img src={image} height={150}/>
                </div>
            </div>

            // {text}
        )
        
    }

}

export default FriendMeter;