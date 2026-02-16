
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
  ClipboardList, 
  BarChart3, 
  MessageSquare, 
  History, 
  Plus, 
  LayoutDashboard,
  Settings as SettingsIcon,
  Bell,
  Search,
  Menu,
  X,
  ArrowLeft,
  Printer,
  Calendar,
  User as UserIcon,
  Building2,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  Database,
  Trash2,
  RefreshCw,
  Sparkles,
  Loader2,
  FileText,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Languages,
  Edit2,
  FileUp,
  Activity,
  TrendingUp,
  LineChart as LineChartIcon
} from 'lucide-react';
import TracerForm from './components/TracerForm';
import Dashboard from './components/Dashboard';
import Assistant from './components/Assistant';
import DepartmentTracking from './components/DepartmentTracking';
import { TracerRound, ComplianceStatus, SectionData } from './types';
import { SECTIONS_CONFIG, UI_LABELS } from './constants';
import { analyzeSingleRound, analyzeSection } from './services/geminiService';

const SidebarLink = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>
  </Link>
);

const ReportView = ({ rounds, lang }: { rounds: TracerRound[], lang: 'en' | 'th' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const round = rounds.find(r => r.id === id);
  const [sectionSummaries, setSectionSummaries] = useState<Record<string, { content: string, loading: boolean, expanded: boolean }>>({});
  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null);

  if (!round) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm">
        <X className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Report Not Found</h2>
        <p className="text-slate-500 mb-6">The tracer round record you are looking for does not exist.</p>
        <button onClick={() => navigate('/history')} className="text-indigo-600 font-medium hover:underline">Back to History</button>
      </div>
    );
  }

  const handleSummarizeSection = async (sectionId: string, sectionTitle: string, sectionData: SectionData) => {
    if (sectionSummaries[sectionId]?.content && !sectionSummaries[sectionId].expanded) {
      setSectionSummaries(prev => ({
        ...prev,
        [sectionId]: { ...prev[sectionId], expanded: true }
      }));
      return;
    }

    if (sectionSummaries[sectionId]?.expanded) {
      setSectionSummaries(prev => ({
        ...prev,
        [sectionId]: { ...prev[sectionId], expanded: false }
      }));
      return;
    }

    setSectionSummaries(prev => ({
      ...prev,
      [sectionId]: { content: '', loading: true, expanded: true }
    }));

    try {
      const summary = await analyzeSection(sectionTitle, sectionData);
      setSectionSummaries(prev => ({
        ...prev,
        [sectionId]: { content: summary, loading: false, expanded: true }
      }));
    } catch (err) {
      alert("Failed to generate AI summary for this section.");
      setSectionSummaries(prev => ({
        ...prev,
        [sectionId]: { ...prev[sectionId], loading: false, expanded: false }
      }));
    }
  };

  const handleCopySectionSummary = (sectionId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedSectionId(sectionId);
    setTimeout(() => setCopiedSectionId(null), 2000);
  };

  const getStatusColor = (status: ComplianceStatus) => {
    switch (status) {
      case ComplianceStatus.MET: return 'text-green-600 bg-green-50 border-green-100';
      case ComplianceStatus.PARTIALLY_MET: return 'text-amber-600 bg-amber-50 border-amber-100';
      case ComplianceStatus.NOT_MET: return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const getComplianceLabel = (status: ComplianceStatus) => {
    switch (status) {
      case ComplianceStatus.MET: return UI_LABELS[lang].complianceMet;
      case ComplianceStatus.PARTIALLY_MET: return UI_LABELS[lang].compliancePartial;
      case ComplianceStatus.NOT_MET: return UI_LABELS[lang].complianceNotMet;
      default: return UI_LABELS[lang].complianceNA;
    }
  };

  const getSectionComplianceStatus = (sectionData: SectionData): ComplianceStatus => {
    const statuses = Object.values(sectionData.items);
    if (statuses.every(s => s === ComplianceStatus.NA)) return ComplianceStatus.NA;
    if (statuses.some(s => s === ComplianceStatus.NOT_MET)) return ComplianceStatus.NOT_MET;
    if (statuses.some(s => s === ComplianceStatus.PARTIALLY_MET)) return ComplianceStatus.PARTIALLY_MET;
    return ComplianceStatus.MET;
  };

  const getComplianceIndicator = (status: ComplianceStatus) => {
    switch (status) {
      case ComplianceStatus.MET: 
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold shadow-sm" title={getComplianceLabel(status)}>
            <Check size={10} strokeWidth={3} />
            <span className="hidden sm:inline uppercase">{getComplianceLabel(status)}</span>
          </div>
        );
      case ComplianceStatus.PARTIALLY_MET: 
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold shadow-sm" title={getComplianceLabel(status)}>
            <Activity size={10} strokeWidth={3} />
            <span className="hidden sm:inline uppercase">{getComplianceLabel(status)}</span>
          </div>
        );
      case ComplianceStatus.NOT_MET: 
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold shadow-sm animate-pulse" title={getComplianceLabel(status)}>
            <AlertCircle size={10} strokeWidth={3} />
            <span className="hidden sm:inline uppercase">{getComplianceLabel(status)}</span>
          </div>
        );
      default: 
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-bold" title={getComplianceLabel(status)}>
            <span className="uppercase">{getComplianceLabel(status)}</span>
          </div>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button 
          onClick={() => navigate('/history')} 
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors font-medium"
        >
          <ArrowLeft size={18} /> {lang === 'en' ? 'Back to History' : 'กลับสู่ประวัติการตรวจ'}
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/edit/${round.id}`)} 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm font-bold"
          >
            <Edit2 size={18} /> {lang === 'en' ? 'Edit Audit' : 'แก้ไขข้อมูล'}
          </button>
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer size={18} /> {lang === 'en' ? 'Print Report' : 'พิมพ์รายงาน'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none">
        <div className="p-8 bg-slate-900 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-wider text-xs uppercase mb-2">
                <ClipboardList size={14} /> {lang === 'en' ? 'Tracer Round Audit Result' : 'ผลการตรวจติดตามทางการพยาบาล'}
              </div>
              <h1 className="text-3xl font-bold">{lang === 'en' ? 'Audit Record Detail' : 'รายละเอียดการบันทึกการตรวจ'}</h1>
              <p className="text-slate-400 mt-2 flex items-center gap-2">
                <Calendar size={16} /> {round.month} {round.year} • {round.date}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">{lang === 'en' ? 'Audit ID' : 'รหัสการตรวจ'}</div>
              <div className="text-sm font-mono text-indigo-300">{round.id.slice(0, 8)}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-100 border-b border-slate-200">
          <div className="bg-white p-6">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Building2 size={16} />
              <span className="text-[10px] uppercase font-bold tracking-wider">{UI_LABELS[lang].department}</span>
            </div>
            <p className="font-bold text-slate-900">{round.department}</p>
            <p className="text-xs text-indigo-600 font-medium">{round.depType}</p>
          </div>
          <div className="bg-white p-6">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <UserIcon size={16} />
              <span className="text-[10px] uppercase font-bold tracking-wider">{UI_LABELS[lang].rnLevel}</span>
            </div>
            <p className="font-bold text-slate-900">{round.rnLevel}</p>
          </div>
          <div className="bg-white p-6">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Stethoscope size={16} />
              <span className="text-[10px] uppercase font-bold tracking-wider">{UI_LABELS[lang].patientAge}</span>
            </div>
            <p className="font-bold text-slate-900">{round.patientAge} {lang === 'en' ? 'Years' : 'ปี'}</p>
            <p className="text-xs text-slate-500 font-medium">{round.specialty}</p>
          </div>
          <div className="bg-white p-6">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Search size={16} />
              <span className="text-[10px] uppercase font-bold tracking-wider">{lang === 'en' ? 'Diagnosis' : 'การวินิจฉัย'}</span>
            </div>
            <p className="font-bold text-slate-900 truncate" title={round.principalDiagnosis}>{round.principalDiagnosis}</p>
            <p className="text-xs text-slate-500 font-medium">{UI_LABELS[lang].principalDiagnosis}</p>
          </div>
        </div>
        
        {round.comorbidity && (
          <div className="px-8 py-4 bg-slate-50 border-b border-slate-100">
             <div className="flex items-center gap-2 text-slate-400 mb-1">
                <FileText size={14} />
                <span className="text-[10px] uppercase font-bold tracking-wider">{UI_LABELS[lang].comorbidity}</span>
              </div>
              <p className="text-sm font-medium text-slate-700">{round.comorbidity}</p>
          </div>
        )}

        <div className="p-8 space-y-12">
          {SECTIONS_CONFIG.map((section) => {
            const sectionId = section.id as keyof TracerRound['sections'];
            const sectionData = round.sections[sectionId];
            const sectionStatus = getSectionComplianceStatus(sectionData);
            const summaryState = sectionSummaries[section.id] || { content: '', loading: false, expanded: false };
            
            return (
              <section key={section.id}>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-2 border-b border-slate-100 gap-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-3 h-3 rounded-full shadow-sm shrink-0 border border-white/20 ${
                        sectionStatus === ComplianceStatus.MET ? 'bg-green-500' :
                        sectionStatus === ComplianceStatus.PARTIALLY_MET ? 'bg-amber-500' :
                        sectionStatus === ComplianceStatus.NOT_MET ? 'bg-red-500' :
                        'bg-slate-300'
                      }`} 
                      title={getComplianceLabel(sectionStatus)}
                    />
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      {section.icon}
                    </div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg font-bold text-slate-900">{lang === 'en' ? section.title_en : section.title_th}</h3>
                      {getComplianceIndicator(sectionStatus)}
                      {summaryState.content && (
                        <button 
                          onClick={() => handleCopySectionSummary(section.id, summaryState.content)}
                          className={`p-1.5 rounded-lg transition-all ${
                            copiedSectionId === section.id ? 'bg-green-100 text-green-700' : 'text-indigo-400 hover:bg-indigo-50 hover:text-indigo-600'
                          }`}
                          title="Copy AI Summary"
                        >
                          {copiedSectionId === section.id ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleSummarizeSection(section.id, lang === 'en' ? section.title_en : section.title_th, sectionData)}
                      disabled={summaryState.loading}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                        summaryState.content 
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
                      }`}
                    >
                      {summaryState.loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      {summaryState.content ? 'AI ANALYSIS' : (lang === 'en' ? 'SUMMARIZE WITH AI' : 'สรุปด้วย AI')}
                      {summaryState.content && (summaryState.expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                    </button>
                  </div>
                </div>

                {summaryState.expanded && (
                  <div className="mb-6 p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl animate-in slide-in-from-top-2 duration-200 relative group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-indigo-500" />
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{lang === 'en' ? 'Targeted AI Insights' : 'ข้อมูลวิเคราะห์โดย AI'}</span>
                      </div>
                      {!summaryState.loading && summaryState.content && (
                        <button 
                          onClick={() => handleCopySectionSummary(section.id, summaryState.content)}
                          className="p-2 hover:bg-indigo-100 rounded-lg text-indigo-600 transition-colors flex items-center gap-1.5"
                          title="Copy Summary"
                        >
                          {copiedSectionId === section.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                          <span className="text-[10px] font-bold uppercase">{copiedSectionId === section.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                    {summaryState.loading ? (
                      <div className="flex items-center gap-2 text-indigo-400 py-2">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-xs italic">{lang === 'en' ? 'Analyzing compliance data...' : 'กำลังวิเคราะห์ข้อมูล...'}</span>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium prose-indigo">
                        {summaryState.content}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="text-slate-400 font-mono text-sm mt-0.5">{item.id}</span>
                        <p className="text-slate-700 text-sm leading-relaxed">{lang === 'en' ? item.label_en : item.label_th}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${getStatusColor(sectionData.items[item.id])}`}>
                        {getComplianceLabel(sectionData.items[item.id])}
                      </span>
                    </div>
                  ))}
                </div>

                {sectionData.finding && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">{UI_LABELS[lang].findings}</p>
                    <p className="text-slate-600 text-sm italic">"{sectionData.finding}"</p>
                  </div>
                )}
              </section>
            );
          })}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> {UI_LABELS[lang].devIssues}
              </h3>
              <div className="p-5 bg-red-50/50 rounded-2xl border border-red-100 min-h-[150px]">
                {round.developmentIssues ? (
                  <p className="text-slate-700 text-sm whitespace-pre-wrap">{round.developmentIssues}</p>
                ) : (
                  <p className="text-slate-400 text-sm italic">{lang === 'en' ? 'No specific issues recorded.' : 'ไม่มีรายการที่บันทึกไว้'}</p>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-green-600 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> {UI_LABELS[lang].appreciations}
              </h3>
              <div className="p-5 bg-green-50/50 rounded-2xl border border-green-100 min-h-[150px]">
                {round.appreciations ? (
                  <p className="text-slate-700 text-sm whitespace-pre-wrap">{round.appreciations}</p>
                ) : (
                  <p className="text-slate-400 text-sm italic">{lang === 'en' ? 'No commendations recorded.' : 'ไม่มีรายการที่บันทึกไว้'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditAuditView = ({ rounds, onUpdate, lang }: { rounds: TracerRound[], onUpdate: (data: TracerRound) => void, lang: 'en' | 'th' }) => {
  const { id } = useParams();
  const round = rounds.find(r => r.id === id);
  const navigate = useNavigate();

  if (!round) return <div>Audit record not found.</div>;

  return (
    <TracerForm 
      onSubmit={(data) => {
        onUpdate(data);
        navigate(`/history/${id}`);
      }} 
      lang={lang} 
      initialData={round} 
      isEdit={true}
    />
  );
};

const SettingsView = ({ rounds, onUpdateRounds, lang }: { rounds: TracerRound[], onUpdateRounds: (rounds: TracerRound[]) => void, lang: 'en' | 'th' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const exportToJson = () => {
    const dataStr = JSON.stringify(rounds, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `nursing-tracer-backup-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportToCSV = () => {
    if (rounds.length === 0) {
      alert(lang === 'en' ? "No data to export." : "ไม่มีข้อมูลสำหรับส่งออก");
      return;
    }

    const baseHeaders = ['id', 'year', 'month', 'date', 'sourceOfData', 'depType', 'department', 'rnLevel', 'principalDiagnosis', 'comorbidity', 'specialty', 'patientAge', 'developmentIssues', 'appreciations', 'createdAt'];
    const sectionHeaders: string[] = [];
    SECTIONS_CONFIG.forEach(sec => {
      sec.items.forEach(item => {
        sectionHeaders.push(`section_${sec.id}_${item.id}`);
      });
      sectionHeaders.push(`section_${sec.id}_finding`);
    });

    const allHeaders = [...baseHeaders, ...sectionHeaders];
    const rows = rounds.map(round => {
      const values = baseHeaders.map(h => {
        const val = (round as any)[h];
        if (typeof val === 'string') {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });

      sectionHeaders.forEach(sh => {
        const parts = sh.split('_'); 
        const sectionId = parts[1] as keyof TracerRound['sections'];
        const sectionData = round.sections[sectionId];
        
        if (parts[2] === 'finding') {
          const finding = sectionData.finding || '';
          values.push(`"${finding.replace(/"/g, '""')}"`);
        } else {
          const itemId = parts[2];
          values.push(sectionData.items[itemId] || 'N/A');
        }
      });

      return values.join(',');
    });

    const csvContent = [allHeaders.join(','), ...rows].join('\n');
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const exportFileDefaultName = `nursing-tracer-export-${new Date().toISOString().split('T')[0]}.csv`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const parseCSVLine = (text: string) => {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const processImportData = (rawList: any[]) => {
    const newRounds: TracerRound[] = [];
    
    rawList.forEach((row: any) => {
      const entry: any = { sections: {} };
      const mapping: Record<string, string> = {
        'Source_of_data': 'sourceOfData',
        'Principle_Diagnosis': 'principalDiagnosis',
        'RN_Level': 'rnLevel',
        'Patient_Ag': 'patientAge',
        'Patient_Age': 'patientAge',
        'ประเด็นพัฒนา': 'developmentIssues',
        'สิ่งที่ชมเชย': 'appreciations'
      };

      Object.keys(row).forEach(key => {
        const val = row[key];
        const normalizedKey = mapping[key] || key;
        const sectionNumMatch = key.match(/^(\d+)\./);
        if (sectionNumMatch) {
          const sectionIdx = parseInt(sectionNumMatch[1]) - 1;
          const sectionConfig = SECTIONS_CONFIG[sectionIdx];
          
          if (sectionConfig) {
            const sectionId = sectionConfig.id;
            if (!entry.sections[sectionId]) {
              entry.sections[sectionId] = { items: {}, finding: "" };
            }

            if (key.includes('Finding')) {
              entry.sections[sectionId].finding = val;
            } else {
              const itemIdMatch = key.match(/^(\d+\.\d+)/);
              if (itemIdMatch) {
                const itemId = itemIdMatch[1];
                let statusValue = val as string;
                if (statusValue === 'Partially M') statusValue = ComplianceStatus.PARTIALLY_MET;
                entry.sections[sectionId].items[itemId] = statusValue as ComplianceStatus;
              }
            }
          }
        } else if (key.startsWith('section_')) {
          const parts = key.split('_');
          const sectionId = parts[1];
          const field = parts[2];
          if (!entry.sections[sectionId]) entry.sections[sectionId] = { items: {}, finding: "" };
          if (field === 'finding') entry.sections[sectionId].finding = val;
          else entry.sections[sectionId].items[field] = val as ComplianceStatus;
        } else {
          if (['year', 'patientAge', 'createdAt'].includes(normalizedKey)) {
            entry[normalizedKey] = parseInt(val) || 0;
          } else {
            entry[normalizedKey] = val;
          }
        }
      });

      SECTIONS_CONFIG.forEach(sec => {
        if (!entry.sections[sec.id]) {
          entry.sections[sec.id] = { 
            items: sec.items.reduce((acc, it) => ({ ...acc, [it.id]: ComplianceStatus.MET }), {}),
            finding: "" 
          };
        }
      });

      if (!entry.id) entry.id = crypto.randomUUID();
      if (!entry.createdAt) entry.createdAt = Date.now();
      newRounds.push(entry as TracerRound);
    });

    if (newRounds.length > 0) {
      if (confirm(lang === 'en' ? `Found ${newRounds.length} records. Merge with existing data?` : `พบ ${newRounds.length} รายการ ต้องการรวมเข้ากับข้อมูลเดิมหรือไม่?`)) {
        onUpdateRounds([...newRounds, ...rounds]);
      }
    }
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      processImportData(data);
    };
    reader.readAsBinaryString(file);
    if (excelInputRef.current) excelInputRef.current.value = "";
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
      if (lines.length < 2) return;

      const headers = parseCSVLine(lines[0]);
      const rawList: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row: any = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx];
        });
        rawList.push(row);
      }
      processImportData(rawList);
    };
    reader.readAsText(file);
    if (csvInputRef.current) csvInputRef.current.value = "";
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          if (confirm(lang === 'en' ? `Import ${imported.length} records?` : `นำเข้า ${imported.length} รายการ?`)) {
            onUpdateRounds([...imported, ...rounds]);
          }
        }
      } catch (err) {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearAllData = () => {
    if (confirm(lang === 'en' ? "ARE YOU SURE? This will permanently delete all audit records." : "คุณแน่ใจหรือไม่? การดำเนินการนี้จะลบข้อมูลการตรวจทั้งหมดอย่างถาวร")) {
      onUpdateRounds([]);
      alert(lang === 'en' ? "All data cleared." : "ลบข้อมูลทั้งหมดแล้ว");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{lang === 'en' ? 'Settings & Data Management' : 'การตั้งค่าและจัดการข้อมูล'}</h2>
        <p className="text-slate-500">{lang === 'en' ? 'Manage your clinical audit database.' : 'จัดการฐานข้อมูลการตรวจติดตามทางการพยาบาล'}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Download size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{lang === 'en' ? 'Export Data' : 'ส่งออกข้อมูล'}</h3>
          </div>
          <div className="space-y-3">
            <button onClick={exportToJson} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group">
              <div className="flex items-center gap-3">
                <FileJson className="text-indigo-600" />
                <div className="text-left">
                  <p className="font-bold text-slate-900 text-sm">Full Backup (JSON)</p>
                  <p className="text-xs text-slate-500">Backup all clinical audit details</p>
                </div>
              </div>
              <ChevronRight size={18} />
            </button>
            <button onClick={exportToCSV} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="text-green-600" />
                <div className="text-left">
                  <p className="font-bold text-slate-900 text-sm">Export to CSV</p>
                  <p className="text-xs text-slate-500">Readable table format for Excel</p>
                </div>
              </div>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Upload size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{lang === 'en' ? 'Import Data' : 'นำเข้าข้อมูล'}</h3>
          </div>
          <div className="space-y-3">
            <input type="file" ref={excelInputRef} onChange={handleImportExcel} accept=".xlsx,.xls" className="hidden" />
            <button onClick={() => excelInputRef.current?.click()} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="text-green-500" />
                <div className="text-left">
                  <p className="font-bold text-slate-900 text-sm">Import Excel (.xlsx)</p>
                  <p className="text-xs text-slate-500">Load records from Excel spreadsheet</p>
                </div>
              </div>
              <ChevronRight size={18} />
            </button>

            <input type="file" ref={fileInputRef} onChange={handleImportJson} accept=".json" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group">
              <div className="flex items-center gap-3">
                <FileJson className="text-indigo-400" />
                <div className="text-left">
                  <p className="font-bold text-slate-900 text-sm">Import JSON</p>
                  <p className="text-xs text-slate-500">Restore from JSON backup</p>
                </div>
              </div>
              <ChevronRight size={18} />
            </button>

            <input type="file" ref={csvInputRef} onChange={handleImportCSV} accept=".csv" className="hidden" />
            <button onClick={() => csvInputRef.current?.click()} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="text-green-400" />
                <div className="text-left">
                  <p className="font-bold text-slate-900 text-sm">Import CSV</p>
                  <p className="text-xs text-slate-500">Load records from CSV table</p>
                </div>
              </div>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{lang === 'en' ? 'Danger Zone' : 'เขตอันตราย'}</h3>
          </div>
          <button onClick={clearAllData} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all">
            {lang === 'en' ? 'Reset Database' : 'รีเซ็ตฐานข้อมูล'}
          </button>
        </div>
      </div>
    </div>
  );
};

const HistoryView = ({ rounds, lang, onDelete }: { rounds: TracerRound[], lang: 'en' | 'th', onDelete: (id: string) => void }) => {
  const [selectedRoundSummary, setSelectedRoundSummary] = useState<{id: string, text: string} | null>(null);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGenerateSummary = async (round: TracerRound) => {
    if (summarizingId) return;
    setSummarizingId(round.id);
    try {
      const summary = await analyzeSingleRound(round);
      setSelectedRoundSummary({ id: round.id, text: summary });
    } catch (err) {
      alert("Failed to generate summary.");
    } finally {
      setSummarizingId(null);
    }
  };

  const handleDelete = (round: TracerRound) => {
    const msg = lang === 'en' 
      ? `Are you sure you want to delete the audit for ${round.department} on ${round.date}?`
      : `คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลการตรวจของ ${round.department} เมื่อวันที่ ${round.date}?`;
    
    if (window.confirm(msg)) {
      onDelete(round.id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {selectedRoundSummary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-xl">Audit Executive Summary</h3>
              <button onClick={() => setSelectedRoundSummary(null)} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-8 overflow-y-auto max-h-[60vh] bg-slate-50/50">
              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">{selectedRoundSummary.text}</div>
            </div>
            <div className="p-6 bg-white border-t flex justify-end">
              <button onClick={() => setSelectedRoundSummary(null)} className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold">Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">{lang === 'en' ? 'Audit History' : 'ประวัติการตรวจ'}</h3>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">{rounds.length} Audits</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">{UI_LABELS[lang].date}</th>
                <th className="px-6 py-4">{UI_LABELS[lang].department}</th>
                <th className="px-6 py-4">{lang === 'en' ? 'Diagnosis' : 'วินิจฉัย'}</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rounds.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">No records found.</td></tr>
              ) : (
                rounds.map(round => (
                  <tr key={round.id} className="hover:bg-indigo-50/20 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{round.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{round.department}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[200px]">{round.principalDiagnosis}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button onClick={() => handleGenerateSummary(round)} className="hidden sm:inline-block text-[10px] font-bold px-3 py-1.5 rounded-xl border bg-indigo-50 text-indigo-600">AI SUMMARY</button>
                        <Link to={`/edit/${round.id}`} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title={lang === 'en' ? 'Edit Audit' : 'แก้ไขข้อมูล'}><Edit2 size={18} /></Link>
                        <button onClick={() => handleDelete(round)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title={lang === 'en' ? 'Delete Record' : 'ลบข้อมูล'}><Trash2 size={18} /></button>
                        <Link to={`/history/${round.id}`} className="p-2 text-slate-400 hover:text-indigo-600"><ChevronRight size={20} /></Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const [rounds, setRounds] = useState<TracerRound[]>([]);
  const [lang, setLang] = useState<'en' | 'th'>('en');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const globalExcelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('nursing_tracer_rounds');
    if (saved) setRounds(JSON.parse(saved));
    const savedLang = localStorage.getItem('nursing_tracer_lang');
    if (savedLang === 'th' || savedLang === 'en') setLang(savedLang);
  }, []);

  const handleUpdateRoundsList = (newRounds: TracerRound[]) => {
    setRounds(newRounds);
    localStorage.setItem('nursing_tracer_rounds', JSON.stringify(newRounds));
  };

  const handleAddRound = (newRound: TracerRound) => {
    const updated = [newRound, ...rounds];
    handleUpdateRoundsList(updated);
    navigate('/history');
  };

  const handleUpdateExistingRound = (updatedRound: TracerRound) => {
    const updatedRounds = rounds.map(r => r.id === updatedRound.id ? updatedRound : r);
    handleUpdateRoundsList(updatedRounds);
  };

  const handleDeleteRound = (id: string) => {
    const updatedRounds = rounds.filter(r => r.id !== id);
    handleUpdateRoundsList(updatedRounds);
  };

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'th' : 'en';
    setLang(newLang);
    localStorage.setItem('nursing_tracer_lang', newLang);
  };

  const handleGlobalExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data: any[] = XLSX.utils.sheet_to_json(ws);
      
      const newRounds: TracerRound[] = [];
      data.forEach((row: any) => {
        const entry: any = { sections: {} };
        const fieldMapping: Record<string, string> = {
          'Source_of_data': 'sourceOfData',
          'Principle_Diagnosis': 'principalDiagnosis',
          'RN_Level': 'rnLevel',
          'Patient_Ag': 'patientAge',
          'Patient_Age': 'patientAge',
          'ประเด็นพัฒนา': 'developmentIssues',
          'สิ่งที่ชมเชย': 'appreciations',
          'Source_of_Data': 'sourceOfData',
          'rn_level': 'rnLevel'
        };

        Object.keys(row).forEach(key => {
          const val = row[key];
          const mappedKey = fieldMapping[key] || key;
          const sectionNumMatch = key.match(/^(\d+)\./);
          if (sectionNumMatch) {
            const sectionIdx = parseInt(sectionNumMatch[1]) - 1;
            const sectionConfig = SECTIONS_CONFIG[sectionIdx];
            if (sectionConfig) {
              const sectionId = sectionConfig.id;
              if (!entry.sections[sectionId]) entry.sections[sectionId] = { items: {}, finding: "" };

              if (key.includes('Finding')) {
                entry.sections[sectionId].finding = val;
              } else {
                const itemIdMatch = key.match(/^(\d+\.\d+)/);
                if (itemIdMatch) {
                  const itemId = itemIdMatch[1];
                  let status = val as string;
                  if (status === 'Partially M') status = ComplianceStatus.PARTIALLY_MET;
                  entry.sections[sectionId].items[itemId] = status as ComplianceStatus;
                }
              }
            }
          } else if (key.startsWith('section_')) {
            const parts = key.split('_');
            const sectionId = parts[1];
            const field = parts[2];
            if (!entry.sections[sectionId]) entry.sections[sectionId] = { items: {}, finding: "" };
            if (field === 'finding') entry.sections[sectionId].finding = val;
            else entry.sections[sectionId].items[field] = val as ComplianceStatus;
          } else {
            if (['year', 'patientAge', 'createdAt'].includes(mappedKey)) entry[mappedKey] = parseInt(val) || 0;
            else entry[mappedKey] = val;
          }
        });

        SECTIONS_CONFIG.forEach(sec => {
          if (!entry.sections[sec.id]) {
            entry.sections[sec.id] = { 
              items: sec.items.reduce((acc, it) => ({ ...acc, [it.id]: ComplianceStatus.MET }), {}),
              finding: "" 
            };
          }
        });

        if (!entry.id) entry.id = crypto.randomUUID();
        if (!entry.createdAt) entry.createdAt = Date.now();
        newRounds.push(entry as TracerRound);
      });

      if (newRounds.length > 0) {
        if (confirm(lang === 'en' ? `Import ${newRounds.length} records from Excel?` : `นำเข้าข้อมูล ${newRounds.length} รายการจาก Excel?`)) {
          handleUpdateRoundsList([...newRounds, ...rounds]);
          navigate('/');
        }
      }
    };
    reader.readAsBinaryString(file);
    if (globalExcelInputRef.current) globalExcelInputRef.current.value = "";
  };

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transition-transform lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center gap-3 px-2 mb-10 mt-2">
            <div className="bg-indigo-600 p-2 rounded-xl"><ClipboardList className="text-white w-6 h-6" /></div>
            <h1 className="text-white text-xl font-bold">NursingTracer</h1>
          </div>
          <nav className="flex-1 space-y-2">
            <SidebarLink to="/" icon={LayoutDashboard} label={lang === 'en' ? 'Dashboard' : 'แดชบอร์ด'} active={location.pathname === '/'} />
            <SidebarLink to="/new" icon={Plus} label={lang === 'en' ? 'New Audit' : 'เริ่มตรวจใหม่'} active={location.pathname === '/new'} />
            <SidebarLink to="/tracking" icon={LineChartIcon} label={lang === 'en' ? 'Dept. Tracking' : 'ติดตามรายแผนก'} active={location.pathname === '/tracking'} />
            <SidebarLink to="/history" icon={History} label={lang === 'en' ? 'History' : 'ประวัติ'} active={location.pathname.startsWith('/history')} />
            <SidebarLink to="/assistant" icon={MessageSquare} label={lang === 'en' ? 'AI Assistant' : 'ผู้ช่วย AI'} active={location.pathname === '/assistant'} />
          </nav>
          <div className="mt-auto pt-6 border-t border-slate-800">
            <SidebarLink to="/settings" icon={SettingsIcon} label={lang === 'en' ? 'Settings' : 'ตั้งค่า'} active={location.pathname === '/settings'} />
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600"><Menu size={22} /></button>
            <div className="hidden md:flex items-center gap-2">
              <input type="file" ref={globalExcelInputRef} onChange={handleGlobalExcelImport} accept=".xlsx,.xls" className="hidden" />
              <button 
                onClick={() => globalExcelInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-bold transition-all border border-green-200"
              >
                <FileUp size={16} />
                {lang === 'en' ? 'Import Excel' : 'นำเข้า Excel'}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold text-slate-700 transition-all border border-slate-200"
            >
              <Languages size={18} className="text-indigo-600" />
              {lang === 'en' ? 'English' : 'ภาษาไทย'}
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold">NA</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard rounds={rounds} lang={lang} />} />
            <Route path="/new" element={<TracerForm onSubmit={handleAddRound} lang={lang} />} />
            <Route path="/tracking" element={<DepartmentTracking rounds={rounds} lang={lang} />} />
            <Route path="/history" element={<HistoryView rounds={rounds} lang={lang} onDelete={handleDeleteRound} />} />
            <Route path="/history/:id" element={<ReportView rounds={rounds} lang={lang} />} />
            <Route path="/edit/:id" element={<EditAuditView rounds={rounds} onUpdate={handleUpdateExistingRound} lang={lang} />} />
            <Route path="/assistant" element={<Assistant rounds={rounds} lang={lang} />} />
            <Route path="/settings" element={<SettingsView rounds={rounds} onUpdateRounds={handleUpdateRoundsList} lang={lang} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
