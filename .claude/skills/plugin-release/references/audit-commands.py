"""커맨드 문서 5요소 감사 — plugin-release 스킬 3단계에서 사용.

검사 항목: 작동 방식 ASCII 박스, 사용법 섹션, 관련 스킬 섹션,
참조 스킬 실존, 빈 argument-hint. 위반이 있으면 exit 1.
"""

import pathlib
import re
import sys

PLUGINS = ["startup-fundraise", "startup-apply"]


def audit() -> list[str]:
    problems: list[str] = []
    for plugin in PLUGINS:
        for f in sorted(pathlib.Path(plugin, "commands").glob("*.md")):
            text = f.read_text()
            if 'argument-hint: ""' in text:
                problems.append(f"{f}: 빈 argument-hint (줄 자체를 제거할 것)")
            if "┌─" not in text:
                problems.append(f"{f}: 작동 방식 ASCII 박스 없음")
            if not re.search(r"##\s*사용법", text):
                problems.append(f"{f}: 사용법 섹션 없음")
            if not re.search(r"##\s*관련 (스킬|루틴)|스킬이 자동 활성화", text):
                problems.append(f"{f}: 관련 스킬 섹션 없음")
            for m in re.finditer(r"`([a-z-]+)` 스킬", text):
                skill_path = pathlib.Path(plugin, "skills", m.group(1), "SKILL.md")
                if not skill_path.exists():
                    problems.append(f"{f}: 참조 스킬 미존재 — {m.group(1)}")
    return problems


def main() -> None:
    problems = audit()
    if problems:
        print("\n".join(problems))
        sys.exit(1)
    print("커맨드 5요소 감사 통과")


if __name__ == "__main__":
    main()
