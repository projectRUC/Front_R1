'use client';

import React, { useRef } from 'react';
import { HeroSection } from './HeroSection';
import { AboutSystem, SystemTools, ScrumInfo, KanbanInfo } from './InfoSections';
import { DashboardFooterNav } from './DashboardFooterNav';
import { useUser } from '@/context/UserContext';
import { Loader } from '@/components/Loader';

export const DashboardContainer: React.FC = () => {
  const { loading } = useUser();
  const scrumRef = useRef<HTMLDivElement>(null);
  const kanbanRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return <Loader message="Cargando portal..." />;
  }

  return (
    <div className="w-full flex flex-col min-h-screen relative bg-white dark:bg-zinc-950">
      
      <main className="flex-1 w-full">
        <HeroSection 
          onScrollToScrum={() => scrollToRef(scrumRef)} 
          onScrollToKanban={() => scrollToRef(kanbanRef)} 
          onScrollDown={() => scrollToRef(aboutRef)}
        />
        
        <div className="bg-white dark:bg-zinc-950 w-full rounded-t-[3rem] -mt-10 relative z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pt-10 pb-20">
          <AboutSystem ref={aboutRef} />
          <SystemTools />
          
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-zinc-700 to-transparent my-10" />
          
          <ScrumInfo ref={scrumRef} />
          
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-zinc-700 to-transparent my-10" />
          
          <KanbanInfo ref={kanbanRef} />
          
          <DashboardFooterNav />
        </div>
      </main>
    </div>
  );
};
