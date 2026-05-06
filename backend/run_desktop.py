import os

import uvicorn

from app.main import app


def main() -> None:
    host = os.getenv("EDUMIND_BACKEND_HOST", "127.0.0.1")
    port = int(os.getenv("EDUMIND_BACKEND_PORT", "18450"))
    uvicorn.run(app, host=host, port=port, log_level="info")


if __name__ == "__main__":
    main()
