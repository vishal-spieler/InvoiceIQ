import { supabase } from './src/utils/supabaseClient.js';
(async () => {
  const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(5);
  console.log('Error:', error);
  console.log('Data count:', data?.length);
  console.log('Latest:', data);
})();
