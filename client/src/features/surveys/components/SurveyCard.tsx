import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ExternalLink, Copy, Check, Trash2 } from 'lucide-react';
import { Survey } from '../../../types';
import { formatDate } from '../../../utils/formatters';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

export interface SurveyCardProps {
  survey: Survey;
  onCopyLink: (id: string) => void;
  onDelete: (survey: Survey) => void;
  isCopied: boolean;
}

export const SurveyCard: React.FC<SurveyCardProps> = ({
  survey,
  onCopyLink,
  onDelete,
  isCopied
}) => {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="emerald">
            {survey.questions?.length || 0} Questions
          </Badge>
          <span className="text-xs text-slate-400">
            {formatDate(survey.createdAt)}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1 mb-1.5">
          {survey.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-5">
          {survey.description}
        </p>
      </div>

      <div className="space-y-3 pt-4 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-2">
          <Link to={`/admin/results/${survey._id}`} className="w-full">
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs font-semibold"
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
              className="w-full text-xs font-semibold"
              leftIcon={<ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            >
              Open
            </Button>
          </Link>
        </div>

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
