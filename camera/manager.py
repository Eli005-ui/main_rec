import cv2
import threading
import time
from collections import deque

class CameraManager:
    def __init__(self):
        self.cameras = {}  # {"cam1": {"cap": cv2.VideoCapture(...), "buffer": deque(maxlen=1), "thread": threading.Thread}}
        self.lock = threading.Lock()

    def _capture_frames(self, cam_id):
        cap = self.cameras[cam_id]["cap"]
        while True:
            success, frame = cap.read()
            if not success:
                break
            with self.lock:
                self.cameras[cam_id]["buffer"].append(frame)
            time.sleep(0.03)  # ~30 FPS

    def add_camera(self, cam_id: str, source: str):
        if cam_id in self.cameras:
            return False  # bereits vorhanden
        cap = cv2.VideoCapture(source)
        if not cap.isOpened():
            return False
        self.cameras[cam_id] = {
            "cap": cap,
            "buffer": deque(maxlen=1),
            "thread": None
        }
        # Starte den Thread zum Erfassen der Frames
        thread = threading.Thread(target=self._capture_frames, args=(cam_id,), daemon=True)
        self.cameras[cam_id]["thread"] = thread
        thread.start()
        return True

    def get_latest_frame(self, cam_id: str):
        with self.lock:
            if cam_id in self.cameras and self.cameras[cam_id]["buffer"]:
                return self.cameras[cam_id]["buffer"][0]
        return None

    def list_cameras(self):
        return list(self.cameras.keys())

    def remove_camera(self, cam_id: str):
        if cam_id in self.cameras:
            cam = self.cameras.pop(cam_id)
            cam["cap"].release()