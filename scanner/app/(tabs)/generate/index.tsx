import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Modal,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    Linking,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import dayjs from 'dayjs';
import { useMutation } from '@tanstack/react-query';
import { customerParking } from '@/api/mutations/parking';
import { useSession } from '@/context/ctx';
import { ScrollView } from 'react-native-gesture-handler';

export default function TicketGenerator() {
    const { user, signOut } = useSession();

    const [vehiclePlate, setVehiclePlate] = useState('');
    const [vehicleType, setVehicleType] = useState<'car' | 'motorcycle'>('car');
    const [qrValue, setQrValue] = useState('');
    const [entryTime, setEntryTime] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const vehicleTypeOptions = [
        { label: '🚗 Car', value: 'car' },
        { label: '🏍️ Motorcycle', value: 'motorcycle' },
    ];

    const createTicket = useMutation({
        mutationFn: customerParking,
        onSuccess: async (data) => {
            setQrValue(data.ticket.id);
            setEntryTime(dayjs(data.ticket.entryTime).format('YYYY-MM-DD HH:mm:ss'));
            setModalVisible(true);
            setShowValidation(false);
            await handlePrintTicket();
            setVehiclePlate('');
            console.log('Successfully created ticket:', data.ticket.id);
        },
        onError: (error) => {
            console.error('Failed to create ticket:', error);
        },
    });

    const handleGenerateTicket = () => {
        const trimmedPlate = vehiclePlate.trim();
        if (!trimmedPlate || !vehicleType) {
            setShowValidation(true);
            return;
        }

        if (!user) return null;

        createTicket.mutate({
            issuedById: user.id,
            vehiclePlate: trimmedPlate,
            vehicleType,
        });
    };

    const handlePrintTicket = async () => {
        try {
            // ESC/POS QR code command structure
            const qrCodeCommand =
                // Set QR code model
                '\x1D\x28\x6B\x04\x00\x31\x41\x32\x00' + // GS ( k <len> 49 65 50 0 (Model 2)
                // Set QR code size
                '\x1D\x28\x6B\x03\x00\x31\x43\x08' + // GS ( k <len> 49 67 n (n=8, larger size)
                // Set error correction level (M=49)
                '\x1D\x28\x6B\x03\x00\x31\x45\x31' + // GS ( k <len> 49 69 49 (M level)
                // Store QR code data
                '\x1D\x28\x6B' +
                String.fromCharCode(qrValue.length + 3) + // Data length (low byte)
                '\x00\x31\x50\x30' + // GS ( k <len> 49 80 48
                qrValue + // QR code data
                // Print QR code
                '\x1D\x28\x6B\x03\x00\x31\x51\x30'; // GS ( k <len> 49 81 48

            // Get current date and format entry time
            const currentDate = new Date().toLocaleDateString();
            const vehicleTypeDisplay = vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1);

            // Format entry time to 12-hour format without date
            const entryTimeFormatted = dayjs(entryTime).format('h:mm:ss A');

            // Create the parking ticket text command
            const text =
                '\x1B\x40' + // Initialize printer
                '\x1B\x61\x01' + // Center alignment
                '================================\n' +
                '\x1B\x21\x10' + // Double height text
                'PARKING TICKET\n' +
                '\x1B\x21\x00' + // Normal text
                '================================\n' +
                'Date: ' +
                currentDate +
                '\n' +
                'Ticket ID: ' +
                qrValue +
                '\n' +
                '================================\n' +
                '\x1B\x61\x00' + // Left alignment
                'Vehicle Type: ' +
                vehicleTypeDisplay +
                '\n' +
                'Plate Number: ' +
                vehiclePlate.toUpperCase() +
                '\n' +
                'Entry Time: ' +
                entryTimeFormatted +
                '\n' +
                '================================\n' +
                'Please  Show this QR code when' +
                '\n' +
                'exiting the parking area.\n' +
                '\n' +
                '\x1B\x61\x01' + // Center alignment for QR code
                qrCodeCommand + // Add QR code
                '\n\n' + // Space after QR code
                '\x1B\x61\x00' + // Reset to left alignment
                '\n' +
                'Thank you for parking with us!\n' +
                '================================\n' +
                '\x1D\x56\x41\x03'; // Cut paper

            // Send to RawBT
            await Linking.openURL('rawbt:' + encodeURIComponent(text));
            Alert.alert('Success', 'Parking ticket sent to RawBT for printing!');
        } catch (error) {
            console.error(error);
            Alert.alert(
                'Error',
                'Failed to send print command. Ensure RawBT is installed and printer is paired.',
            );
        }
    };

    const isPlateValid = vehiclePlate.trim().length > 0;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white px-6 py-4 shadow-sm border-b border-gray-100">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-2xl font-bold text-gray-900">ParkPOS</Text>
                        <Text className="text-sm text-gray-500">Ticket Generator</Text>
                    </View>
                    <TouchableOpacity
                        onPress={signOut}
                        className="bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
                        <Text className="text-red-600 font-semibold">Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView>
                <KeyboardAvoidingView
                    className="flex-1"
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
                    <View className="flex-1 px-6 items-center justify-center py-6">
                        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <View className="items-center mb-8">
                                <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-3">
                                    <Text className="text-2xl">🎟️</Text>
                                </View>
                                <Text className="text-2xl font-bold text-gray-900 mb-1">
                                    Generate Parking Ticket
                                </Text>
                                <Text className="text-gray-500 text-center">
                                    Enter vehicle details to create a new parking ticket
                                </Text>
                            </View>

                            <View className="mb-6">
                                <Text className="text-base font-semibold text-gray-700 mb-2">
                                    Vehicle Plate Number
                                </Text>
                                <TextInput
                                    value={vehiclePlate}
                                    onChangeText={setVehiclePlate}
                                    placeholder="ABC 1234"
                                    className={`border-2 rounded-xl px-4 py-4 bg-gray-50 text-base font-medium ${
                                        showValidation && !isPlateValid
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-200 focus:border-orange-400'
                                    }`}
                                    autoCapitalize="characters"
                                />
                                {showValidation && !isPlateValid && (
                                    <Text className="text-red-500 text-sm mt-1 font-medium">
                                        Plate number is required
                                    </Text>
                                )}
                            </View>

                            <View className="mb-8">
                                <Text className="text-base font-semibold text-gray-700 mb-3">
                                    Vehicle Type
                                </Text>
                                <View className="flex-row gap-3">
                                    {vehicleTypeOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            className={`flex-1 py-4 px-4 rounded-xl border-2 ${
                                                vehicleType === option.value
                                                    ? 'bg-orange-50 border-orange-400'
                                                    : 'bg-gray-50 border-gray-200'
                                            }`}
                                            onPress={() =>
                                                setVehicleType(option.value as 'car' | 'motorcycle')
                                            }>
                                            <Text
                                                className={`text-center font-semibold text-base ${
                                                    vehicleType === option.value
                                                        ? 'text-orange-700'
                                                        : 'text-gray-600'
                                                }`}>
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleGenerateTicket}
                                className={`py-4 rounded-xl items-center shadow-sm ${
                                    isPlateValid && !createTicket.isPending
                                        ? 'bg-orange-500 active:bg-orange-600'
                                        : 'bg-gray-300'
                                }`}
                                disabled={!isPlateValid || createTicket.isPending}>
                                <Text className="text-white text-lg font-bold">
                                    {createTicket.isPending
                                        ? 'Generating...'
                                        : 'Generate QR Ticket'}
                                </Text>
                            </TouchableOpacity>

                            <View className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                <Text className="text-blue-800 text-sm text-center font-medium">
                                    💡 Ticket will be generated with current timestamp
                                </Text>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View className="flex-1 justify-center items-center bg-black/40 px-6">
                    <View className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
                        <View className="bg-orange-50 px-6 py-4 rounded-t-2xl border-b border-orange-100">
                            <Text className="text-xl font-bold text-center text-orange-900">
                                🎟️ Parking Ticket Generated
                            </Text>
                        </View>

                        <View className="p-6 items-center">
                            {/* <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
                                {qrValue && <QRCode value={qrValue} size={160} />}
                            </View> */}

                            <View className="w-full space-y-2 bg-gray-50 rounded-xl p-4">
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-600 font-medium">Plate:</Text>
                                    <Text className="text-gray-900 font-bold">{vehiclePlate}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-600 font-medium">Type:</Text>
                                    <Text className="text-gray-900 font-semibold capitalize">
                                        {vehicleType}
                                    </Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-600 font-medium">Entry:</Text>
                                    <Text className="text-gray-900 font-mono text-sm">
                                        {entryTime}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View className="px-6 pb-6">
                            <TouchableOpacity
                                className="bg-gray-900 py-3 px-6 rounded-xl"
                                onPress={() => setModalVisible(false)}>
                                <Text className="text-white text-center font-semibold">
                                    Close & Generate New Ticket
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
