// app/api/admin/route.ts
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  // RLS-г тойрч бүх өгөгдлийг авна
  const { data } = await supabaseAdmin.from('posts').select('*')
  return Response.json(data)
}