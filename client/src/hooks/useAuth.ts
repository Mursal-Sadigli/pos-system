import {useAuthStore} from '@/store/authStore';
import {useRouter} from 'next/navigation';

export function useAuth(){
    const router=useRouter();
    const {user, token, isLoading, login, logout, setUser, setToken}=useAuthStore();

    return{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout: () => {
            logout();
            router.push('/login');
        },
        setUser,
        setToken,
    };
}