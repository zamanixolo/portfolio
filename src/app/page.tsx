import { prisma } from '@/lib/db';
import InfiniteGrid from '@/components/InfiniteGrid';
import AdminEditPageBtn from '@/components/AdminEditPageBtn';

export const revalidate = 60;

// Force re-compile
export default async function Home() {
  const projects = await prisma.project.findMany({
    orderBy: [
        { order: 'asc' },
        { date: 'desc' }
    ]
  });

  return (
    <>
      <AdminEditPageBtn slug="home" />
      <InfiniteGrid initialProjects={projects} />
    </>
  );
}
