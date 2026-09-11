import { supabase } from '@server/lib/supabase'

/**
 * Append-only audit trail. A shared directory is only trusted if you can see
 * who touched a row, so every write records one.
 */
export async function recordChange(params: {
  tableName: string
  rowId: string
  field: string
  oldValue: string | null
  newValue: string | null
  actorEmail: string
}) {
  const { error } = await supabase().from('change_log').insert({
    table_name: params.tableName,
    row_id: params.rowId,
    field: params.field,
    old_value: params.oldValue,
    new_value: params.newValue,
    actor_email: params.actorEmail,
  })

  // Audit failures shouldn't take down the write the director just made.
  if (error) console.error('change_log insert failed', error.message)
}
