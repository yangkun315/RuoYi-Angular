/**
 * 参数处理 - 与 RuoYi 后端 GET 参数格式兼容
 */
export function tansParams(params: Record<string, unknown>): string {
  let result = '';
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    const part = encodeURIComponent(propName) + '=';
    if (value !== null && value !== '' && typeof value !== 'undefined') {
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        for (const key of Object.keys(value as Record<string, unknown>)) {
          const subVal = (value as Record<string, unknown>)[key];
          if (subVal !== null && subVal !== '' && typeof subVal !== 'undefined') {
            const paramKey = propName + '[' + key + ']';
            result += encodeURIComponent(paramKey) + '=' + encodeURIComponent(String(subVal)) + '&';
          }
        }
      } else {
        result += part + encodeURIComponent(String(value)) + '&';
      }
    }
  }
  return result;
}
