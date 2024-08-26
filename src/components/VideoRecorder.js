import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { CameraVideoFill } from 'react-bootstrap-icons';
import { BriefcaseFill } from 'react-bootstrap-icons';
import '../App.css';

const VideoRecorder = () => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedVideos, setRecordedVideos] = useState({
    question1: null,
    question2: null
  });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [recordingSuccess, setRecordingSuccess] = useState({
    question1: false,
    question2: false
  });

  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const timerIntervalRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    jobTitle: '',
    company: '',
    location: '',
    linkedinUrl: '',
    hearAbout: '',
    interest: '',
    skills: '',
    challenge: '',
    salary: '',
    relocate: '',
  });

  const [formErrors, setFormErrors] = useState({});

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.phone.trim()) errors.phone = 'Phone Number is required';
    if (!formData.jobTitle.trim()) errors.jobTitle = 'Current Job Title is required';
    if (!formData.company.trim()) errors.company = 'Current Company is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.linkedinUrl.trim()) errors.linkedinUrl = 'LinkedIn Profile URL is required';
    if (!formData.hearAbout.trim()) errors.hearAbout = 'This field is required';
    if (!formData.interest.trim()) errors.interest = 'This field is required';
    if (!formData.skills.trim()) errors.skills = 'This field is required';
    if (!formData.challenge.trim()) errors.challenge = 'This field is required';
    if (!formData.salary.trim()) errors.salary = 'Salary expectations are required';
    if (!formData.relocate.trim()) errors.relocate = 'Please indicate if you are willing to relocate';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const startRecording = (questionNumber) => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        const videoRef = questionNumber === 1 ? videoRef1.current : videoRef2.current;
        if (videoRef) {
          videoRef.srcObject = stream;
          videoRef.style.display = 'block';
        }
        setIsRecording(true);
        setElapsedTime(0);
        setCurrentQuestion(questionNumber);
        const recorder = new MediaRecorder(stream);
        const chunks = [];
        recorder.ondataavailable = event => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          setRecordedVideos(prev => ({
            ...prev,
            [`question${questionNumber}`]: blob
          }));
          setRecordingSuccess(prev => ({
            ...prev,
            [`question${questionNumber}`]: true
          }));
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
    setCurrentQuestion(null);
    const videoRef = currentQuestion === 1 ? videoRef1.current : videoRef2.current;
    if (videoRef) {
      videoRef.srcObject.getTracks().forEach(track => track.stop());
      videoRef.style.display = 'none';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm() && recordedVideos.question1 && recordedVideos.question2) {
      const submitFormData = new FormData();


      Object.keys(formData).forEach(key => {
        submitFormData.append(key, formData[key]);
      });


      submitFormData.append('video1', recordedVideos.question1, 'video1.webm');
      submitFormData.append('video2', recordedVideos.question2, 'video2.webm');


      fetch('https://videoresponse.onepgr.com:3000/upload', {
        method: 'POST',
        body: submitFormData,
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Server returned ' + response.status + ' ' + response.statusText);
          }
          return response.json();
        })
        .then(data => {
          console.log('Upload successful:', data);
          alert('Application submitted successfully!');
          setFormData({
            fullName: '',
            email: '',
            phone: '',
            jobTitle: '',
            company: '',
            location: '',
            linkedinUrl: '',
            hearAbout: '',
            interest: '',
            skills: '',
            challenge: '',
            salary: '',
            relocate: '',
            jobReqUrl: '',
          });
          setRecordedVideos({
            question1: null,
            question2: null
          });
          setRecordingSuccess({
            question1: false,
            question2: false
          });
          setFormErrors({});
          if (videoRef1.current) videoRef1.current.src = '';
          if (videoRef2.current) videoRef2.current.src = '';
          window.scrollTo(0, 0);
        })
        .catch(error => {
          console.error('Error submitting application:', error);
          alert('Error submitting application: ' + error.message);
        });
    } else {
      alert('Please fill all required fields and record both videos before submitting.');
    }
  };

  return (
    <div className="container-fluid bg-light py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0 rounded-lg">
            <div className="card-body p-5">
              <form onSubmit={handleSubmit}>
                <div className="p-4">
                  <div className="d-flex align-items-center">
                    <BriefcaseFill size={40} className="me-3 text-primary" />
                    <div>
                      <h2 className="mb-0">Job Application</h2>
                      <p className="mb-0">
                        Please complete the form below to apply for a position with us.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mb-4">

                  <p className="text-muted mb-2">
                    <strong>Please enter the URL of the job requisition you're applying for. Your responses below will be associated with this job posting.</strong>
                  </p>
                  <div className="form-floating">
                    <input
                      className={`form-control ${formErrors.jobReqUrl ? 'is-invalid' : ''}`}
                      id="jobReqUrl"
                      name="jobReqUrl"
                      type="url"
                      placeholder="https://example.com/job-requisition"
                      value={formData.jobReqUrl}
                      onChange={handleInputChange}
                      required
                    />
                    <label htmlFor="jobReqUrl">Enter Job Requisition URL</label>
                    {formErrors.jobReqUrl && <div className="invalid-feedback">{formErrors.jobReqUrl}</div>}
                  </div>

                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-floating mb-3 mb-md-0">
                      <input className={`form-control ${formErrors.fullName ? 'is-invalid' : ''}`} id="fullName" name="fullName" type="text" placeholder="Enter your full name" value={formData.fullName} onChange={handleInputChange} required />
                      <label htmlFor="fullName">Full name</label>
                      {formErrors.fullName && <div className="invalid-feedback">{formErrors.fullName}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input className={`form-control ${formErrors.email ? 'is-invalid' : ''}`} id="email" name="email" type="email" placeholder="name@example.com" value={formData.email} onChange={handleInputChange} required />
                      <label htmlFor="email">Email address</label>
                      {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                    </div>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-floating mb-3 mb-md-0">
                      <input className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`} id="phone" name="phone" type="tel" placeholder="Enter your phone number" value={formData.phone} onChange={handleInputChange} required />
                      <label htmlFor="phone">Phone number</label>
                      {formErrors.phone && <div className="invalid-feedback">{formErrors.phone}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input className={`form-control ${formErrors.jobTitle ? 'is-invalid' : ''}`} id="jobTitle" name="jobTitle" type="text" placeholder="Enter your current job title" value={formData.jobTitle} onChange={handleInputChange} required />
                      <label htmlFor="jobTitle">Current Job Title</label>
                      {formErrors.jobTitle && <div className="invalid-feedback">{formErrors.jobTitle}</div>}
                    </div>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-floating mb-3 mb-md-0">
                      <input className={`form-control ${formErrors.company ? 'is-invalid' : ''}`} id="company" name="company" type="text" placeholder="Enter your current company" value={formData.company} onChange={handleInputChange} required />
                      <label htmlFor="company">Current Company</label>
                      {formErrors.company && <div className="invalid-feedback">{formErrors.company}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input className={`form-control ${formErrors.location ? 'is-invalid' : ''}`} id="location" name="location" type="text" placeholder="Enter your location" value={formData.location} onChange={handleInputChange} required />
                      <label htmlFor="location">Location</label>
                      {formErrors.location && <div className="invalid-feedback">{formErrors.location}</div>}
                    </div>
                  </div>
                </div>
                <div className="form-floating mb-3">
                  <input className={`form-control ${formErrors.linkedinUrl ? 'is-invalid' : ''}`} id="linkedinUrl" name="linkedinUrl" type="url" placeholder="Enter your LinkedIn profile URL" value={formData.linkedinUrl} onChange={handleInputChange} required />
                  <label htmlFor="linkedinUrl">LinkedIn Profile URL</label>
                  {formErrors.linkedinUrl && <div className="invalid-feedback">{formErrors.linkedinUrl}</div>}
                </div>
                <div className="form-floating mb-3">
                  <input className={`form-control ${formErrors.hearAbout ? 'is-invalid' : ''}`} id="hearAbout" name="hearAbout" type="text" placeholder="How did you hear about this position?" value={formData.hearAbout} onChange={handleInputChange} required />
                  <label htmlFor="hearAbout">How did you hear about this position?</label>
                  {formErrors.hearAbout && <div className="invalid-feedback">{formErrors.hearAbout}</div>}
                </div>
                <div className="form-floating mb-3">
                  <textarea className={`form-control ${formErrors.interest ? 'is-invalid' : ''}`} id="interest" name="interest" placeholder="Why are you interested in this role?" style={{ height: '100px' }} value={formData.interest} onChange={handleInputChange} required></textarea>
                  <label htmlFor="interest">Why are you interested in this role?</label>
                  {formErrors.interest && <div className="invalid-feedback">{formErrors.interest}</div>}
                </div>
                <div className="form-floating mb-3">
                  <textarea className={`form-control ${formErrors.skills ? 'is-invalid' : ''}`} id="skills" name="skills" placeholder="What are your key skills and qualifications?" style={{ height: '100px' }} value={formData.skills} onChange={handleInputChange} required></textarea>
                  <label htmlFor="skills">What are your key skills and qualifications?</label>
                  {formErrors.skills && <div className="invalid-feedback">{formErrors.skills}</div>}
                </div>
                <div className="form-floating mb-3">
                  <textarea className={`form-control ${formErrors.challenge ? 'is-invalid' : ''}`} id="challenge" name="challenge" placeholder="Describe a challenging project you have worked on" style={{ height: '100px' }} value={formData.challenge} onChange={handleInputChange} required></textarea>
                  <label htmlFor="challenge">Describe a challenging project you have worked on</label>
                  {formErrors.challenge && <div className="invalid-feedback">{formErrors.challenge}</div>}
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-floating mb-3 mb-md-0">
                      <input className={`form-control ${formErrors.salary ? 'is-invalid' : ''}`} id="salary" name="salary" type="text" placeholder="Enter your salary expectations" value={formData.salary} onChange={handleInputChange} required />
                      <label htmlFor="salary">Salary Expectations</label>
                      {formErrors.salary && <div className="invalid-feedback">{formErrors.salary}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <select className={`form-select ${formErrors.relocate ? 'is-invalid' : ''}`} id="relocate" name="relocate" value={formData.relocate} onChange={handleInputChange} required>
                        <option value="">Select an option</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                      <label htmlFor="relocate">Are you willing to relocate?</label>
                      {formErrors.relocate && <div className="invalid-feedback">{formErrors.relocate}</div>}
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  {/* Question 1 */}
                  <div className="card bg-light mb-4">
                    <div className="card-body">
                      <p className="lead">Please describe a time when you faced a challenge in your professional life.</p>
                      <video ref={videoRef1} className="w-100 mb-3" style={{ display: isRecording && currentQuestion === 1 ? 'block' : 'none' }} autoPlay muted></video>
                      {isRecording && currentQuestion === 1 ? (
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="badge bg-danger">{formatTime(elapsedTime)}</span>
                          <button type="button" className="btn btn-danger" onClick={stopRecording}>Stop Recording</button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <button type="button" className="btn btn-primary" onClick={() => startRecording(1)} disabled={isRecording}>
                            <CameraVideoFill className="me-2" />
                            Start Recording
                          </button>
                        </div>
                      )}
                      {recordingSuccess.question1 && (
                        <div className="alert alert-success mt-3" role="alert">
                          Video recorded successfully!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Question 2 */}
                  <div className="card bg-light">
                    <div className="card-body">
                      <p className="lead">Please record a video of you demoing the product you sell for your current employer.</p>
                      <video ref={videoRef2} className="w-100 mb-3" style={{ display: isRecording && currentQuestion === 2 ? 'block' : 'none' }} autoPlay muted></video>
                      {isRecording && currentQuestion === 2 ? (
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="badge bg-danger">{formatTime(elapsedTime)}</span>
                          <button type="button" className="btn btn-danger" onClick={stopRecording}>Stop Recording</button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <button type="button" className="btn btn-primary" onClick={() => startRecording(2)} disabled={isRecording}>
                            <CameraVideoFill className="me-2" />
                            Start Recording
                          </button>
                        </div>
                      )}
                      {recordingSuccess.question2 && (
                        <div className="alert alert-success mt-3" role="alert">
                          Video recorded successfully!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <button type="submit" className="btn btn-success">Submit Application</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default VideoRecorder;
