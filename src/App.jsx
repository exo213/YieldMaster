import React, { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import SimulatorTab from './components/tabs/SimulatorTab';
import OverviewTab from './components/tabs/OverviewTab';
import StrategiesTab from './components/tabs/StrategiesTab';
import { calculateYield, calculateGrossDies, calculateGoodDies, calculateEfficiency } from './utils/math';

function App() {
  const [activeTab, setActiveTab] = useState('simulator'); // 'overview', 'simulator', 'strategies'

  const [params, setParams] = useState({
    diameter: 300,
    dieArea: 100,
    d0: 0.5,
    alpha: 2.0,
    model: 'poisson', // poisson, murphy, nb
    // New parameters for upgraded logic
    edgeExclusion: 3,      // mm (default 3mm edge exclusion)
    patternDensity: 0.7,   // Critical area ratio (0-1, default 70%)
    processMaturity: 0.95, // Systematic yield cap (0-1, default 95%)
    fabUtilization: 0.95   // Fab utilization (0-1, default 95%)
  });

  // Derived metrics (Shared across tabs if needed)
  const stats = useMemo(() => {
    const yieldRate = calculateYield(
      params.model,
      params.d0,
      params.dieArea,
      params.alpha,
      params.patternDensity,
      params.processMaturity
    );
    const totalDies = calculateGrossDies(params.diameter, params.dieArea, params.edgeExclusion);
    const goodDies = calculateGoodDies(totalDies, yieldRate);
    const efficiency = calculateEfficiency(totalDies, params.dieArea, params.diameter, params.edgeExclusion);

    return { yieldRate, totalDies, goodDies, efficiency };
  }, [params]);


  return (
    <div className="min-h-screen bg-[#0B1020] text-gray-100 font-sans selection:bg-blue-500/30 flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-6">
        {activeTab === 'overview' && <OverviewTab stats={stats} params={params} />}

        {activeTab === 'simulator' && (
          <SimulatorTab
            params={params}
            setParams={setParams}
            stats={stats}
          />
        )}

        {activeTab === 'strategies' && <StrategiesTab stats={stats} params={params} />}
      </main>
    </div>
  );
}

export default App;
