import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FiArrowLeft, FiPrinter } from 'react-icons/fi';

// Helper function to get status color with ENHANCED PRINT VISIBILITY
const getStatusColor = (value, isServerStatus = false, isCloudStatus = false) => {
  if (!value) return { bg: '#ffffff', color: '#000000', border: '#000000', printBg: '#ffffff', printColor: '#000000' };
  
  const normalizedVal = value.toUpperCase();
  
  if (isServerStatus) {
    switch (normalizedVal) {
      case 'ONLINE':
        return { 
          bg: '#10b981', 
          color: '#ffffff', 
          border: '#059669',
          printBg: '#059669',  // Darker green for better print visibility
          printColor: '#ffffff'
        };
      case 'OFFLINE':
        return { 
          bg: '#ef4444', 
          color: '#ffffff', 
          border: '#dc2626',
          printBg: '#b91c1c',  // Darker red for better print visibility
          printColor: '#ffffff'
        };
      default:
        return { 
          bg: '#ffffff', 
          color: '#000000', 
          border: '#000000',
          printBg: '#ffffff',
          printColor: '#000000'
        };
    }
  } else if (isCloudStatus) {
    switch (normalizedVal) {
      case 'AUTOMATIC':
      case 'ONLINE':
        return { 
          bg: '#10b981', 
          color: '#ffffff', 
          border: '#059669',
          printBg: '#059669',  // Darker green
          printColor: '#ffffff'
        };
      case 'MANUAL':
      case 'MAINTENANCE':
        return { 
          bg: '#f59e0b', 
          color: '#000000', 
          border: '#d97706',
          printBg: '#b45309',  // Much darker orange
          printColor: '#ffffff'
        };
      case 'FAILED':
      case 'OFFLINE':
        return { 
          bg: '#ef4444', 
          color: '#ffffff', 
          border: '#dc2626',
          printBg: '#b91c1c',  // Darker red
          printColor: '#ffffff'
        };
      case 'IN PROGRESS':
        return { 
          bg: '#3b82f6', 
          color: '#ffffff', 
          border: '#2563eb',
          printBg: '#1d4ed8',  // Darker blue
          printColor: '#ffffff'
        };
      case 'N/A':
        return { 
          bg: '#6b7280', 
          color: '#ffffff', 
          border: '#4b5563',
          printBg: '#374151',  // Much darker gray
          printColor: '#ffffff'
        };
      default:
        return { 
          bg: '#ffffff', 
          color: '#000000', 
          border: '#000000',
          printBg: '#ffffff',
          printColor: '#000000'
        };
    }
  } else {
    // Backup weekday status
    switch (normalizedVal) {
      case 'RUNNING':
        return { 
          bg: '#10b981', 
          color: '#ffffff', 
          border: '#059669',
          printBg: '#059669',  // Darker green
          printColor: '#ffffff'
        };
      case 'NOT RUNNING':
        return { 
          bg: '#ef4444', 
          color: '#ffffff', 
          border: '#dc2626',
          printBg: '#b91c1c',  // Darker red
          printColor: '#ffffff'
        };
      case 'N/A':
        return { 
          bg: '#6b7280', 
          color: '#ffffff', 
          border: '#4b5563',
          printBg: '#374151',  // Much darker gray
          printColor: '#ffffff'
        };
      default:
        return { 
          bg: '#ffffff', 
          color: '#000000', 
          border: '#000000',
          printBg: '#ffffff',
          printColor: '#000000'
        };
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
    const colors = getStatusColor(value, true, false);
    return (
      <span
        style={{
          backgroundColor: colors.bg,
          color: colors.color,
          border: `3px solid ${colors.border}`,
          padding: '8px 12px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '12px',
          display: 'inline-block',
          minWidth: '85px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        {value || 'N/A'}
      </span>
    );
  } else if (isStatusColumn) {
    const colors = getStatusColor(value, false, true);
    return (
      <span
        style={{
          backgroundColor: colors.bg,
          color: colors.color,
          border: `3px solid ${colors.border}`,
          padding: '8px 12px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '12px',
          display: 'inline-block',
          minWidth: '95px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        {value || 'N/A'}
      </span>
    );
  } else if (isWeekdayColumn && isBackup) {
    const colors = getStatusColor(value, false, false);
    return (
      <span
        style={{
          backgroundColor: colors.bg,
          color: colors.color,
          border: `3px solid ${colors.border}`,
          padding: '8px 12px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '12px',
          display: 'inline-block',
          minWidth: '85px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        {value || 'N/A'}
      </span>
    );
  } else if (isWeekdayColumn && !isBackup) {
    const colors = getStatusColor(value, false, true);
    return (
      <span
        style={{
          backgroundColor: colors.bg,
          color: colors.color,
          border: `3px solid ${colors.border}`,
          padding: '8px 12px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '12px',
          display: 'inline-block',
          minWidth: '85px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
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
      // Generate colored cells for print with ENHANCED VISIBILITY
      const generateColoredCellsForPrint = (data, isBackup = false) => {
        return data.rows.map(row => `
          <tr>
            ${data.columns.map(column => {
              const value = row[column] || '';
              const isStatusColumn = column === 'Status';
              const isWeekdayColumn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(column);
              const isServerStatusColumn = column === 'SERVER STATUS';
              
              if (isServerStatusColumn) {
                const colors = getStatusColor(value, true, false);
                return `<td style="text-align: center; padding: 10px 6px;">
                  <span style="
                    background-color: ${colors.printBg}; 
                    color: ${colors.printColor}; 
                    border: 4px solid ${colors.border}; 
                    padding: 10px 14px; 
                    border-radius: 10px; 
                    font-weight: bold; 
                    font-size: 13px; 
                    display: inline-block; 
                    min-width: 90px; 
                    text-align: center;
                    box-shadow: 0 3px 6px rgba(0,0,0,0.3);
                    letter-spacing: 0.5px;
                  ">
                    ${value || 'N/A'}
                  </span>
                </td>`;
              } else if (isStatusColumn) {
                const colors = getStatusColor(value, false, true);
                return `<td style="text-align: center; padding: 10px 6px;">
                  <span style="
                    background-color: ${colors.printBg}; 
                    color: ${colors.printColor}; 
                    border: 4px solid ${colors.border}; 
                    padding: 10px 14px; 
                    border-radius: 10px; 
                    font-weight: bold; 
                    font-size: 13px; 
                    display: inline-block; 
                    min-width: 100px; 
                    text-align: center;
                    box-shadow: 0 3px 6px rgba(0,0,0,0.3);
                    letter-spacing: 0.5px;
                  ">
                    ${value || 'N/A'}
                  </span>
                </td>`;
              } else if (isWeekdayColumn) {
                const colors = isBackup 
                  ? getStatusColor(value, false, false)  // Backup weekday status
                  : getStatusColor(value, false, true);  // Cloud weekday status
                return `<td style="text-align: center; padding: 10px 6px;">
                  <span style="
                    background-color: ${colors.printBg}; 
                    color: ${colors.printColor}; 
                    border: 4px solid ${colors.border}; 
                    padding: 10px 14px; 
                    border-radius: 10px; 
                    font-weight: bold; 
                    font-size: 13px; 
                    display: inline-block; 
                    min-width: 90px; 
                    text-align: center;
                    box-shadow: 0 3px 6px rgba(0,0,0,0.3);
                    letter-spacing: 0.5px;
                  ">
                    ${value || 'N/A'}
                  </span>
                </td>`;
              } else {
                return `<td style="padding: 10px 8px; text-align: left; vertical-align: middle; font-weight: 500; color: #000;">${value || ''}</td>`;
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
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              color: #000; 
              background: #fff; 
              line-height: 1.5;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .report-header { 
              text-align: center; 
              margin-bottom: 35px; 
              border-bottom: 4px solid #000; 
              padding-bottom: 25px; 
            }
            .logo { 
              width: 130px; 
              height: auto; 
              margin-bottom: 20px; 
              display: block; 
              margin-left: auto; 
              margin-right: auto; 
              border-radius: 15px;
              box-shadow: 0 6px 12px rgba(0,0,0,0.2);
            }
            .report-title { 
              font-size: 36px; 
              font-weight: bold; 
              margin-bottom: 15px; 
              color: #000; 
              text-shadow: 0 3px 6px rgba(0,0,0,0.2);
            }
            .report-subtitle { 
              font-size: 22px; 
              margin-bottom: 10px; 
              color: #222; 
              font-weight: 700;
            }
            .report-date { 
              font-size: 16px; 
              margin-bottom: 8px; 
              color: #444; 
              font-style: italic;
              font-weight: 500;
            }
            .total-space { 
              font-size: 18px; 
              margin-top: 15px; 
              font-weight: bold; 
              color: #1e40af; 
              background: #dbeafe;
              padding: 12px 20px;
              border-radius: 10px;
              display: inline-block;
              border: 2px solid #2563eb;
            }
            .section-header { 
              font-size: 26px; 
              font-weight: bold; 
              margin: 35px 0 25px 0; 
              padding: 16px 20px; 
              background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%); 
              border-left: 8px solid #1e40af; 
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.15);
              color: #000;
            }
            .report-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 35px; 
              font-size: 13px; 
              box-shadow: 0 6px 12px rgba(0,0,0,0.15);
              border-radius: 10px;
              overflow: hidden;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .report-table th, .report-table td { 
              border: 2px solid #9ca3af; 
              padding: 12px 10px; 
              text-align: left; 
              vertical-align: middle; 
            }
            .report-table th { 
              background: #1f2937 !important; 
              color: white !important;
              font-weight: bold; 
              text-transform: uppercase; 
              font-size: 12px; 
              letter-spacing: 1px;
              text-align: center;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .report-table tbody tr:nth-child(even) {
              background-color: #f8fafc !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .service-count {
              background: #bfdbfe !important;
              color: #1e40af !important;
              padding: 6px 12px;
              border-radius: 15px;
              font-size: 14px;
              font-weight: 700;
              margin-left: 10px;
              border: 2px solid #2563eb;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .backup-count {
              background: #bbf7d0 !important;
              color: #166534 !important;
              padding: 6px 12px;
              border-radius: 15px;
              font-size: 14px;
              font-weight: 700;
              margin-left: 10px;
              border: 2px solid #16a34a;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .report-footer { 
              text-align: center; 
              margin-top: 45px; 
              font-size: 14px; 
              color: #444; 
              border-top: 3px solid #d1d5db; 
              padding-top: 25px; 
              background: #f8fafc !important;
              border-radius: 10px;
              padding: 25px;
              font-weight: 500;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            @page { 
              size: A4 landscape; 
              margin: 12mm; 
            }
            @media print { 
              body { 
                margin: 0; 
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              } 
              .no-print { display: none; } 
              .report-table { page-break-inside: avoid; }
              .section-header { page-break-after: avoid; }
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
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
          
          <div class="section-header">☁️ ${cloudData.reportTitle || 'Cloud Services Status'}<span class="service-count">${cloudData.rows.length} services</span></div>
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
          
          <div class="section-header">🗄️ ${backupData.reportTitle || 'Backup Server Cronjob Status'}<span class="backup-count">${backupData.rows.length} servers</span></div>
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
                        <td key={colIndex} className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-center">
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
                        <td key={colIndex} className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-center">
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
              Generated on {new Date().toLocaleString()}
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