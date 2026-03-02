'use client';

import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import StepProgress from '../components/StepProgress';
import ProjectTable from '../components/ProjectTable';
import { mockDocProjects } from '../services/mockData';
import type { DocProject } from '../services/types';

const SUPPORTED_FORMATS = ['한글(HWP)', '워드(DOCX)'] as const;

const STEPS = [
  { label: '프로젝트 선택' },
  { label: '파일 선택' },
  { label: '배경지식 제공' },
  { label: '목차 및 내용 작성' },
  { label: '파일 생성' },
];

export default function DocsPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [projects, setProjects] = useState<DocProject[]>(mockDocProjects);
  const [selectedProject, setSelectedProject] = useState<DocProject | null>(null);

  const handleSelectProject = useCallback((project: DocProject) => {
    setSelectedProject(project);
    setCurrentStep(project.step);
  }, []);

  const handleDeleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selectedProject?.id === id) {
      setSelectedProject(null);
      setCurrentStep(1);
    }
  }, [selectedProject]);

  const handleNewProject = useCallback(() => {
    const newProject: DocProject = {
      id: `d-${Date.now()}`,
      name: '새 프로젝트',
      docType: 'DOCX',
      lastModified: new Date().toISOString().split('T')[0],
      step: 1,
    };
    setProjects((prev) => [newProject, ...prev]);
    setSelectedProject(newProject);
    setCurrentStep(2);
  }, []);

  return (
    <div className="mx-auto max-w-[960px] px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E293B]">문서 작성 도구</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          AI와 함께 전문적인 문서를 작성해보세요.
        </p>
      </div>

      {/* Supported formats */}
      <div className="mb-6 flex flex-wrap gap-2">
        {SUPPORTED_FORMATS.map((fmt) => (
          <span
            key={fmt}
            className="rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-medium text-[#64748B] ring-1 ring-[#E2E8F0]"
          >
            {fmt}
          </span>
        ))}
      </div>

      {/* Step progress */}
      <div className="mb-8">
        <StepProgress steps={STEPS} currentStep={currentStep} />
      </div>

      {/* New project button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleNewProject}
          className="inline-flex items-center gap-2 rounded-xl bg-[#4F6EF7] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3B5BE5]"
        >
          <Plus className="h-4 w-4" />
          새 프로젝트 시작
        </button>
      </div>

      {/* Project table */}
      <ProjectTable
        projects={projects}
        onSelect={handleSelectProject}
        onDelete={handleDeleteProject}
      />
    </div>
  );
}
