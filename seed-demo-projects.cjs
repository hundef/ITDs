const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'itd_portfolio',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '12345678',
});

// Generate unique IDs for projects
function generateId() {
  return Math.floor(Math.random() * 1000000000);
}

const demoProjects = [
  {
    id: 1001,
    name: 'ApexCore AI Intelligence Platform',
    slug: 'apexcore-ai-intelligence-platform',
    category_id: 1,
    created_by: 1,
    client_name: 'Vanguard Global Analytics',
    status: 'Completed',
    is_featured: 1,
    is_published: 1,
    priority: 1,
    start_date: '2023-01-15',
    completion_date: '2023-09-30',
    cover_image: 'https://images.unsplash.com/photo-1677442d019cecf8f2d57osij?w=1200&h=600&fit=crop',
    short_description: 'Enterprise-grade multimodal RAG platform with semantic search across 20M+ documents, enabling sub-second latency and enterprise-grade security for Fortune 500 legal teams.',
    full_description: 'ApexCore AI Intelligence Platform is a next-generation multimodal enterprise retrieval-augmented generation (RAG) system. Built for Fortune 500 enterprises, it processes unstructured data from PDFs, images, and text files simultaneously. The platform handles 20M+ documents in production environments with 99.9% uptime SLA compliance.\n\nKey architectural innovations include:\n- Adaptive chunking strategies for optimal document processing\n- Hybrid vector embeddings combining semantic and lexical search\n- Distributed caching for zero-downtime deployments\n- Multi-region failover with automatic health checks\n- Enterprise-grade audit logging and compliance tracking',
    purpose: 'Transform enterprise document management and knowledge extraction with AI-powered semantic intelligence',
    what_it_does: 'ApexCore enables enterprise teams to:\n\n1. Query massive document collections with semantic intelligence\n   - Search 20M+ documents in under 1 second\n   - Understand context and meaning, not just keywords\n   - Get ranked results by relevance and confidence\n\n2. Extract structured insights automatically\n   - Summarize documents on-demand\n   - Generate answers to complex queries\n   - Identify patterns across your data\n\n3. Integrate seamlessly with existing systems\n   - REST API for any application\n   - Webhook support for real-time notifications\n   - Compatible with enterprise SSO/SAML\n\n4. Scale securely to any size\n   - Multi-region deployment support\n   - Horizontal autoscaling based on load\n   - End-to-end encryption at rest and in transit',
    problems_solved: `Legacy document management and search systems created significant operational challenges:\n\n1. Unacceptable Search Latency\n   - Traditional full-text search took 15-20+ minutes for complex queries\n   - Limited to exact keyword matches\n   - Users abandoned searches out of frustration\n\n2. Poor Understanding of Complex Documents\n   - Semantic meaning and context were completely lost\n   - Impossible to find related documents across domains\n   - Required manual review of thousands of results\n\n3. Data Silos Preventing Knowledge Sharing\n   - Teams couldn't access insights from other departments\n   - Knowledge duplication across the organization\n   - Difficult to maintain single source of truth\n\n4. Severe Scalability Limitations\n   - Adding new documents required hours of reindexing\n   - Performance degraded with database size\n   - Couldn't handle growth to 20M+ document scale\n\n5. Compliance and Audit Trail Gaps\n   - No audit logs for data access\n   - Difficult to prove compliance during security reviews\n   - Unable to restrict access by department or sensitivity level`,
    title_overview: 'What is this Project?',
    title_solution: 'What This Project Does',
    title_problems: 'What Problem Does It Solve?',
    title_features: 'Key Capabilities & Features'
  },
  {
    id: 1002,
    name: 'Kubernetes Cloud Migration Suite',
    slug: 'kubernetes-cloud-migration-suite',
    category_id: 2,
    created_by: 1,
    client_name: 'CloudTech Innovations Inc',
    status: 'Completed',
    is_featured: 1,
    is_published: 1,
    priority: 2,
    start_date: '2022-06-01',
    completion_date: '2023-04-15',
    cover_image: 'https://images.unsplash.com/photo-1633356122544-f134ef2944f7?w=1200&h=600&fit=crop',
    short_description: 'End-to-end Kubernetes orchestration platform enabling zero-downtime migration from legacy monolithic systems to cloud-native microservices architecture.',
    full_description: 'The Kubernetes Cloud Migration Suite is a comprehensive platform designed to seamlessly transition enterprise applications from traditional monolithic architectures to modern cloud-native deployments. This battle-tested solution has successfully migrated 40+ Fortune 500 applications with zero production downtime.\n\nArchitectural Highlights:\n- Containerization automation with intelligent dependency analysis\n- Progressive deployment strategies with canary and blue-green releases\n- Automatic service mesh integration for distributed tracing\n- Cost optimization engine reducing cloud spend by 40-60%\n- Self-healing infrastructure with automatic recovery policies',
    purpose: 'Accelerate enterprise digital transformation through intelligent containerization and cloud-native orchestration',
    what_it_does: 'The platform enables:\n\n1. Intelligent Application Analysis\n   - Automatically detect dependencies and service boundaries\n   - Identify optimization opportunities and potential bottlenecks\n   - Generate containerization recommendations\n\n2. Seamless Migration Execution\n   - Zero-downtime deployment strategies\n   - Automatic rollback capabilities\n   - Real-time monitoring and alerting\n\n3. Production Optimization\n   - Right-sizing recommendations based on actual usage\n   - Cost tracking and optimization\n   - Performance tuning automation',
    problems_solved: 'Legacy infrastructure created multiple challenges:\n\n1. Manual Migration Processes\n   - Migration projects took 12-18 months\n   - High risk of production incidents\n   - Significant engineering overhead\n\n2. Lack of Visibility\n   - No understanding of interdependencies\n   - Difficulty tracking deployment progress\n   - Complex rollback procedures\n\n3. Cost Inefficiencies\n   - Over-provisioned resources\n   - Unclear cloud spending patterns\n   - No automated optimization',
    title_overview: 'What is this Project?',
    title_solution: 'What This Project Does',
    title_problems: 'What Problem Does It Solve?',
    title_features: 'Platform Features'
  },
  {
    id: 1003,
    name: 'Real-Time Financial Analytics Engine',
    slug: 'real-time-financial-analytics-engine',
    category_id: 3,
    created_by: 1,
    client_name: 'Goldman Sachs Trading Division',
    status: 'Ongoing',
    is_featured: 1,
    is_published: 1,
    priority: 3,
    start_date: '2023-03-01',
    completion_date: null,
    cover_image: 'https://images.unsplash.com/photo-1642783265811-cc0bd4c5f7d0?w=1200&h=600&fit=crop',
    short_description: 'Sub-millisecond financial data processing engine handling 10M+ market events per second with 99.99% uptime SLA for algorithmic trading.',
    full_description: 'The Real-Time Financial Analytics Engine represents the cutting edge of high-frequency trading infrastructure. Engineered to process market data with microsecond latency while maintaining enterprise-grade reliability and regulatory compliance.\n\nTechnical Achievements:\n- Processes 10 million market events per second\n- Sub-millisecond end-to-end latency (<500 microseconds)\n- 99.99% uptime with automatic failover\n- Real-time pattern recognition using ML models\n- Complete audit trail for regulatory compliance',
    purpose: 'Provide competitive advantage through ultra-low latency market data processing and analysis',
    what_it_does: 'The engine delivers:\n\n1. Real-Time Market Data Processing\n   - Stream 10M+ events per second\n   - Sub-millisecond latency guarantees\n   - Automatic data validation and enrichment\n\n2. Pattern Recognition & Alerts\n   - ML-based anomaly detection\n   - Customizable alert thresholds\n   - Historical pattern matching\n\n3. Risk Management\n   - Real-time portfolio exposure calculation\n   - Automated risk limit enforcement\n   - Regulatory reporting automation',
    problems_solved: 'Traditional analytics systems had critical limitations:\n\n1. Latency Issues\n   - Message processing delays cost millions per second\n   - Missed trading opportunities\n   - Regulatory violations from slow reporting\n\n2. System Reliability\n   - Single points of failure\n   - Complex manual recovery procedures\n   - Unplanned downtime impacting operations\n\n3. Compliance Challenges\n   - Difficult to prove audit trail\n   - Manual compliance reporting\n   - Data quality issues',
    title_overview: 'What is this Project?',
    title_solution: 'What This Project Does',
    title_problems: 'What Problem Does It Solve?',
    title_features: 'Engine Capabilities'
  },
  {
    id: 1004,
    name: 'IoT Edge Computing Platform',
    slug: 'iot-edge-computing-platform',
    category_id: 4,
    created_by: 2,
    client_name: 'Siemens Industrial Solutions',
    status: 'Completed',
    is_featured: 0,
    is_published: 1,
    priority: 4,
    start_date: '2022-09-01',
    completion_date: '2023-07-30',
    cover_image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=600&fit=crop',
    short_description: 'Distributed edge computing platform enabling real-time processing of 50K+ IoT devices with autonomous decision-making at the edge.',
    full_description: 'Purpose-built for Industrial IoT environments, this edge computing platform brings intelligence closer to data sources. Process sensor data, make decisions, and act - all without latency-inducing cloud round trips.\n\nKey Capabilities:\n- Support for 50,000+ concurrent devices\n- Edge-based ML model inference\n- Automatic synchronization with cloud systems\n- Over-the-air device firmware updates\n- Predictive maintenance algorithms',
    purpose: 'Reduce latency and enable autonomous IoT decision-making at the edge',
    what_it_does: 'Enables edge devices to:\n\n1. Process sensor data locally\n   - Real-time analysis without cloud dependency\n   - Reduced bandwidth requirements\n   - Improved privacy and security\n\n2. Execute ML models at the edge\n   - Anomaly detection\n   - Predictive maintenance\n   - Optimization algorithms\n\n3. Autonomous Decision Making\n   - React instantly to conditions\n   - Reduce operational costs\n   - Improve safety outcomes',
    problems_solved: 'Cloud-only IoT architectures had limitations:\n\n1. Latency and Connectivity\n   - Cloud round-trip delays unacceptable for industrial control\n   - Network bandwidth constraints\n   - Internet outages disrupt operations\n\n2. Data Privacy & Compliance\n   - Sensitive data must remain on-premises\n   - GDPR and regulatory requirements\n   - Data sovereignty concerns\n\n3. Cost & Scalability\n   - Massive data transfer costs\n   - Cloud infrastructure scaling issues\n   - Inefficient bandwidth usage',
    title_overview: 'What is this Project?',
    title_solution: 'What This Project Does',
    title_problems: 'What Problem Does It Solve?',
    title_features: 'Platform Features'
  },
  {
    name: 'Zero-Trust Security Mesh',
    slug: 'zero-trust-security-mesh',
    category_id: 5,
    created_by: 2,
    client_name: 'JPMorgan Chase Cybersecurity',
    status: 'Ongoing',
    is_featured: 0,
    is_published: 1,
    priority: 5,
    start_date: '2023-06-01',
    completion_date: null,
    cover_image: 'https://images.unsplash.com/photo-1633356122544-f134ef2944f7?w=1200&h=600&fit=crop',
    short_description: 'Enterprise-grade zero-trust network security mesh protecting 10K+ workloads with cryptographic identity verification and continuous compliance monitoring.',
    full_description: 'Implements zero-trust security principles across the entire enterprise infrastructure. Every request authenticated, every connection encrypted, every action audited.\n\nSecurity Architecture:\n- Mutual TLS encryption for all communications\n- Cryptographic identity verification\n- Fine-grained policy enforcement\n- Real-time threat detection\n- Comprehensive audit logging',
    purpose: 'Eliminate implicit trust and implement defense-in-depth security across all workloads',
    what_it_does: 'The security mesh provides:\n\n1. Identity Verification\n   - Cryptographic verification of every request\n   - Service-to-service authentication\n   - User and machine identity management\n\n2. Encryption & Privacy\n   - Automatic mTLS for all communications\n   - End-to-end encryption\n   - Key rotation automation\n\n3. Policy Enforcement\n   - Granular access policies\n   - Automatic policy updates\n   - Compliance rule enforcement',
    problems_solved: 'Traditional perimeter security approaches had weaknesses:\n\n1. Single Point of Failure\n   - Perimeter breaches expose entire network\n   - Lateral movement too easy\n   - Insider threats undetected\n\n2. Compliance & Audit\n   - Difficulty proving access controls\n   - Manual compliance verification\n   - Incomplete audit trails\n\n3. Operational Complexity\n   - Complex policy management\n   - Difficult incident response\n   - Integration challenges',
    title_overview: 'What is this Project?',
    title_solution: 'What This Project Does',
    title_problems: 'What Problem Does It Solve?',
    title_features: 'Security Features'
  }
];

async function seedProjects() {
  const client = await pool.connect();
  try {
    console.log('Starting demo projects seed...');
    
    for (const project of demoProjects) {
      const query = `
        INSERT INTO projects (
          name, slug, category_id, created_by, client_name, status,
          is_featured, is_published, priority, start_date, completion_date,
          cover_image, short_description, full_description, purpose,
          what_it_does, problems_solved, title_overview, title_solution,
          title_problems, title_features, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, NOW(), NOW()
        )
        ON CONFLICT (slug) DO UPDATE SET
          client_name = $5,
          status = $6,
          is_featured = $7,
          is_published = $8,
          priority = $9,
          completion_date = $11,
          short_description = $13,
          full_description = $14,
          purpose = $15,
          what_it_does = $16,
          problems_solved = $17,
          updated_at = NOW()
      `;

      const values = [
        project.name,
        project.slug,
        project.category_id,
        project.created_by,
        project.client_name,
        project.status,
        project.is_featured,
        project.is_published,
        project.priority,
        project.start_date,
        project.completion_date,
        project.cover_image,
        project.short_description,
        project.full_description,
        project.purpose,
        project.what_it_does,
        project.problems_solved,
        project.title_overview,
        project.title_solution,
        project.title_problems,
        project.title_features
      ];

      try {
        await client.query(query, values);
        console.log(`✅ Seeded project: ${project.name}`);
      } catch (err) {
        console.error(`❌ Error seeding ${project.name}:`, err.message);
      }
    }

    console.log('\n✅ Demo projects seed completed!');
    console.log(`Total projects seeded: ${demoProjects.length}`);
    
  } catch (error) {
    console.error('Fatal error during seed:', error);
  } finally {
    await client.release();
    await pool.end();
  }
}

seedProjects();
