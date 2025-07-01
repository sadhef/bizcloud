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
          printBg: '#059669',
          printColor: '#ffffff'
        };
      case 'OFFLINE':
        return { 
          bg: '#ef4444', 
          color: '#ffffff', 
          border: '#dc2626',
          printBg: '#b91c1c',
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
          printBg: '#059669',
          printColor: '#ffffff'
        };
      case 'MANUAL':
      case 'MAINTENANCE':
        return { 
          bg: '#f59e0b', 
          color: '#000000', 
          border: '#d97706',
          printBg: '#b45309',
          printColor: '#ffffff'
        };
      case 'FAILED':
      case 'OFFLINE':
        return { 
          bg: '#ef4444', 
          color: '#ffffff', 
          border: '#dc2626',
          printBg: '#b91c1c',
          printColor: '#ffffff'
        };
      case 'IN PROGRESS':
        return { 
          bg: '#3b82f6', 
          color: '#ffffff', 
          border: '#2563eb',
          printBg: '#1d4ed8',
          printColor: '#ffffff'
        };
      case 'N/A':
        return { 
          bg: '#6b7280', 
          color: '#ffffff', 
          border: '#4b5563',
          printBg: '#374151',
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
          printBg: '#059669',
          printColor: '#ffffff'
        };
      case 'NOT RUNNING':
        return { 
          bg: '#ef4444', 
          color: '#ffffff', 
          border: '#dc2626',
          printBg: '#b91c1c',
          printColor: '#ffffff'
        };
      case 'N/A':
        return { 
          bg: '#6b7280', 
          color: '#ffffff', 
          border: '#4b5563',
          printBg: '#374151',
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
    month: 'short',
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
          border: `2px solid ${colors.border}`,
          padding: '6px 10px',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '11px',
          display: 'inline-block',
          minWidth: '70px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
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
          border: `2px solid ${colors.border}`,
          padding: '6px 10px',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '11px',
          display: 'inline-block',
          minWidth: '75px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
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
          border: `2px solid ${colors.border}`,
          padding: '6px 10px',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '11px',
          display: 'inline-block',
          minWidth: '70px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
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
          border: `2px solid ${colors.border}`,
          padding: '6px 10px',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '11px',
          display: 'inline-block',
          minWidth: '70px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
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
      }
    }, 2000);

    function generatePrintContent(logoBase64) {
      // Calculate optimal column count and font size based on data
      const maxColumns = Math.max(cloudData.columns.length, backupData.columns.length);
      const isWideTable = maxColumns > 8;
      
      // Generate colored cells for print with SCREEN-OPTIMIZED SIZING
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
                return `<td style="text-align: center; padding: ${isWideTable ? '4px 2px' : '6px 4px'};">
                  <span style="
                    background-color: ${colors.printBg}; 
                    color: ${colors.printColor}; 
                    border: 2px solid ${colors.border}; 
                    padding: ${isWideTable ? '4px 6px' : '6px 8px'}; 
                    border-radius: 6px; 
                    font-weight: bold; 
                    font-size: ${isWideTable ? '9px' : '10px'}; 
                    display: inline-block; 
                    min-width: ${isWideTable ? '50px' : '60px'}; 
                    text-align: center;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    letter-spacing: 0.3px;
                  ">
                    ${value || 'N/A'}
                  </span>
                </td>`;
              } else if (isStatusColumn) {
                const colors = getStatusColor(value, false, true);
                return `<td style="text-align: center; padding: ${isWideTable ? '4px 2px' : '6px 4px'};">
                  <span style="
                    background-color: ${colors.printBg}; 
                    color: ${colors.printColor}; 
                    border: 2px solid ${colors.border}; 
                    padding: ${isWideTable ? '4px 6px' : '6px 8px'}; 
                    border-radius: 6px; 
                    font-weight: bold; 
                    font-size: ${isWideTable ? '9px' : '10px'}; 
                    display: inline-block; 
                    min-width: ${isWideTable ? '55px' : '65px'}; 
                    text-align: center;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    letter-spacing: 0.3px;
                  ">
                    ${value || 'N/A'}
                  </span>
                </td>`;
              } else if (isWeekdayColumn) {
                const colors = isBackup 
                  ? getStatusColor(value, false, false)
                  : getStatusColor(value, false, true);
                return `<td style="text-align: center; padding: ${isWideTable ? '4px 2px' : '6px 4px'};">
                  <span style="
                    background-color: ${colors.printBg}; 
                    color: ${colors.printColor}; 
                    border: 2px solid ${colors.border}; 
                    padding: ${isWideTable ? '4px 6px' : '6px 8px'}; 
                    border-radius: 6px; 
                    font-weight: bold; 
                    font-size: ${isWideTable ? '9px' : '10px'}; 
                    display: inline-block; 
                    min-width: ${isWideTable ? '50px' : '60px'}; 
                    text-align: center;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    letter-spacing: 0.3px;
                  ">
                    ${value || 'N/A'}
                  </span>
                </td>`;
              } else {
                return `<td style="padding: ${isWideTable ? '4px 3px' : '6px 5px'}; text-align: left; vertical-align: middle; font-weight: 500; color: #000; font-size: ${isWideTable ? '9px' : '10px'};">${value || ''}</td>`;
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
              box-sizing: border-box;
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: ${isWideTable ? '8px' : '12px'}; 
              color: #000; 
              background: #fff; 
              line-height: 1.3;
              font-size: ${isWideTable ? '10px' : '11px'};
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .report-header { 
              text-align: center; 
              margin-bottom: ${isWideTable ? '15px' : '20px'}; 
              border-bottom: 3px solid #000; 
              padding-bottom: ${isWideTable ? '10px' : '15px'}; 
            }
            .logo { 
              width: ${isWideTable ? '60px' : '80px'}; 
              height: auto; 
              margin-bottom: ${isWideTable ? '8px' : '12px'}; 
              display: block; 
              margin-left: auto; 
              margin-right: auto; 
              border-radius: 8px;
              box-shadow: 0 3px 6px rgba(0,0,0,0.2);
            }
            .report-title { 
              font-size: ${isWideTable ? '18px' : '24px'}; 
              font-weight: bold; 
              margin-bottom: ${isWideTable ? '6px' : '10px'}; 
              color: #000; 
              text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .report-subtitle { 
              font-size: ${isWideTable ? '12px' : '16px'}; 
              margin-bottom: ${isWideTable ? '4px' : '6px'}; 
              color: #222; 
              font-weight: 600;
            }
            .report-date { 
              font-size: ${isWideTable ? '9px' : '11px'}; 
              margin-bottom: ${isWideTable ? '3px' : '5px'}; 
              color: #444; 
              font-style: italic;
              font-weight: 500;
            }
            .total-space { 
              font-size: ${isWideTable ? '10px' : '12px'}; 
              margin-top: ${isWideTable ? '6px' : '10px'}; 
              font-weight: bold; 
              color: #1e40af; 
              background: #dbeafe;
              padding: ${isWideTable ? '6px 10px' : '8px 12px'};
              border-radius: 6px;
              display: inline-block;
              border: 2px solid #2563eb;
            }
            .section-header { 
              font-size: ${isWideTable ? '14px' : '18px'}; 
              font-weight: bold; 
              margin: ${isWideTable ? '15px 0 10px 0' : '20px 0 15px 0'}; 
              padding: ${isWideTable ? '8px 12px' : '12px 16px'}; 
              background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%); 
              border-left: 6px solid #1e40af; 
              border-radius: 6px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.15);
              color: #000;
            }
            .report-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: ${isWideTable ? '15px' : '20px'}; 
              font-size: ${isWideTable ? '8px' : '10px'}; 
              box-shadow: 0 3px 6px rgba(0,0,0,0.15);
              border-radius: 6px;
              overflow: hidden;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .report-table th, .report-table td { 
              border: 1px solid #9ca3af; 
              padding: ${isWideTable ? '4px 2px' : '6px 4px'}; 
              text-align: left; 
              vertical-align: middle; 
            }
            .report-table th { 
              background: #1f2937 !important; 
              color: white !important;
              font-weight: bold; 
              text-transform: uppercase; 
              font-size: ${isWideTable ? '7px' : '9px'}; 
              letter-spacing: 0.5px;
              text-align: center;
              padding: ${isWideTable ? '6px 2px' : '8px 4px'};
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
              padding: ${isWideTable ? '3px 6px' : '4px 8px'};
              border-radius: 10px;
              font-size: ${isWideTable ? '9px' : '11px'};
              font-weight: 700;
              margin-left: ${isWideTable ? '6px' : '8px'};
              border: 2px solid #2563eb;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .backup-count {
              background: #bbf7d0 !important;
              color: #166534 !important;
              padding: ${isWideTable ? '3px 6px' : '4px 8px'};
              border-radius: 10px;
              font-size: ${isWideTable ? '9px' : '11px'};
              font-weight: 700;
              margin-left: ${isWideTable ? '6px' : '8px'};
              border: 2px solid #16a34a;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .report-footer { 
              text-align: center; 
              margin-top: ${isWideTable ? '15px' : '25px'}; 
              font-size: ${isWideTable ? '8px' : '10px'}; 
              color: #444; 
              border-top: 2px solid #d1d5db; 
              padding-top: ${isWideTable ? '10px' : '15px'}; 
              background: #f8fafc !important;
              border-radius: 6px;
              padding: ${isWideTable ? '10px' : '15px'};
              font-weight: 500;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            @page { 
              size: A4 landscape; 
              margin: ${isWideTable ? '5mm' : '8mm'}; 
            }
            @media print { 
              body { 
                margin: 0; 
                transform: scale(${isWideTable ? '0.85' : '0.95'});
                transform-origin: top left;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              } 
              .no-print { display: none; } 
              .report-table { 
                page-break-inside: avoid; 
                width: 100%;
              }
              .section-header { page-break-after: avoid; }
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            /* Auto-fit table width */
            .report-table {
              table-layout: fixed;
              width: 100%;
            }
            .report-table th,
            .report-table td {
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            ${logoBase64 ? `<img src="${logoBase64}" alt="BizTras Logo" class="logo" />` : ''}
            <div class="report-title">Cloud Infrastructure Status Report</div>
            <div class="report-subtitle">${cloudData.reportTitle || 'Cloud Status Report'}</div>
            <div class="report-subtitle">${backupData.reportTitle || 'Backup Server Cronjob Status'}</div>
            <div class="report-date">Cloud: ${formatDate(cloudData.reportDates?.startDate)} - ${formatDate(cloudData.reportDates?.endDate)}</div>
            <div class="report-date">Backup: ${formatDate(backupData.reportDates?.startDate)} - ${formatDate(backupData.reportDates?.endDate)}</div>
            ${cloudData.totalSpaceUsed ? `<div class="total-space">📊 Total Space: ${cloudData.totalSpaceUsed}</div>` : ''}
          </div>
          
          <div class="section-header">☁️ ${cloudData.reportTitle || 'Cloud Services'}<span class="service-count">${cloudData.rows.length}</span></div>
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
          
          <div class="section-header">🗄️ ${backupData.reportTitle || 'Backup Servers'}<span class="backup-count">${backupData.rows.length}</span></div>
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
            <p>Generated: ${new Date().toLocaleString()} | Cloud: ${cloudData.rows.length} | Backup: ${backupData.rows.length}${cloudData.totalSpaceUsed ? ` | Space: ${cloudData.totalSpaceUsed}` : ''}</p>
            <p>BizTras Cloud Infrastructure Management System</p>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
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
            className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              isDark 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            <FiArrowLeft className="mr-2" />
            Back to Edit
          </button>
          
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-6 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            <FiPrinter className="mr-2" />
            Print Report
          </button>
        </div>

        <div className={`rounded-xl shadow-lg overflow-hidden ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          <div className="text-center py-8 px-6 border-b border-gray-200 dark:border-gray-700">
            <img 
              src="./biztras.png" 
              alt="BizTras Logo" 
              className="w-20 h-20 mx-auto mb-4 rounded-lg shadow-lg"
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