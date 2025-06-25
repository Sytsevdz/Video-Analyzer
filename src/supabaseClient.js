
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nbsrkypcjkevncgzepqs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3JreXBjamtldm5jZ3plcHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDI1NDAsImV4cCI6MjA2NTkxODU0MH0.eIrHOXCzCfquju-LJibDjZZfVLt4hPQMNitY1kaO8jE'; 

export const supabase = createClient(supabaseUrl, supabaseKey);
