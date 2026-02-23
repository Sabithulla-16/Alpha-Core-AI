import os
from llama_cpp import Llama
import requests
from typing import Generator

class ModelManager:
    def __init__(self):
        self.models = {}
        # Templates for different model architectures
        self.model_configs = {
            "tinyllama": {
                "repo": "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF",
                "file": "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
                "url": "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
                "format": "tinyllama"
            },
            "phi": {
                "repo": "TheBloke/phi-2-GGUF",
                "file": "phi-2.Q4_K_M.gguf",
                "url": "https://huggingface.co/TheBloke/phi-2-GGUF/resolve/main/phi-2.Q4_K_M.gguf",
                "format": "phi"
            },
            "coder": {
                "repo": "Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF",
                "file": "qwen2.5-coder-1.5b-instruct-q4_k_m.gguf",
                "url": "https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF/resolve/main/qwen2.5-coder-1.5b-instruct-q4_k_m.gguf",
                "format": "chatml"
            },
            "orca": {
                "repo": "bartowski/Llama-3.2-3B-Instruct-GGUF",
                "file": "Llama-3.2-3B-Instruct-Q4_K_M.gguf",
                "url": "https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf",
                "format": "llama3"
            },
            "fast-chat": {
                "repo": "Qwen/Qwen2.5-0.5B-Instruct-GGUF",
                "file": "qwen2.5-0.5b-instruct-q4_k_m.gguf",
                "url": "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf",
                "format": "chatml"
            },
            "mistral": {
                "repo": "TheBloke/Mistral-7B-Instruct-v0.2-GGUF",
                "file": "mistral-7b-instruct-v0.2.Q4_K_M.gguf",
                "url": "https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf",
                "format": "chatml"
            },
            "neural": {
                "repo": "TheBloke/neural-chat-7B-v3-1-GGUF",
                "file": "neural-chat-7b-v3-1.Q4_K_M.gguf",
                "url": "https://huggingface.co/TheBloke/neural-chat-7B-v3-1-GGUF/resolve/main/neural-chat-7b-v3-1.Q4_K_M.gguf",
                "format": "chatml"
            },
            "zephyr": {
                "repo": "TheBloke/zephyr-7B-beta-GGUF",
                "file": "zephyr-7b-beta.Q4_K_M.gguf",
                "url": "https://huggingface.co/TheBloke/zephyr-7B-beta-GGUF/resolve/main/zephyr-7b-beta.Q4_K_M.gguf",
                "format": "chatml"
            },
            "openhermes": {
                "repo": "TheBloke/OpenHermes-2.5-Mistral-7B-GGUF",
                "file": "openhermes-2.5-mistral-7b.Q4_K_M.gguf",
                "url": "https://huggingface.co/TheBloke/OpenHermes-2.5-Mistral-7B-GGUF/resolve/main/openhermes-2.5-mistral-7b.Q4_K_M.gguf",
                "format": "chatml"
            },
            "starling": {
                "repo": "TheBloke/Starling-LM-7B-alpha-GGUF",
                "file": "starling-lm-7b-alpha.Q4_K_M.gguf",
                "url": "https://huggingface.co/TheBloke/Starling-LM-7B-alpha-GGUF/resolve/main/starling-lm-7b-alpha.Q4_K_M.gguf",
                "format": "chatml"
            },
            "dolphin": {
                "repo": "TheBloke/dolphin-2.5-mixtral-8x7b-GGUF",
                "file": "dolphin-2.5-mixtral-8x7b.Q4_K_M.gguf",
                "url": "https://huggingface.co/TheBloke/dolphin-2.5-mixtral-8x7b-GGUF/resolve/main/dolphin-2.5-mixtral-8x7b.Q4_K_M.gguf",
                "format": "chatml"
            }
        }
        self.models_dir = os.path.join(os.getcwd(), "models")
        os.makedirs(self.models_dir, exist_ok=True)
        # Proactively download all models
        self.auto_download_all()

    def auto_download_all(self):
        print("Starting proactive model download (Auto-Download Phase)...")
        for model_id in self.model_configs:
            try:
                self.download_model(model_id)
            except Exception as e:
                print(f"Failed to auto-download {model_id}: {e}")

    def download_model(self, model_id: str):
        config = self.model_configs.get(model_id)
        if not config:
            raise ValueError(f"Model {model_id} not configured")
        
        target_path = os.path.join(self.models_dir, config["file"])
        # Check if file exists AND has some size
        if os.path.exists(target_path) and os.path.getsize(target_path) > 50000000: # Min 50MB
            return target_path

        print(f"Downloading {model_id} from {config['url']}...")
        try:
            # Using a more standard stream download with content-length check if possible
            response = requests.get(config["url"], stream=True, timeout=60)
            response.raise_for_status()
            with open(target_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=1024*1024): # 1MB chunks
                    if chunk:
                        f.write(chunk)
            print(f"Successfully downloaded {model_id}")
            return target_path
        except Exception as e:
            if os.path.exists(target_path):
                os.remove(target_path) 
            print(f"Download failed for {model_id}: {e}")
            raise e

    def load_model(self, model_id: str):
        if model_id in self.models:
            return self.models[model_id]
        
        path = self.download_model(model_id)
        self.models[model_id] = Llama(
            model_path=path,
            n_ctx=2048, # Standard context
            n_threads=4,
            verbose=False
        )
        return self.models[model_id]

    def format_prompt(self, model_id: str, system: str, history: list, prompt: str):
        fmt = self.model_configs[model_id]["format"]
        
        if fmt == "chatml":
            full = f"<|im_start|>system\n{system}<|im_end|>\n"
            for msg in history:
                role = "user" if msg["role"] == "user" else "assistant"
                full += f"<|im_start|>{role}\n{msg['content']}<|im_end|>\n"
            full += f"<|im_start|>user\n{prompt}<|im_end|>\n<|im_start|>assistant\n"
            return full, ["<|im_end|>", "###", "<|im_start|>", "</s>"]

        elif fmt == "tinyllama":
            full = f"<|system|>\n{system}</s>\n"
            for msg in history:
                role = "user" if msg["role"] == "user" else "assistant"
                full += f"<|{role}|>\n{msg['content']}</s>\n"
            full += f"<|user|>\n{prompt}</s>\n<|assistant|>\n"
            return full, ["</s>", "<|user|>", "<|assistant|>"]

        elif fmt == "llama3":
            # Llama 3.2 template
            full = f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system}<|eot_id|>"
            for msg in history:
                role = "user" if msg["role"] == "user" else "assistant"
                full += f"<|start_header_id|>{role}<|end_header_id|>\n\n{msg['content']}<|eot_id|>"
            full += f"<|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"
            return full, ["<|eot_id|>", "<|start_header_id|>", "</s>"]

        elif fmt == "phi":
            # Phi-2 optimized prompt
            full = f"Instruct: {system}\n{prompt}\nOutput:"
            return full, ["Instruct:", "Output:", "<|endoftext|>", "</s>"]

        return prompt, ["</s>"]

        return prompt, ["</s>"]

    def generate_stream(self, model_id: str, prompt: str, context: list = None, **kwargs) -> Generator[str, None, None]:
        llm = self.load_model(model_id)
        
        system_text = (
            "You are a highly accurate AI assistant. "
            "For math, ALWAYS use LaTeX wrapping display equations in [ ] and inline in ( )."
        )
        
        full_prompt, stop_tokens = self.format_prompt(model_id, system_text, context or [], prompt)
        
        # Use provided kwargs or defaults
        params = {
            "max_tokens": kwargs.get("max_tokens", 2048),
            "stop": stop_tokens,
            "stream": True,
            "temperature": kwargs.get("temperature", 0.7),
            "top_p": kwargs.get("top_p", 0.95),
            "repeat_penalty": kwargs.get("repeat_penalty", 1.1)
        }
        
        for output in llm(full_prompt, **params):
            token = output["choices"][0]["text"]
            yield token

model_manager = ModelManager()
