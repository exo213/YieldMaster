import React from 'react';
import { Info } from 'lucide-react';

const RangeSlider = ({ label, value, min, max, step, onChange, unit }) => {
    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-400">{label}</label>
                <span className="text-sm font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {value}{unit}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-colors"
            />
        </div>
    );
};

const ControlPanel = ({
    params,
    setParams
}) => {

    const updateParam = (key, val) => {
        setParams(prev => ({ ...prev, [key]: val }));
    };

    const models = [
        { id: 'poisson', label: 'Poisson' },
        { id: 'murphy', label: 'Murphy' },
        { id: 'nb', label: 'Neg. Binomial' }
    ];

    return (
        <div className="bg-[#1E293B]/50 backdrop-blur-sm p-6 rounded-2xl border border-white/5 h-fit">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                Process Parameters
            </h2>

            {/* Wafer Diameter */}
            <RangeSlider
                label="Wafer Diameter"
                value={params.diameter}
                min={200}
                max={450}
                step={50} // Industry standard steps usually, but user allowed range
                onChange={(v) => updateParam('diameter', v)}
                unit="mm"
            />

            {/* Die Area */}
            <RangeSlider
                label="Die Area"
                value={params.dieArea}
                min={20}
                max={200}
                step={1}
                onChange={(v) => updateParam('dieArea', v)}
                unit="mm²"
            />

            {/* Defect Density */}
            <RangeSlider
                label="Defect Density (D0)"
                value={params.d0}
                min={0.01}
                max={1.0}
                step={0.01}
                onChange={(v) => updateParam('d0', v)}
                unit="/cm²"
            />

            {/* Cluster Factor */}
            <div className={`transition-opacity duration-300 ${params.model === 'nb' ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
                <RangeSlider
                    label="Cluster Factor (α)"
                    value={params.alpha}
                    min={0.5}
                    max={5.0}
                    step={0.1}
                    onChange={(v) => updateParam('alpha', v)}
                    unit=""
                />
            </div>

            {/* Advanced Parameters Section */}
            <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-sm font-medium text-gray-500 mb-4">Advanced Parameters</h3>

                {/* Edge Exclusion */}
                <RangeSlider
                    label="Edge Exclusion"
                    value={params.edgeExclusion}
                    min={0}
                    max={10}
                    step={0.5}
                    onChange={(v) => updateParam('edgeExclusion', v)}
                    unit="mm"
                />

                {/* Pattern Density (Critical Area) */}
                <RangeSlider
                    label="Pattern Density"
                    value={Math.round(params.patternDensity * 100)}
                    min={30}
                    max={100}
                    step={5}
                    onChange={(v) => updateParam('patternDensity', v / 100)}
                    unit="%"
                />

                {/* Process Maturity (Systematic Yield) */}
                <RangeSlider
                    label="Process Maturity"
                    value={Math.round(params.processMaturity * 100)}
                    min={80}
                    max={100}
                    step={1}
                    onChange={(v) => updateParam('processMaturity', v / 100)}
                    unit="%"
                />
            </div>

            {/* Model Selector */}
            <div className="mt-8">
                <label className="text-sm font-medium text-gray-400 block mb-3">Yield Model</label>
                <div className="grid grid-cols-3 gap-1 bg-[#0B1020] p-1 rounded-lg">
                    {models.map(m => (
                        <button
                            key={m.id}
                            onClick={() => updateParam('model', m.id)}
                            className={`py-2 px-2 text-xs font-medium rounded-md transition-all ${params.model === m.id
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-200/80 leading-relaxed">
                    {params.model === 'poisson' && "Assumes defects are distributed randomly. Best for low defect densities."}
                    {params.model === 'murphy' && "Accounts for variable defect density using an approximate mathematical model."}
                    {params.model === 'nb' && "Negative Binomial handles defect clustering (α), common in modern fabs."}
                </p>
            </div>

        </div>
    );
};

export default ControlPanel;
