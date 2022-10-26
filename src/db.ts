import { FileClass } from "filec"
import { BulkFileWriter } from "filec/js/writer";
import { InitOptions } from "./initopts";

const chars = "qwertyuiopasdfghjklzxcvbnm1234567890";

function randCharSeq(len: number) {
    var seq = "";
    for (let i = 0; i < len; i++) {
        seq += chars[Math.floor(Math.random() * chars.length)][Math.random() < .5 ? "toLowerCase" : "toUpperCase"]();
    }

    return seq;
}

export class DBEntry<T> {
    file!: FileClass;
    data: {
        id: string
    } & T;

    static baseDir: string;
    static dbName: string;

    #bw!: BulkFileWriter;

    #df;
    #dfExists: Promise<boolean> | null;
    #iop;

    /**
     * Directory entry name, modifying this WILL cause issues
     */
    den!: string;

    constructor(iOp: InitOptions, name: string) {
        this.#iop = iOp;
        this.data = {
            id: ""
        } as any;

        this.data.id = randCharSeq(iOp.id.length);

        const dirEntryName = `${iOp.baseDirectory}${name}`;
        const dirFile = new iOp.Filec(dirEntryName);
        this.#df = dirFile;
        this.#dfExists = dirFile.exists();

        this.setFile(dirEntryName);
    }

    setFile(dEN: string) {
        this.den = dEN;
        this.file = new this.#iop.Filec(`${dEN}/${this.data.id}.json`);
        this.#bw = this.file.writer().bulkWriter();
    }

    put<K extends keyof T>(key: K, value: T[K]) {
        (this.data as any)[key] = value;
    }

    async save() {
        console.log("saving", this.data);
        await this.#checkExists();
        await this.#bw.write(this.#iop.parser.toStorage(this.data));
    }


    async #checkExists() {
        if(this.#dfExists == null) {
            return;
        }
        const existsBool = await this.#dfExists;

        if(existsBool) {
            this.#dfExists = null;
            return;
        }

        await this.#df.mkDirs();
    }
}

export function entry<T, K = Partial<T>>(initOps: InitOptions, name: string, defaultData?: K) {
    return class extends DBEntry<T> {
        constructor(data?: K) {
            super(initOps, name);

            if(data) {
                this.data = data as any;
            }
        }

        static override baseDir = initOps.baseDirectory;
        static override dbName = name;

        static async findById(id: string) {
            const file = new initOps.Filec(`${this.baseDir}${this.dbName}/${id}.json`);

            if (!(await file.exists())) {
                return null;
            }

            const parsed = initOps.parser.fromStorage(await file.reader().read("utf-8"));
            const entry = new DBEntry<T>(initOps, name);

            if (defaultData) {
                for (let i in defaultData) {
                    (entry.data as any)[i] = defaultData[i];
                }
            }

            for (let i in parsed) {
                (entry.data as any)[i] = (parsed as any)[i];
            }

            entry.setFile(entry.den);

            return entry;
        }

        static async iter(cb: (entry: DBEntry<T>, cancel: () => void) => any) {
            const fDir = `${this.baseDir}${this.dbName}/`;
            const fileDir = new initOps.Filec(fDir);

            const walkRes = await fileDir.walk();

            var cancelled = false;
            function cancel() {
                cancelled = true;
            }

            for(const file of walkRes) {
                const entry = await this.findById(file.split(".json")[0]);
                if(entry == null) continue;
                cb(entry, cancel);
                if(cancelled) break;
            }
        }

        static async all() {
            const entries: DBEntry<T>[] = [];
            await this.iter((entry) => {
                entries.push(entry);
            });
            return entries;
        }

        static async find(propCol: string, val: any, max = 1) {
            const props: string[] = [];
            const entries: DBEntry<T>[] = [];
            var nextEscaped = false;
            var curProp = "";
            for(let i of propCol) {
                if(nextEscaped) {
                    curProp += i;
                    nextEscaped = false;
                    continue;
                }

                if(i == "\\") {
                    nextEscaped = true;
                    continue;
                }

                if(i == ".") {
                    props.push(curProp);
                    curProp = "";
                    continue;
                }

                curProp += i;
            }

            props.push(curProp);

            const allEntries = await this.all();

            
            for(const entry of allEntries) {

                if(entry == null) continue;

                var curProp = props[0];
                var curObj = entry.data as Record<string, any>;
                for(const prop of props) {
                    if(prop.length == 0 || curObj == null) {
                        continue;
                    }
                    curObj = curObj[prop];
                }

                if(curObj == val) {
                    entries.push(entry);
                    if(entries.length >= max) {
                        return entries;
                    }
                }
            }

            return entries;
        }

        static async findOne(propCol: string, val: any): Promise<DBEntry<T> | null> {
            return (await this.find(propCol, val, 1))[0] || null;
        }
    }
}

