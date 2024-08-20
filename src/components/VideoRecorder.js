import React, { useState, useRef, useEffect } from 'react';
import '../App.css';

const VideoRecorder = () => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const videoRef = useRef(null);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [isRecording]);

  const formatTime = (timeInSeconds) => {
    const minutes = String(Math.floor(timeInSeconds / 60)).padStart(2, '0');
    const seconds = String(timeInSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.style.display = 'block';
        }
        setIsRecording(true);
        setElapsedTime(0);
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = event => {
          if (event.data.size > 0) {
            setRecordedChunks(prev => [...prev, event.data]);
          }
        };
        recorder.start();
        setMediaRecorder(recorder);
      })
      .catch(error => {
        console.error('Error accessing media devices.', error);
      });
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    if (videoRef.current) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.style.display = 'none';
    }
    const recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
    uploadVideo(recordedBlob);
  };

  const uploadVideo = (blob) => {
    const formData = new FormData();
    formData.append('video', blob, 'recordedVideo.webm');

    fetch('https://videoresponse.onepgr.com:3000/upload', {
      method: 'POST',
      body: formData
      
    })
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error('Server returned ' + response.status + ' ' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        console.log('Upload successful:', data);
        alert('Video uploaded successfully!');
      })
      .catch(error => {
        console.error('Error uploading video:', error);
        alert('Error uploading video: ' + error.message);
      });
  };

  return (
    <div id="container">
      <p id="recordText" onClick={startRecording} style={{ display: isRecording ? 'none' : 'block' }}>
        Record a Video
      </p>
      <video id="videoElement" ref={videoRef} autoPlay></video>
      <div id="controls" style={{ display: isRecording ? 'flex' : 'none' }}>
        <span id="timer">{formatTime(elapsedTime)}</span>
        <button id="stopButton" onClick={stopRecording}>Stop Recording</button>
      </div>
    </div>
  );
};

export default VideoRecorder;