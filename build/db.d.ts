import { FileClass as File } from "filec";
import { BulkFileWriter } from "filec/js/writer";
export declare class DBEntry<T> {
    #private;
    file: File;
    data: {
        id: string;
    } & T;
    static baseDir: string;
    static dbName: string;
    fileExists: boolean;
    constructor(bd: string, name: string, idLen: number);
    setFile(dEN: string): void;
    put<K extends keyof T>(key: K, value: T[K]): void;
    save(): Promise<void>;
}
export declare function entry<T, K = Partial<T>>(bd: string, name: string, idLen: number, defaultData?: K): {
    new (data?: K): {
        file: File;
        data: {
            id: string;
        } & T;
        "__#2@#bw": BulkFileWriter;
        "__#2@#df": File;
        "__#2@#dfExists": Promise<boolean> | null;
        fileExists: boolean;
        setFile(dEN: string): void;
        put<K_1 extends keyof T>(key: K_1, value: T[K_1]): void;
        save(): Promise<void>;
        "__#2@#checkExists"(): Promise<void>;
    };
    baseDir: string;
    dbName: string;
    findById(id: string): Promise<DBEntry<T> | null>;
    iter(cb: (entry: DBEntry<T>, cancel: () => void) => any): Promise<void>;
    all(): Promise<DBEntry<T>[]>;
    find(propCol: string, val: any, max?: number): Promise<DBEntry<T>[]>;
    findOne(propCol: string, val: any): Promise<DBEntry<T>>;
};
