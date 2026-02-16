
import React, { useState, useEffect } from 'react';
import { 
  MONTHS, 
  DEPARTMENTS, 
  RN_LEVELS, 
  SPECIALTIES, 
  SECTIONS_CONFIG,
  SOURCE_OF_DATA_OPTIONS,
  UI_LABELS
} from '../constants';
import { ComplianceStatus, TracerRound, SectionData } from '../types';
import { Save, ChevronRight, ChevronLeft, PlusCircle, Database, FileText, CheckCircle2 } from 'lucide-react';

interface TracerFormProps {
  onSubmit: (data: TracerRound) => void;
  lang: 'en' | 'th';
  initialData?: TracerRound | null;
  isEdit?: boolean;
}

const TracerForm: React.FC<TracerFormProps> = ({ onSubmit, lang, initialData, isEdit = false }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<TracerRound>>({
    year: new Date().getFullYear(),
    month: MONTHS.en[new Date().getMonth()],
    date: new Date().toISOString().split('T')[0],
    sourceOfData: SOURCE_OF_DATA_OPTIONS.en[0],
    depType: DEPARTMENTS[0].type,
    department: DEPARTMENTS[0].name,
    rnLevel: RN_LEVELS[0],
    principalDiagnosis: '',
    comorbidity: '',
    specialty: SPECIALTIES.en[0],
    patientAge: 0,
    sections: SECTIONS_CONFIG.reduce((acc, section) => {
      acc[section.id as keyof TracerRound['sections']] = {
        items: section.items.reduce((itemAcc, item) => {
          itemAcc[item.id] = ComplianceStatus.MET;
          return itemAcc;
        }, {} as Record<string, ComplianceStatus>),
        finding: ''
      };
      return acc;
    }, {} as TracerRound['sections']),
    developmentIssues: '',
    appreciations: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'department') {
      const selectedDept = DEPARTMENTS.find(d => d.name === value || d.name_th === value);
      setFormData(prev => ({ 
        ...prev, 
        department: selectedDept ? selectedDept.name : value,
        depType: selectedDept ? selectedDept.type : prev.depType
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: (name === 'year' || name === 'patientAge') ? (parseInt(value) || 0) : value 
      }));
    }
  };

  const handleStatusChange = (sectionId: string, itemId: string, status: ComplianceStatus) => {
    setFormData(prev => {
      const sections = { ...prev.sections } as TracerRound['sections'];
      sections[sectionId as keyof TracerRound['sections']].items[itemId] = status;
      return { ...prev, sections };
    });
  };

  const handleFindingChange = (sectionId: string, finding: string) => {
    setFormData(prev => {
      const sections = { ...prev.sections } as TracerRound['sections'];
      sections[sectionId as keyof TracerRound['sections']].finding = finding;
      return { ...prev, sections };
    });
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData: TracerRound = {
      ...formData as TracerRound,
      id: formData.id || crypto.randomUUID(),
      createdAt: formData.createdAt || Date.now()
    };
    onSubmit(finalData);
  };

  const steps = [
    { title: UI_LABELS[lang].demographics, content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{UI_LABELS[lang].year}</label>
          <input type="number" name="year" value={formData.year} onChange={handleBasicInfoChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 bg-white border" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{UI_LABELS[lang].month}</label>
          <select name="month" value={formData.month} onChange={handleBasicInfoChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 bg-white border">
            {MONTHS.en.map((m, idx) => <option key={m} value={m}>{MONTHS[lang][idx]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{UI_LABELS[lang].date}</label>
          <input type="date" name="date" value={formData.date} onChange={handleBasicInfoChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 bg-white border" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{UI_LABELS[lang].sourceOfData}</label>
          <select name="sourceOfData" value={formData.sourceOfData} onChange={handleBasicInfoChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 bg-white border">
            {SOURCE_OF_DATA_OPTIONS.en.map((opt, idx) => <option key={opt} value={opt}>{SOURCE_OF_DATA_OPTIONS[lang][idx]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{UI_LABELS[lang].department}</label>
          <select name="department" value={formData.department} onChange={handleBasicInfoChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 bg-white border">
            {DEPARTMENTS.map(d => <option key={d.name} value={d.name}>{lang === 'en' ? d.name : d.name_th}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{UI_LABELS[lang].deptType}</label>
          <input type="text" name="depType" value={formData.depType} readOnly className="mt-1 block w-full rounded-md border-gray-200 shadow-sm sm:text-sm p-2.5 bg-gray-50 border cursor-not-allowed font-semibold text-indigo-700" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{UI_LABELS[lang].rnLevel}</label>
          <select name="rnLevel" value={formData.rnLevel} onChange={handleBasicInfoChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 bg-white border">
            {RN_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{UI_LABELS[lang].specialty}</label>
          <select name="specialty" value={formData.specialty} onChange={handleBasicInfoChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 bg-white border">
            {SPECIALTIES.en.map((s, idx) => <option key={s} value={s}>{SPECIALTIES[lang][idx]}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{UI_LABELS[lang].principalDiagnosis}</label>
          <input type="text" name="principalDiagnosis" value={formData.principalDiagnosis} onChange={handleBasicInfoChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 bg-white border" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{UI_LABELS[lang].comorbidity}</label>
          <input type="text" name="comorbidity" value={formData.comorbidity} onChange={handleBasicInfoChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 bg-white border" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{UI_LABELS[lang].patientAge}</label>
          <input type="number" name="patientAge" value={formData.patientAge} onChange={handleBasicInfoChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 bg-white border" />
        </div>
      </div>
    )},
    ...SECTIONS_CONFIG.map(section => ({
      title: lang === 'en' ? section.title_en : section.title_th,
      content: (
        <div className="space-y-6">
          <div className="bg-indigo-50 p-4 rounded-xl flex items-center gap-3 border border-indigo-100">
            <div className="text-indigo-600">{section.icon}</div>
            <h3 className="font-bold text-indigo-900">{lang === 'en' ? section.title_en : section.title_th}</h3>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {section.items.map(item => (
              <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <span className="text-sm text-gray-700 font-medium leading-relaxed pr-4 flex items-start gap-2">
                  <span className="text-indigo-400 font-mono text-xs mt-0.5">{item.id}</span>
                  {lang === 'en' ? item.label_en : item.label_th}
                </span>
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {[ComplianceStatus.MET, ComplianceStatus.PARTIALLY_MET, ComplianceStatus.NOT_MET, ComplianceStatus.NA].map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatusChange(section.id, item.id, status)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all uppercase tracking-tighter ${
                        formData.sections?.[section.id as keyof TracerRound['sections']]?.items[item.id] === status
                          ? status === ComplianceStatus.MET ? 'bg-green-600 text-white border-green-600' :
                            status === ComplianceStatus.PARTIALLY_MET ? 'bg-amber-500 text-white border-amber-500' :
                            status === ComplianceStatus.NOT_MET ? 'bg-red-600 text-white border-red-600' :
                            'bg-slate-500 text-white border-slate-500'
                          : 'bg-white text-gray-400 border-gray-200'
                      }`}
                    >
                      {status === ComplianceStatus.MET ? UI_LABELS[lang].complianceMet :
                       status === ComplianceStatus.PARTIALLY_MET ? UI_LABELS[lang].compliancePartial :
                       status === ComplianceStatus.NOT_MET ? UI_LABELS[lang].complianceNotMet :
                       UI_LABELS[lang].complianceNA}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{UI_LABELS[lang].findings}</label>
            <textarea
              value={formData.sections?.[section.id as keyof TracerRound['sections']]?.finding}
              onChange={(e) => handleFindingChange(section.id, e.target.value)}
              className="w-full h-24 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              placeholder="..."
            />
          </div>
        </div>
      )
    })),
    { title: UI_LABELS[lang].finalSummary, content: (
      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-red-600 mb-2">
            <PlusCircle size={16} /> {UI_LABELS[lang].devIssues}
          </label>
          <textarea
            name="developmentIssues"
            value={formData.developmentIssues}
            onChange={handleBasicInfoChange}
            className="w-full h-32 p-4 border border-red-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-green-600 mb-2">
            <PlusCircle size={16} /> {UI_LABELS[lang].appreciations}
          </label>
          <textarea
            name="appreciations"
            value={formData.appreciations}
            onChange={handleBasicInfoChange}
            className="w-full h-32 p-4 border border-green-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
          />
        </div>
      </div>
    )}
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      <div className="bg-slate-900 p-8 text-white">
        <h2 className="text-2xl font-bold">{isEdit ? (lang === 'en' ? 'Edit Tracer Entry' : 'แก้ไขบันทึกการตรวจ') : (lang === 'en' ? 'Nursing Tracer Entry' : 'บันทึกการตรวจติดตามพยาบาล')}</h2>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-6 overflow-hidden">
          <div className="bg-indigo-500 h-full transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
          <h3 className="text-xl font-bold text-slate-900">{steps[step].title}</h3>
        </div>
        <div className="min-h-[400px]">{steps[step].content}</div>
        <div className="mt-12 pt-8 border-t flex justify-between">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-slate-600">
            <ChevronLeft size={20} /> {UI_LABELS[lang].previous}
          </button>
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-2 px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold">
              {UI_LABELS[lang].next} <ChevronRight size={20} />
            </button>
          ) : (
            <button onClick={handleFinalSubmit} className="flex items-center gap-2 px-10 py-3 bg-green-600 text-white rounded-xl font-bold">
              <Save size={20} /> {isEdit ? (lang === 'en' ? 'Update Audit' : 'ปรับปรุงข้อมูล') : UI_LABELS[lang].saveAudit}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TracerForm;
