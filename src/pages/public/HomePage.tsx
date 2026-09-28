import React from 'react';
import { HeroSection } from '../../components/public/HeroSection';
import { StatsBar } from '../../components/public/StatsBar';
import { NewProjectShowcase } from '../../components/public/NewProjectShowcase';
import { FeaturedProjects } from '../../components/public/FeaturedProjects';
import { ServicesPreview } from '../../components/public/ServicesPreview';
import { TestimonialsSlider } from '../../components/public/TestimonialsSlider';
import { LatestNewsSection } from '../../components/public/LatestNewsSection';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-4">
      <HeroSection onNavigate={onNavigate} />
      <StatsBar />
      <NewProjectShowcase onNavigate={onNavigate} />
      <FeaturedProjects onNavigate={onNavigate} />
      <ServicesPreview onNavigate={onNavigate} />
      <TestimonialsSlider onNavigate={onNavigate} />
      <LatestNewsSection onNavigate={onNavigate} />
    </div>
  );
};
