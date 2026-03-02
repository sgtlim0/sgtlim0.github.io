'use client';

import { Trash2, FileText } from 'lucide-react';
import type { DocProject } from '../services/types';

export interface ProjectTableProps {
  projects: DocProject[];
  onSelect: (project: DocProject) => void;
  onDelete: (id: string) => void;
}

const docTypeBadgeClass: Record<DocProject['docType'], string> = {
  HWP: 'bg-blue-100 text-blue-700',
  DOCX: 'bg-purple-100 text-purple-700',
};

export default function ProjectTable({ projects, onSelect, onDelete }: ProjectTableProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 py-16 text-center">
        <FileText className="mb-3 h-10 w-10 text-[#94A3B8]" />
        <p className="text-sm text-[#64748B]">
          아직 만든 프로젝트가 없어요.
          <br />
          &lsquo;새 프로젝트 시작&rsquo;을 눌러 AI와 함께 첫 문서를 작성해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <th className="px-5 py-3 font-medium text-[#64748B]">프로젝트명</th>
            <th className="px-5 py-3 font-medium text-[#64748B]">문서 종류</th>
            <th className="px-5 py-3 font-medium text-[#64748B]">최종 작성일</th>
            <th className="px-5 py-3 text-right font-medium text-[#64748B]">삭제</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr
              key={project.id}
              className="cursor-pointer border-b border-[#E2E8F0] transition-colors last:border-b-0 hover:bg-[#F8FAFC]"
            >
              <td
                className="px-5 py-3 font-medium text-[#1E293B]"
                onClick={() => onSelect(project)}
              >
                {project.name}
              </td>
              <td className="px-5 py-3" onClick={() => onSelect(project)}>
                <span
                  className={[
                    'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                    docTypeBadgeClass[project.docType],
                  ].join(' ')}
                >
                  {project.docType}
                </span>
              </td>
              <td
                className="px-5 py-3 text-[#64748B]"
                onClick={() => onSelect(project)}
              >
                {project.lastModified}
              </td>
              <td className="px-5 py-3 text-right">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(project.id);
                  }}
                  className="rounded p-1.5 text-[#94A3B8] transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label={`${project.name} 삭제`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
