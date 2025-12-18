"use strict";
function onDeviceReady() {
    logEntry('✓ Device is ready!', 'success');
    updateStatusUI();
    getDeviceInfo();
    setupButtonListeners();
    setTimeout(() => {
        const hasNotificationPlugin = !!window.navigator?.notification;
        logEntry(`Notification plugin available: ${hasNotificationPlugin}`, 'info');
        if (hasNotificationPlugin) {
            logEntry(`Notification.alert type: ${typeof window.navigator.notification.alert}`, 'info');
            logEntry(`Notification.confirm type: ${typeof window.navigator.notification.confirm}`, 'info');
        }
    }, 500);
    setupNetworkListener();
    setupBatteryListener();
    setInterval(refreshInfo, 30000);
}
function setupButtonListeners() {
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
function getDeviceInfo() {
    try {
        const platformEl = document.getElementById('platform');
        const versionEl = document.getElementById('version');
        const modelEl = document.getElementById('model');
        const uuidEl = document.getElementById('uuid');
        if (platformEl)
            platformEl.textContent = device.platform;
        if (versionEl)
            versionEl.textContent = device.version;
        if (modelEl)
            modelEl.textContent = device.model;
        if (uuidEl)
            uuidEl.textContent = device.uuid;
        logEntry(`Device: ${device.model} (${device.platform} ${device.version})`, 'info');
    }
    catch (error) {
        if (error instanceof Error) {
            logEntry(`Error getting device info: ${error.message}`, 'error');
        }
    }
}
function updateStatusUI() {
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = '✓ Device Ready - All Systems Go!';
        statusEl.style.color = '#10b981';
    }
}
function showAlert() {
    logEntry('Alert button clicked', 'info');
    try {
        const notification = window.navigator?.notification ||
            window.notification ||
            window.cordova?.plugins?.notification?.local;
        logEntry(`Notification object found: ${!!notification}`, 'info');
        if (notification && notification.alert && typeof notification.alert === 'function') {
            logEntry('✓ Using native Cordova notification.alert()', 'success');
            try {
                notification.alert('This is a native alert dialog!', () => {
                    logEntry('✓ Alert dismissed by user', 'success');
                }, 'Welcome!', 'OK');
            }
            catch (callError) {
                logEntry(`Error calling notification.alert: ${String(callError)}`, 'error');
                alert('Welcome to your Cordova app!');
            }
        }
        else {
            logEntry('Native notification unavailable, using browser alert()', 'info');
            alert('Welcome to your Cordova app!');
        }
    }
    catch (error) {
        logEntry(`Unexpected error in showAlert: ${String(error)}`, 'error');
        alert('Welcome to your Cordova app!');
    }
}
function alertDismissed() {
    logEntry('Alert dismissed', 'success');
}
function showConfirm() {
    logEntry('Confirm button clicked', 'info');
    try {
        const notification = window.navigator?.notification ||
            window.notification ||
            window.cordova?.plugins?.notification?.local;
        logEntry(`Notification object found: ${!!notification}`, 'info');
        if (notification && notification.confirm && typeof notification.confirm === 'function') {
            logEntry('✓ Using native Cordova notification.confirm()', 'success');
            try {
                notification.confirm('Do you like this app?', (buttonIndex) => {
                    const answers = ['Dismissed', 'Yes', 'No'];
                    const answer = answers[buttonIndex] || 'Unknown';
                    logEntry(`✓ User selected: ${answer} (${buttonIndex})`, 'success');
                    onConfirm(buttonIndex);
                }, 'Question', ['Yes', 'No']);
            }
            catch (callError) {
                logEntry(`Error calling notification.confirm: ${String(callError)}`, 'error');
                const result = confirm('Do you like this app?');
                logEntry(`User answered: ${result ? 'Yes' : 'No'}`, 'info');
            }
        }
        else {
            logEntry('Native notification unavailable, using browser confirm()', 'info');
            const result = confirm('Do you like this app?');
            logEntry(`User answered: ${result ? 'Yes' : 'No'}`, 'info');
        }
    }
    catch (error) {
        logEntry(`Unexpected error in showConfirm: ${String(error)}`, 'error');
        const result = confirm('Do you like this app?');
        logEntry(`User answered: ${result ? 'Yes' : 'No'}`, 'info');
    }
}
function onConfirm(buttonIndex) {
    const answers = ['', 'Yes', 'No'];
    logEntry(`User answered: ${answers[buttonIndex] || 'Unknown'}`, 'success');
}
function setupNetworkListener() {
    try {
        document.addEventListener('online', onOnline, false);
        document.addEventListener('offline', onOffline, false);
        updateNetworkStatus();
    }
    catch (error) {
        if (error instanceof Error) {
            logEntry(`Network listener error: ${error.message}`, 'error');
        }
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
        const networkState = navigator.connection?.type;
        const statusEl = document.getElementById('network-status');
        if (!statusEl)
            return;
        const indicator = statusEl.querySelector('.status-indicator');
        const statusText = statusEl.querySelector('.status-text');
        let connectionType = networkState;
        let isOnline = networkState !== Connection.NONE;
        const connectionMap = {
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
            }
            else {
                indicator.className = 'status-indicator offline';
                statusText.textContent = 'No Connection';
            }
        }
    }
    catch (error) {
        if (error instanceof Error) {
            logEntry(`Network status error: ${error.message}`, 'error');
        }
    }
}
function setupBatteryListener() {
    try {
        window.addEventListener('batterystatus', onBatteryStatusEvent, false);
        window.addEventListener('batterylow', onBatteryLowEvent, false);
        window.addEventListener('batterycritical', onBatteryCriticalEvent, false);
        logEntry('Battery monitoring enabled', 'info');
    }
    catch (error) {
        if (error instanceof Error) {
            logEntry(`Battery listener error: ${error.message}`, 'error');
        }
    }
}
function onBatteryStatusEvent(event) {
    const info = event;
    updateBatteryDisplay(info.level, info.isPlugged);
}
function onBatteryLowEvent(event) {
    const info = event;
    logEntry(`⚠️ Battery low: ${info.level}%`, 'error');
    updateBatteryDisplay(info.level, info.isPlugged);
}
function onBatteryCriticalEvent(event) {
    const info = event;
    logEntry(`🔴 Battery critical: ${info.level}%`, 'error');
    updateBatteryDisplay(info.level, info.isPlugged);
}
function updateBatteryDisplay(level, isPlugged) {
    const batteryFill = document.getElementById('battery-fill');
    const batteryText = document.getElementById('battery-text');
    if (batteryFill) {
        batteryFill.style.width = level + '%';
        if (level > 50) {
            batteryFill.style.background = 'linear-gradient(90deg, #10b981, #059669)';
        }
        else if (level > 20) {
            batteryFill.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
        }
        else {
            batteryFill.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        }
    }
    if (batteryText) {
        batteryText.textContent = `Battery: ${level}% ${isPlugged ? '(Charging 🔌)' : ''}`;
    }
}
function getLocation() {
    try {
        const geoBtn = document.getElementById('geo-btn');
        if (geoBtn) {
            geoBtn.disabled = true;
            geoBtn.textContent = '📍 Getting Location...';
        }
        const options = { timeout: 10000, maximumAge: 0 };
        navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError, options);
    }
    catch (error) {
        if (error instanceof Error) {
            logEntry(`Geolocation error: ${error.message}`, 'error');
        }
        const geoBtn = document.getElementById('geo-btn');
        if (geoBtn) {
            geoBtn.disabled = false;
            geoBtn.textContent = '📍 Get Location';
        }
    }
}
function onLocationSuccess(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const accuracy = position.coords.accuracy;
    const msg = `📍 Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (±${accuracy.toFixed(0)}m)`;
    logEntry(msg, 'success');
    const geoBtn = document.getElementById('geo-btn');
    if (geoBtn) {
        geoBtn.disabled = false;
        geoBtn.textContent = '📍 Get Location';
    }
}
function onLocationError(error) {
    logEntry(`Location error: ${error.message}`, 'error');
    const geoBtn = document.getElementById('geo-btn');
    if (geoBtn) {
        geoBtn.disabled = false;
        geoBtn.textContent = '📍 Get Location';
    }
}
function refreshInfo() {
    logEntry('🔄 Refreshing device information...', 'info');
    getDeviceInfo();
    updateNetworkStatus();
}
function logEntry(message, type = 'info') {
    const logBox = document.getElementById('log-output');
    if (!logBox)
        return;
    const entry = document.createElement('p');
    entry.className = `log-entry ${type}`;
    const timestamp = new Date().toLocaleTimeString();
    entry.textContent = `[${timestamp}] ${message}`;
    logBox.appendChild(entry);
    logBox.scrollTop = logBox.scrollHeight;
    while (logBox.children.length > 20) {
        logBox.removeChild(logBox.firstChild);
    }
    console.log(`[${type.toUpperCase()}]`, message);
}
document.addEventListener('deviceready', onDeviceReady, false);
//# sourceMappingURL=index.js.map