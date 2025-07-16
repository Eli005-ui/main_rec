import cv2

class CameraManager:
    def __init__(self):
        self.cameras = {}  # {"cam1": cv2.VideoCapture(...)}

    def add_camera(self, cam_id: str, source: str):
        if cam_id in self.cameras:
            return False  # bereits vorhanden
        cap = cv2.VideoCapture(source)
        if not cap.isOpened():
            return False
        self.cameras[cam_id] = cap
        return True

    def get_camera(self, cam_id: str):
        return self.cameras.get(cam_id, None)

    def list_cameras(self):
        return list(self.cameras.keys())

    def remove_camera(self, cam_id: str):
        cam = self.cameras.pop(cam_id, None)
        if cam:
            cam.release()
