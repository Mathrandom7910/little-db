"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const filec_1 = require("filec");
const db_1 = require("./db");
function init(options) {
    options ??= {};
    var bd = options.baseDirectory;
    var idLen = options.id;
    if (!bd) {
        bd = "./little-db/data/";
    }
    if (!idLen) {
        idLen = {
            length: 20
        };
    }
    if (!bd.endsWith("/") && !bd.endsWith("\\")) {
        bd = bd + "/";
    }
    const baseDir = new filec_1.FileClass(bd);
    baseDir.exists()
        .then((exists) => {
        if (!exists)
            baseDir.mkDirs();
    });
    return {
        entry: (name, defaultData) => {
            return (0, db_1.entry)(bd, name, idLen.length, defaultData);
        }
    };
}
exports.init = init;
//# sourceMappingURL=init.js.map