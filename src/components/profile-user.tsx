import React from 'react';

type UserProfileProps = {
    name: string;
    email: string;
    phone?: string;
};

const ProfileUser: React.FC<UserProfileProps> = ({name, email, phone}) => {
    return (
        <div className="max-w-sm mx-auto bg-white rounded-2xl shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">User Profile</h2>

            <div className="mb-3">
                <span className="block text-sm font-medium text-gray-500">Username</span>
                <span className="text-gray-900">{name}</span>
            </div>

            <div className="mb-3">
                <span className="block text-sm font-medium text-gray-500">Email</span>
                <span className="text-gray-900">{email}</span>
            </div>
                <div>
                    <span className="block text-sm font-medium text-gray-500">Phone</span>
                    <span className="text-gray-900">{phone}</span>
                </div>
        </div>
    );
};

export default ProfileUser;

export function AppProfile({user
}: {
    user: {
        name: string;
        email: string;
        phone?: string;
    }
}) {
    return (
        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Profile</h2>
            <ProfileUser name={user.name} email={user.email} phone={user.phone}/>
        </div>
    );
}