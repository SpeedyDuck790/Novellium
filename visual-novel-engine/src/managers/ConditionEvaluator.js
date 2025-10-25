export class ConditionEvaluator {
  static evaluate(conditions, flags) {
    return Object.entries(conditions).every(
      ([key, value]) => flags[key] === value
    );
  }

  static evaluateAny(conditionsArray, flags) {
    return conditionsArray.some(conditions => 
      this.evaluate(conditions, flags)
    );
  }
}