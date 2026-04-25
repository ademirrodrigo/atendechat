export function logInfo(scope, data) {
  console.log(JSON.stringify({ level: "info", scope, timestamp: new Date().toISOString(), ...data }));
}

export function logError(scope, error, data = {}) {
  console.error(
    JSON.stringify({
      level: "error",
      scope,
      timestamp: new Date().toISOString(),
      error: error?.message || String(error),
      ...data
    })
  );
}
