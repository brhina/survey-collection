import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { DecisionOverridePayload, VerdictStatusBadge } from '../types/aiTypes';

interface AiHumanOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDecision: string;
  category: string;
  onSubmitOverride: (payload: DecisionOverridePayload) => Promise<boolean>;
}

export const AiHumanOverrideModal: React.FC<AiHumanOverrideModalProps> = ({
  isOpen,
  onClose,
  currentDecision,
  category,
  onSubmitOverride
}) => {
  const [newDecision, setNewDecision] = useState<string>('');
  const [statusBadge, setStatusBadge] = useState<VerdictStatusBadge>('WARNING');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const getPresetDecisions = () => {
    switch (category.toLowerCase()) {
      case 'inspection':
        return ['PASSED', 'CONDITIONAL_PASS', 'CRITICAL_HAZARD_FAIL'];
      case 'application':
        return ['ADMIT / FAST_TRACK', 'INVITE_INTERVIEW', 'REJECT / ARCHIVE'];
      case 'feedback':
        return ['PRODUCT_HEALTH_STABLE', 'FEATURE_REFACTOR_URGENT', 'CRITICAL_CHURN_RISK'];
      case 'survey':
      default:
        return ['STATUS_QUO_CONFIRMED', 'PARTIAL_INTERVENTION', 'POLICY_PIVOT_REQUIRED'];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecision.trim() || overrideReason.trim().length < 10) return;

    setSubmitting(true);
    const success = await onSubmitOverride({
      newDecision: newDecision.trim(),
      statusBadge,
      overrideReason: overrideReason.trim()
    });
    setSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Human-in-the-Loop: Decision Override">
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Compliance Advisory:</strong> Overriding an automated AI verdict will be recorded in the permanent audit ledger along with your administrative credentials and rationale.
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Current Automated Decision
          </label>
          <div className="px-3 py-2 rounded-xl bg-slate-100 font-mono text-xs text-slate-800">
            {currentDecision}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            New Official Decision Verdict *
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {getPresetDecisions().map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setNewDecision(preset);
                  if (preset.includes('PASS') || preset.includes('ADMIT') || preset.includes('STABLE') || preset.includes('CONFIRMED')) {
                    setStatusBadge('SUCCESS');
                  } else if (preset.includes('FAIL') || preset.includes('REJECT') || preset.includes('RISK') || preset.includes('PIVOT')) {
                    setStatusBadge('DANGER');
                  } else {
                    setStatusBadge('WARNING');
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  newDecision === preset
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <input
            type="text"
            required
            placeholder="Or type custom decision verdict..."
            value={newDecision}
            onChange={(e) => setNewDecision(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Badge Variant
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['SUCCESS', 'WARNING', 'DANGER', 'INFO'] as VerdictStatusBadge[]).map((badge) => (
              <button
                key={badge}
                type="button"
                onClick={() => setStatusBadge(badge)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  statusBadge === badge
                    ? 'ring-2 ring-emerald-600 border-transparent shadow-xs'
                    : 'opacity-60 hover:opacity-100 border-slate-200'
                } ${
                  badge === 'SUCCESS'
                    ? 'bg-emerald-100 text-emerald-800'
                    : badge === 'WARNING'
                    ? 'bg-amber-100 text-amber-800'
                    : badge === 'DANGER'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {badge}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Formal Justification / Audit Reason * (Min 10 characters)
          </label>
          <textarea
            required
            rows={3}
            placeholder="Detail the managerial, regulatory, or contextual reasons for overriding the automated decision..."
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={submitting}
            disabled={!newDecision.trim() || overrideReason.trim().length < 10}
          >
            Confirm Decision Override
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AiHumanOverrideModal;
