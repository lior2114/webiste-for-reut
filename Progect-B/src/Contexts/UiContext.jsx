import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import rtlPlugin from 'stylis-plugin-rtl';

const UiContext = createContext();

export const useUi = () => {
    const ctx = useContext(UiContext);
    if (!ctx) throw new Error('useUi must be used within UiProvider');
    return ctx;
}

export const UiProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => localStorage.getItem('ui_language') || 'he'); // 'he' | 'en'
    const [mode, setMode] = useState(() => localStorage.getItem('ui_mode') || 'light'); // 'light' | 'dark'
    const [currency, setCurrency] = useState(() => localStorage.getItem('ui_currency') || 'ILS'); // 'ILS' | 'USD' | 'EUR'

    const direction = language === 'he' ? 'rtl' : 'ltr';

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = direction;
    }, [language, direction]);

    useEffect(() => {
        localStorage.setItem('ui_language', language);
    }, [language]);
    useEffect(() => {
        localStorage.setItem('ui_mode', mode);
    }, [mode]);
    useEffect(() => {
        localStorage.setItem('ui_currency', currency);
    }, [currency]);

    const theme = useMemo(() => createTheme({
        direction,
        palette: {
            mode,
            ...(mode === 'dark'
                ? {
                    text: { primary: '#e8eaf6', secondary: '#b8b9c9' },
                    background: { default: '#0f1021', paper: 'rgba(255,255,255,0.06)' }
                }
                : {
                    text: { primary: '#1b1e24', secondary: '#4a4f5a' },
                    background: { default: '#f7f9fc', paper: 'rgba(0,0,0,0.02)' }
                })
        },
        typography: { fontFamily: 'Rubik, Arial, sans-serif' }
    }), [direction, mode]);

    // Reflect theme mode on the root for CSS variable theming
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', mode);
    }, [mode]);

    const emotionCache = useMemo(() => {
        const key = direction === 'rtl' ? 'mui-rtl' : 'mui';
        const plugins = direction === 'rtl' ? [rtlPlugin] : [];
        return createCache({ key, stylisPlugins: plugins });
    }, [direction]);

    const toggleLanguage = () => setLanguage(prev => prev === 'he' ? 'en' : 'he');
    const toggleMode = () => setMode(prev => prev === 'light' ? 'dark' : 'light');

    const value = { language, direction, mode, currency, setCurrency, toggleLanguage, toggleMode };

    return (
        <CacheProvider value={emotionCache}>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <UiContext.Provider value={value}>
                        {children}
                    </UiContext.Provider>
                </ThemeProvider>
            </StyledEngineProvider>
        </CacheProvider>
    );
}
