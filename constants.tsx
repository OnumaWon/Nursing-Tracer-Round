
import React from 'react';
import { 
  ClipboardCheck, 
  RefreshCw, 
  Stethoscope, 
  Layout, 
  Activity, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';

export const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  th: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
};

export const SOURCE_OF_DATA_OPTIONS = {
  en: ['Tracer', 'Case Review', 'MR Audit'],
  th: ['Tracer', 'Case Review', 'MR Audit']
};

export interface DepartmentInfo {
  name: string;
  name_th: string;
  type: 'Critical' | 'IPD' | 'OPD';
}

export const DEPARTMENTS: DepartmentInfo[] = [
  { name: 'Ward 6B', name_th: 'หอผู้ป่วย 6B', type: 'Critical' },
  { name: 'Intensive Care Unit', name_th: 'ไอซียู (ICU)', type: 'Critical' },
  { name: 'Cardiac Care Unit', name_th: 'หอผู้ป่วยวิกฤตหัวใจ (CCU)', type: 'Critical' },
  { name: 'Operating Room', name_th: 'ห้องผ่าตัด', type: 'Critical' },
  { name: 'Anesthetic', name_th: 'วิสัญญี', type: 'Critical' },
  { name: 'Intermediate Intensive Care', name_th: 'หอผู้ป่วยวิกฤตระยะประคับประคอง', type: 'Critical' },
  { name: 'SICU', name_th: 'หอผู้ป่วยวิกฤตศัลยกรรม', type: 'Critical' },
  { name: 'Emergency', name_th: 'แผนกฉุกเฉิน', type: 'Critical' },
  { name: 'Ambulance Service & Vehicle HOD', name_th: 'หน่วยรถพยาบาล', type: 'Critical' },
  { name: 'Dispatch Center', name_th: 'ศูนย์รับส่งผู้ป่วย', type: 'Critical' },
  { name: 'Cardiac Cath Lab', name_th: 'ห้องปฏิบัติการสวนหัวใจ', type: 'Critical' },
  { name: 'Hemodialysis', name_th: 'ศูนย์ไตเทียม', type: 'Critical' },
  { name: 'Ward 5B', name_th: 'หอผู้ป่วย 5B', type: 'IPD' },
  { name: 'Ward 4B', name_th: 'หอผู้ป่วย 4B', type: 'IPD' },
  { name: 'Ward 7A', name_th: 'หอผู้ป่วย 7A', type: 'IPD' },
  { name: 'Ward 7B', name_th: 'หอผู้ป่วย 7B', type: 'IPD' },
  { name: 'Ward 6A', name_th: 'หอผู้ป่วย 6A', type: 'IPD' },
  { name: 'Ward 3B', name_th: 'หอผู้ป่วย 3B', type: 'IPD' },
  { name: 'Ward 8A', name_th: 'หอผู้ป่วย 8A', type: 'IPD' },
  { name: 'Ward 8B', name_th: 'หอผู้ป่วย 8B', type: 'IPD' },
  { name: 'Labour Room', name_th: 'ห้องคลอด', type: 'IPD' },
  { name: 'Nursery', name_th: 'ห้องเด็กอ่อน', type: 'IPD' },
  { name: 'Trauma Center', name_th: 'ศูนย์อุบัติเหตุ', type: 'OPD' },
  { name: 'Outreach Clinic', name_th: 'คลินิกเครือข่าย', type: 'OPD' },
  { name: 'BPK-Canal Clinic', name_th: 'คลินิกคลองช่องนนทรี', type: 'OPD' },
  { name: 'Urology', name_th: 'คลินิกศัลยกรรมทางเดินปัสสาวะ', type: 'OPD' },
  { name: 'Surgery Unit', name_th: 'คลินิกศัลยกรรม', type: 'OPD' },
  { name: 'Heart Clinic', name_th: 'คลินิกหัวใจ', type: 'OPD' },
  { name: 'Pediatrics', name_th: 'คลินิกกุมารเวช', type: 'OPD' },
  { name: 'Obstetrics & Gynecology', name_th: 'คลินิกสูตินรีเวช', type: 'OPD' },
];

export const RN_LEVELS = ['RN1', 'RN2', 'RN3', 'RN4'];

export const SPECIALTIES = {
  en: [
    'Internal Medicine', 'Surgery', 'Obstetrics & Gynecology', 'Pediatrics', 
    'Orthopedics', 'Urology', 'Cardiology', 'Gastroenterology', 'Oncology', 
    'Neurology', 'Infectious Disease', 'Other'
  ],
  th: [
    'อายุรศาสตร์', 'ศัลยศาสตร์', 'สูตินรีเวชวิทยา', 'กุมารเวชศาสตร์', 
    'ออร์โธปิดิกส์', 'ระบบทางเดินปัสสาวะ', 'โรคหัวใจ', 'ทางเดินอาหาร', 'มะเร็งวิทยา', 
    'ประสาทวิทยา', 'โรคติดเชื้อ', 'อื่นๆ'
  ]
};

export const UI_LABELS = {
  en: {
    year: 'Year',
    month: 'Month',
    date: 'Date',
    sourceOfData: 'Source of Data',
    department: 'Department',
    deptType: 'Department Type',
    rnLevel: 'RN Level',
    specialty: 'Specialty',
    principalDiagnosis: 'Principal Diagnosis',
    comorbidity: 'Comorbidity',
    patientAge: 'Patient Age (Years)',
    findings: 'Findings / Comments for this section',
    devIssues: 'Development Issues (Areas for Improvement)',
    appreciations: 'Appreciations (Commendations)',
    saveAudit: 'Save Audit Record',
    next: 'Next Step',
    previous: 'Previous',
    demographics: 'Demographics',
    finalSummary: 'Final Summary',
    complianceMet: 'Met',
    compliancePartial: 'Partially Met',
    complianceNotMet: 'Not Met',
    complianceNA: 'N/A'
  },
  th: {
    year: 'ปี',
    month: 'เดือน',
    date: 'วันที่',
    sourceOfData: 'แหล่งที่มาของข้อมูล',
    department: 'แผนก',
    deptType: 'ประเภทแผนก',
    rnLevel: 'ระดับพยาบาล (RN Level)',
    specialty: 'สาขาเฉพาะทาง',
    principalDiagnosis: 'การวินิจฉัยโรคหลัก',
    comorbidity: 'โรคหรือภาวะแทรกซ้อน',
    patientAge: 'อายุผู้ป่วย (ปี)',
    findings: 'สิ่งที่ตรวจพบ / ความคิดเห็นสำหรับส่วนนี้',
    devIssues: 'ประเด็นที่ควรพัฒนา (สิ่งที่ควรปรับปรุง)',
    appreciations: 'คำชมเชย (สิ่งที่ทำได้ดี)',
    saveAudit: 'บันทึกข้อมูลการตรวจ',
    next: 'ขั้นตอนถัดไป',
    previous: 'ก่อนหน้า',
    demographics: 'ข้อมูลทั่วไป',
    finalSummary: 'สรุปผลการตรวจ',
    complianceMet: 'Met',
    compliancePartial: 'Partially Met',
    complianceNotMet: 'Not Met',
    complianceNA: 'N/A'
  }
};

export const SECTIONS_CONFIG = [
  {
    id: 'nursingAssessment',
    title_en: '1. Nursing Assessment',
    title_th: '1. การประเมินทางการพยาบาล',
    icon: <ClipboardCheck className="w-5 h-5" />,
    items: [
      { id: '1.1', label_en: 'Initial Nursing Assessment consistent with patient condition', label_th: 'การประเมินทางการพยาบาลเมื่อแรกรับ สอดคล้องกับสภาวะของผู้ป่วย' },
      { id: '1.2', label_en: 'Patient Identification according to policy', label_th: 'การระบุตัวตนผู้ป่วยถูกต้องตามนโยบาย' },
      { id: '1.3', label_en: 'Pain Assessment according to policy', label_th: 'การประเมินความปวดถูกต้องตามนโยบาย' },
      { id: '1.4', label_en: 'Fall Risk Assessment according to policy', label_th: 'การประเมินความเสี่ยงต่อการพลัดตกหกล้มตามนโยบาย' },
      { id: '1.5', label_en: 'Pressure Injury Risk (Braden) Assessment according to policy', label_th: 'การประเมินความเสี่ยงต่อการเกิดแผลกดทับ (Braden Scale) ตามนโยบาย' },
      { id: '1.6', label_en: 'Suicide/Self-harm Screening/Assessment according to policy', label_th: 'การคัดกรอง/ประเมินความเสี่ยงต่อการฆ่าตัวตายหรือทำร้ายตัวเองตามนโยบาย' }
    ]
  },
  {
    id: 'reAssessment',
    title_en: '2. Re-assessment',
    title_th: '2. การประเมินซ้ำ',
    icon: <RefreshCw className="w-5 h-5" />,
    items: [
      { id: '2.1', label_en: 'Re-assessment on condition change', label_th: 'การประเมินซ้ำเมื่อมีการเปลี่ยนแปลงของสภาวะผู้ป่วย' },
      { id: '2.2', label_en: 'Re-assessment on pain management', label_th: 'การประเมินซ้ำหลังการจัดการความปวด' },
      { id: '2.3', label_en: 'Re-assessment on medication usage', label_th: 'การประเมินซ้ำเกี่ยวกับการใช้ยา' },
      { id: '2.4', label_en: 'Re-assessment on pressure injury guideline', label_th: 'การประเมินซ้ำตามแนวทางปฏิบัติเรื่องแผลกดทับ' },
      { id: '2.5', label_en: 'Re-assessment on blood administration', label_th: 'การประเมินซ้ำระหว่างการให้เลือด' }
    ]
  },
  {
    id: 'nursingDiagnosis',
    title_en: '3. Nursing Diagnosis',
    title_th: '3. การวินิจฉัยทางการพยาบาล',
    icon: <Stethoscope className="w-5 h-5" />,
    items: [
      { id: '3.1', label_en: 'Identification of significant patient problems/risks consistent with assessment', label_th: 'การระบุปัญหาหรือความเสี่ยงที่สำคัญสอดคล้องกับการประเมิน' },
      { id: '3.2', label_en: 'Nursing diagnosis consistent with assessment data', label_th: 'ข้อวินิจฉัยทางการพยาบาลสอดคล้องกับข้อมูลการประเมิน' },
      { id: '3.3', label_en: 'Nursing diagnosis covers disease-specific risks', label_th: 'ข้อวินิจฉัยทางการพยาบาลครอบคลุมความเสี่ยงเฉพาะโรค' },
      { id: '3.4', label_en: 'Prioritization of problems consistent with patient condition', label_th: 'การจัดลำดับความสำคัญของปัญหาเหมาะสมกับสภาวะผู้ป่วย' }
    ]
  },
  {
    id: 'planning',
    title_en: '4. Planning',
    title_th: '4. การวางแผนการพยาบาล',
    icon: <Layout className="w-5 h-5" />,
    items: [
      { id: '4.1', label_en: 'Nursing Care Plan consistent with nursing diagnosis', label_th: 'แผนการพยาบาลสอดคล้องกับข้อวินิจฉัยทางการพยาบาล' },
      { id: '4.2', label_en: 'Clearly defined and measurable nursing goals (SMART Goals)', label_th: 'เป้าหมายทางการพยาบาลมีความชัดเจนและวัดผลได้ (SMART Goals)' },
      { id: '4.3', label_en: 'Patient & Family Centered Care', label_th: 'การดูแลที่เน้นผู้ป่วยและครอบครัวเป็นศูนย์กลาง' },
      { id: '4.4', label_en: 'Infection Prevention/Caution according to infection risk type', label_th: 'การป้องกันการติดเชื้อตามประเภทความเสี่ยง' },
      { id: '4.5', label_en: 'Patient & Family Involvement', label_th: 'ผู้ป่วยและครอบครัวมีส่วนร่วมในการวางแผน' },
      { id: '4.6', label_en: 'Early Discharge Planning (plan initiated from admission)', label_th: 'การวางแผนจำหน่ายล่วงหน้า (เริ่มวางแผนตั้งแต่รับเข้า)' },
      { id: '4.7', label_en: 'Discharge Plan linked to Continuity of Care', label_th: 'แผนการจำหน่ายมีการเชื่อมโยงกับการดูแลต่อเนื่อง' }
    ]
  },
  {
    id: 'implementation',
    title_en: '5. Implementation',
    title_th: '5. การปฏิบัติการพยาบาล',
    icon: <Activity className="w-5 h-5" />,
    items: [
      { id: '5.1', label_en: 'Nursing interventions consistent with nursing diagnosis and physician treatment plan', label_th: 'กิจกรรมการพยาบาลสอดคล้องกับข้อวินิจฉัยและแผนการรักษาของแพทย์' },
      { id: '5.2', label_en: 'Correct Medication Administration', label_th: 'การบริหารยาถูกต้องตามหลักปฏิบัติ' },
      { id: '5.3', label_en: 'Fall Prevention Interventions', label_th: 'การปฏิบัติเพื่อป้องกันการพลัดตกหกล้ม' },
      { id: '5.4', label_en: 'Pressure Injury Prevention', label_th: 'การปฏิบัติเพื่อป้องกันแผลกดทับ' },
      { id: '5.5', label_en: 'Pain Management Implementation', label_th: 'การปฏิบัติเพื่อจัดการความปวด' },
      { id: '5.6', label_en: 'Infection Prevention & Control', label_th: 'การปฏิบัติเพื่อป้องกันและควบคุมการติดเชื้อ' },
      { id: '5.7', label_en: 'Blood Administration Compliance', label_th: 'การปฏิบัติในการให้เลือดถูกต้องตามมาตรฐาน' },
      { id: '5.8', label_en: 'Patient Education', label_th: 'การให้สุขศึกษาแก่ผู้ป่วย' }
    ]
  },
  {
    id: 'nursingEvaluation',
    title_en: '6. Nursing Evaluation',
    title_th: '6. การประเมินผลทางการพยาบาล',
    icon: <CheckCircle2 className="w-5 h-5" />,
    items: [
      { id: '6.1', label_en: 'Evaluation of nursing outcomes from interventions', label_th: 'การประเมินผลลัพธ์ทางการพยาบาลหลังการปฏิบัติ' },
      { id: '6.2', label_en: 'Care plan adjusted when outcomes are not achieved', label_th: 'มีการปรับแผนการพยาบาลเมื่อไม่บรรลุเป้าหมาย' }
    ]
  },
  {
    id: 'medicalRecordCompleteness',
    title_en: '7. Medical Record Completeness',
    title_th: '7. ความสมบูรณ์ของบันทึกทางการพยาบาล',
    icon: <FileText className="w-5 h-5" />,
    items: [
      { id: '7.1', label_en: 'Documentation of nursing assessment', label_th: 'มีการบันทึกข้อมูลการประเมินทางการพยาบาล' },
      { id: '7.2', label_en: 'Documentation of nursing diagnosis and supporting data', label_th: 'มีการบันทึกข้อวินิจฉัยทางการพยาบาลและข้อมูลสนับสนุน' },
      { id: '7.3', label_en: 'Documentation of nursing interventions/activities', label_th: 'มีการบันทึกกิจกรรมการพยาบาลที่ปฏิบัติ' },
      { id: '7.4', label_en: 'Documentation of nursing outcomes', label_th: 'มีการบันทึกผลลัพธ์ทางการพยาบาล' }
    ]
  }
];
