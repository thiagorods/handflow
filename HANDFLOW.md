# Handflow — rodando localmente

Requisitos: Node 20+, Python 3.12, webcam.

```bash
npm install
npm run api:install   # dependências Python (OpenCV, MediaPipe, scikit-learn, FastAPI)
npm run api           # serviço Python em http://127.0.0.1:8000
npm run dev           # interface web em http://localhost:8080
```

Abra /translator e clique em "Iniciar tradução".

Contrato: GET /api/health · POST /api/session/start · POST /api/session/stop ·
GET /api/video/stream (MJPEG) · WS /ws/translation (eventos status/camera/processing/prediction/metrics/error;
comandos {"type":"command","action":"clear"|"backspace"}).

O `main.py` original (janela OpenCV) continua funcionando de forma independente.
