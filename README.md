# meownitor

## backend
This directory contains the files for the backend which contains API endpoints, MQTT topic subscription and publishing, socket events. The backend acts as communication between the frontend and the rest of the services and devices.

### Installation Instructions
Pull the folder. Navigate to the backend directory. Run ``npm install``.
The necessary keys for accesing IoT and Dynamo should be placed in the following folder: backend/config/

### How to run
Run npm start in the backend directory

## frontend
This directory containes files for displaying the data to the user.

### Installation Instructions
If running locally: pull the folder. Navigate the frontend directory. Run ``npm install``.

If running on ec2 instance: pull the folder. Navigate the frontend directory. Run ``npm install``. Run ``npm build``. Take the build folder and upload it to the instance.

### How to run
local: Run ``npm start`` in the frontend directory

ec2: use express to server the index.html file in the build folder on some port. Then forward port 80 (http) to the port you are serving your file on.

## cat-face-detection
This directory contains the file for pulling the video stream data and processing it to detect cat faces.

Simply pull the folder and run ``python hlsvideostream.py``.

## pi_520
This directory contains the files we created in order to gather data from our sensors and send it to our website. The folder should be pulled onto the Pi.

### Installation Instructions
1. Follow the installation instructions from [this link](https://docs.aws.amazon.com/iot/latest/developerguide/connecting-to-existing-device.html) to set up the Raspberry Pi and the necessary permissions from your AWS account.
  * Ensure you know the paths for the key and cert files
2. Install the necessary python dependencies from requirements.txt using ``pip3 install -r /path/to/requirements.txt``
3. Connect the camera to the pi camera port
4. Wire the BME 280 and MMA 2458Q sensors according to the diagram below
![image](https://user-images.githubusercontent.com/54560896/166551734-72d77cc6-c20f-444b-b33e-dd5c0c0e7dbf.png)

### How to run
To run the necessary files, multiple scripts have to be run at the same time. This can be achieved using screen or the & operator at the end of the command, and we chose the second option.  
**Before you can run these, the aws endpoint needs to be changed in `temp.sh` and `step.sh`. Your key and cert files will not work with the given endpoint**  
`sh step.sh &> step.out &`  
`sh temp.sh &> temp.out &`  
`python3 rpi_cam.py &> vid.out &`  


![image](https://user-images.githubusercontent.com/46661041/166402259-111fed23-1d9b-47c0-a0d2-8ecbf0f5daf4.png)
