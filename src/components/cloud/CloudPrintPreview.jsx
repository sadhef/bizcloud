// src/components/cloud/CloudPrintPreview.jsx - WITHOUT STATUS LEGEND
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FiArrowLeft, FiPrinter } from 'react-icons/fi';

// Helper function to get status color for print
const getStatusColorForPrint = (value, isServerStatus = false, isCloudStatus = false) => {
  if (!value) return { bg: '#ffffff', color: '#000000', border: '#cccccc' };
  
  const normalizedVal = value.toUpperCase();
  
  if (isServerStatus) {
    switch (normalizedVal) {
      case 'ONLINE':
        return { bg: '#10b981', color: '#ffffff', border: '#059669' };
      case 'OFFLINE':
        return { bg: '#ef4444', color: '#ffffff', border: '#dc2626' };
      default:
        return { bg: '#ffffff', color: '#000000', border: '#cccccc' };
    }
  } else if (isCloudStatus) {
    switch (normalizedVal) {
      case 'AUTOMATIC':
      case 'ONLINE':
        return { bg: '#10b981', color: '#ffffff', border: '#059669' };
      case 'MANUAL':
      case 'MAINTENANCE':
        return { bg: '#f59e0b', color: '#000000', border: '#d97706' };
      case 'FAILED':
      case 'OFFLINE':
        return { bg: '#ef4444', color: '#ffffff', border: '#dc2626' };
      case 'IN PROGRESS':
        return { bg: '#3b82f6', color: '#ffffff', border: '#2563eb' };
      case 'N/A':
        return { bg: '#6b7280', color: '#ffffff', border: '#4b5563' };
      default:
        return { bg: '#ffffff', color: '#000000', border: '#cccccc' };
    }
  } else {
    // Backup weekday status
    switch (normalizedVal) {
      case 'RUNNING':
        return { bg: '#10b981', color: '#ffffff', border: '#059669' };
      case 'NOT RUNNING':
        return { bg: '#ef4444', color: '#ffffff', border: '#dc2626' };
      case 'N/A':
        return { bg: '#6b7280', color: '#ffffff', border: '#4b5563' };
      default:
        return { bg: '#ffffff', color: '#000000', border: '#cccccc' };
    }
  }
};

// Helper function to format date
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Enhanced cell rendering for preview with colors
const renderCellWithColor = (value, column, isBackup = false) => {
  const isStatusColumn = column === 'Status';
  const isWeekdayColumn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(column);
  const isServerStatusColumn = column === 'SERVER STATUS';
  
  if (isServerStatusColumn) {
    const colors = getStatusColorForPrint(value, true, false);
    return (
      <span
        style={{
          backgroundColor: colors.bg,
          color: colors.color,
          border: `2px solid ${colors.border}`,
          padding: '4px 8px',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '11px',
          display: 'inline-block',
          minWidth: '70px',
          textAlign: 'center'
        }}
      >
        {value || 'N/A'}
      </span>
    );
  } else if (isStatusColumn) {
    const colors = getStatusColorForPrint(value, false, true);
    return (
      <span
        style={{
          backgroundColor: colors.bg,
          color: colors.color,
          border: `2px solid ${colors.border}`,
          padding: '4px 8px',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '11px',
          display: 'inline-block',
          minWidth: '80px',
          textAlign: 'center'
        }}
      >
        {value || 'N/A'}
      </span>
    );
  } else if (isWeekdayColumn && isBackup) {
    const colors = getStatusColorForPrint(value, false, false);
    return (
      <span
        style={{
          backgroundColor: colors.bg,
          color: colors.color,
          border: `2px solid ${colors.border}`,
          padding: '4px 8px',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '11px',
          display: 'inline-block',
          minWidth: '70px',
          textAlign: 'center'
        }}
      >
        {value || 'N/A'}
      </span>
    );
  } else if (isWeekdayColumn && !isBackup) {
    const colors = getStatusColorForPrint(value, false, true);
    return (
      <span
        style={{
          backgroundColor: colors.bg,
          color: colors.color,
          border: `2px solid ${colors.border}`,
          padding: '4px 8px',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '11px',
          display: 'inline-block',
          minWidth: '80px',
          textAlign: 'center'
        }}
      >
        {value || 'N/A'}
      </span>
    );
  }
  
  return value || 'N/A';
};

const CloudPrintPreview = ({ cloudData, backupData }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    const logoCanvas = document.createElement('canvas');
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    
    logoImg.onload = function() {
      logoCanvas.width = this.width;
      logoCanvas.height = this.height;
      const ctx = logoCanvas.getContext('2d');
      ctx.drawImage(this, 0, 0);
      const logoBase64 = logoCanvas.toDataURL();
      
      generatePrintContent(logoBase64);
    };
    
    logoImg.onerror = function() {
      generatePrintContent(null);
    };
    
    logoImg.src = './biztras.png';
    
    setTimeout(() => {
      if (!logoImg.complete) {
        generatePrintContent(null);
      }}, 2000);

    function generatePrintContent(logoBase64) {
      // Generate colored cells for print
      const generateColoredCellsForPrint = (data, isBackup = false) => {
        return data.rows.map(row => `
          <tr>
            ${data.columns.map(column => {
              const value = row[column] || '';
              const isStatusColumn = column === 'Status';
              const isWeekdayColumn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(column);
              const isServerStatusColumn = column === 'SERVER STATUS';
              
              if (isServerStatusColumn) {
                const colors = getStatusColorForPrint(value, true, false);
                return `<td style="text-align: center; padding: 8px 4px;">
                  <span style="background-color: ${colors.bg}; color: ${colors.color}; border: 2px solid ${colors.border}; padding: 6px 10px; border-radius: 8px; font-weight: bold; font-size: 11px; display: inline-block; min-width: 80px;">
                    ${value || 'N/A'}
                  </span>
                </td>`;
              } else if (isStatusColumn) {
                const colors = getStatusColorForPrint(value, false, true);
                return `<td style="text-align: center; padding: 8px 4px;">
                  <span style="background-color: ${colors.bg}; color: ${colors.color}; border: 2px solid ${colors.border}; padding: 6px 10px; border-radius: 8px; font-weight: bold; font-size: 11px; display: inline-block; min-width: 90px;">
                    ${value || 'N/A'}
                  </span>
                </td>`;
              } else if (isWeekdayColumn) {
                const colors = isBackup 
                  ? getStatusColorForPrint(value, false, false)  // Backup weekday status
                  : getStatusColorForPrint(value, false, true);  // Cloud weekday status
                return `<td style="text-align: center; padding: 8px 4px;">
                  <span style="background-color: ${colors.bg}; color: ${colors.color}; border: 2px solid ${colors.border}; padding: 6px 10px; border-radius: 8px; font-weight: bold; font-size: 11px; display: inline-block; min-width: 80px;">
                    ${value || 'N/A'}
                  </span>
                </td>`;
              } else {
                return `<td style="padding: 8px 4px; text-align: left;">${value}</td>`;
              }
            }).join('')}
          </tr>
        `).join('');
      };

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cloud Infrastructure Status Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              color: #000; 
              background: #fff; 
              line-height: 1.4;
            }
            .report-header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 3px solid #000; 
              padding-bottom: 20px; 
            }
            .logo { 
              width: 120px; 
              height: auto; 
              margin-bottom: 15px; 
              display: block; 
              margin-left: auto; 
              margin-right: auto; 
              border-radius: 12px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            .report-title { 
              font-size: 32px; 
              font-weight: bold; 
              margin-bottom: 12px; 
              color: #000; 
              text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .report-subtitle { 
              font-size: 20px; 
              margin-bottom: 8px; 
              color: #333; 
              font-weight: 600;
            }
            .report-date { 
              font-size: 14px; 
              margin-bottom: 5px; 
              color: #666; 
              font-style: italic;
            }
            .total-space { 
              font-size: 16px; 
              margin-top: 10px; 
              font-weight: bold; 
              color: #2563eb; 
              background: #eff6ff;
              padding: 8px 16px;
              border-radius: 8px;
              display: inline-block;
            }
            .section-header { 
              font-size: 22px; 
              font-weight: bold; 
              margin: 40px 0 20px 0; 
              padding: 12px 16px; 
              background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); 
              border-left: 6px solid #2563eb; 
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .report-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 40px; 
              font-size: 11px; 
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              border-radius: 8px;
              overflow: hidden;
            }
            .report-table th, .report-table td { 
              border: 1px solid #d1d5db; 
              padding: 10px 6px; 
              text-align: left; 
              vertical-align: middle; 
            }
            .report-table th { 
              background: linear-gradient(135deg, #374151 0%, #1f2937 100%); 
              color: white;
              font-weight: bold; 
              text-transform: uppercase; 
              font-size: 10px; 
              letter-spacing: 0.5px;
              text-align: center;
            }
            .report-table tbody tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .report-table tbody tr:hover {
              background-color: #f3f4f6;
            }
            .report-footer { 
              text-align: center; 
              margin-top: 40px; 
              font-size: 12px; 
              color: #666; 
              border-top: 2px solid #e5e7eb; 
              padding-top: 20px; 
              background: #f9fafb;
              border-radius: 8px;
              padding: 20px;
            }
            @page { 
              size: A4 landscape; 
              margin: 15mm; 
            }
            @media print { 
              body { margin: 0; } 
              .no-print { display: none; } 
              .report-table { page-break-inside: avoid; }
              .section-header { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            ${logoBase64 ? `<img src="${logoBase64}" alt="BizTras Logo" class="logo" />` : ''}
            <div class="report-title">Cloud Infrastructure Status Report</div>
            <div class="report-subtitle">${cloudData.reportTitle || 'Cloud Status Report'}</div>
            <div class="report-subtitle">${backupData.reportTitle || 'Backup Server Cronjob Status'}</div>
            <div class="report-date">Cloud Services: ${formatDate(cloudData.reportDates?.startDate)} - ${formatDate(cloudData.reportDates?.endDate)}</div>
            <div class="report-date">Backup Servers: ${formatDate(backupData.reportDates?.startDate)} - ${formatDate(backupData.reportDates?.endDate)}</div>
            ${cloudData.totalSpaceUsed ? `<div class="total-space">📊 Total Space Used: ${cloudData.totalSpaceUsed}</div>` : ''}
          </div>
          
          <div class="section-header">☁️ ${cloudData.reportTitle || 'Cloud Services Status'}</div>
          <table class="report-table">
            <thead>
              <tr>
                ${cloudData.columns.map(col => `<th>${col}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${generateColoredCellsForPrint(cloudData, false)}
            </tbody>
          </table>
          
          <div class="section-header">🗄️ ${backupData.reportTitle || 'Backup Server Cronjob Status'}</div>
          <table class="report-table">
            <thead>
              <tr>
                ${backupData.columns.map(col => `<th>${col}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${generateColoredCellsForPrint(backupData, true)}
            </tbody>
          </table>
          
          <div class="report-footer">
            <p><strong>📅 Generated on:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>📊 Summary:</strong> Cloud Services: ${cloudData.rows.length} | Backup Servers: ${backupData.rows.length}</p>
            ${cloudData.totalSpaceUsed ? `<p><strong>💾 Total Space Used:</strong> ${cloudData.totalSpaceUsed}</p>` : ''}
            <p style="margin-top: 15px; font-style: italic; color: #6b7280;">
              This report was automatically generated by BizTras Cloud Infrastructure Management System
            </p>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 1000);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-6`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-3 sm:space-y-0">
          <button
            onClick={() => navigate('/cloud-dashboard')}
            className="btn btn-secondary"
          >
            <FiArrowLeft className="mr-2" />
            Back to Edit
          </button>
          
          <button
            onClick={handlePrint}
            className="btn btn-primary"
          >
            <FiPrinter className="mr-2" />
            Print Report
          </button>
        </div>

        <div className={`card overflow-hidden ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          <div className="text-center py-8 px-6 border-b border-gray-200 dark:border-gray-700">
            <img 
              src="./biztras.png" 
              alt="BizTras Logo" 
              className="w-24 h-24 mx-auto mb-4 rounded-lg shadow-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Cloud Infrastructure Status Report</h1>
            <h2 className="text-lg sm:text-xl font-semibold mb-2">{cloudData.reportTitle || 'Cloud Status Report'}</h2>
            <h3 className="text-lg sm:text-xl font-semibold mb-4">{backupData.reportTitle || 'Backup Server Cronjob Status'}</h3>
            
            {/* Report Info */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <div>
                <strong>Cloud Services Period:</strong><br />
                {formatDate(cloudData.reportDates?.startDate)} - {formatDate(cloudData.reportDates?.endDate)}
              </div>
              <div>
                <strong>Backup Servers Period:</strong><br />
                {formatDate(backupData.reportDates?.startDate)} - {formatDate(backupData.reportDates?.endDate)}
              </div>
            </div>
            
            {cloudData.totalSpaceUsed && (
              <div className={`mt-4 inline-block px-4 py-2 rounded-lg ${
                isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'
              }`}>
                <strong>Total Space Used:</strong> {cloudData.totalSpaceUsed}
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6">
            {/* Cloud Services Table */}
            <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center">
              ☁️ {cloudData.reportTitle || 'Cloud Services Status'}
              <span className={`ml-3 text-sm px-2 py-1 rounded-full ${
                isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
              }`}>
                {cloudData.rows.length} services
              </span>
            </h3>
            <div className="overflow-x-auto mb-8">
              <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    {cloudData.columns.map((column, index) => (
                      <th
                        key={index}
                        className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDark ? 'text-gray-300' : 'text-gray-500'
                        }`}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                  {cloudData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                      {cloudData.columns.map((column, colIndex) => (
                        <td key={colIndex} className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                          {renderCellWithColor(row[column], column, false)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Backup Servers Table */}
            <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center">
              🗄️ {backupData.reportTitle || 'Backup Server Cronjob Status'}
              <span className={`ml-3 text-sm px-2 py-1 rounded-full ${
                isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
              }`}>
                {backupData.rows.length} servers
              </span>
            </h3>
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    {backupData.columns.map((column, index) => (
                      <th
                        key={index}
                        className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDark ? 'text-gray-300' : 'text-gray-500'
                        }`}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                  {backupData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                      {backupData.columns.map((column, colIndex) => (
                        <td key={colIndex} className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                          {renderCellWithColor(row[column], column, true)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className={`p-6 border-t border-gray-200 dark:border-gray-700 text-center ${
            isDark ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Generated on {new Date().toLocaleString()} • 
              Cloud Services: {cloudData.rows.length} • 
              Backup Servers: {backupData.rows.length}
              {cloudData.totalSpaceUsed && ` • Total Space: ${cloudData.totalSpaceUsed}`}
            </p>
            <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              BizTras Cloud Infrastructure Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudPrintPreview;