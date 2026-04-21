const SUPABASE_URL = 'https://irkgmqaavgkelahmxhfl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlya2dtcWFhdmdrZWxhaG14aGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MzE4NDEsImV4cCI6MjA5MjMwNzg0MX0.UjcCAIUn8g7B10l-yLGtuxoPt9noR_yrgmk2us3matA';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);