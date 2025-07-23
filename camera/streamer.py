import cv2

def generate_frames(manager, cam_id):
    while True:
        frame = manager.get_latest_frame(cam_id)
        if frame is not None:
            _, buffer = cv2.imencode(".jpg", frame)
            yield (b"--frame\r\n"
                   b"Content-Type: image/jpeg\r\n\r\n" + buffer.tobytes() + b"\r\n")
        else:
            yield (b"--frame\r\n"
                   b"Content-Type: image/jpeg\r\n\r\n" + b"\r\n")