import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ExternalLink, Copy, Check, Trash2, Edit3 } from 'lucide-react';
import { Survey, SurveyStatus } from '../../../types';
import { formatDate } from '../../../utils/formatters';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

export interface SurveyCardProps {
  survey: Survey;
  onCopyLink: (id: string) => void;
  onDelete: (survey: Survey) => void;
  onStatusChange?: (id: string, newStatus: SurveyStatus) => void;
  isCopied: boolean;
}

const STATUS_THEMES: Record<
  SurveyStatus,
  { bg: string; text: string; border: string; label: string }
> = {
  published: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    label: 'Published'
  },
  draft: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    label: 'Draft'
  },
  closed: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    label: 'Closed'
  },
  archived: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    label: 'Archived'
  }
};

export const SurveyCard: React.FC<SurveyCardProps> = ({
  survey,
  onCopyLink,
  onDelete,
  onStatusChange,
  isCopied
}) => {
  const currentStatus: SurveyStatus = survey.status || 'published';
  const statusTheme = STATUS_THEMES[currentStatus] || STATUS_THEMES.published;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Badges and Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {survey.category && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                {survey.category}
              </span>
            )}
            <Badge variant="emerald">{survey.questions?.length || 0} Fields</Badge>
          </div>

          {/* Interactive Status Selector or Badge */}
          {onStatusChange ? (
            <select
              value={currentStatus}
              onChange={(e) => onStatusChange(survey._id, e.target.value as SurveyStatus)}
              className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${statusTheme.bg} ${statusTheme.text} ${statusTheme.border}`}
              title="Click to change status"
            >
              <option value="published">● Published</option>
              <option value="draft">● Draft</option>
              <option value="closed">● Closed</option>
              <option value="archived">● Archived</option>
            </select>
          ) : (
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider ${statusTheme.bg} ${statusTheme.text} ${statusTheme.border}`}
            >
              ● {statusTheme.label}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1 mb-1.5">
          {survey.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {survey.description}
        </p>

        {/* Submissions & Date */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
          <span className="font-semibold text-slate-700">
            {survey.responseCount || 0} submission{survey.responseCount === 1 ? '' : 's'}
          </span>
          <span className="text-slate-400">{formatDate(survey.createdAt)}</span>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-slate-100">
        {/* Action Buttons: Edit, Results, Open */}
        <div className="grid grid-cols-3 gap-1.5">
          <Link to={`/admin/edit/${survey._id}`} className="w-full">
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs font-semibold px-2"
              leftIcon={<Edit3 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
            >
              Edit
            </Button>
          </Link>

          <Link to={`/admin/results/${survey._id}`} className="w-full">
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs font-semibold px-2"
              leftIcon={<BarChart3 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
            >
              Results
            </Button>
          </Link>

          <Link
            to={`/survey/${survey._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold px-2"
              leftIcon={<ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            >
              Open
            </Button>
          </Link>
        </div>

        {/* Footer Actions: Copy Link & Delete */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <button
            type="button"
            onClick={() => onCopyLink(survey._id)}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer py-1 text-xs"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Link copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onDelete(survey)}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer py-1 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyCard;
