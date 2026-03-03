declare module 'expo-location' {
    export interface LocationObject {
        coords: {
            latitude: number;
            longitude: number;
            altitude: number | null;
            accuracy: number | null;
            altitudeAccuracy: number | null;
            heading: number | null;
            speed: number | null;
        };
        timestamp: number;
    }

    export interface LocationGeocodedAddress {
        city: string | null;
        country: string | null;
        district: string | null;
        isoCountryCode: string | null;
        name: string | null;
        postalCode: string | null;
        region: string | null;
        street: string | null;
        streetNumber: string | null;
        subregion: string | null;
        timezone: string | null;
    }

    export interface PermissionResponse {
        status: 'granted' | 'denied' | 'undetermined';
        expires: string;
        granted: boolean;
        canAskAgain: boolean;
    }

    export interface LocationOptions {
        accuracy?: number;
        distanceInterval?: number;
        timeInterval?: number;
        mayShowUserSettingsDialog?: boolean;
    }

    export const Accuracy: {
        Lowest: 1;
        Low: 2;
        Balanced: 3;
        High: 4;
        Highest: 5;
        BestForNavigation: 6;
    };

    export function requestForegroundPermissionsAsync(): Promise<PermissionResponse>;
    export function requestBackgroundPermissionsAsync(): Promise<PermissionResponse>;
    export function getCurrentPositionAsync(options?: LocationOptions): Promise<LocationObject>;
    export function getLastKnownPositionAsync(): Promise<LocationObject | null>;
    export function reverseGeocodeAsync(location: {
        latitude: number;
        longitude: number;
    }): Promise<LocationGeocodedAddress[]>;
    export function watchPositionAsync(
        options: LocationOptions,
        callback: (location: LocationObject) => void
    ): Promise<{ remove: () => void }>;
}
