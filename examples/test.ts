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
    const res = init();

    await res.wait("ready");

    const User = res.entry<UserData>("user");
    console.log("finding user")
    const user = (await User.findOne("userName", "joe"));
    console.log(user?.data.id);
    if(user == null) {
        const newUser = new User();

        newUser.data.userName = "joe";
        newUser.save();
        return;
    }

    user.data.info.age = 22;
    console.log("saving user")
    await user.save();
}

begin().then(() => {
    console.log("done")
})
