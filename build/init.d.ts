import EventEmitter from "@mathrandom7910/tseventemitter";
import { FileClass } from "filec";
import { InitOptions } from "./initopts";
interface IRMap {
    ready: InitResult;
}
declare class InitResult extends EventEmitter<IRMap> {
    opts: InitOptions;
    constructor(opts: InitOptions);
    /**
     * Creates an entry. `Note that the object properties aren't known at runtime, therefore they will be undefined when the entry is first created (unless default data is given).`
     * @param name Name of the Entry to return, this is how it will appear in the local directory.
     * @param defaultData
     * @returns
     */
    entry<T>(name: string, defaultData?: Partial<T>): {
        new (data?: Partial<T> | undefined): {
            file: FileClass;
            data: {
                id: string;
            } & T;
            "__#2@#df": FileClass;
            "__#2@#dfExists": Promise<boolean> | null;
            "__#2@#iop": InitOptions;
            "__#2@#den": string;
            setFile(): void;
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
        findOne(propCol: string, val: any): Promise<import("./db").DBEntry<T> | null>;
    };
}
/**
 * Initialization function. `Note this function should only be called once`.
 * @param options Options to initialize.
 * @returns Initialization result with methods to manage the database.
 */
export declare function init(options?: Partial<InitOptions>): InitResult;
export {};
