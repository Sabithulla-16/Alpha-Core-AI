#!/usr/bin/env python3
"""
Test script to verify real-time tool data integration
Tests that tools are being called and data is being used in model responses
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

# Test queries that should trigger tool usage
TEST_QUERIES = [
    {
        "query": "What is the current Bitcoin price?",
        "expected_tool": "crypto_price",
        "model": "fast-chat"
    },
    {
        "query": "What's the weather in New York right now?",
        "expected_tool": "weather",
        "model": "fast-chat"
    },
    {
        "query": "Give me latest AI news headlines",
        "expected_tool": "news",
        "model": "fast-chat"
    },
    {
        "query": "What time is it in Tokyo?",
        "expected_tool": "time",
        "model": "fast-chat"
    }
]

def test_chat_with_tools():
    """Test chat endpoint with real-time tool integration"""
    print("🧪 Testing Real-Time Tool Integration\n")
    print("=" * 60)
    
    for i, test in enumerate(TEST_QUERIES, 1):
        print(f"\n📝 Test {i}: {test['query']}")
        print(f"   Expected Tool: {test['expected_tool']}")
        print(f"   Model: {test['model']}")
        print("-" * 60)
        
        try:
            # Send chat request
            response = requests.post(
                f"{BASE_URL}/chat",
                json={
                    "message": test['query'],
                    "model": test['model'],
                    "temperature": 0.7,
                    "max_tokens": 200
                },
                stream=True
            )
            
            if response.status_code != 200:
                print(f"❌ Request failed with status {response.status_code}")
                continue
            
            # Parse streaming response
            full_response = ""
            tools_used = []
            
            for line in response.iter_lines():
                if line:
                    try:
                        if line.startswith(b'data: '):
                            data = json.loads(line[6:])
                            
                            if 'token' in data:
                                full_response += data['token']
                            elif 'tools_used' in data:
                                tools_used = data['tools_used']
                    except:
                        pass
            
            # Display results
            print(f"\n✅ Response received:")
            print(f"   Tools Used: {tools_used if tools_used else 'None'}")
            print(f"\n   Response Preview (first 200 chars):")
            preview = full_response[:200].replace('\n', ' ')
            print(f"   {preview}...")
            
            # Check if expected tool was used
            if test['expected_tool'] in tools_used:
                print(f"\n✅ PASS: Expected tool '{test['expected_tool']}' was used!")
            else:
                print(f"\n⚠️  WARNING: Expected tool '{test['expected_tool']}' was not used")
                print(f"    Tools actually used: {tools_used}")
            
        except Exception as e:
            print(f"❌ Error during test: {e}")
        
        time.sleep(1)  # Brief delay between tests

def test_model_download_urls():
    """Test that all model URLs are accessible"""
    print("\n\n🔍 Testing Model Download URLs\n")
    print("=" * 60)
    
    import sys
    sys.path.insert(0, 'backend')
    from model_manager import ModelManager
    
    manager = ModelManager()
    
    for model_id, config in manager.model_configs.items():
        print(f"\n📦 Model: {model_id}")
        print(f"   URL: {config['url']}")
        
        try:
            # HEAD request to check URL accessibility (doesn't download)
            response = requests.head(config['url'], timeout=5, allow_redirects=True)
            
            if response.status_code == 200:
                print(f"   ✅ URL is accessible (Status: {response.status_code})")
            elif response.status_code in [301, 302, 303, 307, 308]:
                print(f"   ⚠️  Redirected (Status: {response.status_code})")
            else:
                print(f"   ⚠️  Status: {response.status_code}")
        except requests.exceptions.Timeout:
            print(f"   ⚠️  Request timeout")
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Error: {str(e)[:100]}")

if __name__ == "__main__":
    print("\n🚀 Real-Time Tool Integration Test Suite\n")
    
    # Test chat with tools
    test_chat_with_tools()
    
    # Test model URLs
    test_model_download_urls()
    
    print("\n\n✨ Test suite completed!")
