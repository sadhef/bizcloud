import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import { 
  FiPlus, 
  FiTrash2, 
  FiEye, 
  FiSave,
  FiRefreshCw,
  FiSettings,
  FiX,
  FiMove,
  FiAlertTriangle,
  FiEdit2,
  FiClock,
  FiMaximize2
} from 'react-icons/fi';
import api from '../../services/api';
import CloudPrintPreview from './CloudPrintPreview';

// Enhanced Input Component with better sizing
const EnhancedInput = ({ 
  value, 
  onChange, 
  placeholder, 
  type = "text", 
  isDark, 
  isExpanded = false,
  minWidth = "150px",
  className = ""
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');

  useEffect(() => {
    setTempValue(value || '');
  }, [value]);

  const handleSave = () => {
    onChange(tempValue);
    setIsModalOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setTempValue(value || '');
      setIsModalOpen(false);
    }
  };

  const shouldShowExpandButton = value?.length > 25 || placeholder?.toLowerCase().includes('remark');

  return (
    <>
      <div className="relative group">
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2.5 text-sm border rounded-lg transition-all duration-200 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500 focus:bg-gray-600' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-600 focus:border-primary-500 focus:bg-gray-50'
          } focus:outline-none focus:ring-2 focus:ring-primary-500/20 hover:border-gray-400 dark:hover:border-gray-500 ${className}`}
          style={{ 
            minWidth: minWidth,
            maxWidth: '300px'
          }}
        />
        
        {shouldShowExpandButton && (
          <button
            onClick={() => setIsModalOpen(true)}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
              isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
            }`}
            title="Expand to edit"
          >
            <FiMaximize2 size={12} />
          </button>
        )}
      </div>

      {/* Expanded Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg mx-auto rounded-xl shadow-2xl border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Edit {placeholder || 'Value'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg resize-none ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-600 focus:border-primary-500'
                } focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
                autoFocus
              />
              
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    setTempValue(value || '');
                    setIsModalOpen(false);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn btn-primary"
                >
                  Save
                </button>
              </div>
              
              <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Press Escape to cancel • Ctrl+Enter to save
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

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

// Enhanced Status Select Component with better sizing
const StyledStatusSelect = ({ value, onChange, isDark, isCloudStatus = false, isServerStatus = false }) => {
  const getBackgroundColor = (val) => {
    if (!val) return isDark ? '#374151' : '#ffffff';
    
    const normalizedVal = val.toUpperCase();
    
    if (isServerStatus) {
      switch (normalizedVal) {
        case 'ONLINE': return '#10b981';
        case 'OFFLINE': return '#ef4444';
        default: return isDark ? '#374151' : '#ffffff';
      }
    } else if (isCloudStatus) {
      switch (normalizedVal) {
        case 'AUTOMATIC':
        case 'ONLINE': return '#10b981';
        case 'MANUAL':
        case 'MAINTENANCE': return '#f59e0b';
        case 'FAILED':
        case 'OFFLINE': return '#ef4444';
        case 'IN PROGRESS': return '#3b82f6';
        case 'N/A': return '#6b7280';
        default: return isDark ? '#374151' : '#ffffff';
      }
    } else {
      switch (normalizedVal) {
        case 'RUNNING': return '#10b981';
        case 'NOT RUNNING': return '#ef4444';
        case 'N/A': return '#6b7280';
        default: return isDark ? '#374151' : '#ffffff';
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
        transition: 'all 0.2s ease-in-out',
        minWidth: '120px',
        maxWidth: '160px'
      }}
      className={`w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center transition-all duration-200 text-sm ${
        isDark ? 'border-gray-600' : 'border-gray-300'
      }`}
    >
      {isServerStatus ? (
        <>
          <option value="" style={{ backgroundColor: '#ffffff', color: '#000000' }}>Select Status</option>
          <option value="ONLINE" style={{ backgroundColor: '#10b981', color: '#ffffff' }}>ONLINE</option>
          <option value="OFFLINE" style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>OFFLINE</option>
        </>
      ) : isCloudStatus ? (
        <>
          <option value="" style={{ backgroundColor: '#ffffff', color: '#000000' }}>Select Status</option>
          <option value="AUTOMATIC" style={{ backgroundColor: '#10b981', color: '#ffffff' }}>AUTOMATIC</option>
          <option value="MANUAL" style={{ backgroundColor: '#f59e0b', color: '#000000' }}>MANUAL</option>
          <option value="FAILED" style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>FAILED</option>
          <option value="IN PROGRESS" style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}>IN PROGRESS</option>
          <option value="ONLINE" style={{ backgroundColor: '#10b981', color: '#ffffff' }}>ONLINE</option>
          <option value="MAINTENANCE" style={{ backgroundColor: '#f59e0b', color: '#000000' }}>MAINTENANCE</option>
          <option value="OFFLINE" style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>OFFLINE</option>
          <option value="N/A" style={{ backgroundColor: '#6b7280', color: '#ffffff' }}>N/A</option>
        </>
      ) : (
        <>
          <option value="" style={{ backgroundColor: '#ffffff', color: '#000000' }}>Select Status</option>
          <option value="RUNNING" style={{ backgroundColor: '#10b981', color: '#ffffff' }}>RUNNING</option>
          <option value="NOT RUNNING" style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>NOT RUNNING</option>
          <option value="N/A" style={{ backgroundColor: '#6b7280', color: '#ffffff' }}>N/A</option>
        </>
      )}
    </select>
  );
};

// Configuration Modal Component
const ConfigurationModal = ({ isOpen, onClose, type, config, onSave, isDark }) => {
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
              <label className="form-label">Report Title</label>
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
                <label className="form-label">Start Date</label>
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
                <label className="form-label">End Date</label>
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
                <label className="form-label">Total Space Used</label>
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

// Utility function to create a unique ID for rows
const generateRowId = () => {
  return `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Utility function to ensure row has all columns
const ensureRowHasAllColumns = (row, columns) => {
  const newRow = { ...row };
  columns.forEach(column => {
    if (!(column in newRow)) {
      newRow[column] = '';
    }
  });
  return newRow;
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

  // Backup Data State
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
  const [refreshing, setRefreshing] = useState(false);
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

  // Check if we're in preview mode
  const isPreviewMode = new URLSearchParams(location.search).get('preview') === 'true';

  // Simple fetch data function
  const fetchData = useCallback(async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setLoading(true);
      }
      setError(null);
      
      // Fetch both datasets
      const [cloudResponse, backupResponse] = await Promise.all([
        api.get('/cloud-report/data'),
        api.get('/backup-server/data')
      ]);
      
      // Process cloud data
      if (cloudResponse?.data) {
        const cloudData = cloudResponse.data;
        
        setCloudReportTitle(cloudData.reportTitle || 'Cloud Status Report');
        
        const cloudDates = cloudData.reportDates || {};
        setCloudReportDates({
          startDate: cloudDates.startDate ? new Date(cloudDates.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          endDate: cloudDates.endDate ? new Date(cloudDates.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
        
        const defaultCloudColumns = ['Server', 'Status', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'SSL Expiry', 'Space Used', 'Remarks'];
        const receivedColumns = cloudData.columns || defaultCloudColumns;
        setCloudColumns([...receivedColumns]);
        
        // Ensure all rows have all columns and add IDs if missing
        const processedCloudRows = (cloudData.rows || []).map((row, index) => ({
          id: row.id || generateRowId(),
          ...ensureRowHasAllColumns(row, receivedColumns)
        }));
        setCloudRows([...processedCloudRows]);
        
        setCloudTotalSpaceUsed(cloudData.totalSpaceUsed || '');
        setLastUpdated(cloudData.updatedAt);
      }

      // Process backup data
      if (backupResponse?.data) {
        const backupData = backupResponse.data;
        
        setBackupReportTitle(backupData.reportTitle || 'Backup Server Cronjob Status');
        
        const backupDates = backupData.reportDates || {};
        setBackupReportDates({
          startDate: backupDates.startDate ? new Date(backupDates.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          endDate: backupDates.endDate ? new Date(backupDates.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
        
        const defaultBackupColumns = ['Server', 'SERVER STATUS', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Remarks'];
        const receivedColumns = backupData.columns || defaultBackupColumns;
        setBackupColumns([...receivedColumns]);
        
        // Ensure all rows have all columns and add IDs if missing
        const processedBackupRows = (backupData.rows || []).map((row, index) => ({
          id: row.id || generateRowId(),
          ...ensureRowHasAllColumns(row, receivedColumns)
        }));
        setBackupRows([...processedBackupRows]);
      }
      
      setHasUnsavedChanges(false);      
    } catch (err) {
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, []);

  // Mark as changed function (NO AUTO-SAVE)
  const markAsChanged = useCallback(() => {
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true);
    }
  }, [hasUnsavedChanges]);

  // Manual save function
  const saveData = async () => {
    try {
      setSaveLoading(true);
      
      
      // Clean rows data (remove internal React keys like 'id')
      const cleanCloudRows = cloudRows.map(row => {
        const { id, ...cleanRow } = row;
        return cleanRow;
      });
      
      const cleanBackupRows = backupRows.map(row => {
        const { id, ...cleanRow } = row;
        return cleanRow;
      });
      
      const cloudPayload = {
        reportTitle: cloudReportTitle,
        reportDates: cloudReportDates,
        columns: cloudColumns,
        rows: cleanCloudRows,
        totalSpaceUsed: cloudTotalSpaceUsed
      };
      
      const backupPayload = {
        reportTitle: backupReportTitle,
        reportDates: backupReportDates,
        columns: backupColumns,
        rows: cleanBackupRows
      };
      
      
      // Save data
      const [cloudResult, backupResult] = await Promise.all([
        api.post('/cloud-report/save', cloudPayload),
        api.post('/backup-server/save', backupPayload)
      ]);
      
      
      // Fetch fresh data after save to ensure UI shows latest server data
      await fetchData(false); // Don't show loading state for this refresh
      
      toast.success('Data saved and refreshed successfully!');
      setHasUnsavedChanges(false);
      return true;
      
    } catch (err) {
      console.error('Error saving cloud dashboard data:', err);
      toast.error(`Failed to save dashboard data: ${err.message || 'Unknown error'}`);
      return false;
    } finally {
      setSaveLoading(false);
    }
  };

  // Force refresh function
  const forceRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      await fetchData(true); // Force fresh fetch with loading state
      toast.success('Data refreshed successfully!');
      
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Visibility change handler - refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !loading && !saveLoading) {
        fetchData(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData, loading, saveLoading]);

  // Configuration handlers
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
    
    newColumns.splice(draggedCloudIndex, 1);
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
    
    newColumns.splice(draggedBackupIndex, 1);
    newColumns.splice(dropIndex, 0, draggedColumn);
    
    setBackupColumns(newColumns);
    setDraggedBackupIndex(null);
    markAsChanged();
    
    toast.success('Backup columns reordered successfully!');
  };

  // FIXED: Cloud Column Management
  const handleAddCloudColumn = () => {
    const trimmedName = newCloudColumnName.trim();
    
    if (!trimmedName) {
      toast.error('Please enter a valid column name');
      return;
    }
    
    if (cloudColumns.includes(trimmedName)) {
      toast.error('Column already exists!');
      return;
    }
    
    try {
      // Add column to state
      const newColumns = [...cloudColumns, trimmedName];
      setCloudColumns(newColumns);
      
      // Update all existing rows to include the new column
      const updatedRows = cloudRows.map(row => ({
        ...row,
        [trimmedName]: ''
      }));
      setCloudRows([...updatedRows]);
      
      setNewCloudColumnName('');
      markAsChanged();
      toast.success(`Cloud column "${trimmedName}" added successfully!`);
      
      console.log('Added cloud column:', trimmedName);
      console.log('Updated cloud columns:', newColumns);
      console.log('Updated cloud rows count:', updatedRows.length);
    } catch (error) {
      console.error('Error adding cloud column:', error);
      toast.error('Failed to add column');
    }
  };

  const handleRemoveCloudColumn = (indexToRemove) => {
    if (cloudColumns.length <= 1) {
      toast.error('Cannot remove the last column');
      return;
    }
    
    try {
      const columnToRemove = cloudColumns[indexToRemove];
      const newColumns = cloudColumns.filter((_, index) => index !== indexToRemove);
      setCloudColumns([...newColumns]);
      
      // Remove the column from all existing rows
      const updatedRows = cloudRows.map(row => {
        const { [columnToRemove]: removed, ...newRow } = row;
        return newRow;
      });
      setCloudRows([...updatedRows]);
      
      markAsChanged();
      toast.success(`Cloud column "${columnToRemove}" removed successfully!`);
      
      console.log('Removed cloud column:', columnToRemove);
      console.log('Updated cloud columns:', newColumns);
    } catch (error) {
      console.error('Error removing cloud column:', error);
      toast.error('Failed to remove column');
    }
  };

  // FIXED: Backup Column Management
  const handleAddBackupColumn = () => {
    const trimmedName = newBackupColumnName.trim();
    
    if (!trimmedName) {
      toast.error('Please enter a valid column name');
      return;
    }
    
    if (backupColumns.includes(trimmedName)) {
      toast.error('Column already exists!');
      return;
    }
    
    try {
      // Add column to state
      const newColumns = [...backupColumns, trimmedName];
      setBackupColumns(newColumns);
      
      // Update all existing rows to include the new column
      const updatedRows = backupRows.map(row => ({
        ...row,
        [trimmedName]: ''
      }));
      setBackupRows([...updatedRows]);
      
      setNewBackupColumnName('');
      markAsChanged();
      toast.success(`Backup column "${trimmedName}" added successfully!`);
      
      console.log('Added backup column:', trimmedName);
      console.log('Updated backup columns:', newColumns);
      console.log('Updated backup rows count:', updatedRows.length);
    } catch (error) {
      console.error('Error adding backup column:', error);
      toast.error('Failed to add column');
    }
  };

  const handleRemoveBackupColumn = (indexToRemove) => {
    if (backupColumns.length <= 1) {
      toast.error('Cannot remove the last column');
      return;
    }
    
    try {
      const columnToRemove = backupColumns[indexToRemove];
      const newColumns = backupColumns.filter((_, index) => index !== indexToRemove);
      setBackupColumns([...newColumns]);
      
      // Remove the column from all existing rows
      const updatedRows = backupRows.map(row => {
        const { [columnToRemove]: removed, ...newRow } = row;
        return newRow;
      });
      setBackupRows([...updatedRows]);
      
      markAsChanged();
      toast.success(`Backup column "${columnToRemove}" removed successfully!`);
      
      console.log('Removed backup column:', columnToRemove);
      console.log('Updated backup columns:', newColumns);
    } catch (error) {
      console.error('Error removing backup column:', error);
      toast.error('Failed to remove column');
    }
  };

  // FIXED: Row Management - Cloud
  const handleAddCloudRow = () => {
    try {
      const newRow = {
        id: generateRowId()
      };
      
      // Initialize all columns with empty values
      cloudColumns.forEach(column => {
        newRow[column] = '';
      });
      
      const updatedRows = [...cloudRows, newRow];
      setCloudRows(updatedRows);
      markAsChanged();
      toast.success('New cloud service row added successfully!');
      
      console.log('Added cloud row with ID:', newRow.id);
      console.log('Total cloud rows:', updatedRows.length);
    } catch (error) {
      console.error('Error adding cloud row:', error);
      toast.error('Failed to add row');
    }
  };

  const handleRemoveCloudRow = (indexToRemove) => {
    try {
      const rowToRemove = cloudRows[indexToRemove];
      const updatedRows = cloudRows.filter((_, index) => index !== indexToRemove);
      setCloudRows([...updatedRows]);
      markAsChanged();
      toast.success('Cloud service row removed successfully!');
      
      console.log('Removed cloud row with ID:', rowToRemove?.id);
      console.log('Remaining cloud rows:', updatedRows.length);
    } catch (error) {
      console.error('Error removing cloud row:', error);
      toast.error('Failed to remove row');
    }
  };

  const handleCloudCellChange = (rowIndex, column, value) => {
    try {
      if (rowIndex < 0 || rowIndex >= cloudRows.length) {
        console.error('Invalid row index:', rowIndex);
        return;
      }
      
      const updatedRows = [...cloudRows];
      updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        [column]: value
      };
      
      setCloudRows(updatedRows);
      markAsChanged();
      
      console.log(`Updated cloud cell [${rowIndex}][${column}] = "${value}"`);
    } catch (error) {
      console.error('Error updating cloud cell:', error);
      toast.error('Failed to update cell');
    }
  };

  // FIXED: Row Management - Backup
  const handleAddBackupRow = () => {
    try {
      const newRow = {
        id: generateRowId()
      };
      
      // Initialize all columns with empty values
      backupColumns.forEach(column => {
        newRow[column] = '';
      });
      
      const updatedRows = [...backupRows, newRow];
      setBackupRows(updatedRows);
      markAsChanged();
      toast.success('New backup server row added successfully!');
      
      console.log('Added backup row with ID:', newRow.id);
      console.log('Total backup rows:', updatedRows.length);
    } catch (error) {
      console.error('Error adding backup row:', error);
      toast.error('Failed to add row');
    }
  };

  const handleRemoveBackupRow = (indexToRemove) => {
    try {
      const rowToRemove = backupRows[indexToRemove];
      const updatedRows = backupRows.filter((_, index) => index !== indexToRemove);
      setBackupRows([...updatedRows]);
      markAsChanged();
      toast.success('Backup server row removed successfully!');
      
      console.log('Removed backup row with ID:', rowToRemove?.id);
      console.log('Remaining backup rows:', updatedRows.length);
    } catch (error) {
      console.error('Error removing backup row:', error);
      toast.error('Failed to remove row');
    }
  };

  const handleBackupCellChange = (rowIndex, column, value) => {
    try {
      if (rowIndex < 0 || rowIndex >= backupRows.length) {
        console.error('Invalid row index:', rowIndex);
        return;
      }
      
      const updatedRows = [...backupRows];
      updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        [column]: value
      };
      
      setBackupRows(updatedRows);
      markAsChanged();
      
      console.log(`Updated backup cell [${rowIndex}][${column}] = "${value}"`);
    } catch (error) {
      console.error('Error updating backup cell:', error);
      toast.error('Failed to update cell');
    }
  };

  // Toggle preview mode
  const togglePreviewMode = () => {
    if (!isPreviewMode) {
      if (hasUnsavedChanges) {
        console.log('Saving before preview...');
        saveData().then((success) => {
          if (success) {
            navigate('/cloud-dashboard?preview=true');
          }
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
        rows: cloudRows.map(row => {
          const { id, ...cleanRow } = row;
          return cleanRow;
        }),
        totalSpaceUsed: cloudTotalSpaceUsed
      },
      backupData: {
        reportTitle: backupReportTitle,
        reportDates: backupReportDates,
        columns: backupColumns,
        rows: backupRows.map(row => {
          const { id, ...cleanRow } = row;
          return cleanRow;
        })
      },
      lastUpdated
    };
  };

  // Get column width based on column type
  const getColumnWidth = (column) => {
    const isStatusColumn = column === 'Status' || column === 'SERVER STATUS';
    const isWeekdayColumn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(column);
    const isSSLColumn = column === 'SSL Expiry';
    const isServerColumn = column === 'Server';
    const isRemarksColumn = column.toLowerCase().includes('remark');
    const isSpaceColumn = column.toLowerCase().includes('space');

    if (isServerColumn) return '200px';
    if (isRemarksColumn) return '250px';
    if (isStatusColumn) return '140px';
    if (isWeekdayColumn) return '120px';
    if (isSSLColumn) return '150px';
    if (isSpaceColumn) return '120px';
    return '150px';
  };

  // Cell rendering with enhanced inputs
  const renderCloudCell = (row, column, rowIndex) => {
    const isStatusColumn = column === 'Status';
    const isWeekdayColumn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(column);
    const isSSLColumn = column === 'SSL Expiry';
    const isRemarksColumn = column.toLowerCase().includes('remark');

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
          className={`w-full px-3 py-2.5 text-sm border rounded-lg transition-all duration-200 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white focus:border-primary-500' 
              : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
          } focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
          style={{ minWidth: '140px' }}
        />
      );
    } else {
      return (
        <EnhancedInput
          value={row[column] || ''}
          onChange={(newValue) => handleCloudCellChange(rowIndex, column, newValue)}
          placeholder={`Enter ${column}`}
          isDark={isDark}
          minWidth={isRemarksColumn ? '200px' : '150px'}
        />
      );
    }
  };

  const renderBackupCell = (row, column, rowIndex) => {
    const isWeekdayColumn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(column);
    const isServerStatusColumn = column === 'SERVER STATUS';
    const isRemarksColumn = column.toLowerCase().includes('remark');

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
        <EnhancedInput
          value={row[column] || ''}
          onChange={(newValue) => handleBackupCellChange(rowIndex, column, newValue)}
          placeholder={`Enter ${column}`}
          isDark={isDark}
          minWidth={isRemarksColumn ? '200px' : '150px'}
        />
      );
    }
  };

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
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Cloud Infrastructure Dashboard
            </h1>
            <p className={`mt-2 text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage cloud services and backup server configurations
            </p>
            <div className="flex items-center space-x-4 mt-2">
              {hasUnsavedChanges && (
                <div className={`text-sm flex items-center ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  <FiEdit2 className="mr-1" />
                  Unsaved changes
                </div>
              )}
              {lastUpdated && (
                <div className={`text-xs flex items-center ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  <FiClock className="mr-1" />
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={togglePreviewMode}
              className="btn btn-secondary"
              disabled={saveLoading}
            >
              <FiEye className="mr-2" />
              Preview & Print
            </button>
            
            <button
              onClick={saveData}
              disabled={!hasUnsavedChanges || saveLoading}
              className={`btn ${
                hasUnsavedChanges && !saveLoading 
                  ? 'btn-primary' 
                  : isDark 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FiSave className="mr-2" />
              {saveLoading ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button
              onClick={forceRefresh}
              disabled={loading || refreshing}
              className="btn btn-secondary"
            >
              <FiRefreshCw className={`mr-2 ${(loading || refreshing) ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-error-50 border border-error-200 text-error-700 dark:bg-error-900/20 dark:border-error-800 dark:text-error-400">
            <div className="flex items-center">
              <FiAlertTriangle className="mr-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Connection Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={forceRefresh}
                className="ml-4 btn btn-sm btn-secondary"
                disabled={refreshing}
              >
                Retry
              </button>
            </div>
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

            {/* Cloud Column Management */}
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
                  disabled={!newCloudColumnName.trim()}
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
                      key={`cloud-${index}-${column}`}
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

            {/* Cloud Data Grid - Enhanced with better sizing */}
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
              
              {/* Improved table with better spacing */}
              <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
                <table className={`w-full border-collapse ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`} style={{ minWidth: 'max-content' }}>
                  <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th 
                        className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDark ? 'text-gray-300' : 'text-gray-500'
                        }`}
                        style={{ minWidth: '80px', width: '80px' }}
                      >
                        Actions
                      </th>
                      {cloudColumns.map((column, index) => (
                        <th
                          key={`header-${index}-${column}`}
                          className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDark ? 'text-gray-300' : 'text-gray-500'
                          }`}
                          style={{ 
                            minWidth: getColumnWidth(column),
                            width: getColumnWidth(column)
                          }}
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                    {cloudRows.map((row, rowIndex) => (
                      <tr key={row.id || `cloud-row-${rowIndex}`} className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                        <td className="px-4 py-4 whitespace-nowrap" style={{ width: '80px' }}>
                          <button
                            onClick={() => handleRemoveCloudRow(rowIndex)}
                            className="text-error-600 hover:text-error-900 transition-colors p-2 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20"
                            title="Remove row"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                        {cloudColumns.map((column, colIndex) => (
                          <td 
                            key={`cell-${rowIndex}-${colIndex}-${column}`} 
                            className="px-4 py-4"
                            style={{ 
                              minWidth: getColumnWidth(column),
                              width: getColumnWidth(column)
                            }}
                          >
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

            {/* Backup Column Management */}
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
                  disabled={!newBackupColumnName.trim()}
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
                      key={`backup-${index}-${column}`}
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

            {/* Backup Data Grid - Enhanced with better sizing */}
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
              
              {/* Improved table with better spacing */}
              <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
                <table className={`w-full border-collapse ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`} style={{ minWidth: 'max-content' }}>
                  <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th 
                        className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDark ? 'text-gray-300' : 'text-gray-500'
                        }`}
                        style={{ minWidth: '80px', width: '80px' }}
                      >
                        Actions
                      </th>
                      {backupColumns.map((column, index) => (
                        <th
                          key={`backup-header-${index}-${column}`}
                          className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}
                          style={{ 
                            minWidth: getColumnWidth(column),
                            width: getColumnWidth(column)
                          }}
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                    {backupRows.map((row, rowIndex) => (
                      <tr key={row.id || `backup-row-${rowIndex}`} className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                        <td className="px-4 py-4 whitespace-nowrap" style={{ width: '80px' }}>
                          <button
                            onClick={() => handleRemoveBackupRow(rowIndex)}
                            className="text-error-600 hover:text-error-900 transition-colors p-2 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20"
                            title="Remove row"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                        {backupColumns.map((column, colIndex) => (
                          <td 
                            key={`backup-cell-${rowIndex}-${colIndex}-${column}`} 
                            className="px-4 py-4"
                            style={{ 
                              minWidth: getColumnWidth(column),
                              width: getColumnWidth(column)
                            }}
                          >
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