import React, { useState, useEffect, useRef } from 'react';
import { Project } from '../../types';
import {
  Play,
  Pause,
  RotateCcw,
  Send,
  Cpu,
  Layers,
  Zap,
  Activity,
  Terminal,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  BarChart2,
  Wifi,
  Server,
  Sliders,
  Maximize2,
  Minimize2,
  Copy,
  FileText,
  Sparkles,
  ExternalLink,
  X,
  Laptop,
  Tablet,
  Smartphone,
  HeartPulse,
  DollarSign,
  Flame,
  RefreshCw,
  Search,
  Code
} from 'lucide-react';

interface InteractiveProjectDemoProps {
  project: Project;
  onClose?: () => void;
  isModal?: boolean;
}

export const InteractiveProjectDemo: React.FC<InteractiveProjectDemoProps> = ({
  project,
  onClose,
  isModal = false
}) => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'api' | 'telemetry'>('simulation');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isRunning, setIsRunning] = useState(true);

  // Category identification
  const catSlug = project.category?.slug?.toLowerCase() || '';
  const isAI = catSlug.includes('ai') || catSlug.includes('ml') || project.name.toLowerCase().includes('ai');
  const isCloud = catSlug.includes('cloud') || catSlug.includes('devops') || project.name.toLowerCase().includes('kubernetes') || project.name.toLowerCase().includes('mesh');
  const isHealth = catSlug.includes('health') || catSlug.includes('ehr') || project.name.toLowerCase().includes('health') || project.name.toLowerCase().includes('telehealth');
  const isFintech = catSlug.includes('fintech') || catSlug.includes('payment') || project.name.toLowerCase().includes('ledger') || project.name.toLowerCase().includes('fin');

  // ----------------------------------------------------
  // 1. AI RAG SIMULATOR STATE
  // ----------------------------------------------------
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(
    'ApexCore AI is indexed over 24 enterprise repositories. Ask any architectural question or choose a prompt preset above to execute real-time semantic retrieval.'
  );
  const [aiMetrics, setAiMetrics] = useState({
    confidence: '99.8%',
    latency: '42ms',
    chunksScanned: 18420,
    sources: ['Architecture_v2.md (P.14)', 'Compliance_SOC2_Audit.pdf', 'Kafka_Cluster_Spec.md']
  });

  const handleAiSearch = (customPrompt?: string) => {
    const q = customPrompt || aiQuery;
    if (!q.trim()) return;
    if (customPrompt) setAiQuery(customPrompt);
    setAiLoading(true);
    setAiResponse(null);

    setTimeout(() => {
      let answer = '';
      let sources = ['Document_Repository_Master.pdf', 'Security_Clearance_Matrix.json'];
      let lat = Math.floor(Math.random() * 25 + 30) + 'ms';

      if (q.toLowerCase().includes('latency') || q.toLowerCase().includes('slo')) {
        answer = `Vector latency across all distributed endpoints is guaranteed <45ms at p99. Automatic failover routes traffic through local pgvector read replicas with zero session loss.`;
        sources = ['SLO_Latency_Audit_2025.pdf (P.3)', 'Edge_Gateway_Routing.md'];
      } else if (q.toLowerCase().includes('soc') || q.toLowerCase().includes('compliance') || q.toLowerCase().includes('security')) {
        answer = `SOC-2 Type II audit verified zero PII leakage. Dynamic transformer redaction strips sensitive credentials, SSNs, and credit cards with sub-millisecond overhead prior to neural ingestion.`;
        sources = ['SOC2_Compliance_Audit_2025.pdf (P.22)', 'PII_Redaction_Worker.py'];
      } else {
        answer = `Synthesized query across ${Math.floor(Math.random() * 5000 + 15000).toLocaleString()} semantic chunks. Verified deterministic attribution with zero hallucination score. All context references map to verified audit hashes.`;
        sources = ['KnowledgeBase_Master_Chunk_4.md', 'Enterprise_Policy_Index.pdf'];
      }

      setAiResponse(answer);
      setAiMetrics({
        confidence: (99.2 + Math.random() * 0.7).toFixed(2) + '%',
        latency: lat,
        chunksScanned: Math.floor(Math.random() * 8000 + 14000),
        sources
      });
      setAiLoading(false);
    }, 600);
  };

  // ----------------------------------------------------
  // 2. CLOUD / MESH SIMULATOR STATE
  // ----------------------------------------------------
  const [trafficRate, setTrafficRate] = useState(2500);
  const [clusterNodes, setClusterNodes] = useState([
    { name: 'us-east-edge-01', pods: 12, cpu: 38, memory: 45, status: 'healthy', latency: 12 },
    { name: 'eu-west-core-02', pods: 18, cpu: 62, memory: 58, status: 'healthy', latency: 18 },
    { name: 'ap-southeast-03', pods: 8, cpu: 28, memory: 34, status: 'healthy', latency: 24 },
    { name: 'ca-central-04', pods: 14, cpu: 44, memory: 51, status: 'healthy', latency: 15 }
  ]);
  const [chaosActive, setChaosActive] = useState(false);

  const triggerChaosSurge = () => {
    setChaosActive(true);
    setTrafficRate(48000);
    setClusterNodes(prev =>
      prev.map((n, idx) => ({
        ...n,
        pods: n.pods * 3,
        cpu: Math.min(95, n.cpu + 35),
        latency: n.latency + 8,
        status: idx === 1 ? 'warning' : 'healthy'
      }))
    );

    setTimeout(() => {
      setClusterNodes(prev =>
        prev.map(n => ({
          ...n,
          cpu: Math.max(35, n.cpu - 20),
          status: 'healthy'
        }))
      );
      setChaosActive(false);
    }, 2500);
  };

  // ----------------------------------------------------
  // 3. FINTECH SIMULATOR STATE
  // ----------------------------------------------------
  const [ledgerBalance, setLedgerBalance] = useState(1482900.50);
  const [transactions, setTransactions] = useState([
    { id: 'TXN-90281', sender: 'Aetheria Prime Clearing', amount: 150000.00, type: 'CREDIT', time: 'Just now', status: 'SETTLED' },
    { id: 'TXN-90280', sender: 'SEPA Instant Rail', amount: -42500.20, type: 'DEBIT', time: '12s ago', status: 'SETTLED' },
    { id: 'TXN-90279', sender: 'FedNow Liquidity Route', amount: 89300.00, type: 'CREDIT', time: '45s ago', status: 'SETTLED' }
  ]);

  const dispatchTransaction = (amount: number, sender: string) => {
    const newTx = {
      id: `TXN-${Math.floor(Math.random() * 90000 + 10000)}`,
      sender,
      amount,
      type: amount > 0 ? 'CREDIT' : 'DEBIT',
      time: 'Just now',
      status: 'SETTLED'
    };
    setLedgerBalance(prev => prev + amount);
    setTransactions(prev => [newTx, ...prev.slice(0, 4)]);
  };

  // ----------------------------------------------------
  // 4. HEALTHTECH SIMULATOR STATE
  // ----------------------------------------------------
  const [heartRate, setHeartRate] = useState(74);
  const [spo2, setSpo2] = useState(99);
  const [soapSigned, setSoapSigned] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => Math.floor(72 + Math.random() * 6 - 3));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // ----------------------------------------------------
  // 5. LIVE TELEMETRY LOGS
  // ----------------------------------------------------
  const [logs, setLogs] = useState<string[]>([
    `[INFO] ${project.name} live runtime initialized successfully.`,
    `[INFO] Kernel telemetry probes connected to distributed mesh.`,
    `[METRIC] Handshake latency: 1.4ms | Zero loss cryptographic verification active.`
  ]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const messages = [
        `[HEARTBEAT] Healthcheck passed on 4 worker instances. Load nominal.`,
        `[TELEMETRY] Ingested 1,240 events/sec through Kafka ring buffer.`,
        `[AUDIT] Cryptographic SHA-256 state proof validated across consensus quorum.`,
        `[AUTOSCALE] Dynamic resource headroom verified at 68.4%.`,
        `[SECURITY] TLS 1.3 mutual handshake verified with zero inspection latency.`
      ];
      const nextLog = messages[Math.floor(Math.random() * messages.length)];
      setLogs(prev => [nextLog, ...prev.slice(0, 15)]);
    }, 3500);
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className={`relative flex flex-col bg-slate-950 border border-indigo-500/30 rounded-3xl overflow-hidden shadow-2xl text-white font-sans ${isModal ? 'w-full max-w-6xl max-h-[92vh] mx-auto' : 'w-full'}`}>
      {/* Sandbox Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          {/* OS Window Pills */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-xs" />
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white tracking-wide truncate max-w-[180px] sm:max-w-xs">
              {project.name}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE SANDBOX
            </span>
          </div>
        </div>

        {/* Center Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('simulation')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'simulation' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Interactive Console
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'telemetry' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Live Logs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'api' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
          >
            API Docs
          </button>
        </div>

        {/* Right Tools & Viewports */}
        <div className="flex items-center gap-2">
          {/* Device viewport switchers */}
          <div className="hidden md:flex items-center p-0.5 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${device === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Desktop 100%"
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${device === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Tablet 768px"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${device === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Mobile 380px"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title={isRunning ? 'Pause Telemetry' : 'Resume Telemetry'}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close Sandbox"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Sandbox Content Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className={`transition-all duration-300 ${
          device === 'mobile'
            ? 'max-w-sm mx-auto'
            : device === 'tablet'
            ? 'max-w-2xl mx-auto'
            : 'w-full'
        }`}>
          {/* TAB 1: INTERACTIVE SIMULATION */}
          {activeTab === 'simulation' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Specialized Interactive Workflow Simulator based on Project */}
              {isAI && (
                /* AI RAG Intelligence Platform Demo */
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-sm font-bold text-white">Neural Semantic Query & Vector RAG Console</h4>
                      </div>
                      <span className="text-[11px] text-indigo-300 font-mono">
                        Embeddings: 1536-dim pgvector • Zero Hallucination Guard
                      </span>
                    </div>

                    {/* Quick Preset Prompts */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">Test Prompts:</span>
                      <button
                        type="button"
                        onClick={() => handleAiSearch('Summarize SOC-2 compliance audit results and PII redaction')}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-200 transition-colors cursor-pointer"
                      >
                        ⚡ SOC-2 Audit & PII Redaction
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAiSearch('What are the p99 latency SLO thresholds for distributed clustering?')}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-200 transition-colors cursor-pointer"
                      >
                        ⚡ Latency SLO & Failover
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAiSearch('Analyze cross-region egress cost optimizations')}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-200 transition-colors cursor-pointer"
                      >
                        ⚡ Egress Cost Optimizations
                      </button>
                    </div>

                    {/* Search Input Bar */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={aiQuery}
                          onChange={e => setAiQuery(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAiSearch()}
                          placeholder="Type an enterprise query to test semantic neural retrieval..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 font-sans"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={aiLoading}
                        onClick={() => handleAiSearch()}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>{aiLoading ? 'Synthesizing...' : 'Execute Query'}</span>
                      </button>
                    </div>

                    {/* Output & Attribution Box */}
                    {aiResponse && (
                      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Synthesized Neural Intelligence</span>
                          </span>
                          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                            <span>Latency: <strong className="text-indigo-400">{aiMetrics.latency}</strong></span>
                            <span>Confidence: <strong className="text-emerald-400">{aiMetrics.confidence}</strong></span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-200 leading-relaxed font-sans">
                          {aiResponse}
                        </p>

                        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-semibold">Attributed Citations:</span>
                          {aiMetrics.sources.map((src, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-500/30 text-[10px] text-indigo-300 font-mono"
                            >
                              ✓ {src}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isCloud && (
                /* Kubernetes Service Mesh & Orchestration Demo */
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Activity className="w-4 h-4 text-cyan-400" />
                          <span>Multi-Region Mesh Cluster & eBPF Telemetry</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Real-time kernel packet inspection, automated pod auto-scaling, and latency routing.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={triggerChaosSurge}
                        disabled={chaosActive}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>{chaosActive ? 'Surge Injected (50k req/s)...' : 'Simulate 50k req/s Spike'}</span>
                      </button>
                    </div>

                    {/* Nodes Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {clusterNodes.map((node, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border transition-all ${
                            node.status === 'warning'
                              ? 'bg-amber-950/30 border-amber-500/50 shadow-md shadow-amber-500/10 animate-pulse'
                              : 'bg-slate-950 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-200 font-mono">{node.name}</span>
                            <span className={`w-2 h-2 rounded-full ${node.status === 'warning' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                          </div>

                          <div className="space-y-1.5 text-xs text-slate-400">
                            <div className="flex justify-between">
                              <span>Pods:</span>
                              <strong className="text-white font-mono">{node.pods} active</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>CPU:</span>
                              <strong className="text-cyan-400 font-mono">{node.cpu}%</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>eBPF Latency:</span>
                              <strong className="text-emerald-400 font-mono">{node.latency}ms</strong>
                            </div>
                          </div>

                          {/* Mini Progress Bar */}
                          <div className="w-full h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${node.cpu > 75 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                              style={{ width: `${node.cpu}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {isFintech && (
                /* FinTech Real-Time Ledger & Settlement Demo */
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-emerald-400" />
                          <span>Double-Entry Core Ledger & Instant Settlement Simulator</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Mathematical zero-sum invariance verified with sub-millisecond atomic commit.
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">Liquid Ledger Balance</span>
                        <span className="text-xl font-extrabold text-emerald-400 font-mono">
                          ${ledgerBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Dispatch Quick Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-400 font-semibold">Dispatch Transfers:</span>
                      <button
                        type="button"
                        onClick={() => dispatchTransaction(75000, 'Global Merchant Settlement')}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        + Credit $75,000 SEPA
                      </button>
                      <button
                        type="button"
                        onClick={() => dispatchTransaction(-18400, 'FedNow Real-time Payout')}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        - Debit $18,400 FedNow
                      </button>
                    </div>

                    {/* Transactions Stream */}
                    <div className="space-y-2">
                      {transactions.map(tx => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-indigo-400 font-bold">{tx.id}</span>
                            <span className="text-slate-300 font-sans">{tx.sender}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {tx.amount > 0 ? `+$${tx.amount.toLocaleString()}` : `-$${Math.abs(tx.amount).toLocaleString()}`}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-500/30 text-[10px] text-emerald-300">
                              ✓ {tx.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {isHealth && (
                /* HealthTech Telehealth & Clinical EHR Demo */
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <HeartPulse className="w-4 h-4 text-rose-400 animate-pulse" />
                          <span>Physician HUD & Ambient AI Clinical Scribe</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          HIPAA-compliant encrypted WebRTC telemetry with automated SOAP note generation.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
                        <div className="text-center px-2 border-r border-slate-800">
                          <span className="text-[10px] text-slate-400 block">BPM</span>
                          <span className="text-base font-bold text-rose-400 font-mono">{heartRate}</span>
                        </div>
                        <div className="text-center px-2">
                          <span className="text-[10px] text-slate-400 block">SpO2</span>
                          <span className="text-base font-bold text-cyan-400 font-mono">{spo2}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Ambient Note Preview */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-indigo-300">Drafted Ambient Clinical Note (SOAP)</span>
                        <button
                          type="button"
                          onClick={() => setSoapSigned(!soapSigned)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            soapSigned
                              ? 'bg-emerald-600 text-white'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                        >
                          {soapSigned ? '✓ Physician Approved' : 'Sign & Transmit to Hospital EHR'}
                        </button>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                        <strong>S:</strong> Patient reports mild dyspnea during exertion. No chest pain.<br />
                        <strong>O:</strong> HR {heartRate} bpm, SpO2 {spo2}%, Normal sinus rhythm on WebRTC monitor.<br />
                        <strong>A:</strong> Seasonal allergic asthma (ICD-10 J45.909).<br />
                        <strong>P:</strong> Albuterol HFA 90mcg inhaler 2 puffs PRN. Follow-up in 4 weeks.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Universal Live Interactive Metrics Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Uptime SLA</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">99.999%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">p99 Latency</span>
                  <span className="text-base font-bold text-indigo-400 font-mono">3.4 ms</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Active Connections</span>
                  <span className="text-base font-bold text-cyan-400 font-mono">18,490</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Security Integrity</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">SOC-2 Verified</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE TELEMETRY LOGS */}
          {activeTab === 'telemetry' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Real-Time eBPF Socket Event Stream</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLogs([`[INFO] Logs cleared at ${new Date().toLocaleTimeString()}`])}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              </div>

              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`leading-relaxed ${
                      log.includes('[HEARTBEAT]')
                        ? 'text-cyan-400'
                        : log.includes('[METRIC]')
                        ? 'text-indigo-400'
                        : log.includes('[SECURITY]')
                        ? 'text-emerald-400'
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="text-slate-600 mr-2">{new Date().toLocaleTimeString()}</span>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: API SPEC & DOCUMENTATION */}
          {activeTab === 'api' && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-sm font-bold text-white">REST & gRPC Integration Spec</h4>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 font-mono">
                  v2.4.0 Production
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                <pre>{`// Example Live Query Execution
curl -X POST https://api.nexora.io/v2/projects/${project.slug}/execute \\
  -H "Authorization: Bearer nex_live_sec_token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "workload_type": "distributed_inference",
    "parameters": {
      "temperature": 0.2,
      "max_tokens": 1024,
      "enforce_soc2_compliance": true
    }
  }'`}</pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info Strip */}
      <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Interactive Sandbox v2.4 • Connected to Live Engine</span>
        </div>

        {project.links && project.links.some(l => l.link_type === 'live_demo') && (
          <a
            href={project.links.find(l => l.link_type === 'live_demo')?.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300"
          >
            <span>Open External Endpoint in New Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};
