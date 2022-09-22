declare function useLocalStorage<T>(key: string, initialValue: T): [T, (v: T) => void];
export default useLocalStorage;
