/**
 * Cordova Native App - Welcome Page with Native Functionality
 * Written in TypeScript
 */

// Type definitions for Cordova APIs
interface CordovaDeviceInfo {
  platform: string;
  version: string;
  model: string;
  uuid: string;
}

interface CordovaConnection {
  type: string;
  UNKNOWN: string;
  ETHERNET: string;
  WIFI: string;
  CELL_2G: string;
  CELL_3G: string;
  CELL_4G: string;
  CELL: string;
  NONE: string;
}

interface BatteryStatus {
  level: number;
  isPlugged: boolean;
}

interface GeolocationCoordinates {
  readonly latitude: number;
  readonly longitude: number;
  readonly accuracy: number;
  readonly altitude: number | null;
  readonly altitudeAccuracy: number | null;
  readonly heading: number | null;
  readonly speed: number | null;
}

interface GeolocationPosition {
  readonly coords: GeolocationCoordinates;
  readonly timestamp: number;
}

// Declare global Cordova objects
declare const device: CordovaDeviceInfo;
declare const Connection: CordovaConnection;

/**
 * Initialize app when device is ready
 */
function onDeviceReady(): void {
  logEntry('✓ Device is ready!', 'success');
  updateStatusUI();
  getDeviceInfo();
  
  // Setup button event listeners
  setupButtonListeners();
  
  // Give plugins a moment to fully initialize
  setTimeout(() => {
    const hasNotificationPlugin = !!(window as any).navigator?.notification;
    logEntry(`Notification plugin available: ${hasNotificationPlugin}`, 'info');
    if (hasNotificationPlugin) {
      logEntry(`Notification.alert type: ${typeof (window as any).navigator.notification.alert}`, 'info');
      logEntry(`Notification.confirm type: ${typeof (window as any).navigator.notification.confirm}`, 'info');
    }
  }, 500);
  
  setupNetworkListener();
  setupBatteryListener();

  // Update device info every 30 seconds
  setInterval(refreshInfo, 30000);
}

/**
 * Setup button event listeners
 */
function setupButtonListeners(): void {
  const alertBtn = document.getElementById('alert-btn');
  const confirmBtn = document.getElementById('confirm-btn');
  const geoBtn = document.getElementById('geo-btn');
  const refreshBtn = document.getElementById('refresh-btn');

  if (alertBtn) {
    alertBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logEntry('🔔 Alert button touched', 'info');
      showAlert();
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logEntry('❓ Confirm button touched', 'info');
      showConfirm();
    });
  }

  if (geoBtn) {
    geoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logEntry('📍 Location button touched', 'info');
      getLocation();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', (e) => {
      e.preventDefault();
      refreshInfo();
    });
  }
}

/**
 * Update device information on the page
 */
function getDeviceInfo(): void {
  try {
    // Get device information
    const platformEl = document.getElementById('platform');
    const versionEl = document.getElementById('version');
    const modelEl = document.getElementById('model');
    const uuidEl = document.getElementById('uuid');

    if (platformEl) platformEl.textContent = device.platform;
    if (versionEl) versionEl.textContent = device.version;
    if (modelEl) modelEl.textContent = device.model;
    if (uuidEl) uuidEl.textContent = device.uuid;

    logEntry(
      `Device: ${device.model} (${device.platform} ${device.version})`,
      'info'
    );
  } catch (error) {
    if (error instanceof Error) {
      logEntry(`Error getting device info: ${error.message}`, 'error');
    }
  }
}

/**
 * Update overall status UI
 */
function updateStatusUI(): void {
  const statusEl = document.getElementById('status');
  if (statusEl) {
    statusEl.textContent = '✓ Device Ready - All Systems Go!';
    statusEl.style.color = '#10b981';
  }
}

/**
 * Show alert dialog
 */
function showAlert(): void {
  logEntry('Alert button clicked', 'info');
  
  try {
    // Try multiple ways to access the notification API
    const notification = 
      (window as any).navigator?.notification ||
      (window as any).notification ||
      (window as any).cordova?.plugins?.notification?.local;
    
    logEntry(`Notification object found: ${!!notification}`, 'info');
    
    if (notification && notification.alert && typeof notification.alert === 'function') {
      logEntry('✓ Using native Cordova notification.alert()', 'success');
      
      try {
        notification.alert(
          'This is a native alert dialog!',
          () => {
            logEntry('✓ Alert dismissed by user', 'success');
          },
          'Welcome!',
          'OK'
        );
      } catch (callError) {
        logEntry(`Error calling notification.alert: ${String(callError)}`, 'error');
        alert('Welcome to your Cordova app!');
      }
    } else {
      logEntry('Native notification unavailable, using browser alert()', 'info');
      alert('Welcome to your Cordova app!');
    }
  } catch (error) {
    logEntry(`Unexpected error in showAlert: ${String(error)}`, 'error');
    alert('Welcome to your Cordova app!');
  }
}

function alertDismissed(): void {
  logEntry('Alert dismissed', 'success');
}

/**
 * Show confirmation dialog
 */
function showConfirm(): void {
  logEntry('Confirm button clicked', 'info');
  
  try {
    // Try multiple ways to access the notification API
    const notification = 
      (window as any).navigator?.notification ||
      (window as any).notification ||
      (window as any).cordova?.plugins?.notification?.local;
    
    logEntry(`Notification object found: ${!!notification}`, 'info');
    
    if (notification && notification.confirm && typeof notification.confirm === 'function') {
      logEntry('✓ Using native Cordova notification.confirm()', 'success');
      
      try {
        notification.confirm(
          'Do you like this app?',
          (buttonIndex: number) => {
            const answers = ['Dismissed', 'Yes', 'No'];
            const answer = answers[buttonIndex] || 'Unknown';
            logEntry(`✓ User selected: ${answer} (${buttonIndex})`, 'success');
            onConfirm(buttonIndex);
          },
          'Question',
          ['Yes', 'No']
        );
      } catch (callError) {
        logEntry(`Error calling notification.confirm: ${String(callError)}`, 'error');
        const result = confirm('Do you like this app?');
        logEntry(`User answered: ${result ? 'Yes' : 'No'}`, 'info');
      }
    } else {
      logEntry('Native notification unavailable, using browser confirm()', 'info');
      const result = confirm('Do you like this app?');
      logEntry(`User answered: ${result ? 'Yes' : 'No'}`, 'info');
    }
  } catch (error) {
    logEntry(`Unexpected error in showConfirm: ${String(error)}`, 'error');
    const result = confirm('Do you like this app?');
    logEntry(`User answered: ${result ? 'Yes' : 'No'}`, 'info');
  }
}

function onConfirm(buttonIndex: number): void {
  const answers = ['', 'Yes', 'No'];
  logEntry(`User answered: ${answers[buttonIndex] || 'Unknown'}`, 'success');
}

/**
 * Setup network status listener
 */
function setupNetworkListener(): void {
  try {
    // Listen for Online event
    document.addEventListener('online', onOnline, false);
    // Listen for Offline event
    document.addEventListener('offline', onOffline, false);

    // Get initial network state
    updateNetworkStatus();
  } catch (error) {
    if (error instanceof Error) {
      logEntry(`Network listener error: ${error.message}`, 'error');
    }
  }
}

function onOnline(): void {
  logEntry('🌐 Network is online', 'success');
  updateNetworkStatus();
}

function onOffline(): void {
  logEntry('🌐 Network is offline', 'error');
  updateNetworkStatus();
}

function updateNetworkStatus(): void {
  try {
    const networkState = (navigator as any).connection?.type;
    const statusEl = document.getElementById('network-status');

    if (!statusEl) return;

    const indicator = statusEl.querySelector('.status-indicator');
    const statusText = statusEl.querySelector('.status-text');

    let connectionType = networkState;
    let isOnline = networkState !== Connection.NONE;

    // Map connection types
    const connectionMap: Record<string, string> = {
      [Connection.UNKNOWN]: 'Unknown',
      [Connection.ETHERNET]: 'Ethernet',
      [Connection.WIFI]: 'WiFi',
      [Connection.CELL_2G]: '2G',
      [Connection.CELL_3G]: '3G',
      [Connection.CELL_4G]: '4G',
      [Connection.CELL]: 'Cellular',
      [Connection.NONE]: 'No Connection',
    };

    connectionType = connectionMap[networkState] || 'Unknown';

    if (indicator && statusText) {
      if (isOnline) {
        indicator.className = 'status-indicator online';
        statusText.textContent = `Connected via ${connectionType}`;
      } else {
        indicator.className = 'status-indicator offline';
        statusText.textContent = 'No Connection';
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      logEntry(`Network status error: ${error.message}`, 'error');
    }
  }
}

/**
 * Setup battery status listener
 */
function setupBatteryListener(): void {
  try {
    window.addEventListener('batterystatus', onBatteryStatusEvent, false);
    window.addEventListener('batterylow', onBatteryLowEvent, false);
    window.addEventListener(
      'batterycritical',
      onBatteryCriticalEvent,
      false
    );

    logEntry('Battery monitoring enabled', 'info');
  } catch (error) {
    if (error instanceof Error) {
      logEntry(`Battery listener error: ${error.message}`, 'error');
    }
  }
}

function onBatteryStatusEvent(event: Event): void {
  const info = event as unknown as BatteryStatus;
  updateBatteryDisplay(info.level, info.isPlugged);
}

function onBatteryLowEvent(event: Event): void {
  const info = event as unknown as BatteryStatus;
  logEntry(`⚠️ Battery low: ${info.level}%`, 'error');
  updateBatteryDisplay(info.level, info.isPlugged);
}

function onBatteryCriticalEvent(event: Event): void {
  const info = event as unknown as BatteryStatus;
  logEntry(`🔴 Battery critical: ${info.level}%`, 'error');
  updateBatteryDisplay(info.level, info.isPlugged);
}

function updateBatteryDisplay(level: number, isPlugged: boolean): void {
  const batteryFill = document.getElementById('battery-fill');
  const batteryText = document.getElementById('battery-text');

  if (batteryFill) {
    batteryFill.style.width = level + '%';

    // Change color based on level
    if (level > 50) {
      batteryFill.style.background = 'linear-gradient(90deg, #10b981, #059669)';
    } else if (level > 20) {
      batteryFill.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
    } else {
      batteryFill.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
    }
  }

  if (batteryText) {
    batteryText.textContent = `Battery: ${level}% ${isPlugged ? '(Charging 🔌)' : ''}`;
  }
}

/**
 * Get device location
 */
function getLocation(): void {
  try {
    const geoBtn = document.getElementById('geo-btn') as HTMLButtonElement;
    if (geoBtn) {
      geoBtn.disabled = true;
      geoBtn.textContent = '📍 Getting Location...';
    }

    const options = { timeout: 10000, maximumAge: 0 };
    navigator.geolocation.getCurrentPosition(
      onLocationSuccess,
      onLocationError,
      options
    );
  } catch (error) {
    if (error instanceof Error) {
      logEntry(`Geolocation error: ${error.message}`, 'error');
    }
    const geoBtn = document.getElementById('geo-btn') as HTMLButtonElement;
    if (geoBtn) {
      geoBtn.disabled = false;
      geoBtn.textContent = '📍 Get Location';
    }
  }
}

function onLocationSuccess(position: GeolocationPosition): void {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const accuracy = position.coords.accuracy;

  const msg = `📍 Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (±${accuracy.toFixed(0)}m)`;
  logEntry(msg, 'success');

  const geoBtn = document.getElementById('geo-btn') as HTMLButtonElement;
  if (geoBtn) {
    geoBtn.disabled = false;
    geoBtn.textContent = '📍 Get Location';
  }
}

function onLocationError(error: GeolocationPositionError): void {
  logEntry(`Location error: ${error.message}`, 'error');
  const geoBtn = document.getElementById('geo-btn') as HTMLButtonElement;
  if (geoBtn) {
    geoBtn.disabled = false;
    geoBtn.textContent = '📍 Get Location';
  }
}

/**
 * Refresh all device information
 */
function refreshInfo(): void {
  logEntry('🔄 Refreshing device information...', 'info');
  getDeviceInfo();
  updateNetworkStatus();
}

/**
 * Log entry to the log output
 */
function logEntry(message: string, type: 'info' | 'error' | 'success' = 'info'): void {
  const logBox = document.getElementById('log-output');
  if (!logBox) return;

  const entry = document.createElement('p');
  entry.className = `log-entry ${type}`;

  const timestamp = new Date().toLocaleTimeString();
  entry.textContent = `[${timestamp}] ${message}`;

  logBox.appendChild(entry);
  logBox.scrollTop = logBox.scrollHeight;

  // Keep only last 20 entries
  while (logBox.children.length > 20) {
    logBox.removeChild(logBox.firstChild as Node);
  }

  console.log(`[${type.toUpperCase()}]`, message);
}

// Wait for the deviceready event before using any of Cordova's device APIs
document.addEventListener('deviceready', onDeviceReady, false);
