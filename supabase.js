
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ukqxbeghvarydtbsplpi.supabase.co';

const SUPABASE_KEY = 'sb_publishable_1Wz6rh2Lsu6MxX2LUL-ASQ_cHTlrM-d';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
