import os
from llama_cpp import Llama
import requests
from typing import Generator
import hashlib
import json

class ModelManager:
    def __init__(self):
        self.models = {}
        self.model_configs = {
            "fast-chat": {
                "repo": "Qwen/Qwen2.5-0.5B-Instruct-GGUF",
                "file": "qwen2.5-0.5b-instruct-q4_k_m.gguf",
                "url": "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf",
                "format": "chatml"
            },
            "tinyllama": {
                "repo": "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF",
                "file": "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
                "url": "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
                "format": "tinyllama"
            },
            "coder": {
                "repo": "Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF",
                "file": "qwen2.5-coder-1.5b-instruct-q4_k_m.gguf",
                "url": "https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF/resolve/main/qwen2.5-coder-1.5b-instruct-q4_k_m.gguf",
                "format": "chatml"
            },
            "deepseek-coder": {
                "repo": "TheBloke/deepseek-coder-6.7b-instruct-gguf",
                "file": "deepseek-coder-6.7b-instruct-q4_k_m.gguf",
                "url": "https://huggingface.co/TheBloke/deepseek-coder-6.7b-instruct-gguf/resolve/main/deepseek-coder-6.7b-instruct-q4_k_m.gguf",
                "format": "chatml",
                "size_gb": 2.3
            },
            "phi-3.5": {
                "repo": "microsoft/phi-3.5-mini-instruct-gguf",
                "file": "phi-3.5-mini-instruct-q4.gguf",
                "url": "https://huggingface.co/microsoft/phi-3.5-mini-instruct-gguf/resolve/main/phi-3.5-mini-instruct-q4.gguf",
                "format": "chatml"
            },
            "mistral": {
                "repo": "TheBloke/Mistral-7B-Instruct-v0.1-GGUF",
                "file": "mistral-7b-instruct-v0.1.Q4_K_M.gguf",
                "url": "https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF/resolve/main/mistral-7b-instruct-v0.1.Q4_K_M.gguf",
                "format": "chatml"
            },
            "neural-chat": {
                "repo": "TheBloke/neural-chat-7B-v3-2-GGUF",
                "file": "neural-chat-7b-v3-2.Q4_K_M.gguf",
                "url": "https://huggingface.co/TheBloke/neural-chat-7B-v3-2-GGUF/resolve/main/neural-chat-7b-v3-2.Q4_K_M.gguf",
                "format": "chatml"
            },
            "llama-2": {
                "repo": "TheBloke/Llama-2-7B-Chat-GGUF",
                "file": "llama-2-7b-chat.Q4_K_M.gguf",
                "url": "https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf",
                "format": "chatml"
            },
            "zephyr": {
                "repo": "TheBloke/zephyr-7B-GGUF",
                "file": "zephyr-7b.Q4_K_M.gguf",
                "url": "https://huggingface.co/TheBloke/zephyr-7B-GGUF/resolve/main/zephyr-7b.Q4_K_M.gguf",
                "format": "chatml"
            },
            "opencoder": {
                "repo": "TheBloke/opencoder-8b-instruct-gguf",
                "file": "opencoder-8b-instruct-q4_k_m.gguf",
                "url": "https://huggingface.co/TheBloke/opencoder-8b-instruct-gguf/resolve/main/opencoder-8b-instruct-q4_k_m.gguf",
                "format": "chatml",
                "size_gb": 2.3
            }
        }
        self.models_dir = os.path.join(os.getcwd(), "models")
        os.makedirs(self.models_dir, exist_ok=True)
        self.critical_models = ["fast-chat"]
        self.auto_download_critical()

    def auto_download_critical(self):
        """Download only critical lightweight models at startup"""
        print("Checking for pre-downloaded models...")
        for model_id in self.critical_models:
            try:
                path = self.download_model(model_id)
                print(f"✓ {model_id} ready")
            except Exception as e:
                print(f"✗ Failed to ensure {model_id}: {e}")

    def download_model(self, model_id: str):
        config = self.model_configs.get(model_id)
        if not config:
            raise ValueError(f"Model {model_id} not configured")
        
        target_path = os.path.join(self.models_dir, config["file"])
        
        # Check if model already exists and is valid
        if os.path.exists(target_path):
            file_size = os.path.getsize(target_path)
            # Check if file size is reasonable (at least 100MB for GGUF models)
            if file_size > 100000000:
                print(f"✓ {model_id} found in cache ({file_size / 1024 / 1024:.1f} MB)")
                return target_path
            else:
                print(f"⚠ Incomplete file detected, re-downloading...")
                os.remove(target_path)

        print(f"Downloading {model_id}...")
        try:
            response = requests.get(config["url"], stream=True, timeout=120)
            response.raise_for_status()
            total_size = int(response.headers.get('content-length', 0))
            downloaded = 0
            
            with open(target_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192*128):  # 1MB chunks
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)
                        if total_size:
                            progress = (downloaded / total_size) * 100
                            print(f"  {progress:.1f}% ({downloaded / 1024 / 1024:.1f} MB / {total_size / 1024 / 1024:.1f} MB)")
            
            print(f"✓ {model_id} downloaded successfully")
            return target_path
        except Exception as e:
            if os.path.exists(target_path):
                os.remove(target_path)
            raise e

    def load_model(self, model_id: str):
        if model_id in self.models:
            return self.models[model_id]
        
        path = self.download_model(model_id)
        self.models[model_id] = Llama(
            model_path=path,
            n_ctx=1024,
            n_threads=2,
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

        return prompt, ["</s>"]

    def generate_stream(self, model_id: str, prompt: str, context: list = None, **kwargs) -> Generator[str, None, None]:
        llm = self.load_model(model_id)
        
        system_text = (
            "You are a helpful AI assistant. "
            "For math, use LaTeX with $ $ for display and \\( \\) for inline."
        )
        
        full_prompt, stop_tokens = self.format_prompt(model_id, system_text, context or [], prompt)
        
        params = {
            "max_tokens": kwargs.get("max_tokens", 512),
            "stop": stop_tokens,
            "stream": True,
            "temperature": kwargs.get("temperature", 0.7),
            "top_p": kwargs.get("top_p", 0.95)
        }
        
        for output in llm(full_prompt, **params):
            token = output["choices"][0]["text"]
            yield token

    def cleanup(self):
        """Cleanup resources"""
        for model in self.models.values():
            if hasattr(model, 'close'):
                model.close()
        self.models.clear()
# Create global instance
model_manager = ModelManager()