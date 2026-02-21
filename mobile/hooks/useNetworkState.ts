/**
 * useNetworkState hook
 * Provides online/offline status and network info
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useCallback, useEffect, useState } from 'react';

export interface NetworkState {
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
    type: string;
    isWifi: boolean;
    isCellular: boolean;
}

export function useNetworkState() {
    const [state, setState] = useState<NetworkState>({
        isConnected: true,
        isInternetReachable: true,
        type: 'unknown',
        isWifi: false,
        isCellular: false,
    });

    const updateState = useCallback((netInfo: NetInfoState) => {
        setState({
            isConnected: netInfo.isConnected,
            isInternetReachable: netInfo.isInternetReachable,
            type: netInfo.type,
            isWifi: netInfo.type === 'wifi',
            isCellular: netInfo.type === 'cellular',
        });
    }, []);

    useEffect(() => {
        // Get initial state
        NetInfo.fetch().then(updateState);

        // Subscribe to changes
        const unsubscribe = NetInfo.addEventListener(updateState);

        return () => {
            unsubscribe();
        };
    }, [updateState]);

    return state;
}

export default useNetworkState;
