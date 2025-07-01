import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import { 
  FiPlus, 
  FiTrash2, 
  FiDownload, 
  FiEye, 
  FiSave,
  FiRefreshCw,
  FiSettings,
  FiCheck,
  FiX,
  FiMove
} from 'react-icons/fi';
import api from '../../services/api';
import CloudPrintPreview from './CloudPrintPreview';

// Drag and Drop Column Component
const DraggableColumn = ({ column, index, onRemove, onDragStart, onDragOver, onDrop, isDark, isBeingDragged }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-move ${
        isBeingDragged 
          ? 'opacity-50 scale-95' 
          : isDark 
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } ${isDark ? 'border border-gray-600' : 'border border-gray-300'}`}
    >
      <FiMove className="mr-2 text-gray-400" size={14} />
      <span className="flex-1">{column}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        className={`ml-2 p-1 rounded text-error-500 hover:text-error-700 focus:outline-none transition-colors ${
          isDark ? 'hover:text-error-400 hover:bg-error-900/20' : 'hover:text-error-600 hover:bg-error-50'
        }`}
      >
        <FiTrash2 size={12} />
      </button>
    </div>
  );
};

// Enhanced Status Select Component with Server Status Support
const StyledStatusSelect = ({ value, onChange, isDark, isCloudStatus = false, isServerStatus = false }) => {
  const getBackgroundColor = (val) => {
    if (!val) return isDark ? '#374151' : '#ffffff';
    
    const normalizedVal = val.toUpperCase();
    
    if (isServerStatus) {
      switch (normalizedVal) {
        case 'ONLINE':
          return '#10b981';
        case 'OFFLINE':
          return '#ef4444';
        default:
          return isDark ? '#374151' : '#ffffff';
      }
    } else if (isCloudStatus) {
      switch (normalizedVal) {
        case 'AUTOMATIC':
        case 'ONLINE':
          return '#10b981';
        case 'MANUAL':
        case 'MAINTENANCE':
          return '#f59e0b';
        case 'FAILED':
        case 'OFFLINE':
          return '#ef4444';
        case 'IN PROGRESS':
          return '#3b82f6';
        case 'N/A':
          return '#6b7280';
        default:
          return isDark ? '#374151' : '#ffffff';
      }
    } else {
      switch (normalizedVal) {
        case 'RUNNING':
          return '#10b981';
        case 'NOT RUNNING':
          return '#ef4444';
        case 'N/A':
          return '#6b7280';
        default:
          return isDark ? '#374151' : '#ffffff';
      }
    }
  };

  const getTextColor = (val) => {
    if (!val) return isDark ? '#ffffff' : '#000000';
    
    const normalizedVal = val.toUpperCase();
    if (normalizedVal === 'MANUAL' || normalizedVal === 'MAINTENANCE') {
      return '#000000';
    }
    return val ? '#ffffff' : (isDark ? '#ffffff' : '#000000');
  };

  const backgroundColor = getBackgroundColor(value);
  const textColor = getTextColor(value);

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      style={{
        backgroundColor,
        color: textColor,
        fontWeight: value ? 'bold' : 'normal',
        transition: 'all 0.2s ease-in-out'
      }}
      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center transition-all duration-200 ${
        isDark 
          ? 'border-gray-600' 
          : 'border-gray-300'
      }`}
    >
      {isServerStatus ? (
        <>
          <option value="" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
            Select Status
          </option>
          <option value="ONLINE" style={{ backgroundColor: '#10b981', color: '#ffffff' }}>
            ONLINE
          </option>
          <option value="OFFLINE" style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>
            OFFLINE
          </option>
        </>
      ) : isCloudStatus ? (
        <>
          <option value="" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
            Select Status
          </option>
          <option value="AUTOMATIC" style={{ backgroundColor: '#10b981', color: '#ffffff' }}>
            AUTOMATIC
          </option>
          <option value="MANUAL" style={{ backgroundColor: '#f59e0b', color: '#000000' }}>
            MANUAL
          </option>
          <option value="FAILED" style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>
            FAILED
          </option>
          <option value="IN PROGRESS" style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}>
            IN PROGRESS
          </option>
          <option value="ONLINE" style={{ backgroundColor: '#10b981', color: '#ffffff' }}>
            ONLINE
          </option>
          <option value="MAINTENANCE" style={{ backgroundColor: '#f59e0b', color: '#000000' }}>
            MAINTENANCE
          </option>
          <option value="OFFLINE" style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>
            OFFLINE
          </option>
          <option value="N/A" style={{ backgroundColor: '#6b7280', color: '#ffffff' }}>
            N/A
          </option>
        </>
      ) : (
        <>
          <option value="" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
            Select Status
          </option>
          <option value="RUNNING" style={{ backgroundColor: '#10b981', color: '#ffffff' }}>
            RUNNING
          </option>
          <option value="NOT RUNNING" style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>
            NOT RUNNING
          </option>
          <option value="N/A" style={{ backgroundColor: '#6b7280', color: '#ffffff' }}>
            N/A
          </option>
        </>
      )}
    </select>
  );
};

// Configuration Edit Modal Component
const ConfigurationModal = ({ 
  isOpen, 
  onClose, 
  type, 
  config, 
  onSave, 
  isDark 
}) => {
  const [formData, setFormData] = useState(config);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
      toast.success(`${type} configuration updated successfully!`);
    } catch (error) {
      toast.error(`Failed to update ${type} configuration`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`card w-full max-w-md mx-auto animate-scale-in ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {type} Configuration
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">
                Report Title
              </label>
              <input
                type="text"
                value={formData.reportTitle || ''}
                onChange={(e) => setFormData({ ...formData, reportTitle: e.target.value })}
                className="input"
                placeholder={`${type} Report Title`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.reportDates?.startDate || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    reportDates: { 
                      ...formData.reportDates, 
                      startDate: e.target.value 
                    } 
                  })}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.reportDates?.endDate || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    reportDates: { 
                      ...formData.reportDates, 
                      endDate: e.target.value 
                    } 
                  })}
                  className="input"
                />
              </div>
            </div>

            {type === 'Cloud Service' && (
              <div className="form-group">
                <label className="form-label">
                  Total Space Used
                </label>
                <input
                  type="text"
                  value={formData.totalSpaceUsed || ''}
                  onChange={(e) => setFormData({ ...formData, totalSpaceUsed: e.target.value })}
                  className="input"
                  placeholder="e.g., 2.5TB"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="btn btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Main Cloud Dashboard Component
const CloudDashboard = () => {
  // Cloud Data State
  const [cloudColumns, setCloudColumns] = useState(['Server', 'Status', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'SSL Expiry', 'Space Used', 'Remarks']);
  const [cloudRows, setCloudRows] = useState([]);
  const [cloudReportTitle, setCloudReportTitle] = useState('Cloud Status Report');
  const [cloudReportDates, setCloudReportDates] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [cloudTotalSpaceUsed, setCloudTotalSpaceUsed] = useState('');

  // Backup Data State with SERVER STATUS column included
  const [backupColumns, setBackupColumns] = useState(['Server', 'SERVER STATUS', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Remarks']);
  const [backupRows, setBackupRows] = useState([]);
  const [backupReportTitle, setBackupReportTitle] = useState('Backup Server Cronjob Status');
  const [backupReportDates, setBackupReportDates] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Common State
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState('cloud');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Column management states
  const [newCloudColumnName, setNewCloudColumnName] = useState('');
  const [newBackupColumnName, setNewBackupColumnName] = useState('');

  // Drag and drop states
  const [draggedCloudIndex, setDraggedCloudIndex] = useState(null);
  const [draggedBackupIndex, setDraggedBackupIndex] = useState(null);

  // Modal states
  const [showCloudConfigModal, setShowCloudConfigModal] = useState(false);
  const [showBackupConfigModal, setShowBackupConfigModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  // Auto-save timeout ref
  const autoSaveTimeoutRef = useRef(null);

  // Check if we're in preview mode
  const isPreviewMode = new URLSearchParams(location.search).get('preview') === 'true';

  // Auto-save function with debouncing
  const autoSave = useCallback(async () => {
    if (!hasUnsavedChanges) return;
    
    try {
      const cloudPayload = {
        reportTitle: cloudReportTitle,
        reportDates: cloudReportDates,
        columns: cloudColumns,
        rows: cloudRows,
        totalSpaceUsed: cloudTotalSpaceUsed
      };
      
      const backupPayload = {
        reportTitle: backupReportTitle,
        reportDates: backupReportDates,
        columns: backupColumns,
        rows: backupRows
      };
      
      await Promise.all([
        api.post('/cloud-report/save', cloudPayload),
        api.post('/backup-server/save', backupPayload)
      ]);
      
      setHasUnsavedChanges(false);
      setLastUpdated(new Date().toISOString());
      console.log('Auto-saved successfully');
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  }, [
    hasUnsavedChanges,
    cloudReportTitle,
    cloudReportDates,
    cloudColumns,
    cloudRows,
    cloudTotalSpaceUsed,
    backupReportTitle,
    backupReportDates,
    backupColumns,
    backupRows
  ]);

  // Debounced auto-save
  const debouncedAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, [autoSave]);

  // Mark as changed and trigger auto-save
  const markAsChanged = useCallback(() => {
    setHasUnsavedChanges(true);
    debouncedAutoSave();
  }, [debouncedAutoSave]);

  // Drag and drop handlers for Cloud columns
  const handleCloudColumnDragStart = (e, index) => {
    setDraggedCloudIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCloudColumnDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleCloudColumnDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedCloudIndex === null || draggedCloudIndex === dropIndex) {
      setDraggedCloudIndex(null);
      return;
    }

    const newColumns = [...cloudColumns];
    const draggedColumn = newColumns[draggedCloudIndex];
    
    // Remove the dragged item
    newColumns.splice(draggedCloudIndex, 1);
    
    // Insert at new position
    newColumns.splice(dropIndex, 0, draggedColumn);
    
    setCloudColumns(newColumns);
    setDraggedCloudIndex(null);
    markAsChanged();
    
    toast.success('Cloud columns reordered successfully!');
  };

  // Drag and drop handlers for Backup columns
  const handleBackupColumnDragStart = (e, index) => {
    setDraggedBackupIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleBackupColumnDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleBackupColumnDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedBackupIndex === null || draggedBackupIndex === dropIndex) {
      setDraggedBackupIndex(null);
      return;
    }

    const newColumns = [...backupColumns];
    const draggedColumn = newColumns[draggedBackupIndex];
    
    // Remove the dragged item
    newColumns.splice(draggedBackupIndex, 1);
    
    // Insert at new position
    newColumns.splice(dropIndex, 0, draggedColumn);
    
    setBackupColumns(newColumns);
    setDraggedBackupIndex(null);
    markAsChanged();
    
    toast.success('Backup columns reordered successfully!');
  };

  // Fetch both cloud and backup data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch cloud data
      const cloudResponse = await api.get('/cloud-report/data');
      if (cloudResponse && cloudResponse.data) {
        const { reportTitle, reportDates, columns, rows, totalSpaceUsed, updatedAt } = cloudResponse.data;
        setCloudReportTitle(reportTitle || 'Cloud Status Report');
        
        const cloudDates = reportDates || {};
        setCloudReportDates({
          startDate: cloudDates.startDate ? new Date(cloudDates.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          endDate: cloudDates.endDate ? new Date(cloudDates.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
        
        setCloudColumns(columns || ['Server', 'Status', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'SSL Expiry', 'Space Used', 'Remarks']);
        setCloudRows(rows || []);
        setCloudTotalSpaceUsed(totalSpaceUsed || '');
        setLastUpdated(updatedAt);
      }

      // Fetch backup data
      const backupResponse = await api.get('/backup-server/data');
      if (backupResponse && backupResponse.data) {
        const { reportTitle, reportDates, columns, rows } = backupResponse.data;
        setBackupReportTitle(reportTitle || 'Backup Server Cronjob Status');
        
        const backupDates = reportDates || {};
        setBackupReportDates({
          startDate: backupDates.startDate ? new Date(backupDates.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          endDate: backupDates.endDate ? new Date(backupDates.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
        
        // Include SERVER STATUS column by default if not present
        const defaultBackupColumns = ['Server', 'SERVER STATUS', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Remarks'];
        setBackupColumns(columns || defaultBackupColumns);
        setBackupRows(rows || []);
      }
      
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Error fetching cloud dashboard data:', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save both datasets manually
  const saveData = async () => {
    try {
      setSaveLoading(true);
      
      const cloudPayload = {
        reportTitle: cloudReportTitle,
        reportDates: cloudReportDates,
        columns: cloudColumns,
        rows: cloudRows,
        totalSpaceUsed: cloudTotalSpaceUsed
      };
      
      const backupPayload = {
        reportTitle: backupReportTitle,
        reportDates: backupReportDates,
        columns: backupColumns,
        rows: backupRows
      };
      
      await Promise.all([
        api.post('/cloud-report/save', cloudPayload),
        api.post('/backup-server/save', backupPayload)
      ]);
      
      toast.success('Cloud dashboard data saved successfully!');
      setLastUpdated(new Date().toISOString());
      setHasUnsavedChanges(false);
      return true;
    } catch (err) {
      console.error('Error saving cloud dashboard data:', err);
      toast.error('Failed to save dashboard data');
      return false;
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle configuration updates
  const handleCloudConfigSave = async (config) => {
    setCloudReportTitle(config.reportTitle);
    setCloudReportDates(config.reportDates);
    setCloudTotalSpaceUsed(config.totalSpaceUsed);
    markAsChanged();
  };

  const handleBackupConfigSave = async (config) => {
    setBackupReportTitle(config.reportTitle);
    setBackupReportDates(config.reportDates);
    markAsChanged();
  };

  // Cloud Column Management
  const handleAddCloudColumn = () => {
    if (newCloudColumnName.trim() && !cloudColumns.includes(newCloudColumnName.trim())) {
      setCloudColumns([...cloudColumns, newCloudColumnName.trim()]);
      setNewCloudColumnName('');
      markAsChanged();
      toast.success(`Cloud column "${newCloudColumnName}" added successfully!`);
    } else if (cloudColumns.includes(newCloudColumnName.trim())) {
      toast.error('Column already exists!');
    } else {
      toast.error('Please enter a valid column name');
    }
  };

  const handleRemoveCloudColumn = (indexToRemove) => {
    const columnToRemove = cloudColumns[indexToRemove];
    setCloudColumns(cloudColumns.filter((_, index) => index !== indexToRemove));
    
    const updatedRows = cloudRows.map(row => {
      const newRow = { ...row };
      delete newRow[columnToRemove];
      return newRow;
    });
    setCloudRows(updatedRows);
    markAsChanged();
    
    toast.success(`Cloud column "${columnToRemove}" removed successfully!`);
  };

  // Backup Column Management
  const handleAddBackupColumn = () => {
    if (newBackupColumnName.trim() && !backupColumns.includes(newBackupColumnName.trim())) {
      setBackupColumns([...backupColumns, newBackupColumnName.trim()]);
      setNewBackupColumnName('');
      markAsChanged();
      toast.success(`Backup column "${newBackupColumnName}" added successfully!`);
    } else if (backupColumns.includes(newBackupColumnName.trim())) {
      toast.error('Column already exists!');
    } else {
      toast.error('Please enter a valid column name');
    }
  };

  const handleRemoveBackupColumn = (indexToRemove) => {
    const columnToRemove = backupColumns[indexToRemove];
    setBackupColumns(backupColumns.filter((_, index) => index !== indexToRemove));
    
    const updatedRows = backupRows.map(row => {
      const newRow = { ...row };
      delete newRow[columnToRemove];
      return newRow;
    });
    setBackupRows(updatedRows);
    markAsChanged();
    
    toast.success(`Backup column "${columnToRemove}" removed successfully!`);
  };

  // Row Management
  const handleAddCloudRow = () => {
    const newRow = {};
    cloudColumns.forEach(column => {
      newRow[column] = '';
    });
    setCloudRows([...cloudRows, newRow]);
    markAsChanged();
    toast.success('New cloud service row added successfully!');
  };

  const handleRemoveCloudRow = (indexToRemove) => {
    setCloudRows(cloudRows.filter((_, index) => index !== indexToRemove));
    markAsChanged();
    toast.success('Cloud service row removed successfully!');
  };

  const handleCloudCellChange = (rowIndex, column, value) => {
    const updatedRows = [...cloudRows];
    updatedRows[rowIndex][column] = value;
    setCloudRows(updatedRows);
    markAsChanged();
  };

  const handleAddBackupRow = () => {
    const newRow = {};
    backupColumns.forEach(column => {
      newRow[column] = '';
    });
    setBackupRows([...backupRows, newRow]);
    markAsChanged();
    toast.success('New backup server row added successfully!');
  };

  const handleRemoveBackupRow = (indexToRemove) => {
    setBackupRows(backupRows.filter((_, index) => index !== indexToRemove));
    markAsChanged();
    toast.success('Backup server row removed successfully!');
  };

  const handleBackupCellChange = (rowIndex, column, value) => {
    const updatedRows = [...backupRows];
    updatedRows[rowIndex][column] = value;
    setBackupRows(updatedRows);
    markAsChanged();
  };

  // Toggle preview mode
  const togglePreviewMode = () => {
    if (!isPreviewMode) {
      // Auto-save before preview
      if (hasUnsavedChanges) {
        autoSave().then(() => {
          navigate('/cloud-dashboard?preview=true');
        });
      } else {
        navigate('/cloud-dashboard?preview=true');
      }
    } else {
      navigate('/cloud-dashboard');
    }
  };

  // Prepare report data for preview
  const getReportData = () => {
    return {
      cloudData: {
        reportTitle: cloudReportTitle,
        reportDates: cloudReportDates,
        columns: cloudColumns,
        rows: cloudRows,
        totalSpaceUsed: cloudTotalSpaceUsed
      },
      backupData: {
        reportTitle: backupReportTitle,
        reportDates: backupReportDates,
        columns: backupColumns,
        rows: backupRows
      },
      lastUpdated
    };
  };

  // Cell rendering
  const renderCloudCell = (row, column, rowIndex) => {
    const isStatusColumn = column === 'Status';
    const isWeekdayColumn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(column);
    const isSSLColumn = column === 'SSL Expiry';

    if (isStatusColumn || isWeekdayColumn) {
      return (
        <StyledStatusSelect
          value={row[column] || ''}
          onChange={(newValue) => handleCloudCellChange(rowIndex, column, newValue)}
          isDark={isDark}
          isCloudStatus={true}
        />
      );
    } else if (isSSLColumn) {
      return (
        <input
          type="date"
          value={row[column] || ''}
          onChange={(e) => handleCloudCellChange(rowIndex, column, e.target.value)}
          className="input"
        />
      );
    } else {
      return (
        <input
          type="text"
          value={row[column] || ''}
          onChange={(e) => handleCloudCellChange(rowIndex, column, e.target.value)}
          className="input"
        />
      );
    }
  };

  const renderBackupCell = (row, column, rowIndex) => {
    const isWeekdayColumn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(column);
    const isServerStatusColumn = column === 'SERVER STATUS';

    if (isServerStatusColumn) {
      return (
        <StyledStatusSelect
          value={row[column] || ''}
          onChange={(newValue) => handleBackupCellChange(rowIndex, column, newValue)}
          isDark={isDark}
          isServerStatus={true}
        />
      );
    } else if (isWeekdayColumn) {
      return (
        <StyledStatusSelect
          value={row[column] || ''}
          onChange={(newValue) => handleBackupCellChange(rowIndex, column, newValue)}
          isDark={isDark}
          isCloudStatus={false}
        />
      );
    } else {
      return (
        <input
          type="text"
          value={row[column] || ''}
          onChange={(e) => handleBackupCellChange(rowIndex, column, e.target.value)}
          className="input"
        />
      );
    }
  };

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Render preview mode
  if (isPreviewMode) {
    const reportData = getReportData();
    return <CloudPrintPreview cloudData={reportData.cloudData} backupData={reportData.backupData} />;
  }

  // Loading state
  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center animate-fade-in">
          <div className={`animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4 ${
            isDark ? 'border-primary-400' : 'border-primary-600'
          }`}></div>
          <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading cloud dashboard data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-6`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Cloud Infrastructure Dashboard
            </h1>
            <p className={`mt-2 text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage cloud services and backup server configurations
            </p>
            {hasUnsavedChanges && (
              <p className={`mt-1 text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                ● Unsaved changes (auto-saving...)
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            
            <button
              onClick={togglePreviewMode}
              className="btn btn-secondary"
            >
              <FiEye className="mr-2" />
              Preview & Print
            </button>
            
            <button
              onClick={saveData}
              disabled={saveLoading}
              className={`btn ${saveLoading ? 'btn-secondary opacity-50' : 'btn-primary'}`}
            >
              <FiSave className="mr-2" />
              {saveLoading ? 'Saving...' : 'Save Now'}
            </button>
            
            <button
              onClick={fetchData}
              disabled={loading}
              className="btn btn-secondary"
            >
              <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-error-50 border border-error-200 text-error-700 dark:bg-error-900/20 dark:border-error-800 dark:text-error-400">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="card mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('cloud')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                activeTab === 'cloud'
                  ? isDark
                    ? 'border-b-2 border-primary-400 text-primary-400 bg-gray-700'
                    : 'border-b-2 border-primary-500 text-primary-600 bg-primary-50'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ☁️ Cloud Services ({cloudRows.length})
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                activeTab === 'backup'
                  ? isDark
                    ? 'border-b-2 border-success-400 text-success-400 bg-gray-700'
                    : 'border-b-2 border-success-500 text-success-600 bg-success-50'
                  : isDark
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🗄️ Backup Servers ({backupRows.length})
            </button>
          </div>
        </div>

        {/* Cloud Services Tab */}
        {activeTab === 'cloud' && (
          <div className="space-y-6">
            {/* Cloud Configuration Header */}
            <div className="card p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Cloud Service Configuration
                  </h2>
                  <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {cloudReportTitle} • {formatDate(cloudReportDates.startDate)} - {formatDate(cloudReportDates.endDate)}
                    {cloudTotalSpaceUsed && ` • ${cloudTotalSpaceUsed}`}
                  </p>
                </div>
                <button
                  onClick={() => setShowCloudConfigModal(true)}
                  className="btn btn-secondary"
                >
                  <FiSettings className="mr-2" />
                  Configure
                </button>
              </div>
            </div>

            {/* Cloud Column Management with Drag & Drop */}
            <div className="card p-4 sm:p-6">
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Cloud Service Columns
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  type="text"
                  value={newCloudColumnName}
                  onChange={(e) => setNewCloudColumnName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCloudColumn()}
                  placeholder="Enter new column name"
                  className="input flex-1"
                />
                <button
                  onClick={handleAddCloudColumn}
                  className="btn btn-primary"
                >
                  <FiPlus className="mr-2" />
                  Add Column
                </button>
              </div>
              
              <div className={`p-4 rounded-lg border-2 border-dashed mb-4 ${
                isDark ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-gray-50'
              }`}>
                <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <FiMove className="inline mr-1" size={14} />
                  Drag and drop to reorder columns
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {cloudColumns.map((column, index) => (
                    <DraggableColumn
                      key={`cloud-${index}`}
                      column={column}
                      index={index}
                      onRemove={handleRemoveCloudColumn}
                      onDragStart={handleCloudColumnDragStart}
                      onDragOver={handleCloudColumnDragOver}
                      onDrop={handleCloudColumnDrop}
                      isDark={isDark}
                      isBeingDragged={draggedCloudIndex === index}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Cloud Data Grid */}
            <div className="card overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Cloud Services Data
                  </h2>
                  <button
                    onClick={handleAddCloudRow}
                    className="btn btn-primary"
                  >
                    <FiPlus className="mr-2" /> Add Service
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Actions
                      </th>
                      {cloudColumns.map((column, index) => (
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
                    {cloudRows.map((row, rowIndex) => (
                      <tr key={rowIndex} className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleRemoveCloudRow(rowIndex)}
                            className="text-error-600 hover:text-error-900 transition-colors"
                            title="Remove row"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                        {cloudColumns.map((column, colIndex) => (
                          <td key={colIndex} className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            {renderCloudCell(row, column, rowIndex)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {cloudRows.length === 0 && (
                      <tr>
                        <td 
                          colSpan={cloudColumns.length + 1} 
                          className={`px-6 py-12 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                          <div className="flex flex-col items-center">
                            <FiSettings className="w-12 h-12 mb-4 text-gray-400" />
                            <p className="text-lg font-medium mb-2">No cloud services configured</p>
                            <p>Click "Add Service" to get started.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Backup Services Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            {/* Backup Configuration Header */}
            <div className="card p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Backup Server Configuration
                  </h2>
                  <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {backupReportTitle} • {formatDate(backupReportDates.startDate)} - {formatDate(backupReportDates.endDate)}
                  </p>
                </div>
                <button
                  onClick={() => setShowBackupConfigModal(true)}
                  className="btn btn-secondary"
                >
                  <FiSettings className="mr-2" />
                  Configure
                </button>
              </div>
            </div>

            {/* Backup Column Management with Drag & Drop */}
            <div className="card p-4 sm:p-6">
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Backup Server Columns
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  type="text"
                  value={newBackupColumnName}
                  onChange={(e) => setNewBackupColumnName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddBackupColumn()}
                  placeholder="Enter new column name"
                  className="input flex-1"
                />
                <button
                  onClick={handleAddBackupColumn}
                  className="btn btn-success"
                >
                  <FiPlus className="mr-2" />
                  Add Column
                </button>
              </div>
              
              <div className={`p-4 rounded-lg border-2 border-dashed mb-4 ${
                isDark ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-gray-50'
              }`}>
                <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <FiMove className="inline mr-1" size={14} />
                  Drag and drop to reorder columns
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {backupColumns.map((column, index) => (
                    <DraggableColumn
                      key={`backup-${index}`}
                      column={column}
                      index={index}
                      onRemove={handleRemoveBackupColumn}
                      onDragStart={handleBackupColumnDragStart}
                      onDragOver={handleBackupColumnDragOver}
                      onDrop={handleBackupColumnDrop}
                      isDark={isDark}
                      isBeingDragged={draggedBackupIndex === index}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Backup Data Grid */}
            <div className="card overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Backup Server Data
                  </h2>
                  <button
                    onClick={handleAddBackupRow}
                    className="btn btn-success"
                  >
                    <FiPlus className="mr-2" /> Add Server
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Actions
                      </th>
                      {backupColumns.map((column, index) => (
                        <th
                          key={index}
                          className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'
                          }`}
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                    {backupRows.map((row, rowIndex) => (
                      <tr key={rowIndex} className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleRemoveBackupRow(rowIndex)}
                            className="text-error-600 hover:text-error-900 transition-colors"
                            title="Remove row"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                        {backupColumns.map((column, colIndex) => (
                          <td key={colIndex} className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            {renderBackupCell(row, column, rowIndex)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {backupRows.length === 0 && (
                      <tr>
                        <td 
                          colSpan={backupColumns.length + 1} 
                          className={`px-6 py-12 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                          <div className="flex flex-col items-center">
                            <FiSettings className="w-12 h-12 mb-4 text-gray-400" />
                            <p className="text-lg font-medium mb-2">No backup servers configured</p>
                            <p>Click "Add Server" to get started.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        {lastUpdated && (
          <div className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-8`}>
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </div>
        )}

        {/* Configuration Modals */}
        <ConfigurationModal
          isOpen={showCloudConfigModal}
          onClose={() => setShowCloudConfigModal(false)}
          type="Cloud Service"
          config={{
            reportTitle: cloudReportTitle,
            reportDates: cloudReportDates,
            totalSpaceUsed: cloudTotalSpaceUsed
          }}
          onSave={handleCloudConfigSave}
          isDark={isDark}
        />

        <ConfigurationModal
          isOpen={showBackupConfigModal}
          onClose={() => setShowBackupConfigModal(false)}
          type="Backup Server"
          config={{
            reportTitle: backupReportTitle,
            reportDates: backupReportDates
          }}
          onSave={handleBackupConfigSave}
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default CloudDashboard;