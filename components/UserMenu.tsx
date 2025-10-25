import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

interface UserMenuProps {
    isOpen: boolean;
    onToggle: () => void;
}

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);

const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const UserMenu: React.FC<UserMenuProps> = ({ isOpen, onToggle }) => {
    const { user, logout, deleteAccount } = useAuth();
    const { addToast } = useToast();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleLogout = () => {
        logout();
        addToast('Logged out successfully', 'info');
        onToggle();
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteAccount();
            if (result.success) {
                addToast('Account deleted successfully', 'success');
                onToggle();
            } else {
                addToast(result.error || 'Failed to delete account', 'error');
            }
        } catch (error) {
            addToast('An unexpected error occurred', 'error');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (!user) return null;

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className={`p-2 rounded-full transition-all duration-300 ${isOpen
                        ? 'bg-gray-600 text-white'
                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                    }`}
                aria-label="User menu"
            >
                <UserIcon />
            </button>

            {/* User Menu Panel */}
            {isOpen && (
                <div className="fixed inset-0 z-40 lg:relative lg:inset-auto">
                    {/* Mobile Overlay */}
                    <div
                        className="fixed inset-0 bg-black/50 lg:hidden"
                        onClick={onToggle}
                    />

                    {/* Panel */}
                    <div className="fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-gray-800 border-l border-gray-700 shadow-xl animate-slide-in-right lg:relative lg:h-auto lg:w-80 lg:border-l-0 lg:border lg:rounded-lg lg:shadow-lg">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-700 rounded-lg">
                                    <UserIcon className="w-5 h-5 text-gray-300" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{user.username}</h3>
                                    <p className="text-sm text-gray-400">{user.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={onToggle}
                                className="p-1 text-gray-400 hover:text-white transition-colors lg:hidden"
                                aria-label="Close user menu"
                            >
                                <XIcon />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4">
                            {/* User Info */}
                            <div className="bg-gray-700/50 rounded-lg p-3">
                                <p className="text-sm text-gray-300">
                                    Member since {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="space-y-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white border border-gray-600 rounded-lg transition-colors"
                                >
                                    <LogoutIcon className="w-4 h-4" />
                                    Sign Out
                                </button>

                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 border border-red-500/30 rounded-lg transition-colors"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    Delete Account
                                </button>
                            </div>

                            {/* Delete Confirmation */}
                            {showDeleteConfirm && (
                                <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                                    <p className="text-red-300 text-sm mb-3">
                                        Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={isDeleting}
                                            className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 disabled:bg-gray-600 text-white rounded transition-colors"
                                        >
                                            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
