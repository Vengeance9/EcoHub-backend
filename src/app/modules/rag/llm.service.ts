export class LLMService {
  private apiKey: string;
  private apiUrl: string = "https://openrouter.ai/api/v1";
  private model:string

  constructor(){
    this.apiKey = process.env.OPENROUTER_API_KEY as string
    this.model=process.env.OPENROUTER_LLM_MODEL as string
  }

  async generateResponse(
    prompt:string,
    context:string[]=[],
    asJson:boolean=false
  ){
    try{
        console.log("THIS IS THE PROMPT",prompt)
      let fullPrompt =
      context.length > 0
        ? `Context information:\n${context.join(
            "\n\n"
          )}\n\nQuestion: ${prompt}\n\nAnswer based on the context above.`
        : prompt;
    
    if(asJson){
        fullPrompt += `\n\nReturn ONLY a valid JSON object matching this structure: {"ideas": [{"name": "Idea Name", "reason": "Why these ideas are suitable", "problems": "The problems they address", "solution":"How they solve the problem"}]}. Do not include any markdown formatting like \`\`\`json.`;
    }

    const systemMessage = asJson
      ? "You are a helpful assistant for an Idea management system. Answer questions based on the provided context. You MUST respond with ONLY valid JSON format. Do not include markdown tags."
      : "You are a helpful assistant for a Idea management system. Answer questions based on the provided context. If the context does not contain the answer, say you don't have enough information.";
    
    const payload:any = {
        model:this.model,
        messages:[
            {
                role:"system",
                content:systemMessage
            },
            {
                role:"user",
                content:fullPrompt
            }
        ],
        temperature:0.1,
        max_tokens:4500  
    }

    if(asJson && (this.model.includes("gpt") || this.model.includes("openai"))){
        payload.response_format = {type:"json_object"}
    }

    const response = await fetch(`${this.apiUrl}/chat/completions`,{
        method:"POST",
        headers:{
            "Authorization":`Bearer ${this.apiKey}`,
            "Content-Type":"application/json"
        },
        body:JSON.stringify(payload)
    })
    if(!response.ok){
         const errorData = await response.json();
         throw new Error(
           `OpenRouter API error: ${response.status} - ${errorData.error?.message} || "unknown error"`
         );
    }
    const data = await response.json()
    return data.choices[0].message.content
    }catch(err){
        console.log(err)
        throw err
    }
  }
}