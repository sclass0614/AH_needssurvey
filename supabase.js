// Supabase 연결 정보
const SUPABASE_URL = "https://dfomeijvzayyszisqflo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmb21laWp2emF5eXN6aXNxZmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NjYwNDIsImV4cCI6MjA2MDQ0MjA0Mn0.-r1iL04wvPNdBeIvgxqXLF2rWqIUX5Ot-qGQRdYo_qk";

// Supabase 클라이언트 초기화
async function initSupabase() {
    // Supabase 라이브러리가 로드되었는지 확인
    if (typeof supabase === 'undefined') {
        console.error('Supabase 라이브러리가 로드되지 않았습니다.');
        return null;
    }
    
    return supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// 회원 정보 가져오기
async function getMemberData() {
    try {
        const supabase = await initSupabase();
        if (!supabase) return [];
        
        const { data, error } = await supabase
            .from('membersinfo')
            .select('회원번호, 회원명, 입소일, 퇴소일')
            .order('회원명', { ascending: true });
        
        if (error) {
            console.error('회원 데이터 조회 실패:', error);
            return [];
        }
        
        return data;
    } catch (error) {
        console.error('회원 데이터 조회 중 오류 발생:', error);
        return [];
    }
}

// 직원 정보 가져오기
async function getEmployeeData() {
    try {
        const supabase = await initSupabase();
        if (!supabase) return [];
        
        const { data, error } = await supabase
            .from('employeesinfo')
            .select('직원번호, 직원명, 계약시작일, 계약종료일')
            .order('직원명', { ascending: true });
        
        if (error) {
            console.error('직원 데이터 조회 실패:', error);
            return [];
        }
        
        return data;
    } catch (error) {
        console.error('직원 데이터 조회 중 오류 발생:', error);
        return [];
    }
}

// 설문조사 항목 가져오기 (전체 설문)
async function getData() {
    try {
        const supabase = await initSupabase();
        if (!supabase) return [];
        
        const { data, error } = await supabase
            .from('needssurvey')
            .select('대분류, 중분류, 소분류, 필수구분, 입력방식, 내용')
            .order('created_at', { ascending: true });
        
        if (error) {
            console.error('설문조사 데이터 조회 실패:', error);
            return [];
        }
        
        // 헤더 추가
        const headers = ['대분류', '중분류', '소분류', '필수구분', '입력방식', '내용'];
        return [headers, ...data.map(item => [
            item.대분류, 
            item.중분류, 
            item.소분류, 
            item.필수구분, 
            item.입력방식, 
            item.내용
        ])];
    } catch (error) {
        console.error('설문조사 데이터 조회 중 오류 발생:', error);
        return [];
    }
}

// 필수 설문조사 항목만 가져오기
async function getSelectedData() {
    try {
        const supabase = await initSupabase();
        if (!supabase) return [];
        
        const { data, error } = await supabase
            .from('needssurvey')
            .select('대분류, 중분류, 소분류, 필수구분, 입력방식, 내용')
            .eq('필수구분', '필수')
            .order('created_at', { ascending: true });
        
        if (error) {
            console.error('필수 설문조사 데이터 조회 실패:', error);
            return [];
        }
        
        // 헤더 추가
        const headers = ['대분류', '중분류', '소분류', '필수구분', '입력방식', '내용'];
        return [headers, ...data.map(item => [
            item.대분류, 
            item.중분류, 
            item.소분류, 
            item.필수구분, 
            item.입력방식, 
            item.내용
        ])];
    } catch (error) {
        console.error('필수 설문조사 데이터 조회 중 오류 발생:', error);
        return [];
    }
}

// 회원의 설문조사 결과 가져오기
async function getMemberSurveys(memberNo) {
    try {
        const supabase = await initSupabase();
        if (!supabase) return { success: false, message: 'Supabase 연결 실패', surveys: [] };
        
        // 해당 회원의 모든 설문조사 ID를 먼저 가져옴 (중복 제거)
        const { data: surveysData, error: surveysError } = await supabase
            .from('needssurvey_response')
            .select('목차data')
            .eq('회원번호', memberNo)
            .order('created_at', { ascending: false });
            
        if (surveysError) {
            console.error('회원 설문조사 ID 조회 실패:', surveysError);
            return { success: false, message: surveysError.message, surveys: [] };
        }
        
        if (!surveysData || surveysData.length === 0) {
            return { success: true, message: '설문조사 결과 없음', surveys: [] };
        }
        
        // 중복 제거된 설문조사 ID 목록
        const uniqueSurveyIds = [...new Set(surveysData.map(item => item.목차data))];
        
        // 결과를 저장할 배열
        const surveys = [];
        
        // 각 설문조사 ID에 대해 모든 응답 데이터 조회
        for (const surveyId of uniqueSurveyIds) {
            const { data: responsesData, error: responsesError } = await supabase
                .from('needssurvey_response')
                .select('*')
                .eq('목차data', surveyId)
                .order('created_at', { ascending: true });
                
            if (responsesError) {
                console.error(`설문조사 ID(${surveyId}) 응답 조회 실패:`, responsesError);
                continue;
            }
            
            if (responsesData && responsesData.length > 0) {
                // 기본 정보는 첫 번째 행에서 가져옴
                const firstResponse = responsesData[0];
                
                // formData 객체 생성
                const formData = {};
                
                // 각 응답 행의 소분류(질문)와 답변을 formData에 추가
                responsesData.forEach(response => {
                    formData[response.소분류] = response.답변;
                });
                
                surveys.push({
                    surveyId: firstResponse.목차data,
                    memberNo: firstResponse.회원번호,
                    memberName: firstResponse.회원명,
                    staffNo: firstResponse.직원번호,
                    staffName: firstResponse.직원명,
                    formData: formData
                });
            }
        }
        
        return { success: true, message: '설문조사 결과 조회 성공', surveys };
    } catch (error) {
        console.error('회원 설문조사 결과 조회 중 오류 발생:', error);
        return { success: false, message: error.message, surveys: [] };
    }
}

// 설문조사 결과 저장 (새로운 방식)
async function saveResearchData(surveyData) {
    try {
        const supabase = await initSupabase();
        if (!supabase) return { success: false, message: 'Supabase 연결 실패' };
        
        // 설문 항목 데이터 가져오기 (대분류, 중분류, 소분류 매핑을 위해)
        const surveyItemsResponse = await getData();
        if (!surveyItemsResponse || surveyItemsResponse.length <= 1) {
            return { success: false, message: '설문 항목 데이터를 가져올 수 없습니다.' };
        }
        
        // 헤더를 제외한 설문 항목 데이터
        const surveyItems = surveyItemsResponse.slice(1);
        
        // 삽입할 데이터 배열
        const insertData = [];
        
        // formData의 각 항목에 대해 새 형식으로 데이터 구성
        for (const question in surveyData.formData) {
            // 해당 질문에 대한 설문 항목 찾기
            const foundItem = surveyItems.find(item => item[2] === question);
            
            if (foundItem) {
                // UUID 생성 (클라이언트에서는 간단한 대체 방법 사용)
                const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
                
                insertData.push({
                    설문응답_id: uuid,
                    목차data: surveyData.surveyId,
                    회원번호: surveyData.memberNo,
                    회원명: surveyData.memberName,
                    직원번호: surveyData.staffNo,
                    직원명: surveyData.staffName,
                    대분류: foundItem[0],  // 대분류
                    중분류: foundItem[1],  // 중분류
                    소분류: question,      // 소분류 (질문)
                    답변: surveyData.formData[question]  // 답변
                });
            } else {
                console.warn(`질문 "${question}"에 대한 설문 항목을 찾을 수 없습니다.`);
            }
        }
        
        if (insertData.length === 0) {
            return { success: false, message: '저장할 데이터가 없습니다.' };
        }
        
        // 데이터 삽입
        const { error } = await supabase
            .from('needssurvey_response')
            .insert(insertData);
        
        if (error) {
            console.error('설문조사 결과 저장 실패:', error);
            return { success: false, message: error.message };
        }
        
        return { success: true, message: '설문조사 결과가 성공적으로 저장되었습니다.' };
    } catch (error) {
        console.error('설문조사 결과 저장 중 오류 발생:', error);
        return { success: false, message: error.message };
    }
}

// 설문조사 결과 수정 (새로운 방식)
async function updateResearchData(updateData) {
    try {
        const supabase = await initSupabase();
        if (!supabase) return { success: false, message: 'Supabase 연결 실패' };
        
        // 먼저 기존 레코드 삭제
        const { error: deleteError } = await supabase
            .from('needssurvey_response')
            .delete()
            .eq('목차data', updateData.oldSurveyId);
        
        if (deleteError) {
            console.error('기존 설문조사 결과 삭제 실패:', deleteError);
            return { success: false, message: deleteError.message };
        }
        
        // 새 설문조사 ID로 데이터 저장
        const saveData = {
            surveyId: updateData.newSurveyId,
            memberNo: updateData.memberNo,
            memberName: updateData.memberName,
            staffNo: updateData.staffNo,
            staffName: updateData.staffName,
            formData: updateData.formData
        };
        
        // 새 형식으로 데이터 저장
        const saveResult = await saveResearchData(saveData);
        
        if (!saveResult.success) {
            return saveResult;
        }
        
        return { success: true, message: '설문조사 결과가 성공적으로 수정되었습니다.' };
    } catch (error) {
        console.error('설문조사 결과 수정 중 오류 발생:', error);
        return { success: false, message: error.message };
    }
}

// 웹 앱 URL 가져오기 (더 이상 필요하지 않지만 호환성을 위해 유지)
function getWebAppUrl() {
    // 현재 페이지의 URL에서 쿼리 파라미터 부분을 제외한 기본 URL 반환
    return window.location.href.split('?')[0];
} 