import React from 'react';

export const StatusBadge = ({ status, type = 'review' }) => {
  if (!status) return null;

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (type === 'title') {
    switch (status) {
      case 'Approved':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'Pending Approval':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'Revision Required':
        colorClasses = 'bg-sky-50 text-sky-700 border-sky-200';
        break;
      case 'Rejected':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
      default:
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
    }
  } else {
    // Review or Evaluation status
    switch (status) {
      case 'Approved':
      case 'Published':
      case 'Evaluation Completed':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'Submitted':
        colorClasses = 'bg-slate-100 text-slate-800 border-slate-200';
        break;
      case 'Under Review':
      case 'Evaluation in Progress':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'Changes Requested':
        colorClasses = 'bg-orange-50 text-orange-700 border-orange-200';
        break;
      case 'Rejected':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
      case 'Not Evaluated':
        colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
        break;
      default:
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {status}
    </span>
  );
};

export default StatusBadge;
