import { ChatOllama } from '@langchain/ollama'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { writeFile } from 'fs/promises'

// ===================================
// Usage
// ===================================
// 1. npm install
// 2. npm start

// ===================================
// Benchmark info
// ===================================
// This script is used to benchmark the Ollama model with Langchain.
// The benchmark not evaluate the quality of the responses, only the model's performance.

// It sends a list of prompts to the model and records the totals and individual test results including:
// - Total and by test time taken
// - Total and by test tokens processed
// - Total and by test input tokens
// - Total and by test output tokens
// - Total and by test tokens per second

// The results are saved to a md file for analysis.
// You can configure the test prompt contents and quantity by changing the `tests` array.
// You can configure runs to run multiple times.

// ===================================
// Benchmarking core functions
// ===================================
const benchmarkOllamaWithLangchain = async (input: string, model: string, baseUrl: string) => {
	const llm = new ChatOllama({ baseUrl, model, streaming: false })
	const promp = ChatPromptTemplate.fromTemplate(input)

	const { response_metadata, usage_metadata, content } = await promp.pipe(llm).invoke({})

	const { total_duration } = response_metadata
	const { output_tokens, total_tokens, input_tokens } = usage_metadata!

	const totalDurationSeconds = +total_duration / 1e9 // 1e9 = 1,000,000,000
	const tokensPerSecond = +total_tokens / totalDurationSeconds
	const elapsedTime = totalDurationSeconds
	const inputTokens = +input_tokens
	const outputTokens = +output_tokens
	const totalTokens = +total_tokens

	return {
		query: input,
		model,
		tokensPerSecond,
		response: String(content),
		elapsedTime,
		inputTokens,
		outputTokens,
		totalTokens
	}
}

const runBenchmark = async (tests: string[], model: string, baseUrl: string) => {
	const benchmarkDateTime = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-')

	const results: {
		query: string
		response: string
		model: string
		elapsedTime: number
		tokensPerSecond: number
		inputTokens: number
		outputTokens: number
		totalTokens: number
	}[] = []

	// Heating up
	console.log('🔥 Heating up...')
	await benchmarkOllamaWithLangchain('Hello', model, baseUrl)

	// Run benchmark
	console.log('⛏️ Heating done, starting benchmark...')
	for (const [i, test] of tests.entries()) {
		console.log(`🏃‍ Running test ${i + 1}/${tests.length}`)
		const result = await benchmarkOllamaWithLangchain(test, model, baseUrl)
		results.push(result)
		console.log(`✅ Test ${i + 1}/${tests.length} completed`)
	}

	console.log('🏁 Benchmark completed')

	console.log('📝 Saving results to file...')

	// ====================
	// Summary results
	// ====================

	// calculate total average for values
	const totalTime = results.reduce((acc, { elapsedTime }) => acc + elapsedTime, 0)
	const totalInputTokens = results.reduce((acc, { inputTokens }) => acc + inputTokens, 0)
	const totalOutputTokens = results.reduce((acc, { outputTokens }) => acc + outputTokens, 0)
	const totalTokens = results.reduce((acc, { totalTokens }) => acc + totalTokens, 0)
	const averageTime = totalTime / results.length
	const averageInputTokens = totalInputTokens / results.length
	const averageOutputTokens = totalOutputTokens / results.length
	const averageTotalTokens = totalTokens / results.length
	const averageTokensPerSecond =
		results.reduce((acc, { tokensPerSecond }) => acc + tokensPerSecond, 0) / results.length

	const summaryTemplate = ` # Ollama Benchmark
	
## Summary
| **Metric**             | **Value**                         |
|------------------------|-----------------------------------|
| **Model**                     | ${results[0].model}                       |
| **Total Tests**              | ${results.length}                         |
| **Total Time**               | ${totalTime.toFixed(2)}s                 |
| **Total Prompt Tokens**      | ${totalInputTokens}                       |
| **Total Response Tokens**    | ${totalOutputTokens}                      |
| **Total Tokens**             | ${totalTokens}                            |
| **Average Time**             | ${averageTime.toFixed(2)}s                |
| **Average Prompt Tokens**    | ${averageInputTokens}                     |
| **Average Response Tokens**  | ${averageOutputTokens}                    |
| **Average Tokens**           | ${averageTotalTokens}                     |
| **Score**                    | ${averageTokensPerSecond.toFixed(2)} tokens/s |

| **Test Prompts**            |
|------------------------------|
${tests.map((test, i) => `| ${i + 1}. ${test} |`).join('\n')}
`

	await writeFile(`./results/benchmark-${benchmarkDateTime}.md`, summaryTemplate, { flag: 'a' })

	// ====================
	// By query results
	// ====================
	for (const [i, result] of results.entries()) {
		const { query, response, elapsedTime, tokensPerSecond, inputTokens, outputTokens, totalTokens } = result

		const template = `## Test ${i + 1}

| **Metric**             | **Value**                         |
|------------------------|-----------------------------------|
| **Time**               | ${elapsedTime.toFixed(2)}s        |
| **Prompt Tokens**       | ${inputTokens}                    |
| **Response Tokens**     | ${outputTokens}                   |
| **Tokens Total**        | ${totalTokens}                    |
| **Score**               | ${tokensPerSecond.toFixed(2)} tokens/s |

### **Prompt**
${query}

### **Response**
${response}
`
		await writeFile(`./results/benchmark-${benchmarkDateTime}.md`, template, { flag: 'a' })
	}

	console.log(`📄 Results saved to File: ./results/benchmark-${benchmarkDateTime}.md`)
	console.log('🎉 Benchmark completed successfully')
}

// ===================================
// Configuration (customize as needed)
// ===================================
const tests = [
	'Explain the principle of **conservation of energy** and provide examples of its application in everyday life.',
	'What were the causes and consequences of the **French Revolution**?',
	'Solve the following quadratic equation: (2x^2 - 4x - 6 = 0). Show all steps.',
	"Analyze the main theme and symbolism in the poem 'The Song of the Pirate' by **José de Espronceda**.",
	'Describe how **blockchain** works and mention some of its applications in the modern world.',
	'Explain the benefits and risks of **intermittent fasting**. Is it suitable for everyone?',
	'Compare and contrast **utilitarianism** and **deontology** in ethical decision-making.',
	'Describe the traditions and customs of a specific cultural celebration, such as **Day of the Dead** in Mexico.',
	'What is **attachment theory** and how does it influence the emotional development of children?',
	'List and describe the main **biomes of the world**, including their characteristics and examples.',
	"Explain the difference between **inflation** and **deflation**, and their effects on a country's economy.",
	'Analyze the impact of **Impressionism** on contemporary art. Name some of its key figures.',
	'Describe **quantum theory** and how it has changed our understanding of the universe.',
	'Explain the basic principles of **criminal law** and its implications in society.',
	'What is the function of **DNA** in living organisms? Describe its structure and role in inheritance.',
	'What are **black holes** and how do they form? Explain their significance in the universe.',
	'Analyze the concept of **social mobility** and its different types. What factors influence it?',
	'Describe the differences between a **language** and a **dialect**. Provide examples.',
	'What are the advantages and disadvantages of **online learning** compared to traditional education?',
	'Explain the phenomenon of **global warming** and its possible consequences for the planet.'
]
const model = 'gemma2:2b'
const baseUrl = 'http://localhost:11434'
const testRuns = 1

// ===================================
// Run
// ===================================
console.clear()
for (let i = 0; i < testRuns; i++) {
	console.log(`Starting benchmark run ${i + 1}/${testRuns}`)
	runBenchmark(tests, model, baseUrl)
}
