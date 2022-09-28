import { FileClass } from "filec";
import { entry } from "./db";


export async function init(options?: Partial<InitOptions>) {
    options ??= {};
    var bd = options.baseDirectory;
    var idLen = options.id;

    if (!bd) {
        bd = "./little-db/data/";
    }

    if(!idLen) {
        idLen = {
            length: 20
        }
    }

    if(!bd.endsWith("/") && !bd.endsWith("\\")) {
        bd = bd + "/";
    }

    const baseDir = new FileClass(bd);
    if (!(await baseDir.exists())) {
        await baseDir.mkDirs();
    }

    

    return {
        entry: <T>(name: string, defaultData?: Partial<T>) => {
            return entry<T>(bd!, name, idLen!.length, defaultData);
        }
    }
}

interface InitOptions {
    /**
     * The base directory for data to be stored
     */
    baseDirectory: string;

    id: {
        length: number
    }
}
