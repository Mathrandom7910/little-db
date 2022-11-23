import { AES, enc } from "crypto-js";
import { AbstractParser, init } from "../src/index";

interface UserData {
    userName: string,
    info: {
        age: number,
        height: number
    }
}

class EncryptionParser implements AbstractParser {
    toStorage(data: {}): string | Buffer {
        return AES.encrypt(JSON.stringify(data), "testkey").toString();
    }

    fromStorage(data: string | Buffer): {} {
        if(typeof data != "string") {
            data = data.toString("utf-8");
        }

        return JSON.parse(AES.decrypt(data, "testkey").toString(enc.Utf8));
    }
}

async function begin() {
    // console.log("b");
    const res = init({ parser: new EncryptionParser() });

    await res.wait("ready");

    const User = res.entry<UserData>("user");
    console.log("finding user")
    const user = (await User.findOne("userName", "joe"));
    console.log("found", user);
    if(user == null) {
        const newUser = new User();

        newUser.data.userName = "joe";
        newUser.save();
        return;
    }

    user.data.info ??= {} as any;

    user.data.info.age = 22;
    console.log("saving user")
    await user.save();
}

begin().then(() => {
    console.log("done")
})
