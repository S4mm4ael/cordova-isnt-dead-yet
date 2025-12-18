/**
    Cordova Native App - Welcome Page with Native Functionality
*/

// Wait for the deviceready event before using any of Cordova's device APIs
document.addEventListener('deviceready', onDeviceReady, false);

// Initialize app when device is ready
function onDeviceReady() {
    logEntry('✓ Device is ready!', 'success');
    updateStatusUI();
    getDeviceInfo();
    setupNetworkListener();
    setupBatteryListener();
    
    // Update device info every 30 seconds
    setInterval(refreshInfo, 30000);
}

/**
 * Update device information on the page
 */
function getDeviceInfo() {
    try {
        // Get device information
        document.getElementById('platform').textContent = device.platform;
        document.getElementById('version').textContent = device.version;
        document.getElementById('model').textContent = device.model;
        document.getElementById('uuid').textContent = device.uuid;
        
        logEntry(`Device: ${device.model} (${device.platform} ${device.version})`, 'info');
    } catch (error) {
        logEntry(`Error getting device info: ${error.message}`, 'error');
    }
}

/**
 * Update overall status UI
 */
function updateStatusUI() {
    const statusEl = document.getElementById('status');
    statusEl.textContent = '✓ Device Ready - All Systems Go!';
    statusEl.style.color = '#10b981';
}

/**
 * Vibrate the device
 */
function vibrateDevice() {
    try {
        if (navigator.vibrate) {
            navigator.vibrate(500); // Vibrate for 500ms
            logEntry('Vibrating device...', 'success');
        } else if (navigator.webkitVibrate) {
            navigator.webkitVibrate(500);
            logEntry('Vibrating device...', 'success');
        } else {
            logEntry('Vibration not supported', 'info');
        }
    } catch (error) {
        logEntry(`Vibration error: ${error.message}`, 'error');
    }
}

/**
 * Show alert dialog
 */
function showAlert() {
    try {
        navigator.notification.alert(
            'This is a native alert dialog!', // message
            alertDismissed, // callback
            'Welcome!', // title
            'OK' // buttonName
        );
    } catch (error) {
        // Fallback to standard alert
        alert('Welcome to your Cordova app!');
        logEntry('Using standard alert', 'info');
    }
}

function alertDismissed() {
    logEntry('Alert dismissed', 'success');
}

/**
 * Show confirmation dialog
 */
function showConfirm() {
    try {
        navigator.notification.confirm(
            'Do you like this app?',
            onConfirm,
            'Question',
            ['Yes', 'No']
        );
    } catch (error) {
        // Fallback to standard confirm
        const result = confirm('Do you like this app?');
        logEntry(`User answered: ${result ? 'Yes' : 'No'}`, 'info');
    }
}

function onConfirm(buttonIndex) {
    const answers = ['', 'Yes', 'No'];
    logEntry(`User answered: ${answers[buttonIndex]}`, 'success');
}

/**
 * Setup network status listener
 */
function setupNetworkListener() {
    try {
        // Listen for Online event
        document.addEventListener('online', onOnline, false);
        // Listen for Offline event
        document.addEventListener('offline', onOffline, false);
        
        // Get initial network state
        updateNetworkStatus();
    } catch (error) {
        logEntry(`Network listener error: ${error.message}`, 'error');
    }
}

function onOnline() {
    logEntry('🌐 Network is online', 'success');
    updateNetworkStatus();
}

function onOffline() {
    logEntry('🌐 Network is offline', 'error');
    updateNetworkStatus();
}

function updateNetworkStatus() {
    try {
        const networkState = navigator.connection.type;
        const statusEl = document.getElementById('network-status');
        const indicator = statusEl.querySelector('.status-indicator');
        const statusText = statusEl.querySelector('.status-text');
        
        let connectionType = networkState;
        let isOnline = networkState !== Connection.NONE;
        
        // Map connection types
        const connectionMap = {
            [Connection.UNKNOWN]: 'Unknown',
            [Connection.ETHERNET]: 'Ethernet',
            [Connection.WIFI]: 'WiFi',
            [Connection.CELL_2G]: '2G',
            [Connection.CELL_3G]: '3G',
            [Connection.CELL_4G]: '4G',
            [Connection.CELL]: 'Cellular',
            [Connection.NONE]: 'No Connection'
        };
        
        connectionType = connectionMap[networkState] || 'Unknown';
        
        if (isOnline) {
            indicator.className = 'status-indicator online';
            statusText.textContent = `Connected via ${connectionType}`;
        } else {
            indicator.className = 'status-indicator offline';
            statusText.textContent = 'No Connection';
        }
    } catch (error) {
        logEntry(`Network status error: ${error.message}`, 'error');
    }
}

/**
 * Setup battery status listener
 */
function setupBatteryListener() {
    try {
        window.addEventListener('batterystatus', onBatteryStatus, false);
        window.addEventListener('batterylow', onBatteryLow, false);
        window.addEventListener('batterycritical', onBatteryCritical, false);
        
        logEntry('Battery monitoring enabled', 'info');
    } catch (error) {
        logEntry(`Battery listener error: ${error.message}`, 'error');
    }
}

function onBatteryStatus(info) {
    updateBatteryDisplay(info.level, info.isPlugged);
}

function onBatteryLow(info) {
    logEntry(`⚠️ Battery low: ${info.level}%`, 'error');
    updateBatteryDisplay(info.level, info.isPlugged);
}

function onBatteryCritical(info) {
    logEntry(`🔴 Battery critical: ${info.level}%`, 'error');
    updateBatteryDisplay(info.level, info.isPlugged);
}

function updateBatteryDisplay(level, isPlugged) {
    const batteryFill = document.getElementById('battery-fill');
    const batteryText = document.getElementById('battery-text');
    
    batteryFill.style.width = level + '%';
    batteryText.textContent = `Battery: ${level}% ${isPlugged ? '(Charging 🔌)' : ''}`;
    
    // Change color based on level
    if (level > 50) {
        batteryFill.style.background = 'linear-gradient(90deg, #10b981, #059669)';
    } else if (level > 20) {
        batteryFill.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
    } else {
        batteryFill.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
    }
}

/**
 * Get device location
 */
function getLocation() {
    try {
        const geoBtn = document.getElementById('geo-btn');
        geoBtn.disabled = true;
        geoBtn.textContent = '📍 Getting Location...';
        
        const options = { timeout: 10000, maximumAge: 0 };
        navigator.geolocation.getCurrentPosition(
            onLocationSuccess,
            onLocationError,
            options
        );
    } catch (error) {
        logEntry(`Geolocation error: ${error.message}`, 'error');
        document.getElementById('geo-btn').disabled = false;
        document.getElementById('geo-btn').textContent = '📍 Get Location';
    }
}

function onLocationSuccess(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const accuracy = position.coords.accuracy;
    
    const msg = `📍 Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (±${accuracy.toFixed(0)}m)`;
    logEntry(msg, 'success');
    
    document.getElementById('geo-btn').disabled = false;
    document.getElementById('geo-btn').textContent = '📍 Get Location';
}

function onLocationError(error) {
    logEntry(`Location error: ${error.message}`, 'error');
    document.getElementById('geo-btn').disabled = false;
    document.getElementById('geo-btn').textContent = '📍 Get Location';
}

/**
 * Refresh all device information
 */
function refreshInfo() {
    logEntry('🔄 Refreshing device information...', 'info');
    getDeviceInfo();
    updateNetworkStatus();
}

/**
 * Log entry to the log output
 */
function logEntry(message, type = 'info') {
    const logBox = document.getElementById('log-output');
    const entry = document.createElement('p');
    entry.className = `log-entry ${type}`;
    
    const timestamp = new Date().toLocaleTimeString();
    entry.textContent = `[${timestamp}] ${message}`;
    
    logBox.appendChild(entry);
    logBox.scrollTop = logBox.scrollHeight;
    
    // Keep only last 20 entries
    while (logBox.children.length > 20) {
        logBox.removeChild(logBox.firstChild);
    }
    
    console.log(`[${type.toUpperCase()}]`, message);
}
