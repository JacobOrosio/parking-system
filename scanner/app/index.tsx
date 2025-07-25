import { ViewLayout } from '@/components/view-layout';
import Text from '@/components/themed-text';
import { TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Camera } from 'expo-camera';
import { useSession } from '@/context/ctx';

export default function Index() {
    const router = useRouter();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [permissionRequested, setPermissionRequested] = useState(false);

    const { isLoading, user } = useSession();

    const handleContinue = () => {
        if (user) {
            router.push('/(tabs)/generate');
        } else {
            router.push('/signin');
        }
    };

    useEffect(() => {
        const requestCameraPermission = async () => {
            try {
                const { status } = await Camera.requestCameraPermissionsAsync();
                setHasPermission(status === 'granted');
                setPermissionRequested(true);

                if (status !== 'granted') {
                    Alert.alert(
                        'Camera Permission Required',
                        'This app needs camera access to scan QR codes for parking tickets.',
                        [{ text: 'OK' }],
                    );
                }
            } catch (error) {
                console.error('Error requesting camera permission:', error);
                setPermissionRequested(true);
            }
        };

        requestCameraPermission();
    }, []);

    const getPermissionStatus = () => {
        if (!permissionRequested) {
            return 'Requesting camera permission...';
        }
        if (hasPermission === false) {
            return 'Camera permission denied. Please enable it in settings to use the scanner.';
        }
        if (hasPermission === true) {
            return 'Camera permission granted. Ready to scan!';
        }
        return 'Checking permissions...';
    };

    return (
        <ViewLayout>
            <TouchableOpacity onPress={() => handleContinue()}>
                <Text weight="bold" className="text-2xl text-center mb-4">
                    Parking Ticket Scanner
                </Text>
                <Text className="text-center text-gray-600 mb-6">{getPermissionStatus()}</Text>
                <Text className="text-center text-blue-600">Tap to continue →</Text>
            </TouchableOpacity>
        </ViewLayout>
    );
}
