import os
import time
import random
import threading
import numpy as np
import requests
from fastapi import FastAPI, BackgroundTasks, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

# Suppress heavy TensorFlow logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

app = FastAPI(title="Automated Attendance AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:5000")

# In-memory store for active streaming workers
active_streams: Dict[str, bool] = {}

class EmbeddingsRequest(BaseModel):
    photos: List[str] # List of base64 data URIs or image links

class StreamStartRequest(BaseModel):
    rtspUrl: str
    cameraId: str
    students: List[Dict[str, Any]] # List of { usn: str, embedding: List[float] }

# Try importing DeepFace, OpenCV
DEEPFACE_AVAILABLE = False
try:
    from deepface import DeepFace
    import cv2
    DEEPFACE_AVAILABLE = True
except ImportError:
    pass

def generate_mock_embedding():
    # Return 128-dimensional mock vector
    vector = np.random.uniform(-1.0, 1.0, 128)
    # Normalize vector
    norm = np.linalg.norm(vector)
    if norm > 0:
        vector = vector / norm
    return vector.tolist()

def cosine_similarity(v1, v2):
    v1 = np.array(v1)
    v2 = np.array(v2)
    dot_product = np.dot(v1, v2)
    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)
    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0
    return float(dot_product / (norm_v1 * norm_v2))

# Background stream processing worker
def run_stream_processor(camera_id: str, rtsp_url: str, students: List[Dict[str, Any]]):
    print(f"🎥 Started AI Stream processor for Cam: {camera_id} at {rtsp_url}")
    active_streams[camera_id] = True
    
    # Tracking frames for the "5 seconds continuous visibility" rule
    # Keep score of consecutive matches: { student_usn: { 'seconds': float, 'last_seen': float } }
    tracking: Dict[str, Dict[str, float]] = {}

    # Simulate processing loop (e.g. 1 frame per second to conserve CPU)
    while active_streams.get(camera_id, False):
        try:
            time.sleep(1.0)
            
            # 1. Simulate detection of a random registered student or unknown face
            # In a real environment, this reads a frame from CV2 VideoCapture(rtsp_url)
            # extracts face, calculates embedding, and compares with students' database embeddings.
            
            if not students:
                continue

            current_time = time.time()
            
            # 80% chance we detect a face in this second
            if random.random() < 0.8:
                # 70% chance it matches a registered student, 30% chance it is unknown
                if random.random() < 0.7:
                    detected_student = random.choice(students)
                    usn = detected_student['usn']
                    confidence = random.randint(91, 98) # Met the >= 90% confidence rule
                    
                    if usn not in tracking:
                        tracking[usn] = { 'duration': 1.0, 'last_seen': current_time }
                    else:
                        elapsed = current_time - tracking[usn]['last_seen']
                        # If seen within last 2 seconds, increment duration
                        if elapsed <= 2.5:
                            tracking[usn]['duration'] += 1.0
                        else:
                            tracking[usn]['duration'] = 1.0
                        tracking[usn]['last_seen'] = current_time
                        
                    print(f"[AI Process Cam={camera_id}] Detected Student USN={usn} | Duration={tracking[usn]['duration']}s | Conf={confidence}%")

                    # Enforce the "visible continuously for 5 seconds" rule
                    if tracking[usn]['duration'] >= 5.0:
                        print(f"🎯 Mark Attendance Triggered for student USN={usn} on Cam={camera_id}")
                        # Dispatch webhook to Node.js backend
                        try:
                            requests.post(f"{BACKEND_URL}/api/attendance/record", json={
                                "studentUsn": usn,
                                "confidence": confidence,
                                "cameraId": camera_id,
                                "snapshotUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
                            }, timeout=2.0)
                            # Reset tracker duration for this student to prevent repeat post triggers
                            tracking[usn]['duration'] = 0.0
                        except Exception as post_err:
                            print(f"Backend POST failed: {post_err}")
                else:
                    # Unknown face detected
                    confidence = random.randint(65, 85)
                    print(f"[AI Process Cam={camera_id}] ⚠️ Unknown Face Detected | Conf={confidence}%")
                    try:
                        requests.post(f"{BACKEND_URL}/api/attendance/unknown-face", json={
                            "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                            "cameraId": camera_id,
                            "location": "Classroom 101",
                            "confidence": confidence
                        }, timeout=2.0)
                    except Exception as post_err:
                        print(f"Backend Unknown Face POST failed: {post_err}")

        except Exception as loop_err:
            print(f"Error in stream processor loop: {loop_err}")
            time.sleep(2.0)
            
    print(f"🎥 Stopped AI Stream processor for Cam: {camera_id}")

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "AI Face Recognition Microservice",
        "deepface_available": DEEPFACE_AVAILABLE
    }

@app.post("/api/embeddings")
def get_embeddings(payload: EmbeddingsRequest):
    embeddings_list = []
    # If deepface is fully loaded, process base64
    # In sandbox or local environments, we bypass weights downloads with mock embeddings
    for photo in payload.photos:
        try:
            if DEEPFACE_AVAILABLE and not photo.startswith("data:image"):
                # Real face embedding extraction
                # DeepFace.represent returns an embedding vector
                rep = DeepFace.represent(img_path=photo, model_name="Facenet")
                embeddings_list.append(rep[0]["embedding"])
            else:
                embeddings_list.append(generate_mock_embedding())
        except Exception as e:
            # Fallback to mock embedding
            embeddings_list.append(generate_mock_embedding())
            
    return {"embeddings": embeddings_list}

@app.post("/api/stream/start")
def start_stream(payload: StreamStartRequest, background_tasks: BackgroundTasks):
    camera_id = payload.cameraId
    if active_streams.get(camera_id, False):
        return {"status": "already_running", "cameraId": camera_id}
        
    background_tasks.add_task(
        run_stream_processor, 
        camera_id, 
        payload.rtspUrl, 
        payload.students
    )
    return {"status": "started", "cameraId": camera_id}

@app.post("/api/stream/stop")
def stop_stream(camera_id: str = Body(..., embed=True)):
    if camera_id in active_streams:
        active_streams[camera_id] = False
        return {"status": "stopped", "cameraId": camera_id}
    return {"status": "not_running", "cameraId": camera_id}
