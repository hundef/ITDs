import bcrypt from 'bcryptjs';
import { db } from './db.js';

export async function seedDatabase(force = false) {
  // If already seeded and not forced, return
  if (!force && db.find('users').length > 0) {
    console.log('Database already initialized with data.');
    return;
  }

  console.log('Seeding fresh database with comprehensive enterprise demo data...');

  // Reset collections
  db.data = {
    users: [],
    project_categories: [],
    technologies: [],
    projects: [],
    project_technologies: [],
    project_features: [],
    project_workflows: [],
    project_results: [],
    project_media: [],
    project_links: [],
    services: [],
    team_members: [],
    testimonials: [],
    blog_posts: [],
    contact_inquiries: [],
    website_settings: {},
    activity_logs: [],
    security_logs: [],
    security_policy: {
      max_failed_attempts: 5,
      lockout_duration_minutes: 15,
      session_timeout_hours: 168,
      require_2fa_for_admins: false,
      password_min_length: 8,
      password_require_special: true,
      password_require_number: true,
      password_expiry_days: 90
    }
  };

  const passwordHashAdmin = await bcrypt.hash('admin123', 10);
  const passwordHashPM = await bcrypt.hash('pm123', 10);
  const passwordHashContent = await bcrypt.hash('content123', 10);

  // 1. Users with IAM Security Metadata
  const userSuperAdmin = db.insert('users', {
    id: 1,
    name: 'Alexander Wright',
    email: 'superadmin@nexora.io',
    password_hash: passwordHashAdmin,
    role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Chief Technology Officer',
    department: 'Executive Leadership',
    status: 'active',
    two_factor_enabled: true,
    custom_permissions: [],
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    last_login_ip: '192.168.1.100',
    last_password_change: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
    must_change_password: false
  });

  const userAdmin = db.insert('users', {
    id: 2,
    name: 'Elena Rostova',
    email: 'admin@nexora.io',
    password_hash: passwordHashAdmin,
    role: 'administrator',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    title: 'Director of Engineering',
    department: 'Engineering',
    status: 'active',
    two_factor_enabled: true,
    custom_permissions: ['security.audit', 'users.manage_security'],
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    last_login_ip: '192.168.1.105',
    last_password_change: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    must_change_password: false
  });

  const userPM = db.insert('users', {
    id: 3,
    name: 'Marcus Chen',
    email: 'pm@nexora.io',
    password_hash: passwordHashPM,
    role: 'project_manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Principal Project Manager',
    department: 'Product Delivery',
    status: 'active',
    two_factor_enabled: false,
    custom_permissions: ['projects.publish'],
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    last_login_ip: '192.168.1.112',
    last_password_change: new Date(Date.now() - 3600000 * 24 * 45).toISOString(),
    must_change_password: false
  });

  const userContent = db.insert('users', {
    id: 4,
    name: 'Sophia Laurent',
    email: 'content@nexora.io',
    password_hash: passwordHashContent,
    role: 'content_manager',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    title: 'Head of Content & Communications',
    department: 'Marketing & PR',
    status: 'active',
    two_factor_enabled: false,
    custom_permissions: [],
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    last_login_ip: '192.168.1.120',
    last_password_change: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
    must_change_password: false
  });

  // 2. Categories
  const categories = [
    { id: 1, name: 'AI & Machine Learning', slug: 'ai-ml', description: 'Deep learning models, predictive intelligence, and generative AI pipelines.', color: '#8b5cf6' },
    { id: 2, name: 'Cloud & DevOps', slug: 'cloud-devops', description: 'Distributed infrastructure, microservices, containerization, and automated CI/CD.', color: '#06b6d4' },
    { id: 3, name: 'Enterprise SaaS', slug: 'enterprise-saas', description: 'Large-scale workflow automation, multi-tenant portals, and core business software.', color: '#3b82f6' },
    { id: 4, name: 'FinTech & Payments', slug: 'fintech-payments', description: 'Real-time ledger processing, compliance systems, and high-frequency settlement.', color: '#10b981' },
    { id: 5, name: 'HealthTech & EHR', slug: 'healthtech-ehr', description: 'HIPAA-compliant telemedicine platforms and automated clinical diagnostic workflows.', color: '#ec4899' },
    { id: 6, name: 'Smart Logistics & IoT', slug: 'smart-logistics-iot', description: 'Real-time telemetry, fleet tracking, and edge sensor automation.', color: '#f59e0b' },
    { id: 7, name: 'Cyber Security', slug: 'cyber-security', description: 'Zero-trust IAM, continuous vulnerability scanning, and threat intelligence.', color: '#ef4444' },
    { id: 8, name: 'E-Commerce & Retail', slug: 'ecommerce-retail', description: 'High-speed headless commerce architectures and global omnichannel engines.', color: '#6366f1' }
  ];
  categories.forEach(cat => db.insert('project_categories', cat));

  // 3. Technologies
  const technologies = [
    { id: 1, name: 'React', slug: 'react', category: 'Frontend', icon: 'Code', color: '#61dafb' },
    { id: 2, name: 'Next.js', slug: 'nextjs', category: 'Frontend', icon: 'Globe', color: '#000000' },
    { id: 3, name: 'TypeScript', slug: 'typescript', category: 'Languages', icon: 'FileCode', color: '#3178c6' },
    { id: 4, name: 'Node.js', slug: 'nodejs', category: 'Backend', icon: 'Server', color: '#339933' },
    { id: 5, name: 'Express.js', slug: 'express', category: 'Backend', icon: 'Cpu', color: '#68a063' },
    { id: 6, name: 'Python', slug: 'python', category: 'Languages', icon: 'Terminal', color: '#3776ab' },
    { id: 7, name: 'PyTorch', slug: 'pytorch', category: 'AI/ML', icon: 'Zap', color: '#ee4c2c' },
    { id: 8, name: 'Go (Golang)', slug: 'golang', category: 'Languages', icon: 'Cpu', color: '#00add8' },
    { id: 9, name: 'PostgreSQL', slug: 'postgresql', category: 'Database', icon: 'Database', color: '#4169e1' },
    { id: 10, name: 'Redis', slug: 'redis', category: 'Database', icon: 'Layers', color: '#dc382d' },
    { id: 11, name: 'Docker', slug: 'docker', category: 'DevOps', icon: 'Box', color: '#2496ed' },
    { id: 12, name: 'Kubernetes', slug: 'kubernetes', category: 'DevOps', icon: 'Cloud', color: '#326ce5' },
    { id: 13, name: 'AWS', slug: 'aws', category: 'Cloud', icon: 'CloudLightning', color: '#ff9900' },
    { id: 14, name: 'GraphQL', slug: 'graphql', category: 'API', icon: 'Share2', color: '#e10098' },
    { id: 15, name: 'Tailwind CSS', slug: 'tailwindcss', category: 'Frontend', icon: 'Layout', color: '#06b6d4' },
    { id: 16, name: 'Apache Kafka', slug: 'kafka', category: 'Data', icon: 'Activity', color: '#231f20' },
    { id: 17, name: 'MongoDB', slug: 'mongodb', category: 'Database', icon: 'Database', color: '#47a248' },
    { id: 18, name: 'Rust', slug: 'rust', category: 'Languages', icon: 'Shield', color: '#dea584' },
    { id: 19, name: 'Terraform', slug: 'terraform', category: 'DevOps', icon: 'Sliders', color: '#7b42bc' }
  ];
  technologies.forEach(tech => db.insert('technologies', tech));

  // 4. Projects & Associations
  const projectsData = [
    {
      id: 1,
      name: 'ApexCore AI Intelligence Platform',
      slug: 'apexcore-ai-intelligence-platform',
      category_id: 1,
      client_name: 'Vanguard Global Analytics',
      status: 'Completed',
      is_featured: 1,
      is_published: 1,
      priority: 1,
      start_date: '2025-01-15',
      completion_date: '2025-11-30',
      cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      short_description: 'Next-generation multimodal enterprise retrieval-augmented generation (RAG) platform with sub-second semantic search over 20M+ documents.',
      full_description: 'ApexCore AI is an enterprise-grade artificial intelligence engine designed to eliminate manual knowledge retrieval bottlenecks across global corporations. By synthesizing transformer-based neural embeddings with strict SOC-2 compliant vector indexing, ApexCore enables teams to query complex technical manuals, financial ledgers, and legal contracts through natural language with zero hallucination risk.',
      purpose: 'To empower Fortune 500 decision-makers and analysts with instantaneous, verifiable, and context-aware intelligence extracted from petabyte-scale internal document repositories.',
      what_it_does: 'ApexCore continuously indexes enterprise documents (PDFs, spreadsheets, slide decks, audio transcripts), extracts semantic relationships, redacts sensitive PII on the fly, and delivers conversational answers with exact source citations and interactive drill-down graphs.',
      problems_solved: 'Enterprises were losing an average of 4.2 hours per employee weekly searching for fragmented internal information across siloed drives. Legacy keyword search failed on synonymy, context, and unstructured scanned paperwork.',
      tech_ids: [1, 3, 6, 7, 9, 10, 11, 13],
      features: [
        { title: 'Multimodal Vector RAG Engine', description: 'Blazing fast vector indexing capable of parsing text, charts, tabular data, and scanned diagrams simultaneously.', icon: 'Zap' },
        { title: 'Deterministic Source Attribution', description: 'Every generated answer links to clickable highlighted bounding boxes on original source pages.', icon: 'FileCheck' },
        { title: 'Dynamic PII & Secret Redaction', description: 'Zero-latency neural filtering strips SSNs, credit cards, and confidential credentials prior to model ingestion.', icon: 'ShieldCheck' },
        { title: 'Granular Access-Control Sync', description: 'Inherits Active Directory and Okta permission hierarchies so users only query files they have security clearance for.', icon: 'Lock' },
        { title: 'Real-Time Telemetry & Cost Analytics', description: 'Comprehensive dashboard monitoring token throughput, GPU utilization, latency percentiles, and cost attribution per department.', icon: 'BarChart3' }
      ],
      workflows: [
        { step_number: 1, title: 'Document Ingestion & Chunking', description: 'Files are uploaded via S3 buckets, Kafka topics, or REST webhooks and split into semantic markdown chunks.', actor: 'Automated Pipeline', icon: 'UploadCloud' },
        { step_number: 2, title: 'Neural Embedding & Vector Indexing', description: 'Deep learning models generate 1536-dimensional embeddings stored in a distributed pgvector and Redis cache.', actor: 'PyTorch Embedding Worker', icon: 'Cpu' },
        { step_number: 3, title: 'Hybrid Semantic & Keyword Querying', description: 'User queries undergo query expansion, reranking, and semantic cosine similarity scoring within 45 milliseconds.', actor: 'Search Core', icon: 'Search' },
        { step_number: 4, title: 'Contextual Synthesis & Citation Mapping', description: 'Targeted context windows are synthesized into structured answers with verifiable source reference links.', actor: 'LLM Reasoning Engine', icon: 'CheckCircle2' },
        { step_number: 5, title: 'Audit Trail & Secure Distribution', description: 'Query logs, compliance hashes, and user feedback metrics are saved to the audit ledger and streamed to the user interface.', actor: 'Security Guard', icon: 'Shield' }
      ],
      results: [
        { metric_label: 'Retrieval Speedup', metric_value: '85%', description: 'Reduction in document lookup and analysis time across 14,000 corporate staff.' },
        { metric_label: 'Annual Cost Savings', metric_value: '$2.4M', description: 'Direct operational savings in legal compliance and research processing hours.' },
        { metric_label: 'Query Precision Rate', metric_value: '99.98%', description: 'Accuracy rating with zero hallucinations due to strict citation bounding.' },
        { metric_label: 'Daily Query Throughput', metric_value: '1.2M+', description: 'Concurrent queries processed during peak trading and regulatory filing hours.' }
      ],
      media: [
        { media_type: 'image', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80', caption: 'Executive Intelligence & RAG Query Console' },
        { media_type: 'image', url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&auto=format&fit=crop&q=80', caption: 'Vector Embedding Distribution & Cluster Map' },
        { media_type: 'image', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80', caption: 'Departmental Usage & Token Cost Optimization Matrix' }
      ],
      links: []
    },
    {
      id: 2,
      name: 'CloudMesh Kubernetes Orchestrator',
      slug: 'cloudmesh-kubernetes-orchestrator',
      category_id: 2,
      client_name: 'Helios Cloud Infrastructure',
      status: 'Completed',
      is_featured: 1,
      is_published: 1,
      priority: 2,
      start_date: '2024-06-01',
      completion_date: '2025-04-15',
      cover_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
      short_description: 'Multi-cloud autonomous service mesh controller with eBPF-powered packet telemetry and intelligent microservice autoscaling.',
      full_description: 'CloudMesh is a next-generation distributed cluster orchestration engine built to simplify cross-cloud infrastructure management across AWS, GCP, and on-premise Kubernetes deployments. Using low-overhead eBPF probes, CloudMesh maps inter-service communication in real-time, isolates microservice latency spikes, and autonomously balances workloads across spot and on-demand instances.',
      purpose: 'To eliminate multi-cloud configuration sprawl and provide continuous zero-downtime microservice traffic management with predictive scaling.',
      what_it_does: 'CloudMesh intercepts network telemetry at the kernel layer, identifies traffic bottlenecks, automatically adjusts pod replicas based on incoming HTTP request rate curves, and coordinates zero-downtime canary rollouts with instant rollback triggers.',
      problems_solved: 'Traditional HPA (Horizontal Pod Autoscaler) relies on delayed CPU/memory metrics, causing dropped connections during sudden flash traffic spikes. Engineering teams also struggled with visibility across heterogeneous multi-region clusters.',
      tech_ids: [1, 3, 8, 11, 12, 13, 19],
      features: [
        { title: 'eBPF Kernel-Level Telemetry', description: 'Zero-overhead packet inspection providing instant microsecond latency histograms without injecting heavy sidecars.', icon: 'Activity' },
        { title: 'Predictive Load Autoscaler', description: 'Anticipates traffic surges using historical time-series forecasting, warming up pods 90 seconds prior to load peaks.', icon: 'TrendingUp' },
        { title: 'Automated Canary Deployments', description: 'Intelligently shifts 1% to 100% traffic based on real-time error budget thresholds and automated anomaly rollback.', icon: 'GitMerge' },
        { title: 'Multi-Cloud Topology Visualizer', description: 'Live interactive 3D topology diagram showing service dependencies, TLS certificate expiry, and cross-region egress costs.', icon: 'Layers' }
      ],
      workflows: [
        { step_number: 1, title: 'Kernel Daemon Telemetry Capture', description: 'CloudMesh eBPF agents collect socket-level metrics with <0.5% CPU overhead.', actor: 'Mesh Node Daemon', icon: 'Radio' },
        { step_number: 2, title: 'Time-Series Aggregation & Analysis', description: 'Metrics are streamed into distributed ring buffers and evaluated against SLI/SLO policies.', actor: 'Telemetry Engine', icon: 'BarChart2' },
        { step_number: 3, title: 'Autonomous Workload Rebalancing', description: 'The scheduler issues CRD mutations to scale node groups and re-route traffic away from degraded pods.', actor: 'Orchestrator Core', icon: 'Sliders' },
        { step_number: 4, title: 'Global Status Synchronization', description: 'Cluster states and audit logs are synchronized across regions with cryptographic verification.', actor: 'Consensus Coordinator', icon: 'CheckSquare' }
      ],
      results: [
        { metric_label: 'Cloud Cost Cut', metric_value: '42%', description: 'Saved through automated spot instance bin-packing and dynamic node rightsizing.' },
        { metric_label: 'Platform Availability', metric_value: '99.999%', description: 'Maintained across 45 distributed global microservices over 12 consecutive months.' },
        { metric_label: 'Deployment Frequency', metric_value: '18x', description: 'Increase in safe daily production deployments enabled by automated canary rollback.' }
      ],
      media: [
        { media_type: 'image', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80', caption: 'Live Cluster Mesh & Service Graph View' },
        { media_type: 'image', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80', caption: 'Kernel-Level eBPF Telemetry Stream' }
      ],
      links: []
    },
    {
      id: 3,
      name: 'HealthSync Telehealth & Clinical EHR',
      slug: 'healthsync-telehealth-clinical-ehr',
      category_id: 5,
      client_name: 'BioVitality Medical Network',
      status: 'Ongoing',
      is_featured: 1,
      is_published: 1,
      priority: 3,
      start_date: '2025-03-01',
      completion_date: '2026-12-15',
      cover_image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
      short_description: 'HIPAA-compliant telemedicine platform with end-to-end encrypted WebRTC, AI ambient clinical scribe, and HL7/FHIR EHR interoperability.',
      full_description: 'HealthSync connects physicians and patients through ultra-secure HD video consultations while utilizing real-time ambient AI scribing to draft clinical soap notes, ICD-10 medical billing codes, and electronic prescription orders automatically during patient appointments.',
      purpose: 'To restore doctor-patient focus during appointments by eliminating administrative EHR typing burden while delivering effortless healthcare access to remote patients.',
      what_it_does: 'Provides a patient portal for appointments and health records, doctor consultation dashboard with instant medical history lookup, WebRTC video calling with real-time vitals sync, and automated clinical note generation with doctor sign-off workflows.',
      problems_solved: 'Physicians spent 2+ hours every evening finishing medical charts. Patient no-show rates for specialized clinics were exceeding 28% due to transportation barriers.',
      tech_ids: [1, 2, 3, 4, 6, 9, 10, 15],
      features: [
        { title: 'End-to-End Encrypted HD Video', description: 'Ultra-low latency WebRTC streaming with DTLS-SRTP encryption and adaptive bandwidth scaling.', icon: 'Video' },
        { title: 'Ambient Clinical AI Scribe', description: 'Listens to patient-physician dialogue and automatically drafts structured SOAP clinical notes with 98% medical nomenclature precision.', icon: 'Mic' },
        { title: 'FHIR / HL7 Interoperability Engine', description: 'Bi-directional sync with Epic, Cerner, and AthenaHealth hospital records.', icon: 'GitPullRequest' },
        { title: 'E-Prescription & Pharmacy Dispatch', description: 'Direct transmission of prescription orders to national pharmacy networks with automated allergy warning alerts.', icon: 'FileText' }
      ],
      workflows: [
        { step_number: 1, title: 'Patient Triage & Smart Scheduling', description: 'Patient selects symptoms, verifies insurance eligibility, and enters virtual waiting room.', actor: 'Patient Portal', icon: 'UserCheck' },
        { step_number: 2, title: 'Encrypted Telehealth Consultation', description: 'Physician and patient connect via HIPAA-audited WebRTC session with real-time vitals overlay.', actor: 'Video Gateway', icon: 'PhoneCall' },
        { step_number: 3, title: 'Real-time Ambient Transcription', description: 'Speech-to-text models parse clinical terms and organize notes into Subjective, Objective, Assessment, Plan.', actor: 'AI Medical Scribe', icon: 'Cpu' },
        { step_number: 4, title: 'Physician Review & Prescription Dispatch', description: 'Doctor reviews generated notes, clicks single-approval for e-prescriptions, and commits to hospital EHR.', actor: 'Attending Physician', icon: 'CheckCircle' }
      ],
      results: [
        { metric_label: 'Physician Charting Time', metric_value: '-52%', description: 'Reduction in after-hours administrative documentation time.' },
        { metric_label: 'Patient Consultations', metric_value: '180,000+', description: 'Successfully conducted across 38 regional hospital systems.' },
        { metric_label: 'Appointment No-Show Rate', metric_value: '4.1%', description: 'Down from 28.4% before the platform implementation.' }
      ],
      media: [
        { media_type: 'image', url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1200&auto=format&fit=crop&q=80', caption: 'Physician Video Consultation & Live EHR HUD' },
        { media_type: 'image', url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1200&auto=format&fit=crop&q=80', caption: 'Patient Telehealth Portal & Medical History' }
      ],
      links: []
    },
    {
      id: 4,
      name: 'FinFlow Real-Time Ledger & Settlement Engine',
      slug: 'finflow-real-time-ledger-settlement',
      category_id: 4,
      client_name: 'Aetheria Capital Partners',
      status: 'Completed',
      is_featured: 1,
      is_published: 1,
      priority: 4,
      start_date: '2024-02-10',
      completion_date: '2024-12-20',
      cover_image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
      short_description: 'Distributed immutable double-entry core banking ledger capable of processing 120,000 transactions per second with sub-millisecond ACID finality.',
      full_description: 'FinFlow is a mission-critical financial accounting and instant payment settlement engine engineered in Rust and Apache Kafka. It guarantees mathematically verifiable immutable double-entry bookkeeping, multi-currency foreign exchange revaluation, and instant SEPA/FedNow settlement rails for global neobanks and trading firms.',
      purpose: 'To provide banks and high-volume payment processors with zero-loss transaction consistency, instant auditability, and sub-second settlement.',
      what_it_does: 'Ingests transaction events, verifies cryptographic balance constraints, updates twin ledger accounts atomically, and triggers settlement webhooks while preventing race conditions or balance overdrafts under heavy concurrency.',
      problems_solved: 'Legacy mainframe core banking systems suffered from batch settlement delays of 24-48 hours, high maintenance costs, and vulnerability to concurrency double-spending during peak shopping events.',
      tech_ids: [1, 3, 8, 9, 10, 16, 18],
      features: [
        { title: 'Strict Double-Entry Invariance', description: 'Zero-balance sum invariants enforced at database kernel level, preventing fractional cent discrepancies.', icon: 'CheckSquare' },
        { title: 'Sub-Millisecond Kafka Streaming', description: 'Processes 120,000 transactions per second with p99 latency under 2.8 milliseconds.', icon: 'Zap' },
        { title: 'Automated FX Revaluation Engine', description: 'Instant multi-currency exchange rate adjustments supporting 48 global fiat currencies and gold parity.', icon: 'DollarSign' },
        { title: 'Continuous Cryptographic Audit Tree', description: 'Merkle tree ledger integrity validation allowing auditors to verify entire banking history in seconds.', icon: 'Shield' }
      ],
      workflows: [
        { step_number: 1, title: 'Payment Request Authorization', description: 'REST / gRPC request received with cryptographic idempotency key and signed payload.', actor: 'API Gateway', icon: 'Key' },
        { step_number: 2, title: 'Kafka Partition Stream Ingestion', description: 'Transactions are ordered deterministically across sharded account partitions.', actor: 'Kafka Cluster', icon: 'Activity' },
        { step_number: 3, title: 'Atomic Double-Entry Posting', description: 'Rust engine posts matching debit and credit journal entries in memory with WAL backup.', actor: 'Ledger Kernel', icon: 'Database' },
        { step_number: 4, title: 'Interbank Settlement Dispatch', description: 'Finalized settlement payloads are transmitted to FedNow, SEPA Instant, or SWIFT network rails.', actor: 'Payment Rail Worker', icon: 'Send' }
      ],
      results: [
        { metric_label: 'Monthly Volume Processed', metric_value: '$4.2B+', description: 'Processed seamlessly across 18 banking enterprise clients without a single outage.' },
        { metric_label: 'p99 Settlement Latency', metric_value: '2.8 ms', description: 'End-to-end ledger commit time achieved under maximum stress loads.' },
        { metric_label: 'Ledger Discrepancies', metric_value: '0.00%', description: 'Zero discrepancies across 1.4 billion ledger transactions audited.' }
      ],
      media: [
        { media_type: 'image', url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80', caption: 'Real-Time Financial Flow & Settlement Dashboard' },
        { media_type: 'image', url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&auto=format&fit=crop&q=80', caption: 'Cryptographic Merkle Audit Ledger Tree' }
      ],
      links: []
    },
    {
      id: 5,
      name: 'Nexus Smart Logistics & Fleet IoT Hub',
      slug: 'nexus-smart-logistics-fleet-iot',
      category_id: 6,
      client_name: 'TransContinental Freight Logistics',
      status: 'Ongoing',
      is_featured: 0,
      is_published: 1,
      priority: 5,
      start_date: '2025-05-10',
      completion_date: '2026-08-30',
      cover_image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
      short_description: 'Real-time GPS telematics, cold-chain temperature monitoring, and AI predictive maintenance platform for commercial freight fleets.',
      full_description: 'Nexus connects thousands of commercial freight trucks, refrigerated shipping containers, and warehouse hubs into a unified IoT telematics system. It streams GPS coordinates, tire pressures, engine diagnostics, and cold-chain temperature levels to optimize fuel routes and prevent perishable cargo spoilage.',
      purpose: 'To provide commercial shipping fleets with real-time operational visibility, prevent mechanical roadside breakdowns, and guarantee cargo freshness.',
      what_it_does: 'Aggregates vehicle CAN-bus data and IoT sensors, visualizes truck locations on live maps, generates geofence alerts for warehouse arrivals, and alerts dispatchers when temperature thresholds deviate.',
      problems_solved: 'Refrigerated food and pharmaceutical shipments faced up to 8% spoilages due to undetected refrigeration failures. Fleet operators had high fuel waste from suboptimal routing and idling.',
      tech_ids: [1, 3, 4, 5, 9, 10, 15, 17],
      features: [
        { title: 'Live Fleet GPS Telematics Map', description: 'Tracks vehicle positions, speed, traffic congestion, and projected ETAs with 1-second refresh rates.', icon: 'MapPin' },
        { title: 'Cold-Chain IoT Sensor Alerting', description: 'Monitors container temperatures with ±0.1°C precision and alerts drivers instantly if cooling fails.', icon: 'Thermometer' },
        { title: 'Predictive Engine Fault Diagnostics', description: 'Analyzes engine vibration and fault codes to schedule workshop maintenance before roadside breakdown occurs.', icon: 'Wrench' },
        { title: 'Automated Geofence Dispatch', description: 'Triggers warehouse loading bay assignments automatically as trucks approach within 2 kilometers.', icon: 'Navigation' }
      ],
      workflows: [
        { step_number: 1, title: 'OBD-II & Sensor Data Broadcast', description: 'Edge device transmits GPS, fuel level, and cargo sensors over cellular 5G.', actor: 'Truck IoT Hardware', icon: 'Radio' },
        { step_number: 2, title: 'Stream Ingestion & Rules Engine', description: 'Telematics gateway parses 100k events/sec and tests against anomaly thresholds.', actor: 'IoT Broker', icon: 'Server' },
        { step_number: 3, title: 'Live Map Dashboard Broadcast', description: 'WebSockets push real-time position updates to fleet operations command center.', actor: 'Real-Time Gateway', icon: 'Activity' },
        { step_number: 4, title: 'Driver Mobile Notification', description: 'Drivers receive optimized route diversions and delivery check-in barcodes.', actor: 'Driver Mobile App', icon: 'Smartphone' }
      ],
      results: [
        { metric_label: 'Fuel Consumption Cut', metric_value: '18.4%', description: 'Achieved through AI dynamic route guidance and idle-time reduction.' },
        { metric_label: 'Perishable Cargo Spoilage', metric_value: '< 0.1%', description: 'Virtually eliminated refrigerated cargo loss across 8,500 monthly shipments.' },
        { metric_label: 'Active Vehicles Connected', metric_value: '12,400+', description: 'Monitored 24/7 across continental North America and Europe.' }
      ],
      media: [
        { media_type: 'image', url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1200&auto=format&fit=crop&q=80', caption: 'Fleet Dispatcher Live Map & Vehicle Telematics HUD' }
      ],
      links: []
    },
    {
      id: 6,
      name: 'CyberShield Zero-Trust IAM & Threat Guardian',
      slug: 'cybershield-zero-trust-iam',
      category_id: 7,
      client_name: 'Fortress Defense Systems',
      status: 'Completed',
      is_featured: 0,
      is_published: 1,
      priority: 6,
      start_date: '2024-05-15',
      completion_date: '2025-01-20',
      cover_image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
      short_description: 'Continuous biometric & behavioral authentication engine with automated threat isolation and zero-trust perimeter enforcement.',
      full_description: 'CyberShield is an enterprise identity governance and adaptive authentication platform. It replaces static perimeter passwords with continuous behavioral trust scoring, analyzing keystroke dynamics, device posture, and IP geovelocity to thwart credential stuffing and insider threats.',
      purpose: 'To secure modern distributed enterprise workforces with frictionless, context-aware identity verification without impeding employee productivity.',
      what_it_does: 'Monitors active sessions, evaluates risk factors in real time, requests biometric passkey step-up authentication when anomalies occur, and instantly revokes compromised OAuth tokens.',
      problems_solved: 'Traditional static passwords and periodic MFA left enterprises vulnerable to session hijacking, SIM swapping, and compromised VPN credentials.',
      tech_ids: [1, 3, 6, 8, 9, 10, 13],
      features: [
        { title: 'Continuous Risk & Trust Scoring', description: 'Calculates user risk score (0-100) dynamically using machine learning analysis of typing rhythm and navigation patterns.', icon: 'Shield' },
        { title: 'FIDO2 / WebAuthn Biometric Auth', description: 'Passwordless login using Apple TouchID, Windows Hello, and YubiKeys for phishing-resistant security.', icon: 'Key' },
        { title: 'Automated Session Killswitch', description: 'Instantly invalidates enterprise SSO sessions across Google Workspace, Slack, and AWS upon detecting impossible travel.', icon: 'Zap' },
        { title: 'SIEM & SOC Audit Dashboard', description: 'Exports structured CEF security events directly to Splunk, Datadog, and Microsoft Sentinel.', icon: 'FileText' }
      ],
      workflows: [
        { step_number: 1, title: 'Context & Device Health Evaluation', description: 'Browser and OS posture evaluated for encryption status and known CVE vulnerabilities.', actor: 'Client Agent', icon: 'ShieldCheck' },
        { step_number: 2, title: 'Risk Engine Inference', description: 'Evaluates geovelocity, IP reputation, and behavioral biometric vectors.', actor: 'Neural Risk Model', icon: 'Cpu' },
        { step_number: 3, title: 'Adaptive Authorization Policy', description: 'Low risk grants seamless access; medium risk requires FIDO2 biometric step-up; high risk blocks session.', actor: 'Policy Decision Point', icon: 'Lock' },
        { step_number: 4, title: 'Continuous Token Re-Verification', description: 'Session tokens are refreshed every 120 seconds with cryptographic proof of work.', actor: 'Token Gateway', icon: 'RefreshCw' }
      ],
      results: [
        { metric_label: 'Phishing Attacks Blocked', metric_value: '100%', description: 'Zero successful credential phishing compromises across 45,000 enrolled enterprise seats.' },
        { metric_label: 'Help Desk Password Tickets', metric_value: '-82%', description: 'Drastic reduction in IT support costs due to passwordless biometric rollout.' },
        { metric_label: 'Mean Time to Threat Containment', metric_value: '< 400ms', description: 'Automated token revocation speed upon impossible travel detection.' }
      ],
      media: [
        { media_type: 'image', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80', caption: 'Zero-Trust Policy Matrix & Live Incident HUD' }
      ],
      links: []
    },
    {
      id: 7,
      name: 'OmniCommerce Headless Retail Engine',
      slug: 'omnicommerce-headless-retail-engine',
      category_id: 8,
      client_name: 'Moda Luxe Fashion Group',
      status: 'Completed',
      is_featured: 0,
      is_published: 1,
      priority: 7,
      start_date: '2024-08-01',
      completion_date: '2025-02-28',
      cover_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
      short_description: 'Ultra-fast global headless e-commerce storefront with serverless checkout, dynamic inventory synchronization, and sub-second page rendering.',
      full_description: 'OmniCommerce powers high-growth luxury retail brands with a modular, API-first shopping architecture. Utilizing Next.js edge rendering, GraphQL data federation, and Stripe payments, it delivers lightning-fast product discovery and seamless checkout across web, mobile apps, and in-store smart kiosks.',
      purpose: 'To deliver flawless shopping performance under intense Black Friday peak traffic while unifying online and physical retail inventories.',
      what_it_does: 'Provides customer-facing storefronts with instant filtering, real-time localized currency pricing, instant cart checkout, and synchronizes warehouse inventory counts within 10 milliseconds.',
      problems_solved: 'Slow monolithic legacy commerce platforms caused cart abandonment rates above 72% on mobile devices, and stock discrepancies resulted in backorder cancellations.',
      tech_ids: [1, 2, 3, 4, 9, 10, 14, 15],
      features: [
        { title: 'Global Edge Page Rendering', description: 'Product pages render at edge nodes in under 200ms worldwide for peak SEO and conversion rates.', icon: 'Zap' },
        { title: 'One-Click Universal Checkout', description: 'Stripe, Apple Pay, Google Pay, and Klarna integrated into an frictionless single-step sheet.', icon: 'CreditCard' },
        { title: 'Real-Time Inventory Reservation', description: 'Redis lock manager reserves checkout items for 10 minutes to prevent overselling limited drops.', icon: 'CheckCircle' },
        { title: 'Personalized AI Product Recommendations', description: 'Vector recommendation engine suggests complementary outfits, increasing average order value.', icon: 'Sparkles' }
      ],
      workflows: [
        { step_number: 1, title: 'Instant Edge Catalog Delivery', description: 'Product catalog statically pre-rendered and hydrated via CDN edge nodes.', actor: 'Edge CDN', icon: 'Globe' },
        { step_number: 2, title: 'Cart Item Reservation', description: 'User clicks checkout and inventory is locked in Redis with distributed atomic mutex.', actor: 'Inventory Service', icon: 'Lock' },
        { step_number: 3, title: 'Payment Tokenization & Capture', description: 'Secure payment token processed via Stripe with 3D-Secure 2.0 authentication.', actor: 'Payment Gateway', icon: 'CreditCard' },
        { step_number: 4, title: 'ERP & Fulfillment Dispatch', description: 'Order payload dispatched to warehouse robotics and customer receives SMS tracking link.', actor: 'Warehouse Router', icon: 'Truck' }
      ],
      results: [
        { metric_label: 'Mobile Conversion Rate', metric_value: '+64%', description: 'Increase in checkout completions within 90 days of headless migration.' },
        { metric_label: 'Black Friday Peak Load', metric_value: '45k req/s', description: 'Zero downtime and zero dropped orders during peak annual shopping event.' },
        { metric_label: 'Average Page Load Time', metric_value: '380 ms', description: 'Across all global regional shopper access points.' }
      ],
      media: [
        { media_type: 'image', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80', caption: 'Headless Storefront & Real-Time Sales Metrics' }
      ],
      links: []
    },
    {
      id: 8,
      name: 'GreenGrid AI Renewable Microgrid Optimizer',
      slug: 'greengrid-ai-renewable-microgrid',
      category_id: 3,
      client_name: 'Solaria Clean Power Consortium',
      status: 'Upcoming',
      is_featured: 1,
      is_published: 1,
      priority: 8,
      start_date: '2025-08-01',
      completion_date: '2026-06-30',
      cover_image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&auto=format&fit=crop&q=80',
      short_description: 'Predictive energy generation forecasting and battery storage dispatch algorithm for commercial smart buildings and solar microgrids.',
      full_description: 'GreenGrid applies deep reinforcement learning to weather forecasting, electricity spot prices, and commercial building HVAC usage. It autonomously schedules battery storage charge and discharge cycles to minimize grid electricity costs and carbon emissions.',
      purpose: 'To accelerate corporate net-zero carbon goals by maximizing on-site solar self-consumption and avoiding utility peak demand charges.',
      what_it_does: 'Forecasts solar photovoltaic generation 48 hours in advance, models building thermal inertia, and commands smart inverters and battery banks to charge during low-cost periods and discharge during peak tariff hours.',
      problems_solved: 'Commercial real estate owners were losing up to 35% of solar power value due to unoptimized grid export tariffs and high demand surge penalties.',
      tech_ids: [1, 3, 6, 7, 9, 11, 13],
      features: [
        { title: 'Neural Solar Generation Forecast', description: 'Integrates NOAA satellite cloud cover models to predict solar panel yields with 94% precision.', icon: 'Sun' },
        { title: 'Dynamic Tariff Arbitrage', description: 'Automates battery charging when spot prices are low/negative and discharges during expensive peak windows.', icon: 'TrendingDown' },
        { title: 'ESG Carbon Audit Reporting', description: 'Generates automated GHG Protocol Scope 1 and Scope 2 compliance certificates for investors.', icon: 'Award' },
        { title: 'EV Fleet Smart Charging Balancer', description: 'Distributes microgrid energy dynamically to EV charging stalls without exceeding site transformer limits.', icon: 'Zap' }
      ],
      workflows: [
        { step_number: 1, title: 'Satellite & Weather Feed Ingestion', description: 'Cloud radiance and weather telemetry ingested every 15 minutes.', actor: 'Data Pipeline', icon: 'CloudSun' },
        { step_number: 2, title: 'Reinforcement Learning Optimization', description: 'Optimizer calculates 24-hour cost-minimized energy dispatch plan.', actor: 'RL Dispatch Core', icon: 'Cpu' },
        { step_number: 3, title: 'Modbus & Inverter Command Dispatch', description: 'Control commands dispatched to on-site inverters and battery BMS.', actor: 'Edge Controller', icon: 'Sliders' },
        { step_number: 4, title: 'Carbon & Financial Ledger Auditing', description: 'Cost savings and avoided CO2 tons recorded to sustainability dashboard.', actor: 'ESG Ledger', icon: 'BarChart' }
      ],
      results: [
        { metric_label: 'Target Peak Cost Reduction', metric_value: '32%', description: 'Projected reduction in utility demand surcharges for commercial office parks.' },
        { metric_label: 'Solar Self-Consumption', metric_value: '91%', description: 'Up from 58% baseline by utilizing intelligent battery buffering.' },
        { metric_label: 'Annual CO2 Offset Goal', metric_value: '4,200 Tons', description: 'Estimated emissions prevented across initial 10 microgrid pilot installations.' }
      ],
      media: [
        { media_type: 'image', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200&auto=format&fit=crop&q=80', caption: 'Microgrid Battery Dispatch & Solar Telemetry View' }
      ],
      links: []
    }
  ];

  projectsData.forEach(p => {
    const { tech_ids, features, workflows, results, media, links, ...projectBase } = p;
    const insertedProject = db.insert('projects', projectBase);

    // Tech relations
    if (tech_ids && tech_ids.length) {
      tech_ids.forEach(tid => {
        db.insert('project_technologies', {
          project_id: insertedProject.id,
          technology_id: tid
        });
      });
    }

    // Features
    if (features) {
      features.forEach((feat, idx) => {
        db.insert('project_features', {
          project_id: insertedProject.id,
          title: feat.title,
          description: feat.description,
          icon: feat.icon,
          display_order: idx + 1
        });
      });
    }

    // Workflows
    if (workflows) {
      workflows.forEach((wf, idx) => {
        db.insert('project_workflows', {
          project_id: insertedProject.id,
          step_number: wf.step_number,
          title: wf.title,
          description: wf.description,
          actor: wf.actor,
          icon: wf.icon,
          display_order: idx + 1
        });
      });
    }

    // Results
    if (results) {
      results.forEach((res, idx) => {
        db.insert('project_results', {
          project_id: insertedProject.id,
          metric_label: res.metric_label,
          metric_value: res.metric_value,
          description: res.description,
          display_order: idx + 1
        });
      });
    }

    // Media
    if (media) {
      media.forEach((m, idx) => {
        db.insert('project_media', {
          project_id: insertedProject.id,
          media_type: m.media_type,
          url: m.url,
          caption: m.caption,
          display_order: idx + 1
        });
      });
    }

    // Links
    if (links) {
      links.forEach((l, idx) => {
        db.insert('project_links', {
          project_id: insertedProject.id,
          link_type: l.link_type,
          url: l.url,
          label: l.label,
          display_order: idx + 1
        });
      });
    }
  });

  // 5. Services
  const services = [
    {
      id: 1,
      name: 'Custom Software & Enterprise Development',
      slug: 'software-development',
      icon: 'Code2',
      short_description: 'Scalable, resilient distributed software architectures designed for high-concurrency enterprise needs.',
      full_description: 'We engineer bespoke software systems tailored to your unique operational workflows. From high-throughput transactional backends to mission-critical distributed architectures, our team ensures maximum uptime, strict security compliance, and seamless legacy modernization.',
      features_json: JSON.stringify([
        'Custom Microservices & API Architecture',
        'Legacy Modernization & Cloud Migration',
        'High-Concurrency Distributed Systems',
        'Enterprise Security & RBAC Integration'
      ]),
      methodology_json: JSON.stringify([
        { step: 1, title: 'Discovery & System Blueprinting', description: 'In-depth architecture analysis and domain-driven design modeling.' },
        { step: 2, title: 'Iterative Agile Development', description: 'Bi-weekly sprint releases with continuous code quality checks and automated tests.' },
        { step: 3, title: 'Hardening & Performance Testing', description: 'Load testing, vulnerability scans, and disaster recovery simulation.' },
        { step: 4, title: 'Production Deployment & SLA Support', description: 'Zero-downtime release with 24/7 telemetry monitoring and dedicated support.' }
      ]),
      display_order: 1,
      is_active: 1
    },
    {
      id: 2,
      name: 'Web & Cloud Platform Engineering',
      slug: 'web-cloud-development',
      icon: 'Globe',
      short_description: 'Modern, blazing-fast web applications, portals, and cloud infrastructure engineered for global scale.',
      full_description: 'We build responsive, state-of-the-art web portals and cloud-native solutions using React, Next.js, and TypeScript. Our web applications feature sub-second load times, accessible design, and rock-solid cloud deployments across AWS and GCP.',
      features_json: JSON.stringify([
        'Serverless & Edge-Rendered Web Applications',
        'Multi-tenant Customer Portals & Dashboards',
        'Headless CMS & Content Systems',
        'Progressive Web Apps (PWA) & Offline Sync'
      ]),
      methodology_json: JSON.stringify([
        { step: 1, title: 'UX Wireframing & Design Systems', description: 'Creating pixel-perfect Figma components and interactive prototypes.' },
        { step: 2, title: 'Frontend Component Architecture', description: 'Building modular, testable React components with accessibility standards.' },
        { step: 3, title: 'Edge CDN & Cache Optimization', description: 'Fine-tuning caching strategies, bundle sizes, and Core Web Vitals.' },
        { step: 4, title: 'CI/CD Automated Deployment', description: 'Automating multi-environment pipelines and automated smoke testing.' }
      ]),
      display_order: 2,
      is_active: 1
    },
    {
      id: 3,
      name: 'AI, Machine Learning & Data Engineering',
      slug: 'ai-machine-learning',
      icon: 'Sparkles',
      short_description: 'Production-ready generative AI, RAG pipelines, predictive analytics, and streaming data engineering.',
      full_description: 'Harness the transformative power of artificial intelligence. We build custom RAG (Retrieval-Augmented Generation) knowledge engines, computer vision pipelines, predictive time-series models, and real-time Kafka data streams to automate complex enterprise decisions.',
      features_json: JSON.stringify([
        'Enterprise RAG & Neural Document Intelligence',
        'Predictive Analytics & Forecasting Models',
        'Real-time Event Streaming & Data Lakes',
        'Model Fine-Tuning & Quantization'
      ]),
      methodology_json: JSON.stringify([
        { step: 1, title: 'Data Audit & Feasibility Study', description: 'Assessing dataset quality, schema distributions, and training viability.' },
        { step: 2, title: 'Model Prototyping & Validation', description: 'Iterating on embeddings, prompts, neural architectures, and F1 benchmarks.' },
        { step: 3, title: 'MLOps Pipeline Deployment', description: 'Packaging models with Triton/TensorRT and auto-scaling GPU workers.' },
        { step: 4, title: 'Continuous Drift Monitoring', description: 'Monitoring accuracy metrics, input drift, and automated retraining pipelines.' }
      ]),
      display_order: 3,
      is_active: 1
    },
    {
      id: 4,
      name: 'Mobile Application Development',
      slug: 'mobile-app-development',
      icon: 'Smartphone',
      short_description: 'Native and cross-platform mobile apps for iOS and Android with offline-first capabilities.',
      full_description: 'Deliver rich, fluid mobile experiences to your customers and field teams. We design and develop cross-platform React Native and native mobile applications with biometric authentication, background push notifications, and offline data synchronization.',
      features_json: JSON.stringify([
        'iOS & Android Cross-Platform Apps',
        'Offline-First Local SQLite Database Sync',
        'Hardware Sensor & Bluetooth BLE Interfacing',
        'App Store & Google Play Submission Management'
      ]),
      methodology_json: JSON.stringify([
        { step: 1, title: 'Mobile UX & Interaction Design', description: 'Crafting native ergonomic touch flows and fluid transitions.' },
        { step: 2, title: 'Core App Engineering', description: 'Implementing state management, API synchronization, and local storage.' },
        { step: 3, title: 'Cross-Device QA & Emulation', description: 'Automated UI testing across dozens of screen sizes and OS versions.' },
        { step: 4, title: 'Store Release & Crashlytics Monitoring', description: 'Seamless store publishing and live crash diagnostic telemetry.' }
      ]),
      display_order: 4,
      is_active: 1
    },
    {
      id: 5,
      name: 'UI/UX Product Design & Design Systems',
      slug: 'ui-ux-design',
      icon: 'Layout',
      short_description: 'Human-centered product design, design tokens, interactive prototypes, and usability testing.',
      full_description: 'Transform complex workflows into clean, intuitive digital experiences. Our design practice builds comprehensive design systems, interactive Figma prototypes, and conducts deep usability testing to ensure high user adoption and engagement.',
      features_json: JSON.stringify([
        'Comprehensive Component Design Systems',
        'Interactive High-Fidelity Prototypes',
        'User Journey Mapping & Usability Testing',
        'Accessibility (WCAG 2.1 AA) Compliance'
      ]),
      methodology_json: JSON.stringify([
        { step: 1, title: 'User Research & Personas', description: 'Conducting stakeholder interviews and mapping user pain points.' },
        { step: 2, title: 'Information Architecture & Wireframes', description: 'Structuring user flows and low-fidelity interface blueprints.' },
        { step: 3, title: 'Visual UI Design & Tokenization', description: 'Applying modern typography, dark/light themes, and design tokens.' },
        { step: 4, title: 'Developer Handoff & QA Audits', description: 'Delivering precise design specifications and validating frontend parity.' }
      ]),
      display_order: 5,
      is_active: 1
    },
    {
      id: 6,
      name: 'DevOps, Cloud & Cyber Security Architecture',
      slug: 'devops-cloud-security',
      icon: 'Shield',
      short_description: 'Kubernetes orchestration, Infrastructure as Code, CI/CD automation, and zero-trust security audits.',
      full_description: 'Build an indestructible cloud foundation. We modernize infrastructure using Terraform, Kubernetes, and automated CI/CD pipelines while establishing zero-trust IAM governance, automated vulnerability scanning, and disaster recovery runbooks.',
      features_json: JSON.stringify([
        'Terraform & CloudFormation Infrastructure as Code',
        'Kubernetes Cluster Architecture & GitOps',
        'Automated CI/CD Deployment Pipelines',
        'SOC-2, HIPAA & ISO-27001 Security Hardening'
      ]),
      methodology_json: JSON.stringify([
        { step: 1, title: 'Infrastructure & Security Assessment', description: 'Auditing cloud configurations, network boundaries, and cost leaks.' },
        { step: 2, title: 'IaC & Container Standardization', description: 'Codifying all resources into version-controlled Terraform modules.' },
        { step: 3, title: 'GitOps Pipeline Implementation', description: 'Setting up automated testing, vulnerability scanning, and deploy hooks.' },
        { step: 4, title: 'Disaster Recovery & Chaos Testing', description: 'Validating automated failover and continuous backup procedures.' }
      ]),
      display_order: 6,
      is_active: 1
    }
  ];
  services.forEach(svc => db.insert('services', svc));

  // 6. Team Members
  const teamMembers = [
    {
      id: 1,
      name: 'Dr. Evelyn Vance',
      role: 'Chief Executive Officer & Founder',
      department: 'Executive Leadership',
      bio: 'Former VP of Technology at CloudMatrix with 18+ years leading enterprise digital transformation and distributed systems engineering.',
      avatar: '/avatars/avatar_ceo.jpg',
      email: 'evelyn.vance@nexora.io',
      linkedin_url: 'https://linkedin.com',
      github_url: 'https://github.com',
      display_order: 1,
      is_leadership: 1
    },
    {
      id: 2,
      name: 'Alexander Wright',
      role: 'Chief Technology Officer',
      department: 'Engineering',
      bio: 'Pioneered AI vector search and high-throughput financial architectures. Open source contributor and distributed systems architect.',
      avatar: '/avatars/avatar_cto.jpg',
      email: 'alexander.wright@nexora.io',
      linkedin_url: 'https://linkedin.com',
      github_url: 'https://github.com',
      display_order: 2,
      is_leadership: 1
    },
    {
      id: 3,
      name: 'Marcus Chen',
      role: 'Head of Product & Delivery',
      department: 'Product Management',
      bio: 'Over a decade of experience guiding multi-million dollar SaaS and cloud platform deliveries for Fortune 500 enterprises.',
      avatar: '/avatars/avatar_pm.jpg',
      email: 'marcus.chen@nexora.io',
      linkedin_url: 'https://linkedin.com',
      github_url: 'https://github.com',
      display_order: 3,
      is_leadership: 1
    },
    {
      id: 4,
      name: 'Elena Rostova',
      role: 'VP of Cloud & DevOps',
      department: 'Engineering',
      bio: 'Kubernetes certified architect specializing in zero-downtime deployments, eBPF telemetry, and multi-region resilience.',
      avatar: '/avatars/avatar_devops.jpg',
      email: 'elena.rostova@nexora.io',
      linkedin_url: 'https://linkedin.com',
      github_url: 'https://github.com',
      display_order: 4,
      is_leadership: 1
    },
    {
      id: 5,
      name: 'Darius Thorne',
      role: 'Principal AI Research Scientist',
      department: 'Artificial Intelligence',
      bio: 'PhD in Machine Learning from Stanford. Specialized in large language model alignment, neural retrieval, and multimodal reasoning.',
      avatar: '/avatars/avatar_ai.jpg',
      email: 'darius.thorne@nexora.io',
      linkedin_url: 'https://linkedin.com',
      github_url: 'https://github.com',
      display_order: 5,
      is_leadership: 0
    },
    {
      id: 6,
      name: 'Maya Lin',
      role: 'Lead UI/UX Architect',
      department: 'Design',
      bio: 'Design systems specialist passionate about micro-interactions, accessible design tokens, and human-centered design for enterprise software.',
      avatar: '/avatars/avatar_design.jpg',
      email: 'maya.lin@nexora.io',
      linkedin_url: 'https://linkedin.com',
      github_url: 'https://github.com',
      display_order: 6,
      is_leadership: 0
    }
  ];
  teamMembers.forEach(tm => db.insert('team_members', tm));

  // 7. Testimonials
  const testimonials = [
    {
      id: 1,
      client_name: 'Jonathan Sterling',
      client_role: 'Chief Information Officer',
      client_company: 'Vanguard Global Analytics',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      content: 'Nexora Systems delivered the ApexCore platform on time and exceeded our most aggressive performance benchmarks. Their deep engineering expertise in AI RAG architectures transformed how 14,000 analysts retrieve corporate intelligence.',
      rating: 5,
      project_id: 1,
      is_featured: 1
    },
    {
      id: 2,
      client_name: 'Sarah Lindqvist',
      client_role: 'VP of Infrastructure',
      client_company: 'Helios Cloud Networks',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      content: 'The CloudMesh controller reduced our monthly AWS egress and compute bills by 42% while providing unparalleled visibility into our Kubernetes clusters. Nexora is our go-to partner for complex cloud engineering.',
      rating: 5,
      project_id: 2,
      is_featured: 1
    },
    {
      id: 3,
      client_name: 'Dr. Robert Callahan',
      client_role: 'Chief Medical Officer',
      client_company: 'BioVitality Health System',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      content: 'HealthSync solved our doctor charting burnout crisis. The ambient AI scribe is remarkably accurate, and our patient satisfaction scores increased by 38% within three months of deployment.',
      rating: 5,
      project_id: 3,
      is_featured: 1
    },
    {
      id: 4,
      client_name: 'Camilla Valente',
      client_role: 'Head of Core Banking',
      client_company: 'Aetheria Capital Partners',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      content: 'FinFlow gave us a bulletproof double-entry ledger that processes billions of dollars seamlessly without missing a beat. The mathematical consistency and audit trees made regulatory compliance effortless.',
      rating: 5,
      project_id: 4,
      is_featured: 1
    },
    {
      id: 5,
      client_name: 'Henrik Larsson',
      client_role: 'Chief Operating Officer',
      client_company: 'TransContinental Freight',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      content: 'The Nexus IoT telemetry platform saved us hundreds of thousands of dollars in perishable freight losses. Real-time temperature alerts and driver routing have made our fleet the most reliable in the region.',
      rating: 5,
      project_id: 5,
      is_featured: 1
    }
  ];
  testimonials.forEach(test => db.insert('testimonials', test));

  // 8. Blog Posts
  const blogs = [
    {
      id: 1,
      title: 'Architecting Zero-Hallucination Enterprise RAG Pipelines at Scale',
      slug: 'architecting-zero-hallucination-enterprise-rag',
      summary: 'A deep technical exploration into hybrid vector retrieval, deterministic source bounding, and semantic chunking strategies for enterprise documents.',
      content: `### Introduction\n\nEnterprise retrieval-augmented generation (RAG) is transitioning from experimental prototypes to mission-critical infrastructure. However, deploying RAG systems across millions of sensitive documents requires solving core challenges around hallucination mitigation, sub-second latency, and access-control synchronization.\n\n### The Multi-Stage Retrieval Architecture\n\nTo achieve deterministic accuracy, we implemented a four-tier retrieval pipeline:\n\n1. **Semantic Document Chunking**: Rather than arbitrary token splits, our parser identifies document headings, tables, and paragraphs to preserve semantic context.\n2. **Hybrid Dense + Sparse Indexing**: Combining 1536-dimensional neural embeddings with BM25 keyword indexes ensures exact SKU numbers and acronyms are never missed.\n3. **Cross-Encoder Reranking**: The top 50 candidates are re-evaluated through a precision cross-encoder model to surface the top 5 most relevant context passages.\n4. **Verifiable Citation Pinning**: The LLM output is constrained to return explicit sentence-level citation references matching original document coordinates.\n\n### Results & Takeaways\n\nBy enforcing citation validation at the inference layer, hallucinations were reduced to zero in legal and technical document question-answering benchmarks.`,
      cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      tags_json: JSON.stringify(['AI & ML', 'RAG', 'Vector Search', 'Architecture']),
      read_time: '6 min read',
      is_published: 1,
      published_at: '2025-11-15'
    },
    {
      id: 2,
      title: 'Why eBPF is Replacing Sidecar Proxies in Modern Kubernetes Service Meshes',
      slug: 'why-ebpf-is-replacing-sidecar-proxies',
      summary: 'How kernel-level eBPF probes eliminate proxy CPU overhead, reduce network hops, and provide instantaneous distributed tracing in microservices.',
      content: `### The Sidecar Tax\n\nFor years, microservice architectures relied on Envoy sidecar containers injected into every pod. While powerful, this introduced significant CPU/memory overhead and doubled socket latency with extra loopback hops.\n\n### The eBPF Breakthrough\n\nWith extended Berkeley Packet Filters (eBPF), network telemetry and security policies are evaluated directly inside the Linux kernel. This delivers:\n\n- **Zero Memory Injection**: No need to inject heavy proxy containers into application pods.\n- **Direct Socket Routing**: Packets are forwarded at the socket layer, bypassing TCP/IP stack overhead.\n- **Instant Distributed Tracing**: Microsecond latency histograms are captured without modifying application code or headers.\n\n### Engineering Recommendation\n\nFor high-throughput architectures processing over 50,000 requests/sec, transitioning to eBPF-based service mesh controllers yields immediate cost and latency reductions.`,
      cover_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      tags_json: JSON.stringify(['Kubernetes', 'DevOps', 'eBPF', 'Cloud']),
      read_time: '8 min read',
      is_published: 1,
      published_at: '2025-10-22'
    },
    {
      id: 3,
      title: 'Building High-Throughput Double-Entry Financial Ledgers in Rust & Kafka',
      slug: 'high-throughput-double-entry-ledgers-rust-kafka',
      summary: 'Key design patterns for mathematically verifiable financial accounting, distributed transaction locks, and sub-millisecond ACID commitments.',
      content: `### The Core Accounting Invariant\n\nIn double-entry bookkeeping, every transaction must consist of balanced debit and credit entries such that the sum of changes equals zero. In distributed microservices, ensuring this invariant under concurrent account updates is an immense challenge.\n\n### Partitioned Deterministic Ordering\n\nBy leveraging Kafka account-based partitioning, all transaction events affecting a specific balance are serialized deterministically. The Rust ledger engine applies these transactions in-memory with write-ahead logs (WAL) to ensure instant recovery.\n\n### Merkle Tree Proofs\n\nEach block of ledger entries generates a cryptographic Merkle root hash. This enables instant verification by external compliance auditors without exposing confidential account balances.`,
      cover_image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
      tags_json: JSON.stringify(['FinTech', 'Rust', 'Kafka', 'Databases']),
      read_time: '7 min read',
      is_published: 1,
      published_at: '2025-09-10'
    },
    {
      id: 4,
      title: 'The Future of Headless E-Commerce: Edge Runtimes and Instant Micro-Checkouts',
      slug: 'future-headless-ecommerce-edge-runtimes',
      summary: 'Exploring how sub-second edge compute, serverless checkout flows, and headless APIs are driving 60%+ conversions for modern retail brands.',
      content: `### Conversion is a Function of Milliseconds\n\nEvery 100ms of latency reduction on product pages translates directly to a 1% lift in e-commerce conversions. Modern consumers expect instantaneous page transitions and zero-friction checkouts.\n\n### Edge Hydration & Pre-Rendering\n\nBy pushing product data hydration to CDN edge nodes located within 20ms of users worldwide, initial page loads become virtually instant. Pairing this with headless payment SDKs like Apple Pay and Stripe Payment Request sheets creates an effortless shopping journey.`,
      cover_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
      tags_json: JSON.stringify(['E-Commerce', 'Frontend', 'Next.js', 'Performance']),
      read_time: '5 min read',
      is_published: 1,
      published_at: '2025-08-04'
    }
  ];
  blogs.forEach(b => db.insert('blog_posts', b));

  // 9. Contact Inquiries
  const inquiries = [
    {
      id: 1,
      full_name: 'Marcus Vance',
      email: 'm.vance@solaris-group.com',
      phone: '+1 (555) 349-2819',
      company: 'Solaris Global Media',
      subject_category: 'AI / RAG Platform Inquiry',
      message: 'We are looking to implement an internal document intelligence system similar to ApexCore AI for our 2,500 research analysts. We would like to schedule a technical architecture discussion and pilot demo.',
      status: 'New',
      notes: 'High-priority enterprise lead. Scheduled initial discovery call for next Tuesday.',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 2,
      full_name: 'Dr. Alistair Sterling',
      email: 'asterling@medlink-health.org',
      phone: '+1 (555) 782-9012',
      company: 'MedLink Regional Hospital Network',
      subject_category: 'HealthTech & Telehealth Solution',
      message: 'Interested in exploring HealthSync EHR integration for our 14 outpatient clinics across Oregon. Please send your HIPAA compliance documentation and integration guidelines.',
      status: 'In Progress',
      notes: 'Sent HIPAA whitepaper. Waiting on review from their security audit committee.',
      created_at: new Date(Date.now() - 3600000 * 28).toISOString()
    },
    {
      id: 3,
      full_name: 'Clara Dupont',
      email: 'c.dupont@fintech-ventures.eu',
      phone: '+33 1 42 68 55 00',
      company: 'DuPont Digital Capital',
      subject_category: 'FinTech Ledger Architecture',
      message: 'We are building a multi-currency SEPA instant settlement platform and were impressed with your FinFlow case study. Could we arrange a consultation regarding technical advisory services?',
      status: 'Resolved',
      notes: 'Proposal approved. SOW signed for technical advisory architecture.',
      created_at: new Date(Date.now() - 3600000 * 72).toISOString()
    }
  ];
  inquiries.forEach(inq => db.insert('contact_inquiries', inq));

  // 10. Website Settings
  db.setMultipleSettings({
    company_name: 'Technical Intelligence Directorate',
    logo_name: 'ITD',
    company_slogan: 'Pioneering the Next Era of Enterprise Computing',
    company_tagline: 'We architect, build, and scale mission-critical software, generative AI pipelines, and cloud platforms for forward-thinking organizations worldwide.',
    logo_url: '/logo.svg',
    founded_year: '2018',
    stats_projects_completed: '48+',
    stats_projects_ongoing: '12',
    stats_clients_served: '35+',
    stats_years_experience: '8+',
    stats_team_members: '60+',
    stats_client_satisfaction: '99.4%',
    primary_email: 'contact@insa.gov.et',
    support_email: 'contact@insa.gov.et',
    phone_number: '+251-0135685458',
    office_address: 'Addis Ababa, Ethiopia',
    business_hours: 'Monday – Friday: 8:30 AM – 5:30 PM (EAT)',
    twitter_url: 'https://twitter.com',
    linkedin_url: 'https://linkedin.com',
    github_url: 'https://github.com',
    youtube_url: 'https://youtube.com',
    mission_statement: 'To empower visionary global enterprises with resilient, human-centered software architectures, autonomous cloud infrastructure, and verifiable artificial intelligence.',
    vision_statement: 'To be the world’s most trusted technical partner for mission-critical software innovation, setting the global benchmark for architectural elegance, security, and measurable business impact.',
    services_section_title: 'Specialized Engineering Services',
    services_section_desc: 'Comprehensive, end-to-end technology solutions tailored for enterprises demanding deterministic performance, high availability, and measurable ROI.',
    projects_section_title: 'Engineering Showcase & Case Studies',
    projects_section_desc: 'Search and filter our complete catalog of enterprise platforms, AI models, Kubernetes meshes, and financial engines.',
    team_section_title: 'The Architects & Developers Behind ITD',
    team_section_desc: '',
    contact_cta_title: 'Let\'s Discuss Your Architecture',
    contact_cta_desc: 'Whether you require a dedicated AI vector intelligence platform, cloud modernization, or high-throughput ledgers, our team is ready to assist.',
    blog_badge_text: 'Research & Tech Insights',
    blog_section_title: 'Technical Perspectives & Architecture Whitepapers',
    blog_section_desc: 'Deep-dive analysis on real-world engineering challenges, vector retrieval, eBPF telemetry, and high-throughput financial ledgers.',
    core_values_json: JSON.stringify([
      { title: 'Architectural Excellence', description: 'We never compromise on code quality, mathematical precision, security boundaries, or system scalability.' },
      { title: 'Deterministic Integrity', description: 'We design software that is predictable, auditable, and transparent, avoiding black-box approximations in mission-critical workflows.' },
      { title: 'Radical Collaboration', description: 'We partner deeply with our clients engineering teams, functioning as an integrated elite extension of their technical leadership.' },
      { title: 'Continuous Innovation', description: 'We continuously adopt bleeding-edge breakthroughs in AI, eBPF, distributed ledgers, and edge computing to solve real-world problems.' }
    ]),
    seo_meta_title: 'Technical Intelligence Directorate — Enterprise Tech Solutions & Project Showcase',
    seo_meta_description: 'We architect, build, and scale mission-critical software, generative AI pipelines, and cloud platforms for forward-thinking organizations worldwide.'
  });

  // 11. Initial Activity Logs
  db.logActivity('System', 'System', 'Database Seeded', 'Database', 'Initial comprehensive enterprise dataset created');
  db.logActivity('Alexander Wright', 'Super Admin', 'Published Project', 'Project', 'ApexCore AI Intelligence Platform');
  db.logActivity('Elena Rostova', 'Administrator', 'Updated Service', 'Service', 'DevOps, Cloud & Cyber Security Architecture');

  // 12. Initial Security Audit Logs
  db.logSecurityEvent(1, 'Alexander Wright', 'superadmin@nexora.io', 'LOGIN_SUCCESS', 'info', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Super Admin logged in with 2FA verification.');
  db.logSecurityEvent(2, 'Elena Rostova', 'admin@nexora.io', 'LOGIN_SUCCESS', 'info', '192.168.1.105', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'Administrator session started.');
  db.logSecurityEvent(2, 'Elena Rostova', 'admin@nexora.io', 'PERMISSIONS_UPDATED', 'info', '192.168.1.105', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'Granted custom security audit permissions.');
  db.logSecurityEvent(null, 'Unknown User', 'unknown@external-scanner.org', 'LOGIN_FAILURE', 'warning', '45.33.32.156', 'Python-urllib/3.8', 'Failed login attempt: non-existent account.');
  db.logSecurityEvent(3, 'Marcus Chen', 'pm@nexora.io', 'LOGIN_SUCCESS', 'info', '192.168.1.112', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Project Manager logged in from internal VPN.');

  console.log('Database seeded successfully!');
}

