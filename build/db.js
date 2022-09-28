"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entry = exports.DBEntry = void 0;
const filec_1 = require("filec");
const chars = "qwertyuiopasdfghjklzxcvbnm1234567890";
class DBEntry {
    file;
    data;
    static baseDir;
    static dbName;
    constructor(name) {
        this.data = {
            id: ""
        };
        for (let i = 0; i < 10; i++) {
            this.data.id += chars[Math.floor(Math.random() * chars.length)][Math.random() < .5 ? "toLowerCase" : "toUpperCase"]();
        }
        this.file = new filec_1.FileClass(`${DBEntry.baseDir}${name}/${this.data.id}.json`);
    }
    put(key, value) {
        this.data[key] = value;
    }
}
exports.DBEntry = DBEntry;
function entry(bd, name, defaultData) {
    return class extends DBEntry {
        static baseDir = bd;
        static dbName = name;
        static async findById(id) {
            const file = new filec_1.FileClass(`${this.baseDir}${this.dbName}/${id}.json`);
            if (!(await file.exists())) {
                return null;
            }
            const parsed = JSON.parse(await file.reader().read("utf-8"));
            const entry = new DBEntry(name);
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
        static async find(prop, _val) {
            const props = [];
            var nextEscaped = false;
            var curProp = "";
            for (let i of prop) {
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
                }
                curProp += i;
            }
            const fileDir = new filec_1.FileClass(`${this.baseDir}${this.dbName}/`);
            const walkRes = await fileDir.walk();
            for (const file of walkRes) {
                console.log(file);
            }
        }
    };
}
exports.entry = entry;
//# sourceMappingURL=db.js.map