import { prisma } from '@/lib/db';
import Hero from '@/components/Hero';
import ProjectCard from '@/components/ProjectCard';
import styles from './page.module.css';
import { Project } from '@prisma/client';

export const revalidate = 60;

export default async function Home() {
  const projects = await prisma.project.findMany({
    orderBy: { date: 'desc' },
  });

  return (
    <main className={styles.main}>
      <Hero />
      <div className={styles.gridContainer}>
        {projects.map((project: Project, index: number) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
    </main>
  );
}
