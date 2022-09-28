import { FileClass as File } from "filec";
export declare class DBEntry<T> {
    file: File;
    data: {
        id: string;
    } & T;
    static baseDir: string;
    static dbName: string;
    constructor(name: string);
    put<K extends keyof T>(key: K, value: T[K]): void;
}
export declare function entry<T>(bd: string, name: string, defaultData?: Partial<T>): {
    new (name: string): {
        file: File;
        data: {
            id: string;
        } & T;
        put<K extends keyof T>(key: K, value: T[K]): void;
    };
    baseDir: string;
    dbName: string;
    findById(id: string): Promise<DBEntry<T> | null>;
    find(prop: string, _val: any): Promise<void>;
};
