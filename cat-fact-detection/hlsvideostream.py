import cv2
import sys
import requests
from datetime import datetime, timedelta
# faceCascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
# faceCascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")
# faceCascade = cv2.CascadeClassifier("stop_data.xml")
faceCascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalcatface_extended.xml")

# VIDEO_URL = "https://b-5c274045.kinesisvideo.us-east-1.amazonaws.com/hls/v1/getHLSMasterPlaylist.m3u8?SessionToken=CiAVKLoiXUErXdJUf8PjRn4Xx35kz4KM7Mu7aufiWGBzXBIQ5r6J6Nr-o0JaIlwaFlosuRoZXaIWBzj1H_CBwyNhdpCDRdrD94sx2EcOSSIgc5S4SIoIZnkyRlGR0xoASanF1PbSi9DSFz28_gGZFRg~"
VIDEO_URL = "http://172.27.62.203:8000/stream.mjpg"
API_URL = "http://localhost:8080/data/is_looking_at_friend"

cap = cv2.VideoCapture(VIDEO_URL)
cap.set(cv2.CAP_PROP_BUFFERSIZE, 0)

if (cap.isOpened() == False):
    print('!!! Unable to open URL')
    sys.exit(-1)

# retrieve FPS and calculate how long to wait between each frame to be display
fps = 60
detect_fps = 1
wait_ms = int(1000/fps)
print('FPS:', fps)
count = 0

next_frame = datetime.now()
next_detect = datetime.now()

while(True):
    if datetime.now() >= next_frame:
        ret, img = cap.read()
        next_frame += timedelta(seconds = 1/fps)
        
        if datetime.now() >= next_detect:
            print("detect")
            imgGray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            imgGray = cv2.flip(imgGray, 0)
            faces = faceCascade.detectMultiScale(imgGray, 1.3, 5)
            if(len(faces) > 0):
                print("send api call")
                requests.post(API_URL)
            next_detect += timedelta(seconds = 1/detect_fps)

cap.release()
cv2.destroyAllWindows()