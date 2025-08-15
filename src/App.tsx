import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {AuthProvider} from '@/auth/auth-context';
import {useAuth} from '@/auth/use-auth';
import {LoginPage} from '@/app/login/page';
import RegisterPage from '@/app/register/page';
import {Page as DashboardPage} from '@/app/dashboard/page';
import {ProfilePage} from './app/profile/page';

function PrivateRoute({children}: { children: React.ReactElement }) {
    const {isAuthenticated, isLoading} = useAuth();
    if (isLoading) return <div className="p-4">Loading...</div>;
    if (!isAuthenticated) return <Navigate to="/login" replace/>;
    return children;
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/register" element={<RegisterPage/>}/>
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <DashboardPage/>
                            </PrivateRoute>

                        }
                    />
                    <Route
                        path="/dashboard/profile"
                        element={
                            <PrivateRoute>
                                <ProfilePage/>
                            </PrivateRoute>
                        }
                    />
                    <Route path="/profile" element={<Navigate to="/dashboard/profile" replace/>}/>
                    <Route path="/" element={<Navigate to="/login" replace/>}/>
                    <Route path="*" element={<Navigate to="/login" replace/>}/>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
