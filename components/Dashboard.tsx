
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell,
  Brush, Legend, LabelList
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

      filteredRounds.forEach(round => {
        const sData = round.sections[section.id as keyof TracerRound['sections']];
        if (sData && sData.items) {
          Object.values(sData.items).forEach(status => {
            if (status !== ComplianceStatus.NA) {
              totalItems++;
              if (status === ComplianceStatus.MET) metItems++;
              else if (status === ComplianceStatus.PARTIALLY_MET) partialItems++;
              else if (status === ComplianceStatus.NOT_MET) notMetItems++;
            }
          });
        }
      });

      const scoreSum = metItems + (partialItems * 0.5);

      return {
        name: lang === 'en' ? section.title_en.split('. ')[1] : section.title_th.split('. ')[1],
        compliance: totalItems > 0 ? Math.round((scoreSum / totalItems) * 100) : 0,
        met: metItems,
        partial: partialItems,
        notMet: notMetItems,
        total: totalItems
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

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6">
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
            <div className="bg-white p-6 rounded-xl border flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">{lang === 'en' ? 'Action Needed' : 'รายการที่ต้องจัดการ'}</p>
                <p className="text-3xl font-bold text-slate-900">{stats.sectionCompliance.filter(s => s.compliance < 80).length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
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
                    <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 10, fontWeight: 500, fill: '#64748b'}} />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      content={<CustomTooltip lang={lang} />}
                    />
                    <Bar dataKey="compliance" radius={[0, 4, 4, 0]} barSize={24}>
                      {stats.sectionCompliance.map((e, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />
                      ))}
                      <LabelList dataKey="compliance" position="right" formatter={(val: number) => `${val}%`} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#4f46e5' }} />
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
                    <PolarAngleAxis dataKey="name" tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 600}} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{fontSize: 8}} />
                    <Radar 
                      name="Score" 
                      dataKey="compliance" 
                      stroke="#4f46e5" 
                      strokeWidth={3}
                      fill="#4f46e5" 
                      fillOpacity={0.2} 
                      activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                    >
                      <LabelList dataKey="compliance" position="top" formatter={(val: number) => `${val}%`} style={{ fontSize: '8px', fontWeight: 'bold' }} />
                    </Radar>
                    <Tooltip content={<CustomTooltip lang={lang} />} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
