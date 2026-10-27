// Arithmetic for the disguise calculator. Parsed by hand so no user input ever reaches eval().
export const REVEAL_CODE = "911";

/** Evaluates "12+3×4" style input with × ÷ before + −. Returns null for incomplete input. */
export function calculate(expr: string): number | null {
  const tokens = expr.match(/\d+(?:\.\d+)?|[+−×÷]/g);
  if (!tokens || tokens.join("") !== expr || /[+−×÷]/.test(tokens[0]) || /[+−×÷]/.test(tokens[tokens.length - 1])) return null;
  const nums: number[] = [Number(tokens[0])];
  const ops: string[] = [];
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i], n = Number(tokens[i + 1]);
    if (op === "×") nums[nums.length - 1] *= n;
    else if (op === "÷") nums[nums.length - 1] = n === 0 ? NaN : nums[nums.length - 1] / n;
    else { ops.push(op); nums.push(n); }
  }
  const r = ops.reduce((acc, op, i) => (op === "+" ? acc + nums[i + 1] : acc - nums[i + 1]), nums[0]);
  return Number.isFinite(r) ? Math.round(r * 1e8) / 1e8 : NaN;
}
