"""hwp-generator MCP 서버 부트스트랩 런처.

시스템 Python이 PEP 668(externally-managed-environment)로 pip 설치를 막는
환경(macOS Homebrew, Debian 등)에서도 사용자 조작 없이 서버가 기동되도록,
전용 venv를 자동 생성해 의존성을 설치한 뒤 server.py를 실행합니다.

표준 라이브러리만 사용합니다. stdout은 MCP stdio 프로토콜 채널이므로
모든 로그는 stderr로만 출력합니다.
"""

import importlib.util
import os
import subprocess
import sys
import venv
from pathlib import Path

SERVER_PATH = Path(__file__).resolve().parent / "server.py"
REQUIREMENTS_PATH = Path(__file__).resolve().parent / "requirements.txt"
REQUIRED_MODULES = ("mcp", "lxml")
VENV_DIR = Path(
    os.environ.get("HWP_GENERATOR_VENV", Path.home() / ".cache" / "startup-apply" / "hwp-venv")
)


def _log(message: str) -> None:
    print(f"[hwp-generator bootstrap] {message}", file=sys.stderr, flush=True)


def _current_python_has_deps() -> bool:
    return all(importlib.util.find_spec(module) for module in REQUIRED_MODULES)


def _venv_python() -> Path:
    if os.name == "nt":
        return VENV_DIR / "Scripts" / "python.exe"
    return VENV_DIR / "bin" / "python"


def _venv_has_deps(python: Path) -> bool:
    if not python.exists():
        return False
    imports = ", ".join(REQUIRED_MODULES)
    result = subprocess.run(
        [str(python), "-c", f"import {imports}"],
        capture_output=True,
    )
    return result.returncode == 0


def _create_venv_and_install() -> Path:
    python = _venv_python()
    if not python.exists():
        _log(f"전용 venv 생성 중: {VENV_DIR}")
        VENV_DIR.parent.mkdir(parents=True, exist_ok=True)
        venv.create(VENV_DIR, with_pip=True)
    _log("의존성 설치 중 (mcp, lxml) — 첫 실행 시 1~2분 걸릴 수 있습니다")
    install_cmd = [str(python), "-m", "pip", "install", "--quiet"]
    if REQUIREMENTS_PATH.exists():
        install_cmd += ["-r", str(REQUIREMENTS_PATH)]
    else:
        install_cmd += ["mcp>=1.0.0", "lxml>=5.0.0"]
    result = subprocess.run(install_cmd, stdout=sys.stderr, stderr=sys.stderr)
    if result.returncode != 0:
        _log(
            "의존성 설치 실패. 네트워크 연결을 확인하거나 수동으로 설치하세요: "
            f"{python} -m pip install -r {REQUIREMENTS_PATH}"
        )
        sys.exit(1)
    return python


def main() -> None:
    if _current_python_has_deps():
        python = Path(sys.executable)
    else:
        python = _venv_python()
        if not _venv_has_deps(python):
            python = _create_venv_and_install()

    server_cmd = [str(python), str(SERVER_PATH)]
    if os.name == "nt":
        completed = subprocess.run(server_cmd)
        sys.exit(completed.returncode)
    os.execv(str(python), server_cmd)


if __name__ == "__main__":
    main()
