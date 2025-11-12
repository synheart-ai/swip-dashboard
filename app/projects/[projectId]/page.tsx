/**
 * Project Detail Page
 * 
 * Individual project dashboard with KPIs, recent activity, and navigation
 */

import { AuthWrapper } from '../../../components/AuthWrapper';
import { ProjectDetailContent } from '../../../components/ProjectDetailContent';
import { notFound } from 'next/navigation';
import { prisma } from '../../../src/lib/db';
import { requireUser } from '../../../src/lib/auth';

interface PageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  try {
    const user = await requireUser();
    const { projectId } = await params;

    // Fetch project with basic info to check ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        ownerId: true,
      },
    });

    if (!project) {
      notFound();
    }

    if (project.ownerId !== user.id) {
      notFound(); // Don't reveal that project exists if user doesn't own it
    }

    return (
      <AuthWrapper>
        <div className="min-h-screen bg-gradient-to-br from-[#0A0118] via-[#1a0b2e] to-[#0A0118] p-8">
          <ProjectDetailContent projectId={projectId} />
        </div>
      </AuthWrapper>
    );
  } catch (error) {
    console.error('Error loading project:', error);
    notFound();
  }
}

