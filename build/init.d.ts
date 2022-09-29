import { FileClass } from "filec";
export declare function init(options?: Partial<InitOptions>): {
    entry: <T>(name: string, defaultData?: Partial<T> | undefined) => {
        new (data?: Partial<T> | undefined): {
            file: FileClass;
            data: {
                id: string;
            } & T;
            "__#2@#bw": import("filec/js/writer").BulkFileWriter;
            "__#2@#df": FileClass;
            "__#2@#dfExists": Promise<boolean> | null;
            fileExists: boolean;
            setFile(dEN: string): void;
            put<K extends keyof T>(key: K, value: T[K]): void;
            save(): Promise<void>;
            "__#2@#checkExists"(): Promise<void>;
        };
        baseDir: string;
        dbName: string;
        findById(id: string): Promise<import("./db").DBEntry<T> | null>;
        iter(cb: (entry: import("./db").DBEntry<T>, cancel: () => void) => any): Promise<void>;
        all(): Promise<import("./db").DBEntry<T>[]>;
        find(propCol: string, val: any, max?: number): Promise<import("./db").DBEntry<T>[]>;
        findOne(propCol: string, val: any): Promise<import("./db").DBEntry<T>>;
    };
};
interface InitOptions {
    /**
     * The base directory for data to be stored
     */
    baseDirectory: string;
    id: {
        length: number;
    };
}
export {};
