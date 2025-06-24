"use client"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/auth';
import { IUser, UserServices } from '@/services/user.service';
import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { environment } from '@/environment/environment';

const FamilyTaxFiling = () => {
    const router = useRouter();
    const [fullName, setfullName] = useState('');
    const [relation, setRelation] = useState('');
    const [cnic, setCnic] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    const currentUser = getCurrentUser();

    if (!currentUser) {
        console.log("No current user, redirecting to login...");
        Cookies.remove('user');
        Cookies.remove('token');
        router.push('/auth/login');
        return null; // Prevent rendering if redirecting
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (relation === '') {
            setError('Select a relation before submitting form');
            return;
        }
        if (cnic.length === 0 || !validateCNIC(cnic)) {
            setError('Please enter a valid CNIC xxxxx-xxxxxxx-x');
            return;
        }
        if (!validateMobile(phoneNumber)) {
            setError('Please enter a valid phone number 03xx-xxxxxxx');
            return;
        }
        setError('');

        const formData = { fullName, cnic, email, phoneNumber, password: environment.pass };
        const us = new UserServices();

        try {
            // Step 1: Create the new user
            const user2 = await us.createUser(formData);
            console.log("Created user:", user2);

            // Step 2: Update relations for the logged-in user
            const loggedUser = getCurrentUser();
            try {
                await us.updateRelations(loggedUser.id, { userId: user2._id, relation });
                toast({
                    title: "Family Tax Filing Created",
                    description: `Tax filing for ${user2.fullName} created`,
                    variant: 'default',
                });
            } catch (err) {
                console.error("Error updating relations:", err);
                toast({
                    title: "Family Tax Filing Not Created",
                    description: `Tax filing for ${user2.fullName} was not created`,
                    variant: 'destructive',
                });
                return;
            }

            // Step 3: Log out the current user by removing cookies
            Cookies.remove('user');
            Cookies.remove('token');

            // Step 4: Log in as the new user
            const as = new AuthService();
            const result = await as.login(email, environment.pass);
            if (result.token) {
                toast({
                    title: "Switched Dashboard",
                    description: "Welcome to dashboard...",
                    variant: "default",
                });
                Cookies.set("token", result.token, { sameSite: "Strict" });
                Cookies.set("user", JSON.stringify(result.user), { sameSite: "Strict" });

                setTimeout(() => {
                    const user: any = result.user;
                    if (user?.role === "admin") {
                        window.location.href = "/dashboard/admin";
                    } else if (user.role === "accountant") {
                        window.location.href = "/dashboard/accountant";
                    } else {
                        window.location.href = "/dashboard";
                    }
                }, 1500);
            } else {
                toast({
                    title: "Login Failed",
                    description: result.token || "Invalid email or password",
                    variant: "destructive",
                });
            }
        } catch (e: any) {
            console.error("Error creating user:", e);
            if (e.status === 409) {
                toast({
                    title: "Error Creating Family Tax Filing",
                    description: "Cannot create family tax filing as this email already exists.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error Creating Family Tax Filing",
                    description: "Cannot create family tax filing due to server error.",
                    variant: "destructive",
                });
            }
        }
    };

    const validateCNIC = (value: string) => {
        const cnicPattern = /^\d{5}-\d{7}-\d{1}$/;
        return cnicPattern.test(value) ? value : '';
    };

    const validateMobile = (value: string) => {
        const mobilePattern = /^\d{11}$/;
        return mobilePattern.test(value) ? value : '';
    };

    return (
        <div className="p-20">
            <h2 className="text-2xl font-bold mb-4">Manage Account</h2>
            <p className="mb-4">Please provide the below information which is required to create another profile.</p>
            <button className="bg-red-500 text-white px-4 py-2 mr-2">CREATE ACCOUNT</button>
            <hr className="my-4 border-red-500" />
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <span className='text-red-500 font-semibold'>{error}</span>}
                <div className='flex flex-col gap-2'>
                    <Label className="block">Your Full Name</Label>
                    <Input
                        type="text"
                        value={fullName}
                        onChange={(e) => setfullName(e.target.value)}
                        className="border border-blue-500 p-2 w-full"
                        placeholder="Enter your Full Name here"
                        required
                    />
                </div>
                <div className="flex space-x-4">
                    <div className="flex flex-col gap-2 w-1/2">
                        <Label className="block">Relation</Label>
                        <Select value={relation} onValueChange={(value) => setRelation(value)}>
                            <SelectTrigger className="border p-2 w-full">
                                <SelectValue placeholder="Select relation..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="parent">Parent</SelectItem>
                                <SelectItem value="spouse">Spouse</SelectItem>
                                <SelectItem value="child">Child</SelectItem>
                                <SelectItem value="sibling">Sibling</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2 w-1/2">
                        <Label className="block">CNIC No.</Label>
                        <Input
                            type="text"
                            value={cnic}
                            onChange={(e) => setCnic(e.target.value)}
                            className="border p-2 w-full"
                            placeholder="xxxxx-xxxxxxx-x"
                            required
                        />
                    </div>
                </div>
                <div className="flex space-x-4">
                    <div className="flex flex-col gap-2 w-1/2">
                        <Label className="block">Email Address</Label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border p-2 w-full"
                            placeholder='email@example.com'
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-1/2">
                        <Label className="block">Mobile No.</Label>
                        <Input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber((e.target.value))}
                            className="border p-2 w-full"
                            placeholder="03xx-xxxxxxx"
                            required
                        />
                    </div>
                </div>
                <div className='justify-self-end'>
                    <Button variant={'destructive'} type='submit'>Submit</Button>
                </div>
            </form>
        </div>
    );
};

export default FamilyTaxFiling;