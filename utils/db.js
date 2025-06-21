import mongoose from "mongoose";
const connection = () => {
    mongoose.connect(process.env.MONGO_URL)
    .then(
        console.log('mongo db coneected')
    )
}

export default connection
