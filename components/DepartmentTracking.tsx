import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Legend, LabelList
} from 'recharts';
import { TracerRound, ComplianceStatus, SectionData } from '../types';
import { DEPARTMENTS, MONTHS, SECTIONS_CONFIG } from '../constants';
import { 
  Building2, 
  Calendar, 
  Activity, 
  ChevronRight, 
  History, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Layout,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DepartmentTrackingProps {
  rounds: TracerRound[];
  lang: 'en' | 'th';
}

const SECTION_COLORS = [
  { bg: 'bg-blue-100', bodyBg: 'bg-blue-50/50', border: 'border-blue-200', text: 'text-blue-900', iconBg: 'bg-white', iconColor: 'text-blue-600', itemBorder: 'border-blue-100' },
  { bg: 'bg-emerald-100', bodyBg: 'bg-emerald-50/50', border: 'border-emerald-200', text: 'text-emerald-900', iconBg: 'bg-white', iconColor: 'text-emerald-600', itemBorder: 'border-emerald-100' },
  { bg: 'bg-amber-100', bodyBg: 'bg-amber-50/50', border: 'border-amber-200', text: 'text-amber-900', iconBg: 'bg-white', iconColor: 'text-amber-600', itemBorder: 'border-amber-100' },
  { bg: 'bg-rose-100', bodyBg: 'bg-rose-50/50', border: 'border-rose-200', text: 'text-rose-900', iconBg: 'bg-white', iconColor: 'text-rose-600', itemBorder: 'border-rose-100' },
  { bg: 'bg-violet-100', bodyBg: 'bg-violet-50/50', border: 'border-violet-200', text: 'text-violet-900', iconBg: 'bg-white', iconColor: 'text-violet-600', itemBorder: 'border-violet-100' },
  { bg: 'bg-cyan-100', bodyBg: 'bg-cyan-50/50', border: 'border-cyan-200', text: 'text-cyan-900', iconBg: 'bg-white', iconColor: 'text-cyan-600', itemBorder: 'border-cyan-100' },
  { bg: 'bg-slate-100', bodyBg: 'bg-slate-50/50', border: 'border-slate-200', text: 'text-slate-900', iconBg: 'bg-white', iconColor: 'text-slate-600', itemBorder: 'border-slate-100' },
];

const DepartmentTracking: React.FC<DepartmentTrackingProps> = ({ rounds, lang }) => {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  // Group and sort rounds for the selected department
  const deptRounds = useMemo(() => {
    let filtered = rounds;
    if (selectedDept !== 'ALL') {
      filtered = rounds.filter(r => r.department === selectedDept);
    }
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB; // Ascending for chart
    });
  }, [rounds, selectedDept]);

  const findingsData = useMemo(() => {
    // Get rounds sorted by date descending for findings
    const sortedRounds = [...deptRounds].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return SECTIONS_CONFIG.map(section => {
      const findings = sortedRounds
        .filter(r => r.sections[section.id as keyof TracerRound['sections']]?.finding)
        .map(r => ({
          id: r.id,
          dept: r.department,
          date: r.date,
          text: r.sections[section.id as keyof TracerRound['sections']].finding,
          depType: r.depType
        }));
      return {
        sectionId: section.id,
        title_en: section.title_en,
        title_th: section.title_th,
        icon: section.icon,
        findings
      };
    });
  }, [deptRounds]);

  const trackingData = useMemo(() => {
    return deptRounds.map((round, index) => {
      let totalItems = 0;
      let metItems = 0;
      let partialItems = 0;

      // Fix: Cast the results of Object.values to SectionData[] to resolve the 'Property items does not exist on type unknown' error.
      (Object.values(round.sections) as SectionData[]).forEach(section => {
        Object.values(section.items).forEach(status => {
          if (status !== ComplianceStatus.NA) {
            totalItems++;
            if (status === ComplianceStatus.MET) metItems++;
            else if (status === ComplianceStatus.PARTIALLY_MET) partialItems++;
          }
        });
      });

      const scoreSum = metItems + (partialItems * 0.5);
      const compliance = totalItems > 0 ? Math.round((scoreSum / totalItems) * 100) : 0;

      return {
        label: `${round.date.split('-')[2]}/${round.month.substring(0,3)}`,
        fullDate: `${round.date} (${round.month})`,
        compliance,
        index: index + 1,
        id: round.id,
        year: round.year
      };
    });
  }, [deptRounds]);

  const trend = useMemo(() => {
    if (trackingData.length < 2) return null;
    const last = trackingData[trackingData.length - 1].compliance;
    const prev = trackingData[trackingData.length - 2].compliance;
    return last - prev;
  }, [trackingData]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{lang === 'en' ? 'Department Progress Tracking' : 'ติดตามความก้าวหน้ารายแผนก'}</h2>
              <p className="text-sm text-slate-500">{lang === 'en' ? 'View timeline and compliance trends per department' : 'ดูไทม์ไลน์และแนวโน้มความสอดคล้องตามแผนก'}</p>
            </div>
          </div>
          <div className="w-full md:w-64">
            <select 
              value={selectedDept} 
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-sm border-slate-200 rounded-xl bg-slate-50 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none border font-semibold"
            >
              <option value="ALL">{lang === 'en' ? 'All Departments' : 'ทุกแผนก (ภาพรวม)'}</option>
              {DEPARTMENTS.map(d => (
                <option key={d.name} value={d.name}>{lang === 'en' ? d.name : d.name_th}</option>
              ))}
            </select>
          </div>
        </div>

        {deptRounds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 rounded-2xl">
            <History className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">
              {lang === 'en' 
                ? `No tracer rounds found for ${selectedDept === 'ALL' ? 'any department' : selectedDept}` 
                : `ยังไม่มีข้อมูลการตรวจสำหรับ ${selectedDept === 'ALL' ? 'ทุกแผนก' : selectedDept}`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trend Summary */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{lang === 'en' ? 'Total Traces' : 'จำนวนครั้งที่ตรวจ'}</span>
                  <Clock size={16} className="text-indigo-400" />
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-bold">{deptRounds.length}</span>
                  <span className="text-sm text-slate-400 mb-1">{lang === 'en' ? 'Times' : 'ครั้ง'}</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'en' ? 'Current Compliance' : 'ความสอดคล้องล่าสุด'}</span>
                  <Activity size={16} className="text-indigo-600" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold text-slate-900">
                    {trackingData[trackingData.length - 1].compliance}%
                  </span>
                  {trend !== null && (
                    <div className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-lg ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {Math.abs(trend)}%
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                <h4 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                  <Layout size={16} /> {lang === 'en' ? 'Time Sequence' : 'ลำดับเวลาการตรวจ'}
                </h4>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {trackingData.slice().reverse().map((data, i) => (
                    <Link to={`/history/${data.id}`} key={data.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-300 transition-all group">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        #{trackingData.length - i}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{data.fullDate}</p>
                        <p className="text-[10px] text-slate-500">{lang === 'en' ? 'Audit Result:' : 'ผลการตรวจ:'} {data.compliance}%</p>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-600" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Trend Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-900">{lang === 'en' ? 'Compliance Trend Over Time' : 'แนวโน้มความสอดคล้องตามลำดับเวลา'}</h3>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div> {lang === 'en' ? 'Compliance' : 'ความสอดคล้อง'}</div>
                </div>
              </div>
              <div className="flex-1 min-h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trackingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="label" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} 
                      dy={10}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fill: '#94a3b8'}}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="compliance" 
                      stroke="#4f46e5" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorComp)" 
                      animationDuration={1500}
                    >
                      <LabelList 
                        dataKey="compliance" 
                        position="top" 
                        formatter={(val: any) => `${val}%`}
                        style={{ fontSize: '10px', fontWeight: 'bold', fill: '#4f46e5' }}
                      />
                    </Area>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{lang === 'en' ? 'Insight' : 'ข้อสังเกต'}</p>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  {trend !== null ? (
                    trend >= 0 
                      ? (lang === 'en' ? `Improvement of ${trend}% observed compared to previous session. Keep maintaining these standards.` : `พบการพัฒนาดีขึ้น ${trend}% เมื่อเทียบกับครั้งก่อนหน้า ควรเน้นย้ำและรักษามาตรฐานนี้ไว้`)
                      : (lang === 'en' ? `Decline of ${Math.abs(trend)}% noted. Consider reviewing the specific development issues from the latest round.` : `พบระดับความสอดคล้องลดลง ${Math.abs(trend)}% ควรตรวจสอบสาเหตุจากประเด็นพัฒนาในการตรวจล่าสุด`)
                  ) : (lang === 'en' ? 'Continue tracer rounds to see trend analysis.' : 'ดำเนินการตรวจติดตามอย่างต่อเนื่องเพื่อดูการวิเคราะห์แนวโน้ม')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Findings Summary Section */}
      {deptRounds.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{lang === 'en' ? 'Qualitative Findings Overview' : 'สรุปข้อมูลเชิงคุณภาพ (Findings)'}</h2>
              <p className="text-sm text-slate-500">{lang === 'en' ? 'Consolidated comments and findings by topic' : 'รวบรวมข้อคิดเห็นและสิ่งที่ตรวจพบแยกตามหัวข้อ'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {findingsData.map((section, index) => {
              const color = SECTION_COLORS[index % SECTION_COLORS.length];
              return (
                <div key={section.sectionId} className={`flex flex-col bg-white rounded-xl border ${color.border} shadow-sm overflow-hidden h-full hover:shadow-md transition-shadow`}>
                  <div className={`p-4 ${color.bg} border-b ${color.border} flex items-center gap-3`}>
                    <div className={`${color.iconColor} p-2 ${color.iconBg} rounded-lg shadow-sm`}>{section.icon}</div>
                    <h3 className={`font-bold ${color.text} text-sm leading-tight`}>
                      {lang === 'en' ? section.title_en : section.title_th}
                    </h3>
                  </div>
                  <div className={`p-4 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar space-y-3 ${color.bodyBg}`}>
                    {section.findings.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs italic">
                        {lang === 'en' ? 'No findings recorded.' : 'ไม่มีบันทึกสิ่งที่ตรวจพบ'}
                      </div>
                    ) : (
                      section.findings.map((finding, idx) => (
                        <div key={`${finding.id}-${idx}`} className={`bg-white p-3 rounded-xl border ${color.itemBorder} shadow-sm text-sm relative group hover:border-indigo-200 transition-colors`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              finding.depType === 'Critical' ? 'bg-red-50 text-red-600' :
                              finding.depType === 'OPD' ? 'bg-green-50 text-green-600' :
                              'bg-blue-50 text-blue-600'
                            }`}>
                              {finding.dept}
                            </span>
                            <span className="text-[10px] text-slate-400">{finding.date}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed text-xs">{finding.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentTracking;