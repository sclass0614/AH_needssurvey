# 우리집데이케어센터 욕구조사 시스템

## 개요

본 시스템은 우리집데이케어센터의 욕구조사를 위한 웹 애플리케이션입니다. 기존에 Google Apps Script와 Google Spreadsheet를 사용하던 시스템을 Supabase 기반으로 이전했습니다.

## 기술 스택

- Frontend: HTML, CSS, JavaScript
- Backend: Supabase (PostgreSQL 기반의 BaaS)

## 데이터베이스 구조

### 테이블 구조

1. **membersinfo**: 회원 정보

   - 회원번호 (text): 회원의 고유 식별자
   - 회원명 (text): 회원의 이름
   - 입소일 (int4): 입소 날짜
   - 퇴소일 (int4): 퇴소 날짜

2. **employeessinfo**: 직원 정보

   - 직원번호 (text): 직원의 고유 식별자
   - 직원명 (text): 직원의 이름
   - 계약시작일 (int4): 계약 시작 날짜
   - 계약종료일 (int4): 계약 종료 날짜

3. **needssurvey**: 설문조사 항목 정보

   - 목차data (uuid): 항목의 고유 식별자
   - 대분류 (text): 설문의 대분류
   - 중분류 (text): 설문의 중분류
   - 소분류 (text): 설문의 소분류
   - 필수구분 (text): 필수 항목 여부
   - 입력방식 (text): 입력 형태(체크박스, 라디오버튼 등)
   - 내용 (text): 설문 내용
   - created_at (timestamp): 생성 시간

4. **needssurvey_response**: 설문조사 응답 정보
   - 설문응답\_id: UUID 형식 (고유식별자)
   - 목차data: 설문조사 ID (회원번호\_YYMMDDHHMMSS)
   - 회원번호: 회원 식별자
   - 회원명: 회원 이름
   - 직원번호: 담당 직원 식별자
   - 직원명: 담당 직원 이름
   - 대분류: 설문 대분류
   - 중분류: 설문 중분류
   - 소분류: 설문 소분류 (질문)
   - 답변: 설문 응답 내용
   - created_at: 생성 시간

## 주요 기능

1. 회원 목록 조회
2. 직원 목록 조회
3. 설문조사 항목 조회
4. 설문조사 결과 저장 및 조회
5. 설문조사 결과 수정

## 사용 방법

1. index.html 파일을 웹 브라우저에서 열어 전체조사 페이지에 접근
2. index2.html 파일을 웹 브라우저에서 열어 필수조사 페이지에 접근
3. 회원번호와 직원번호를 선택하여 설문조사 시작
4. 설문조사 항목을 작성하고 '입력' 버튼 클릭하여 저장
5. 이전 설문조사 결과를 불러오려면 회원번호 선택 후 데이터 선택

## 시스템 설정

Supabase 연결을 위한 정보:

- URL: https://dfomeijvzayyszisqflo.supabase.co
- API Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmb21laWp2emF5eXN6aXNxZmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NjYwNDIsImV4cCI6MjA2MDQ0MjA0Mn0.-r1iL04wvPNdBeIvgxqXLF2rWqIUX5Ot-qGQRdYo_qk

## 변경 사항

- Google Apps Script와 Google Spreadsheet에서 Supabase로 데이터 저장소 변경
- 데이터 처리 로직 JavaScript로 이전
- 데이터베이스 스키마 최적화

# 우리집데이케어센터 욕구조사 시스템 데이터 구조 개선

## 변경 사항 요약

2025년 4월 기준으로 설문조사 답변 데이터의 저장 방식을 개선하였습니다.

### 이전 방식

- 테이블: `old_needssurvey_response`
- 구조: 설문조사 전체가 하나의 행으로 저장됨
- 한계점: 데이터 분석 및 추출이 어려움

### 새로운 방식

- 테이블: `needssurvey_response`
- 구조: 하나의 질문당 하나의 행으로 저장됨
- 필드 구성:
  - 설문응답\_id: UUID 형식 (고유식별자)
  - 목차data: 설문조사 ID (회원번호\_YYMMDDHHMMSS)
  - 회원번호: 회원 식별자
  - 회원명: 회원 이름
  - 직원번호: 담당 직원 식별자
  - 직원명: 담당 직원 이름
  - 대분류: 설문 대분류
  - 중분류: 설문 중분류
  - 소분류: 설문 소분류 (질문)
  - 답변: 설문 응답 내용
  - created_at: 생성 시간

## 개선 효과

1. 데이터 관리 용이성 향상
2. 특정 질문에 대한 답변 추출 및 분석 가능
3. 회원별, 질문별, 대분류별 통계 산출 용이

## 작업 날짜

2025년 4월 19일
