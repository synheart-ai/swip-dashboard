/**
 * Project Sessions Explorer Page
 * 
 * Browse and analyze all sessions within a project with filtering
 */

import { AuthWrapper } from '../../../../components/AuthWrapper';
import { ProjectSessionsContent } from '../../../../components/ProjectSessionsContent';
import { notFound } from 'next/navigation';
import { prisma } from '../../../../src/lib/db';
import { requireUser } from '../../../../src/lib/auth';

interface PageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectSessionsPage({ params }: PageProps) {
  try {
    const user = await requireUser();
    const { projectId } = await params;

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        ownerId: true,
      },
    });

    if (!project) {
      notFound();
    }

    if (project.ownerId !== user.id) {
      notFound();
    }

    return (
      <AuthWrapper>
        <div className="min-h-screen bg-gradient-to-br from-[#0A0118] via-[#1a0b2e] to-[#0A0118] p-8">
          <ProjectSessionsContent projectId={projectId} projectName={project.name} />
        </div>
      </AuthWrapper>
    );
  } catch (error) {
    console.error('Error loading sessions page:', error);
    notFound();
  }
}


