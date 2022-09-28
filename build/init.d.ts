import { FileClass } from "filec";
export declare function init(options?: Partial<InitOptions>): Promise<{
    entry: <T>(name: string, defaultData?: Partial<T> | undefined) => {
        new (name: string): {
            file: FileClass;
            data: {
                id: string;
            } & T;
            put<K extends keyof T>(key: K, value: T[K]): void;
        };
        baseDir: string;
        dbName: string;
        findById(id: string): Promise<import("./db").DBEntry<T> | null>;
        find(prop: string, _val: any): Promise<void>;
    };
}>;
interface InitOptions {
    /**
     * The base directory for data to be stored
     */
    baseDirectory: string;
}
export {};
