import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FiArrowLeft, FiPrinter, FiCamera } from 'react-icons/fi';

// Helper function to get status color matching the exact image
const getStatusColor = (value, isServerStatus = false, isCloudStatus = false) => {
  if (!value) return { bg: '#ffffff', color: '#000000' };
  
  const normalizedVal = value.toUpperCase();
  
  if (isServerStatus) {
    switch (normalizedVal) {
      case 'ONLINE':
        return { bg: '#22c55e', color: '#ffffff' }; // Green
      case 'OFFLINE':
        return { bg: '#ef4444', color: '#ffffff' }; // Red
      default:
        return { bg: '#ffffff', color: '#000000' };
    }
  } else if (isCloudStatus) {
    switch (normalizedVal) {
      case 'AUTOMATIC':
      case 'ONLINE':
        return { bg: '#22c55e', color: '#ffffff' }; // Green like in image
      case 'MANUAL':
      case 'MAINTENANCE':
        return { bg: '#f59e0b', color: '#000000' }; // Yellow/Orange
      case 'FAILED':
      case 'OFFLINE':
        return { bg: '#ef4444', color: '#ffffff' }; // Red
      case 'IN PROGRESS':
        return { bg: '#3b82f6', color: '#ffffff' }; // Blue
      case 'N/A':
        return { bg: '#6b7280', color: '#ffffff' }; // Gray
      default:
        return { bg: '#ffffff', color: '#000000' };
    }
  } else {
    // Backup weekday status
    switch (normalizedVal) {
      case 'RUNNING':
        return { bg: '#22c55e', color: '#ffffff' }; // Green
      case 'NOT RUNNING':
        return { bg: '#ef4444', color: '#ffffff' }; // Red
      case 'N/A':
        return { bg: '#6b7280', color: '#ffffff' }; // Gray
      default:
        return { bg: '#ffffff', color: '#000000' };
    }
  }
};

// Helper function to format date like DD-MM-YYYY
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const CloudPrintPreview = ({ cloudData, backupData }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const reportRef = useRef(null);

  // Add custom CSS for image capture
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .capture-table-container {
        overflow: visible !important;
        width: auto !important;
        max-width: none !important;
      }
      
      .capture-table {
        width: auto !important;
        min-width: 100% !important;
        table-layout: auto !important;
        white-space: nowrap !important;
      }
      
      .capture-table th,
      .capture-table td {
        white-space: nowrap !important;
        min-width: max-content !important;
      }
      
      /* Ensure proper rendering during capture */
      [data-capture-target="true"] {
        overflow: visible !important;
        width: auto !important;
        height: auto !important;
        max-width: none !important;
        max-height: none !important;
      }
      
      /* Dropdown menu styles */
      .capture-dropdown {
        position: relative;
        display: inline-block;
      }
      
      .capture-dropdown:hover .dropdown-content {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      
      .dropdown-content {
        position: absolute;
        top: 100%;
        left: 0;
        z-index: 50;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.2s ease-in-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Function to capture the report as multiple paginated images
  const capturePaginatedImages = async () => {
    try {
      console.log('Starting paginated image capture...');
      
      if (!reportRef.current) {
        window.alert('Unable to find report element. Please try again.');
        return;
      }

      const html2canvas = (await import('html2canvas')).default;
      
      const element = reportRef.current;
      const pageHeight = 1200; // Approximate page height in pixels
      const totalHeight = element.scrollHeight;
      const totalPages = Math.ceil(totalHeight / pageHeight);
      
      if (totalPages === 1) {
        window.alert('Report is small enough for single image. Using regular capture...');
        return captureImage();
      }

      const userConfirm = window.confirm(
        `This will create ${totalPages} separate image files.\n\n` +
        `Each image will be approximately one page worth of content.\n\n` +
        `Files will be downloaded individually.\n\n` +
        `Continue with paginated capture?`
      );
      
      if (!userConfirm) return;

      // Hide buttons
      const buttons = element.querySelectorAll('.capture-hide');
      buttons.forEach(btn => btn.style.display = 'none');

      const timestamp = new Date().toISOString().split('T')[0];
      
      window.alert(`Starting capture of ${totalPages} pages... Files will download one by one.`);

      for (let page = 0; page < totalPages; page++) {
        const yOffset = page * pageHeight;
        const remainingHeight = Math.min(pageHeight, totalHeight - yOffset);
        
        console.log(`Capturing page ${page + 1}/${totalPages}`);
        
        const canvas = await html2canvas(element, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          width: element.scrollWidth,
          height: remainingHeight,
          x: 0,
          y: yOffset,
          scrollX: 0,
          scrollY: 0,
          logging: false,
          ignoreElements: (el) => el.classList && el.classList.contains('capture-hide')
        });

        // Download individual page
        const link = document.createElement('a');
        link.download = `BizTras_Report_${timestamp}_Page${page + 1}_of_${totalPages}.png`;
        link.href = canvas.toDataURL('image/png', 0.9);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Small delay between downloads to avoid browser issues
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Restore buttons
      buttons.forEach(btn => btn.style.display = '');
      
      window.alert(`Successfully captured and downloaded ${totalPages} page images!`);
      
    } catch (error) {
      console.error('Error in paginated capture:', error);
      window.alert(`Error creating paginated images: ${error.message}`);
    }
  };

  const captureImage = async () => {
    try {
      console.log('Starting image capture...');
      
      // Check if ref is available
      if (!reportRef.current) {
        console.error('Report ref is null');
        window.alert('Unable to find report element. Please try again.');
        return;
      }

      console.log('Report element found:', reportRef.current);

      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      const element = reportRef.current;
      
      // Check if content is too large
      const estimatedHeight = element.scrollHeight;
      const maxReasonableHeight = 5000; // 5000px is about 2-3 pages worth
      
      if (estimatedHeight > maxReasonableHeight) {
        const userChoice = window.confirm(
          `This report is quite large (${Math.round(estimatedHeight/1000)}k pixels tall). \n\n` +
          `This will create a very long image file. \n\n` +
          `For better results with large datasets, consider using "Print Report" instead. \n\n` +
          `Do you want to continue with image capture anyway?`
        );
        
        if (!userChoice) {
          return;
        }
      }
      
      // Store original styles
      const originalStyle = {
        overflow: element.style.overflow,
        width: element.style.width,
        height: element.style.height,
        maxWidth: element.style.maxWidth,
        maxHeight: element.style.maxHeight
      };

      // Temporarily modify styles for full capture
      element.style.overflow = 'visible';
      element.style.width = 'auto';
      element.style.height = 'auto';
      element.style.maxWidth = 'none';
      element.style.maxHeight = 'none';

      // Hide buttons before capture
      const buttons = element.querySelectorAll('.capture-hide');
      const originalDisplay = [];
      buttons.forEach((btn, index) => {
        originalDisplay[index] = btn.style.display;
        btn.style.display = 'none';
      });

      // Force browser to recalculate layout
      element.getBoundingClientRect();
      
      // Wait a moment for layout to stabilize
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log('Starting canvas generation...');
      console.log('Element dimensions:', {
        scrollWidth: element.scrollWidth,
        scrollHeight: element.scrollHeight,
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight,
        offsetWidth: element.offsetWidth,
        offsetHeight: element.offsetHeight
      });

      // Show progress for large captures
      let progressAlert;
      if (estimatedHeight > 3000) {
        progressAlert = setTimeout(() => {
          window.alert('Large image capture in progress... Please wait, this may take a moment.');
        }, 1000);
      }
      
      const canvas = await html2canvas(element, {
        scale: estimatedHeight > maxReasonableHeight ? 1 : 1.5, // Lower scale for very large images
        useCORS: true,
        allowTaint: true,
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        width: Math.max(element.scrollWidth, element.offsetWidth, 1200),
        height: Math.max(element.scrollHeight, element.offsetHeight),
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        windowWidth: Math.max(element.scrollWidth, 1200),
        windowHeight: element.scrollHeight,
        logging: false,
        ignoreElements: (el) => {
          return el.classList && el.classList.contains('capture-hide');
        },
        onclone: (clonedDoc, clonedElement) => {
          clonedElement.style.width = 'auto';
          clonedElement.style.height = 'auto';
          clonedElement.style.overflow = 'visible';
          clonedElement.style.maxWidth = 'none';
          clonedElement.style.maxHeight = 'none';
          
          const hideElements = clonedElement.querySelectorAll('.capture-hide');
          hideElements.forEach(el => {
            el.style.display = 'none';
          });

          const tables = clonedElement.querySelectorAll('table');
          tables.forEach(table => {
            table.style.width = 'auto';
            table.style.minWidth = '100%';
            table.style.tableLayout = 'auto';
          });

          const tableContainers = clonedElement.querySelectorAll('.overflow-x-auto');
          tableContainers.forEach(container => {
            container.style.overflow = 'visible';
            container.style.width = 'auto';
          });
        }
      });

      // Clear progress alert
      if (progressAlert) {
        clearTimeout(progressAlert);
      }

      // Restore original styles
      Object.keys(originalStyle).forEach(key => {
        element.style[key] = originalStyle[key];
      });

      // Restore button visibility
      buttons.forEach((btn, index) => {
        btn.style.display = originalDisplay[index];
      });

      console.log('Canvas generated successfully');
      console.log('Canvas dimensions:', {
        width: canvas.width,
        height: canvas.height,
        sizeEstimate: `${Math.round(canvas.width * canvas.height / 1000000)}MP`
      });

      // Create and trigger download
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      const totalRows = cloudData.rows.length + backupData.rows.length;
      link.download = `BizTras_Infrastructure_Report_${timestamp}_${totalRows}rows.png`;
      link.href = canvas.toDataURL('image/png', 0.9);
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Image capture completed successfully');
      
      // Show completion message with file info
      const fileSizeMB = Math.round(canvas.toDataURL('image/png', 0.9).length * 0.75 / 1024 / 1024);
      window.alert(
        `Report image downloaded successfully!\n\n` +
        `📊 Captured: ${totalRows} total rows\n` +
        `📐 Dimensions: ${canvas.width} x ${canvas.height}px\n` +
        `💾 Estimated size: ~${fileSizeMB}MB\n\n` +
        `Tip: For very large reports, consider using "Print Report" for better page management.`
      );
      
    } catch (error) {
      console.error('Error capturing image:', error);
      window.alert(`Error capturing image: ${error.message}. \n\nFor large datasets, try using "Print Report" instead.`);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    // Function to convert logo to base64 for printing
    const getLogoBase64 = () => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
          const canvas = document.createElement('canvas');
          canvas.width = this.width;
          canvas.height = this.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(this, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = function() {
          resolve(null); // Fallback if logo fails to load
        };
        img.src = '/biztras.png';
      });
    };

    // Generate table rows for cloud data exactly like the image - REMOVED DUMMY DATA
    const generateCloudRows = () => {
      return cloudData.rows.map((row, index) => {
        const serialNo = index + 1;
        const serverName = row['Server'] || ''; // NO DUMMY DATA - show empty if no data
        
        // Use the exact weekday order from the image: Saturday, Sunday, Monday, Tuesday, Wednesday, Thursday, Friday
        const weekdays = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const weekdayCells = weekdays.map(day => {
          const value = row[day] || ''; // NO DUMMY DATA - show empty if no actual data
          const colors = getStatusColor(value, false, true);
          return `<td style="
            background-color: ${colors.bg}; 
            color: ${colors.color}; 
            text-align: center; 
            padding: 2px 1px; 
            font-weight: bold; 
            font-size: 5px;
            border: 1px solid #000;
          ">${value}</td>`;
        }).join('');
        
        const sslExpiry = row['SSL Expiry'] ? formatDate(row['SSL Expiry']) : '';
        const serverStatus = row['Status'] || ''; // NO DUMMY DATA - show empty if no actual data
        const statusColor = getStatusColor(serverStatus, false, true);
        const remarks = row['Remarks'] || '';
        
        return `
          <tr>
            <td style="text-align: center; padding: 2px 1px; border: 1px solid #000; font-size: 5px;">${serialNo}</td>
            <td style="text-align: left; padding: 2px 1px; border: 1px solid #000; font-size: 5px; font-weight: 500; text-transform: uppercase;">${serverName}</td>
            ${weekdayCells}
            <td style="text-align: center; padding: 2px 1px; border: 1px solid #000; font-size: 5px;">${sslExpiry}</td>
            <td style="
              background-color: ${statusColor.bg}; 
              color: ${statusColor.color}; 
              text-align: center; 
              padding: 2px 1px; 
              font-weight: bold; 
              font-size: 5px;
              border: 1px solid #000;
            ">${serverStatus}</td>
            <td style="text-align: left; padding: 2px 1px; border: 1px solid #000; font-size: 5px;">${remarks}</td>
          </tr>
        `;
      }).join('');
    };

    // Generate table rows for backup data - REMOVED DUMMY DATA
    const generateBackupRows = () => {
      return backupData.rows.map((row, index) => {
        const serialNo = index + 1;
        const serverName = row['Server'] || ''; // NO DUMMY DATA - show empty if no data
        const serverStatus = row['SERVER STATUS'] || ''; // NO DUMMY DATA - show empty if no actual data
        const statusColor = getStatusColor(serverStatus, true, false);
        
        // Backup weekday order: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const weekdayCells = weekdays.map(day => {
          const value = row[day] || ''; // NO DUMMY DATA - show empty if no actual data
          const colors = getStatusColor(value, false, false);
          return `<td style="
            background-color: ${colors.bg}; 
            color: ${colors.color}; 
            text-align: center; 
            padding: 6px 4px; 
            font-weight: bold; 
            font-size: 10px;
            border: 1px solid #000;
          ">${value}</td>`;
        }).join('');
        
        const remarks = row['Remarks'] || '';
        
        return `
          <tr>
            <td style="text-align: center; padding: 2px 1px; border: 1px solid #000; font-size: 5px;">${serialNo}</td>
            <td style="text-align: left; padding: 2px 1px; border: 1px solid #000; font-size: 5px; font-weight: 500; text-transform: uppercase;">${serverName}</td>
            <td style="
              background-color: ${statusColor.bg}; 
              color: ${statusColor.color}; 
              text-align: center; 
              padding: 2px 1px; 
              font-weight: bold; 
              font-size: 5px;
              border: 1px solid #000;
            ">${serverStatus}</td>
            ${weekdayCells}
            <td style="text-align: left; padding: 2px 1px; border: 1px solid #000; font-size: 5px;">${remarks}</td>
          </tr>
        `;
      }).join('');
    };

    // Generate print content with logo
    const generatePrintContent = async () => {
      const logoBase64 = await getLogoBase64();
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Infrastructure Reports - BizTras Cloud</title>
          <style>
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              color: #000; 
              background: #fff; 
              line-height: 1.2;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 25px;
              padding-bottom: 20px;
              border-bottom: 2px solid #4a90e2;
            }
            .logo {
              width: 80px;
              height: 80px;
              margin: 0 auto 15px auto;
              display: block;
              border-radius: 12px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #4a90e2;
              margin-bottom: 10px;
            }
            .nav-bar {
              text-align: center;
              margin-bottom: 20px;
              font-size: 14px;
            }
            .nav-bar a {
              color: #007bff;
              text-decoration: none;
              margin: 0 20px;
              cursor: pointer;
            }
            .nav-bar a:hover {
              text-decoration: underline;
            }
            .report-section {
              margin-bottom: 40px;
              page-break-inside: avoid;
            }
            .report-title {
              font-size: 28px;
              font-weight: bold;
              margin: 20px 0;
              text-align: center;
              color: #000;
              letter-spacing: 1px;
              text-transform: uppercase;
            }
            .report-summary {
              text-align: center;
              margin-bottom: 20px;
              background: #f8f9fa;
              padding: 12px;
              border-radius: 6px;
              max-width: 400px;
              margin-left: auto;
              margin-right: auto;
              border: 1px solid #dee2e6;
            }
            .report-summary h3 {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #000;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 6px;
              text-align: left;
            }
            .summary-item {
              font-size: 10px;
              color: #333;
            }
            .summary-item strong {
              color: #000;
              font-weight: bold;
            }
            .space-used {
              grid-column: 1 / -1;
              text-align: center;
              font-size: 11px;
              font-weight: bold;
              color: #4a90e2;
              margin-top: 6px;
              padding: 6px;
              background: #e3f2fd;
              border-radius: 4px;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 8px;
              box-shadow: 0 3px 6px rgba(0,0,0,0.15);
              border-radius: 6px;
              overflow: hidden;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .data-table th {
              background-color: #4a90e2 !important;
              color: white !important;
              padding: 6px 3px;
              text-align: center;
              border: 1px solid #000;
              font-weight: bold;
              font-size: 8px;
              text-transform: uppercase;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .data-table td {
              padding: 4px 2px;
              border: 1px solid #000;
              text-align: center;
              vertical-align: middle;
              font-size: 8px;
            }
            .data-table tbody tr:nth-child(even) {
              background-color: #f8f9fa !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            @page { 
              size: A4 landscape; 
              margin: 8mm; 
            }
            @media print { 
              body { 
                margin: 0; 
                padding: 15px;
                transform: scale(0.85);
                transform-origin: top left;
              } 
              .no-print { 
                display: none !important; 
              } 
              .print-btn {
                display: none !important;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${logoBase64 ? `<img src="${logoBase64}" alt="BizTras Logo" class="logo" />` : ''}
            <div class="company-name">BIZTRAS CLOUD</div>
            <div class="nav-bar no-print">
              <a href="#" onclick="window.print()">Report</a>
            </div>
          </div>

          <!-- CLOUD SERVICES REPORT SECTION -->
          <div class="report-section">
            <h1 class="report-title">${cloudData.reportTitle || 'CLOUD SERVICES REPORT'}</h1>
            
            <div style="text-align: center; margin-bottom: 8px;">
              <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 6px; color: #000;">Report Summary</h3>
              <div style="font-size: 11px; color: #333; margin: 2px 0; line-height: 1.2;"><strong>Start Date:</strong> ${formatDate(cloudData.reportDates?.startDate)}</div>
              <div style="font-size: 11px; color: #333; margin: 2px 0; line-height: 1.2;"><strong>End Date:</strong> ${formatDate(cloudData.reportDates?.endDate)}</div>
              ${cloudData.totalSpaceUsed ? `<div style="font-size: 12px; font-weight: bold; color: #4a90e2; margin: 3px 0;"><strong>Total Space Used:</strong> ${cloudData.totalSpaceUsed}</div>` : ''}
            </div>

            <!-- Cloud Services Table -->
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 60px;">Serial No</th>
                  <th style="width: 200px;">Server Name</th>
                  <th style="width: 80px;">Saturday</th>
                  <th style="width: 80px;">Sunday</th>
                  <th style="width: 80px;">Monday</th>
                  <th style="width: 80px;">Tuesday</th>
                  <th style="width: 80px;">Wednesday</th>
                  <th style="width: 80px;">Thursday</th>
                  <th style="width: 80px;">Friday</th>
                  <th style="width: 100px;">SSL Expiry Date</th>
                  <th style="width: 100px;">Server Status</th>
                  <th style="width: 200px;">Remark</th>
                </tr>
              </thead>
              <tbody>
                ${generateCloudRows()}
              </tbody>
            </table>
          </div>

          ${backupData.rows.length > 0 ? `
          <!-- BACKUP SERVERS REPORT SECTION -->
          <div class="report-section">
            <h1 class="report-title">${backupData.reportTitle || 'BACKUP SERVERS REPORT'}</h1>
            
            <div style="text-align: center; margin-bottom: 8px;">
              <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 6px; color: #000;">Report Summary</h3>
              <div style="font-size: 11px; color: #333; margin: 2px 0; line-height: 1.2;"><strong>Start Date:</strong> ${formatDate(backupData.reportDates?.startDate)}</div>
              <div style="font-size: 11px; color: #333; margin: 2px 0; line-height: 1.2;"><strong>End Date:</strong> ${formatDate(backupData.reportDates?.endDate)}</div>
            </div>

            <!-- Backup Servers Table -->
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 60px;">Serial No</th>
                  <th style="width: 200px;">Server Name</th>
                  <th style="width: 120px;">SERVER STATUS</th>
                  <th style="width: 80px;">Monday</th>
                  <th style="width: 80px;">Tuesday</th>
                  <th style="width: 80px;">Wednesday</th>
                  <th style="width: 80px;">Thursday</th>
                  <th style="width: 80px;">Friday</th>
                  <th style="width: 80px;">Saturday</th>
                  <th style="width: 80px;">Sunday</th>
                  <th style="width: 200px;">Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${generateBackupRows()}
              </tbody>
            </table>
          </div>
          ` : ''}
          
          <script>
            window.onload = function() {
              // Optional: Auto print when page loads
              // setTimeout(function() { window.print(); }, 1000);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    };

    generatePrintContent();
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-6`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-3 sm:space-y-0 capture-hide">
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

          {/* Data Size Indicator */}
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} text-center`}>
            📊 Report Size: {cloudData.rows.length + backupData.rows.length} total rows
            {cloudData.rows.length + backupData.rows.length > 50 && (
              <span className="ml-2 text-amber-600 dark:text-amber-400">
                (Large dataset - consider paginated capture)
              </span>
            )}
          </div>
          
          <div className="flex space-x-3">
            {/* Image Capture Dropdown */}
            <div className="capture-dropdown">
              <button
                onClick={captureImage}
                className="inline-flex items-center px-6 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
              >
                <FiCamera className="mr-2" />
                Capture Image
              </button>
              
              {/* Dropdown Menu */}
              <div className="dropdown-content w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="py-2">
                  <button
                    onClick={captureImage}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    📷 Single Image
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Capture entire report as one image
                    </div>
                  </button>
                  
                  <button
                    onClick={capturePaginatedImages}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    📚 Multiple Pages
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Split into multiple page images
                    </div>
                  </button>
                  
                  <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                    <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                      💡 For large reports (50+ rows), use multiple pages or print option
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-6 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              <FiPrinter className="mr-2" />
              Print Report
            </button>
          </div>
        </div>

        {/* Screen Preview - Matches Print Exactly */}
        {/* MAIN REPORT CONTAINER - THIS IS WHERE THE REF IS ATTACHED */}
        <div 
          ref={reportRef}
          data-capture-target="true"
          className={`rounded-xl shadow-lg overflow-hidden ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
          style={{ 
            minWidth: 'fit-content',
            width: '100%'
          }}
        >
          {/* Header with Logo */}
          <div className="text-center py-8 px-6 border-b-2 border-blue-600">
            <img 
              src="/biztras.png" 
              alt="BizTras Logo" 
              className="w-20 h-20 mx-auto mb-4 rounded-xl shadow-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="text-2xl font-bold text-blue-600 mb-4">BIZTRAS CLOUD</div>
            
            {/* Navigation Bar */}
            <div className="mb-6 capture-hide">
              <span className="text-blue-600 mx-4 cursor-pointer hover:underline text-sm">Report</span>
            </div>
          </div>

          {/* CLOUD SERVICES REPORT SECTION */}
          <div className="p-6 border-b-4 border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl font-bold mb-6 tracking-wide text-center uppercase">
              {cloudData.reportTitle || 'CLOUD SERVICES REPORT'}
            </h1>
            
            {/* Cloud Report Summary - Simple Text Format */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold mb-4">Report Summary</h3>
              <div className="space-y-1 text-sm">
                <div><strong>Start Date:</strong> {formatDate(cloudData.reportDates?.startDate)}</div>
                <div><strong>End Date:</strong> {formatDate(cloudData.reportDates?.endDate)}</div>
                {cloudData.totalSpaceUsed && (
                  <div className="text-blue-600 font-bold mt-2">
                    <strong>Total Space Used:</strong> {cloudData.totalSpaceUsed}
                  </div>
                )}
              </div>
            </div>

            {/* Cloud Services Table */}
            <div className="overflow-x-auto capture-table-container">
              <table className="w-full border-collapse border-2 border-black min-w-max capture-table">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="border border-black px-2 py-3 text-xs font-bold whitespace-nowrap">Serial No</th>
                    <th className="border border-black px-4 py-3 text-xs font-bold whitespace-nowrap">Server Name</th>
                    <th className="border border-black px-2 py-3 text-xs font-bold whitespace-nowrap">Saturday</th>
                    <th className="border border-black px-2 py-3 text-xs font-bold whitespace-nowrap">Sunday</th>
                    <th className="border border-black px-2 py-3 text-xs font-bold whitespace-nowrap">Monday</th>
                    <th className="border border-black px-2 py-3 text-xs font-bold whitespace-nowrap">Tuesday</th>
                    <th className="border border-black px-2 py-3 text-xs font-bold whitespace-nowrap">Wednesday</th>
                    <th className="border border-black px-2 py-3 text-xs font-bold whitespace-nowrap">Thursday</th>
                    <th className="border border-black px-2 py-3 text-xs font-bold whitespace-nowrap">Friday</th>
                    <th className="border border-black px-2 py-3 text-xs font-bold whitespace-nowrap">SSL Expiry Date</th>
                    <th className="border border-black px-2 py-3 text-xs font-bold whitespace-nowrap">Server Status</th>
                    <th className="border border-black px-4 py-3 text-xs font-bold whitespace-nowrap">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {cloudData.rows.map((row, index) => {
                    const serialNo = index + 1;
                    const serverName = row['Server'] || ''; // NO DUMMY DATA - show empty if no data
                    const serverStatus = row['Status'] || ''; // NO DUMMY DATA - show empty if no actual data
                    const statusColors = getStatusColor(serverStatus, false, true);
                    
                    return (
                      <tr key={index} className={index % 2 === 1 ? 'bg-gray-50 dark:bg-gray-700' : ''}>
                        <td className="border border-black px-2 py-2 text-center text-xs whitespace-nowrap">{serialNo}</td>
                        <td className="border border-black px-4 py-2 text-left text-xs font-medium uppercase whitespace-nowrap">{serverName}</td>
                        
                        {/* Weekday columns with colors - Saturday to Friday */}
                        {['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                          const value = row[day] || ''; // NO DUMMY DATA - show empty if no actual data
                          const colors = getStatusColor(value, false, true);
                          return (
                            <td 
                              key={day}
                              className="border border-black px-2 py-2 text-center text-xs font-bold whitespace-nowrap"
                              style={{ 
                                backgroundColor: colors.bg, 
                                color: colors.color 
                              }}
                            >
                              {value}
                            </td>
                          );
                        })}
                        
                        <td className="border border-black px-2 py-2 text-center text-xs whitespace-nowrap">
                          {row['SSL Expiry'] ? formatDate(row['SSL Expiry']) : ''}
                        </td>
                        <td 
                          className="border border-black px-2 py-2 text-center text-xs font-bold whitespace-nowrap"
                          style={{ 
                            backgroundColor: statusColors.bg, 
                            color: statusColors.color 
                          }}
                        >
                          {serverStatus}
                        </td>
                        <td className="border border-black px-4 py-2 text-left text-xs whitespace-nowrap">{row['Remarks'] || ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* BACKUP SERVERS REPORT SECTION */}
          {backupData.rows.length > 0 && (
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-6 tracking-wide text-center uppercase">
                {backupData.reportTitle || 'BACKUP SERVERS REPORT'}
              </h1>
              
              {/* Backup Report Summary - Simple Text Format */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold mb-4">Report Summary</h3>
                <div className="space-y-1 text-sm">
                  <div><strong>Start Date:</strong> {formatDate(backupData.reportDates?.startDate)}</div>
                  <div><strong>End Date:</strong> {formatDate(backupData.reportDates?.endDate)}</div>
                </div>
              </div>

              {/* Backup Servers Table */}
              <div className="overflow-x-auto capture-table-container">
                <table className="w-full border-collapse border-2 border-black min-w-max capture-table">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="border border-black px-2 py-3 text-xs font-bold whitespace-nowrap">Serial No</th>
                      <th className="border border-black px-4 py-3 text-xs font-bold whitespace-nowrap">Server Name</th>
                      <th className="border border-black px-3 py-3 text-xs font-bold whitespace-nowrap">SERVER STATUS</th>
                      <th className="border border-black px-2 py-3 text-xs font-bold whitespace-nowrap">Monday</th>
                      <th className="border border-black px-2 py-3 text-xs font-bold whitespace-nowrap">Tuesday</th>
                      <th className="border border-black px-2 py-3 text-xs font-bold whitespace-nowrap">Wednesday</th>
                      <th className="border border-black px-2 py-3 text-xs font-bold whitespace-nowrap">Thursday</th>
                      <th className="border border-black px-2 py-3 text-xs font-bold whitespace-nowrap">Friday</th>
                      <th className="border border-black px-2 py-3 text-xs font-bold whitespace-nowrap">Saturday</th>
                      <th className="border border-black px-2 py-3 text-xs font-bold whitespace-nowrap">Sunday</th>
                      <th className="border border-black px-4 py-3 text-xs font-bold whitespace-nowrap">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backupData.rows.map((row, index) => {
                      const serialNo = index + 1;
                      const serverName = row['Server'] || ''; // NO DUMMY DATA - show empty if no data
                      const serverStatus = row['SERVER STATUS'] || ''; // NO DUMMY DATA - show empty if no actual data
                      const statusColors = getStatusColor(serverStatus, true, false);
                      
                      return (
                        <tr key={index} className={index % 2 === 1 ? 'bg-gray-50 dark:bg-gray-700' : ''}>
                          <td className="border border-black px-2 py-2 text-center text-xs whitespace-nowrap">{serialNo}</td>
                          <td className="border border-black px-4 py-2 text-left text-xs font-medium uppercase whitespace-nowrap">{serverName}</td>
                          <td 
                            className="border border-black px-3 py-2 text-center text-xs font-bold whitespace-nowrap"
                            style={{ 
                              backgroundColor: statusColors.bg, 
                              color: statusColors.color 
                            }}
                          >
                            {serverStatus}
                          </td>
                          {/* Weekday columns Monday to Sunday */}
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                            const value = row[day] || ''; // NO DUMMY DATA - show empty if no actual data
                            const colors = getStatusColor(value, false, false);
                            return (
                              <td 
                                key={day}
                                className="border border-black px-2 py-2 text-center text-xs font-bold whitespace-nowrap"
                                style={{ 
                                  backgroundColor: colors.bg, 
                                  color: colors.color 
                                }}
                              >
                                {value}
                              </td>
                            );
                          })}
                          
                          <td className="border border-black px-4 py-2 text-left text-xs whitespace-nowrap">{row['Remarks'] || ''}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CloudPrintPreview;