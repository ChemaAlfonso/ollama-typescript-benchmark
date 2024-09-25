# Ollama Typescript Benchmark

## 👉 Description

This script is used to benchmark Ollama LLMs using [Langchain](https://js.langchain.com)
with Typescript. **It does not evaluate response quality**, only the model's performance.

## ❔ What does it do?

It sends a list of prompts to the model and records both total and individual test results, including:

-   Total and per test time taken.
-   Total and per test tokens processed.
-   Total and per test input tokens.
-   Total and per test output tokens.
-   Total and per test tokens per second.

The results are saved to a markdown (.md) file for analysis.

### ⛏️ Example output summary

| **Metric**                  | **Value**                 |
| --------------------------- | ------------------------- |
| **Model**                   | llama3.1:8b-instruct-q8_0 |
| **Total Tests**             | 20                        |
| **Total Time**              | 141.73s                   |
| **Total Prompt Tokens**     | 588                       |
| **Total Response Tokens**   | 10204                     |
| **Total Tokens**            | 10792                     |
| **Average Time**            | 7.09s                     |
| **Average Prompt Tokens**   | 29.4                      |
| **Average Response Tokens** | 510.2                     |
| **Average Tokens**          | 539.6                     |
| **Score**                   | 76.69 tokens/s            |

## 📚 Usage Instructions

1. Clone the repository:
    ```bash
    git clone
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the script
    ```bash
    npm start
    ```

## ⚒️ Configuration

> The script does not pull the models, just pull the model you want to test using ollama native pull methods and set its name on **model** var.

-   You can select the LLM model
-   You can select the ollama url
-   You can modify the prompts content and the number of prompts by editing the "tests" array.
-   The script can be configured to run multiple times by adjusting the run settings.
