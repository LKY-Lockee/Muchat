import { Message } from '&/character'
import OpenAI from 'openai'
import type { ResponseFormatJSONObject, ResponseFormatJSONSchema } from 'openai/resources/index.mjs'

export class OpenAIChat {
  apiURL: string
  apiKey: string
  model: string
  temperature: number
  openai: OpenAI
  json: ResponseFormatJSONSchema | ResponseFormatJSONObject

  constructor(
    apiURL: string,
    apiKey: string,
    model: string,
    temperature: number,
    json: ResponseFormatJSONSchema | ResponseFormatJSONObject,
  ) {
    this.apiURL = `${apiURL}/v1`
    this.apiKey = apiKey
    this.model = model
    this.temperature = temperature
    this.json = json

    this.openai = new OpenAI({
      baseURL: this.apiURL,
      apiKey: this.apiKey,
      dangerouslyAllowBrowser: true,
    })
  }

  async chat(messages: Array<Message>) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: messages.map((msg) => {
        return {
          role: msg.role,
          content: msg.content,
        }
      }),
      temperature: this.temperature,
      stream: false,
      response_format: this.json,
      enable_thinking: false,
    })

    return completion.choices[0].message.content
  }

  async *chatStream(messages: Array<Message>) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const stream = await this.openai.chat.completions.create({
      model: this.model,
      messages: messages.map((msg) => {
        return {
          role: msg.role,
          content: msg.content,
        }
      }),
      temperature: 1,
      stream: true,
      response_format: { type: 'json_object' },
      enable_thinking: false,
    })

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        yield chunk.choices[0].delta.content
      }
    }
  }
}
