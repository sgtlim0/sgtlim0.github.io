---
title: H Chat Models
description: H Chat에서 지원하는 AI 모델
---

# H Chat 지원 모델

H Chat은 구독 모드에 따라 다양한 AI 모델을 지원합니다.

## Pro 모드

| Provider | Models |
|----------|--------|
| OpenAI | gpt-5, gpt-4.1, gpt-4o, gpt-5-mini, gpt-4.1-mini |
| Claude | claude haiku 4.5, claude sonnet 4.5 |
| Gemini | gemini 2.5 pro, gemini 2.5 flash |

*2025년 12월 3일 업데이트 - 일부 모델 추가/제거*

## Plus 모드

| Provider | Models |
|----------|--------|
| OpenAI | gpt-4.1, gpt-5-mini |
| Claude | claude haiku 4.5 |
| Gemini | gemini 2.5 flash, gemini 2.0 flash |

*2025년 11월 26일 업데이트*

## Basic 모드

| Provider | Models |
|----------|--------|
| OpenAI | gpt-4o-mini, gpt-4.1-mini |
| Gemini | gemini 2.5 flash, gemini 2.0 flash |

## 토큰 한도 비교

| Provider | Model | 입력 토큰 | 출력 토큰 |
|----------|-------|----------|----------|
| OpenAI | gpt-4o | 128,000 | 4,096 |
| OpenAI | gpt-4.1 | 1,000,000 | 32,768 |
| OpenAI | gpt-5-mini | 272,000 | 128,000 |
| Anthropic | sonnet-4.5 | 200,000 | 64,000 |
| Anthropic | haiku-4.5 | 200,000 | 64,000 |
| Gemini | gemini-2.5-flash | 1,048,576 | 65,536 |
| Gemini | gemini-2.5-pro | 1,048,576 | 65,535 |

## 모델 선택 팁

- **빠른 응답**: Mini 또는 Flash 모델 사용
- **복잡한 작업**: Pro 또는 전체 모델 사용
- **긴 문서 처리**: 높은 입력 토큰 한도 모델 사용 (Gemini 추천)
