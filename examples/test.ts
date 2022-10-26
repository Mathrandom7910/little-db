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
    const { entry } = init();
    

    const User = entry<UserData>("user");

    const user = (await User.findOne("info.age", 25))!;
    console.log(user);
    if(user == null) return;

    user.data.info.age = 20;
    await user.save();
}

begin().then(() => {
    console.log("done")
})
