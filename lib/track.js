export async function track(path) {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path })
    })
  } catch (e) {
    // ignore errors silently
    console.error('Track failed', e)
  }
}
