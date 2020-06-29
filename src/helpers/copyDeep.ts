export const copyDeep = <T>(target: T): T => {
  if (target === null) return target;

  if (target instanceof Array) {
    const cp = [] as any[];
    (target as any[]).forEach((v) => {
      cp.push(v);
    });
    return cp.map((n: any) => copyDeep<any>(n)) as any;
  }
  if (typeof target === 'object' && target !== {}) {
    const cp = { ...(target as { [key: string]: any }) } as { [key: string]: any };
    Object.keys(cp).forEach(k => {
      cp[k] = copyDeep<any>(cp[k]);
    });
    return cp as T;
  }
  return target;
};
