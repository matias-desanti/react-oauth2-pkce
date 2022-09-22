"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = (0, react_1.useState)(() => {
        const item = localStorage.getItem(key);
        try {
            return item ? JSON.parse(item) : initialValue;
        }
        catch (error) {
            return initialValue;
        }
    });
    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        catch (error) {
            console.log(`Failed to store value '${value}' for key '${key}'`);
        }
    };
    return [storedValue, setValue];
}
exports.default = useLocalStorage;
