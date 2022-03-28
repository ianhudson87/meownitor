/* VIdeoPlayer.js */
import React, {Component} from 'react';
import AWS from 'aws-sdk'
import ReactHlsPlayer from 'react-hls-player'
import stream_options from '../secrets/secrets'

const streamName = 'catcam';
const playbackMode = 'LIVE'    

class VideoPlayer2 extends Component {
    constructor(props){
        super(props)
        this.state = {
            streamURL: ""
        }
        this.setStreamURL = this.setStreamURL.bind(this)
    }

    setStreamURL(){
        // Step 1: Configure SDK Clients
        var kinesisVideo = new AWS.KinesisVideo(stream_options);
        var kinesisVideoArchivedContent = new AWS.KinesisVideoArchivedMedia(stream_options);

        console.log('Fetching data endpoint');
        kinesisVideo.getDataEndpoint({
            StreamName: streamName,
            APIName: "GET_HLS_STREAMING_SESSION_URL"
            }, (err, response) => {
                if (err) { return console.error(err); }
                console.log('Data endpoint: ' + response.DataEndpoint);
                kinesisVideoArchivedContent.endpoint = new AWS.Endpoint(response.DataEndpoint);

                kinesisVideoArchivedContent.getHLSStreamingSessionURL({
                    StreamName: streamName,
                    PlaybackMode: playbackMode,
                    HLSFragmentSelector: {
                        FragmentSelectorType: 'SERVER_TIMESTAMP',
                        TimestampRange: playbackMode === "LIVE" ? undefined : {
                            StartTimestamp: new Date(),
                            EndTimestamp: new Date()
                            }
                        },
                        ContainerFormat: 'FRAGMENTED_MP4',
                        DiscontinuityMode: 'NEVER',
                        DisplayFragmentTimestamp: 'NEVER',
                        MaxMediaPlaylistFragmentResults: 5,
                        Expires: 300
                    }, (err, response) => {
                        if (err) { return console.error(err); }
                        // streamURL = response.HLSStreamingSessionURL
                        this.setState({streamURL: response.HLSStreamingSessionURL})
                        console.log('HLS Streaming Session URL: ' + response.HLSStreamingSessionURL);
                    }
                )
            }
        )
    }

    componentDidMount(){
        this.setStreamURL()
    }

    render() {
        console.log("streamurl", this.state.streamURL)
        return(
            <div>
                <ReactHlsPlayer
                    src={this.state.streamURL}
                    autoPlay={true}
                    controls={true}
                    width="40%"
                    height="auto"
                />,
            </div>
        )
	}
}
export default VideoPlayer2;