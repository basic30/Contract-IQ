import { createClient } from '@/lib/supabase'

export async function createRecord(
  userId: string | null,
  contractName: string,
  contractText: string,
  overallScore: number,
  riskSummary: Record<string, unknown>,
  clauses: Record<string, unknown>
) {
  if (!userId) return null;

  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('analysis_history')
    .insert([{
      user_id: userId,
      contract_name: contractName,
      contract_text: contractText,
      overall_score: overallScore,
      risk_summary: riskSummary,
      clauses: clauses
    }])
    .select()
    .single() 

  if (error) {
    console.error('Error saving history:', error)
    return null
  }
  
  return data
}

export async function getUserHistory(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('analysis_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching history:', error)
    return []
  }

  // Map database snake_case back to camelCase for the frontend
  return data.map(record => ({
    id: record.id,
    userId: record.user_id,
    contractName: record.contract_name,
    overallScore: record.overall_score,
    riskSummary: record.risk_summary,
    createdAt: record.created_at,
  }))
}

export async function deleteRecord(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('analysis_history')
    .delete()
    .eq('id', id)

  return !error
}

export async function clearOldRecords(userId: string, months: number = 3) {
  const supabase = createClient()
  
  const cutoffDate = new Date()
  cutoffDate.setMonth(cutoffDate.getMonth() - months)
  
  const { error } = await supabase
    .from('analysis_history')
    .delete()
    .eq('user_id', userId)
    .lt('created_at', cutoffDate.toISOString())

  return !error
}

export async function disableHistoryForUser(userId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('analysis_history')
    .delete()
    .eq('user_id', userId)

  return !error
}

export async function getRecordById(id: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('analysis_history')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching record by ID:', error)
    return null
  }

  return data
}