import os
import requests
from typing import Optional
import json

class ImageGenerator:
    def __init__(self):
        """
        Image Generation Module
        Supports multiple backends:
        - Local Stable Diffusion via Ollama (recommended)
        - Hugging Face API
        - OpenAI DALL-E (requires API key)
        """
        self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.hf_api_key = os.getenv("HF_API_KEY", "")
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "")
        self.backend = self._detect_backend()
        
    def _detect_backend(self) -> str:
        """Detect which image generation backend is available"""
        # Check Ollama first (local)
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=2)
            if response.status_code == 200:
                print("✓ Image generation: Ollama detected")
                return "ollama"
        except:
            pass
        
        # Check Hugging Face
        if self.hf_api_key:
            print("✓ Image generation: Hugging Face API ready")
            return "huggingface"
        
        # Check OpenAI
        if self.openai_api_key:
            print("✓ Image generation: OpenAI DALL-E ready")
            return "openai"
        
        print("⚠ No image generation backend available")
        print("  Install options:")
        print("  1. Ollama (local): ollama pull stable-diffusion")
        print("  2. Hugging Face: Set HF_API_KEY environment variable")
        print("  3. OpenAI: Set OPENAI_API_KEY environment variable")
        return None

    def generate(self, prompt: str, width: int = 512, height: int = 512, steps: int = 20) -> Optional[str]:
        """Generate image from text prompt"""
        if not self.backend:
            return {"error": "No image generation backend configured"}
        
        try:
            if self.backend == "ollama":
                return self._generate_ollama(prompt, width, height, steps)
            elif self.backend == "huggingface":
                return self._generate_huggingface(prompt)
            elif self.backend == "openai":
                return self._generate_openai(prompt)
        except Exception as e:
            return {"error": str(e)}

    def _generate_ollama(self, prompt: str, width: int, height: int, steps: int) -> dict:
        """Generate image using Ollama + Stable Diffusion"""
        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": "stable-diffusion",
                    "prompt": prompt,
                    "stream": False
                },
                timeout=300  # 5 minute timeout for image generation
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "status": "success",
                    "image": data.get("images", [""])[0],
                    "prompt": prompt,
                    "generator": "Ollama + Stable Diffusion"
                }
            else:
                return {"error": f"Ollama error: {response.text}"}
        except requests.exceptions.ConnectionError:
            return {"error": "Ollama not running. Start Ollama first: ollama serve"}

    def _generate_huggingface(self, prompt: str) -> dict:
        """Generate image using Hugging Face API"""
        try:
            headers = {"Authorization": f"Bearer {self.hf_api_key}"}
            api_url = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2"
            
            response = requests.post(api_url, headers=headers, json={"inputs": prompt})
            
            if response.status_code == 200:
                return {
                    "status": "success",
                    "image": response.content,  # Binary image data
                    "prompt": prompt,
                    "generator": "Hugging Face Stable Diffusion 2"
                }
            else:
                return {"error": f"HF error: {response.text}"}
        except Exception as e:
            return {"error": str(e)}

    def _generate_openai(self, prompt: str) -> dict:
        """Generate image using OpenAI DALL-E"""
        try:
            import openai
            openai.api_key = self.openai_api_key
            
            response = openai.Image.create(
                prompt=prompt,
                n=1,
                size="512x512"
            )
            
            return {
                "status": "success",
                "image_url": response['data'][0]['url'],
                "prompt": prompt,
                "generator": "OpenAI DALL-E 3"
            }
        except Exception as e:
            return {"error": str(e)}

    def get_status(self) -> dict:
        """Get current image generation status"""
        return {
            "backend": self.backend or "none",
            "available_backends": self._get_available_backends(),
            "status": "ready" if self.backend else "not_configured"
        }

    def _get_available_backends(self) -> list:
        """List all available image generation backends"""
        available = []
        
        try:
            requests.get(f"{self.ollama_url}/api/tags", timeout=2)
            available.append("ollama")
        except:
            pass
        
        if self.hf_api_key:
            available.append("huggingface")
        
        if self.openai_api_key:
            available.append("openai")
        
        return available

# Create global instance
image_generator = ImageGenerator()
