import { Children, createContext, useContext, useEffect, useState } from "react";
import { login as loginAPI, register as registerAPI, refreshUserData} from "../api/api";

const UserContexts = createContext();

export const UseUser = () => {
    const context = useContext(UserContexts)
    if (!context){
        throw new Error("Need to use Contexts")
    }
    return context
}

export const UserProvider = ({children}) => {
    const [user, setUser] = useState(() => {
        try{
            const raw = localStorage.getItem("user");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        try { return !!localStorage.getItem("user"); } catch { return false; }
    });
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(()=>{
        try{
            const userData = localStorage.getItem("user")
            if (userData){
                const parsed = JSON.parse(userData)
                setUser(parsed)
                setIsAuthenticated(true)
                // ensure token is available for protected API calls after refresh
                if (parsed && parsed.token) {
                    try { localStorage.setItem('token', parsed.token); } catch {}
                }
            }
        }catch(err){
            console.error(err)
            localStorage.removeItem("user")
            setUser(null)
            setIsAuthenticated(false)
        }
    },[])

    const login = async (getdata) =>{
        setLoading(true)
        setError(null)
        try{
            const response = await loginAPI(getdata)
            console.log(response)
            localStorage.setItem("user", JSON.stringify(response))
            // store JWT token for Authorization header
            try { if (response?.token) localStorage.setItem('token', response.token); } catch {}
            setUser(response)
            setIsAuthenticated(true)
            setLoading(false)
            return {success:true, user:response}
        }
        catch(error){
            const errorMessage = error.message || 'Login failed';
            setError(errorMessage);
            setLoading(false);
            throw error;
        }
    }

    const register = async (getdata) => {
        setLoading(true)
        setError(null)
        try{
            const response = await registerAPI(getdata)
            console.log(response)
            // Persist user
            localStorage.setItem("user", JSON.stringify(response))
            setUser(response)
            setIsAuthenticated(true)
            // If backend returned a token on register, store it
            try { if (response?.token) localStorage.setItem('token', response.token); } catch {}
            // If no token returned, auto-login to obtain one (needed for protected endpoints like likes)
            if (!response?.token && getdata?.user_email && getdata?.user_password){
                try {
                    const loginResp = await loginAPI({ user_email: getdata.user_email, user_password: getdata.user_password });
                    localStorage.setItem("user", JSON.stringify(loginResp))
                    try { if (loginResp?.token) localStorage.setItem('token', loginResp.token); } catch {}
                    setUser(loginResp)
                } catch (e) {
                    // If auto-login fails, continue without token; user can still navigate but protected actions will require login
                    console.warn('Auto-login after register failed:', e)
                }
            }
            setLoading(false)
            return {success:true, user:response}
        }
        catch(error){
            const errorMessage = error.message || 'Registration failed';
            setError(errorMessage);
            setLoading(false);
            throw error;
        }
    }   

    const logout = () => {
        localStorage.removeItem('user');
        try { localStorage.removeItem('token'); } catch {}
        setUser(null);
        setIsAuthenticated(false);
        setError(null);
    };

    const updatedUser = (getdata) => {
        const updatedUser = {...user, ...getdata}
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
    }

    const clearError = () => {
        setError(null)
    }

    const refreshUser = async () => {
        try {
            if (!isAuthenticated) return;
            const refreshedUser = await refreshUserData();
            const updatedUserWithToken = { ...refreshedUser, token: user?.token };
            setUser(updatedUserWithToken);
            localStorage.setItem("user", JSON.stringify(updatedUserWithToken));
            return updatedUserWithToken;
        } catch (error) {
            console.error('Failed to refresh user data:', error);
            // If refresh fails due to auth issues, logout
            if (error.message.includes('401') || error.message.includes('token')) {
                logout();
            }
            throw error;
        }
    }

    const value = {
        login,
        logout,
        register,
        updatedUser,
        clearError,
        refreshUser,
        user,
        error,
        isAuthenticated,
        loading
    }

    return(
        <UserContexts.Provider value = {value}>
            {children}
        </UserContexts.Provider>
    )
}