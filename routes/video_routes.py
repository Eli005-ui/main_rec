from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse, JSONResponse
from camera.manager import CameraManager
from camera.streamer import generate_frames

router = APIRouter()
manager = CameraManager()

@router.get("/video/{cam_id}")
def stream_video(cam_id: str):
    cap = manager.get_camera(cam_id)
    if cap:
        return StreamingResponse(generate_frames(cap),
                                 media_type="multipart/x-mixed-replace; boundary=frame")
    return JSONResponse(status_code=404, content={"error": "Camera not found"})

@router.post("/add_camera")
def add_camera(cam_id: str, source: str):
    if manager.add_camera(cam_id, source):
        return {"status": "added"}
    return JSONResponse(status_code=400, content={"error": "Could not add camera"})

@router.get("/list_cameras")
def list_cameras():
    return manager.list_cameras()
