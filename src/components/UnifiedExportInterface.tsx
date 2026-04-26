'use client';

import { useState } from 'react';
import { Expense } from '@/types/expense';
import { BaseExportUtils, AdvancedExportImpl, QRExportUtils } from '@/lib/export-system';

interface UnifiedExportInterfaceProps {
  expenses: Expense[];
  filteredExpenses?: Expense[];
}

type LoadingFormat = 'pdf' | 'qr' | null;

export default function UnifiedExportInterface({
  expenses,
  filteredExpenses = expenses,
}: UnifiedExportInterfaceProps) {
  const [loadingFormat, setLoadingFormat] = useState<LoadingFormat>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const isDisabled = filteredExpenses.length === 0;

  const handleCSV = () => {
    const content = BaseExportUtils.generateCSV(filteredExpenses);
    BaseExportUtils.downloadFile(
      content,
      BaseExportUtils.generateFilename('expenses', 'csv'),
      'text/csv;charset=utf-8;'
    );
  };

  const handleJSON = () => {
    const content = BaseExportUtils.generateJSON(filteredExpenses);
    BaseExportUtils.downloadFile(
      content,
      BaseExportUtils.generateFilename('expenses', 'json'),
      'application/json;charset=utf-8;'
    );
  };

  // jsPDF is loaded lazily inside AdvancedExportImpl.generatePDF — not in the initial bundle
  const handlePDF = async () => {
    setLoadingFormat('pdf');
    setExportError(null);
    try {
      await AdvancedExportImpl.generatePDF(filteredExpenses, {});
    } catch {
      setExportError('PDF export failed. Please try again.');
    } finally {
      setLoadingFormat(null);
    }
  };

  // qrcode is loaded lazily inside QRExportUtils.generateDataUrl — not in the initial bundle
  const handleQR = async () => {
    setLoadingFormat('qr');
    setExportError(null);
    try {
      const dataUrl = await QRExportUtils.generateDataUrl(filteredExpenses);
      setQrDataUrl(dataUrl);
    } catch {
      setExportError('QR code generation failed. Please try again.');
    } finally {
      setLoadingFormat(null);
    }
  };

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {/* CSV and JSON are synchronous — no loading state needed */}
        <ExportButton
          onClick={handleCSV}
          disabled={isDisabled}
          className="bg-green-600 hover:bg-green-700"
          icon={<DownloadIcon />}
          label="CSV"
        />
        <ExportButton
          onClick={handleJSON}
          disabled={isDisabled}
          className="bg-blue-600 hover:bg-blue-700"
          icon={<DownloadIcon />}
          label="JSON"
        />
        {/* PDF — jsPDF is lazy-loaded on click */}
        <ExportButton
          onClick={handlePDF}
          disabled={isDisabled || loadingFormat !== null}
          className="bg-red-600 hover:bg-red-700"
          icon={loadingFormat === 'pdf' ? <SpinnerIcon /> : <DownloadIcon />}
          label="PDF"
        />
        {/* QR — qrcode is lazy-loaded on click */}
        <ExportButton
          onClick={handleQR}
          disabled={isDisabled || loadingFormat !== null}
          className="bg-purple-600 hover:bg-purple-700"
          icon={loadingFormat === 'qr' ? <SpinnerIcon /> : <QrIcon />}
          label="QR"
        />
      </div>

      {exportError && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{exportError}</p>
      )}

      {/* QR code modal — shown after generation */}
      {qrDataUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Expense Summary QR
              </h3>
              <button
                onClick={() => setQrDataUrl(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex justify-center mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="Expense summary QR code" className="rounded" width={300} height={300} />
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4">
              Encodes total, count, and category breakdown for{' '}
              {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
            </p>

            <div className="flex gap-3">
              <a
                href={qrDataUrl}
                download="expense-summary-qr.png"
                className="flex-1 flex justify-center items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Download PNG
              </a>
              <button
                onClick={() => setQrDataUrl(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── small sub-components ───────────────────────────────────────────────────

interface ExportButtonProps {
  onClick: () => void;
  disabled: boolean;
  className: string;
  icon: React.ReactNode;
  label: string;
}

function ExportButton({ onClick, disabled, className, icon, label }: ExportButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center px-3 py-2 text-white text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
  );
}
