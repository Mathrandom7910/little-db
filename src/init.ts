import EventEmitter from "@mathrandom7910/tseventemitter";
import { FileClass } from "filec";
import { entry } from "./db";
import { InitOptions } from "./initopts";
import { DefaultParser } from "./parser/parser";

interface IRMap {
    ready: InitResult;
}

class InitResult extends EventEmitter<IRMap> {
    constructor(public opts: InitOptions) {
        super();
    }
    
    /**
     * Creates an entry. `Note that the object properties aren't known at runtime, therefore they will be undefined when the entry is first created (unless default data is given).`
     * @param name Name of the Entry to return, this is how it will appear in the local directory.
     * @param defaultData 
     * @returns 
     */
    
    entry<T>(name: string, defaultData?: Partial<T>) {
        return entry<T>(this.opts, name, defaultData);
    }
}

/**
 * Initialization function. `Note this function should only be called once`.
 * @param options Options to initialize.
 * @returns Initialization result with methods to manage the database.
 */

export function init(options?: Partial<InitOptions>) {
    options ??= {};

    if (!options.baseDirectory) {
        options.baseDirectory = "./little-db/data/";
    }

    if(!options.id) {
        options.id = {
            length: 20
        }
    }

    if(!options.baseDirectory.endsWith("/") && !options.baseDirectory.endsWith("\\")) {
        options.baseDirectory += "/";
    }

    if(!options.parser) {
        options.parser = new DefaultParser();
    }

    if(!options.Filec) {
        options.Filec = FileClass;
    }

    const baseDir = new FileClass(options.baseDirectory);
    baseDir
    .exists()
    .then(async (exists) => {
        if(!exists){
            await baseDir.mkDirs();
        }
        ir.emit("ready", ir);
    });

    
    const ir = new InitResult(options as InitOptions);
    ir.entry = ir.entry.bind(ir);
    return ir;
}