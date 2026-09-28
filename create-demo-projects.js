import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  port: 5432,
  database: 'itd_portfolio'
});

const demoProjects = [
  {
    name: 'Enterprise AI Pipeline',
    slug: 'enterprise-ai-pipeline',
    description: 'Advanced machine learning infrastructure for real-time data processing',
    short_description: 'ML-powered enterprise AI system with real-time processing',
    full_description: 'Developed a comprehensive enterprise AI pipeline capable of processing millions of data points in real-time. Integrated machine learning models for predictive analytics and automated decision-making.',
    status: 'Completed',
    is_published: 1,
    is_featured: 1,
    priority: 1,
    client_name: 'Tech Fortune 500',
    start_date: '2023-01-15',
    completion_date: '2023-09-20',
    cover_image: '/uploads/projects/ai-pipeline.jpg',
    category_id: 1,  // AI & Machine Learning
    created_by: 1788528184087001,
    purpose: 'Automate data processing and enable predictive analytics',
    what_it_does: 'Processes real-time data streams and generates insights using ML models',
    problems_solved: 'Reduced manual processing by 95%, improved accuracy to 99.2%',
    title_overview: 'Enterprise AI Infrastructure',
    title_solution: 'Smart Data Processing Pipeline',
    title_problems: 'Legacy System Limitations',
    title_features: 'Core Capabilities'
  },
  {
    name: 'Kubernetes Service Mesh',
    slug: 'kubernetes-mesh',
    description: 'Production-grade service mesh for microservices orchestration',
    short_description: 'Cloud-native service mesh with advanced traffic management',
    full_description: 'Implemented Istio-based service mesh managing 500+ microservices across 12 clusters. Enabled sophisticated traffic policies, security policies, and observability across the entire infrastructure.',
    status: 'Ongoing',
    is_published: 1,
    is_featured: 1,
    priority: 2,
    client_name: 'Global Tech Conglomerate',
    start_date: '2023-06-01',
    completion_date: null,
    cover_image: '/uploads/projects/k8s-mesh.jpg',
    category_id: 2,  // Cloud & DevOps
    created_by: 1788528184087001,
    purpose: 'Manage complex microservices deployments at scale',
    what_it_does: 'Provides service-to-service communication, security, and observability',
    problems_solved: 'Reduced deployment complexity, improved service reliability to 99.99%',
    title_overview: 'Production Service Mesh',
    title_solution: 'Microservices Orchestration',
    title_problems: 'Microservices Complexity',
    title_features: 'Mesh Capabilities'
  },
  {
    name: 'Financial Risk Engine',
    slug: 'financial-risk-engine',
    description: 'Real-time portfolio risk assessment and management system',
    short_description: 'Advanced risk calculation engine for financial portfolios',
    full_description: 'Built a sophisticated financial risk engine processing 10 trillion USD in assets daily. Implements advanced Monte Carlo simulations and VaR calculations with sub-millisecond latency.',
    status: 'Completed',
    is_published: 1,
    is_featured: 1,
    priority: 3,
    client_name: 'Investment Banking Leader',
    start_date: '2022-09-01',
    completion_date: '2023-08-15',
    cover_image: '/uploads/projects/finance-engine.jpg',
    category_id: 1787885076196,  // Distributed Systems
    created_by: 1788528184087002,
    purpose: 'Calculate portfolio risk metrics in real-time',
    what_it_does: 'Processes market data and generates risk reports',
    problems_solved: 'Risk calculation time reduced from 2 hours to 50ms',
    title_overview: 'Financial Risk Platform',
    title_solution: 'Real-time Risk Computation',
    title_problems: 'Legacy Risk Systems',
    title_features: 'Risk Calculation Features'
  },
  {
    name: 'IoT Device Management Platform',
    slug: 'iot-device-platform',
    description: 'Centralized management system for 100K+ connected IoT devices',
    short_description: 'Smart device management for connected ecosystems',
    full_description: 'Developed a comprehensive IoT platform managing over 100,000 connected devices across multiple deployment regions. Includes real-time monitoring, firmware updates, and predictive maintenance.',
    status: 'Ongoing',
    is_published: 1,
    is_featured: 0,
    priority: 4,
    client_name: 'Industrial IoT Company',
    start_date: '2023-03-10',
    completion_date: null,
    cover_image: '/uploads/projects/iot-platform.jpg',
    category_id: 1787838638086,  // TeleCom
    created_by: 1788528184087003,
    purpose: 'Manage and monitor large-scale IoT deployments',
    what_it_does: 'Provides device management, monitoring, and control capabilities',
    problems_solved: 'Reduced device management overhead by 70%',
    title_overview: 'IoT Management System',
    title_solution: 'Connected Device Platform',
    title_problems: 'Device Management Challenges',
    title_features: 'Management Features'
  },
  {
    name: 'Real-time Analytics Dashboard',
    slug: 'analytics-dashboard',
    description: 'Live analytics platform processing 1M+ events per second',
    short_description: 'High-performance analytics visualization platform',
    full_description: 'Created a real-time analytics dashboard capable of processing over 1 million events per second with sub-second latency. Used for business intelligence and operational insights.',
    status: 'Completed',
    is_published: 1,
    is_featured: 0,
    priority: 5,
    client_name: 'E-commerce Giant',
    start_date: '2023-02-01',
    completion_date: '2023-12-30',
    cover_image: '/uploads/projects/analytics-dash.jpg',
    category_id: 2,  // Cloud & DevOps
    created_by: 1788528184087004,
    purpose: 'Enable real-time business analytics',
    what_it_does: 'Aggregates, processes and visualizes event streams',
    problems_solved: 'Analysis time reduced from hours to real-time',
    title_overview: 'Real-time Analytics',
    title_solution: 'Event Stream Processing',
    title_problems: 'Data Analysis Delays',
    title_features: 'Analytics Capabilities'
  }
];

async function createDemoProjects() {
  try {
    console.log('Creating demo projects...\n');
    
    let baseId = Date.now();
    for (let i = 0; i < demoProjects.length; i++) {
      const project = demoProjects[i];
      const projectId = baseId + i;
      
      const result = await pool.query(
        `INSERT INTO projects (
          id, name, slug, description, short_description, full_description,
          status, is_published, is_featured, priority,
          client_name, start_date, completion_date, cover_image,
          category_id, created_by, purpose, what_it_does, problems_solved,
          title_overview, title_solution, title_problems, title_features,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10,
          $11, $12, $13, $14,
          $15, $16, $17, $18, $19,
          $20, $21, $22, $23,
          $24, $25
        ) RETURNING id, name`,
        [
          projectId, project.name, project.slug, project.description, project.short_description, project.full_description,
          project.status, project.is_published, project.is_featured, project.priority,
          project.client_name, project.start_date, project.completion_date, project.cover_image,
          project.category_id, project.created_by, project.purpose, project.what_it_does, project.problems_solved,
          project.title_overview, project.title_solution, project.title_problems, project.title_features,
          new Date().toISOString(), new Date().toISOString()
        ]
      );
      
      console.log(`✅ Created: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
    }
    
    console.log('\n📊 Demo projects created successfully!');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

createDemoProjects();
