import React from 'react';
import { Survey, SurveyStatus } from '../../../types';
import SurveyCard from './SurveyCard';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/feedback/EmptyState';

export interface SurveyListProps {
  surveys: Survey[];
  loading: boolean;
  search: string;
  copiedId: string | null;
  onCopyLink: (id: string) => void;
  onDelete: (survey: Survey) => void;
  onStatusChange?: (id: string, newStatus: SurveyStatus) => void;
  onCreateNew?: () => void;
}

export const SurveyList: React.FC<SurveyListProps> = ({
  surveys,
  loading,
  search,
  copiedId,
  onCopyLink,
  onDelete,
  onStatusChange,
  onCreateNew
}) => {
  if (loading) {
    return (
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3"
          >
            <div className="flex justify-between">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-9 w-full rounded-xl mt-4" />
          </div>
        ))}
      </div>
    );
  }

  if (surveys.length === 0) {
    return (
      <EmptyState
        title={search ? 'No surveys matched your search' : 'No surveys created yet'}
        description={
          search
            ? 'Try adjusting your search terms.'
            : 'Create your first survey to begin collecting feedback.'
        }
        actionText={search ? undefined : 'Create Survey'}
        onAction={onCreateNew}
      />
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {surveys.map((survey) => (
        <SurveyCard
          key={survey._id}
          survey={survey}
          onCopyLink={onCopyLink}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          isCopied={copiedId === survey._id}
        />
      ))}
    </div>
  );
};

export default SurveyList;
