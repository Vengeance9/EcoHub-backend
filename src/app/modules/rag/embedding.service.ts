export class EmbeddingService {
  private apiKey: string;
  private apiUrl: string = "https://openrouter.ai/api/v1";
  private embeddingModel:string

  constructor(apiKey?: string, embeddingModel?:string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || "sk-";
    this.embeddingModel = embeddingModel || process.env.OPENROUTER_EMBEDDING_MODEL || "text-embedding-ada-002";
  }
  async generateEmbedding(content:string){
    try{
        const response = await fetch(`${this.apiUrl}/embeddings`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body:JSON.stringify({
            input:content,
            model:this.embeddingModel
          })
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API Error: ${response.status}`);
        }

        const data = await response.json()

        if (!data.data || data.data.length == 0) {
          throw new Error("No embedding data returned");
        }
        return data.data[0].embedding

    }catch(err){
        console.log(err)
        throw err
    }
  }
}