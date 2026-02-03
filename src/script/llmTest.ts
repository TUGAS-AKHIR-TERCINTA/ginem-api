import { SentimentService } from '../services/llm/SentimentAnalysis'

export const testSentimentController = async () => {
  const title =
    'Bitcoin ETF Bleed $277M in January as ETH, XRP, and SOL Quietly Absorb Fresh Capital'

  const description =
    'Key Insights: US-traded spot Bitcoin ETF products recorded net outflows of $277 million through January 28. Conversely, altcoin products added capital in the month-to-date window. Ethereum ETF vehicles added $66 million, while Solana and XRP ETFs each attracted $111 million'

  // const sentiment = await SentimentService.analyze(description)

  const sentiment = await SentimentService.analyze(
    `title: ${title}. description: ${description}`
  )

  console.log(sentiment)
}

testSentimentController()

// import { createAgent, tool } from 'langchain'
// import { ChatOpenAI } from '@langchain/openai'
// import * as z from 'zod'
// import { appConfigs } from '../configs'

// /**
//  * SENTIMENT TOOL
//  */
// const sentimentTool = tool(
//   async ({ text }) => {
//     return `
// You are a financial sentiment analysis engine.

// Analyze the sentiment of the following crypto-related text.

// Text:
// """
// ${text}
// """

// Return ONLY valid JSON with the following format:
// {
//   "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
//   "confidence": number,
//   "reason": string
// }
// `
//   },
//   {
//     name: 'sentiment_analysis',
//     description: 'Analyze sentiment of crypto-related news text',
//     schema: z.object({
//       text: z.string()
//     })
//   }
// )

// /**
//  * OPTIONAL TOOL (demo)
//  * Bisa kamu hapus di production
//  */
// const getWeather = tool(({ city }) => `It's always sunny in ${city}!`, {
//   name: 'get_weather',
//   description: 'Get the weather for a given city',
//   schema: z.object({
//     city: z.string()
//   })
// })

// /**
//  * TEST AGENT
//  */
// const aiAgentTest = async () => {
//   const model = new ChatOpenAI({
//     model: 'gpt-4o',
//     temperature: 0.1,
//     maxTokens: 1000,
//     // timeout: 30,
//     apiKey: appConfigs?.llm?.openAIApiKey
//   })

//   const agent = createAgent({
//     model,
//     tools: [sentimentTool]
//   })

//   const newsText = `
// Dogecoin has seen increased adoption after several payment platforms
// announced support for DOGE, boosting investor confidence.
// `

//   const result = await agent.invoke({
//     messages: [
//       {
//         role: 'user',
//         content: `Analyze the sentiment of this crypto news:\n\n${newsText}`
//       }
//     ]
//   })

//   console.log(result.messages.at(-1)?.content)
// }

// aiAgentTest()

// import { ChatDeepSeek } from '@langchain/deepseek'
// import { appConfigs } from '../configs'

// const llm = new ChatDeepSeek({
//   model: 'deepseek-reasoner',
//   temperature: 0,
//   apiKey: appConfigs?.llm?.deepSeekAPiKey
// })

// const aiMsg = async () => {
//   await llm.invoke([
//     [
//       'system',
//       'You are a helpful assistant that translates English to French. Translate the user sentence.'
//     ],
//     ['human', 'I love programming.']
//   ])
// }

// console.log(aiMsg())

// import { ChatOpenAI } from '@langchain/openai'
// import { appConfigs } from '../configs'

// const llm = new ChatOpenAI({
//   model: 'gpt-4o',
//   temperature: 0,
//   apiKey: appConfigs?.llm?.openAIApiKey
// })

// const aiMsg = async () => {
//   const result = await llm.invoke([
//     {
//       role: 'system',
//       content:
//         'You are a helpful assistant that translates English to French. Translate the user sentence.'
//     },
//     {
//       role: 'user',
//       content: 'I love programming.'
//     }
//   ])

//   console.log(result.content)
// }

// aiMsg()

// import { createAgent, tool } from 'langchain'
// import { ChatOpenAI } from '@langchain/openai'

// import * as z from 'zod'
// import { appConfigs } from '../configs'

// const sentimentTool = tool(
//   async ({ text }) => {
//     return `
// Analyze the sentiment of the following crypto-related text.

// Text:
// """
// ${text}
// """

// Return ONLY valid JSON with:
// {
//   "sentiment": "POSITIVE | NEUTRAL | NEGATIVE",
//   "confidence": number (0-1),
//   "reason": string
// }
// `
//   },
//   {
//     name: 'sentiment_analysis',
//     description: 'Analyze sentiment of crypto news text',
//     schema: z.object({
//       text: z.string()
//     })
//   }
// )

// const getWeather = tool((input) => `It's always sunny in ${input.city}!`, {
//   name: 'get_weather',
//   description: 'Get the weather for a given city',
//   schema: z.object({
//     city: z.string().describe('The city to get the weather for')
//   })
// })

// const aiAgentTest = async () => {
//   const model = new ChatOpenAI({
//     model: 'gpt-4o',
//     temperature: 0.1,
//     maxTokens: 1000,
//     // timeout: 30,
//     apiKey: appConfigs?.llm?.openAIApiKey
//   })

//   const agent = createAgent({
//     model,
//     tools: [getWeather, sentimentTool]
//   })

//   console.log(
//     await agent.invoke({
//       messages: [{ role: 'user', content: "What's the weather in Jakarta?" }]
//     })
//   )
// }

// aiAgentTest()
