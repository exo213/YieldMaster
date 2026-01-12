import React, { useState, useMemo } from 'react';
import { calculateEconomics, calculateEffectiveYield, calculateGoodDies, calculateGrossDies } from '../../utils/math';
import { DollarSign, Cpu, Layers } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const StrategyCard = ({ title, icon: Icon, children }) => (
    <div className="bg-[#1E293B]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 h-full">
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        {children}
    </div>
);

const StrategiesTab = ({ params, stats }) => {
    // Local state for strategy parameters
    const [waferCost, setWaferCost] = useState(5000);
    const [repairPct, setRepairPct] = useState(0); // 0-100%
    const [scribeWidth, setScribeWidth] = useState(0.1); // mm
    const [fabUtilization, setFabUtilization] = useState(95); // 50-100%

    // Economics Calculation
    const economics = useMemo(() => {
        // Effective Yield consideration
        const effectiveYield = calculateEffectiveYield(params, repairPct);
        const goodDies = calculateGoodDies(stats.totalDies, effectiveYield);
        // Pass fabUtilization as decimal (0-1)
        const cpgd = calculateEconomics(waferCost, goodDies, fabUtilization / 100);
        const revenue = goodDies * (cpgd * 1.5); // Mock markup

        return { effectiveYield, goodDies, cpgd, revenue };
    }, [params, stats.totalDies, waferCost, repairPct, fabUtilization]);

    // Cost Curve Data Generation
    const costCurveData = useMemo(() => {
        const data = [];
        // Simulate varying defect densities to show cost curve
        for (let d = 0.1; d <= 2.0; d += 0.2) {
            const simParams = { ...params, d0: d };
            const y = calculateEffectiveYield(simParams, repairPct);
            const g = calculateGoodDies(stats.totalDies, y);
            const c = calculateEconomics(waferCost, g, fabUtilization / 100);
            data.push({
                d0: d.toFixed(1),
                yield: (y * 100).toFixed(0),
                cpgd: c > 1000 ? 1000 : c // Cap for visualization
            });
        }
        return data;
    }, [params, stats.totalDies, waferCost, repairPct]);


    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">

            {/* Configuration Column */}
            <div className="lg:col-span-4 space-y-6">

                {/* Economics Inputs */}
                <StrategyCard title="Economics" icon={DollarSign}>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Wafer Cost ($)</label>
                            <input
                                type="number"
                                value={waferCost}
                                onChange={e => setWaferCost(Number(e.target.value))}
                                className="w-full bg-[#0B1020] border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm text-gray-400">Fab Utilization</label>
                                <span className="text-sm font-mono text-blue-400">{fabUtilization}%</span>
                            </div>
                            <input
                                type="range"
                                min="50" max="100" step="1"
                                value={fabUtilization}
                                onChange={e => setFabUtilization(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                        <div className="pt-4 border-t border-white/5">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-gray-400 text-sm">CPGD (Cost/Good Die)</span>
                                <span className="text-2xl font-bold text-green-400 font-mono">${economics.cpgd.toFixed(2)}</span>
                            </div>
                            <div className="text-xs text-gray-500 text-right">Target: &lt; $15.00</div>
                        </div>
                    </div>
                </StrategyCard>

                {/* Repair Strategy */}
                <StrategyCard title="Redundancy & Repair" icon={Cpu}>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm text-gray-400">Repairable Area</label>
                                <span className="text-sm font-mono text-blue-400">{repairPct}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="50" step="1"
                                value={repairPct}
                                onChange={e => setRepairPct(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-black/20 p-2 rounded">
                                <div className="text-xs text-gray-500">Base Yield</div>
                                <div className="font-mono text-gray-300">{(stats.yieldRate * 100).toFixed(1)}%</div>
                            </div>
                            <div className="bg-blue-500/10 p-2 rounded border border-blue-500/20">
                                <div className="text-xs text-blue-300">Effective</div>
                                <div className="font-mono font-bold text-blue-400">{(economics.effectiveYield * 100).toFixed(1)}%</div>
                            </div>
                        </div>
                    </div>
                </StrategyCard>

            </div>

            {/* Visualization Column */}
            <div className="lg:col-span-8 space-y-6">
                <StrategyCard title="Cost vs. Defect Density Analysis" icon={Layers}>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={costCurveData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="d0" stroke="#94a3b8" label={{ value: 'Defect Density (D0)', position: 'insideBottom', offset: -5 }} />
                                <YAxis yAxisId="left" stroke="#10b981" label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" label={{ value: 'Yield (%)', angle: 90, position: 'insideRight' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="cpgd" name="Cost Per Die ($)" stroke="#10b981" strokeWidth={2} dot={false} />
                                <Line yAxisId="right" type="monotone" dataKey="yield" name="Yield (%)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="mt-4 text-sm text-gray-400">
                        Analysis shows how Cost Per Good Die (CPGD) increases exponentially as defect density rises.
                        Repair strategies shift this curve downwards, extending the viable process window.
                    </p>
                </StrategyCard>
            </div>

        </div>
    );
};

export default StrategiesTab;
