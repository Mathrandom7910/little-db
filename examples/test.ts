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

    // const user = new User();
    // user.data.userName = "A Name";
    // user.data.info = {
    //     age: 25,
    //     height: 62
    // };

    // await user.save();

    // const uF = await User.findById(user.data.id);

    // console.log(uF);

    // const user = await User.findById("someid")!;

    // user?.data.
}

begin().then(() => {
    // console.log("done")
})
