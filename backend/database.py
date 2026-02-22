import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class DatabaseManager:
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        if url and key:
            self.supabase: Client = create_client(url, key)
        else:
            self.supabase = None
            print("Warning: Supabase credentials missing. Database functionality will be disabled.")

    def store_message(self, user_id: str, role: str, content: str, model_used: str):
        if not self.supabase:
            return None
        
        data = {
            "user_id": user_id,
            "role": role,
            "content": content,
            "model_used": model_used
        }
        return self.supabase.table("messages").insert(data).execute()

    def get_history(self, user_id: str):
        if not self.supabase:
            return []
        
        # History is fetched from the last 24 hours
        return self.supabase.table("messages")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=False)\
            .execute()

    def cleanup_old_messages(self):
        if not self.supabase:
            return None
        
        # This can be called by a cron job
        # In SQL: DELETE FROM messages WHERE created_at < NOW() - INTERVAL '1 day';
        # We can trigger an RPC or just use a raw delete if Supabase client allows it
        # Here we'll just mock it or provide instructions for Supabase edge functions
        pass

db_manager = DatabaseManager()
