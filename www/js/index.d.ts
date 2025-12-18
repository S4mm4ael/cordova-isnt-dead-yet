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
declare const device: CordovaDeviceInfo;
declare const Connection: CordovaConnection;
declare function onDeviceReady(): void;
declare function setupButtonListeners(): void;
declare function getDeviceInfo(): void;
declare function updateStatusUI(): void;
declare function showAlert(): void;
declare function alertDismissed(): void;
declare function showConfirm(): void;
declare function onConfirm(buttonIndex: number): void;
declare function setupNetworkListener(): void;
declare function onOnline(): void;
declare function onOffline(): void;
declare function updateNetworkStatus(): void;
declare function setupBatteryListener(): void;
declare function onBatteryStatusEvent(event: Event): void;
declare function onBatteryLowEvent(event: Event): void;
declare function onBatteryCriticalEvent(event: Event): void;
declare function updateBatteryDisplay(level: number, isPlugged: boolean): void;
declare function getLocation(): void;
declare function onLocationSuccess(position: GeolocationPosition): void;
declare function onLocationError(error: GeolocationPositionError): void;
declare function refreshInfo(): void;
declare function logEntry(message: string, type?: 'info' | 'error' | 'success'): void;
//# sourceMappingURL=index.d.ts.map