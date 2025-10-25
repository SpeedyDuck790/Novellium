# Quick Start: Testing Novellium

## Installation

Open PowerShell in the project directory and run:

```powershell
npm install
```

This will install Jest and all testing dependencies.

## Running Tests

### Run all tests once
```powershell
npm test
```

### Run tests in watch mode (re-run on file changes)
```powershell
npm run test:watch
```

### Run tests with coverage report
```powershell
npm run test:coverage
```

### Run tests in CI mode (for continuous integration)
```powershell
npm run test:ci
```

## Understanding the Output

### Test Results
- ✓ Green checkmarks = passing tests
- ✗ Red X marks = failing tests
- Test summary shows: passed, failed, total

### Coverage Report
After running `npm run test:coverage`, you'll see:

```
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |   95.12 |    93.45 |   96.78 |   95.12 |
 SaveManager.js | 98.50 | 95.00 | 100.00 | 98.50 | 45-47
----------|---------|----------|---------|---------|-------------------
```

- **% Stmts**: Percentage of statements executed
- **% Branch**: Percentage of if/else branches tested
- **% Funcs**: Percentage of functions called
- **% Lines**: Percentage of lines executed
- **Uncovered Line #s**: Lines not covered by tests

### HTML Coverage Report

Open `coverage/lcov-report/index.html` in your browser to see:
- Visual coverage report with color-coded files
- Red = not covered, green = covered
- Click files to see line-by-line coverage

## Test File Structure

```
tests/
├── unit/                    # Unit tests (single function/class)
│   └── SaveManager.test.js
├── integration/             # Integration tests (multiple components)
│   └── gameLoading.test.js
└── e2e/                     # End-to-end tests (full workflows)
    └── (coming soon)
```

## Writing Your First Test

1. Create a new file in `tests/unit/` or `tests/integration/`
2. Name it `[Component].test.js`
3. Use this template:

```javascript
import { describe, test, expect } from '@jest/globals';

describe('Component Name', () => {
  test('should do something', () => {
    const result = myFunction();
    expect(result).toBe(expectedValue);
  });
});
```

## Common Jest Matchers

```javascript
expect(value).toBe(5);                    // Exact equality (===)
expect(value).toEqual({a: 1});            // Deep equality
expect(value).toBeTruthy();               // Truthy value
expect(value).toBeFalsy();                // Falsy value
expect(array).toContain('item');          // Array contains item
expect(obj).toHaveProperty('key');        // Object has property
expect(fn).toThrow();                     // Function throws error
expect(fn).toHaveBeenCalled();            // Mock was called
```

## Debugging Failed Tests

1. Read the error message carefully
2. Check the "Expected" vs "Received" values
3. Add `console.log()` statements in your test
4. Run with `--verbose` flag: `npm test -- --verbose`
5. Run single test file: `npm test -- SaveManager.test.js`
6. Run single test: `npm test -- -t "should create a new save"`

## Next Steps

1. Run existing tests: `npm test`
2. Check coverage: `npm run test:coverage`
3. Add tests for uncovered code
4. Aim for 95%+ coverage
5. See `tests/setup.md` for full testing strategy

## Troubleshooting

### "Cannot find module"
- Make sure you ran `npm install`
- Check that file paths are correct
- ES6 modules need `.js` extension in imports

### Tests pass but coverage is low
- Write more test cases
- Test edge cases and error handling
- Check `coverage/lcov-report/index.html` for gaps

### Tests fail randomly
- Might be timing issues
- Use `await` for async operations
- Clear mocks/state between tests

### "localStorage is not defined"
- This is handled in `tests/setup.js`
- If still failing, check setup file is loaded

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [Testing Best Practices](https://testingjavascript.com/)
