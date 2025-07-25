import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from '@/context/ctx';
import { Feather, Fontisto } from '@expo/vector-icons';

const loginSchema = z.object({
    email: z.string().email('Please provide a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SignInScreen() {
    const { signIn, isLoading, signInError } = useSession();
    const [passwordVisible, setPasswordVisible] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = (data: LoginFormData) => {
        signIn(data);
    };

    const renderFieldError = (text: string) => (
        <Text className="mt-1 text-red-500 text-xs font-medium">{text}</Text>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header Section */}
            <View className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 pt-8 pb-12">
                <View className="items-center">
                    <View className="w-20 h-20 bg-black/20 rounded-full mb-4 items-center justify-center border-2 border-black/30">
                        <Feather name="map-pin" color="black" size={32} />
                    </View>
                    <Text className=" text-2xl font-bold">ParkPOS</Text>
                    <Text className="text-gray-500 text-sm mt-1">Parking Management System</Text>
                </View>
            </View>

            <View className="flex-1 px-6 -mt-6">
                <View className="bg-white rounded-2xl py-10 px-5 shadow-2xl">
                    <View className="items-center mb-8 ">
                        <Text className="text-2xl font-bold text-slate-800 mb-2">Staff Login</Text>
                        <Text className="text-slate-500 text-center">
                            Access your parking management scanner
                        </Text>
                    </View>

                    <View className="space-y-5">
                        <View>
                            <Text className="text-sm font-semibold text-slate-700 mb-2">
                                Email Address
                            </Text>
                            <Controller
                                control={control}
                                name="email"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View
                                        className={`flex-row items-center bg-slate-50 rounded-xl px-4 h-14 border ${
                                            errors.email
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-slate-200 focus:border-orange-400'
                                        }`}>
                                        <View className="w-8 items-center">
                                            <Fontisto
                                                name="email"
                                                color={errors.email ? '#ef4444' : '#64748b'}
                                                size={16}
                                            />
                                        </View>
                                        <TextInput
                                            autoCapitalize="none"
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholderTextColor="#94a3b8"
                                            className="flex-1 ml-3 text-base text-slate-800 font-medium"
                                            placeholder="staff@parkpos.com"
                                        />
                                    </View>
                                )}
                            />
                            {errors.email?.message && renderFieldError(errors.email.message)}
                        </View>

                        <View>
                            <Text className="text-sm font-semibold text-slate-700 mb-2">
                                Password
                            </Text>
                            <Controller
                                control={control}
                                name="password"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View
                                        className={`flex-row items-center bg-slate-50 rounded-xl px-4 h-14 border ${
                                            errors.password
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-slate-200 focus:border-orange-400'
                                        }`}>
                                        <View className="w-8 items-center">
                                            <Feather
                                                name="lock"
                                                color={errors.password ? '#ef4444' : '#64748b'}
                                                size={16}
                                            />
                                        </View>
                                        <TextInput
                                            secureTextEntry={!passwordVisible}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholderTextColor="#94a3b8"
                                            className="flex-1 ml-3 text-base text-slate-800 font-medium"
                                            placeholder="Enter your password"
                                        />
                                        <TouchableOpacity
                                            onPress={() => setPasswordVisible(!passwordVisible)}
                                            className="w-8 items-center justify-center">
                                            <Feather
                                                name={passwordVisible ? 'eye-off' : 'eye'}
                                                color="#64748b"
                                                size={16}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                            {errors.password?.message && renderFieldError(errors.password.message)}
                        </View>
                    </View>

                    {signInError && (
                        <View className="bg-red-50 border-l-4 border-red-400 p-4 mt-6 rounded-r-lg">
                            <View className="flex-row items-center">
                                <Feather name="alert-circle" color="#ef4444" size={16} />
                                <Text className="text-red-700 text-sm font-medium ml-2">
                                    {signInError}
                                </Text>
                            </View>
                        </View>
                    )}

                    <TouchableOpacity
                        className={`bg-blue-400 py-4 rounded-xl justify-center items-center mt-8 shadow-lg ${
                            isLoading ? 'opacity-75' : 'active:scale-98'
                        }`}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isLoading}>
                        {isLoading ? (
                            <View className="flex-row items-center">
                                <ActivityIndicator color="#fff" size="small" />
                                <Text className="text-white text-base font-semibold ml-2">
                                    Signing In...
                                </Text>
                            </View>
                        ) : (
                            <View className="flex-row items-center ">
                                <Feather name="log-in" color="white" size={18} />
                                <Text className="text-white text-base font-semibold ml-2">
                                    Log in
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View className="mt-8 pt-6 border-t border-slate-100">
                        <View className="items-center mt-4">
                            <Text className="text-slate-400 text-xs">
                                Secure Login • Version 2.1.0
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
