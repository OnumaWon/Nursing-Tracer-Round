
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell,
  Brush, Legend, LabelList, AreaChart, Area, LineChart, Line
} from 'recharts';
import { TracerRound, ComplianceStatus } from '../types';
import { SECTIONS_CONFIG, MONTHS } from '../constants';
import { AlertCircle, CheckCircle, TrendingUp, Filter, X, Search, Info } from 'lucide-react';

interface DashboardProps {
  rounds: TracerRound[];
  lang: 'en' | 'th';
}

const CustomTooltip = ({ active, payload, label, lang }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    // Handle Trend Data (Mockup)
    if (data.avg !== undefined && data.met === undefined) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-200">
          <p className="font-bold text-slate-900 mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">{lang === 'en' ? 'Average:' : 'ค่าเฉลี่ย:'}</span>
            <span className="text-lg font-bold text-indigo-600">{data.avg}%</span>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-4 rounded-xl shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        <p className="font-bold text-slate-900 mb-2 border-b pb-1">{label}</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-8">
            <span className="text-xs font-semibold text-slate-500 uppercase">{lang === 'en' ? 'Compliance Score' : 'คะแนนความสอดคล้อง'}</span>
            <span className="text-sm font-bold text-indigo-600">{data.compliance}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full" style={{ width: `${data.compliance}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t">
            <div className="text-center">
              <p className="text-[10px] font-bold text-green-500 uppercase">{lang === 'en' ? 'Met' : 'ทำได้'}</p>
              <p className="text-sm font-bold text-slate-700">{data.met}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-amber-500 uppercase">{lang === 'en' ? 'Partial' : 'บางส่วน'}</p>
              <p className="text-sm font-bold text-slate-700">{data.partial}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-red-500 uppercase">{lang === 'en' ? 'Not Met' : 'ไม่ได้'}</p>
              <p className="text-sm font-bold text-slate-700">{data.notMet}</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 italic text-center">
            {lang === 'en' ? `Based on ${data.total} items checked` : `อ้างอิงจากการตรวจสอบ ${data.total} รายการ`}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ rounds, lang }) => {
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterDept, setFilterDept] = useState<string>('all');

  const filterOptions = useMemo(() => {
    const years = Array.from(new Set(rounds.map(r => r.year.toString()))).sort((a: string, b: string) => b.localeCompare(a));
    const depts = Array.from(new Set(rounds.map(r => r.department))).sort();
    return { years, depts };
  }, [rounds]);

  const filteredRounds = useMemo(() => {
    return rounds.filter(round => {
      const yearMatch = filterYear === 'all' || round.year.toString() === filterYear;
      const monthMatch = filterMonth === 'all' || round.month === filterMonth;
      const deptMatch = filterDept === 'all' || round.department === filterDept;
      return yearMatch && monthMatch && deptMatch;
    });
  }, [rounds, filterYear, filterMonth, filterDept]);

  const stats = useMemo(() => {
    if (filteredRounds.length === 0) return null;

    const sectionCompliance = SECTIONS_CONFIG.map(section => {
      let totalItems = 0;
      let metItems = 0;
      let partialItems = 0;
      let notMetItems = 0;

      const itemBreakdown: Record<string, { id: string, met: number, partial: number, notMet: number, total: number, label_en: string, label_th: string }> = {};
      section.items.forEach(item => {
        itemBreakdown[item.id] = { id: item.id, met: 0, partial: 0, notMet: 0, total: 0, label_en: item.label_en, label_th: item.label_th };
      });

      filteredRounds.forEach(round => {
        const sData = round.sections[section.id as keyof TracerRound['sections']];
        if (sData && sData.items) {
          Object.entries(sData.items).forEach(([itemId, status]) => {
            if (status !== ComplianceStatus.NA) {
              totalItems++;
              if (status === ComplianceStatus.MET) metItems++;
              else if (status === ComplianceStatus.PARTIALLY_MET) partialItems++;
              else if (status === ComplianceStatus.NOT_MET) notMetItems++;

              if (itemBreakdown[itemId]) {
                itemBreakdown[itemId].total++;
                if (status === ComplianceStatus.MET) itemBreakdown[itemId].met++;
                else if (status === ComplianceStatus.PARTIALLY_MET) itemBreakdown[itemId].partial++;
                else if (status === ComplianceStatus.NOT_MET) itemBreakdown[itemId].notMet++;
              }
            }
          });
        }
      });

      const scoreSum = metItems + (partialItems * 0.5);

      return {
        id: section.id,
        name: lang === 'en' ? section.title_en.split('. ')[1] : section.title_th.split('. ')[1],
        fullTitle: lang === 'en' ? section.title_en : section.title_th,
        compliance: totalItems > 0 ? Math.round((scoreSum / totalItems) * 100) : 0,
        met: metItems,
        partial: partialItems,
        notMet: notMetItems,
        total: totalItems,
        items: Object.values(itemBreakdown)
      };
    });

    const overallCompliance = Math.round(
      sectionCompliance.reduce((acc, curr) => acc + curr.compliance, 0) / sectionCompliance.length
    );

    return { sectionCompliance, overallCompliance };
  }, [filteredRounds, lang]);

  const resetFilters = () => {
    setFilterYear('all');
    setFilterMonth('all');
    setFilterDept('all');
  };

  const [showActionModal, setShowActionModal] = useState(false);
  const actionNeededSections = stats ? stats.sectionCompliance.filter(s => s.compliance < 80) : [];

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  const TH_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  const monthlyTrendData = useMemo(() => {
    const calculateRoundCompliance = (round: TracerRound) => {
      let totalItems = 0;
      let scoreSum = 0;
      
      Object.values(round.sections).forEach(section => {
        if (section.items) {
          Object.values(section.items).forEach(status => {
            if (status !== ComplianceStatus.NA) {
              totalItems++;
              if (status === ComplianceStatus.MET) scoreSum += 1;
              else if (status === ComplianceStatus.PARTIALLY_MET) scoreSum += 0.5;
            }
          });
        }
      });
      
      return totalItems > 0 ? (scoreSum / totalItems) * 100 : 0;
    };

    const grouped: Record<string, { sum: number; count: number; year: number; monthIndex: number }> = {};

    rounds.forEach(round => {
      // Filter for 2026 onwards
      if (round.year < 2026) return;

      const monthIndex = MONTHS.en.indexOf(round.month);
      if (monthIndex === -1) return;

      const key = `${round.year}-${monthIndex}`;
      
      if (!grouped[key]) {
        grouped[key] = { sum: 0, count: 0, year: round.year, monthIndex };
      }
      
      grouped[key].sum += calculateRoundCompliance(round);
      grouped[key].count += 1;
    });

    const data = Object.values(grouped).map(item => {
      const avg = Math.round(item.sum / item.count);
      const monthNameEn = MONTHS.en[item.monthIndex];
      
      const label = lang === 'en' 
        ? `${monthNameEn.substring(0, 3)} ${item.year}` 
        : `${TH_MONTHS_SHORT[item.monthIndex]} ${item.year + 543}`;

      return {
        month: label,
        avg,
        year: item.year,
        monthIndex: item.monthIndex
      };
    });

    return data.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthIndex - b.monthIndex;
    });
  }, [rounds, lang]);

  const sectionTrendData = useMemo(() => {
    const trendRounds = rounds.filter(r => {
      const deptMatch = filterDept === 'all' || r.department === filterDept;
      
      let timeMatch = true;
      if (filterYear === 'all') {
         timeMatch = r.year >= 2026;
      } else {
         timeMatch = r.year.toString() === filterYear;
      }
      
      return deptMatch && timeMatch;
    });

    const grouped: Record<string, { 
      year: number; 
      monthIndex: number; 
      counts: Record<string, number>;
      sums: Record<string, number>;
    }> = {};

    trendRounds.forEach(round => {
       const monthIndex = MONTHS.en.indexOf(round.month);
       if (monthIndex === -1) return;
       const key = `${round.year}-${monthIndex}`;
       
       if (!grouped[key]) {
         grouped[key] = { year: round.year, monthIndex, counts: {}, sums: {} };
         SECTIONS_CONFIG.forEach(s => {
           grouped[key].counts[s.id] = 0;
           grouped[key].sums[s.id] = 0;
         });
       }

       Object.entries(round.sections).forEach(([sectionId, sectionData]) => {
          let total = 0;
          let score = 0;
          if (sectionData.items) {
             Object.values(sectionData.items).forEach(status => {
                if (status !== ComplianceStatus.NA) {
                   total++;
                   if (status === ComplianceStatus.MET) score += 1;
                   else if (status === ComplianceStatus.PARTIALLY_MET) score += 0.5;
                }
             });
          }
          if (total > 0) {
             const pct = (score / total) * 100;
             grouped[key].sums[sectionId] += pct;
             grouped[key].counts[sectionId]++;
          }
       });
    });

    const data = Object.values(grouped).map(item => {
       const row: any = {
         month: lang === 'en' 
            ? `${MONTHS.en[item.monthIndex].substring(0, 3)} ${item.year}`
            : `${TH_MONTHS_SHORT[item.monthIndex]} ${item.year + 543}`,
         year: item.year,
         monthIndex: item.monthIndex
       };
       
       SECTIONS_CONFIG.forEach(s => {
          const count = item.counts[s.id];
          const sum = item.sums[s.id];
          row[s.id] = count > 0 ? Math.round(sum / count) : 0;
       });
       
       return row;
    });

    return data.sort((a, b) => {
       if (a.year !== b.year) return a.year - b.year;
       return a.monthIndex - b.monthIndex;
    });
  }, [rounds, filterDept, filterYear, lang]);

  return (
    <div className="space-y-6">
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 bg-red-50 border-b border-red-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full text-red-600">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{lang === 'en' ? 'Action Needed Details' : 'รายละเอียดสิ่งที่ต้องดำเนินการ'}</h3>
                  <p className="text-xs text-slate-500">{lang === 'en' ? 'Sections with compliance < 80%' : 'หมวดที่มีคะแนนความสอดคล้องต่ำกว่า 80%'}</p>
                </div>
              </div>
              <button onClick={() => setShowActionModal(false)} className="p-2 hover:bg-red-100 rounded-full text-slate-400 hover:text-red-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {actionNeededSections.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                  <p className="font-bold">{lang === 'en' ? 'No critical issues found!' : 'ไม่พบประเด็นวิกฤต!'}</p>
                  <p className="text-sm">{lang === 'en' ? 'All sections are performing above 80% compliance.' : 'ทุกหมวดมีคะแนนความสอดคล้องสูงกว่า 80%'}</p>
                </div>
              ) : (
                actionNeededSections.map(section => (
                  <div key={section.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                      <h4 className="font-bold text-slate-800">{section.fullTitle}</h4>
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                        {section.compliance}% {lang === 'en' ? 'Compliance' : 'คะแนน'}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-3">{lang === 'en' ? 'Top Issues (Not Met / Partial)' : 'ประเด็นปัญหา (ไม่ได้ / ได้บางส่วน)'}</p>
                      <div className="space-y-3">
                        {section.items
                          .filter(item => item.notMet > 0 || item.partial > 0)
                          .sort((a, b) => (b.notMet + b.partial) - (a.notMet + a.partial))
                          .map(item => (
                            <div key={item.id} className="flex items-start gap-3 text-sm pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                              <span className="font-mono text-xs text-slate-400 mt-0.5">{item.id}</span>
                              <div className="flex-1">
                                <p className="text-slate-700 font-medium">{lang === 'en' ? item.label_en : item.label_th}</p>
                                <div className="flex gap-4 mt-1.5">
                                  {item.notMet > 0 && (
                                    <span className="text-xs text-red-600 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                      {item.notMet} {lang === 'en' ? 'Not Met' : 'ไม่ได้'}
                                    </span>
                                  )}
                                  {item.partial > 0 && (
                                    <span className="text-xs text-amber-600 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                      {item.partial} {lang === 'en' ? 'Partial' : 'บางส่วน'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        {section.items.filter(item => item.notMet > 0 || item.partial > 0).length === 0 && (
                          <p className="text-sm text-slate-400 italic">{lang === 'en' ? 'No specific items failed, but overall score is low.' : 'ไม่พบรายข้อที่ตกเกณฑ์ แต่คะแนนรวมต่ำ'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button onClick={() => setShowActionModal(false)} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors">
                {lang === 'en' ? 'Close' : 'ปิด'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
          <Filter size={18} />
          <span>{lang === 'en' ? 'Filters' : 'ตัวกรอง'}</span>
        </div>
        
        <div className="flex flex-wrap gap-3 flex-1">
          <select 
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)}
            className="text-sm border-slate-200 rounded-lg bg-slate-50 p-2 focus:ring-2 focus:ring-indigo-500 outline-none border"
          >
            <option value="all">{lang === 'en' ? 'All Years' : 'ทุกปี'}</option>
            {filterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <select 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)}
            className="text-sm border-slate-200 rounded-lg bg-slate-50 p-2 focus:ring-2 focus:ring-indigo-500 outline-none border"
          >
            <option value="all">{lang === 'en' ? 'All Months' : 'ทุกเดือน'}</option>
            {MONTHS.en.map((m, idx) => (
              <option key={m} value={m}>{MONTHS[lang][idx]}</option>
            ))}
          </select>

          <select 
            value={filterDept} 
            onChange={(e) => setFilterDept(e.target.value)}
            className="text-sm border-slate-200 rounded-lg bg-slate-50 p-2 focus:ring-2 focus:ring-indigo-500 outline-none border max-w-[200px]"
          >
            <option value="all">{lang === 'en' ? 'All Departments' : 'ทุกแผนก'}</option>
            {filterOptions.depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {(filterYear !== 'all' || filterMonth !== 'all' || filterDept !== 'all') && (
            <button 
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              <X size={14} />
              {lang === 'en' ? 'Reset' : 'ล้างตัวกรอง'}
            </button>
          )}
        </div>
        
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
          {filteredRounds.length} {lang === 'en' ? 'Records Found' : 'รายการที่พบ'}
        </div>
      </div>

      {!stats ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <Search className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">
            {rounds.length === 0 
              ? (lang === 'en' ? 'No audit records found. Start a new audit to see analytics.' : 'ไม่พบข้อมูลการตรวจ เริ่มต้นการตรวจใหม่เพื่อดูผลวิเคราะห์')
              : (lang === 'en' ? 'No records match the selected filters.' : 'ไม่พบข้อมูลที่ตรงกับตัวกรองที่เลือก')}
          </p>
          {(filterYear !== 'all' || filterMonth !== 'all' || filterDept !== 'all') && (
            <button onClick={resetFilters} className="mt-4 text-indigo-600 font-bold hover:underline">
              {lang === 'en' ? 'Clear all filters' : 'ล้างตัวกรองทั้งหมด'}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">{lang === 'en' ? 'Total Rounds' : 'จำนวนรอบตรวจ'}</p>
                <p className="text-3xl font-bold text-slate-900">{filteredRounds.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-indigo-500" />
            </div>
            <div className="bg-white p-6 rounded-xl border flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">{lang === 'en' ? 'Avg Compliance' : 'ความสอดคล้องเฉลี่ย'}</p>
                <p className="text-3xl font-bold text-slate-900">{stats.overallCompliance}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <div 
              onClick={() => setShowActionModal(true)}
              className="bg-white p-6 rounded-xl border flex items-center justify-between shadow-sm hover:shadow-md transition-all cursor-pointer group ring-2 ring-transparent hover:ring-red-100"
            >
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tight group-hover:text-red-600 transition-colors">{lang === 'en' ? 'Action Needed' : 'รายการที่ต้องจัดการ'}</p>
                <p className="text-3xl font-bold text-slate-900">{stats.sectionCompliance.filter(s => s.compliance < 80).length}</p>
              </div>
              <div className="p-2 bg-red-50 rounded-full group-hover:bg-red-100 transition-colors">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">{lang === 'en' ? 'Compliance per Topic (%)' : 'ความสอดคล้องตามหัวข้อ (%)'}</h3>
                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 group relative">
                  <Info size={16} />
                  <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg z-10">
                    {lang === 'en' ? 'Use the slider below the chart to zoom or pan if there are many entries.' : 'ใช้สไลเดอร์ใต้กราฟเพื่อย่อขยายหรือเลื่อนดูหากมีข้อมูลจำนวนมาก'}
                  </div>
                </div>
              </div>
              <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.sectionCompliance} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <YAxis dataKey="name" type="category" width={140} tick={{fontSize: 12, fontWeight: 600, fill: '#334155'}} />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      content={<CustomTooltip lang={lang} />}
                    />
                    <Bar dataKey="compliance" radius={[0, 4, 4, 0]} barSize={24}>
                      {stats.sectionCompliance.map((e, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />
                      ))}
                      <LabelList dataKey="compliance" position="right" formatter={(val: number) => `${val}%`} style={{ fontSize: '12px', fontWeight: 'bold', fill: '#4f46e5' }} />
                    </Bar>
                    <Brush dataKey="name" height={30} stroke="#4f46e5" y={410} startIndex={0} endIndex={6} fill="#f8fafc" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h3 className="text-lg font-bold mb-6 text-slate-800">{lang === 'en' ? 'Performance Radar' : 'มิติด้านประสิทธิภาพ'}</h3>
              <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={stats.sectionCompliance} outerRadius="80%">
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="name" tick={{fontSize: 11, fill: '#334155', fontWeight: 600}} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{fontSize: 10, fill: '#64748b'}} />
                    <Radar 
                      name="Score" 
                      dataKey="compliance" 
                      stroke="#4f46e5" 
                      strokeWidth={3}
                      fill="#4f46e5" 
                      fillOpacity={0.2} 
                      activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                    >
                      <LabelList dataKey="compliance" position="top" formatter={(val: number) => `${val}%`} style={{ fontSize: '11px', fontWeight: 'bold', fill: '#1e293b' }} />
                    </Radar>
                    <Tooltip content={<CustomTooltip lang={lang} />} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-bold mb-6 text-slate-800">{lang === 'en' ? 'Monthly Average Compliance Trend' : 'แนวโน้มความสอดคล้องเฉลี่ยรายเดือน'}</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{fontSize: 12, fill: '#475569'}} />
                  <YAxis domain={[0, 100]} tick={{fontSize: 12, fill: '#475569'}} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip content={<CustomTooltip lang={lang} />} />
                  <Area type="monotone" dataKey="avg" stroke="#4f46e5" fillOpacity={1} fill="url(#colorAvg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-bold mb-6 text-slate-800">{lang === 'en' ? 'Compliance Trend by Topic' : 'แนวโน้มความสอดคล้องรายหัวข้อ'}</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sectionTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{fontSize: 12, fill: '#475569'}} />
                  <YAxis domain={[0, 100]} tick={{fontSize: 12, fill: '#475569'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  {SECTIONS_CONFIG.map((section, index) => (
                    <Line 
                      key={section.id}
                      type="monotone" 
                      dataKey={section.id} 
                      name={lang === 'en' ? section.title_en.split('. ')[1] : section.title_th.split('. ')[1]}
                      stroke={COLORS[index % COLORS.length]} 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
