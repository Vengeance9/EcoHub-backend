import app from "./app";
import { redisService } from "./app/lib/redis";

const bootstrap = async()=>{
    try{
        await redisService.connect()
        app.listen(process.env.PORT,()=>{
            console.log("server is running on port ",process.env.PORT)
        })
    }catch(error){
        console.log("failed to start server")
    }
}

bootstrap()