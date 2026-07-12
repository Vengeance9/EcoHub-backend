import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { EmbeddingService } from "./embedding.service"
import { IndexService } from "./indexing.service"
import { LLMService } from "./llm.service";

export class RagService {
  private indexService: IndexService;
  private embeddingService: EmbeddingService;
  private llmService: LLMService;

  constructor() {
    this.indexService = new IndexService();
    this.embeddingService = new EmbeddingService();
    this.llmService = new LLMService();
  }

  async ingestIdeas() {
    return this.indexService.indexIdeas();
  }

  async retrieveRelevantDocs(
    query: string,
    limit: number = 5,
    sourceType?: string
  ) {
   try{ const queryEmbedding = await this.embeddingService.generateEmbedding(query)
    const vectorLiteral = `[${queryEmbedding.join(",")}]`

    const result = await prisma.$queryRaw(Prisma.sql`
        SELECT "id","chunkKey","sourceId","sourceType","sourceLabel","content","updatedAt","metadata",1-(embedding<=>CAST(${vectorLiteral} AS vector)) as similarity
        FROM "document_embeddings"
        WHERE "isDeleted"=false
        ${sourceType? Prisma.sql`AND "sourceType"= ${sourceType}`:Prisma.empty}
        ORDER BY embedding <=> CAST(${vectorLiteral} AS vector)
        LIMIT ${limit}
        `);

    return result
  }
    catch(err:any){
        console.log(err)
        throw err
    }
  }

  async getAnswers(
    query:string,
    limit:number=3,
    sourceType?:string,
    asJson:boolean=false
  ){
   try{ 
    const relevantDocs = await this.retrieveRelevantDocs(query,limit,sourceType)
    const context = (relevantDocs as any).filter((doc:any)=>doc.content).map((doc:any)=>doc.content)
    let answers = await this.llmService.generateResponse(query,context,asJson)
    let parsedAnswer = answers

    if(asJson){
      try {
        if (answers.startsWith("```json")) {
          answers = answers
            .replace(/```json\n?/, "")
            .replace(/```$/, "")
            .trim();
        } else if (answers.startsWith("```")) {
          answers = answers
            .replace(/```\n?/, "")
            .replace(/```$/, "")
            .trim();
        }
        parsedAnswer = JSON.parse(answers);
      } catch (e) {
        console.error("Failed to parse LLM JSON response:", e);
        throw e;
      }
    }

    return {
      answers: parsedAnswer,
      sources: (relevantDocs as any).map((idea: any) => ({
        id: idea.id,
        chunkKey: idea.chunkKey,
        sourceType: idea.sourceType,
        sourceId: idea.sourceId,
        sourceLabel: idea.sourceLabel,
        content: idea.content,
        similarity: idea.similarity,
      })),
      contextUsed:context.length > 0
    };}catch(err){
      console.log(err)
      throw err
    }
  }
}