/**
 * Projects List Page
 * 
 * Central hub for all projects with filtering, stats, and project management
 */

import { AuthWrapper } from '../../components/AuthWrapper';
import { ProjectsContent } from '../../components/ProjectsContent';

export default async function ProjectsPage() {
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gradient-to-br from-[#0A0118] via-[#1a0b2e] to-[#0A0118] p-8">
        <ProjectsContent />
      </div>
    </AuthWrapper>
  );
}

