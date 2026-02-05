-- Create search history table
CREATE TABLE public.search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  result_type TEXT, -- 'store' or 'product'
  result_id UUID, -- optional: id of clicked result
  result_name TEXT, -- store or product name clicked
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own search history
CREATE POLICY "Users can view own search history"
ON public.search_history
FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own searches
CREATE POLICY "Users can insert own searches"
ON public.search_history
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can delete their own searches
CREATE POLICY "Users can delete own searches"
ON public.search_history
FOR DELETE
USING (user_id = auth.uid());

-- Index for faster queries
CREATE INDEX idx_search_history_user_created ON public.search_history(user_id, created_at DESC);