import { init } from "../src/index";

interface UserData {
    userName: string,
    info: {
        age: number,
        height: number
    }
}

async function begin() {
    // console.log("b");
    const { entry } = await init();

    const User = entry<UserData>("user");

    const users = await User.find("info.age", 25);
    console.log(users)
}

begin().then(() => {
    // console.log("done")
})
