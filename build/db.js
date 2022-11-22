"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entry = exports.DBEntry = void 0;
const chars = "qwertyuiopasdfghjklzxcvbnm1234567890";
function randCharSeq(len) {
    var seq = "";
    for (let i = 0; i < len; i++) {
        seq += chars[Math.floor(Math.random() * chars.length)][Math.random() < .5 ? "toLowerCase" : "toUpperCase"]();
    }
    return seq;
}
class DBEntry {
    file;
    data;
    static baseDir;
    static dbName;
    #bw;
    #df;
    #dfExists;
    #iop;
    /**
     * Directory entry name, modifying this WILL cause issues
     */
    den;
    constructor(iOp, name) {
        this.#iop = iOp;
        this.data = {
            id: ""
        };
        this.data.id = randCharSeq(iOp.id.length);
        const dirEntryName = `${iOp.baseDirectory}${name}`;
        const dirFile = new iOp.Filec(dirEntryName);
        this.#df = dirFile;
        this.#dfExists = dirFile.exists();
        this.setFile(dirEntryName);
    }
    setFile(dEN) {
        this.den = dEN;
        this.file = new this.#iop.Filec(`${dEN}/${this.data.id}.json`);
        this.#bw = this.file.writer().bulkWriter();
    }
    put(key, value) {
        this.data[key] = value;
    }
    async save() {
        await this.#checkExists();
        await this.#bw.write(this.#iop.parser.toStorage(this.data));
    }
    async #checkExists() {
        if (this.#dfExists == null) {
            return;
        }
        const existsBool = await this.#dfExists;
        if (existsBool) {
            this.#dfExists = null;
            return;
        }
        await this.#df.mkDirs();
    }
}
exports.DBEntry = DBEntry;
function entry(initOps, name, defaultData) {
    return class extends DBEntry {
        constructor(data) {
            super(initOps, name);
            if (data) {
                this.data = data;
            }
        }
        static baseDir = initOps.baseDirectory;
        static dbName = name;
        static async findById(id) {
            const file = new initOps.Filec(`${this.baseDir}${this.dbName}/${id}.json`);
            if (!(await file.exists())) {
                return null;
            }
            const parsed = initOps.parser.fromStorage(await file.reader().read("utf-8"));
            const entry = new DBEntry(initOps, name);
            if (defaultData) {
                for (let i in defaultData) {
                    entry.data[i] = defaultData[i];
                }
            }
            for (let i in parsed) {
                entry.data[i] = parsed[i];
            }
            entry.setFile(entry.den);
            return entry;
        }
        static async iter(cb) {
            const fDir = `${this.baseDir}${this.dbName}/`;
            const fileDir = new initOps.Filec(fDir);
            const walkRes = await fileDir.walk();
            var cancelled = false;
            function cancel() {
                cancelled = true;
            }
            for (const file of walkRes) {
                const entry = await this.findById(file.split(".json")[0]);
                if (entry == null)
                    continue;
                cb(entry, cancel);
                if (cancelled)
                    break;
            }
        }
        static async all() {
            const entries = [];
            await this.iter((entry) => {
                entries.push(entry);
            });
            return entries;
        }
        static async find(propCol, val, max = 1) {
            const props = [];
            const entries = [];
            var nextEscaped = false;
            var curProp = "";
            for (let i of propCol) {
                if (nextEscaped) {
                    curProp += i;
                    nextEscaped = false;
                    continue;
                }
                if (i == "\\") {
                    nextEscaped = true;
                    continue;
                }
                if (i == ".") {
                    props.push(curProp);
                    curProp = "";
                    continue;
                }
                curProp += i;
            }
            props.push(curProp);
            const allEntries = await this.all();
            for (const entry of allEntries) {
                if (entry == null)
                    continue;
                var curProp = props[0];
                var curObj = entry.data;
                for (const prop of props) {
                    if (prop.length == 0 || curObj == null) {
                        continue;
                    }
                    curObj = curObj[prop];
                }
                if (curObj == val) {
                    entries.push(entry);
                    if (entries.length >= max) {
                        return entries;
                    }
                }
            }
            return entries;
        }
        static async findOne(propCol, val) {
            return (await this.find(propCol, val, 1))[0] || null;
        }
    };
}
exports.entry = entry;
//# sourceMappingURL=db.js.map