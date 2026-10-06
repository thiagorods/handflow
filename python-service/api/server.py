"""
Handflow API — FastAPI bridge between the Handflow web app and the SLT engine.

Pipeline (unchanged from main.py):
  OpenCV (CameraManager) -> MediaPipe (HandDetector) -> landmarks
  -> Random Forest (SignRecognizer) -> TextBuilder

Endpoints:
  GET  /api/health
  POST /api/session/start
  POST /api/session/stop
  GET  /api/video/stream     (MJPEG)
  WS   /ws/translation       (events + commands)

Run from the python-service folder:
  uvicorn api.server:app --host 127.0.0.1 --port 8000
"""

import asyncio
import json
import threading
import time
from contextlib import asynccontextmanager

import cv2
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from src.capture.camera_manager import CameraManager
from src.detection.hand_detector import HandDetector
from src.recognition.sign_recognizer import SignRecognizer
from src.translation.text_builder import TextBuilder

MAX_CONSECUTIVE_READ_FAILURES = 60
JPEG_QUALITY = 75


class Engine:
    """Runs the recognition loop in a background thread while a session is active."""

    def __init__(self):
        self.loop: asyncio.AbstractEventLoop | None = None
        self.clients: set[WebSocket] = set()
        self.builder = TextBuilder()
        self.lock = threading.Lock()
        self.frame_cond = threading.Condition()
        self.latest_jpeg: bytes | None = None
        self.thread: threading.Thread | None = None
        self.running = threading.Event()
        self.camera_status = "unknown"

    # ---------- events ----------
    def emit(self, event: dict):
        if self.loop is None:
            return
        asyncio.run_coroutine_threadsafe(self._broadcast(event), self.loop)

    async def _broadcast(self, event: dict):
        data = json.dumps(event)
        for ws in list(self.clients):
            try:
                await ws.send_text(data)
            except Exception:
                self.clients.discard(ws)

    # ---------- session ----------
    def start(self):
        if self.running.is_set():
            return
        self.running.set()
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()

    def stop(self):
        self.running.clear()
        if self.thread is not None:
            self.thread.join(timeout=3)
            self.thread = None

    def command(self, action: str):
        with self.lock:
            if action == "clear":
                self.builder.clear()
            elif action == "backspace":
                self.builder.backspace()
            text = self.builder.text
        self.emit({"type": "prediction", "sign": None, "text": text})

    def _set_camera(self, status: str):
        self.camera_status = status
        self.emit({"type": "camera", "status": status})

    def _run(self):
        self._set_camera("starting")
        camera = CameraManager()
        if not camera.is_open():
            self._set_camera("error")
            self.running.clear()
            return

        detector = None
        try:
            detector = HandDetector()
            recognizer = SignRecognizer()
            self._set_camera("ready")

            failed = 0
            last_sign = object()
            last_hand = None
            fps_frames, fps_t0 = 0, time.perf_counter()

            while self.running.is_set():
                frame = camera.read()
                if frame is None:
                    failed += 1
                    if failed >= MAX_CONSECUTIVE_READ_FAILURES:
                        self._set_camera("error")
                        break
                    time.sleep(0.01)
                    continue
                failed = 0

                t0 = time.perf_counter()
                processed, landmarks = detector.detect(frame)
                sign = None
                if landmarks is not None:
                    sign = recognizer.predict(landmarks)
                else:
                    recognizer.reset()
                with self.lock:
                    prev_text = self.builder.text
                    text = self.builder.update(sign)
                inference_ms = (time.perf_counter() - t0) * 1000

                hand = landmarks is not None
                if hand != last_hand:
                    self.emit({"type": "processing", "hand": hand})
                    last_hand = hand
                if sign != last_sign or text != prev_text:
                    self.emit({"type": "prediction", "sign": sign, "text": text})
                    last_sign = sign

                ok, jpg = cv2.imencode(".jpg", processed, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
                if ok:
                    with self.frame_cond:
                        self.latest_jpeg = jpg.tobytes()
                        self.frame_cond.notify_all()

                fps_frames += 1
                elapsed = time.perf_counter() - fps_t0
                if elapsed >= 1.0:
                    self.emit({"type": "metrics", "metrics": {"fps": fps_frames / elapsed, "inferenceMs": inference_ms}})
                    fps_frames, fps_t0 = 0, time.perf_counter()
        except Exception as exc:  # never crash the server
            print("[handflow] engine error:", exc)
            self.emit({"type": "error", "message": "engine"})
        finally:
            if detector is not None:
                detector.close()
            camera.release()
            with self.frame_cond:
                self.latest_jpeg = None
                self.frame_cond.notify_all()
            self.running.clear()
            if self.camera_status != "error":
                self.camera_status = "unknown"

    def frames(self):
        """Blocking generator of MJPEG parts (runs in a threadpool)."""
        while self.running.is_set():
            with self.frame_cond:
                self.frame_cond.wait(timeout=1.0)
                jpg = self.latest_jpeg
            if jpg:
                yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + jpg + b"\r\n"


engine = Engine()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    engine.loop = asyncio.get_running_loop()
    yield
    engine.stop()


app = FastAPI(title="Handflow SLT Service", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.middleware("http")
async def private_network(request: Request, call_next):
    # Lets the hosted Handflow page (https) reach this local service in Chrome.
    response = await call_next(request)
    response.headers["Access-Control-Allow-Private-Network"] = "true"
    return response


@app.get("/api/health")
def health():
    return {"status": "ok", "session": engine.running.is_set(), "camera": engine.camera_status}


@app.post("/api/session/start")
def session_start():
    engine.start()
    return {"ok": True}


@app.post("/api/session/stop")
def session_stop():
    engine.stop()
    return {"ok": True}


@app.get("/api/video/stream")
def video_stream():
    return StreamingResponse(engine.frames(), media_type="multipart/x-mixed-replace; boundary=frame")


@app.websocket("/ws/translation")
async def ws_translation(ws: WebSocket):
    await ws.accept()
    engine.clients.add(ws)
    await ws.send_text(json.dumps({"type": "status", "status": "connected"}))
    if engine.camera_status in ("ready", "error"):
        await ws.send_text(json.dumps({"type": "camera", "status": engine.camera_status}))
    await ws.send_text(json.dumps({"type": "prediction", "sign": None, "text": engine.builder.text}))
    try:
        while True:
            msg = json.loads(await ws.receive_text())
            if msg.get("type") == "command" and msg.get("action") in ("clear", "backspace"):
                engine.command(msg["action"])
    except (WebSocketDisconnect, json.JSONDecodeError):
        pass
    finally:
        engine.clients.discard(ws)
