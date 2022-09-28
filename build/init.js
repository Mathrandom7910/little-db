"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const filec_1 = require("filec");
const db_1 = require("./db");
async function init(options) {
    options ??= {};
    var bd = options.baseDirectory;
    if (!bd) {
        bd = "./little-db/data/";
    }
    if (!bd.endsWith("/") || !bd.endsWith("\\")) {
        bd = bd + "/";
    }
    const baseDir = new filec_1.FileClass(bd);
    if (!(await baseDir.exists())) {
        await baseDir.mkDirs();
    }
    return {
        entry: (name, defaultData) => {
            return (0, db_1.entry)(bd, name, defaultData);
        }
    };
}
exports.init = init;
//# sourceMappingURL=init.js.map