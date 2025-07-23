from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse, JSONResponse
from camera.manager import CameraManager
from camera.streamer import generate_frames
import time

router = APIRouter()
manager = CameraManager()

@router.get("/video/{cam_id}")
def stream_video(cam_id: str):
    if cam_id in manager.list_cameras():
        return StreamingResponse(generate_frames(manager, cam_id),
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

def remove_camera(self, cam_id: str):
    if cam_id in self.cameras:
        cam = self.cameras.pop(cam_id)
        # Zuerst den Thread stoppen
        if cam["thread"] is not None:
            cam["thread"].join(timeout=1)  # 1 Sekunde Wartezeit
        
        # Dann die Kamera freigeben
        cam["cap"].release()
        
        # Puffer leeren
        cam["buffer"].clear()

@router.post("/reload_camera")
def reload_camera(cam_id: str, source: str):
    try:
        # Bestehende Kamera sicher entfernen
        manager.remove_camera(cam_id)
        
        # Kleine Verzögerung für sauberen Reset
        time.sleep(2)
        
        # Neue Kamera hinzufügen
        if manager.add_camera(cam_id, source):
            return {"status": "reloaded"}
        return JSONResponse(status_code=400, content={"error": "Add failed after reload"})
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Reload crashed: {str(e)}"}
        )