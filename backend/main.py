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
from tools import tool_executor

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
    use_tools: Optional[bool] = True
    tools: Optional[List[str]] = None

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        logger.info(f"Chat request: model={request.model}, user={request.user_id}, use_tools={request.use_tools}")
        
        def stream_response():
            full_response = ""
            tools_used = []
            
            try:
                # Detect if tools should be used based on message content
                tool_keywords = {
                    "web_search": ["search", "look up", "find", "google", "what is", "who is", "latest"],
                    "weather": ["weather", "temperature", "forecast", "rain", "sunny", "climate"],
                    "news": ["news", "headlines", "today", "current events"],
                    "stock_price": ["stock", "price", "$", "market", "trading"],
                    "crypto_price": ["bitcoin", "ethereum", "crypto", "digital", "btc", "eth"],
                    "time": ["time", "what time", "current time", "timezone"],
                    "calculator": ["calculate", "math", "solve", "equation", "plus", "minus", "multiply"],
                    "currency_convert": ["convert", "exchange", "currency", "dollar", "euro"],
                    "wikipedia": ["wiki", "wikipedia", "learn about", "tell me about"]
                }
                
                message_lower = request.message.lower()
                available_tools = []
                
                if request.use_tools:
                    for tool, keywords in tool_keywords.items():
                        if any(keyword in message_lower for keyword in keywords):
                            if request.tools is None or tool in request.tools:
                                available_tools.append(tool)
                    
                    # Execute detected tools
                    tool_results = {}
                    for tool in available_tools[:3]:  # Limit to 3 tools per query
                        try:
                            logger.info(f"Executing tool: {tool}")
                            
                            # Parse tool parameters from message
                            if tool == "web_search":
                                result = tool_executor.execute_tool(tool, query=request.message)
                            elif tool == "weather":
                                # Extract city name (simple approach)
                                parts = request.message.split("in ")
                                city = parts[-1].split("?")[0].strip() if len(parts) > 1 else "London"
                                result = tool_executor.execute_tool(tool, city=city)
                            elif tool == "crypto_price":
                                # Extract crypto name
                                for crypto in ["bitcoin", "ethereum", "cardano", "solana", "btc", "eth", "ada", "sol"]:
                                    if crypto in message_lower:
                                        result = tool_executor.execute_tool(tool, crypto=crypto)
                                        break
                                else:
                                    result = tool_executor.execute_tool(tool, crypto="bitcoin")
                            elif tool == "time":
                                result = tool_executor.execute_tool(tool)
                            elif tool == "calculator":
                                # Extract expression (simple)
                                result = tool_executor.execute_tool(tool, expression=request.message)
                            else:
                                result = tool_executor.execute_tool(tool)
                            
                            if result.get("status") == "success":
                                tool_results[tool] = result
                                tools_used.append(tool)
                                logger.info(f"Tool {tool} executed successfully")
                        except Exception as e:
                            logger.error(f"Tool {tool} execution failed: {str(e)}")
                    
                    # Add tool results to context
                    if tool_results:
                        tool_context = "\n🔧 REAL-TIME DATA RETRIEVED:\n"
                        for tool, result in tool_results.items():
                            if result.get("status") == "success":
                                # Format result for model
                                if tool == "weather" and "temperature" in result:
                                    tool_context += f"\n📍 {result.get('location', '')}: {result.get('temperature')}°{result.get('units', 'C').upper()[0]}, {result.get('weather', '')} (Humidity: {result.get('humidity', 'N/A')}%)"
                                elif tool == "crypto_price" and "price" in result:
                                    tool_context += f"\n💰 {result.get('cryptocurrency', '')}: ${result.get('price', 'N/A')} (Change 24h: {result.get('change_24h', 'N/A')}%)"
                                elif tool == "currency_convert" and "converted_amount" in result:
                                    tool_context += f"\n💱 {result.get('amount')} {result.get('from_currency')} = {result.get('converted_amount')} {result.get('to_currency')}"
                                elif tool == "web_search" and "results" in result:
                                    tool_context += f"\n🔍 Search Results for '{result.get('query', '')}':\n"
                                    for i, r in enumerate(result.get("results", [])[:3], 1):
                                        tool_context += f"   {i}. {r.get('title', '')}: {r.get('snippet', '')[:100]}...\n"
                                elif tool == "time":
                                    tool_context += f"\n⏰ {result.get('timezone', '')}: {result.get('time')} ({result.get('date')})"
                                elif tool == "calculator" and "result" in result:
                                    tool_context += f"\n🧮 {result.get('expression')} = {result.get('result')}"
                                else:
                                    tool_context += f"\n📊 {tool.replace('_', ' ').upper()}: {json.dumps(result, indent=2)[:200]}..."
                        
                        # Enhanced message with tool data
                        enhanced_message = f"{request.message}{tool_context}\n\nPlease provide an answer based on this real-time information."
                        request.context = request.context or []
                        request.context.append({
                            "role": "system",
                            "content": f"You have access to real-time data. Use this information to provide accurate, current answers.{tool_context}"
                        })
                        
                        # Use enhanced message instead of original
                        actual_message = enhanced_message
                    else:
                        actual_message = request.message
                    
                    # Yield tool information to client
                    if tools_used:
                        yield f"data: {json.dumps({'tools_used': tools_used})}\n\n"
                
                # Generate response with model
                params = {
                    "temperature": request.temperature,
                    "top_p": request.top_p,
                    "max_tokens": request.max_tokens,
                    "repeat_penalty": request.repeat_penalty
                }
                
                for token in model_manager.generate_stream(request.model, actual_message, request.context, **params):
                    full_response += token
                    yield f"data: {json.dumps({'token': token})}\n\n"
                
                logger.info(f"Response generated: {len(full_response)} tokens, tools used: {tools_used}")
                
                # Store in database
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

@app.get("/tools")
async def list_tools():
    """Get list of available tools"""
    try:
        return {
            "tools": tool_executor.get_available_tools(),
            "total": len(tool_executor.get_available_tools())
        }
    except Exception as e:
        logger.error(f"Tools list error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

class ToolRequest(BaseModel):
    tool: str
    params: dict = {}

@app.post("/execute-tool")
async def execute_tool(request: ToolRequest):
    """Execute a specific tool"""
    try:
        logger.info(f"Executing tool: {request.tool} with params: {request.params}")
        result = tool_executor.execute_tool(request.tool, **request.params)
        return result
    except Exception as e:
        logger.error(f"Tool execution error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
