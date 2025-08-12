const SUPABASE_URL = "https://dfomeijvzayyszisqflo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmb21laWp2emF5eXN6aXNxZmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NjYwNDIsImV4cCI6MjA2MDQ0MjA0Mn0.-r1iL04wvPNdBeIvgxqXLF2rWqIUX5Ot-qGQRdYo_qk";

let supabaseClient = null;

function initSupabase() {
    if (!supabaseClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return supabaseClient;
}

window.supabase = initSupabase();

async function getMemberData() {
    try {
        const supabase = initSupabase();
        if (!supabase) return [];
        
        const { data, error } = await supabase
            .from('membersinfo')
            .select('회원번호, 회원명, 입소일, 퇴소일')
            .order('회원명', { ascending: true });
        
        if (error) {
            return [];
        }
        
        return data;
    } catch (error) {
        return [];
    }
}

async function getEmployeeData() {
    try {
        const supabase = initSupabase();
        if (!supabase) return [];
        
        const { data, error } = await supabase
            .from('employeesinfo')
            .select('직원번호, 직원명, 계약시작일, 계약종료일')
            .order('직원명', { ascending: true });
        
        if (error) {
            return [];
        }
        
        return data;
    } catch (error) {
        return [];
    }
}

async function getData() {
    try {
        const supabase = initSupabase();
        if (!supabase) return [];
        
        const { data, error } = await supabase
            .from('needssurvey')
            .select('대분류, 중분류, 소분류, 필수구분, 입력방식, 내용')
            .order('created_at', { ascending: true });
        
        if (error) {
            return [];
        }
        
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
        return [];
    }
}

async function getSelectedData() {
    try {
        const supabase = initSupabase();
        if (!supabase) return [];
        
        const { data, error } = await supabase
            .from('needssurvey')
            .select('대분류, 중분류, 소분류, 필수구분, 입력방식, 내용')
            .eq('필수구분', '필수')
            .order('created_at', { ascending: true });
        
        if (error) {
            return [];
        }
        
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
        return [];
    }
}

async function getMemberSurveys(memberNo) {
    try {
        const supabase = initSupabase();
        if (!supabase) return { success: false, message: 'Supabase 연결 실패', surveys: [] };
        
        const { data: surveysData, error: surveysError } = await supabase
            .from('needssurvey_response')
            .select('목차data')
            .eq('회원번호', memberNo)
            .order('created_at', { ascending: false });
            
        if (surveysError) {
            return { success: false, message: surveysError.message, surveys: [] };
        }
        
        if (!surveysData || surveysData.length === 0) {
            return { success: true, message: '설문조사 결과 없음', surveys: [] };
        }
        
        const uniqueSurveyIds = [...new Set(surveysData.map(item => item.목차data))];
        
        const surveys = [];
        
        for (const surveyId of uniqueSurveyIds) {
            const { data: responsesData, error: responsesError } = await supabase
                .from('needssurvey_response')
                .select('*')
                .eq('목차data', surveyId)
                .order('created_at', { ascending: true });
                
            if (responsesError) {
                continue;
            }
            
            if (responsesData && responsesData.length > 0) {
                const firstResponse = responsesData[0];
                
                const formData = {};
                
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
        return { success: false, message: error.message, surveys: [] };
    }
}

async function saveResearchData(surveyData) {
    try {
        const supabase = initSupabase();
        if (!supabase) return { success: false, message: 'Supabase 연결 실패' };
        
        const surveyItemsResponse = await getData();
        if (!surveyItemsResponse || surveyItemsResponse.length <= 1) {
            return { success: false, message: '설문 항목 데이터를 가져올 수 없습니다.' };
        }
        
        const surveyItems = surveyItemsResponse.slice(1);
        
        const insertData = [];
        
        for (const question in surveyData.formData) {
            const foundItem = surveyItems.find(item => item[2] === question);
            
            if (foundItem) {
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
                    대분류: foundItem[0],
                    중분류: foundItem[1],
                    소분류: question,
                    답변: surveyData.formData[question]
                });
            }
        }
        
        if (insertData.length === 0) {
            return { success: false, message: '저장할 데이터가 없습니다.' };
        }
        
        const { error } = await supabase
            .from('needssurvey_response')
            .insert(insertData);
        
        if (error) {
            return { success: false, message: error.message };
        }
        
        return { success: true, message: '설문조사 결과가 성공적으로 저장되었습니다.' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function updateResearchData(updateData) {
    try {
        const supabase = initSupabase();
        if (!supabase) return { success: false, message: 'Supabase 연결 실패' };
        
        const { error: deleteError } = await supabase
            .from('needssurvey_response')
            .delete()
            .eq('목차data', updateData.oldSurveyId);
        
        if (deleteError) {
            return { success: false, message: deleteError.message };
        }
        
        const saveData = {
            surveyId: updateData.newSurveyId,
            memberNo: updateData.memberNo,
            memberName: updateData.memberName,
            staffNo: updateData.staffNo,
            staffName: updateData.staffName,
            formData: updateData.formData
        };
        
        const saveResult = await saveResearchData(saveData);
        
        if (!saveResult.success) {
            return saveResult;
        }
        
        return { success: true, message: '설문조사 결과가 성공적으로 수정되었습니다.' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

function getWebAppUrl() {
    return window.location.href.split('?')[0];
}