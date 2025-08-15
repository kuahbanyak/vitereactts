import React, { useEffect } from 'react';
import { useAuth } from '@/auth/use-auth';
import {AppProfile} from '@/components/profile-user';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export function ProfilePage() {
    const {user, getProfile, isLoading} = useAuth();

    useEffect(() => {
        if (!user) {
            getProfile();
        }
    }, [user, getProfile]);

    if (isLoading) return <div className="p-4">Loading profile...</div>;
    if (!user) return <div className="p-4">No user data.</div>;

    return (
        <SidebarProvider
            style={
                {
                    '--sidebar-width': 'calc(var(--spacing) * 72)',
                    '--header-height': 'calc(var(--spacing) * 12)',
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset"/>
            <SidebarInset>
                <SiteHeader title="Account"/>
                <div className="flex flex-1 flex-col p-6">
                    <div className="max-w-xl">
                        <AppProfile
                            key={user.name}
                            user={{
                                name: user.name ,
                                email: user.email,
                                phone: user.phone
                            }}
                        />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
