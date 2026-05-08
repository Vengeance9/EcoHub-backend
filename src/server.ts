import app from "./app";

const bootstrap = async()=>{
    try{
        app.listen(process.env.PORT,()=>{
            console.log("server is running on port ",process.env.PORT)
        })
    }catch(error){
        console.log("failed to start server")
    }
}

bootstrap()