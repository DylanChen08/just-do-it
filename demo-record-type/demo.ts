/**
 * Record 与类型收窄（Type Predicate）小 demo
 * 运行: pnpm run demo:record
 */

// ============ 1. Record<K, V> 是什么 ============
// Record 是 TS 内置工具类型，表示「键为 K、值为 V」的对象
// 例如：Record<string, number> ≈ { [key: string]: number }

type ScoreMap = Record<string, number>;
const scores: ScoreMap = { math: 90, english: 85 };
console.log("\n--- Record<string, number> 示例 ---");
console.log("scores:", scores);

// ============ 2. 类型谓词 val is X：谁在负责「收窄」 ============

// 有类型谓词：返回 true 时，TS 会把 val 收窄为 Record<any, any>
function isObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === "object";
}

// 没有类型谓词：只返回 boolean，TS 不会收窄
function isObjectPlain(val: unknown): boolean {
  return val !== null && typeof val === "object";
}

// ============ 3. 对比：有谓词 vs 无谓词 ============

// 模拟从接口/JSON 拿到的数据，类型是 unknown
const maybe: unknown = { name: "test" };

console.log("\n--- 使用 isObject（有类型谓词 val is Record<...>）---");
if (isObject(maybe)) {
  // ✅ 这里 TS 已把 maybe 收窄为对象，可以安全访问属性
  console.log("  收窄后 maybe.name:", maybe.name);
}

console.log("\n--- 使用 isObjectPlain（只返回 boolean，无类型谓词）---");
if (isObjectPlain(maybe)) {
  // 这里 maybe 仍是 unknown，不能直接写 maybe.name（会报类型错误）
  // 只能靠断言：(maybe as Record<string, unknown>).name
  console.log("  未收窄，需断言才能访问:", (maybe as Record<string, unknown>).name);
}

// ============ 4. 收窄到更具体的 Record ============

function isScoreMap(val: unknown): val is Record<string, number> {
  if (!isObject(val)) return false;
  return Object.values(val).every((v) => typeof v === "number");
}

const data: unknown = { a: 1, b: 2 };
if (isScoreMap(data)) {
  console.log("\n--- 收窄为 Record<string, number> ---");
  console.log("data.a + data.b =", data.a + data.b);
}

console.log("\n--- demo 结束 ---\n");
