/***********************************************************
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License
 **********************************************************/
import * as React from 'react';
import { THEME_DARK, THEME_LIGHT } from '../../../app/constants/themes';

export enum Themes {
    light = 'light',
    dark = 'dark',
}
export enum MonacoTheme {
    light = 'vs-light',
    dark = 'vs-dark',
}

const setTheme = (theme: Themes) => {
    document.body.classList.remove(`theme-${theme === Themes.dark ? Themes.light : Themes.dark}`); // remove existing theme
    document.body.classList.add('theme-' + theme);
    localStorage.setItem('theme', theme);
};

const getTheme = () => {
    const theme = localStorage.getItem('theme');
    return {
        fabricTheme: theme === Themes.dark ? THEME_DARK : THEME_LIGHT,
        monacoTheme: theme === Themes.dark ? MonacoTheme.dark : MonacoTheme.light,
        theme: theme === Themes.dark ? Themes.dark : Themes.light
    };
};

export const ThemeContext = React.createContext({
    fabricTheme: THEME_LIGHT,
    monacoTheme: MonacoTheme.light,
    setTheme,
    theme: Themes.light
});

export const ThemeProvider: React.FC<{}> = ({ children }) => {
        const currentTheme = getTheme();
        return (
            <ThemeContext.Provider
                value={{ ...currentTheme, setTheme }}
            >
                {children}
            </ThemeContext.Provider>
        );
};
