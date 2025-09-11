# Slack Emoji 이미지 생성 가이드

## 📋 개요

SlackDori 서비스의 이모지 팩을 위한 이미지 생성 방법을 설명합니다. 이 가이드는 Python의 PIL(Pillow) 라이브러리를 사용하여 프로그래밍 방식으로 이모지 이미지를 생성하는 방법을 다룹니다.

## 🎯 배경 및 목적

### 왜 프로그래밍 방식으로 생성하는가?

1. **일관성**: 모든 이모지가 동일한 크기(128x128)와 스타일을 유지
2. **확장성**: 새로운 이모지 추가가 코드 작성만으로 가능
3. **버전 관리**: 이미지 파일 대신 코드로 관리하여 변경 이력 추적 용이
4. **자동화**: 대량의 이모지를 빠르게 생성 가능
5. **라이선스 자유**: 직접 생성하므로 저작권 문제 없음

### 기존 접근법의 문제점

- 외부 이미지 사용 시 저작권 문제
- 디자이너 의존성
- 스타일 일관성 유지 어려움
- 수정/변경 시 전체 재작업 필요

## 🛠️ 기술 스택

### 필수 도구
```bash
# Python 3.x 필요
python3 --version

# Pillow 라이브러리 설치
pip3 install Pillow
```

### 프로젝트 구조
```
slack-emoji-packs/
├── images/                    # 생성된 이미지 저장 디렉토리
│   ├── dev-essentials/        # 개발자 이모지 팩
│   ├── korean-culture/        # 한국 문화 이모지 팩
│   └── reactions/             # 리액션 이모지 팩
├── packs/                     # 팩 메타데이터
│   └── [pack-name]/
│       └── pack.json          # 이모지 정보 (이름, 별칭 등)
├── create_emoji.py            # dev-essentials 생성 스크립트
├── create_korean_emoji.py     # korean-culture 생성 스크립트
└── create_reactions_emoji.py  # reactions 생성 스크립트
```

## 💡 핵심 개념

### 1. 기본 이모지 구조

```python
def create_emoji_name():
    """이모지 설명"""
    size = 128  # 슬랙 표준 크기
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))  # 투명 배경
    draw = ImageDraw.Draw(img)
    
    # 여기에 그리기 코드 작성
    
    return img
```

### 2. 주요 그리기 메서드

```python
# 원/타원 그리기
draw.ellipse([x1, y1, x2, y2], fill=color)

# 사각형 그리기
draw.rectangle([x1, y1, x2, y2], fill=color)

# 다각형 그리기
draw.polygon([(x1, y1), (x2, y2), ...], fill=color)

# 선 그리기
draw.line([x1, y1, x2, y2], fill=color, width=thickness)

# 호 그리기 (웃는 입 등)
draw.arc([x1, y1, x2, y2], start=angle1, end=angle2, fill=color, width=thickness)
```

### 3. 색상 팔레트

```python
# 기본 색상들
YELLOW = (255, 223, 0)      # 이모지 얼굴
SKIN = (255, 220, 177)       # 피부색
RED = (255, 0, 0)            # 빨강
BLUE = (0, 123, 255)         # 파랑
GREEN = (0, 255, 0)          # 초록
BLACK = (0, 0, 0)            # 검정
WHITE = (255, 255, 255)      # 흰색

# 반투명 색상 (RGBA)
SEMI_TRANSPARENT = (255, 0, 0, 100)  # 4번째 값이 투명도
```

## 📝 실제 예제

### 간단한 웃는 얼굴 이모지

```python
def create_smile_emoji():
    """웃는 얼굴 이모지"""
    size = 128
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 얼굴 (노란 원)
    face_color = (255, 223, 0)
    draw.ellipse([20, 20, 108, 108], fill=face_color)
    
    # 눈 (검은 점)
    eye_color = (0, 0, 0)
    draw.ellipse([40, 45, 50, 55], fill=eye_color)  # 왼쪽 눈
    draw.ellipse([78, 45, 88, 55], fill=eye_color)  # 오른쪽 눈
    
    # 입 (호로 그린 미소)
    draw.arc([40, 60, 88, 90], start=0, end=180, fill=eye_color, width=3)
    
    return img
```

### 복잡한 이모지 - 불꽃

```python
def create_fire_emoji():
    """불꽃 이모지"""
    size = 128
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 외부 불꽃 (빨강-주황)
    outer_flame = (255, 69, 0)
    draw.polygon([
        (64, 20),   # 꼭대기
        (45, 50),   # 왼쪽
        (40, 80),   # 왼쪽 아래
        (64, 95),   # 중앙 아래
        (88, 80),   # 오른쪽 아래
        (83, 50)    # 오른쪽
    ], fill=outer_flame)
    
    # 내부 불꽃 (노랑)
    inner_flame = (255, 255, 0)
    draw.polygon([
        (64, 40),
        (55, 60),
        (60, 80),
        (64, 75),
        (68, 80),
        (73, 60)
    ], fill=inner_flame)
    
    return img
```

## 🎨 디자인 팁

### 1. 레이어링
- 뒤에서 앞으로 그리기 (배경 → 메인 → 디테일)
- 예: 얼굴 → 손 → 손가락 디테일

### 2. 그림자와 하이라이트
```python
# 그림자 효과
shadow_color = (color[0]-50, color[1]-50, color[2]-50)  # 더 어둡게

# 하이라이트 효과  
highlight_color = (min(255, color[0]+50), min(255, color[1]+50), min(255, color[2]+50))
```

### 3. 모션 효과
```python
# 움직임 표현 (반투명 선)
motion_color = (100, 100, 100, 100)  # 반투명 회색
draw.line([x1, y1, x2, y2], fill=motion_color, width=2)
```

### 4. 표정 만들기
- **행복**: 눈은 호(arc)로, 입은 위로 향한 호
- **슬픔**: 눈썹 내림, 입 아래로 향한 호, 눈물 추가
- **놀람**: 눈 크게(원), 입 O자 모양
- **생각**: 눈 하나는 가늘게, 손을 턱에

## 🚀 작업 프로세스

### 1. 새 이모지 팩 추가하기

```bash
# 1. 이미지 디렉토리 생성
mkdir images/new-pack

# 2. 팩 메타데이터 생성
mkdir packs/new-pack
touch packs/new-pack/pack.json

# 3. 생성 스크립트 작성
touch create_new_pack_emoji.py
```

### 2. pack.json 구조

```json
{
  "id": "pack-id",
  "name": "Pack Name",
  "description": "Pack description",
  "version": "1.0.0",
  "emojis": [
    {
      "name": "emoji-name",
      "aliases": ["alias1", "alias2"],
      "imageUrl": "/images/pack-id/emoji-name.png",
      "unicode": "😀"
    }
  ]
}
```

### 3. 스크립트 실행

```bash
# 이모지 생성
python3 create_emoji.py

# 생성된 이미지 확인
ls images/pack-name/

# Git에 커밋
git add .
git commit -m "feat: add new emoji pack"
git push origin main
```

## ⚠️ 주의사항 및 트러블슈팅

### 흔한 실수들

1. **좌표 시스템 이해**
   - PIL은 왼쪽 위가 (0, 0)
   - 오른쪽으로 갈수록 x 증가
   - 아래로 갈수록 y 증가

2. **ellipse 좌표**
   ```python
   # 잘못된 이해: 중심점과 반지름
   # draw.ellipse([center_x, center_y, radius])  # ❌
   
   # 올바른 사용: 바운딩 박스의 좌상단과 우하단
   draw.ellipse([x1, y1, x2, y2])  # ✅
   ```

3. **색상 범위**
   - RGB 각 값은 0-255
   - 투명도(알파)도 0-255 (0=완전투명, 255=불투명)

4. **이미지 크기**
   - 반드시 128x128 픽셀
   - 너무 작게 그리면 슬랙에서 잘 안 보임
   - 여백 적절히 활용 (가장자리 10-20픽셀)

### 디버깅 팁

```python
# 임시로 배경색 추가해서 영역 확인
img = Image.new('RGBA', (size, size), (200, 200, 200, 255))  # 회색 배경

# 단계별로 저장해서 확인
img.save("debug_step1.png")
# 더 그리기
img.save("debug_step2.png")
```

## 🔄 반복 패턴

### 여러 개의 동일한 요소 그리기

```python
# 별 여러 개 그리기
for i in range(5):
    x = 20 + i * 20
    y = 30 + (i % 2) * 10  # 지그재그 패턴
    draw.polygon(create_star_points(x, y, size=10), fill=star_color)

# 원형 배치
import math
for i in range(8):
    angle = i * (360 / 8)
    x = center_x + radius * math.cos(math.radians(angle))
    y = center_y + radius * math.sin(math.radians(angle))
    draw.ellipse([x-5, y-5, x+5, y+5], fill=color)
```

## 📚 추가 리소스

- [Pillow 공식 문서](https://pillow.readthedocs.io/)
- [슬랙 이모지 가이드라인](https://slack.com/help/articles/206870177-Add-custom-emoji-to-your-workspace)
- [색상 선택 도구](https://htmlcolorcodes.com/)

## 💭 향후 개선 아이디어

1. **자동화 강화**
   - 모든 팩을 한 번에 생성하는 마스터 스크립트
   - JSON에서 이모지 정의 읽어서 자동 생성

2. **품질 개선**
   - 안티앨리어싱 적용
   - 그라데이션 효과
   - 애니메이션 GIF 지원

3. **도구 개발**
   - 웹 기반 이모지 에디터
   - 실시간 미리보기
   - 템플릿 시스템

## 🤝 기여 방법

1. 새 이모지 아이디어는 GitHub Issues에 제안
2. 코드 스타일 유지 (함수명, 주석 등)
3. 테스트: 생성된 이미지를 슬랙에 직접 업로드해서 확인
4. PR 제출 시 이미지 스크린샷 포함

---

*마지막 업데이트: 2025-01-11*
*작성자: SlackDori Team*