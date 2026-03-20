import 'server-only';

type AdminRpcClient = {
  rpc: (fn: 'is_admin') => {
    single: () => PromiseLike<{ data: boolean | null; error: { message?: string } | null }>;
  };
};

export async function getIsAdminUser(
  supabase: AdminRpcClient,
  userId?: string | null
): Promise<boolean> {
  if (!userId) return false;

  const { data, error } = await supabase.rpc('is_admin').single();

  if (error) {
    console.error('Failed to resolve admin status:', error.message ?? error);
    return false;
  }

  return data === true;
}
