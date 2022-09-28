"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entry = exports.DBEntry = void 0;
const filec_1 = require("filec");
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
    fileExists = false;
    constructor(bd, name, idLen) {
        this.data = {
            id: ""
        };
        this.data.id = randCharSeq(idLen);
        const dirEntryName = `${bd}${name}`;
        const dirFile = new filec_1.FileClass(dirEntryName);
        this.#df = dirFile;
        this.#dfExists = dirFile.exists();
        this.setFile(dirEntryName);
    }
    setFile(dEN) {
        this.file = new filec_1.FileClass(`${dEN}/${this.data.id}.json`);
        this.#bw = this.file.writer().bulkWriter();
    }
    put(key, value) {
        this.data[key] = value;
    }
    async save() {
        await this.#checkExists();
        await this.#bw.write(JSON.stringify(this.data));
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
function entry(bd, name, idLen, defaultData) {
    return class extends DBEntry {
        constructor(data) {
            super(bd, name, idLen);
            if (data) {
                this.data = data;
            }
        }
        static baseDir = bd;
        static dbName = name;
        static async findById(id) {
            const file = new filec_1.FileClass(`${this.baseDir}${this.dbName}/${id}.json`);
            if (!(await file.exists())) {
                return null;
            }
            const parsed = JSON.parse(await file.reader().read("utf-8"));
            const entry = new DBEntry(bd, name, idLen);
            if (defaultData) {
                for (let i in defaultData) {
                    entry.data[i] = defaultData[i];
                }
            }
            for (let i in parsed) {
                entry.data[i] = parsed[i];
            }
            return entry;
        }
        static async iter(cb) {
            const fDir = `${this.baseDir}${this.dbName}/`;
            const fileDir = new filec_1.FileClass(fDir);
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
            return (await this.find(propCol, val, 1))[0];
        }
    };
}
exports.entry = entry;
//# sourceMappingURL=db.js.map