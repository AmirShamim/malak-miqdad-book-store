export function track(path) {
  try {
    const data = JSON.stringify({ path })
    // Use sendBeacon for fire-and-forget (works even during page unload)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', new Blob([data], { type: 'application/json' }))
    } else {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
        keepalive: true,
      }).catch(() => {})
    }
  } catch (e) {
    // ignore errors silently
  }
}
