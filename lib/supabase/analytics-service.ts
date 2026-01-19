import { createClient as createServerClient } from "./server"

export async function saveAnalyticsDataset(
  userId: string,
  name: string,
  source: string,
  data: Record<string, unknown>[],
) {
  const supabase = await createServerClient()

  const { data: dataset, error } = await supabase
    .from("analytics_datasets")
    .insert({
      user_id: userId,
      name,
      source,
      data,
    })
    .select()
    .single()

  if (error) throw error
  return dataset
}

export async function getAnalyticsDatasets(userId: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("analytics_datasets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getAnalyticsDataset(datasetId: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("analytics_datasets").select("*").eq("id", datasetId).single()

  if (error) throw error
  return data
}

export async function deleteAnalyticsDataset(datasetId: string) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("analytics_datasets").delete().eq("id", datasetId)

  if (error) throw error
}
