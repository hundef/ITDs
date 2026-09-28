import React, { createContext, useContext, useEffect, useState } from 'react';
import { WebsiteSettings } from '../types';

interface SettingsContextType {
  settings: WebsiteSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<WebsiteSettings>) => Promise<boolean>;
}

const defaultSettings: WebsiteSettings = {
  company_name: 'Technical Intelligence Directorate',
  company_slogan: 'Create. Innovate. Impact.',
  company_tagline: '',
  stats_projects_completed: '48+',
  stats_projects_ongoing: '12',
  stats_clients_served: '35+',
  stats_years_experience: '8+',
  stats_team_members: '60+',
  stats_client_satisfaction: '99.4%',
  primary_email: 'contact@insa.gov.et',
  phone_number: '+251-0135685458',
  office_address: 'Wollo Sefer,Bole Addis Ababa Ethiopia',
  about_hero_badge: 'Our Heritage & Vision',
  about_hero_title: 'Pioneering the Next Era of Enterprise Computing',
  about_hero_subtitle: 'We are a team of distributed systems engineers, AI researchers, and product architects dedicated to crafting software that defines industry standards.',
  team_badge_text: 'Human Resources',
  team_section_title: 'Professionals & Developers Behind ITD',
  team_section_desc: '',
  services_section_title: 'Specialized Engineering Services',
  services_section_desc: 'Comprehensive, end-to-end technology solutions tailored for enterprises demanding deterministic performance, high availability, and measurable ROI.',
  projects_section_title: 'Engineering Showcase & Case Studies',
  projects_section_desc: '',
  featured_section_title: 'Featured Projects & Engineering Milestones',
  featured_section_desc: '',
  contact_cta_title: "Let's Discuss Your Architecture",
  contact_cta_desc: 'Whether you require a dedicated AI vector intelligence platform, cloud modernization, or high-throughput ledgers, our team is ready to assist.',
  blog_badge_text: 'Research & Tech Insights',
  blog_section_title: 'Technical Perspectives & Architecture Whitepapers',
  blog_section_desc: 'Deep-dive analysis on real-world engineering challenges, vector retrieval, eBPF telemetry, and high-throughput financial ledgers.',
  core_values_section_title: 'Our Core Cultural Values',
  core_values_section_desc: '',
  milestones_section_title: 'Company Milestones & History',
  milestones_section_desc: '',
  milestones_timeline_color: 'indigo-500',
  milestones_json: JSON.stringify([
    {
      year: '2018',
      title: 'Company Inception',
      description: 'Founded by senior distributed systems architects to bring deterministic engineering rigor to enterprise software.'
    },
    {
      year: '2020',
      title: 'Cloud Orchestration Expansion',
      description: 'Launched our dedicated Kubernetes and eBPF infrastructure practice, serving leading FinTech and SaaS providers.'
    },
    {
      year: '2022',
      title: 'Enterprise AI & Vector Practice',
      description: 'Pioneered custom RAG pipelines and multimodal document intelligence engines for Fortune 500 legal and research teams.'
    },
    {
      year: '2024',
      title: 'Global Delivery Expansion',
      description: 'Expanded engineering operations to San Francisco and London, surpassing 40+ enterprise deployments.'
    },
    {
      year: '2026',
      title: 'Autonomous Systems Vanguard',
      description: 'Deploying self-healing microservice meshes and next-generation neural agent architectures.'
    }
  ]),
  leadership_section_title: 'Executive Leadership',
  leadership_section_desc: 'Led by seasoned industry veterans and technical innovators.',
  featured_badge_text: 'Showcase Portfolio',
  projects_badge_text: 'Central Project Portfolio',
  testimonials_badge_text: 'Client Endorsements',
  testimonials_section_title: 'Trusted by Leaders at Scale',
  testimonials_section_desc: 'What CTOs, CIOs, and engineering directors say about partnering with ITD.',
  services_tier_label: 'Enterprise Tier',
  contact_page_title: 'Contact Coordinates',
  contact_card_heading: 'Contact Coordinates',
  contact_email_label: 'Email',
  contact_email_sla: 'SLA: Replies within 4-12 hours',
  contact_phone_label: 'Telephone',
  contact_phone_hours: 'Mon–Fri: 8:00 AM – 7:00 PM',
  contact_address_label: 'Headquarters',
  insights_badge_text: 'Industry Insights',
  insights_section_title: 'Key Insights & Findings',
  insights_section_desc: 'Strategic insights and findings from our engineering work',
  insights_json: JSON.stringify([
    {
      id: '1',
      title: 'AI-Driven Document Intelligence',
      description: 'Multimodal RAG systems are revolutionizing enterprise search and knowledge extraction',
      icon: 'Zap',
      color: 'indigo-500'
    },
    {
      id: '2',
      title: 'Cloud-Native Architecture',
      description: 'Kubernetes and distributed systems are becoming the standard for enterprise infrastructure',
      icon: 'Cloud',
      color: 'cyan-500'
    },
    {
      id: '3',
      title: 'Real-Time Data Processing',
      description: 'Sub-millisecond latency is now achievable and expected in modern systems',
      icon: 'Zap',
      color: 'violet-500'
    }
  ]),
  insights: [
    {
      id: '1',
      title: 'AI-Driven Document Intelligence',
      description: 'Multimodal RAG systems are revolutionizing enterprise search and knowledge extraction',
      icon: 'Zap',
      color: 'indigo-500'
    },
    {
      id: '2',
      title: 'Cloud-Native Architecture',
      description: 'Kubernetes and distributed systems are becoming the standard for enterprise infrastructure',
      icon: 'Cloud',
      color: 'cyan-500'
    },
    {
      id: '3',
      title: 'Real-Time Data Processing',
      description: 'Sub-millisecond latency is now achievable and expected in modern systems',
      icon: 'Zap',
      color: 'violet-500'
    }
  ]
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WebsiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      // Add a 5-second timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch('/api/settings', { signal: controller.signal });
      clearTimeout(timeoutId);
      
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to load website settings:', err);
      // Continue with default settings on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<WebsiteSettings>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('nexora_token');
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update settings:', err);
      return false;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        refreshSettings: fetchSettings,
        updateSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
