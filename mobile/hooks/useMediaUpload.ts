import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import {
    PickerResult,
    pickImage,
    pickMedia,
    pickVideo,
    takePhoto,
    uploadMedia,
    UploadResult
} from '../services/media-upload';

interface UseMediaUploadOptions {
    bucket?: 'messages-media' | 'voice-notes';
    onSuccess?: (result: UploadResult) => void;
    onError?: (error: Error) => void;
}

interface UseMediaUploadReturn {
    // State
    isUploading: boolean;
    uploadProgress: number;
    selectedMedia: PickerResult | null;
    uploadedMedia: UploadResult | null;
    error: Error | null;

    // Pickers
    selectImage: () => Promise<void>;
    selectVideo: () => Promise<void>;
    selectMedia: () => Promise<void>;
    capturePhoto: () => Promise<void>;

    // Actions
    upload: () => Promise<UploadResult | null>;
    uploadSelected: (media: PickerResult) => Promise<UploadResult | null>;
    clear: () => void;

    // Utility
    showMediaOptions: () => void;
}

export function useMediaUpload(options: UseMediaUploadOptions = {}): UseMediaUploadReturn {
    const { bucket = 'messages-media', onSuccess, onError } = options;

    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedMedia, setSelectedMedia] = useState<PickerResult | null>(null);
    const [uploadedMedia, setUploadedMedia] = useState<UploadResult | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const handleError = useCallback((err: Error) => {
        setError(err);
        setIsUploading(false);
        setUploadProgress(0);
        onError?.(err);
        Alert.alert('Erreur', err.message);
    }, [onError]);

    const selectImage = useCallback(async () => {
        try {
            setError(null);
            const result = await pickImage();
            if (result) {
                setSelectedMedia(result);
            }
        } catch (err) {
            handleError(err as Error);
        }
    }, [handleError]);

    const selectVideo = useCallback(async () => {
        try {
            setError(null);
            const result = await pickVideo();
            if (result) {
                setSelectedMedia(result);
            }
        } catch (err) {
            handleError(err as Error);
        }
    }, [handleError]);

    const selectMedia = useCallback(async () => {
        try {
            setError(null);
            const result = await pickMedia();
            if (result) {
                setSelectedMedia(result);
            }
        } catch (err) {
            handleError(err as Error);
        }
    }, [handleError]);

    const capturePhoto = useCallback(async () => {
        try {
            setError(null);
            const result = await takePhoto();
            if (result) {
                setSelectedMedia(result);
            }
        } catch (err) {
            handleError(err as Error);
        }
    }, [handleError]);

    const uploadSelected = useCallback(async (media: PickerResult): Promise<UploadResult | null> => {
        try {
            setError(null);
            setIsUploading(true);
            setUploadProgress(0);

            const result = await uploadMedia(media, bucket, setUploadProgress);

            setUploadedMedia(result);
            setIsUploading(false);
            setUploadProgress(100);
            onSuccess?.(result);

            return result;
        } catch (err) {
            handleError(err as Error);
            return null;
        }
    }, [bucket, onSuccess, handleError]);

    const upload = useCallback(async (): Promise<UploadResult | null> => {
        if (!selectedMedia) {
            handleError(new Error('Aucun média sélectionné'));
            return null;
        }
        return uploadSelected(selectedMedia);
    }, [selectedMedia, uploadSelected, handleError]);

    const clear = useCallback(() => {
        setSelectedMedia(null);
        setUploadedMedia(null);
        setError(null);
        setUploadProgress(0);
    }, []);

    const showMediaOptions = useCallback(() => {
        Alert.alert(
            'Ajouter un média',
            'Choisissez une option',
            [
                { text: 'Photo depuis la bibliothèque', onPress: selectImage },
                { text: 'Vidéo depuis la bibliothèque', onPress: selectVideo },
                { text: 'Prendre une photo', onPress: capturePhoto },
                { text: 'Annuler', style: 'cancel' },
            ],
            { cancelable: true }
        );
    }, [selectImage, selectVideo, capturePhoto]);

    return {
        isUploading,
        uploadProgress,
        selectedMedia,
        uploadedMedia,
        error,
        selectImage,
        selectVideo,
        selectMedia,
        capturePhoto,
        upload,
        uploadSelected,
        clear,
        showMediaOptions,
    };
}
