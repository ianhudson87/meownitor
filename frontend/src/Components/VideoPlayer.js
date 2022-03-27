/* VIdeoPlayer.js */
import React, {Component} from 'react';
import { SignalingClient } from 'amazon-kinesis-video-streams-webrtc';

// DescribeSignalingChannel API can also be used to get the ARN from a channel name.
const channelARN = 'arn:aws:kinesisvideo:us-west-2:123456789012:channel/test-channel/1234567890';

// AWS Credentials
const accessKeyId = 'ACCESS_KEY_ID_GOES_HERE';
const secretAccessKey = 'SECRET_ACCESS_KEY_GOES_HERE';

// <video> HTML elements to use to display the local webcam stream and remote stream from the master
const localView = document.getElementsByTagName('video')[0];
const remoteView = document.getElementsByTagName('video')[1];

const region = 'us-west-2';
const clientId = 'RANDOM_VALUE';


class VideoPlayer extends Component {
    constructor(props){
        super(props)
    }

    componentDidMount(){
        
    }

    render() {
	}
}
export default VideoPlayer;