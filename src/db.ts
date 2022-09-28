import { FileClass as File } from "filec"
import { BulkFileWriter } from "filec/js/writer";

const chars = "qwertyuiopasdfghjklzxcvbnm1234567890";

function randCharSeq(len: number) {
    var seq = "";
    for (let i = 0; i < len; i++) {
        seq += chars[Math.floor(Math.random() * chars.length)][Math.random() < .5 ? "toLowerCase" : "toUpperCase"]();
    }

    return seq;
}

export class DBEntry<T> {
    file!: File;
    data: {
        id: string
    } & T;

    static baseDir: string;
    static dbName: string;

    #bw!: BulkFileWriter;

    #df;
    #dfExists: Promise<boolean> | null;

    fileExists = false;

    constructor(bd: string, name: string, idLen: number) {

        this.data = {
            id: ""
        } as any;

        this.data.id = randCharSeq(idLen);

        const dirEntryName = `${bd}${name}`;
        const dirFile = new File(dirEntryName);
        this.#df = dirFile;
        this.#dfExists = dirFile.exists();

        this.setFile(dirEntryName)
    }

    setFile(dEN: string) {
        this.file = new File(`${dEN}/${this.data.id}.json`);
        this.#bw = this.file.writer().bulkWriter();
    }

    put<K extends keyof T>(key: K, value: T[K]) {
        (this.data as any)[key] = value;
    }

    async save() {
        await this.#checkExists();
        await this.#bw.write(JSON.stringify(this.data));
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

export function entry<T, K = Partial<T>>(bd: string, name: string, idLen: number, defaultData?: K) {
    return class extends DBEntry<T> {
        constructor(data?: K) {
            super(bd, name, idLen);

            if(data) {
                this.data = data as any;
            }
        }

        static override baseDir = bd;
        static override dbName = name;

        static async findById(id: string) {
            const file = new File(`${this.baseDir}${this.dbName}/${id}.json`);

            if (!(await file.exists())) {
                return null;
            }

            const parsed = JSON.parse(await file.reader().read("utf-8"));
            const entry = new DBEntry<T>(bd, name, idLen);

            if (defaultData) {
                for (let i in defaultData) {
                    (entry.data as any)[i] = defaultData[i];
                }
            }

            for (let i in parsed) {
                (entry.data as any)[i] = parsed[i];
            }

            return entry;
        }

        static async iter(cb: (entry: DBEntry<T>, cancel: () => void) => any) {
            const fDir = `${this.baseDir}${this.dbName}/`;
            const fileDir = new File(fDir);

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

        static async findOne(propCol: string, val: any) {
            return (await this.find(propCol, val, 1))[0];
        }
    }
}

