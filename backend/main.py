from fastapi import FastAPI, UploadFile, File, Body, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import json
import sys
from dotenv import load_dotenv
from typing import Optional, List
import logging

from model_manager import model_manager
from ocr_engine import ocr_engine
from database import db_manager
from image_generator import image_generator

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="AI Platform API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://frontend-one-gamma-14.vercel.app",
        "http://localhost:3000",  # For local development
        "http://localhost:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "name": "Alpha Core AI API",
        "version": "1.0.0",
        "status": "online",
        "endpoints": {
            "health": "/health",
            "chat": "/chat",
            "upload": "/upload-image",
            "cleanup": "/cleanup"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

class ChatRequest(BaseModel):
    message: str
    model: str = "tinyllama"
    user_id: str = "default_user"
    context: Optional[List[dict]] = None
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.95
    max_tokens: Optional[int] = 2048
    repeat_penalty: Optional[float] = 1.1

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        logger.info(f"Chat request: model={request.model}, user={request.user_id}")
        
        def stream_response():
            full_response = ""
            try:
                # Pass context and settings to model manager for memory
                params = {
                    "temperature": request.temperature,
                    "top_p": request.top_p,
                    "max_tokens": request.max_tokens,
                    "repeat_penalty": request.repeat_penalty
                }
                for token in model_manager.generate_stream(request.model, request.message, request.context, **params):
                    full_response += token
                    yield f"data: {json.dumps({'token': token})}\n\n"
                
                logger.info(f"Response generated: {len(full_response)} tokens")
                
                # Final output and DB storage
                db_manager.store_message(request.user_id, request.message, "user", request.model)
                db_manager.store_message(request.user_id, full_response, "assistant", request.model)
                
                yield "data: [DONE]\n\n"
            except Exception as e:
                logger.error(f"Stream error: {str(e)}", exc_info=True)
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingResponse(stream_response(), media_type="text/event-stream")
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        content = await file.read()
        extracted_text = ocr_engine.extract_text(content)
        return {"text": extracted_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cleanup")
async def cleanup_chats():
    try:
        db_manager.cleanup_old_messages()
        return {"message": "Cleanup successful"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ImageGenerationRequest(BaseModel):
    prompt: str
    width: Optional[int] = 512
    height: Optional[int] = 512
    steps: Optional[int] = 20

@app.post("/generate-image")
async def generate_image(request: ImageGenerationRequest):
    """Generate an image from text prompt"""
    try:
        logger.info(f"Image generation request: {request.prompt}")
        result = image_generator.generate(
            prompt=request.prompt,
            width=request.width,
            height=request.height,
            steps=request.steps
        )
        return result
    except Exception as e:
        logger.error(f"Image generation error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/image-status")
async def image_generation_status():
    """Get current image generation backend status"""
    try:
        return image_generator.get_status()
    except Exception as e:
        logger.error(f"Status check error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
