import { FileClass } from "filec";
import { BulkFileWriter } from "filec/js/writer";
import { InitOptions } from "./initopts";
export declare class DBEntry<T> {
    #private;
    file: FileClass;
    data: {
        id: string;
    } & T;
    static baseDir: string;
    static dbName: string;
    /**
     * Directory entry name, modifying this WILL cause issues
     */
    den: string;
    constructor(iOp: InitOptions, name: string);
    setFile(dEN: string): void;
    put<K extends keyof T>(key: K, value: T[K]): void;
    save(): Promise<void>;
}
export declare function entry<T, K = Partial<T>>(initOps: InitOptions, name: string, defaultData?: K): {
    new (data?: K): {
        file: FileClass;
        data: {
            id: string;
        } & T;
        "__#2@#bw": BulkFileWriter;
        "__#2@#df": FileClass;
        "__#2@#dfExists": Promise<boolean> | null;
        "__#2@#iop": InitOptions;
        /**
         * Directory entry name, modifying this WILL cause issues
         */
        den: string;
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
    findOne(propCol: string, val: any): Promise<DBEntry<T> | null>;
};
